import React from 'react';
import { Stack, Button } from '@mui/material';
import { Editor } from '@tiptap/react';

interface EditorToolbarProps {
  editor: Editor;
}

const EditorToolbar: React.FC<EditorToolbarProps> = ({ editor }) => {
  if (!editor) return null;

  return (
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
  );
};

export default EditorToolbar; 