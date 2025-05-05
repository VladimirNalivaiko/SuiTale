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
import { CreateTalePayload } from '../../api/tales.api';
import { useSnackbar } from 'notistack';

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
  const [title, setTitle] = useState<string>('');
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [coverImage, setCoverImage] = useState<string>('');
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [showSlashTip, setShowSlashTip] = useState<boolean>(true);
  const [previewOpen, setPreviewOpen] = useState<boolean>(false);
  
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
      try {
        // For immediate preview, still use FileReader
        const reader = new FileReader();
        reader.onload = (e) => {
          const imageDataUrl = e.target?.result as string;
          setCoverImage(imageDataUrl);
          localStorage.setItem(LOCAL_STORAGE_KEYS.COVER, imageDataUrl);
          setLastSaved(new Date());
        };
        reader.readAsDataURL(file);
        
        // In the background, upload to the server
        // This is optional - you can choose to upload only when saving the tale
        // const { coverImage: serverCoverImage } = await uploadCover(file);
        // setCoverImage(serverCoverImage);
      } catch (error) {
        console.error('Error uploading cover image:', error);
        enqueueSnackbar('Failed to upload cover image', { variant: 'error' });
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
    // Get the raw HTML content from the editor
    const rawHtml = editor?.getHTML() || '';

    // --- Start of more robust HTML cleaning ---

    // 1. Remove HTML comments
    let cleanedHtml = rawHtml.replace(/<!--.*?-->/gs, '');

    // 2. Iteratively remove empty block-level tags
    const tagsToClean = ['p', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'div', 'blockquote', 'li']; // Add more tags if needed
    let previousHtml;
    do {
        previousHtml = cleanedHtml;
        tagsToClean.forEach(tag => {
            // Matches <tag> potentially followed by whitespace </tag>
            const regex = new RegExp(`<${tag}[^>]*>\\s*<\\/${tag}>`, 'gi');
            cleanedHtml = cleanedHtml.replace(regex, '');
        });
        // Trim leading/trailing whitespace after each pass to help catch nested structures
        cleanedHtml = cleanedHtml.trim();
    } while (previousHtml !== cleanedHtml && cleanedHtml.length > 0); // Repeat until no more changes or string becomes empty

    // --- End of HTML cleaning ---

    // Check if the content is empty after cleaning
    if (!cleanedHtml) {
        enqueueSnackbar('Content cannot be empty after cleaning.', { variant: 'warning' });
        setIsSaving(false);
        return;
    }

    try {
      // Create tale data object using the cleaned HTML
      const taleData: CreateTalePayload = {
        title,
        description,
        content: cleanedHtml, // Use the thoroughly cleaned content
        coverImage,
        tags,
        // Note: wordCount and readingTime might be inaccurate after cleaning.
        // Consider recalculating based on cleanedHtml if precision is critical.
        wordCount,
        readingTime
      };

      // Send to backend API using React Query
      const savedTale = await createTale(taleData);

      console.log('Tale saved successfully:', savedTale);

      // Clear local storage after successful save (optional)
      // localStorage.removeItem(LOCAL_STORAGE_KEYS.TITLE);
      // localStorage.removeItem(LOCAL_STORAGE_KEYS.CONTENT);
      // localStorage.removeItem(LOCAL_STORAGE_KEYS.COVER); // Also consider clearing cover, description, tags
      // localStorage.removeItem(LOCAL_STORAGE_KEYS.DESCRIPTION);
      // localStorage.removeItem(LOCAL_STORAGE_KEYS.TAGS);


      // Set last saved time
      setLastSaved(new Date());

      // Show success message
      enqueueSnackbar('Tale saved successfully!', { variant: 'success' });

      // Optionally redirect to the tale view page
      // history.push(`/tales/${savedTale.id}`);
    } catch (error) {
      console.error('Error saving tale:', error);
      // Provide more specific error feedback if possible
      const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
      enqueueSnackbar(`Failed to save tale: ${errorMessage}`, { variant: 'error' });
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