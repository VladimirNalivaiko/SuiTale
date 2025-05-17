import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { TalesController } from './controllers/tales.controller';
import { TalesService } from './services/tales.service';
import { Tale, TaleSchema } from './schemas/tale.schema';
import { WalrusModule } from '../walrus/walrus.module';
import { SuiModule } from '../sui/sui.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Tale.name, schema: TaleSchema }]),
    WalrusModule,
    SuiModule,
  ],
  controllers: [TalesController],
  providers: [TalesService],
  exports: [TalesService],
})
export class TalesModule {} 