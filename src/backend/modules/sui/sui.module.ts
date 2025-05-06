import { Module } from '@nestjs/common';
import { SuiService } from './services/sui.service';

@Module({
    providers: [SuiService],
    exports: [SuiService],
})
export class SuiModule {}
