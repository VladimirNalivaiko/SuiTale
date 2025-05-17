import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { TalesModule } from './modules/tales/tales.module';
import { WalrusModule } from './modules/walrus/walrus.module';
import { FilesModule } from './modules/files/files.module';
// Assuming SuiModule is correctly located, if not, the path might need adjustment
// import { SuiModule } from './modules/sui/sui.module'; 
// If SuiModule is in src/backend/modules/sui/sui.module.ts then the above is correct.
// If it's in src/modules/sui/sui.module.ts, it might be '../modules/sui/sui.module.ts' or depends on tsconfig paths

@Module({
  imports: [
    // Load environment variables
    ConfigModule.forRoot({
      envFilePath: '.env', // Specify path to .env file relative to project root
      isGlobal: true,                // Make ConfigModule global
    }),
    
    // Connect to MongoDB
    MongooseModule.forRoot(process.env.MONGODB_URI || 'mongodb://localhost:27017/suitale'),
    
    // Feature modules
    TalesModule,
    WalrusModule,
    FilesModule,
    // SuiModule, // Uncomment if SuiModule is used and path is correct
  ],
})
export class AppModule {} 