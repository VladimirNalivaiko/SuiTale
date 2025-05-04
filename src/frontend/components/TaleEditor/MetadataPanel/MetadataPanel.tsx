import React from 'react';
import { 
  Paper, 
  Typography, 
  Divider, 
  TextField, 
  Autocomplete,
  Chip,
  Box,
  Button
} from '@mui/material';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';

interface MetadataPanelProps {
  description: string;
  tags: string[];
  suggestedTags: string[];
  open: boolean;
  onDescriptionChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onTagsChange: (newValue: string[]) => void;
  onClose: () => void;
}

const MetadataPanel: React.FC<MetadataPanelProps> = ({
  description,
  tags,
  suggestedTags,
  open,
  onDescriptionChange,
  onTagsChange,
  onClose
}) => {
  if (!open) return null;

  return (
    <Paper
      elevation={0}
      sx={{
        bgcolor: 'rgba(40, 40, 40, 0.6)',
        p: 3,
        borderRadius: 2,
        mb: 3,
      }}
    >
      <Typography variant="h6" gutterBottom>
        Article Metadata
      </Typography>
      
      <Divider sx={{ mb: 2, bgcolor: 'rgba(156, 77, 255, 0.2)' }} />
      
      {/* Description field */}
      <TextField
        label="Short Description"
        placeholder="Brief summary of your article (helps with SEO)"
        fullWidth
        multiline
        rows={2}
        value={description}
        onChange={onDescriptionChange}
        variant="outlined"
        sx={{
          mb: 3,
          '& .MuiOutlinedInput-root': {
            bgcolor: 'rgba(0,0,0,0.2)',
            '& fieldset': {
              borderColor: 'rgba(156, 77, 255, 0.3)',
            },
            '&:hover fieldset': {
              borderColor: 'rgba(156, 77, 255, 0.5)',
            },
            '&.Mui-focused fieldset': {
              borderColor: '#9c4dff',
            }
          },
          '& .MuiInputLabel-root': {
            color: 'rgba(255,255,255,0.7)',
          },
          '& .MuiInputBase-input': {
            color: 'white',
          },
        }}
      />
      
      {/* Tags input */}
      <Autocomplete
        multiple
        freeSolo
        options={suggestedTags.filter(tag => !tags.includes(tag))}
        value={tags}
        onChange={(_, newValue) => onTagsChange(newValue)}
        renderTags={(value, getTagProps) =>
          value.map((option, index) => (
            <Chip
              label={option}
              {...getTagProps({ index })}
              sx={{
                bgcolor: 'rgba(156, 77, 255, 0.2)',
                color: 'white',
                '& .MuiChip-deleteIcon': {
                  color: 'rgba(255,255,255,0.7)',
                  '&:hover': {
                    color: 'white',
                  },
                },
              }}
            />
          ))
        }
        renderInput={(params) => (
          <TextField
            {...params}
            label="Tags"
            placeholder="Add up to 5 tags"
            variant="outlined"
            sx={{
              '& .MuiOutlinedInput-root': {
                bgcolor: 'rgba(0,0,0,0.2)',
                '& fieldset': {
                  borderColor: 'rgba(156, 77, 255, 0.3)',
                },
                '&:hover fieldset': {
                  borderColor: 'rgba(156, 77, 255, 0.5)',
                },
                '&.Mui-focused fieldset': {
                  borderColor: '#9c4dff',
                }
              },
              '& .MuiInputLabel-root': {
                color: 'rgba(255,255,255,0.7)',
              },
              '& .MuiInputBase-input': {
                color: 'white',
              },
            }}
          />
        )}
      />
      
      <Box sx={{ mt: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="body2" color="text.secondary">
          Adding tags and a description helps readers find your content
        </Typography>
        
        <Button
          endIcon={<ExpandLessIcon />}
          onClick={onClose}
          size="small"
          sx={{ color: 'rgba(255,255,255,0.7)' }}
        >
          Hide
        </Button>
      </Box>
    </Paper>
  );
};

export default MetadataPanel; 