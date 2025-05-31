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

            const newTaleData = {
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

        // Get content from Walrus using the content blob ID (or fallback to main blobId)
        const blobIdToUse = taleDoc.contentBlobId || taleDoc.blobId;
        if (!blobIdToUse) {
            throw new HttpException(`Tale ${id} has no content blob ID`, HttpStatus.NOT_FOUND);
        }

        this.logger.debug(`[TalesService] Fetching content from Walrus with blobId: ${blobIdToUse}`);
        
        try {
            const content = await this.walrusService.getContent(blobIdToUse);
            this.logger.debug(`[TalesService] Successfully retrieved content for tale ${id}, length: ${content.length}`);
            
            const taleSummary = this.toTaleSummary(taleDoc);
            return {
                ...taleSummary,
                content,
            };
        } catch (error) {
            this.logger.error(`[TalesService] Failed to get content from Walrus for tale ${id}:`, error);
            throw new HttpException(
                `Failed to retrieve tale content from Walrus: ${error.message}`,
                HttpStatus.SERVICE_UNAVAILABLE
            );
        }
    }
}
