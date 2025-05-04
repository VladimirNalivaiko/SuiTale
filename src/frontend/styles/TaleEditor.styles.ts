import { SxProps, Theme } from '@mui/material';

// Main editor container
export const editorContainerStyles: SxProps<Theme> = {
  bgcolor: '#121212', 
  color: 'white',
  minHeight: '100vh',
  display: 'flex',
  flexDirection: 'column'
};

// Editor content container
export const editorContentStyles: SxProps<Theme> = {
  maxWidth: '800px',
  width: '100%',
  mx: 'auto',
  p: 4,
  flexGrow: 1
};

// Title input styles
export const titleInputStyles: SxProps<Theme> = { 
  mb: 2,
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
};

// Bottom toolbar styles
export const bottomToolbarStyles: SxProps<Theme> = { 
  position: 'fixed',
  bottom: 20,
  left: '50%',
  transform: 'translateX(-50%)',
  bgcolor: '#272727',
  borderRadius: 2,
  p: 1,
  boxShadow: '0 4px 20px rgba(0,0,0,0.5)'
};

// TipTap editor styles
export const tipTapEditorStyles: SxProps<Theme> = {
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
};

// Preview content styles
export const previewContentStyles: SxProps<Theme> = {
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
  '& p': {
    margin: '0 0 1em 0',
    fontSize: '1.2rem',
    lineHeight: 1.6,
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
    background: '#242424',
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
    margin: '1em 0',
  }
}; 