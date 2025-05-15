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
import { useCreateTale, useUploadCoverImage } from '../../hooks/useTales';
import { useSnackbar } from 'notistack';
import { useSignPersonalMessage, useCurrentAccount } from '@mysten/dapp-kit';

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
  const { mutateAsync: uploadCover } = useUploadCoverImage();
  const { enqueueSnackbar } = useSnackbar();
  const { mutateAsync: signPersonalMessage } = useSignPersonalMessage();

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
        // Upload to the server using the useUploadCoverImage hook's mutation
        const uploadResponse = await uploadCover(file); 
        const serverCoverImageUrl = uploadResponse.coverImage; // This is the base64 data URL from the server

        setCoverImage(serverCoverImageUrl); // Update state with server-provided URL
        localStorage.setItem(LOCAL_STORAGE_KEYS.COVER, serverCoverImageUrl);
        setLastSaved(new Date());
        enqueueSnackbar('Cover image uploaded successfully!', { variant: 'success' });

      } catch (error) {
        console.error('Error uploading cover image:', error);
        const errorMessage = error instanceof Error ? error.message : 'Unknown error during upload';
        enqueueSnackbar(`Failed to upload cover image: ${errorMessage}`, { variant: 'error' });
        // Optionally, clear the cover image if upload fails or revert to a placeholder/previous one
        // setCoverImage(''); 
        // localStorage.removeItem(LOCAL_STORAGE_KEYS.COVER);
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
    setIsSaving(true);
    
    if (!currentAccount) {
      enqueueSnackbar('Please connect your wallet to publish.', { variant: 'warning' });
      setIsSaving(false);
      return;
    }

    const rawHtml = editor?.getHTML() || '';

    // --- Start of HTML cleaning ---
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
    } while (previousHtml !== cleanedHtml && cleanedHtml.length > 0);
    // --- End of HTML cleaning ---

    if (!cleanedHtml) {
        enqueueSnackbar('Content cannot be empty. Please write something to publish.', { variant: 'warning' });
        setIsSaving(false);
        return;
    }

    try {
      // 1. Sign a message to authorize Walrus upload via backend
      const messageToSign = `SuiTale: User ${currentAccount.address} authorizes uploading content. Preview (first 100 chars): ${cleanedHtml.substring(0, 100)}`;
      const messageBytes = new TextEncoder().encode(messageToSign);

      const signedMessageResult = await signPersonalMessage({
        message: messageBytes,
      });

      // 2. Prepare data for the backend
      // This payload will be sent to a new backend endpoint that handles Walrus upload and then calls the Sui contract.
      const taleDataForBackend = {
        title,
        description,
        content: cleanedHtml, 
        coverImage,
        tags,
        wordCount,
        readingTime,
        // Data for backend verification and Walrus interaction
        userAddress: currentAccount.address,
        signature: signedMessageResult.signature, // User's signature for the message
        // The original message (as bytes or string) needs to be sent so the backend can verify the signature against it.
        // Sending the original string `messageToSign` is often easier for the backend to reconstruct.
        originalMessage: messageToSign, 
      };

      // TODO: Implement backend endpoint (e.g., /api/publish-tale-step1 or /api/tales/initiate-walrus-upload)
      // This endpoint will:
      //    a. Verify the signature (userAddress, originalMessage, signature).
      //    b. If verified, upload `content` to Walrus using the backend's Walrus client and key.
      //    c. Get the `blobId` from Walrus.
      //    d. Then, (either in the same endpoint or a subsequent call) call the Sui contract's `publish` function 
      //       with the `blobId` and `title`, signed by the backend's key (as it was before).
      //    e. Return the final transaction digest or success status to the frontend.
      
      // For now, we just log the data and show a temporary message.
      // The actual call to `createTale` (or a new function) is commented out until the backend is ready.
      console.log('Data prepared for backend (Walrus auth + content):', taleDataForBackend);
      // const finalResult = await createTale(taleDataForBackend); // This will need to be adjusted or replaced
      enqueueSnackbar('Content ready for backend processing (Walrus & Sui publish pending).', { variant: 'info' });

      // console.log('Tale publishing process initiated:', finalResult);
      setLastSaved(new Date());

    } catch (error) {
      console.error('Error during message signing or data preparation:', error);
      const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
      enqueueSnackbar(`Operation failed: ${errorMessage}`, { variant: 'error' });
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
        isSaving={isSaving}
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