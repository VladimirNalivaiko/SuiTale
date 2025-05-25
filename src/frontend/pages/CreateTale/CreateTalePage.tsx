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
  SlashCommands,
  CostBreakdown
} from '../../components/TaleEditor';
import 'tippy.js/dist/tippy.css';
import { 
  editorContainerStyles, 
  editorContentStyles, 
  titleInputStyles, 
  bottomToolbarStyles,
  tipTapEditorStyles
} from '../../styles/TaleEditor.styles';
import { 
  usePreparePublication,
  useRecordPublication,
  usePrepareBatchPublication,
  useRecordBatchPublication
} from '../../hooks/useTales';
import { useUploadCoverToWalrus } from '../../hooks/useFiles';
import { useSnackbar } from 'notistack';
import { useSignPersonalMessage, useCurrentAccount, useSignAndExecuteTransaction } from '@mysten/dapp-kit';
import { 
  FrontendInitiatePublicationDto, 
  PreparePublicationResultDto, 
  RecordPublicationDto,
  BatchPublicationRequest,
  BatchPublicationResponse 
} from '../../api/tales.api';
import { Transaction } from '@mysten/sui/transactions';
import { Buffer } from 'buffer';

// Local storage keys
const LOCAL_STORAGE_KEYS = {
  TITLE: 'tale-editor-title',
  CONTENT: 'tale-editor-content',
  COVER_WALRUS_URL: 'tale-editor-cover-walrus-url',
  SLASH_TIP_SHOWN: 'tale-editor-slash-tip-shown',
  DESCRIPTION: 'tale-editor-description',
  TAGS: 'tale-editor-tags'
};

// Popular tags for autocpmplete
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

  // Minting details (example values, can be form inputs)
  const [mintPrice, setMintPrice] = useState<string>('100000000'); // 0.1 SUI in MIST
  const [mintCapacity, setMintCapacity] = useState<string>('100');
  const [royaltyFeeBps, setRoyaltyFeeBps] = useState<number>(500); // 5%

  // --- NEW: Batch Upload State ---
  const [showCostBreakdown, setShowCostBreakdown] = useState<boolean>(false);
  const [batchCostData, setBatchCostData] = useState<BatchPublicationResponse | null>(null);
  const [useBatchUpload, setUseBatchUpload] = useState<boolean>(true); // Toggle for batch vs legacy

  // React Query hooks & Dapp-kit hooks
  const { mutateAsync: uploadCoverToWalrus, isPending: isUploadingCover } = useUploadCoverToWalrus();
  const { enqueueSnackbar } = useSnackbar();
  const { mutateAsync: signPersonalMessage } = useSignPersonalMessage();
  const { mutate: signAndExecuteTransaction } = useSignAndExecuteTransaction();
  const { mutateAsync: preparePublicationMutate, isPending: isPreparingPublication } = usePreparePublication();
  const { mutateAsync: recordPublicationMutate, isPending: isRecordingPublication } = useRecordPublication();

  // --- NEW: Batch Upload Hooks ---
  const { mutateAsync: prepareBatchPublicationMutate, isPending: isPreparingBatch } = usePrepareBatchPublication();
  const { mutateAsync: recordBatchPublicationMutate, isPending: isRecordingBatch } = useRecordBatchPublication();

  // Handle key press for hiding slash tip
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key === '/') {
      setShowSlashTip(false);
      localStorage.setItem(LOCAL_STORAGE_KEYS.SLASH_TIP_SHOWN, 'true');
    }
  }, []);

  // Add global keyboard listener
  useEffect(() => {
    // Only add the listener if we're still showing the tip
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

  // Updated Handle cover image selection
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
      
      // Clear any old Walrus URL since a new file is selected and not yet uploaded.
      // The actual upload will happen in handlePublish.
      setCoverImageWalrusUrl(''); 
      setLastSaved(new Date());
    } else {
      // If no file is selected (e.g., user cancels file dialog)
      // Behavior might depend on whether there was a file selected before or a walrus URL
      // For now, if user cancels, we clear the potential new file and its preview
      setCoverImageFile(null);
      // If there was a coverImageWalrusUrl (from previous save/load), coverPreviewUrl should revert to it
      // If not, then clear preview. This logic can be refined based on desired UX.
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

  // --- NEW: Batch Upload Functions ---
  
  const handlePrepareBatchUpload = async () => {
    // Validation - только критические поля для блокчейна
    if (!currentAccount?.address) {
      enqueueSnackbar('Wallet not connected.', { variant: 'warning' });
      return;
    }
    if (!title.trim()) {
      enqueueSnackbar('Title cannot be empty.', { variant: 'error' });
      return;
    }
    const cleanedHtml = editor?.getHTML().replace(/<!--.*?-->/gs, '').trim();
    if (!cleanedHtml || cleanedHtml === '<p></p>') {
      enqueueSnackbar('Content cannot be empty.', { variant: 'error' });
      return;
    }
    if (!coverImageFile) {
      enqueueSnackbar('Please select a cover image.', { variant: 'error' });
      return;
    }

    try {
      setBatchCostData(null);
      setShowCostBreakdown(true);

      const batchRequest: BatchPublicationRequest = {
        title,
        description: description || '',
        content: cleanedHtml,
        tags: tags || [],
        wordCount: wordCount || 0,
        readingTime: readingTime || 1,
        userAddress: currentAccount.address,
      };

      const result = await prepareBatchPublicationMutate({
        coverImage: coverImageFile,
        data: batchRequest,
      });

      setBatchCostData(result);
      enqueueSnackbar('Cost estimate ready! Review and confirm to publish.', { variant: 'success' });
    } catch (error: any) {
      console.error('[CreateTalePage] Error preparing batch upload:', error);
      enqueueSnackbar(`Failed to calculate costs: ${error.message}`, { variant: 'error' });
      setShowCostBreakdown(false);
    }
  };

  const handleConfirmBatchUpload = async () => {
    if (!batchCostData || !currentAccount?.address) {
      return;
    }

    try {
      enqueueSnackbar('Please sign the transaction in your wallet...', { variant: 'info', persist: true });

      // Show detailed transaction info
      enqueueSnackbar(
        `🔖 Publishing "${title}"\n` +
        `📷 Cover Image → Walrus Storage\n` +
        `📝 Content → Walrus Storage\n` +
        `💰 Total: ${batchCostData.costs.total.walTokens.toFixed(4)} WAL + ${batchCostData.costs.total.suiTokens.toFixed(4)} SUI`,
        { variant: 'info', persist: true, style: { whiteSpace: 'pre-line' } }
      );

      // Create transaction from batch data
      const txb = Transaction.from(batchCostData.transaction);
      
      // Add transaction description for wallet UI
      txb.setSender(currentAccount.address);
      
      // Add summary for wallet display
      const txSummary = `Publish "${title}" tale with cover image and content to Walrus storage`;
      // Note: setSummary might not be available in current version, so we'll use options instead
      
      const currentChainValue = currentAccount.chains[0];

      signAndExecuteTransaction(
        {
          transaction: txb,
          chain: currentChainValue as any,
        },
        {
          onSuccess: async (result: { digest: string; [key: string]: any }) => {
            enqueueSnackbar('Transaction successful! Recording publication...', { variant: 'info' });

            try {
              // Record batch publication
              const recordPayload = {
                suiTransactionDigest: result.digest,
                coverBlobId: batchCostData.metadata.coverBlobId,
                contentBlobId: batchCostData.metadata.contentBlobId,
                title,
                description,
                tags,
                wordCount,
                readingTime,
                userAddress: currentAccount.address,
              };

              const finalTale = await recordBatchPublicationMutate(recordPayload);

              enqueueSnackbar(`Tale "${finalTale.title}" published successfully!`, { variant: 'success' });

              // Clear form and close dialog
              setShowCostBreakdown(false);
              setBatchCostData(null);
              
              // Clear localStorage and form
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
              
            } catch (recordError: any) {
              console.error('[CreateTalePage] Error recording batch publication:', recordError);
              enqueueSnackbar(`Publication recorded on blockchain but database update failed: ${recordError.message}. Digest: ${result.digest}`, 
                { variant: 'warning', persist: true });
            }
          },
          onError: (error: Error | any) => {
            console.error('[CreateTalePage] Error signing batch transaction:', error);
            enqueueSnackbar(`Transaction failed: ${error.message}`, { variant: 'error' });
          }
        }
      );
    } catch (error: any) {
      console.error('[CreateTalePage] Error in batch upload confirmation:', error);
      enqueueSnackbar(`Publication error: ${error.message}`, { variant: 'error' });
    }
  };

  const handlePublish = async () => {
    // Initial validations (wallet, title, description, content)
    if (!currentAccount || !currentAccount.publicKey || !currentAccount.address || !currentAccount.chains || currentAccount.chains.length === 0) {
      enqueueSnackbar('Wallet not connected or critical account information missing.', { variant: 'warning' });
      return;
    }
    if (!title.trim()) {
      enqueueSnackbar('Title cannot be empty.', { variant: 'error' });
      return;
    }
    if (!description.trim()) {
      enqueueSnackbar('Description cannot be empty.', { variant: 'error' });
      return;
    }
    const cleanedHtml = editor?.getHTML().replace(/<!--.*?-->/gs, '').trim(); // Simplified cleaning for example
    if (!cleanedHtml || cleanedHtml === '<p></p>') {
        enqueueSnackbar('Content cannot be empty.', { variant: 'error' });
        return;
    }

    // Crucial check: Ensure a cover image is either already uploaded or a new one is selected
    if (!coverImageFile && !coverImageWalrusUrl) {
        enqueueSnackbar('Please select or upload a cover image.', { variant: 'error' });
        return;
    }

    setIsPublishing(true);
    enqueueSnackbar('Preparing publication...', { variant: 'info' });

    try {
      // 1. User signs authorization message for the backend
      const messageToSign = `SuiTale content upload authorization for user ${currentAccount.address}. Title: ${title}`;
      const messageBytes = new TextEncoder().encode(messageToSign);
      const signedMessageResult = await signPersonalMessage({ message: messageBytes });
      
      const publicKeyBytes = currentAccount.publicKey;
      let publicKeyBase64: string;
      if (publicKeyBytes && typeof (publicKeyBytes as any).BYTES_PER_ELEMENT === 'number') {
        publicKeyBase64 = Buffer.from(publicKeyBytes as Uint8Array).toString('base64');
      } else {
        enqueueSnackbar('Invalid public key format.', {variant: 'error'});
        setIsPublishing(false);
        return;
      }
      
      let signatureScheme = 'sui';
      if (currentAccount.chains && currentAccount.chains.length > 0) {
        signatureScheme = currentAccount.chains[0].split(':')[0] || 'sui';
      }

      // 2. Prepare publication (backend builds transaction, NO cover upload yet)
      // coverImageWalrusUrl is omitted here or passed as undefined if a new file is pending
      // It will be finalized in taleDataForRecord before calling recordPublication
      const preparePayload: FrontendInitiatePublicationDto = {
        title,
        description,
        content: cleanedHtml,
        coverImageWalrusUrl: coverImageFile ? undefined : coverImageWalrusUrl, // Pass existing URL only if no new file
        tags,
        wordCount,
        readingTime,
        userAddress: currentAccount.address,
        signature_base64: signedMessageResult.signature,
        signedMessageBytes_base64: Buffer.from(messageBytes).toString('base64'),
        publicKey_base64: publicKeyBase64,
        signatureScheme: signatureScheme,
        mintPrice: mintPrice,
        mintCapacity: mintCapacity,
        royaltyFeeBps,
      };

      const prepareResult = await preparePublicationMutate(preparePayload);
      if (!prepareResult || !prepareResult.transactionBlockBytes || !prepareResult.taleDataForRecord) {
        enqueueSnackbar('Failed to prepare publication: Invalid response from server.', { variant: 'error' });
        setIsPublishing(false);
        return;
      }
      
      let { transactionBlockBytes, taleDataForRecord } = prepareResult; // taleDataForRecord might miss cover url if new file

      enqueueSnackbar('Please sign the transaction in your wallet to publish your tale.', { variant: 'info', persist: true });

      // 3. User signs and executes the batch transaction 
      enqueueSnackbar(`Sign transaction to publish "${title}" with cover image and content in one batch operation.`, { variant: 'info', persist: true });
      
      const txb = Transaction.from(transactionBlockBytes);
      const currentChainValue = currentAccount.chains[0];
      
      signAndExecuteTransaction(
        {
          transaction: txb,
          chain: currentChainValue as any,
        },
        {
          onSuccess: async (result: { digest: string; [key: string]: any }) => {
            enqueueSnackbar('Transaction submitted! Processing...', { variant: 'info', persist: true });
            
            let finalCoverImageUrlForRecord = taleDataForRecord.coverImageWalrusUrl; // From prepareResult initially
            let mutableTaleDataForRecord = { ...taleDataForRecord }; // Make a mutable copy

            // 4. If blockchain TX is successful, upload cover if a new one was selected
            if (coverImageFile) {
              enqueueSnackbar('Uploading cover image...', { variant: 'info' });
              try {
                const uploadResult = await uploadCoverToWalrus(coverImageFile);
                if (uploadResult && uploadResult.url) {
                  finalCoverImageUrlForRecord = uploadResult.url;
                  setCoverImageWalrusUrl(finalCoverImageUrlForRecord); // Update state for UI
                  localStorage.setItem(LOCAL_STORAGE_KEYS.COVER_WALRUS_URL, finalCoverImageUrlForRecord);
                  setCoverImageFile(null); // Clear the file object
                  enqueueSnackbar('Cover image uploaded successfully!', { variant: 'success' });
                } else {
                  throw new Error('Invalid response from cover upload server after transaction.');
                }
              } catch (uploadError: any) {
                console.error('[CreateTalePage] Error uploading cover to Walrus after transaction:', uploadError);
                enqueueSnackbar(`Error uploading cover post-transaction: ${uploadError.message || 'Unknown error'}. Please try again or contact support.`, { variant: 'error', persist: true });
                // Decide recovery path: Here, we might allow recording without a cover or with an old one if available
                // For now, if upload fails, we proceed with whatever finalCoverImageUrlForRecord holds (could be old or undefined)
                // This might lead to a tale without a new cover if upload failed.
                // A more robust solution would offer user to retry cover upload or cancel recording.
              }
            } else if (coverImageWalrusUrl) { // No new file, but an existing walrus URL from state (localStorage)
                finalCoverImageUrlForRecord = coverImageWalrusUrl;
            }

            // Ensure we have a cover URL before recording, critical for DB record
            if (!finalCoverImageUrlForRecord) {
                enqueueSnackbar('Cover image is missing after transaction and upload attempt. Cannot record publication.', { variant: 'error', persist: true });
                setIsPublishing(false); // Stop the process here
                return;
            }

            mutableTaleDataForRecord.coverImageWalrusUrl = finalCoverImageUrlForRecord;

            // 5. Record publication with backend
            try {
              enqueueSnackbar('Recording publication details...', {variant: 'info'});
              const recordPayload: RecordPublicationDto = { 
                txDigest: result.digest,
                taleDataForRecord: mutableTaleDataForRecord, // Use the potentially updated record
              };
              const finalTale = await recordPublicationMutate(recordPayload);
              
              enqueueSnackbar(`Tale "${finalTale.title}" published successfully! Digest: ${result.digest}`, { variant: 'success' });
              
              // Clear form and local storage
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
              setCoverImageFile(null); // Ensure file is cleared
            } catch (recordError: any) {
              console.error('[CreateTalePage] Error recording publication:', recordError);
              enqueueSnackbar(`Error recording publication: ${recordError.response?.data?.message || recordError.message || 'Unknown error'}. Your tale is on-chain but might not be listed. Digest: ${result.digest}`, { variant: 'error', persist: true });
            } finally {
              setIsPublishing(false); 
            }
          },
          onError: (error: Error | any) => {
            console.error('[CreateTalePage] Error signing/executing transaction:', error);
            const signErrMessage = error instanceof Error ? error.message : 'Transaction signing failed';
            enqueueSnackbar(`Transaction failed: ${signErrMessage}`, { variant: 'error' });
            setIsPublishing(false);
          }
        }
      );
    } catch (error: any) {
      console.error('[CreateTalePage] Error in handlePublish (outer try-catch): ', error);
      const genErrMessage = error instanceof Error ? error.message : 'Publication process failed';
      enqueueSnackbar(`Publication error: ${genErrMessage}`, { variant: 'error' });
      setIsPublishing(false);
    }
  };

  if (!editor) return null;

  return (
    <Box sx={editorContainerStyles as SxProps<Theme>}>
      <EditorHeader 
        isSaving={isPublishing || isUploadingCover || isPreparingBatch}
        isUploadingCover={isUploadingCover}
        lastSaved={lastSaved}
        onTogglePreview={togglePreview}
        wordCount={wordCount}
        readingTime={readingTime}
        onToggleMetadata={toggleMetadata}
        onSave={useBatchUpload ? handlePrepareBatchUpload : handlePublish}
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
          isUploading={isUploadingCover}
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

      <CostBreakdown
        open={showCostBreakdown}
        onClose={() => setShowCostBreakdown(false)}
        onConfirm={handleConfirmBatchUpload}
        costData={batchCostData}
        isLoading={isPreparingBatch}
        isConfirming={isRecordingBatch}
      />
    </Box>
  );
};

export default CreateTalePage; 