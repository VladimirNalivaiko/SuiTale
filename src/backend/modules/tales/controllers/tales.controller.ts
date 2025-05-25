import {
    Controller,
    Get,
    Post,
    Body,
    Param,
    Delete,
    Query,
    UseInterceptors,
    UploadedFile,
    ParseFilePipe,
    MaxFileSizeValidator,
    FileTypeValidator,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
    ApiTags,
    ApiOperation,
    ApiResponse,
    ApiParam,
    ApiBody,
    ApiQuery,
    ApiConsumes,
} from '@nestjs/swagger';
import {
    TalesService,
    TaleSummary,
    PreparePublicationResult,
} from '../services/tales.service';
import { CreateTaleDto } from '../dto/create-tale.dto';
import { InitiatePublicationDto } from '../dto/initiate-publication.dto';
import { RecordPublicationDto } from '../dto/record-publication.dto';
import { PreparePublicationResultDto } from '../dto/prepare-publication-result.dto';
import { BatchPublicationRequestDto, BatchPublicationResponseDto, RecordBatchPublicationDto } from '../dto/batch-publication.dto';
import { WalrusService } from '../../walrus/services/walrus.service';

// Create local interface to avoid the Multer namespace issue
interface MulterFile {
    /** Field name specified in the form */
    fieldname: string;
    /** Name of the file on the user's computer */
    originalname: string;
    /** Encoding type of the file */
    encoding: string;
    /** Mime type of the file */
    mimetype: string;
    /** Size of the file in bytes */
    size: number;
    /** The folder to which the file has been saved (DiskStorage) */
    destination?: string;
    /** The name of the file within the destination (DiskStorage) */
    filename?: string;
    /** Location of the uploaded file (DiskStorage) */
    path?: string;
    /** A Buffer of the entire file (MemoryStorage) */
    buffer?: Buffer;
}

@ApiTags('tales')
@Controller('tales')
export class TalesController {
    constructor(
        private readonly talesService: TalesService,
        private readonly walrusService: WalrusService,
    ) {}

    @Post('prepare-publication')
    @ApiOperation({
        summary:
            'Prepare a tale for publication by creating a transaction block for user to sign',
    })
    @ApiResponse({
        status: 201,
        description:
            'Publication preparation successful, returns transaction block bytes and tale data.',
        type: PreparePublicationResultDto,
    })
    @ApiResponse({
        status: 400,
        description: 'Invalid input or signature verification failed',
    })
    @ApiBody({ type: InitiatePublicationDto })
    async preparePublication(
        @Body() initiatePublicationDto: InitiatePublicationDto,
    ): Promise<PreparePublicationResult> {
        console.log(
            '[TalesController] preparePublication CALLED with DTO:',
            JSON.stringify(initiatePublicationDto, null, 2),
        );
        try {
            return await this.talesService.prepareTalePublication(
                initiatePublicationDto,
            );
        } catch (error) {
            console.error(
                '[TalesController] Error in preparePublication:',
                error,
            );
            throw error; // Re-throw to be handled by NestJS default exception filter
        }
    }

    @Post('record-publication')
    @ApiOperation({
        summary:
            'Record a tale publication after user signs and submits the transaction to Sui network',
    })
    @ApiResponse({
        status: 201,
        description: 'Tale publication recorded successfully.',
        type: TaleSummary,
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
        console.log(
            '[TalesController] recordPublication CALLED with DTO:',
            JSON.stringify(recordPublicationDto, null, 2),
        );
        try {
            return await this.talesService.recordTalePublication(
                recordPublicationDto,
            );
        } catch (error) {
            console.error(
                '[TalesController] Error in recordPublication:',
                error,
            );
            throw error; // Re-throw to be handled by NestJS default exception filter
        }
    }

    @Post('prepare-batch-publication')
    @UseInterceptors(FileInterceptor('coverImage'))
    @ApiConsumes('multipart/form-data')
    @ApiOperation({
        summary: 'Prepare batch upload transaction for cover image and content',
        description: 'Creates a single transaction to upload both cover image and content to Walrus, returning cost breakdown and serialized transaction for user to sign.'
    })
    @ApiResponse({
        status: 201,
        description: 'Batch publication prepared successfully',
        type: BatchPublicationResponseDto,
    })
    @ApiResponse({
        status: 400,
        description: 'Invalid input or file validation failed',
    })
    async prepareBatchPublication(
        @UploadedFile(
            new ParseFilePipe({
                validators: [
                    new MaxFileSizeValidator({ maxSize: 5 * 1024 * 1024 }), // 5MB
                    new FileTypeValidator({
                        fileType: '^(image\\/(png|jpeg|jpg))$',
                    }),
                ],
            }),
        )
        coverImage: MulterFile,
        @Body() batchRequest: BatchPublicationRequestDto,
    ): Promise<BatchPublicationResponseDto> {
        console.log('[TalesController] prepareBatchPublication CALLED');
        console.log('Cover image:', coverImage?.originalname, 'Size:', coverImage?.size);
        console.log('Request:', JSON.stringify(batchRequest, null, 2));
        
        try {
            // Validate that cover image buffer exists
            if (!coverImage?.buffer) {
                throw new Error('Cover image buffer is required');
            }

            // Call WalrusService directly for batch upload preparation
            const result = await this.walrusService.prepareBatchUpload(
                batchRequest.userAddress,
                batchRequest.content,
                coverImage.buffer
            );
            
            return result;
        } catch (error) {
            console.error('[TalesController] Error in prepareBatchPublication:', error);
            throw error;
        }
    }

    @Post('record-batch-publication')
    @ApiOperation({
        summary: 'Record batch publication after user signs and executes the transaction',
        description: 'Records the successful batch publication in the database with both cover and content blob IDs.'
    })
    @ApiResponse({
        status: 201,
        description: 'Batch publication recorded successfully',
        type: TaleSummary,
    })
    @ApiResponse({
        status: 400,
        description: 'Invalid input or transaction verification failed',
    })
    @ApiResponse({
        status: 422,
        description: 'Sui transaction failed or was not successful',
    })
    @ApiBody({ type: RecordBatchPublicationDto })
    async recordBatchPublication(
        @Body() recordBatchDto: RecordBatchPublicationDto,
    ): Promise<TaleSummary> {
        console.log('[TalesController] recordBatchPublication CALLED');
        console.log('Request:', JSON.stringify(recordBatchDto, null, 2));
        
        try {
            // For now, delegate to TalesService - we'll implement this method next
            return await this.talesService.recordBatchPublication(recordBatchDto);
        } catch (error) {
            console.error('[TalesController] Error in recordBatchPublication:', error);
            throw error;
        }
    }

    @Post()
    @ApiOperation({
        summary:
            'Create a new tale (Legacy - prefer /prepare-publication & /record-publication)',
    })
    @ApiResponse({
        status: 201,
        description: 'Tale created successfully',
        type: TaleSummary,
    })
    @ApiResponse({ status: 400, description: 'Invalid input' })
    @ApiBody({ type: CreateTaleDto })
    async create(@Body() createTaleDto: CreateTaleDto): Promise<TaleSummary> {
        return await this.talesService.create(createTaleDto);
    }

    @Get()
    @ApiOperation({ summary: 'Get all tales with pagination' })
    @ApiResponse({
        status: 200,
        description: 'List of tales',
        type: [TaleSummary],
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

    @Get(':id')
    @ApiOperation({ summary: 'Get a tale by ID' })
    @ApiResponse({ status: 200, description: 'Tale found', type: TaleSummary })
    @ApiResponse({ status: 404, description: 'Tale not found' })
    @ApiParam({ name: 'id', description: 'Tale ID' })
    async findOne(@Param('id') id: string): Promise<TaleSummary> {
        return await this.talesService.findOne(id);
    }

    @Get(':id/full')
    @ApiOperation({ summary: 'Get a tale with full content from Walrus' })
    @ApiResponse({ status: 200, description: 'Tale with content found' })
    @ApiResponse({ status: 404, description: 'Tale not found' })
    @ApiParam({ name: 'id', description: 'Tale ID' })
    async getFullTale(@Param('id') id: string): Promise<any> {
        return await this.talesService.getFullTale(id);
    }

    @Delete(':id')
    @ApiOperation({ summary: 'Delete a tale' })
    @ApiResponse({ status: 200, description: 'Tale deleted successfully' })
    @ApiResponse({ status: 404, description: 'Tale not found' })
    @ApiParam({ name: 'id', description: 'Tale ID' })
    async remove(@Param('id') id: string): Promise<void> {
        await this.talesService.remove(id);
    }

    @Post('upload/cover')
    @ApiOperation({ summary: 'Upload a cover image to Walrus and get its URL' })
    @ApiConsumes('multipart/form-data')
    @ApiBody({
        schema: {
            type: 'object',
            properties: {
                file: {
                    type: 'string',
                    format: 'binary',
                },
            },
        },
    })
    @ApiResponse({
        status: 201,
        description: 'Cover image uploaded successfully to Walrus',
        schema: {
            type: 'object',
            properties: { blobId: { type: 'string' }, url: { type: 'string' } },
        },
    })
    @UseInterceptors(FileInterceptor('file'))
    async uploadCoverImage(
        @UploadedFile(
            new ParseFilePipe({
                validators: [
                    new MaxFileSizeValidator({ maxSize: 5 * 1024 * 1024 }), // 5MB
                    new FileTypeValidator({
                        fileType: '^(image\\/(png|jpeg|jpg))$',
                    }),
                ],
            }),
        )
        file: MulterFile,
    ): Promise<{ blobId: string; url: string }> {
        if (!file.buffer) {
            throw new Error('File buffer is missing');
        }
        // Use WalrusService to upload the file buffer
        try {
            const result = await this.walrusService.uploadFileToWalrus(
                file.buffer,
            );
            console.log(
                '[TalesController] Cover image uploaded to Walrus:',
                result,
            );
            return result; // Returns { blobId, url }
        } catch (error) {
            console.error(
                '[TalesController] Error uploading cover to Walrus:',
                error,
            );
            throw error; // Re-throw to be handled by NestJS default exception filter
        }
    }
}
