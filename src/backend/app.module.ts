import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { TalesModule } from './modules/tales/tales.module';
import { WalrusModule } from './modules/walrus/walrus.module';

@Module({
  imports: [
    // Load environment variables
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    
    // Connect to MongoDB
    MongooseModule.forRoot(process.env.MONGODB_URI || 'mongodb://localhost:27017/suitale'),
    
    // Feature modules
    TalesModule,
    WalrusModule,
  ],
})
export class AppModule {} 