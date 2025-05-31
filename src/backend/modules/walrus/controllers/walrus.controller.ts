import { Controller, Post, Body, Logger } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBody, ApiProperty } from '@nestjs/swagger';
import { WalrusService } from '../services/walrus.service';

class ExchangeTokensDto {
    @ApiProperty({
        description: 'Amount of SUI to exchange for WAL (in SUI tokens, not MIST)',
        example: 1.0,
    })
    suiAmount: number;
}

@ApiTags('walrus')
@Controller('walrus')
export class WalrusController {
    private readonly logger = new Logger(WalrusController.name);

    constructor(private readonly walrusService: WalrusService) {}

    @Post('exchange-sui-for-wal')
    @ApiOperation({
        summary: 'Exchange SUI tokens for WAL tokens',
        description: 'Exchanges specified amount of SUI for WAL using Walrus exchange. This endpoint is for testing/admin purposes via Swagger.',
    })
    @ApiResponse({
        status: 201,
        description: 'Token exchange completed successfully',
        schema: {
            type: 'object',
            properties: {
                success: { type: 'boolean' },
                exchangedSui: { type: 'number', description: 'Amount of SUI exchanged' },
                receivedWal: { type: 'number', description: 'Amount of WAL received' },
                transactionDigest: { type: 'string' },
                newBalances: {
                    type: 'object',
                    properties: {
                        sui: { type: 'number' },
                        wal: { type: 'number' },
                    },
                },
            },
        },
    })
    @ApiResponse({
        status: 400,
        description: 'Invalid exchange amount or insufficient balance',
    })
    @ApiResponse({
        status: 500,
        description: 'Exchange transaction failed',
    })
    @ApiBody({ type: ExchangeTokensDto })
    async exchangeSuiForWal(
        @Body() exchangeDto: ExchangeTokensDto,
    ): Promise<{
        success: boolean;
        exchangedSui: number;
        receivedWal: number;
        transactionDigest: string;
        newBalances: { sui: number; wal: number };
    }> {
        this.logger.log(`Exchange request: ${exchangeDto.suiAmount} SUI for WAL`);
        
        try {
            const result = await this.walrusService.exchangeSuiForWal(exchangeDto.suiAmount);
            this.logger.log(`Exchange successful: ${result.transactionDigest}`);
            return result;
        } catch (error) {
            this.logger.error(`Exchange failed: ${error.message}`, error.stack);
            throw error;
        }
    }
} 