import React, { useState, useEffect, useRef, KeyboardEvent, forwardRef, useImperativeHandle } from 'react';
import { Box, Paper, Typography, List, ListItem, ListItemIcon, ListItemText } from '@mui/material';
import { Editor } from '@tiptap/react';
import TitleIcon from '@mui/icons-material/Title';
import TextFieldsIcon from '@mui/icons-material/TextFields';
import FormatQuoteIcon from '@mui/icons-material/FormatQuote';
import CodeIcon from '@mui/icons-material/Code';
import FormatListBulletedIcon from '@mui/icons-material/FormatListBulleted';
import FormatListNumberedIcon from '@mui/icons-material/FormatListNumbered';
import ImageIcon from '@mui/icons-material/Image';
import YouTubeIcon from '@mui/icons-material/YouTube';

interface Command {
  title: string;
  description: string;
  icon: React.ReactNode;
  command: ({ editor, range }: { editor: Editor; range: any }) => void;
}

interface SlashCommandsMenuProps {
  editor: Editor;
  range: any;
  command: any;
  items: string[];
  clientRect: () => DOMRect;
}

export default forwardRef((props: SlashCommandsMenuProps, ref) => {
  const { editor, range, command, items } = props;
  const [selectedIndex, setSelectedIndex] = useState(0);
  const menuRef = useRef<HTMLDivElement>(null);
  const query = Array.isArray(items) && items.length > 0 ? items[0] : '';

  // Forward ref methods to parent (used by the Suggestion plugin)
  useImperativeHandle(ref, () => ({
    onKeyDown: ({ event }: { event: KeyboardEvent }) => {
      if (event.key === 'ArrowUp') {
        setSelectedIndex((selectedIndex + filteredCommands.length - 1) % filteredCommands.length);
        return true;
      }

      if (event.key === 'ArrowDown') {
        setSelectedIndex((selectedIndex + 1) % filteredCommands.length);
        return true;
      }

      if (event.key === 'Enter') {
        selectItem(selectedIndex);
        return true;
      }

      return false;
    },
  }));

  const commands: Command[] = [
    {
      title: 'Paragraph',
      description: 'Normal text',
      icon: <TextFieldsIcon />,
      command: ({ editor, range }) => {
        editor.chain().focus().deleteRange(range).setParagraph().run();
      },
    },
    {
      title: 'Heading 1',
      description: 'Large heading',
      icon: <TitleIcon />,
      command: ({ editor, range }) => {
        editor.chain().focus().deleteRange(range).setHeading({ level: 1 }).run();
      },
    },
    {
      title: 'Heading 2',
      description: 'Medium heading',
      icon: <TitleIcon sx={{ transform: 'scale(0.8)' }} />,
      command: ({ editor, range }) => {
        editor.chain().focus().deleteRange(range).setHeading({ level: 2 }).run();
      },
    },
    {
      title: 'Bullet List',
      description: 'Create a bullet list',
      icon: <FormatListBulletedIcon />,
      command: ({ editor, range }) => {
        editor.chain().focus().deleteRange(range).toggleBulletList().run();
      },
    },
    {
      title: 'Numbered List',
      description: 'Create a numbered list',
      icon: <FormatListNumberedIcon />,
      command: ({ editor, range }) => {
        editor.chain().focus().deleteRange(range).toggleOrderedList().run();
      },
    },
    {
      title: 'Blockquote',
      description: 'Create a quote',
      icon: <FormatQuoteIcon />,
      command: ({ editor, range }) => {
        editor.chain().focus().deleteRange(range).toggleBlockquote().run();
      },
    },
    {
      title: 'Code Block',
      description: 'Add a code block',
      icon: <CodeIcon />,
      command: ({ editor, range }) => {
        editor.chain().focus().deleteRange(range).toggleCodeBlock().run();
      },
    },
    {
      title: 'Image',
      description: 'Insert an image',
      icon: <ImageIcon />,
      command: ({ editor, range }) => {
        editor.chain().focus().deleteRange(range).run();
        const url = window.prompt('Enter image URL');
        if (url) {
          editor.chain().focus().setImage({ src: url }).run();
        }
      },
    },
    {
      title: 'YouTube',
      description: 'Embed a YouTube video',
      icon: <YouTubeIcon />,
      command: ({ editor, range }) => {
        editor.chain().focus().deleteRange(range).run();
        const youtubeUrl = window.prompt('Enter YouTube URL');
        if (youtubeUrl) {
          // This is a placeholder - TipTap needs an extension for YouTube embeds
          editor.chain().focus().setContent(`<div class="youtube-embed">${youtubeUrl}</div>`).run();
        }
      },
    },
  ];

  // Filter commands based on the query
  const filteredCommands = commands.filter(
    item => 
      item.title.toLowerCase().includes(query.toLowerCase()) || 
      item.description.toLowerCase().includes(query.toLowerCase())
  );

  const selectItem = (index: number) => {
    const item = filteredCommands[index];
    if (item) {
      command({ 
        command: item.command 
      });
    }
  };

  // Auto-scroll to keep selected item in view
  useEffect(() => {
    const selectedItem = document.getElementById(`slash-command-${selectedIndex}`);
    if (selectedItem && menuRef.current) {
      const menuRect = menuRef.current.getBoundingClientRect();
      const selectedRect = selectedItem.getBoundingClientRect();

      if (selectedRect.bottom > menuRect.bottom) {
        menuRef.current.scrollTop += selectedRect.bottom - menuRect.bottom;
      } else if (selectedRect.top < menuRect.top) {
        menuRef.current.scrollTop -= menuRect.top - selectedRect.top;
      }
    }
  }, [selectedIndex]);

  // If no commands match the query
  if (filteredCommands.length === 0) {
    return (
      <Paper
        sx={{
          bgcolor: '#272727',
          color: 'white',
          width: '300px',
          maxHeight: '400px',
          overflowY: 'auto',
          borderRadius: '8px',
          boxShadow: '0 4px 20px rgba(0,0,0,0.5)',
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
        }}
      >
        <Box sx={{ p: 2, textAlign: 'center' }}>
          <Typography variant="body2" color="text.secondary">
            No matching commands found
          </Typography>
        </Box>
      </Paper>
    );
  }

  return (
    <Paper
      ref={menuRef}
      tabIndex={0}
      sx={{
        bgcolor: '#272727',
        color: 'white',
        width: '300px',
        maxHeight: '400px',
        overflowY: 'auto',
        borderRadius: '8px',
        boxShadow: '0 4px 20px rgba(0,0,0,0.5)',
        '&:focus': { outline: 'none' },
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
      }}
    >
      <List dense sx={{ p: 0 }}>
        {filteredCommands.map((command, index) => (
          <ListItem
            id={`slash-command-${index}`}
            key={command.title}
            button
            selected={index === selectedIndex}
            onClick={() => selectItem(index)}
            sx={{
              py: 1,
              '&.Mui-selected': {
                bgcolor: 'rgba(156, 77, 255, 0.2)',
                '&:hover': {
                  bgcolor: 'rgba(156, 77, 255, 0.3)',
                },
              },
              '&:hover': {
                bgcolor: 'rgba(156, 77, 255, 0.1)',
              },
            }}
          >
            <ListItemIcon sx={{ color: index === selectedIndex ? '#9c4dff' : 'white', minWidth: '40px' }}>
              {command.icon}
            </ListItemIcon>
            <ListItemText
              primary={
                <Typography variant="body1" sx={{ fontWeight: index === selectedIndex ? 'bold' : 'normal' }}>
                  {command.title}
                </Typography>
              }
              secondary={
                <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.6)' }}>
                  {command.description}
                </Typography>
              }
            />
          </ListItem>
        ))}
      </List>
    </Paper>
  );
}); 