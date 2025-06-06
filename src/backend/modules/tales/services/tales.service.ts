import { Injectable, Logger, HttpException, HttpStatus } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Tale } from '../schemas/tale.schema';
import { RecordPublicationDto } from '../dto/record-publication.dto';
import { SuiService } from '../../sui/services/sui.service';
import { WalrusService } from '../../walrus/services/walrus.service';

export interface TaleSummary {
    id: string;
    title: string;
    description: string;
    blobId: string;
    coverImageUrl?: string;
    coverImageBlobId?: string;
    coverImageWalrusUrl?: string;
    contentBackup?: string;
    coverImageBase64?: string;
    tags: string[];
    wordCount: number;
    readingTime: number;
    authorId?: string;
    suiTxDigest?: string;
    suiObjectId?: string;
    createdAt: string;
    updatedAt: string;
}

export interface TaleWithContent extends TaleSummary {
    content: string;
}

@Injectable()
export class TalesService {
    private readonly logger = new Logger(TalesService.name);

    constructor(
        @InjectModel(Tale.name) private taleModel: Model<Tale>,
        private suiService: SuiService,
        private walrusService: WalrusService,
    ) {}

    private toTaleSummary(taleDoc: Tale): TaleSummary {
        return {
            id: taleDoc.id,
            title: taleDoc.title,
            description: taleDoc.description,
            blobId: taleDoc.blobId,
            coverImageUrl: taleDoc.coverImageUrl,
            coverImageBlobId: taleDoc.coverImageBlobId,
            coverImageWalrusUrl: taleDoc.coverImageWalrusUrl,
            contentBackup: taleDoc.contentBackup,
            coverImageBase64: taleDoc.coverImageBase64,
            tags: taleDoc.tags,
            wordCount: taleDoc.wordCount,
            readingTime: taleDoc.readingTime,
            authorId: taleDoc.authorId,
            suiTxDigest: taleDoc.suiTxDigest,
            suiObjectId: taleDoc.suiObjectId,
            createdAt: taleDoc.createdAt.toISOString(),
            updatedAt: taleDoc.updatedAt.toISOString(),
        };
    }

    async recordTalePublication(data: RecordPublicationDto): Promise<TaleSummary> {
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
            
            if (!suiObjectId && txResponse.effects?.created) {
                for (const createdObj of txResponse.effects.created) {
                    // This is a less precise way, might need adjustment based on exact objectType string from your contract
                }
                if (!suiObjectId) {
                    this.logger.warn(`[TalesService] Could not find created Tale objectId in objectChanges for tx ${txDigest}. It might be in effects.created if the type can be reliably identified.`);
                }
            }

            const newTaleData: any = {
                title: taleDataForRecord.title,
                description: taleDataForRecord.description,
                blobId: taleDataForRecord.contentBlobId, // Required field - use contentBlobId as main blob ID
                contentBlobId: taleDataForRecord.contentBlobId, // Explicit content blob ID
                coverImageBlobId: taleDataForRecord.coverBlobId, // Explicit cover blob ID
                coverImageWalrusUrl: taleDataForRecord.coverImageUrl, // Walrus URL for cover
                coverImageUrl: taleDataForRecord.coverImageUrl, // Legacy field for backward compatibility
                tags: taleDataForRecord.tags || [],
                wordCount: taleDataForRecord.wordCount || 0,
                readingTime: taleDataForRecord.readingTime || 1,
                authorId: taleDataForRecord.authorId,
                suiTxDigest: txDigest,
                suiObjectId: suiObjectId, // May be undefined if not found
            };

            // Use backup data directly from frontend instead of downloading from Walrus
            if (taleDataForRecord.contentBackup) {
                newTaleData.contentBackup = taleDataForRecord.contentBackup;
                this.logger.log(`[TalesService] Content backup received from frontend, size: ${taleDataForRecord.contentBackup.length} chars`);
            } else {
                this.logger.warn(`[TalesService] No content backup provided by frontend`);
            }
            
            if (taleDataForRecord.coverImageBase64) {
                newTaleData.coverImageBase64 = taleDataForRecord.coverImageBase64;
                this.logger.log(`[TalesService] Cover backup received from frontend, size: ${taleDataForRecord.coverImageBase64.length} chars`);
            } else {
                this.logger.warn(`[TalesService] No cover image backup provided by frontend`);
            }

            this.logger.debug('[TalesService] Creating new tale document with data:', JSON.stringify(newTaleData, null, 2));

            const createdTaleDoc = new this.taleModel(newTaleData);
            const savedTaleDoc = await createdTaleDoc.save();

            this.logger.log(`[TalesService] Tale publication recorded successfully with ID: ${savedTaleDoc.id}`);
            return this.toTaleSummary(savedTaleDoc);

        } catch (error) {
            this.logger.error(`[TalesService] Error in recordTalePublication for txDigest ${txDigest}:`, error.stack);
            throw error; // Re-throw to be handled by controller
        }
    }

    async findAll(limit = 10, offset = 0): Promise<TaleSummary[]> {
        const taleDocs = await this.taleModel
            .find()
            .limit(limit)
            .skip(offset)
            .sort({ createdAt: -1 })
            .exec();
        return taleDocs.map(doc => this.toTaleSummary(doc));
    }

    async getFullTale(id: string): Promise<TaleWithContent> {
        this.logger.debug(`[TalesService] getFullTale CALLED with id: ${id}`);
        
        const taleDoc = await this.taleModel.findById(id).exec();
        if (!taleDoc) {
            throw new HttpException(`Tale with ID ${id} not found`, HttpStatus.NOT_FOUND);
        }

        let content: string;

        // Only use database backup - no Walrus fallback
        if (taleDoc.contentBackup) {
            content = taleDoc.contentBackup;
            this.logger.debug(`[TalesService] Content loaded from database backup for tale ${id}, size: ${content.length}`);
        } else {
            // No backup available - return error
            this.logger.warn(`[TalesService] No content backup available for tale ${id}`);
            throw new HttpException(
                `Content not available: no backup stored for tale ${id}`,
                HttpStatus.NOT_FOUND
            );
        }
        
        const taleSummary = this.toTaleSummary(taleDoc);
        return {
            ...taleSummary,
            content,
        };
    }

    async getTale(id: string): Promise<TaleSummary> {
        const taleDoc = await this.taleModel.findById(id).exec();
        if (!taleDoc) {
            throw new HttpException(`Tale with ID ${id} not found`, HttpStatus.NOT_FOUND);
        }
        return this.toTaleSummary(taleDoc);
    }

    getWalrusUrl(blobId: string): string {
        return this.walrusService.getWalrusUrl(blobId);
    }


}
