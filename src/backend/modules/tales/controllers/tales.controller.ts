import {
    Controller,
    Get,
    Post,
    Body,
    Param,
    Query,
    Logger,
    Res,
    Options,
} from '@nestjs/common';
import {
    ApiTags,
    ApiOperation,
    ApiResponse,
    ApiParam,
    ApiQuery,
    ApiBody,
} from '@nestjs/swagger';
import { Response } from 'express';
import {
    TalesService,
    TaleSummary,
} from '../services/tales.service';
import { RecordPublicationDto } from '../dto/record-publication.dto';
import { TaleSummaryDto } from '../dto/tale-summary.dto';

@ApiTags('tales')
@Controller('tales')
export class TalesController {
    private readonly logger = new Logger(TalesController.name);

    constructor(
        private readonly talesService: TalesService,
    ) {}

    @Post('record-publication')
    @ApiOperation({
        summary:
            'Record a tale publication after user signs and submits the transaction to Sui network',
    })
    @ApiResponse({
        status: 201,
        description: 'Tale publication recorded successfully.',
        type: TaleSummaryDto,
    })
    @ApiResponse({
        status: 400,
        description: 'Invalid input or transaction verification failed',
    })
    @ApiResponse({
        status: 422,
        description: 'Sui transaction failed or was not successful',
    })
    @ApiBody({ type: RecordPublicationDto })
    async recordPublication(
        @Body() recordPublicationDto: RecordPublicationDto,
    ): Promise<TaleSummary> {
        this.logger.log(
            `recordPublication called with DTO: ${JSON.stringify(recordPublicationDto, null, 2)}`,
        );
        try {
            return await this.talesService.recordTalePublication(
                recordPublicationDto,
            );
        } catch (error) {
            this.logger.error(
                'Error in recordPublication:',
                error,
            );
            throw error;
        }
    }

    @Get()
    @ApiOperation({ summary: 'Get all tales with pagination' })
    @ApiResponse({
        status: 200,
        description: 'List of tales',
        type: [TaleSummaryDto],
    })
    @ApiQuery({
        name: 'limit',
        required: false,
        type: Number,
        description: 'Maximum number of tales to return',
    })
    @ApiQuery({
        name: 'offset',
        required: false,
        type: Number,
        description: 'Skip first N tales',
    })
    async findAll(
        @Query('limit') limit?: number,
        @Query('offset') offset?: number,
    ): Promise<TaleSummary[]> {
        return await this.talesService.findAll(limit, offset);
    }

    @Get(':id/full')
    @ApiOperation({ summary: 'Get a tale with full content from Walrus' })
    @ApiResponse({ status: 200, description: 'Tale with content found' })
    @ApiResponse({ status: 404, description: 'Tale not found' })
    @ApiParam({ name: 'id', description: 'Tale ID' })
    async getFullTale(@Param('id') id: string): Promise<any> {
        return await this.talesService.getFullTale(id);
    }

    @Options(':id/cover')
    async getCoverOptions(@Res() res: Response) {
        res.set('Access-Control-Allow-Origin', '*');
        res.set('Access-Control-Allow-Methods', 'GET, OPTIONS');
        res.set('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
        return res.status(200).send();
    }

    @Get(':id/cover')
    @ApiOperation({ summary: 'Get tale cover image with fallback' })
    @ApiResponse({ status: 200, description: 'Cover image found' })
    @ApiResponse({ status: 404, description: 'Tale or cover not found' })
    @ApiParam({ name: 'id', description: 'Tale ID' })
    async getTaleCover(@Param('id') id: string, @Res() res: Response) {
        try {
            this.logger.log(`getTaleCover called for tale ID: ${id}`);
            
            const tale = await this.talesService.getTale(id);
            this.logger.log(`Tale found: ${tale.title}, has base64: ${!!tale.coverImageBase64}, has blobId: ${!!tale.coverImageBlobId}`);
            
            // Set CORS headers for all responses
            res.set('Access-Control-Allow-Origin', '*');
            res.set('Access-Control-Allow-Methods', 'GET, OPTIONS');
            res.set('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
            
            // Only use database backup - no Walrus fallback
            if (tale.coverImageBase64) {
                this.logger.log(`Serving cover from database backup for tale ${id}`);
                const buffer = Buffer.from(tale.coverImageBase64, 'base64');
                res.set('Content-Type', 'image/jpeg');
                res.set('Cache-Control', 'public, max-age=3600'); // Cache for 1 hour
                res.set('X-Source', 'database');
                return res.send(buffer);
            }
            
            // No backup available - return 404
            this.logger.warn(`No cover image backup available for tale ${id}`);
            return res.status(404).json({ message: 'Cover image not available' });
        } catch (error) {
            this.logger.error(`Error in getTaleCover for tale ${id}:`, error);
            return res.status(500).json({ message: 'Internal server error' });
        }
    }
}
