import React, { useState } from 'react';
import { Box, Paper, Typography, IconButton, Stack, Collapse } from '@mui/material';
import { Editor } from '@tiptap/react';
import ImageIcon from '@mui/icons-material/Image';
import CodeIcon from '@mui/icons-material/Code';
import YouTubeIcon from '@mui/icons-material/YouTube';
import TextFieldsIcon from '@mui/icons-material/TextFields';
import FormatQuoteIcon from '@mui/icons-material/FormatQuote';
import TitleIcon from '@mui/icons-material/Title';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';

interface NodeMenuProps {
  editor: Editor;
}

const NodeMenu: React.FC<NodeMenuProps> = ({ editor }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const handleToggleExpand = () => {
    setIsExpanded(!isExpanded);
  };

  const insertBlock = (blockType: string) => {
    switch (blockType) {
      case 'heading1':
        editor.chain().focus().toggleHeading({ level: 1 }).run();
        break;
      case 'heading2':
        editor.chain().focus().toggleHeading({ level: 2 }).run();
        break;
      case 'paragraph':
        editor.chain().focus().setParagraph().run();
        break;
      case 'image':
        const url = window.prompt('Enter image URL');
        if (url) {
          editor.chain().focus().setImage({ src: url }).run();
        }
        break;
      case 'blockquote':
        editor.chain().focus().toggleBlockquote().run();
        break;
      case 'code':
        editor.chain().focus().toggleCodeBlock().run();
        break;
      case 'youtube':
        const youtubeUrl = window.prompt('Enter YouTube URL');
        if (youtubeUrl) {
          // TODO: Add a YouTube extension
          // This is a placeholder - TipTap needs an extension for YouTube embeds
          // In a real implementation, you'd use a YouTube extension
          editor.chain().focus().setContent(`<div class="youtube-embed">${youtubeUrl}</div>`).run();
        }
        break;
      default:
        break;
    }
  };

  const blockButtons = [
    { icon: <TitleIcon />, label: 'Heading 1', type: 'heading1' },
    { icon: <TitleIcon sx={{ transform: 'scale(0.8)' }} />, label: 'Heading 2', type: 'heading2' },
    { icon: <TextFieldsIcon />, label: 'Paragraph', type: 'paragraph' },
    { icon: <ImageIcon />, label: 'Image', type: 'image' },
    { icon: <FormatQuoteIcon />, label: 'Quote', type: 'blockquote' },
    { icon: <CodeIcon />, label: 'Code Block', type: 'code' },
    { icon: <YouTubeIcon />, label: 'YouTube', type: 'youtube' },
  ];

  return (
    <Paper
      elevation={0}
      sx={{
        bgcolor: 'transparent',
        border: 'none',
        mb: 1,
        position: 'relative',
      }}
    >
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: '100%',
          mb: 1,
        }}
      >
        <IconButton 
          size="small"
          onClick={handleToggleExpand}
          sx={{ 
            bgcolor: 'rgba(156, 77, 255, 0.1)', 
            color: 'white',
            '&:hover': {
              bgcolor: 'rgba(156, 77, 255, 0.2)',
            }
          }}
        >
          {isExpanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
        </IconButton>
      </Box>

      <Collapse in={isExpanded}>
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            mb: 2,
          }}
        >
          <Paper
            elevation={3}
            sx={{
              bgcolor: '#272727',
              p: 1.5,
              borderRadius: 2,
            }}
          >
            <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.6)', mb: 1, display: 'block', textAlign: 'center' }}>
              Add Content Block
            </Typography>
            <Stack direction="row" spacing={1} flexWrap="wrap" justifyContent="center">
              {blockButtons.map((button) => (
                <IconButton
                  key={button.type}
                  size="small"
                  onClick={() => insertBlock(button.type)}
                  sx={{
                    color: editor.isActive(button.type) ? '#9c4dff' : 'white',
                    '&:hover': {
                      bgcolor: 'rgba(156, 77, 255, 0.1)',
                    },
                  }}
                  title={button.label}
                >
                  {button.icon}
                </IconButton>
              ))}
            </Stack>
          </Paper>
        </Box>
      </Collapse>
    </Paper>
  );
};

export default NodeMenu; 