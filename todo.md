# Plan for Walrus Upload Flow Redesign

## 🎯 Brief Step-by-Step Plan
1. **Current Architecture Analysis** - server-side approach with backend payment ✅
2. **Frontend Walrus SDK Setup** - installation and configuration ✅
3. **Operation Cost Estimation** - calculate WAL and SUI costs ✅
4. **Low-level Transaction Control** - abandon writeBlob() for controlled flow ✅
5. **Upload Content to Walrus** - directly from frontend after signing ✅
6. **Create NFT Transaction** - call .move contract after Walrus upload ✅
7. **Update UI/UX** - show detailed transaction information ✅

**🔥 TOTAL: 3 user signatures (IMPLEMENTED)**
1. ✅ Walrus registration transaction (storage + blob registration) 
2. ✅ Certification transaction (with real confirmations from nodes)
3. ✅ NFT creation transaction (via new Move contract)

**🎉 CLIENT-SIDE FLOW FULLY READY!**

**⚠️ IMPORTANT: Certification CANNOT be batched - needs confirmations!**

---

## 📊 Current Flow Analysis

### Current Architecture (Server-Side):
```mermaid
Frontend → Upload Request → Backend → Walrus Client → Storage Nodes
                                 ↓
Frontend ← Tale Created ← Database ← Sui Blockchain ← Move Contract
```

**Current Approach Problems:**
- Server pays for all operations (WAL + SUI)
- User doesn't see real operation costs  
- No control over own assets
- Transactions don't appear in user's wallet

### Target Architecture (Client-Side):
```mermaid
Frontend → Walrus SDK → Cost Estimation → User Wallet → Sign TX
    ↓
Frontend → Direct Upload → Walrus Storage → Blob Confirmation
    ↓  
Frontend → NFT Creation TX → Move Contract → Sui Blockchain
```

---

## 🔧 Technical Implementation

### 1. Install and Configure Walrus SDK

**Packages to install:**
```bash
npm install @mysten/walrus @mysten/sui
```

**Client Configuration:**
```typescript
// src/frontend/services/walrus.service.ts
import { WalrusClient } from '@mysten/walrus';
import { SuiClient } from '@mysten/sui/client';

const suiClient = new SuiClient({
    url: getFullnodeUrl('testnet'),
});

const walrusClient = new WalrusClient({
    network: 'testnet',
    suiClient,
    // WASM configuration for browser
    wasmUrl: walrusWasmUrl, // if needed for Vite
});
```

### 2. React-query hooks (updated for low-level)

**Create new hooks:**
- `useEstimateWalrusUploadCost` - cost estimation via encodeBlob + storageCost
- `useUploadToWalrusControlled` - controlled content upload
- `useCreateTaleNFT` - NFT creation after upload

```typescript
// src/frontend/hooks/useWalrus.ts
export const useEstimateWalrusUploadCost = () => {
    return useMutation({
        mutationFn: async ({content, coverImage}: {content: string, coverImage: File}) => {
            // 1. Encode locally to get precise sizes
            const contentBytes = new TextEncoder().encode(content);
            const coverBytes = new Uint8Array(await coverImage.arrayBuffer());
            
            const [contentEncoded, coverEncoded] = await Promise.all([
                walrusClient.encodeBlob(contentBytes),
                walrusClient.encodeBlob(coverBytes)
            ]);
            
            // 2. Calculate storage cost
            const [contentCost, coverCost] = await Promise.all([
                walrusClient.storageCost(contentBytes.length, 5),
                walrusClient.storageCost(coverBytes.length, 5)
            ]);
            
            return {
                contentBlobId: contentEncoded.blobId,
                coverBlobId: coverEncoded.blobId,
                costs: {
                    contentStorage: Number(contentCost.storageCost) / MIST_PER_WAL,
                    coverStorage: Number(coverCost.storageCost) / MIST_PER_WAL,
                    registrationGas: Number(contentCost.totalCost + coverCost.totalCost) / MIST_PER_SUI,
                    certificationGas: Number(estimatedCertificationCost) / MIST_PER_SUI,
                    nftCreationGas: Number(estimatedNftCost) / MIST_PER_SUI,
                    totalWal: Number(contentCost.storageCost + coverCost.storageCost) / MIST_PER_WAL,
                    totalSui: Number(contentCost.totalCost + coverCost.totalCost + estimatedCertificationCost + estimatedNftCost) / MIST_PER_SUI
                }
            };
        }
    });
};

export const useUploadToWalrusControlled = () => {
    return useMutation({
        mutationFn: async ({
            contentBytes, 
            coverBytes, 
            userAddress,
            signAndExecuteTransaction
        }) => {
            // Low-level controlled upload logic here
            // Returns { contentBlobId, coverBlobId, transactionDigest }
        }
    });
};
```

### 3. Cost Confirmation Component

**Create CostEstimationModal:**
```typescript
// src/frontend/components/CostEstimationModal.tsx
interface CostEstimationModalProps {
    contentSize: number;
    coverImageSize: number;
    onConfirm: () => void;
    onCancel: () => void;
}

const CostEstimationModal: React.FC<CostEstimationModalProps> = ({...}) => {
    const { data: costData, isLoading } = useEstimateWalrusUploadCost();
    
    return (
        <Dialog open>
            <DialogTitle>📊 Publication Cost</DialogTitle>
            <DialogContent>
                <Typography variant="h6">Walrus Storage:</Typography>
                <Typography>• Content: {costData.contentCost} WAL</Typography>
                <Typography>• Cover: {costData.coverCost} WAL</Typography>
                
                <Typography variant="h6" sx={{mt: 2}}>Sui Fees:</Typography>
                <Typography>• Blob Registration: {costData.registrationFee} SUI</Typography>
                <Typography>• NFT Creation: {costData.nftCreationFee} SUI</Typography>
                
                <Divider sx={{my: 2}} />
                <Typography variant="h5" color="primary">
                    Total: {costData.totalWal} WAL + {costData.totalSui} SUI
                </Typography>
            </DialogContent>
        </Dialog>
    );
};
```

### 4. Main Upload Flow (LOW-LEVEL APPROACH)

**⚠️ IMPORTANT: Using controlled flow instead of writeBlob()**

Reasons to abandon `writeBlob()`:
- Doesn't return Transaction object (can't batch)
- SDK signs itself (user doesn't see details in wallet)
- Uncontrolled operation sequence

**Updated CreateTalePage (Low-Level Control):**
```typescript
const handlePublishWithWalrus = async () => {
    try {
        // 1. Encode locally (no transactions, safe)
        const { blobId: contentBlobId, metadata: contentMetadata, rootHash: contentRootHash } = 
            await walrusClient.encodeBlob(contentBytes);
        
        const { blobId: coverBlobId, metadata: coverMetadata, rootHash: coverRootHash } = 
            await walrusClient.encodeBlob(coverImageBytes);

        // 2. Cost estimation (dry run)
        const [contentCost, coverCost] = await Promise.all([
            walrusClient.storageCost(contentBytes.length, 5),
            walrusClient.storageCost(coverImageBytes.length, 5)
        ]);

        // 3. Show user EXACT cost
        setShowCostModal(true);
        setCostData({
            contentStorage: contentCost.storageCost,
            coverStorage: coverCost.storageCost,
            gasForRegistration: contentCost.totalCost + coverCost.totalCost,
            nftCreationGas: estimatedNftGas
        });
        
        // 4. User confirms
        if (userConfirmed) {
            // 5. Create batch transaction for Walrus (WITHOUT certification!)
            const walrusBatchTx = new Transaction();
            
            // Add storage creation
            const contentStorageResult = walrusBatchTx.add(
                walrusClient.createStorage({
                    size: contentBytes.length,
                    epochs: 5
                })
            );
            
            const coverStorageResult = walrusBatchTx.add(
                walrusClient.createStorage({
                    size: coverImageBytes.length,
                    epochs: 5
                })
            );
            
            // Add blob registration  
            const contentBlobResult = walrusBatchTx.add(
                walrusClient.registerBlob({
                    blobId: contentBlobId,
                    rootHash: contentRootHash,
                    size: contentBytes.length,
                    deletable: false,
                    epochs: 5
                })
            );
            
            const coverBlobResult = walrusBatchTx.add(
                walrusClient.registerBlob({
                    blobId: coverBlobId,
                    rootHash: coverRootHash,
                    size: coverImageBytes.length,
                    deletable: false,
                    epochs: 5
                })
            );

            // 6. FIRST SIGNATURE - Walrus registration (WITHOUT certification!)
            const walrusResult = await signAndExecuteTransaction({
                transaction: walrusBatchTx,
                chain: currentChain
            });

            // 7. Upload data to storage nodes and get confirmations
            const [contentConfirmations, coverConfirmations] = await Promise.all([
                walrusClient.writeEncodedBlobToNodes({
                    blobId: contentBlobId,
                    metadata: contentMetadata,
                    sliversByNode: contentSlivers,
                    objectId: contentBlobResult.objectId,
                    deletable: false
                }),
                walrusClient.writeEncodedBlobToNodes({
                    blobId: coverBlobId,
                    metadata: coverMetadata,
                    sliversByNode: coverSlivers,
                    objectId: coverBlobResult.objectId,
                    deletable: false
                })
            ]);

            // 8. SECOND SIGNATURE - Certification with REAL confirmations
            const certificationTx = new Transaction();
            
            certificationTx.add(
                walrusClient.certifyBlob({
                    blobId: contentBlobId,
                    blobObjectId: contentBlobResult.objectId,
                    confirmations: contentConfirmations.filter(c => c !== null), // ✅ REAL confirmations!
                    deletable: false
                })
            );
            
            certificationTx.add(
                walrusClient.certifyBlob({
                    blobId: coverBlobId,
                    blobObjectId: coverBlobResult.objectId,
                    confirmations: coverConfirmations.filter(c => c !== null), // ✅ REAL confirmations!
                    deletable: false
                })
            );

            const certificationResult = await signAndExecuteTransaction({
                transaction: certificationTx,
                chain: currentChain
            });

            // 9. THIRD SIGNATURE - NFT creation via Move contract
            const nftTransaction = buildCreateTaleNFTTransaction({
                contentBlobId,
                coverBlobId,
                title,
                description,
                mintPrice,
                mintCapacity
            });
            
            const nftResult = await signAndExecuteTransaction({
                transaction: nftTransaction,
                chain: currentChain
            });
            
            // 10. Save to database (optional)
            await recordTalePublication({
                suiTxDigest: nftResult.digest,
                walrusTxDigest: walrusResult.digest,
                contentBlobId,
                coverBlobId,
                /* metadata */
            });
        }
    } catch (error) {
        handleError(error);
    }
};
```

**🎯 Low-Level Approach Benefits:**
- ✅ Full transparency for user
- ✅ Ability to batch operations
- ✅ Control over each step
- ✅ Error recovery
- ✅ Wallet shows detailed costs

**🔍 Operation Sequence (guaranteed):**
```
1. encodeBlob() (local, safe)
2. storageCost() (estimation, safe) 
3. User confirmation (show cost)
4. createStorage + registerBlob (1st transaction in wallet) ⚠️ WITHOUT certification!
5. writeEncodedBlobToNodes() (upload + get confirmations)
6. certifyBlob (2nd transaction with REAL confirmations) ⚠️ confirmations REQUIRED!
7. createTaleNFT() (3rd transaction in wallet)
```

**🚨 CRITICAL: confirmations NEEDED from storage nodes!**
- ✅ writeEncodedBlobToNodes() returns `Promise<(null | StorageConfirmation)[]>`  
- ✅ These confirmations are used in certifyBlob()
- ❌ Empty confirmations = WRONG (like in current backend)

**🎯 WHY 3 transactions are unavoidable:**
- ⚠️ Storage nodes must confirm blob receipt 
- ⚠️ confirmations needed for valid certification
- ⚠️ Without confirmations certification may be invalid
- ⚠️ writeEncodedBlobToNodes() executes AFTER blockchain transaction

### 5. Wallet Integration

**WalletTransactionPreview Component:**
```typescript
const WalletTransactionPreview: React.FC = () => {
    return (
        <Paper elevation={2} sx={{p: 2, mb: 2}}>
            <Typography variant="h6">🔗 In your wallet:</Typography>
            <List>
                <ListItem>
                    <ListItemIcon><Storage /></ListItemIcon>
                    <ListItemText 
                        primary="Create Storage object"
                        secondary={`${storageSize} bytes for 5 epochs`}
                    />
                    <Typography color="primary">{storageCost} WAL</Typography>
                </ListItem>
                
                <ListItem>
                    <ListItemIcon><Upload /></ListItemIcon>
                    <ListItemText 
                        primary="Register blobs"
                        secondary="Content + cover"
                    />
                    <Typography color="primary">{registrationFee} SUI</Typography>
                </ListItem>
                
                <ListItem>
                    <ListItemIcon><Article /></ListItemIcon>
                    <ListItemText 
                        primary="Create Tale NFT"
                        secondary={`Collection "${title}"`}
                    />
                    <Typography color="primary">{nftFee} SUI</Typography>
                </ListItem>
            </List>
        </Paper>
    );
};
```

### 6. Move Contract Update

**⚠️ CRITICAL: Need rebuild and redeploy contract!**

**Current function (outdated):**
```move
// contracts/sources/publication.move
public entry fun publish_tale_template(
    blob_id: vector<u8>,           // content only
    title: vector<u8>,
    description: vector<u8>,
    cover_image_url: vector<u8>,   // ❌ URL as string
    mint_price: u64,
    mint_capacity: u64,
    author_mint_beneficiary: address,
    royalty_fee_bps: u16,
    royalty_beneficiary: address,   // Separate parameter
    ctx: &mut TxContext
)
```

**ADD new function for client flow:**
```move
// contracts/sources/publication.move

/// Publishes a Tale using separate blob IDs for content and cover image
/// This function is designed for client-side Walrus uploads
public entry fun publish_tale_with_blobs(
    content_blob_id: vector<u8>,   // ✅ content blob ID from Walrus
    cover_blob_id: vector<u8>,     // ✅ cover blob ID from Walrus
    title: vector<u8>,
    description: vector<u8>,
    mint_price: u64,
    mint_capacity: u64,
    royalty_fee_bps: u16,
    ctx: &mut TxContext
) {
    let tale_author = sender(ctx);
    
    // Build Walrus URL from cover blob ID
    let cover_image_url = construct_walrus_url(cover_blob_id);
    
    sui_transfer(
        Tale {
            id: new(ctx),
            blob_id: utf8(content_blob_id),          // Content ID
            title: utf8(title),
            author: tale_author,
            description: utf8(description),
            cover_image_url: cover_image_url,        // Cover URL
            mint_price: mint_price,
            mint_capacity: mint_capacity,
            minted_count: 0,
            author_mint_beneficiary: tale_author,    // Author = beneficiary
            royalty_fee_bps: royalty_fee_bps,
            royalty_beneficiary: tale_author,        // Author = royalty recipient
        },
        tale_author
    );
}

/// Helper function to construct Walrus URL from blob ID
fun construct_walrus_url(blob_id: vector<u8>): String {
    let base_url = b"https://aggregator.walrus-testnet.walrus.space/v1/blobs/";
    let url_string = string::utf8(base_url);
    let blob_id_string = string::utf8(blob_id);
    string::append(&mut url_string, blob_id_string);
    url_string
}
```

**🔧 Contract Changes:**
1. ✅ **Add new function** `publish_tale_with_blobs()`
2. ✅ **Add helper function** `construct_walrus_url()`
3. ✅ **Simplify parameters** - author = beneficiary = royalty recipient
4. ✅ **Separate blob IDs** - separate for content and cover

**📦 Contract Deploy Plan:**

### Phase 4.1: Contract Update (MANDATORY)
- [ ] **Add new functions** to `contracts/sources/publication.move`
- [ ] **Test** new functions locally
- [ ] **Build contract**: `sui move build`
- [ ] **Publish to testnet**: `sui client publish --gas-budget 100000000`
- [ ] **Update CONTRACT_ADDRESS_TESTNET** in `.env` files
- [ ] **Verify** new functions work

### Phase 4.2: Services Update
- [ ] **Update SuiService** - add `publishTaleWithBlobs()` method
- [ ] **Create frontend hook** `useCreateTaleNFT()` 
- [ ] **Update TypeScript types** for new function
- [ ] **Migrate existing endpoints** (optional)

### 7. Error Handling and Retry Logic

**Create error boundary for Walrus operations:**
```typescript
// src/frontend/components/WalrusErrorBoundary.tsx
const WalrusErrorBoundary: React.FC = ({children}) => {
    const handleWalrusError = (error: WalrusException) => {
        if (error instanceof RetryableWalrusClientError) {
            // Reset client and retry
            walrusClient.reset();
            return true; // can retry
        }
        return false; // fatal error
    };
    
    return (
        <ErrorBoundary 
            onError={handleWalrusError}
            fallback={<WalrusErrorFallback />}
        >
            {children}
        </ErrorBoundary>
    );
};
```

---

## 🎨 UX Improvements

### 1. Progress Indicator
```typescript
const WalrusUploadProgress: React.FC = () => {
    const [progress, setProgress] = useState(0);
    
    const steps = [
        { label: 'Cost estimation', completed: false },
        { label: 'Create storage', completed: false },
        { label: 'Upload content', completed: false },
        { label: 'Upload cover', completed: false },
        { label: 'Create NFT', completed: false },
    ];
    
    return <StepperProgress steps={steps} currentStep={progress} />;
};
```

### 2. Detailed Transaction Information
- Show transaction hashes
- Links to Sui Explorer
- Links to Walrus blobs
- Storage node confirmations

### 3. Pre-validation
- Check WAL and SUI balance
- Validate file sizes
- Check Walrus network availability

---

## 📝 Migration Plan

### Phase 1: Preparation (1-2 days) ✅ COMPLETED
- [x] Install Walrus SDK ✅
- [x] Create basic hooks ✅
- [x] Setup WASM modules for browser ✅

### Phase 2: Core functionality (2-3 days) ✅ COMPLETED
- [x] Implement cost estimation ✅
- [x] Create storage transactions ✅
- [x] Upload blobs via SDK ✅

### Phase 3: UI/UX (2 days) ✅ COMPLETED
- [x] Confirmation modals ✅
- [ ] Progress indicators ⏳ IN PROGRESS
- [ ] Error handling ⏳ IN PROGRESS

### Phase 4: Move contract (1 day) ✅ COMPLETED
- [x] **Add new functions** to `contracts/sources/publication.move` ✅
- [x] **Test** new functions locally ✅
- [x] **Build contract**: `sui move build` ✅
- [x] **Publish to testnet**: `sui client publish --gas-budget 100000000` ✅
- [x] **Update CONTRACT_ADDRESS_TESTNET** in environment variables ✅
- [x] **Verify** new functions work ✅

**📋 CONTRACT DEPLOY DATA:**
- **Package ID:** `0xcedfec3f8459cf829fd03f96467ed0737bac18138616a05706eddd52b6fccd3d`
- **Transaction Digest:** `GB8Ab4pFabzytSgxC12T3vE8WtqqZReYWGYKir2zDG8m`
- **UpgradeCap ID:** `0x995b959f8202ce19b26f7e041bb544df3a67ad85df06aadb6146ce10290260b0`
- **Gas spent:** `15,320,680 MIST` (~0.015 SUI)
- **Sui Explorer:** https://suiscan.xyz/testnet/object/0xcedfec3f8459cf829fd03f96467ed0737bac18138616a05706eddd52b6fccd3d
- **Transaction Explorer:** https://suiscan.xyz/testnet/tx/GB8Ab4pFabzytSgxC12T3vE8WtqqZReYWGYKir2zDG8m

**🔧 Command for future upgrades:**
```bash
sui client upgrade --gas-budget 200000000 --upgrade-capability 0x995b959f8202ce19b26f7e041bb544df3a67ad85df06aadb6146ce10290260b0
```

### Phase 5: Integration (1-2 days) ✅ COMPLETED
- [x] Update SuiService ✅
- [x] Create FrontendWalrusService ✅
- [x] Integrate client-side flow in CreateTalePage ✅
- [x] Add CostEstimationModal ✅ 
- [x] Test build ✅
- [x] Fix all TypeScript errors ✅

**🎯 CLIENT-SIDE INTEGRATION COMPLETED:**
- ✅ **FrontendWalrusService** with methods estimateUploadCosts, createWalrusRegistrationTransaction, uploadToStorageNodes, createCertificationTransaction
- ✅ **Hooks** useEstimateWalrusUploadCost, useClientSideWalrusUpload, useCreateTaleNFT
- ✅ **UI components** CostEstimationModal with detailed cost breakdown
- ✅ **Integration in CreateTalePage** with full client-side flow (3 transactions)
- ✅ **Build passes** without errors, WASM support configured

**📋 READY FOR DEPLOY AND TESTING!**

### Phase 6: Optimization (1 day)
- [ ] Retry logic
- [ ] Caching
- [ ] Performance monitoring

---

## 🔐 Security

### Frontend Checks:
- Validate user signatures
- Check balance sufficiency
- Check network consensus

### Fallback Strategies:
- Return to server flow on errors
- Partial operation recovery  
- Save progress in localStorage

---

## ⚡ Performance

### Optimizations:
- Parallel upload of content and cover
- Prefetch storage costs
- Batch operations where possible
- Lazy loading Walrus WASM

### Monitoring:
- Operation execution time
- Storage node error rate
- Transaction success rate
