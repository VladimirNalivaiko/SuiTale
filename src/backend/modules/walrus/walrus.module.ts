import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { WalrusService } from './services/walrus.service';

@Module({
  imports: [ConfigModule],
  providers: [WalrusService],
  exports: [WalrusService],
})
export class WalrusModule {} 