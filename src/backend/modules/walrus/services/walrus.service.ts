import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { WalrusClient } from '@mysten/walrus';
import { SuiClient } from '@mysten/sui/client';
import { Ed25519Keypair } from '@mysten/sui/keypairs/ed25519';

@Injectable()
export class WalrusService {
  private readonly logger = new Logger(WalrusService.name);
  private readonly walrusClient: WalrusClient;
  private readonly suiClient: SuiClient;

  constructor(private configService: ConfigService) {
    // Initialize Sui client
    const rpcUrl = this.configService.get<string>(
      'SUI_RPC_URL', 
      'https://fullnode.testnet.sui.io:443'
    );
    
    this.suiClient = new SuiClient({ url: rpcUrl });
    
    // Initialize Walrus client
    const networkConfig = this.configService.get<string>('WALRUS_NETWORK', 'testnet');
    const network = (networkConfig === 'mainnet' ? 'mainnet' : 'testnet') as 'mainnet' | 'testnet';
    
    // Create client with proper typing
    this.walrusClient = new WalrusClient({
      network,
      suiClient: this.suiClient as any, // Type assertion to bypass incompatible version issue
    });
    
    this.logger.log(`Walrus service initialized with network: ${network}`);
  }

  /**
   * Get a keypair for signing Walrus transactions
   * @returns Ed25519Keypair
   */
  private async getKeypair(): Promise<Ed25519Keypair> {
    const privateKey = this.configService.get<string>('SUI_PRIVATE_KEY');
    
    if (privateKey) {
      try {
        // Convert private key to Uint8Array and create keypair
        return Ed25519Keypair.fromSecretKey(
          Buffer.from(privateKey, 'hex')
        );
      } catch (error) {
        this.logger.error('Error creating keypair from private key:', error);
      }
    }
    
    // Fallback to generated keypair (not ideal for production)
    this.logger.warn('Using generated keypair - not suitable for production');
    return Ed25519Keypair.generate();
  }

  /**
   * Store content on Walrus network
   * @param content Content to store
   * @returns Blob ID
   */
  async storeContent(content: string): Promise<string> {
    try {
      // Convert string to Uint8Array
      const encoder = new TextEncoder();
      const contentBytes = encoder.encode(content);
      
      // Get keypair
      const keyPair = await this.getKeypair();
      
      this.logger.log('Uploading content to Walrus...');
      
      // Write blob to Walrus
      const { blobId } = await this.walrusClient.writeBlob({
        signer: keyPair,
        blob: contentBytes,
        deletable: false,
        epochs: 3, // Adjust as needed
      });

      this.logger.log(`Content stored with blob ID: ${blobId}`);
      return blobId;
    } catch (error) {
      this.logger.error('Failed to store content on Walrus:', error);
      throw new Error('Failed to store content on Walrus');
    }
  }

  /**
   * Get content from Walrus network
   * @param blobId Blob ID
   * @returns Content as string
   */
  async getContent(blobId: string): Promise<string> {
    try {
      this.logger.log(`Fetching content with blob ID: ${blobId}`);
      
      // Read blob from Walrus
      const blobBytes = await this.walrusClient.readBlob({ blobId });
      
      // Convert Uint8Array to string
      const textDecoder = new TextDecoder('utf-8');
      return textDecoder.decode(blobBytes);
    } catch (error) {
      this.logger.error(`Failed to fetch content with blob ID ${blobId}:`, error);
      throw new Error('Failed to fetch content from Walrus');
    }
  }
} 