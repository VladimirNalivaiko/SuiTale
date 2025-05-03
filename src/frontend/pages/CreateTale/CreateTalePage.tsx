import React, { useState, useEffect, useCallback } from 'react';
import { Box, TextField, Button, Stack, Paper, Typography, IconButton } from '@mui/material';
import { useEditor, EditorContent, BubbleMenu } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import Link from '@tiptap/extension-link';
import Image from '@tiptap/extension-image';
import { NodeMenu, SlashCommandsMenu, SlashCommands } from '../../components/TaleEditor';
import FormatBoldIcon from '@mui/icons-material/FormatBold';
import FormatItalicIcon from '@mui/icons-material/FormatItalic';
import CodeIcon from '@mui/icons-material/Code';
import FormatListBulletedIcon from '@mui/icons-material/FormatListBulleted';
import FormatListNumberedIcon from '@mui/icons-material/FormatListNumbered';
import SaveIcon from '@mui/icons-material/Save';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import AddPhotoAlternateIcon from '@mui/icons-material/AddPhotoAlternate';
import { useNavigate } from 'react-router-dom';
// Import tippy.js CSS for tooltips and menus
import 'tippy.js/dist/tippy.css';

// Local storage keys
const LOCAL_STORAGE_KEYS = {
  TITLE: 'tale-editor-title',
  CONTENT: 'tale-editor-content',
  COVER: 'tale-editor-cover',
  SLASH_TIP_SHOWN: 'tale-editor-slash-tip-shown' // New key for tracking tip state
};

const CreateTalePage: React.FC = () => {
  const navigate = useNavigate();
  const [title, setTitle] = useState<string>('');
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [coverImage, setCoverImage] = useState<string>('');
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [showSlashTip, setShowSlashTip] = useState<boolean>(true);

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
      }),
    ],
    content: '',
    onUpdate: ({ editor }) => {
      // Auto-save when content changes
      localStorage.setItem(LOCAL_STORAGE_KEYS.CONTENT, editor.getHTML());
      setLastSaved(new Date());
    }
  })!;

  // Load saved data from localStorage
  useEffect(() => {
    const savedTitle = localStorage.getItem(LOCAL_STORAGE_KEYS.TITLE);
    const savedContent = localStorage.getItem(LOCAL_STORAGE_KEYS.CONTENT);
    const savedCover = localStorage.getItem(LOCAL_STORAGE_KEYS.COVER);
    const tipShown = localStorage.getItem(LOCAL_STORAGE_KEYS.SLASH_TIP_SHOWN);
    
    if (savedTitle) setTitle(savedTitle);
    if (savedContent && editor) editor.commands.setContent(savedContent);
    if (savedCover) setCoverImage(savedCover);
    if (tipShown === 'true') setShowSlashTip(false);
  }, [editor]);

  // Auto-save title
  useEffect(() => {
    if (title) {
      localStorage.setItem(LOCAL_STORAGE_KEYS.TITLE, title);
      setLastSaved(new Date());
    }
  }, [title]);

  // Handle cover image upload
  const handleCoverUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const imageDataUrl = e.target?.result as string;
        setCoverImage(imageDataUrl);
        localStorage.setItem(LOCAL_STORAGE_KEYS.COVER, imageDataUrl);
        setLastSaved(new Date());
      };
      reader.readAsDataURL(file);
    }
  };

  if (!editor) return null;

  const handleSave = async () => {
    setIsSaving(true);
    const html = editor.getHTML();
    console.log({ title, html, coverImage });
    
    // Simulate saving
    setTimeout(() => {
      setIsSaving(false);
    }, 1000);
  };

  return (
    <Box sx={{ 
      bgcolor: '#121212', 
      color: 'white',
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column' 
    }}>
      {/* Formatting menu that appears when text is selected */}
      {editor && (
        <BubbleMenu
          editor={editor}
          tippyOptions={{ duration: 100 }}
          shouldShow={({ editor, view, state, oldState, from, to }) => {
            // Show only if there is selection
            return from !== to;
          }}
        >
          <Paper elevation={3} sx={{ 
            display: 'flex', 
            borderRadius: '4px',
            bgcolor: '#333',
            color: 'white'
          }}>
            <IconButton 
              size="small" 
              color="inherit"
              onClick={() => editor.chain().focus().toggleBold().run()}
              sx={{ 
                color: editor.isActive('bold') ? '#9c4dff' : 'white',
              }}
            >
              <FormatBoldIcon fontSize="small" />
            </IconButton>
            <IconButton 
              size="small" 
              color="inherit"
              onClick={() => editor.chain().focus().toggleItalic().run()}
              sx={{ 
                color: editor.isActive('italic') ? '#9c4dff' : 'white',
              }}
            >
              <FormatItalicIcon fontSize="small" />
            </IconButton>
            <IconButton 
              size="small" 
              color="inherit"
              onClick={() => editor.chain().focus().toggleCode().run()}
              sx={{ 
                color: editor.isActive('code') ? '#9c4dff' : 'white',
              }}
            >
              <CodeIcon fontSize="small" />
            </IconButton>
            <IconButton 
              size="small" 
              color="inherit"
              onClick={() => editor.chain().focus().toggleBulletList().run()}
              sx={{ 
                color: editor.isActive('bulletList') ? '#9c4dff' : 'white',
              }}
            >
              <FormatListBulletedIcon fontSize="small" />
            </IconButton>
            <IconButton 
              size="small" 
              color="inherit"
              onClick={() => editor.chain().focus().toggleOrderedList().run()}
              sx={{ 
                color: editor.isActive('orderedList') ? '#9c4dff' : 'white',
              }}
            >
              <FormatListNumberedIcon fontSize="small" />
            </IconButton>
          </Paper>
        </BubbleMenu>
      )}

      {/* Header */}
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        p: 2,
        borderBottom: '1px solid #333' 
      }}>
        <IconButton 
          color="inherit" 
          aria-label="back"
          onClick={() => navigate(-1)}
        >
          <ArrowBackIcon />
        </IconButton>
        
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Typography variant="body2" sx={{ mr: 2 }}>
            {isSaving 
              ? 'Saving...' 
              : lastSaved 
                ? `Saved at ${lastSaved.toLocaleTimeString()}` 
                : 'Not saved'}
          </Typography>
          <Button 
            variant="contained"
            color="primary"
            size="small"
            onClick={handleSave}
            startIcon={<SaveIcon />}
          >
            Publish
          </Button>
        </Box>
      </Box>

      {/* Editor */}
      <Box sx={{ 
        maxWidth: '800px',
        width: '100%',
        mx: 'auto',
        p: 4,
        flexGrow: 1
      }}>
        {/* Cover Image */}
        <Box sx={{ mb: 4, position: 'relative' }}>
          {coverImage ? (
            <Box
              sx={{
                position: 'relative',
                height: '300px',
                borderRadius: 2,
                overflow: 'hidden',
                mb: 2,
              }}
            >
              <Box
                component="img"
                src={coverImage}
                sx={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                }}
                alt="Cover"
              />
              <Box
                sx={{
                  position: 'absolute',
                  top: 0,
                  right: 0,
                  p: 1,
                }}
              >
                <input
                  accept="image/*"
                  type="file"
                  id="cover-upload"
                  onChange={handleCoverUpload}
                  style={{ display: 'none' }}
                />
                <label htmlFor="cover-upload">
                  <IconButton
                    color="inherit"
                    component="span"
                    sx={{
                      bgcolor: 'rgba(0,0,0,0.5)',
                      '&:hover': {
                        bgcolor: 'rgba(0,0,0,0.7)',
                      },
                    }}
                  >
                    <AddPhotoAlternateIcon />
                  </IconButton>
                </label>
              </Box>
            </Box>
          ) : (
            <Box
              sx={{
                height: '150px',
                border: '2px dashed #333',
                borderRadius: 2,
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                mb: 2,
                cursor: 'pointer',
                '&:hover': {
                  borderColor: '#9c4dff',
                },
              }}
            >
              <input
                accept="image/*"
                type="file"
                id="cover-upload"
                onChange={handleCoverUpload}
                style={{ display: 'none' }}
              />
              <label htmlFor="cover-upload" style={{ width: '100%', height: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                <Box sx={{ textAlign: 'center' }}>
                  <AddPhotoAlternateIcon sx={{ fontSize: 40, color: '#666' }} />
                  <Typography variant="body2" sx={{ mt: 1, color: '#666' }}>
                    Add Cover Image
                  </Typography>
                </Box>
              </label>
            </Box>
          )}
        </Box>

        {/* Title input - borderless, large size */}
        <TextField
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Title"
          fullWidth
          variant="standard"
          sx={{ 
            mb: 4,
            input: { 
              color: 'white',
              fontSize: '3rem',
              fontWeight: 'bold',
              '&::placeholder': {
                color: 'rgba(255,255,255,0.5)',
                opacity: 1
              }
            },
            '& .MuiInput-underline:before': {
              borderBottomColor: 'transparent'
            },
            '& .MuiInput-underline:hover:not(.Mui-disabled):before': {
              borderBottomColor: 'transparent'
            },
          }}
          inputProps={{
            style: { caretColor: '#9c4dff' }
          }}
        />

        {/* Block menu for adding new content sections */}
        {editor && <NodeMenu editor={editor} />}

        {/* Slash command hint - only show if not used before */}
        {showSlashTip && (
          <Box 
            sx={{
              mb: 2,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Paper
              elevation={0}
              sx={{
                bgcolor: 'rgba(156, 77, 255, 0.1)',
                p: 1,
                borderRadius: 2,
                display: 'inline-flex',
                alignItems: 'center',
              }}
            >
              <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)' }}>
                Tip: Type <Box component="span" sx={{ fontWeight: 'bold', color: '#9c4dff' }}>/</Box> to open the block menu
              </Typography>
            </Paper>
          </Box>
        )}

        {/* Tiptap editor */}
        <Box sx={{
          '& .ProseMirror': {
            minHeight: '300px',
            color: 'white',
            fontSize: '1.2rem',
            lineHeight: 1.6,
            outline: 'none',
            '&:focus': {
              outline: 'none'
            },
            '& p': {
              margin: '0 0 1em 0',
              position: 'relative',
              '&:hover::before': {
                content: '""',
                position: 'absolute',
                left: '-20px',
                top: '50%',
                transform: 'translateY(-50%)',
                width: '10px',
                height: '10px',
                borderRadius: '50%',
                backgroundColor: 'rgba(156, 77, 255, 0.5)',
              }
            },
            '& h1': {
              fontSize: '2.5rem',
              fontWeight: 'bold',
              margin: '1em 0 0.5em',
              color: '#9c4dff'
            },
            '& h2': {
              fontSize: '2rem',
              fontWeight: 'bold',
              margin: '1em 0 0.5em'
            },
            '& blockquote': {
              borderLeft: '3px solid #9c4dff',
              paddingLeft: '1em',
              marginLeft: 0,
              color: 'rgba(255, 255, 255, 0.7)',
              fontStyle: 'italic',
            },
            '& ul, & ol': {
              padding: '0 0 0 1.5em',
              margin: '0 0 1em 0'
            },
            '& code': {
              backgroundColor: 'rgba(156, 77, 255, 0.1)',
              color: '#9c4dff',
              padding: '0.2em 0.4em',
              borderRadius: '3px',
              fontFamily: 'monospace'
            },
            '& pre': {
              background: '#1a1a1a',
              color: '#fff',
              fontFamily: 'monospace',
              padding: '0.75em 1em',
              borderRadius: '0.5em',
              overflow: 'auto',
              '& code': {
                backgroundColor: 'transparent',
                color: 'inherit',
                padding: 0,
                borderRadius: 0,
              }
            },
            '& img': {
              maxWidth: '100%',
              height: 'auto',
              borderRadius: '0.25em',
            },
            // Add custom scrollbar styling
            '&::-webkit-scrollbar': {
              width: '8px',
            },
            '&::-webkit-scrollbar-track': {
              background: 'rgba(0,0,0,0.2)',
              borderRadius: '4px',
            },
            '&::-webkit-scrollbar-thumb': {
              background: 'rgba(156, 77, 255, 0.5)',
              borderRadius: '4px',
              '&:hover': {
                background: 'rgba(156, 77, 255, 0.7)',
              },
            },
          }
        }}>
          <EditorContent editor={editor} />
        </Box>
      </Box>

      {/* Bottom toolbar */}
      <Box sx={{ 
        position: 'fixed',
        bottom: 20,
        left: '50%',
        transform: 'translateX(-50%)',
        bgcolor: '#272727',
        borderRadius: 2,
        p: 1,
        boxShadow: '0 4px 20px rgba(0,0,0,0.5)'
      }}>
        <Stack direction="row" spacing={1}>
          <Button 
            variant="text" 
            color="inherit"
            size="small"
            onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
            sx={{ color: editor.isActive('heading', { level: 1 }) ? '#9c4dff' : 'white' }}
          >
            Heading
          </Button>
          <Button 
            variant="text" 
            color="inherit"
            size="small"
            onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
            sx={{ color: editor.isActive('heading', { level: 2 }) ? '#9c4dff' : 'white' }}
          >
            Subheading
          </Button>
          <Button 
            variant="text" 
            color="inherit"
            size="small"
            onClick={() => {
              const url = window.prompt('Enter image URL');
              if (url) {
                editor.chain().focus().setImage({ src: url }).run();
              }
            }}
          >
            Image
          </Button>
          <Button 
            variant="text" 
            color="inherit"
            size="small"
            onClick={() => {
              const url = window.prompt('Enter URL');
              if (url) {
                editor.chain().focus().setLink({ href: url }).run();
              }
            }}
          >
            Link
          </Button>
        </Stack>
      </Box>
    </Box>
  );
};

export default CreateTalePage; 