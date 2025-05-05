import { 
  Controller, 
  Get, 
  Post, 
  Body, 
  Param, 
  Delete, 
  Put, 
  Query, 
  UseInterceptors,
  UploadedFile,
  ParseFilePipe,
  MaxFileSizeValidator,
  FileTypeValidator
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { 
  ApiTags, 
  ApiOperation, 
  ApiResponse, 
  ApiParam, 
  ApiBody, 
  ApiQuery,
  ApiConsumes 
} from '@nestjs/swagger';
import { TalesService } from '../services/tales.service';
import { CreateTaleDto } from '../dto/create-tale.dto';
import { UpdateTaleDto } from '../dto/update-tale.dto';
import { Tale } from '../schemas/tale.schema';
import { Express } from 'express';

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
  constructor(private readonly talesService: TalesService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new tale' })
  @ApiResponse({ status: 201, description: 'Tale created successfully', type: Tale })
  @ApiResponse({ status: 400, description: 'Invalid input' })
  @ApiBody({ type: CreateTaleDto })
  async create(@Body() createTaleDto: CreateTaleDto): Promise<Tale> {
    return await this.talesService.create(createTaleDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all tales with pagination' })
  @ApiResponse({ status: 200, description: 'List of tales', type: [Tale] })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Maximum number of tales to return' })
  @ApiQuery({ name: 'offset', required: false, type: Number, description: 'Skip first N tales' })
  async findAll(
    @Query('limit') limit?: number,
    @Query('offset') offset?: number,
  ): Promise<Tale[]> {
    return await this.talesService.findAll(limit, offset);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a tale by ID' })
  @ApiResponse({ status: 200, description: 'Tale found', type: Tale })
  @ApiResponse({ status: 404, description: 'Tale not found' })
  @ApiParam({ name: 'id', description: 'Tale ID' })
  async findOne(@Param('id') id: string): Promise<Tale> {
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

  @Put(':id')
  @ApiOperation({ summary: 'Update a tale' })
  @ApiResponse({ status: 200, description: 'Tale updated successfully', type: Tale })
  @ApiResponse({ status: 404, description: 'Tale not found' })
  @ApiParam({ name: 'id', description: 'Tale ID' })
  @ApiBody({ type: UpdateTaleDto })
  async update(
    @Param('id') id: string,
    @Body() updateTaleDto: UpdateTaleDto,
  ): Promise<Tale> {
    return await this.talesService.update(id, updateTaleDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a tale' })
  @ApiResponse({ status: 200, description: 'Tale deleted successfully', type: Tale })
  @ApiResponse({ status: 404, description: 'Tale not found' })
  @ApiParam({ name: 'id', description: 'Tale ID' })
  async remove(@Param('id') id: string): Promise<Tale> {
    return await this.talesService.remove(id);
  }

  @Post('upload/cover')
  @ApiOperation({ summary: 'Upload a cover image' })
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
  @UseInterceptors(FileInterceptor('file'))
  async uploadCoverImage(
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({ maxSize: 5 * 1024 * 1024 }), // 5MB
          new FileTypeValidator({ fileType: '.(png|jpeg|jpg)' }),
        ],
      }),
    )
    file: MulterFile,
  ) {
    // Convert file to base64 for storage
    const base64Image = `data:${file.mimetype};base64,${file.buffer?.toString('base64')}`;
    return { coverImage: base64Image };
  }
} 