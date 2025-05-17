import React, { useState, useEffect, useCallback } from 'react';
import { Box, TextField } from '@mui/material';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import Link from '@tiptap/extension-link';
import Image from '@tiptap/extension-image';
import { 
  NodeMenu, 
  SlashCommands, 
  FormattingMenu, 
  EditorToolbar, 
  CoverImageUpload,
  MetadataPanel,
  MetadataToggle,
  PreviewDialog,
  EditorHeader,
  SlashTip,
  SlashCommandsMenu
} from '../../components/TaleEditor';
import 'tippy.js/dist/tippy.css';
import { 
  editorContainerStyles, 
  editorContentStyles, 
  titleInputStyles, 
  bottomToolbarStyles,
  tipTapEditorStyles
} from '../../styles/TaleEditor.styles';
import { useCreateTale, useInitiatePublication } from '../../hooks/useTales';
import { useUploadCoverToWalrus } from '../../hooks/useFiles';
import { useSnackbar } from 'notistack';
import { useSignPersonalMessage, useCurrentAccount } from '@mysten/dapp-kit';
import { FrontendInitiatePublicationDto, UploadCoverResponse } from '../../api/tales.api';

// Local storage keys
const LOCAL_STORAGE_KEYS = {
  TITLE: 'tale-editor-title',
  CONTENT: 'tale-editor-content',
  COVER: 'tale-editor-cover',
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
  const [isSaving, setIsSaving] = useState<boolean>(false);
  
  // New state for cover image file and its preview URL
  const [coverImageFile, setCoverImageFile] = useState<File | null>(null);
  const [coverPreviewUrl, setCoverPreviewUrl] = useState<string>(''); // Used for <CoverImageUpload preview
  
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [showSlashTip, setShowSlashTip] = useState<boolean>(true);
  const [previewOpen, setPreviewOpen] = useState<boolean>(false);
  
  const [description, setDescription] = useState<string>('');
  const [tags, setTags] = useState<string[]>([]);
  const [metadataOpen, setMetadataOpen] = useState<boolean>(false);
  
  const [wordCount, setWordCount] = useState<number>(0);
  const [readingTime, setReadingTime] = useState<number>(0);

  // React Query hooks
  const { mutateAsync: createTale } = useCreateTale();
  const { mutateAsync: uploadCoverToWalrus, isPending: isUploadingCoverToWalrus } = useUploadCoverToWalrus();
  const { enqueueSnackbar } = useSnackbar();
  const { mutateAsync: signPersonalMessage } = useSignPersonalMessage();
  const { mutateAsync: initiatePublication, isPending: isPublishing } = useInitiatePublication();

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
    // const savedCoverUrl = localStorage.getItem(LOCAL_STORAGE_KEYS.COVER); // We don't store the file, maybe a URL if uploaded previously?
                                                                       // For simplicity, let's not reload cover from localStorage for now, user re-selects.
    const tipShown = localStorage.getItem(LOCAL_STORAGE_KEYS.SLASH_TIP_SHOWN);
    const savedDescription = localStorage.getItem(LOCAL_STORAGE_KEYS.DESCRIPTION);
    const savedTags = localStorage.getItem(LOCAL_STORAGE_KEYS.TAGS);
    
    if (savedTitle) setTitle(savedTitle);
    if (savedContent && editor) editor.commands.setContent(savedContent);
    // if (savedCoverUrl) setCoverPreviewUrl(savedCoverUrl); // If you want to restore a previously uploaded Walrus URL
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

  // Updated Handle cover image selection
  const handleCoverUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    console.log('[CreateTalePage] handleCoverUpload (file selection) triggered!');
    const file = event.target.files?.[0];
    if (file) {
      console.log('[CreateTalePage] File selected for cover:', file.name);
      setCoverImageFile(file); // Store the file object

      // Create a preview URL for the selected file
      const reader = new FileReader();
      reader.onloadend = () => {
        setCoverPreviewUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
      // No localStorage saving here, file is kept in state until publish
      setLastSaved(new Date()); // Indicate change
      enqueueSnackbar('Cover image selected. It will be uploaded on publication.', { variant: 'info' });
    } else {
      setCoverImageFile(null);
      setCoverPreviewUrl('');
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

  // BIG UPDATE: Handle save/publish with new cover upload flow
  const handleSave = async () => {
    if (!currentAccount || !currentAccount.publicKey) {
      enqueueSnackbar('Wallet not connected or missing public key.', { variant: 'warning' });
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

    const rawHtml = editor?.getHTML() || '';
    let cleanedHtml = rawHtml.replace(/<!--.*?-->/gs, '');
    const tagsToClean = ['p', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'div', 'blockquote', 'li'];
    let previousHtml;
    do {
        previousHtml = cleanedHtml;
        tagsToClean.forEach(tag => {
            const regex = new RegExp(`<${tag}[^>]*>\\s*<\\/${tag}>`, 'gi');
            cleanedHtml = cleanedHtml.replace(regex, '');
        });
        cleanedHtml = cleanedHtml.trim();
    } while (cleanedHtml !== previousHtml && cleanedHtml.length > 0);

    if (!cleanedHtml || cleanedHtml === '<p></p>') {
      enqueueSnackbar('Content cannot be empty.', { variant: 'error' });
      return;
    }

    setIsSaving(true); // Combined loading state for the entire process
    let finalCoverImageUrl: string | undefined = undefined;

    try {
      // Step 1: Upload cover image to Walrus if a new one is selected
      

      // Step 2: Sign message
      const userAddress = currentAccount.address;
      const messageToSign = String.raw `SuiTale content upload authorization for user ${userAddress}. Title: ${title}`;
      const messageBytes = new TextEncoder().encode(messageToSign);
      const signedMessageResult = await signPersonalMessage({ message: messageBytes });
      const bytesFromWallet = signedMessageResult.bytes;
      let signedMessageBytesForBackendB64: string = '';
      if (bytesFromWallet && typeof bytesFromWallet !== 'string') {
          const rawBytesToEncode = bytesFromWallet as Uint8Array;
          signedMessageBytesForBackendB64 = Buffer.from(rawBytesToEncode).toString('base64');
      } else if (typeof bytesFromWallet === 'string') {
          signedMessageBytesForBackendB64 = bytesFromWallet;
      } 

      if (!signedMessageBytesForBackendB64) {
        console.error('Frontend: signedMessageBytesForBackendB64 is empty. Aborting submission.');
        enqueueSnackbar('Failed to prepare signed message for backend. Please try again.', { variant: 'error' });
        setIsSaving(false);
        return;
      }
      const publicKeyBytes = currentAccount.publicKey;
      
      let signatureScheme = 'unknown';
      if (currentAccount && currentAccount.chains && currentAccount.chains.length > 0) {
          const chainParts = currentAccount.chains[0].split(':');
          if (chainParts.length > 1) {
              signatureScheme = chainParts[1]; // e.g., 'ed25519' or 'secp256k1'
          }
      }
      // Дополнительно можно попытаться извлечь из signedMessageResult, если первый способ не сработал,
      // но обычно информация из currentAccount.chains более стабильна для определения типа ключа аккаунта.
      if (signatureScheme === 'unknown' && (signedMessageResult as any)?.signatureScheme) {
         signatureScheme = (signedMessageResult as any).signatureScheme;
      }

      if (signatureScheme === 'unknown') {
        console.warn('CreateTalePage.tsx: Signature scheme could not be determined. Backend verification might be affected.');
      }

      if (coverImageFile) {
        enqueueSnackbar('Uploading cover image to Walrus...', { variant: 'info' });
        try {
          const uploadResponse = await uploadCoverToWalrus(coverImageFile);
          finalCoverImageUrl = uploadResponse.url;
          enqueueSnackbar('Cover image uploaded to Walrus successfully!', { variant: 'success' });
          if (finalCoverImageUrl) {
            localStorage.setItem(LOCAL_STORAGE_KEYS.COVER, finalCoverImageUrl); // Save the final Walrus URL
          }
        } catch (uploadError) {
          console.error('Error uploading cover image to Walrus during save process:', uploadError);
          const errorMsg = uploadError instanceof Error ? uploadError.message : 'Cover upload failed';
          enqueueSnackbar(`Failed to upload cover to Walrus: ${errorMsg}. Publication aborted.`, { variant: 'error' });
          setIsSaving(false);
          return;
        }
      } else {
        // If no new file, check if there's a previously uploaded Walrus URL in localStorage (optional)
        // finalCoverImageUrl = localStorage.getItem(LOCAL_STORAGE_KEYS.COVER) || undefined;
        // For simplicity now, if no new file, no cover image is sent unless you explicitly load it from LS.
      }

            // Step 3: Prepare DTO and initiate publication
      const taleDataForBackend: FrontendInitiatePublicationDto = {
        title: title.trim(),
        description: description.trim(),
        content: cleanedHtml,
        coverImageWalrusUrl: finalCoverImageUrl, // Use the URL from Walrus upload (or undefined)
        tags: tags.length > 0 ? tags : undefined,
        wordCount,
        readingTime,
        userAddress,
        signature_base64: signedMessageResult.signature,
        signedMessageBytes_base64: signedMessageBytesForBackendB64,
        publicKey_base64: Buffer.from(publicKeyBytes).toString('base64'),
        signatureScheme,
        // Optional NFT params can be added here if UI exists for them
      };

      console.log('CreateTalePage.tsx: Submitting to initiatePublication:', taleDataForBackend);
      

      const result = await initiatePublication(taleDataForBackend);
      console.log('Backend response (initiatePublication):', result);
      enqueueSnackbar('Tale submitted successfully! Processing publication.', { variant: 'success' });

      // Clear form and relevant local storage on success
      localStorage.removeItem(LOCAL_STORAGE_KEYS.TITLE);
      localStorage.removeItem(LOCAL_STORAGE_KEYS.CONTENT);
      localStorage.removeItem(LOCAL_STORAGE_KEYS.COVER); // Remove cover as it's now part of published content
      localStorage.removeItem(LOCAL_STORAGE_KEYS.DESCRIPTION);
      localStorage.removeItem(LOCAL_STORAGE_KEYS.TAGS);
      editor?.commands.setContent('');
      setTitle('');
      setDescription('');
      setCoverImageFile(null); // Clear selected file
      setCoverPreviewUrl('');   // Clear preview
      setTags([]);
      setWordCount(0);
      setReadingTime(0);

    } catch (error) {
      console.error('Error during save/publish process:', error);
      const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred.';
      enqueueSnackbar(`Failed to publish: ${errorMessage}`, { variant: 'error' });
    } finally {
      setIsSaving(false);
    }
  };

  if (!editor) return null;

  return (
    <Box sx={editorContainerStyles}>
      {/* Formatting menu that appears when text is selected */}
      <FormattingMenu editor={editor} />

      {/* Header */}
      <EditorHeader 
        wordCount={wordCount}
        readingTime={readingTime}
        lastSaved={lastSaved}
        isSaving={isPublishing || isUploadingCoverToWalrus}
        onTogglePreview={togglePreview}
        onToggleMetadata={toggleMetadata}
        onSave={handleSave}
      />
      
      {/* Editor */}
      <Box sx={editorContentStyles}>
        {/* Cover Image */}
        <CoverImageUpload 
          coverImage={coverPreviewUrl}
          onCoverUpload={handleCoverUpload}
          isUploading={isUploadingCoverToWalrus}
        />

        {/* Title input - borderless, large size */}
        <TextField
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Title"
          fullWidth
          variant="standard"
          sx={titleInputStyles}
          inputProps={{
            style: { caretColor: '#9c4dff' }
          }}
        />
        
        {/* Metadata panel */}
        <MetadataPanel 
          description={description}
          tags={tags}
          suggestedTags={SUGGESTED_TAGS}
          open={metadataOpen}
          onDescriptionChange={(e) => setDescription(e.target.value)}
          onTagsChange={handleTagsChange}
          onClose={toggleMetadata}
        />
        
        {/* Metadata toggle when closed */}
        {!metadataOpen && (
          <MetadataToggle onClick={toggleMetadata} />
        )}

        {/* Block menu for adding new content sections */}
        <NodeMenu editor={editor} />

        {/* Slash command hint - only show if not used before */}
        <SlashTip show={showSlashTip} />

        {/* Tiptap editor */}
        <Box sx={tipTapEditorStyles}>
          <EditorContent editor={editor} />
        </Box>
      </Box>

      {/* Bottom toolbar */}
      <Box sx={bottomToolbarStyles}>
        <EditorToolbar editor={editor} />
      </Box>

      {/* Preview Dialog */}
      <PreviewDialog 
        open={previewOpen}
        onClose={togglePreview}
        title={title}
        content={editor.getHTML()}
        coverImage={coverPreviewUrl}
        description={description}
        tags={tags}
        wordCount={wordCount}
        readingTime={readingTime}
      />
    </Box>
  );
};

export default CreateTalePage; 