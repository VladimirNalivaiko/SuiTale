import { Injectable, NotFoundException, HttpException, HttpStatus } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Tale } from '../schemas/tale.schema';
import { CreateTaleDto } from '../dto/create-tale.dto';
import { UpdateTaleDto } from '../dto/update-tale.dto';
import { InitiatePublicationDto } from '../dto/initiate-publication.dto';
import { WalrusService } from '../../walrus/services/walrus.service';
import { SuiService } from '../../sui/services/sui.service';
import { fromB64 } from '@mysten/sui/utils';
import { Ed25519PublicKey } from '@mysten/sui/keypairs/ed25519';
import { Secp256k1PublicKey } from '@mysten/sui/keypairs/secp256k1';
import { PublicKey as SuiPublicKeyCryptography } from '@mysten/sui/cryptography';

@Injectable()
export class TalesService {
    constructor(
        @InjectModel(Tale.name) private taleModel: Model<Tale>,
        private readonly walrusService: WalrusService,
        private readonly suiService: SuiService,
    ) {}

    async initiatePublication(dto: InitiatePublicationDto): Promise<Tale> {
        console.log('[TalesService] initiatePublication CALLED with DTO:', JSON.stringify(dto, null, 2));
        let publicKey: SuiPublicKeyCryptography | undefined = undefined;
        
        let rawFlaggedPublicKeyBytes: Buffer;
        try {
            rawFlaggedPublicKeyBytes = Buffer.from(dto.publicKey_base64, 'base64');
        } catch (error) {
            console.error('Error decoding publicKey_base64:', error);
            throw new HttpException('Invalid publicKey_base64 format.', HttpStatus.BAD_REQUEST);
        }

        console.log(`[TalesService] Decoded publicKey_base64 length: ${rawFlaggedPublicKeyBytes.length}`);

        const publicKeySignatureFlag = rawFlaggedPublicKeyBytes[0]; // Flag from the public key itself
        const rawPublicKeyOnlyBytes = rawFlaggedPublicKeyBytes.slice(1);

        try {
            if (publicKeySignatureFlag === 0x00 && rawPublicKeyOnlyBytes.length === 32) { // Ed25519
                console.log('[TalesService] Attempting Ed25519 scheme for public key based on flag 0x00 and length 32.');
                publicKey = new Ed25519PublicKey(rawPublicKeyOnlyBytes);
            } else if (publicKeySignatureFlag === 0x01 && rawPublicKeyOnlyBytes.length === 33) { // Secp256k1
                console.log('[TalesService] Attempting Secp256k1 scheme for public key based on flag 0x01 and length 33.');
                publicKey = new Secp256k1PublicKey(rawPublicKeyOnlyBytes);
            } else {
                console.warn(`[TalesService] Public key flag/length unexpected: Flag ${publicKeySignatureFlag}, Raw Key Length ${rawPublicKeyOnlyBytes.length}. DTO scheme: ${dto.signatureScheme}`);
                // Fallback logic if needed, for now, we expect flagged public keys
                if (!publicKey) {
                     throw new HttpException(
                        `Unsupported or unidentifiable public key format from publicKey_base64. Flag: ${publicKeySignatureFlag}, Raw Key Length: ${rawPublicKeyOnlyBytes.length}`,
                        HttpStatus.BAD_REQUEST,
                    );
                }
            }
        } catch (error) {
            if (error instanceof HttpException) throw error;
            console.error('[TalesService] Error constructing PublicKey from publicKey_base64:', error);
            throw new HttpException('Failed to construct PublicKey from provided public key bytes.', HttpStatus.BAD_REQUEST);
        }

        if (!publicKey) {
            throw new HttpException('Public key could not be determined from publicKey_base64.', HttpStatus.INTERNAL_SERVER_ERROR );
        }

        const derivedAddress = publicKey.toSuiAddress();
        console.log(`[TalesService] Derived address from PK: ${derivedAddress}, User address from DTO: ${dto.userAddress}`);
        if (derivedAddress !== dto.userAddress) {
            throw new HttpException(
                `User address (${dto.userAddress}) does not match derived address (${derivedAddress}) from public key.`,
                HttpStatus.UNAUTHORIZED,
            );
        }

        // The signedMessageBytes from DTO (which is signedMessageResult.bytes from frontend)
        // are the SUI-prefixed message bytes. We need the original, unprefixed message for publicKey.verify.
        // let signedMessageBytes: Uint8Array; 
        let combinedSignatureBytes: Buffer;
        let actualSignatureBytes: Buffer;

        try {
            // Log the raw base64 string received from frontend for signedMessageBytes
            // This is signedMessageResult.bytes from the wallet, which is the SUI-prefixed message.
            console.log(`[TalesService] Received dto.signedMessageBytes_base64 (SUI-prefixed message from wallet): ${dto.signedMessageBytes_base64}`);
            const _potentiallyPrefixedMessageBytesFromDto = fromB64(dto.signedMessageBytes_base64);
            // Log the hex and length of the decoded bytes
            console.log(`[TalesService] Decoded _potentiallyPrefixedMessageBytesFromDto HEX: ${Buffer.from(_potentiallyPrefixedMessageBytesFromDto).toString('hex')}`);
            console.log(`[TalesService] Decoded _potentiallyPrefixedMessageBytesFromDto Length: ${ _potentiallyPrefixedMessageBytesFromDto.length}`);

            combinedSignatureBytes = Buffer.from(dto.signature_base64, 'base64');
            console.log(`[TalesService] Decoded combinedSignatureBytes length: ${combinedSignatureBytes.length}`);

            // Assuming the structure: [signature_scheme_flag (1 byte)] + [actual_signature (64 or variable bytes)] + [public_key (32/33 bytes)]
            // For Ed25519, actual signature is 64 bytes.
            // The flag in combinedSignatureBytes[0] should match the scheme of the publicKey determined above.
            
            const signatureSchemeFlagFromSignature = combinedSignatureBytes[0];
            console.log(`[TalesService] Signature scheme flag from combined signature: ${signatureSchemeFlagFromSignature}`);

            // Validate that the flag in the signature matches the flag of the derived public key
            if (signatureSchemeFlagFromSignature !== publicKeySignatureFlag) {
                throw new HttpException(
                    `Signature scheme flag in signature_base64 (${signatureSchemeFlagFromSignature}) does not match public key's scheme flag (${publicKeySignatureFlag}).`,
                    HttpStatus.BAD_REQUEST
                );
            }

            if (publicKey instanceof Ed25519PublicKey) {
                if (combinedSignatureBytes.length === 97 && signatureSchemeFlagFromSignature === 0x00) { // 1 (flag) + 64 (sig) + 32 (pk)
                    actualSignatureBytes = combinedSignatureBytes.slice(1, 65); // Extract 64 bytes of signature
                    console.log(`[TalesService] Extracted Ed25519 actualSignatureBytes (64 bytes) from 97-byte combined structure. Length: ${actualSignatureBytes.length}`);

                    // ---- START: Added log for public key comparison ----
                    if (combinedSignatureBytes.length === 97) {
                        const pkFromCombinedSignature = combinedSignatureBytes.slice(65, 97); // Last 32 bytes
                        const pkFromDtoPublicKeyBase64 = rawPublicKeyOnlyBytes; // This is already sliced (flag removed)
                        
                        console.log(`[TalesService] PK from combinedSignature (last 32 bytes of 97): ${pkFromCombinedSignature.toString('hex')}`);
                        console.log(`[TalesService] PK from dto.publicKey_base64 (rawPublicKeyOnlyBytes): ${pkFromDtoPublicKeyBase64.toString('hex')}`);
                        
                        if (pkFromCombinedSignature.equals(pkFromDtoPublicKeyBase64)) {
                            console.log('[TalesService] Public keys MATCH! (PK from signature structure vs PK from dto.publicKey_base64)');
                        } else {
                            console.error('[TalesService] !!! Public keys MISMATCH !!! (PK from signature structure vs PK from dto.publicKey_base64)');
                            // This mismatch could be the reason for verification failure if the signature was made with the PK from combined structure
                            // but we are verifying using the publicKey object derived from dto.publicKey_base64 (which might be different raw bytes but same address? Unlikely for Ed25519).
                        }
                    }
                    // ---- END: Added log for public key comparison ----

                } else if (combinedSignatureBytes.length === 64) { // Potentially raw Ed25519 signature (no flag, no pk)
                     console.warn('[TalesService] Received 64-byte signature. Assuming it is a raw Ed25519 signature without a flag or appended public key.');
                     actualSignatureBytes = combinedSignatureBytes;
                } else {
                    throw new HttpException(
                        `Invalid Ed25519 signature length from signature_base64: expected 97 (flag+sig+pk) or 64 (raw sig), got ${combinedSignatureBytes.length}`,
                        HttpStatus.BAD_REQUEST
                    );
                }
            } else if (publicKey instanceof Secp256k1PublicKey) {
                // For Secp256k1, signature length can vary. Typically, it might be 1 (flag) + variable (sig) + 33 (pk).
                // This part needs more precise handling if Secp256k1 is used, as its signature is not fixed 64 bytes like Ed25519.
                // For now, if we know it's Secp256k1 from the public key, we might need to adjust extraction.
                // Let's assume a similar structure for now for Secp256k1 for consistency, e.g. 1 + sig_len + 33_pk_len.
                // If raw Secp sig is e.g. 64-65 bytes, then 1 + 64/65 + 33 = 98/99 bytes total.
                // The @mysten/sui Secp256k1PublicKey.verify likely expects the raw signature (e.g. 64 or 65 bytes).
                // This is a placeholder, actual extraction for Secp256k1 might differ.
                if (combinedSignatureBytes.length === (1 + 64 + 33) && signatureSchemeFlagFromSignature === 0x01 ) { // Example for a 64 byte Secp sig
                    actualSignatureBytes = combinedSignatureBytes.slice(1, 1 + 64);
                    console.log(`[TalesService] Extracted Secp256k1 actualSignatureBytes from combined structure. Length: ${actualSignatureBytes.length}`);
                } else if (combinedSignatureBytes.length === (1 + 65 + 33) && signatureSchemeFlagFromSignature === 0x01 ) { // Example for a 65 byte Secp sig
                    actualSignatureBytes = combinedSignatureBytes.slice(1, 1 + 65);
                     console.log(`[TalesService] Extracted Secp256k1 actualSignatureBytes from combined structure. Length: ${actualSignatureBytes.length}`);
                } else if (combinedSignatureBytes.length === 64 || combinedSignatureBytes.length === 65) { // Raw Secp256k1 signature
                    console.warn('[TalesService] Received 64/65-byte signature. Assuming it is a raw Secp256k1 signature without a flag or appended public key.');
                    actualSignatureBytes = combinedSignatureBytes;
                } else {
                    throw new HttpException(
                        `Invalid Secp256k1 signature length from signature_base64: got ${combinedSignatureBytes.length}. Expected structure with prepended flag and appended public key, or raw signature.`,
                        HttpStatus.BAD_REQUEST
                    );
                }
            } else {
                 throw new HttpException('Public key type is not Ed25519 or Secp256k1 after determination.', HttpStatus.INTERNAL_SERVER_ERROR);
            }

        } catch (error) {
            if (error instanceof HttpException) throw error;
            console.error('Error decoding or parsing signature_base64:', error);
            throw new HttpException('Invalid signature_base64 format or structure.', HttpStatus.BAD_REQUEST);
        }
        
        let isValidSignature: boolean;
        try {
            const originalMessageString = `SuiTale content upload authorization for user ${dto.userAddress}. Title: ${dto.title}`;
            const originalMessageBytes = new TextEncoder().encode(originalMessageString);

            console.log(`[TalesService] Original message string for verification: "${originalMessageString}"`);
            console.log(`[TalesService] Original message bytes (UTF-8 encoded) for verification HEX: ${Buffer.from(originalMessageBytes).toString('hex')}`);
            console.log(`[TalesService] Original message bytes (UTF-8 encoded) for verification Length: ${originalMessageBytes.length}`);
            
            // For verifyPersonalMessage, we need the full signature_base64 string from the DTO
            // which corresponds to signedMessageResult.signature from the frontend.
            // This signature string already contains the scheme flag, actual signature, and public key.
            const fullSignatureFromDto = dto.signature_base64;
            console.log(`[TalesService] Verifying with fullSignatureFromDto (dto.signature_base64): ${fullSignatureFromDto}`);
            console.log(`[TalesService] Public key type being used for verification: ${publicKey.constructor.name}`);

            // Use publicKey.verifyPersonalMessage with the original (unprefixed) message bytes
            // and the full signature string (which is base64 encoded and includes flag, sig, pk).
            isValidSignature = await publicKey.verifyPersonalMessage(originalMessageBytes, fullSignatureFromDto);

        } catch (error) {
            console.error('[TalesService] Error during signature verification process:', error);
            console.error(`[TalesService] Verification error with key type: ${publicKey.constructor.name}`, error);
            throw new HttpException('Error verifying signature.', HttpStatus.INTERNAL_SERVER_ERROR);
        }

        if (!isValidSignature) {
            throw new HttpException('Signature verification failed.', HttpStatus.UNAUTHORIZED );
        }
        console.log('[TalesService] Signature verified successfully for user:', dto.userAddress);

        const blobId = await this.walrusService.uploadTale(dto.content);
        
        // Prepare arguments for publishTaleTemplate
        const taleDescription = dto.description || 'An amazing SuiTale story!'; // Use DTO description or default
        // Use coverImageWalrusUrl from DTO if provided, otherwise empty string or a default placeholder Walrus URL
        const taleCoverImageUrl = dto.coverImageWalrusUrl || ''; 
        console.log(`[TalesService] Using Cover Image URL: ${taleCoverImageUrl}`);

        // NFT Parameters - use from DTO if provided, otherwise use current placeholders
        const taleMintPrice = dto.mintPrice || '100000000'; 
        const taleMintCapacity = dto.mintCapacity || '100'; 
        const taleAuthorMintBeneficiary = dto.userAddress; // This is always the user from DTO
        const taleRoyaltyFeeBps = dto.royaltyFeeBps !== undefined ? dto.royaltyFeeBps : 500; 

        console.log(`[TalesService] Publishing to Sui with params: blobId: ${blobId}, title: ${dto.title}, desc_len: ${taleDescription.length}, coverUrl: ${taleCoverImageUrl}, price: ${taleMintPrice}, capacity: ${taleMintCapacity}, royalty: ${taleRoyaltyFeeBps}`);

        const suiTxDigest = await this.suiService.publishTaleTemplate(
            blobId,
            dto.title,
            taleDescription,
            taleCoverImageUrl,
            taleMintPrice,
            taleMintCapacity,
            taleAuthorMintBeneficiary,
            taleRoyaltyFeeBps,
        );

        const newTaleData = {
            title: dto.title,
            description: taleDescription, // Save the used description
            blobId: blobId,
            coverImage: taleCoverImageUrl, // Save the Walrus URL as coverImage in DB
            tags: dto.tags || [],
            wordCount: dto.wordCount,
            readingTime: dto.readingTime,
            authorId: dto.userAddress,
            suiTxDigest: suiTxDigest,
        };

        const createdTale = new this.taleModel(newTaleData);
        return await createdTale.save();
    }

    /**
     * Create a new tale
     * @param createTaleDto Tale data
     * @returns Created tale
     */
    async create(createTaleDto: any): Promise<Tale> {
        try {
            const blobId = await this.walrusService.uploadTale(
                createTaleDto.content,
            );
            const newTale = new this.taleModel({
                ...createTaleDto,
                blobId: blobId,
            });
            console.log(newTale)
            console.log('Saving tale to DB (legacy create)')
            return await newTale.save();
        } catch (error) {
            console.error('Error creating tale (legacy):', error);
            throw error;
        }
    }

    /**
     * Find all tales with pagination
     * @param limit Maximum number of tales to return
     * @param offset Skip first N tales
     * @returns Array of tales
     */
    async findAll(limit = 10, offset = 0): Promise<Tale[]> {
        return this.taleModel
            .find()
            .sort({ createdAt: -1 })
            .skip(offset)
            .limit(limit)
            .exec();
    }

    /**
     * Find a single tale by ID
     * @param id Tale ID
     * @returns Tale or throws NotFoundException
     */
    async findOne(id: string): Promise<Tale> {
        const tale = await this.taleModel.findById(id).exec();
        if (!tale) {
            throw new NotFoundException(`Tale with ID ${id} not found`);
        }
        return tale;
    }

    /**
     * Get the full content of a tale from Walrus
     * @param id Tale ID
     * @returns Full tale with content
     */
    async getFullTale(id: string): Promise<Tale> {
        const tale = await this.findOne(id);
        tale.content = await this.walrusService.getContent(tale.blobId);
        return tale;
    }

    /**
     * Update a tale
     * @param id Tale ID
     * @param updateTaleDto Updated tale data
     * @returns Updated tale
     */
    async update(id: string, updateTaleDto: any): Promise<Tale> {
        await this.findOne(id);
        if (updateTaleDto.content) {
            const contentCid = await this.walrusService.uploadTale(
                updateTaleDto.content,
            );
            const updatedDto = {
                ...updateTaleDto,
                blobId: contentCid,
            };
            delete updatedDto.content;
            const updatedTale = await this.taleModel
                .findByIdAndUpdate(id, updatedDto, { new: true })
                .exec();
            if (!updatedTale) {
                throw new NotFoundException(
                    `Tale with ID ${id} not found during update`,
                );
            }
            return updatedTale;
        } else {
            const updatedTale = await this.taleModel
                .findByIdAndUpdate(id, updateTaleDto, { new: true })
                .exec();
            if (!updatedTale) {
                throw new NotFoundException(
                    `Tale with ID ${id} not found during update`,
                );
            }
            return updatedTale;
        }
    }

    /**
     * Delete a tale
     * @param id Tale ID
     * @returns Deleted tale
     */
    async remove(id: string): Promise<Tale> {
        const tale = await this.findOne(id);
        const deletedTale = await this.taleModel.findByIdAndDelete(id).exec();
        if (!deletedTale) {
            throw new NotFoundException(
                `Tale with ID ${id} not found during deletion`,
            );
        }
        return deletedTale;
    }
}
