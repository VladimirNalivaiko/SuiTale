import { Controller, Post, UploadedFile, UseInterceptors, HttpException, HttpStatus, Logger } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { WalrusService } from '../../walrus/services/walrus.service';
import { Express } from 'express'; // Import Express

@Controller('files')
export class FilesController {
    private readonly logger = new Logger(FilesController.name);

    constructor(private readonly walrusService: WalrusService) {}

    @Post('upload-cover-to-walrus')
    @UseInterceptors(FileInterceptor('coverImage')) // 'coverImage' is the field name in form-data
    async uploadCoverImageToWalrus(@UploadedFile() file: Express.Multer.File) {
        this.logger.log(`Received cover image upload request: ${file.originalname}, size: ${file.size} bytes`);
        if (!file) {
            throw new HttpException('No file uploaded.', HttpStatus.BAD_REQUEST);
        }

        // Basic file type validation (example: allow only images)
        if (!file.mimetype.startsWith('image/')) {
            throw new HttpException('Invalid file type. Only images are allowed.', HttpStatus.BAD_REQUEST);
        }

        // Basic size validation (example: max 5MB)
        const maxSize = 5 * 1024 * 1024; // 5MB
        if (file.size > maxSize) {
            throw new HttpException(`File too large. Maximum size is ${maxSize / (1024 * 1024)}MB.`, HttpStatus.BAD_REQUEST);
        }

        try {
            // The file.buffer contains the Uint8Array of the file
            const result = await this.walrusService.uploadFileToWalrus(file.buffer);
            this.logger.log(`Cover image uploaded to Walrus: ${result.url}`);
            return result; // Returns { blobId, url }
        } catch (error) {
            this.logger.error(`Failed to upload cover image to Walrus: ${error.message}`, error.stack);
            throw new HttpException('Failed to upload file to Walrus.', HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
} 