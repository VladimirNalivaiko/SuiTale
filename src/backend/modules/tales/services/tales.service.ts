import { Injectable, NotFoundException, HttpException, HttpStatus, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Tale } from '../schemas/tale.schema';
import { CreateTaleDto } from '../dto/create-tale.dto';
import { UpdateTaleDto } from '../dto/update-tale.dto';
import { InitiatePublicationDto } from '../dto/initiate-publication.dto';
import { RecordBatchPublicationDto } from '../dto/batch-publication.dto';
import { WalrusService } from '../../walrus/services/walrus.service';
import { SuiService } from '../../sui/services/sui.service';
import { Ed25519PublicKey } from '@mysten/sui/keypairs/ed25519';
import { Secp256k1PublicKey } from '@mysten/sui/keypairs/secp256k1';
import { PublicKey as SuiPublicKeyCryptography } from '@mysten/sui/cryptography';

// Frontend-aligned interfaces for return types
export class TaleSummary {
  id: string;
  title: string;
  description: string;
  coverImageUrl?: string;
  contentBlobId: string;
  tags: string[];
  wordCount: number;
  readingTime: number;
  authorId?: string;
  createdAt: string;
  updatedAt: string;
  suiTxDigest?: string;
  suiObjectId?: string;
}

interface TaleWithContent extends TaleSummary {
  content: string;
}

// Interface for the new return type of prepareTalePublication
export interface PreparePublicationResult {
    transactionBlockBytes: string;
    taleDataForRecord: any; // Consider defining a more specific type later
}

// DTO for recordTalePublication - define if not already present elsewhere
// For now, assuming it expects txDigest and the taleDataForRecord from PreparePublicationResult
export interface RecordPublicationData {
    txDigest: string;
    taleDataForRecord: any;
}

@Injectable()
export class TalesService {
    private readonly logger = new Logger(TalesService.name);

    constructor(
        @InjectModel(Tale.name) private taleModel: Model<Tale>,
        private readonly walrusService: WalrusService,
        private readonly suiService: SuiService,
    ) {}

    // Helper function to map Mongoose Tale document to TaleSummary interface
    private mapToTaleSummary(taleDoc: Tale): TaleSummary {
        return {
            id: taleDoc.id,
            title: taleDoc.title,
            description: taleDoc.description,
            contentBlobId: taleDoc.blobId,
            coverImageUrl: taleDoc.coverImageUrl,
            tags: taleDoc.tags,
            wordCount: taleDoc.wordCount,
            readingTime: taleDoc.readingTime,
            authorId: taleDoc.authorId,
            createdAt: taleDoc.createdAt.toISOString(),
            updatedAt: taleDoc.updatedAt.toISOString(),
            suiTxDigest: taleDoc.suiTxDigest,
            suiObjectId: taleDoc.suiObjectId,
        };
    }

    async prepareTalePublication(dto: InitiatePublicationDto): Promise<PreparePublicationResult> {
        this.logger.log('[TalesService] prepareTalePublication CALLED with DTO:', JSON.stringify(dto, null, 2));
        let publicKey: SuiPublicKeyCryptography | undefined = undefined;
        
        let rawFlaggedPublicKeyBytes: Buffer;
        try {
            rawFlaggedPublicKeyBytes = Buffer.from(dto.publicKey_base64, 'base64');
        } catch (error) {
            this.logger.error('Error decoding publicKey_base64:', error.stack);
            throw new HttpException('Invalid publicKey_base64 format.', HttpStatus.BAD_REQUEST);
        }

        this.logger.debug(`[TalesService] Decoded publicKey_base64 length: ${rawFlaggedPublicKeyBytes.length}`);

        const publicKeySignatureFlag = rawFlaggedPublicKeyBytes[0];
        const rawPublicKeyOnlyBytes = rawFlaggedPublicKeyBytes.slice(1);

        try {
            if (publicKeySignatureFlag === 0x00 && rawPublicKeyOnlyBytes.length === 32) { // Ed25519
                this.logger.debug('[TalesService] Attempting Ed25519 scheme for public key.');
                publicKey = new Ed25519PublicKey(rawPublicKeyOnlyBytes);
            } else if (publicKeySignatureFlag === 0x01 && rawPublicKeyOnlyBytes.length === 33) { // Secp256k1
                this.logger.debug('[TalesService] Attempting Secp256k1 scheme for public key.');
                publicKey = new Secp256k1PublicKey(rawPublicKeyOnlyBytes);
            } else {
                this.logger.warn(`[TalesService] Public key flag/length unexpected: Flag ${publicKeySignatureFlag}, Raw Key Length ${rawPublicKeyOnlyBytes.length}. DTO scheme: ${dto.signatureScheme}`);
                 throw new HttpException(
                    `Unsupported or unidentifiable public key format from publicKey_base64. Flag: ${publicKeySignatureFlag}, Raw Key Length: ${rawPublicKeyOnlyBytes.length}`,
                    HttpStatus.BAD_REQUEST,
                );
            }
        } catch (error) {
            if (error instanceof HttpException) throw error;
            this.logger.error('[TalesService] Error constructing PublicKey from publicKey_base64:', error.stack);
            throw new HttpException('Failed to construct PublicKey from provided public key bytes.', HttpStatus.BAD_REQUEST);
        }

        if (!publicKey) {
            throw new HttpException('Public key could not be determined from publicKey_base64.', HttpStatus.INTERNAL_SERVER_ERROR );
        }

        const derivedAddress = publicKey.toSuiAddress();
        this.logger.debug(`[TalesService] Derived address from PK: ${derivedAddress}, User address from DTO: ${dto.userAddress}`);
        if (derivedAddress !== dto.userAddress) {
            throw new HttpException(
                `User address (${dto.userAddress}) does not match derived address (${derivedAddress}) from public key.`,
                HttpStatus.UNAUTHORIZED,
            );
        }

        let combinedSignatureBytes: Buffer;
        try {
            combinedSignatureBytes = Buffer.from(dto.signature_base64, 'base64');
            this.logger.debug(`[TalesService] Decoded combinedSignatureBytes length: ${combinedSignatureBytes.length}`);

            const signatureSchemeFlagFromSignature = combinedSignatureBytes[0];
            this.logger.debug(`[TalesService] Signature scheme flag from combined signature: ${signatureSchemeFlagFromSignature}`);

            if (signatureSchemeFlagFromSignature !== publicKeySignatureFlag) {
                throw new HttpException(
                    `Signature scheme flag in signature_base64 (${signatureSchemeFlagFromSignature}) does not match public key's scheme flag (${publicKeySignatureFlag}).`,
                    HttpStatus.BAD_REQUEST
                );
            }

        } catch (error) {
            if (error instanceof HttpException) throw error;
            this.logger.error('Error decoding or parsing signature_base64:', error.stack);
            throw new HttpException('Invalid signature_base64 format or structure.', HttpStatus.BAD_REQUEST);
        }
        
        let isValidSignature: boolean;
        try {
            const originalMessageString = `SuiTale content upload authorization for user ${dto.userAddress}. Title: ${dto.title}`;
            const originalMessageBytes = new TextEncoder().encode(originalMessageString);
            this.logger.debug(`[TalesService] Verifying with fullSignatureFromDto (dto.signature_base64) and original message.`);
            
            isValidSignature = await publicKey.verifyPersonalMessage(originalMessageBytes, dto.signature_base64);

        } catch (error) {
            this.logger.error('[TalesService] Error during signature verification process:', error.stack);
            throw new HttpException('Error verifying signature.', HttpStatus.INTERNAL_SERVER_ERROR);
        }

        if (!isValidSignature) {
            throw new HttpException('Signature verification failed.', HttpStatus.UNAUTHORIZED );
        }
        this.logger.log('[TalesService] Signature verified successfully for user:', dto.userAddress);

        const contentBlobId = await this.walrusService.uploadTale(dto.content);
        this.logger.log(`[TalesService] Main content uploaded to Walrus. Content Blob ID: ${contentBlobId}`);
        
        const taleDescription = dto.description || 'An amazing SuiTale story!';
        const taleCoverImageUrl = dto.coverImageWalrusUrl || ''; 
        this.logger.debug(`[TalesService] Using Cover Image URL: ${taleCoverImageUrl}`);

        const taleMintPrice = dto.mintPrice || '100000000'; 
        const taleMintCapacity = dto.mintCapacity || '100'; 
        const taleAuthorMintBeneficiary = dto.userAddress;
        const taleRoyaltyFeeBps = dto.royaltyFeeBps !== undefined ? dto.royaltyFeeBps : 500; 

        this.logger.debug(`[TalesService] Building Sui transaction with params: contentBlobId: ${contentBlobId}, title: ${dto.title}, desc_len: ${taleDescription.length}, coverUrl: ${taleCoverImageUrl}, price: ${taleMintPrice}, capacity: ${taleMintCapacity}, royalty: ${taleRoyaltyFeeBps}`);

        const transactionBlockBytes = this.suiService.buildPublishTaleTemplateTransactionBlock(
            contentBlobId,
            dto.title,
            taleDescription,
            taleCoverImageUrl,
            taleMintPrice,
            taleMintCapacity,
            taleAuthorMintBeneficiary,
            taleRoyaltyFeeBps,
        );
        this.logger.log(`[TalesService] Sui transaction block built. Bytes length: ${transactionBlockBytes.length}`);

        // Prepare data for saving after successful transaction
        const taleDataForRecord = {
            title: dto.title,
            description: taleDescription,
            blobId: contentBlobId,
            coverImageUrl: taleCoverImageUrl,
            tags: dto.tags || [],
            wordCount: dto.wordCount,
            readingTime: dto.readingTime,
            authorId: dto.userAddress,
            mintPrice: taleMintPrice,
            mintCapacity: taleMintCapacity,
            royaltyFeeBps: taleRoyaltyFeeBps,
        };
        
        return {
            transactionBlockBytes,
            taleDataForRecord,
        };
    }

    async recordTalePublication(data: RecordPublicationData): Promise<TaleSummary> {
        const { txDigest, taleDataForRecord } = data;
        this.logger.log(`[TalesService] recordTalePublication CALLED with txDigest: ${txDigest}`);

        try {
            const txResponse = await this.suiService.suiClient.getTransactionBlock({
                digest: txDigest,
                options: { showEffects: true, showObjectChanges: true },
            });

            this.logger.debug('[TalesService] Fetched transaction block details:', JSON.stringify(txResponse, null, 2));

            if (txResponse.effects?.status?.status !== 'success') {
                this.logger.error(`[TalesService] Transaction ${txDigest} failed. Status: ${txResponse.effects?.status?.status}, Error: ${txResponse.effects?.status?.error}`);
                throw new HttpException(
                    `Sui transaction ${txDigest} failed or was not successful: ${txResponse.effects?.status?.error || 'Unknown error'}`,
                    HttpStatus.EXPECTATION_FAILED,
                );
            }

            this.logger.log(`[TalesService] Transaction ${txDigest} was successful.`);

            let suiObjectId: string | undefined = undefined;
            if (txResponse.objectChanges) {
                for (const change of txResponse.objectChanges) {
                    if (change.type === 'created' && change.objectType.endsWith('::publication::Tale')) {
                        suiObjectId = change.objectId;
                        this.logger.log(`[TalesService] Found created Tale Object ID: ${suiObjectId}`);
                        break;
                    }
                }
            }
            
            if (!suiObjectId && txResponse.effects?.created) { // Fallback if not found in objectChanges
                 for (const createdObj of txResponse.effects.created) {
                    // This is a less precise way, might need adjustment based on exact objectType string from your contract
                    // if (createdObj.objectType && createdObj.objectType.includes('::Tale')) { 
                    // For now, we rely on objectChanges which is more robust for specific type matching.
                    // This part can be refined if objectChanges is not sufficient or available.
                 }
                 if (!suiObjectId) {
                    this.logger.warn(`[TalesService] Could not find created Tale objectId in objectChanges for tx ${txDigest}. It might be in effects.created if the type can be reliably identified.`);
                 }
            }

            const newTaleData = {
                ...taleDataForRecord,
                suiTxDigest: txDigest,
                suiObjectId: suiObjectId, // May be undefined if not found
            };

            const createdTaleDoc = new this.taleModel(newTaleData);
            const savedTaleDoc = await createdTaleDoc.save();
            this.logger.log(`[TalesService] Tale record saved to DB. ID: ${savedTaleDoc.id}, Sui Object ID: ${suiObjectId}`);
            
            return this.mapToTaleSummary(savedTaleDoc);

        } catch (error) {
            if (error instanceof HttpException) throw error;
            this.logger.error(`[TalesService] Error in recordTalePublication for txDigest ${txDigest}:`, error.stack);
            throw new HttpException(
                `Failed to record tale publication for tx ${txDigest}: ${error.message}`,
                HttpStatus.INTERNAL_SERVER_ERROR,
            );
        }
    }

    async create(createTaleDto: CreateTaleDto): Promise<TaleSummary> {
        this.logger.debug('[TalesService] create (legacy) CALLED with DTO:', createTaleDto);
        const taleDataForDb = {
            ...createTaleDto,
            blobId: 'placeholder-blob-id',
            coverImage: createTaleDto.coverImageUrl,
        };

        const createdTaleDoc = new this.taleModel(taleDataForDb);
        const savedTaleDoc = await createdTaleDoc.save();
        return this.mapToTaleSummary(savedTaleDoc);
    }

    async findAll(limit = 10, offset = 0): Promise<TaleSummary[]> {
        this.logger.debug(`[TalesService] findAll CALLED with limit: ${limit}, offset: ${offset}`);
        const taleDocs = await this.taleModel
            .find()
            .sort({ createdAt: -1 })
            .skip(offset)
            .limit(limit)
            .exec();
        return taleDocs.map(doc => this.mapToTaleSummary(doc));
    }

    async findOne(id: string): Promise<TaleSummary> {
        this.logger.debug(`[TalesService] findOne CALLED with id: ${id}`);
        const taleDoc = await this.taleModel.findById(id).exec();
        if (!taleDoc) {
            throw new NotFoundException(`Tale with ID ${id} not found`);
        }
        return this.mapToTaleSummary(taleDoc);
    }

    async getFullTale(id: string): Promise<TaleWithContent> {
        this.logger.debug(`[TalesService] getFullTale CALLED with id: ${id}`);
        const taleDoc = await this.taleModel.findById(id).exec();
        if (!taleDoc) {
            throw new NotFoundException(`Tale with ID ${id} not found`);
        }

        if (!taleDoc.blobId) {
            this.logger.error(`[TalesService] Tale with ID ${id} has no blobId for content.`);
            throw new NotFoundException(`Content blobId not found for Tale with ID ${id}`);
        }

        let content = '';
        try {
            content = await this.walrusService.getContent(taleDoc.blobId);
            this.logger.debug(`[TalesService] Content fetched from Walrus for blobId: ${taleDoc.blobId}`);
        } catch (error) {
            this.logger.error(`[TalesService] Failed to fetch content from Walrus for blobId ${taleDoc.blobId}:`, error.stack);
            content = "Error fetching content from Walrus."; 
        }
        
        const taleSummary = this.mapToTaleSummary(taleDoc);
        return {
            ...taleSummary,
            content: content,
        };
    }

    async update(id: string, updateTaleDto: UpdateTaleDto): Promise<TaleSummary> {
        this.logger.debug(`[TalesService] update CALLED for id: ${id} with DTO:`, updateTaleDto);
        const updateData: any = { ...updateTaleDto };
        if (updateTaleDto.coverImageUrl) {
            updateData.coverImage = updateTaleDto.coverImageUrl;
        }

        const existingTale = await this.taleModel
            .findByIdAndUpdate(id, updateData, { new: true })
            .exec();
        if (!existingTale) {
            throw new NotFoundException(`Tale with ID ${id} not found`);
        }
        return this.mapToTaleSummary(existingTale);
    }

    async remove(id: string): Promise<void> {
        this.logger.debug(`[TalesService] remove CALLED for id: ${id}`);
        const result = await this.taleModel.findByIdAndDelete(id).exec();
        if (!result) {
            throw new NotFoundException(`Tale with ID ${id} not found`);
        }
    }

    /**
     * Record batch publication after user successfully executes the batch transaction
     * @param dto Data from batch publication including transaction digest and blob IDs
     * @returns Created tale summary
     */
    async recordBatchPublication(dto: RecordBatchPublicationDto): Promise<TaleSummary> {
        this.logger.log(`[TalesService] recordBatchPublication CALLED with txDigest: ${dto.suiTransactionDigest}`);
        this.logger.debug('[TalesService] Batch publication data:', JSON.stringify(dto, null, 2));

        try {
            // 1. Verify transaction success on Sui
            const txResponse = await this.suiService.suiClient.getTransactionBlock({
                digest: dto.suiTransactionDigest,
                options: { showEffects: true, showObjectChanges: true },
            });

            if (txResponse.effects?.status?.status !== 'success') {
                this.logger.error(`[TalesService] Batch transaction ${dto.suiTransactionDigest} failed. Status: ${txResponse.effects?.status?.status}, Error: ${txResponse.effects?.status?.error}`);
                throw new HttpException(
                    `Sui batch transaction ${dto.suiTransactionDigest} failed: ${txResponse.effects?.status?.error || 'Unknown error'}`,
                    HttpStatus.EXPECTATION_FAILED,
                );
            }

            this.logger.log(`[TalesService] Batch transaction ${dto.suiTransactionDigest} was successful.`);

            // 2. Build cover image URL from blob ID
            const coverImageUrl = `https://aggregator.walrus-testnet.sui.io/v1/${dto.coverBlobId}`;

            // 3. Create tale record with both blob IDs
            const newTaleData = {
                title: dto.title,
                description: dto.description,
                blobId: dto.contentBlobId, // Main content blob
                coverImageUrl: coverImageUrl, // URL built from cover blob ID  
                tags: dto.tags || [],
                wordCount: dto.wordCount || 0,
                readingTime: dto.readingTime || 1,
                authorId: dto.userAddress,
                suiTxDigest: dto.suiTransactionDigest,
                // Note: We don't extract suiObjectId since batch upload only registers blobs,
                // NFT creation will be a separate step in the future
            };

            this.logger.debug('[TalesService] Creating tale with data:', JSON.stringify(newTaleData, null, 2));

            const createdTaleDoc = new this.taleModel(newTaleData);
            const savedTaleDoc = await createdTaleDoc.save();
            
            this.logger.log(`[TalesService] Batch tale record saved to DB. ID: ${savedTaleDoc.id}`);
            this.logger.log(`[TalesService] Cover Blob ID: ${dto.coverBlobId}, Content Blob ID: ${dto.contentBlobId}`);
            
            return this.mapToTaleSummary(savedTaleDoc);

        } catch (error) {
            if (error instanceof HttpException) throw error;
            this.logger.error(`[TalesService] Error in recordBatchPublication for txDigest ${dto.suiTransactionDigest}:`, error.stack);
            throw new HttpException(
                `Failed to record batch publication for tx ${dto.suiTransactionDigest}: ${error.message}`,
                HttpStatus.INTERNAL_SERVER_ERROR,
            );
        }
    }
}
