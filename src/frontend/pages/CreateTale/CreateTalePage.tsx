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
import { useCreateTale, useUploadCoverImage, useInitiatePublication } from '../../hooks/useTales';
import { useSnackbar } from 'notistack';
import { useSignPersonalMessage, useCurrentAccount } from '@mysten/dapp-kit';
import { FrontendInitiatePublicationDto } from '../../api/tales.api';

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
  const [coverImage, setCoverImage] = useState<string>('');
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [showSlashTip, setShowSlashTip] = useState<boolean>(true);
  const [previewOpen, setPreviewOpen] = useState<boolean>(false);
  const [isUploadingCover, setIsUploadingCover] = useState<boolean>(false);
  
  // States for metadata
  const [description, setDescription] = useState<string>('');
  const [tags, setTags] = useState<string[]>([]);
  const [metadataOpen, setMetadataOpen] = useState<boolean>(false);
  
  // Reading statistics
  const [wordCount, setWordCount] = useState<number>(0);
  const [readingTime, setReadingTime] = useState<number>(0);

  // React Query hooks
  const { mutateAsync: createTale } = useCreateTale();
  const { mutateAsync: uploadCover, isPending: isUploadingCoverMutation } = useUploadCoverImage();
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
    const savedCover = localStorage.getItem(LOCAL_STORAGE_KEYS.COVER);
    const tipShown = localStorage.getItem(LOCAL_STORAGE_KEYS.SLASH_TIP_SHOWN);
    const savedDescription = localStorage.getItem(LOCAL_STORAGE_KEYS.DESCRIPTION);
    const savedTags = localStorage.getItem(LOCAL_STORAGE_KEYS.TAGS);
    
    if (savedTitle) setTitle(savedTitle);
    if (savedContent && editor) editor.commands.setContent(savedContent);
    if (savedCover) setCoverImage(savedCover);
    if (tipShown === 'true') setShowSlashTip(false);
    if (savedDescription) setDescription(savedDescription);
    if (savedTags) setTags(JSON.parse(savedTags));
    
    // Calculate initial reading stats
    if (editor) {
      calculateReadingStats();
    }
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

  // Handle cover image upload
  const handleCoverUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setIsUploadingCover(true);
      try {
        const uploadResponse = await uploadCover(file);
        const serverCoverImageUrl = uploadResponse.coverImage;

        setCoverImage(serverCoverImageUrl);
        localStorage.setItem(LOCAL_STORAGE_KEYS.COVER, serverCoverImageUrl);
        setLastSaved(new Date());
        enqueueSnackbar('Cover image uploaded successfully!', { variant: 'success' });

      } catch (error) {
        console.error('Error uploading cover image:', error);
        const errorMessage = error instanceof Error ? error.message : 'Unknown error during upload';
        enqueueSnackbar(`Failed to upload cover image: ${errorMessage}`, { variant: 'error' });
      } finally {
        setIsUploadingCover(false);
      }
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

  // Handle save/publish
  const handleSave = async () => {
    if (!currentAccount || !currentAccount.publicKey) {
      enqueueSnackbar('Wallet not connected or missing public key.', { variant: 'warning' });
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

    if (!title.trim()) {
      enqueueSnackbar('Title cannot be empty.', { variant: 'error' });
      return;
    }
    
    if (!description.trim()) {
        enqueueSnackbar('Description cannot be empty.', { variant: 'error' });
        return;
    }

    try {
      const messageToSign = `SuiTale content upload authorization for user ${currentAccount.address}. Title: ${title}`;
      const messageBytes = new TextEncoder().encode(messageToSign);

      const signedMessageResult = await signPersonalMessage({
        message: messageBytes,
      });
      const bytesFromWallet = signedMessageResult.bytes; // Type string | Uint8Array

      // ---- START: Added logs for signedMessageResult.bytes ----
      console.log('Frontend: signedMessageResult (full object from signPersonalMessage):', signedMessageResult);
      console.log('Frontend: bytesFromWallet (type):', typeof bytesFromWallet, bytesFromWallet);

      let rawBytesToEncode: Uint8Array | undefined;
      let signedMessageBytesForBackendB64: string = ''; // Initialize to empty string

      if (bytesFromWallet && typeof bytesFromWallet !== 'string') { // Primary check: exists and not a string
          // We expect this to be Uint8Array or something Buffer.from can handle as such
          // This path is taken if bytesFromWallet is an object, likely Uint8Array
          rawBytesToEncode = bytesFromWallet as Uint8Array; // Proceed with assumption
          console.log('Frontend: bytesFromWallet is treated as Uint8Array-like.');
          try {
              const bufferForHex = Buffer.from(rawBytesToEncode);
              console.log('Frontend: bytesFromWallet HEX:', bufferForHex.toString('hex'));
              console.log('Frontend: bytesFromWallet Length:', bufferForHex.length);
              signedMessageBytesForBackendB64 = bufferForHex.toString('base64'); // Encode here once confirmed valid
          } catch (e) {
              console.error('Frontend: Error processing non-string bytesFromWallet for logging/encoding:', e);
              // signedMessageBytesForBackendB64 remains empty or previous value if error
          }
      } else if (typeof bytesFromWallet === 'string') {
          console.warn('Frontend: bytesFromWallet is a STRING. This is usually unexpected for .bytes from signPersonalMessage.');
          // If it's a string, it might be already base64 encoded, or it might be a plain string (needs encoding).
          // For now, let's assume if it's a string, it IS the base64 encoded version of what was signed.
          // This aligns with `signedMessageResult.signature` which is also a base64 string.
          // However, the DTO expects base64 of the *raw message bytes* that were signed (with Sui prefix).
          // If dapp-kit for some reason returns a string here for .bytes, clarification on its format is needed.
          // Let's log its hex if we treat it as base64. The backend expects base64 of the *actual signed bytes*.
          signedMessageBytesForBackendB64 = bytesFromWallet; // Tentatively assign, assuming it IS the correct base64 string.
                                                         // If not, backend will fail verification.
          try {
            const decodedForLog = Buffer.from(bytesFromWallet, 'base64');
            console.log('Frontend: bytesFromWallet (if string, assuming it IS base64) Decoded HEX for log:', decodedForLog.toString('hex'));
            console.log('Frontend: bytesFromWallet (if string, assuming it IS base64) Decoded Length for log:', decodedForLog.length);
          } catch (decodeError) {
            console.error('Frontend: Failed to decode bytesFromWallet assuming it was a base64 string (for logging). It might be a plain string or invalid base64.:', decodeError);
            // If it was a plain string, it should have been new TextEncoder().encode(bytesFromWallet) then to base64.
            // But signPersonalMessage.bytes is expected to be the raw signed bytes (prefixed by wallet).
            // Resetting to empty if it wasn't valid base64, as the assumption failed.
            // signedMessageBytesForBackendB64 = ''; // Or handle as plain text that needs encoding? Needs clarity on string format from dapp-kit.
          }
      } else {
          console.warn('Frontend: bytesFromWallet is undefined/null or an unexpected type. Actual value:', bytesFromWallet);
          // signedMessageBytesForBackendB64 remains empty
      }
      // ---- END: Added logs for signedMessageResult.bytes ----

      const publicKeyBytes = currentAccount.publicKey;
      const signatureScheme = (signedMessageResult as any).signatureScheme || (currentAccount as any).signatureScheme || 'unknown';
      if (signatureScheme === 'unknown') {
        console.warn('CreateTalePage.tsx: Signature scheme could not be determined. Backend verification might be affected.');
      }

      if (!signedMessageBytesForBackendB64) {
        console.error('Frontend: signedMessageBytesForBackendB64 is empty. Aborting submission.');
        enqueueSnackbar('Failed to prepare signed message for backend. Please try again.', { variant: 'error' });
        return; // or setIsSaving(false) if not relying on react-query for this specific error path
      }

      const taleDataForBackend: FrontendInitiatePublicationDto = {
        title,
        description,
        content: cleanedHtml,
        coverImage: coverImage || undefined,
        tags: tags || [],
        wordCount,
        readingTime,
        userAddress: currentAccount.address,
        signature_base64: signedMessageResult.signature, // This is already base64 string
        signedMessageBytes_base64: signedMessageBytesForBackendB64,
        publicKey_base64: Buffer.from(publicKeyBytes).toString('base64'),
        signatureScheme: signatureScheme,
      };

      console.log('CreateTalePage.tsx: Submitting to initiatePublication:', taleDataForBackend);

      const result = await initiatePublication(taleDataForBackend);

      console.log('Backend response (initiatePublication):', result);
      enqueueSnackbar('Tale submitted successfully! Processing publication.', { variant: 'success' });

      // Clear form and local storage on success
      localStorage.removeItem(LOCAL_STORAGE_KEYS.TITLE);
      localStorage.removeItem(LOCAL_STORAGE_KEYS.CONTENT);
      localStorage.removeItem(LOCAL_STORAGE_KEYS.COVER);
      localStorage.removeItem(LOCAL_STORAGE_KEYS.DESCRIPTION);
      localStorage.removeItem(LOCAL_STORAGE_KEYS.TAGS);
      editor?.commands.setContent(''); // Clear editor content
      setTitle('');
      setDescription('');
      setCoverImage('');
      setTags([]);
      setWordCount(0);
      setReadingTime(0);
      // Consider navigating the user or updating UI further

    } catch (error) {
      console.error('Error during save/publish process:', error);
      // The error object from react-query will likely be an Error instance.
      // If talesApi throws an error with a message, it should be here.
      const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred during publication.';
      enqueueSnackbar(`Failed to publish: ${errorMessage}`, { variant: 'error' });
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
        isSaving={isPublishing}
        isUploadingCover={isUploadingCover}
        onTogglePreview={togglePreview}
        onToggleMetadata={toggleMetadata}
        onSave={handleSave}
      />
      
      {/* Editor */}
      <Box sx={editorContentStyles}>
        {/* Cover Image */}
        <CoverImageUpload 
          coverImage={coverImage} 
          onCoverUpload={handleCoverUpload} 
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
        coverImage={coverImage}
        description={description}
        tags={tags}
        wordCount={wordCount}
        readingTime={readingTime}
      />
    </Box>
  );
};

export default CreateTalePage; 