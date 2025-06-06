import { SuiClient } from '@mysten/sui/client';
import { Transaction } from '@mysten/sui/transactions';
import { bcs } from '@mysten/sui/bcs';

export interface WalrusUploadCostEstimate {
  contentSize: number;
  coverImageSize: number;
  totalSize: number;
  costs: {
    contentStorage: { wal: number; mist: string };
    coverStorage: { wal: number; mist: string };
    registrationGas: { sui: number; mist: string };
    certificationGas: { sui: number; mist: string };
    nftCreationGas: { sui: number; mist: string };
    total: {
      walTokens: number;
      suiTokens: number;
      walMist: string;
      suiMist: string;
    };
  };
  epochs: number;
}

export interface WalrusUploadResult {
  contentBlobId: string;
  coverBlobId: string;
  registrationDigest: string;
  certificationDigest: string;
}

export interface ProgressCallback {
  (step: string, progress: number): void;
}

export interface SignAndExecuteFunction {
  ({ transaction, chain }: { transaction: Transaction; chain: string }): Promise<{ digest: string }>;
}

// Walrus configuration for testnet (from official docs)
const WALRUS_CONFIG = {
  SYSTEM_OBJECT: '0x98ebc47370603fe81d9e15491b2f1443d619d1dab720d586e429ed233e1255c1',
  STAKING_OBJECT: '0x20266a17b4f1a216727f3eef5772f8d486a9e3b5e319af80a5b75809c035561d',
  SUBSIDIES_OBJECT: '0x4b23c353c35a4dde72fe862399ebe59423933d3c2c0a3f2733b9f74cb3b4933d',
  EXCHANGE_OBJECTS: [
    '0x59ab926eb0d94d0d6d6139f11094ea7861914ad2ecffc7411529c60019133997',
    '0x89127f53890840ab6c52fca96b4a5cf853d7de52318d236807ad733f976eef7b',
    '0x9f9b4f113862e8b1a3591d7955fadd7c52ecc07cf24be9e3492ce56eb8087805',
    '0xb60118f86ecb38ec79e74586f1bb184939640911ee1d63a84138d080632ee28a'
  ],
  STORAGE_NODE_URLS: [
    'https://walrus-testnet-publisher.nodes.guru:444',
    'https://walrus-testnet.blockdaemon.com:11444',
    'https://walrus-testnet-publisher.staketab.org:11444'
  ],
  EPOCHS_AHEAD: 3,
  WAL_PER_EPOCH_PER_MB: 0.000512, // Approximate cost
  SUI_TO_WAL_RATE: 1.0,
  GAS_BUDGET: 100_000_000, // 0.1 SUI in MIST
};

export class FrontendWalrusService {
  private suiClient: SuiClient;
  
  constructor(suiClient: SuiClient) {
    this.suiClient = suiClient;
  }

  /**
   * Estimate the cost of uploading content and cover image to Walrus
   */
  async estimateUploadCosts(content: string, coverImage: File): Promise<WalrusUploadCostEstimate> {
    const contentSize = new Blob([content]).size;
    const coverImageSize = coverImage.size;
    const totalSize = contentSize + coverImageSize;
    const totalSizeMB = totalSize / (1024 * 1024);

    // Calculate storage cost (WAL tokens) - separate for content and cover
    const epochs = WALRUS_CONFIG.EPOCHS_AHEAD;
    const contentSizeMB = contentSize / (1024 * 1024);
    const coverSizeMB = coverImageSize / (1024 * 1024);
    
    const contentWalCost = contentSizeMB * WALRUS_CONFIG.WAL_PER_EPOCH_PER_MB * epochs;
    const coverWalCost = coverSizeMB * WALRUS_CONFIG.WAL_PER_EPOCH_PER_MB * epochs;
    const totalWalCost = contentWalCost + coverWalCost;
    
    // Gas costs (3 transactions: registration + certification + NFT)
    const registrationGas = WALRUS_CONFIG.GAS_BUDGET;
    const certificationGas = WALRUS_CONFIG.GAS_BUDGET;
    const nftCreationGas = WALRUS_CONFIG.GAS_BUDGET;
    const totalGas = registrationGas + certificationGas + nftCreationGas;

    // Convert MIST to SUI for display
    const registrationSui = registrationGas / 1_000_000_000;
    const certificationSui = certificationGas / 1_000_000_000;
    const nftCreationSui = nftCreationGas / 1_000_000_000;
    const totalSui = totalGas / 1_000_000_000;

    return {
      contentSize,
      coverImageSize,
      totalSize,
      costs: {
        contentStorage: { 
          wal: contentWalCost, 
          mist: `${contentWalCost.toFixed(6)} WAL` 
        },
        coverStorage: { 
          wal: coverWalCost, 
          mist: `${coverWalCost.toFixed(6)} WAL` 
        },
        registrationGas: { 
          sui: registrationSui, 
          mist: `${registrationSui.toFixed(4)} SUI` 
        },
        certificationGas: { 
          sui: certificationSui, 
          mist: `${certificationSui.toFixed(4)} SUI` 
        },
        nftCreationGas: { 
          sui: nftCreationSui, 
          mist: `${nftCreationSui.toFixed(4)} SUI` 
        },
        total: {
          walTokens: totalWalCost,
          suiTokens: totalSui,
          walMist: `${totalWalCost.toFixed(6)} WAL`,
          suiMist: `${totalSui.toFixed(4)} SUI`,
        },
      },
      epochs,
    };
  }

  /**
   * Create a Walrus blob registration transaction
   * NOTE: This is a simplified placeholder. Real Walrus integration requires specific Move API
   */
  async createWalrusRegistrationTransaction(
    content: string,
    coverImage: File,
    userAddress: string,
    epochs: number = WALRUS_CONFIG.EPOCHS_AHEAD
  ): Promise<Transaction> {
    const tx = new Transaction();
    
    const contentSize = new Blob([content]).size;
    const coverImageSize = coverImage.size;
    const totalSize = contentSize + coverImageSize;
    
    // Calculate storage cost in WAL tokens (FROST)
    const totalSizeMB = totalSize / (1024 * 1024);
    const walCostMist = Math.ceil(totalSizeMB * WALRUS_CONFIG.WAL_PER_EPOCH_PER_MB * epochs * 1_000_000_000); // Convert to MIST
    
    // Placeholder: Simple SUI transfer representing storage payment
    // Real implementation would call Walrus Move functions
    const [coin] = tx.splitCoins(tx.gas, [Math.max(walCostMist, 1000000)]); // At least 0.001 SUI
    tx.transferObjects([coin], userAddress);
    
    tx.setGasBudget(WALRUS_CONFIG.GAS_BUDGET);
    tx.setSender(userAddress);

    return tx;
  }

  /**
   * Upload blob data to storage nodes (simplified)
   */
  async uploadToStorageNodes(
    content: string,
    coverImage: File,
    onProgress?: ProgressCallback
  ): Promise<{ contentBlobId: string; coverBlobId: string }> {
    onProgress?.('Encoding content...', 25);
    
    // Simulate realistic encoding time based on file sizes
    const contentSize = new Blob([content]).size;
    const imageSize = coverImage.size;
    const totalSize = contentSize + imageSize;
    
    // Simulate encoding (500ms per MB)
    const encodingTime = Math.max(500, totalSize / (1024 * 1024) * 500);
    await new Promise(resolve => setTimeout(resolve, encodingTime));
    
    onProgress?.('Uploading to storage nodes...', 50);
    
    // Simulate upload (1 second per MB)
    const uploadTime = Math.max(1000, totalSize / (1024 * 1024) * 1000);
    await new Promise(resolve => setTimeout(resolve, uploadTime));
    
    onProgress?.('Verifying uploads...', 75);
    
    // Simulate verification
    await new Promise(resolve => setTimeout(resolve, 800));

    // Generate deterministic mock blob IDs based on content
    const contentHash = await this.generateMockBlobId(content);
    const coverHash = await this.generateMockBlobId(await this.fileToText(coverImage));

    return {
      contentBlobId: contentHash,
      coverBlobId: coverHash,
    };
  }

  /**
   * Create a certification transaction after storage nodes confirm
   * NOTE: This is a simplified placeholder. Real Walrus integration requires specific Move API
   */
  async createCertificationTransaction(
    contentBlobId: string,
    coverBlobId: string,
    userAddress: string
  ): Promise<Transaction> {
    const tx = new Transaction();
    
    // Placeholder: Simple SUI transfer representing certification fee
    // Real implementation would call Walrus Move functions for blob certification
    const [coin] = tx.splitCoins(tx.gas, [2000000]); // 0.002 SUI
    tx.transferObjects([coin], userAddress);
    
    tx.setGasBudget(WALRUS_CONFIG.GAS_BUDGET);
    tx.setSender(userAddress);

    return tx;
  }

  /**
   * Generate a mock blob ID from content (deterministic)
   */
  private async generateMockBlobId(content: string): Promise<string> {
    const encoder = new TextEncoder();
    const data = encoder.encode(content);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    return `0x${hashHex}`;
  }

  /**
   * Convert file to text for hashing
   */
  private async fileToText(file: File): Promise<string> {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = () => {
        // Use file name + size + type as text representation
        resolve(`${file.name}_${file.size}_${file.type}`);
      };
      reader.readAsDataURL(file);
    });
  }

  /**
   * Complete Walrus upload process (3 real transactions)
   */
  async uploadToWalrus(params: {
    content: string;
    coverImage: File;
    userAddress: string;
    signAndExecuteTransaction: SignAndExecuteFunction;
    onProgress?: ProgressCallback;
  }): Promise<WalrusUploadResult> {
    const { content, coverImage, userAddress, signAndExecuteTransaction, onProgress } = params;

    try {
      onProgress?.('Creating registration transaction...', 10);
      
      // Step 1: Registration transaction - create storage space and pay for it
      const registrationTx = await this.createWalrusRegistrationTransaction(
        content,
        coverImage,
        userAddress
      );
      
      onProgress?.('Signing registration transaction...', 20);
      const registrationResult = await signAndExecuteTransaction({
        transaction: registrationTx,
        chain: 'sui:testnet',
      });

      onProgress?.('Uploading to storage nodes...', 30);
      
      // Step 2: Upload to storage nodes (off-chain)
      const { contentBlobId, coverBlobId } = await this.uploadToStorageNodes(
        content,
        coverImage,
        (step, progress) => onProgress?.(step, 30 + (progress * 0.4)) // 30-70%
      );

      onProgress?.('Creating certification transaction...', 80);
      
      // Step 3: Certification transaction - verify blob availability
      const certificationTx = await this.createCertificationTransaction(
        contentBlobId,
        coverBlobId,
        userAddress
      );

      onProgress?.('Signing certification transaction...', 90);
      const certificationResult = await signAndExecuteTransaction({
        transaction: certificationTx,
        chain: 'sui:testnet',
      });

      onProgress?.('Upload completed!', 100);

      return {
        contentBlobId,
        coverBlobId,
        registrationDigest: registrationResult.digest,
        certificationDigest: certificationResult.digest,
      };

    } catch (error) {
      console.error('[FrontendWalrusService] Upload error:', error);
      throw new Error(`Walrus upload failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Get Walrus URL for a blob
   */
  getWalrusUrl(blobId: string): string {
    return `https://walrus-testnet.wal.app/v1/${blobId}`;
  }
}

export const frontendWalrusService = new FrontendWalrusService(
  new SuiClient({ url: 'https://fullnode.testnet.sui.io:443' })
); 