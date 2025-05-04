import React from 'react';
import { 
  Dialog, 
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography,
  Box,
  IconButton,
  Button,
  Divider,
  Chip
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import TimerIcon from '@mui/icons-material/Timer';

interface PreviewDialogProps {
  open: boolean;
  onClose: () => void;
  title: string;
  content: string;
  coverImage: string;
  description: string;
  tags: string[];
  wordCount: number;
  readingTime: number;
}

const PreviewDialog: React.FC<PreviewDialogProps> = ({
  open,
  onClose,
  title,
  content,
  coverImage,
  description,
  tags,
  wordCount,
  readingTime
}) => {
  return (
    <Dialog 
      open={open} 
      onClose={onClose}
      maxWidth="md"
      fullWidth
      sx={{
        '& .MuiDialog-paper': {
          bgcolor: '#1a1a1a',
          color: 'white',
          backgroundImage: 'none',
        }
      }}
    >
      <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #333' }}>
        <Typography variant="h6">Preview</Typography>
        <IconButton 
          edge="end" 
          color="inherit" 
          onClick={onClose} 
          aria-label="close"
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent sx={{ p: 0 }}>
        <Box sx={{ p: 4 }}>
          {/* Preview Cover Image */}
          {coverImage && (
            <Box
              sx={{
                height: '300px',
                borderRadius: 2,
                overflow: 'hidden',
                mb: 4,
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
            </Box>
          )}
          
          {/* Preview Title */}
          <Typography 
            variant="h1" 
            gutterBottom
            sx={{ 
              fontSize: '3rem',
              fontWeight: 'bold',
              color: 'white',
              mb: 1
            }}
          >
            {title || 'Untitled'}
          </Typography>
          
          {/* Preview metadata */}
          <Box sx={{ mb: 3, display: 'flex', flexDirection: 'column', gap: 1 }}>
            {/* Reading time */}
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <TimerIcon fontSize="small" sx={{ mr: 1, color: 'rgba(255,255,255,0.7)' }} />
              <Typography variant="body2" color="text.secondary">
                {wordCount} words · {readingTime} min read
              </Typography>
            </Box>
            
            {/* Tags */}
            {tags.length > 0 && (
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 1 }}>
                {tags.map(tag => (
                  <Chip 
                    key={tag} 
                    label={tag} 
                    size="small"
                    sx={{ 
                      bgcolor: 'rgba(156, 77, 255, 0.2)', 
                      color: 'white',
                    }} 
                  />
                ))}
              </Box>
            )}
            
            {/* Description */}
            {description && (
              <Typography 
                variant="body1" 
                sx={{ 
                  mt: 2, 
                  color: 'rgba(255,255,255,0.7)',
                  fontStyle: 'italic',
                  borderLeft: '3px solid #9c4dff',
                  pl: 2,
                }}
              >
                {description}
              </Typography>
            )}
          </Box>
          
          <Divider sx={{ mb: 3, bgcolor: 'rgba(255,255,255,0.1)' }} />
          
          {/* Preview Content */}
          <Box 
            sx={{
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
            }}
            dangerouslySetInnerHTML={{ __html: content }}
          />
        </Box>
      </DialogContent>
      <DialogActions sx={{ borderTop: '1px solid #333', p: 2, justifyContent: 'space-between' }}>
        <Typography variant="body2" color="text.secondary">
          This is how your article will appear when published
        </Typography>
        <Button 
          onClick={onClose} 
          color="primary" 
          variant="contained"
        >
          Continue Editing
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default PreviewDialog; 