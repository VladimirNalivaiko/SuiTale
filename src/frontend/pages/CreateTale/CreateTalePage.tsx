import React, { useState, useEffect, useCallback } from 'react';
import { Box, TextField } from '@mui/material';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import Link from '@tiptap/extension-link';
import Image from '@tiptap/extension-image';
import { SxProps, Theme } from '@mui/material/styles';

import { 
  EditorToolbar,
  CoverImageUpload,
  MetadataPanel,
  MetadataToggle,
  PreviewDialog,
  EditorHeader,
  SlashTip,
  SlashCommandsMenu,
  SlashCommands
} from '../../components/TaleEditor';
import { CostEstimationModal } from '../../components/CostEstimationModal';
import 'tippy.js/dist/tippy.css';
import { 
  editorContainerStyles, 
  editorContentStyles, 
  titleInputStyles, 
  bottomToolbarStyles,
  tipTapEditorStyles
} from '../../styles/TaleEditor.styles';
import { 
  useEstimateWalrusUploadCost,
  useWalrusUpload
} from '../../hooks/useWalrusUpload';
import { useCreateTaleNFT } from '../../hooks/useCreateTaleNFT';
import { useSnackbar } from 'notistack';
import { useCurrentAccount, useSignAndExecuteTransaction } from '@mysten/dapp-kit';
import { Transaction } from '@mysten/sui/transactions';
import { talesApi } from '../../api/tales.api';
import { walrusService } from '../../services/walrus.service';

// Local storage keys
const LOCAL_STORAGE_KEYS = {
  TITLE: 'tale-editor-title',
  CONTENT: 'tale-editor-content',
  COVER_WALRUS_URL: 'tale-editor-cover-walrus-url',
  SLASH_TIP_SHOWN: 'tale-editor-slash-tip-shown',
  DESCRIPTION: 'tale-editor-description',
  TAGS: 'tale-editor-tags'
};

// Popular tags for autocomplete
const SUGGESTED_TAGS = [
  'Fiction', 'Non-Fiction', 'Tutorial', 'Technology', 'Programming', 
  'Web Development', 'Design', 'UX', 'React', 'JavaScript', 
  'TypeScript', 'Blockchain', 'Crypto', 'NFT', 'Sui', 'Science', 
  'Art', 'Music', 'Philosophy', 'History', 'Travel', 'Food', 
  'Health', 'Fitness', 'Business', 'Finance', 'Education', 'Sports'
];

// Approximate reading speed (words per minute)
const READING_SPEED = 200;

const CreateTalePage: React.FC = () => {
  const currentAccount = useCurrentAccount();
  const { mutateAsync: signAndExecuteTransaction } = useSignAndExecuteTransaction();
  
  // Helper function to format digest/blob ID for display
  const formatDigest = (digest: string): string => {
    if (digest.length <= 12) return digest;
    return `${digest.slice(0, 6)}...${digest.slice(-6)}`;
  };
  
  const [title, setTitle] = useState<string>('');
  const [isPublishing, setIsPublishing] = useState<boolean>(false);
  
  // State for cover image
  const [coverPreviewUrl, setCoverPreviewUrl] = useState<string>('');
  const [coverImageFile, setCoverImageFile] = useState<File | null>(null);
  const [coverImageWalrusUrl, setCoverImageWalrusUrl] = useState<string>('');
  
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [showSlashTip, setShowSlashTip] = useState<boolean>(true);
  const [previewOpen, setPreviewOpen] = useState<boolean>(false);
  
  const [description, setDescription] = useState<string>('');
  const [tags, setTags] = useState<string[]>([]);
  const [metadataOpen, setMetadataOpen] = useState<boolean>(false);
  
  const [wordCount, setWordCount] = useState<number>(0);
  const [readingTime, setReadingTime] = useState<number>(0);

  // Minting details
  const [mintPrice, setMintPrice] = useState<string>('100000000'); // 0.1 SUI in MIST
  const [mintCapacity, setMintCapacity] = useState<string>('100');
  const [royaltyFeeBps, setRoyaltyFeeBps] = useState<number>(500); // 5%

  // CLIENT-SIDE WALRUS STATE
  const [showCostEstimation, setShowCostEstimation] = useState<boolean>(false);
  const [clientSideCostData, setClientSideCostData] = useState<any>(null);
  const [uploadProgress, setUploadProgress] = useState<{ step: string; progress: number } | null>(null);

  // React Query hooks & Dapp-kit hooks
  const { enqueueSnackbar } = useSnackbar();

  // CLIENT-SIDE WALRUS HOOKS
  const { mutateAsync: estimateWalrusCost, isPending: isEstimatingCost } = useEstimateWalrusUploadCost();
  const { mutateAsync: walrusUpload, isPending: isWalrusUploading } = useWalrusUpload();
  const { mutateAsync: createTaleNFT, isPending: isCreatingNFT } = useCreateTaleNFT();

  // Handle key press for hiding slash tip
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key === '/') {
      setShowSlashTip(false);
      localStorage.setItem(LOCAL_STORAGE_KEYS.SLASH_TIP_SHOWN, 'true');
    }
  }, []);

  // Add global keyboard listener
  useEffect(() => {
    if (showSlashTip) {
      document.addEventListener('keydown', handleKeyDown);
    }
    
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [showSlashTip, handleKeyDown]);

  // Initialize editor with SlashCommands extension
  const editor = useEditor({
    extensions: [
      StarterKit,
      Placeholder.configure({ placeholder: 'Start writing...' }),
      Link.configure({ openOnClick: false }),
      Image,
      SlashCommands.configure({
        component: SlashCommandsMenu,
        char: '/'
      }),
    ],
    content: '',
    onUpdate: ({ editor }) => {
      // Auto-save when content changes
      localStorage.setItem(LOCAL_STORAGE_KEYS.CONTENT, editor.getHTML());
      setLastSaved(new Date());
      
      // Calculate word count and reading time
      const text = editor.getText();
      const words = text.trim().split(/\s+/).filter(Boolean);
      const count = words.length;
      
      setWordCount(count);
      setReadingTime(Math.max(1, Math.ceil(count / READING_SPEED)));
    }
  });

  // Calculate reading time based on content
  const calculateReadingStats = useCallback(() => {
    if (editor) {
      const text = editor.getText();
      const words = text.trim().split(/\s+/).filter(Boolean);
      const count = words.length;
      
      setWordCount(count);
      setReadingTime(Math.max(1, Math.ceil(count / READING_SPEED)));
    }
  }, [editor]);

  // Load saved data from localStorage
  useEffect(() => {
    const savedTitle = localStorage.getItem(LOCAL_STORAGE_KEYS.TITLE);
    const savedContent = localStorage.getItem(LOCAL_STORAGE_KEYS.CONTENT);
    const savedCoverWalrusUrl = localStorage.getItem(LOCAL_STORAGE_KEYS.COVER_WALRUS_URL);
    const tipShown = localStorage.getItem(LOCAL_STORAGE_KEYS.SLASH_TIP_SHOWN);
    const savedDescription = localStorage.getItem(LOCAL_STORAGE_KEYS.DESCRIPTION);
    const savedTags = localStorage.getItem(LOCAL_STORAGE_KEYS.TAGS);
    
    if (savedTitle) setTitle(savedTitle);
    if (savedContent && editor) editor.commands.setContent(savedContent);
    if (savedCoverWalrusUrl) {
      setCoverImageWalrusUrl(savedCoverWalrusUrl);
      setCoverPreviewUrl(savedCoverWalrusUrl);
    }
    if (tipShown === 'true') setShowSlashTip(false);
    if (savedDescription) setDescription(savedDescription);
    if (savedTags) setTags(JSON.parse(savedTags));
    
    if (editor) calculateReadingStats();
  }, [editor, calculateReadingStats]);

  // Auto-save title
  useEffect(() => {
    if (title) {
      localStorage.setItem(LOCAL_STORAGE_KEYS.TITLE, title);
      setLastSaved(new Date());
    }
  }, [title]);
  
  // Auto-save description
  useEffect(() => {
    if (description) {
      localStorage.setItem(LOCAL_STORAGE_KEYS.DESCRIPTION, description);
      setLastSaved(new Date());
    }
  }, [description]);
  
  // Auto-save tags
  useEffect(() => {
    if (tags.length > 0) {
      localStorage.setItem(LOCAL_STORAGE_KEYS.TAGS, JSON.stringify(tags));
      setLastSaved(new Date());
    }
  }, [tags]);

  // Auto-save cover Walrus URL
  useEffect(() => {
    if (coverImageWalrusUrl) {
      localStorage.setItem(LOCAL_STORAGE_KEYS.COVER_WALRUS_URL, coverImageWalrusUrl);
      setLastSaved(new Date());
    }
  }, [coverImageWalrusUrl]);

  // Handle cover image selection
  const handleCoverUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    console.log('[CreateTalePage] handleCoverUpload (file selection) triggered!');
    const file = event.target.files?.[0];
    if (file) {
      console.log('[CreateTalePage] File selected for cover:', file.name);
      setCoverImageFile(file);

      // Show local preview immediately
      const reader = new FileReader();
      reader.onloadend = () => {
        setCoverPreviewUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
      
      // Clear any old Walrus URL since a new file is selected
      setCoverImageWalrusUrl(''); 
      setLastSaved(new Date());
    } else {
      setCoverImageFile(null);
      const savedWalrusUrl = localStorage.getItem(LOCAL_STORAGE_KEYS.COVER_WALRUS_URL);
      setCoverPreviewUrl(savedWalrusUrl || ''); 
    }
  };

  // Toggle preview dialog
  const togglePreview = () => {
    setPreviewOpen(!previewOpen);
  };
  
  // Toggle metadata panel
  const toggleMetadata = () => {
    setMetadataOpen(!metadataOpen);
  };
  
  // Update tags
  const handleTagsChange = (newTags: string[]) => {
    setTags(newTags);
  };

  // CLIENT-SIDE WALRUS FUNCTIONS
  
  const handleEstimation = async () => {
    // Validation
    if (!currentAccount?.address) {
      enqueueSnackbar('Wallet not connected.', { variant: 'warning' });
      return;
    }
    if (!title.trim()) {
      enqueueSnackbar('Title cannot be empty.', { variant: 'error' });
      return;
    }
    
    // More robust content validation
    const contentText = editor?.getText().trim() || '';
    const cleanedHtml = editor?.getHTML().replace(/<!--.*?-->/gs, '').trim();
    
    if (!contentText || contentText.length === 0 || !cleanedHtml || cleanedHtml === '<p></p>' || cleanedHtml === '<p></p>'.trim()) {
      enqueueSnackbar('Content cannot be empty. Please write some content for your tale.', { variant: 'error' });
      return;
    }
    
    // Check if content has at least some meaningful text (not just spaces/newlines)
    if (contentText.length < 10) {
      enqueueSnackbar('Content is too short. Please write at least 10 characters.', { variant: 'error' });
      return;
    }
    
    if (!coverImageFile) {
      enqueueSnackbar('Please select a cover image.', { variant: 'error' });
      return;
    }

    try {
      setClientSideCostData(null);
      setShowCostEstimation(true);

      // Estimate costs using client-side Walrus
      const costData = await estimateWalrusCost({
        content: cleanedHtml,
        coverImage: coverImageFile
      });

      // Adapt the cost data format for CostEstimationModal
      const adaptedCostData = {
        costs: {
          contentStorage: costData.costs.contentStorage,
          coverStorage: costData.costs.coverStorage,
          registrationGas: {
            sui: costData.costs.estimatedGas.sui / 2, // Split gas estimate
            mist: (Number(costData.costs.estimatedGas.mist) / 2).toString()
          },
          certificationGas: {
            sui: costData.costs.estimatedGas.sui / 4, // Quarter for certification
            mist: (Number(costData.costs.estimatedGas.mist) / 4).toString()
          },
          nftCreationGas: {
            sui: costData.costs.estimatedGas.sui / 4, // Quarter for NFT
            mist: (Number(costData.costs.estimatedGas.mist) / 4).toString()
          },
          total: {
            walTokens: costData.costs.total.walTokens,
            suiTokens: costData.costs.total.suiTokens,
            walMist: (Number(costData.costs.contentStorage.mist) + Number(costData.costs.coverStorage.mist)).toString(),
            suiMist: costData.costs.estimatedGas.mist
          }
        }
      };

      setClientSideCostData(adaptedCostData);
      enqueueSnackbar('Cost estimate ready! Review and confirm to proceed.', { variant: 'success' });
    } catch (error: any) {
      console.error('[CreateTalePage] Error estimating costs:', error);
      enqueueSnackbar(`Failed to estimate costs: ${error.message}`, { variant: 'error' });
      setShowCostEstimation(false);
    }
  };

  const handlePublish = async () => {
    if (!clientSideCostData || !currentAccount?.address || !coverImageFile) {
      return;
    }

    try {
      setIsPublishing(true);
      setUploadProgress({ step: 'Starting upload...', progress: 0 });
      
      const cleanedHtml = editor?.getHTML().replace(/<!--.*?-->/gs, '').trim() || '';

      // Step 1: Upload to Walrus (registration + certification transactions)
      const walrusResult = await walrusUpload({
        content: cleanedHtml,
        coverImage: coverImageFile,
        userAddress: currentAccount.address,
        signAndExecuteTransaction: ({ transaction }) =>
          new Promise((resolve, reject) => {
            signAndExecuteTransaction(
              { transaction },
              {
                onSuccess: resolve,
                onError: reject
              }
            );
          }),
        onProgress: (step: string, progress: number) => {
          setUploadProgress({ step, progress });
        }
      });

      setUploadProgress({ step: 'Creating NFT...', progress: 90 });

      // Step 2: Create Tale NFT
      const nftResult = await createTaleNFT({
        contentBlobId: walrusResult.contentBlobId,
        coverBlobId: walrusResult.coverBlobId,
        title,
        description: description || title,
        mintPrice: parseInt(mintPrice) / 1_000_000_000, // Convert MIST to SUI
        mintCapacity: parseInt(mintCapacity),
        royaltyFeeBps,
        userAddress: currentAccount.address,
        signAndExecuteTransaction: ({ transaction }) =>
          new Promise((resolve, reject) => {
            signAndExecuteTransaction(
              { transaction },
              {
                onSuccess: resolve,
                onError: reject
              }
            );
          })
      });

      setUploadProgress({ step: 'Saving to database...', progress: 95 });

      // Step 3: Wait for transaction to be indexed before saving to database
      console.log('[CreateTalePage] Waiting for transaction to be indexed...');
      await new Promise(resolve => setTimeout(resolve, 3000)); // Wait 3 seconds for indexing

      // Step 4: Save tale to database via API with retry logic
      let dbSaveSuccess = false;
      let retryCount = 0;
      const maxRetries = 3;
      const retryDelay = 2000; // 2 seconds

      while (!dbSaveSuccess && retryCount < maxRetries) {
        try {
          retryCount++;
          setUploadProgress({ 
            step: `Saving to database... (attempt ${retryCount}/${maxRetries})`, 
            progress: 95 + (retryCount * 1) 
          });

          // Add delay for first retry to allow transaction indexing
          if (retryCount > 1) {
            console.log(`[CreateTalePage] Waiting ${retryDelay}ms before database save retry...`);
            await new Promise(resolve => setTimeout(resolve, retryDelay));
          }

          const taleRecord = await talesApi.recordPublication({
            txDigest: nftResult.digest,
            taleDataForRecord: {
              title,
              description: description || title,
              contentBlobId: walrusResult.contentBlobId,
              coverBlobId: walrusResult.coverBlobId,
              coverImageUrl: walrusService.getWalrusUrl(walrusResult.coverBlobId),
              tags: tags,
              wordCount: wordCount || 0,
              readingTime: readingTime || 1,
              authorId: currentAccount.address,
              mintPrice: parseInt(mintPrice),
              mintCapacity: parseInt(mintCapacity),
              royaltyFeeBps,
            },
          });
          
          console.log('[CreateTalePage] Tale saved to database:', taleRecord.id);
          dbSaveSuccess = true;
        } catch (dbError: any) {
          console.warn(`[CreateTalePage] Database save attempt ${retryCount} failed:`, dbError);
          
          // Don't retry on non-retryable errors
          if (dbError.message?.includes('validation') || 
              dbError.message?.includes('Invalid') ||
              retryCount >= maxRetries) {
            console.error('[CreateTalePage] Database save failed permanently (NFT created successfully):', dbError);
            
            // Show user-friendly message about the issue
            enqueueSnackbar(
              'NFT created successfully, but database save failed. ' +
              'Your tale is published on blockchain but may not appear in the list immediately. ' +
              'Please contact support if needed.',
              { variant: 'warning', persist: true }
            );
            break;
          }
        }
      }

      if (!dbSaveSuccess) {
        console.error('[CreateTalePage] All database save attempts failed, but NFT was created successfully');
      }

      setUploadProgress({ step: 'Publication completed!', progress: 100 });

      // Show success message with appropriate context
      const successMessage = dbSaveSuccess 
        ? `🎉 Tale "${title}" published successfully!\n📋 Walrus: ${formatDigest(walrusResult.contentBlobId)}\n🎨 NFT: ${formatDigest(nftResult.digest)}\n💾 Database: Saved`
        : `🎉 Tale "${title}" published to blockchain!\n📋 Walrus: ${formatDigest(walrusResult.contentBlobId)}\n🎨 NFT: ${formatDigest(nftResult.digest)}\n⚠️ Database: Save pending (may appear in list later)`;

      enqueueSnackbar(
        successMessage,
        { variant: dbSaveSuccess ? 'success' : 'warning', persist: true, style: { whiteSpace: 'pre-line' } }
      );

      // Clear form
      setShowCostEstimation(false);
      setClientSideCostData(null);
      setUploadProgress(null);
      
      // Clear form fields
      localStorage.removeItem(LOCAL_STORAGE_KEYS.TITLE);
      localStorage.removeItem(LOCAL_STORAGE_KEYS.CONTENT);
      localStorage.removeItem(LOCAL_STORAGE_KEYS.COVER_WALRUS_URL);
      localStorage.removeItem(LOCAL_STORAGE_KEYS.DESCRIPTION);
      localStorage.removeItem(LOCAL_STORAGE_KEYS.TAGS);
      
      editor?.commands.setContent('');
      setTitle('');
      setDescription('');
      setCoverImageWalrusUrl('');
      setCoverPreviewUrl('');
      setTags([]);
      setCoverImageFile(null);

    } catch (error: any) {
      console.error('[CreateTalePage] Error in publication:', error);
      
      // Handle user rejection separately
      if (error.message.includes('cancelled by user') || error.message.includes('User rejection')) {
        enqueueSnackbar('Publication cancelled by user', { variant: 'warning' });
      } else if (error.message.includes('signing failed')) {
        enqueueSnackbar('Transaction signing failed. Please check your wallet and try again.', { variant: 'error' });
      } else {
        enqueueSnackbar(`Publication failed: ${error.message}`, { variant: 'error' });
      }
      
      setUploadProgress(null);
    } finally {
      setIsPublishing(false);
    }
  };

  if (!editor) return null;

  return (
    <Box sx={editorContainerStyles as SxProps<Theme>}>
      <EditorHeader 
        isSaving={isPublishing || isEstimatingCost || isWalrusUploading || isCreatingNFT}
        isUploadingCover={false}
        lastSaved={lastSaved}
        onTogglePreview={togglePreview}
        wordCount={wordCount}
        readingTime={readingTime}
        onToggleMetadata={toggleMetadata}
        onSave={handleEstimation}
      />
      
      <Box sx={{ 
        width: '100%', 
        maxWidth: 'calc(800px + 64px)',
        mx: 'auto',
        px: { xs: 2, sm: 4 },
        mt: 3, 
        mb: 3 
      }}>
        <CoverImageUpload 
          coverImage={coverPreviewUrl}
          onCoverUpload={handleCoverUpload}
          isUploading={false}
        />
      </Box>

      <Box sx={editorContentStyles as SxProps<Theme>}>
        <TextField
          placeholder="Tale Title..."
          variant="standard" 
          fullWidth
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          sx={titleInputStyles as SxProps<Theme>}
          InputProps={{ disableUnderline: true }} 
        />
        {editor && (
          <Box sx={{ position: 'relative' }}>
            <Box sx={tipTapEditorStyles as SxProps<Theme>}>
              <EditorContent editor={editor} />
            </Box>
            
            <Box sx={bottomToolbarStyles as SxProps<Theme>}>
              <EditorToolbar editor={editor} />
            </Box>
            
            {showSlashTip && <SlashTip show={showSlashTip} />}
          </Box>
        )}
      </Box>
      
      <MetadataPanel
        open={metadataOpen}
        onClose={toggleMetadata}
        description={description}
        onDescriptionChange={(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => setDescription(e.target.value)}
        tags={tags}
        onTagsChange={handleTagsChange}
        suggestedTags={SUGGESTED_TAGS}
        mintPrice={mintPrice}
        onMintPriceChange={(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => setMintPrice(e.target.value)}
        mintCapacity={mintCapacity}
        onMintCapacityChange={(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => setMintCapacity(e.target.value)}
        royaltyFeeBps={royaltyFeeBps}
        onRoyaltyFeeBpsChange={(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => setRoyaltyFeeBps(Number(e.target.value))}
      />
      
      <PreviewDialog 
        open={previewOpen} 
        onClose={togglePreview} 
        title={title} 
        content={editor?.getHTML() || ''} 
        coverImage={coverImageWalrusUrl || coverPreviewUrl}
        description={description}
        tags={tags}
        wordCount={wordCount}
        readingTime={readingTime}
      />

      <CostEstimationModal
        open={showCostEstimation}
        onClose={() => setShowCostEstimation(false)}
        onConfirm={handlePublish}
        costData={clientSideCostData}
        loading={isEstimatingCost || isWalrusUploading || isCreatingNFT}
        title={title}
        contentSize={editor?.getText().length || 0}
        coverImageSize={coverImageFile?.size || 0}
      />
    </Box>
  );
};

export default CreateTalePage; 