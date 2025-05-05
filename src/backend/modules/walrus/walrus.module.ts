import { Module } from '@nestjs/common';
import { WalrusService } from './services/walrus.service';

@Module({
  providers: [WalrusService],
  exports: [WalrusService],
})
export class WalrusModule {} 