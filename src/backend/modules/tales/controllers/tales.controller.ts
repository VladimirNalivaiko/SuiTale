import {
    Controller,
    Get,
    Post,
    Body,
    Param,
    Query,
    Logger,
} from '@nestjs/common';
import {
    ApiTags,
    ApiOperation,
    ApiResponse,
    ApiParam,
    ApiQuery,
    ApiBody,
} from '@nestjs/swagger';
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
}
