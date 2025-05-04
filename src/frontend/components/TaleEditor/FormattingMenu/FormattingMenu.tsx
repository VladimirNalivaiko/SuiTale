import React from 'react';
import { BubbleMenu } from '@tiptap/react';
import { Paper, IconButton } from '@mui/material';
import FormatBoldIcon from '@mui/icons-material/FormatBold';
import FormatItalicIcon from '@mui/icons-material/FormatItalic';
import CodeIcon from '@mui/icons-material/Code';
import FormatListBulletedIcon from '@mui/icons-material/FormatListBulleted';
import FormatListNumberedIcon from '@mui/icons-material/FormatListNumbered';
import { Editor } from '@tiptap/react';

interface FormattingMenuProps {
  editor: Editor;
}

const FormattingMenu: React.FC<FormattingMenuProps> = ({ editor }) => {
  if (!editor) return null;

  return (
    <BubbleMenu
      editor={editor}
      tippyOptions={{ duration: 100 }}
      shouldShow={({ editor, from, to }) => {
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
  );
};

export default FormattingMenu; 