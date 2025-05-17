import { Module } from '@nestjs/common';
import { FilesController } from './controllers/files.controller';
import { WalrusModule } from '../walrus/walrus.module'; // Import WalrusModule to use WalrusService

@Module({
  imports: [WalrusModule], // Make WalrusService available to FilesController
  controllers: [FilesController],
})
export class FilesModule {} 