import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { TalesController } from './controllers/tales.controller';
import { TalesService } from './services/tales.service';
import { Tale, TaleSchema } from './schemas/tale.schema';
import { WalrusModule } from '../walrus/walrus.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Tale.name, schema: TaleSchema }]),
    WalrusModule,
  ],
  controllers: [TalesController],
  providers: [TalesService],
  exports: [TalesService],
})
export class TalesModule {} 