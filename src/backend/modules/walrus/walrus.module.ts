import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { WalrusService } from './services/walrus.service';
import { WalrusController } from './controllers/walrus.controller';

@Module({
  imports: [ConfigModule],
  controllers: [WalrusController],
  providers: [WalrusService],
  exports: [WalrusService],
})
export class WalrusModule {} 