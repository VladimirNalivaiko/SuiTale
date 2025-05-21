import React from 'react';
import { 
  Paper, 
  Typography, 
  Divider, 
  TextField, 
  Autocomplete,
  Chip,
  Box,
  Button,
  CircularProgress
} from '@mui/material';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';

interface MetadataPanelProps {
  description: string;
  tags: string[];
  suggestedTags: string[];
  open: boolean;
  onDescriptionChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  onTagsChange: (newValue: string[]) => void;
  onClose: () => void;

  mintPrice: string;
  onMintPriceChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  mintCapacity: string;
  onMintCapacityChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  royaltyFeeBps: number;
  onRoyaltyFeeBpsChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
}

const MetadataPanel: React.FC<MetadataPanelProps> = ({
  description,
  tags,
  suggestedTags,
  open,
  onDescriptionChange,
  onTagsChange,
  onClose,
  mintPrice,
  onMintPriceChange,
  mintCapacity,
  onMintCapacityChange,
  royaltyFeeBps,
  onRoyaltyFeeBpsChange,
}) => {
  if (!open) return null;

  const bpsToPercent = (bps: number) => (bps / 100).toFixed(2);
  const percentToBps = (percent: string) => Math.round(parseFloat(percent) * 100);

  return (
    <Paper
      elevation={0}
      sx={{
        position: 'fixed',
        right: open ? 0 : '-380px',
        top: 0,
        bottom: 0,
        width: '360px',
        zIndex: 1250,
        overflowY: 'auto',
        bgcolor: 'rgba(30, 30, 30, 0.95)',
        backdropFilter: 'blur(5px)',
        p: 3,
        transition: 'right 0.3s ease-in-out',
        borderLeft: '1px solid rgba(156, 77, 255, 0.2)',
        color: 'white',
      }}
    >
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h6" gutterBottom sx={{ color: 'rgba(255,255,255,0.9)' }}>
          Tale Settings
        </Typography>
        <Button
          endIcon={<ExpandLessIcon />}
          onClick={onClose}
          size="small"
          sx={{ color: 'rgba(255,255,255,0.7)' }}
        >
          Close
        </Button>
      </Box>
      
      <Divider sx={{ mb: 2, bgcolor: 'rgba(156, 77, 255, 0.2)' }} />

      <Typography variant="subtitle1" sx={{ color: 'rgba(255,255,255,0.8)', mb:1 }}>Details</Typography>
      <TextField
        label="Short Description"
        placeholder="Brief summary of your article (helps with SEO)"
        fullWidth
        multiline
        rows={3}
        value={description}
        onChange={onDescriptionChange}
        variant="outlined"
        sx={{
          mb: 2,
          '& .MuiOutlinedInput-root': {
            bgcolor: 'rgba(0,0,0,0.2)',
            '& fieldset': { borderColor: 'rgba(156, 77, 255, 0.3)' },
            '&:hover fieldset': { borderColor: 'rgba(156, 77, 255, 0.5)' },
            '&.Mui-focused fieldset': { borderColor: '#9c4dff' },
          },
          '& .MuiInputLabel-root': { color: 'rgba(255,255,255,0.7)' },
          '& .MuiInputBase-input': { color: 'white' },
        }}
      />
      
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
                mr: 0.5, mb: 0.5,
                '& .MuiChip-deleteIcon': {
                  color: 'rgba(255,255,255,0.7)',
                  '&:hover': { color: 'white' },
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
              mb: 2,
              '& .MuiOutlinedInput-root': {
                bgcolor: 'rgba(0,0,0,0.2)',
                '& fieldset': { borderColor: 'rgba(156, 77, 255, 0.3)' },
                '&:hover fieldset': { borderColor: 'rgba(156, 77, 255, 0.5)' },
                '&.Mui-focused fieldset': { borderColor: '#9c4dff' },
              },
              '& .MuiInputLabel-root': { color: 'rgba(255,255,255,0.7)' },
              '& .MuiInputBase-input': { color: 'white' },
              '& .MuiAutocomplete-tag': {
                bgcolor: 'rgba(156, 77, 255, 0.2)',
                color: 'white',
              }
            }}
          />
        )}
      />
      <Typography variant="caption" sx={{color: 'rgba(255,255,255,0.6)', display:'block', mb:2}}>
        Adding tags and a description helps readers find your content.
      </Typography>

      <Divider sx={{ my: 3, bgcolor: 'rgba(156, 77, 255, 0.2)' }} />

      <Typography variant="subtitle1" sx={{ color: 'rgba(255,255,255,0.8)', mb: 2 }}>NFT Minting</Typography>
      <TextField
        label="Mint Price (in MIST)"
        placeholder="e.g., 100000000 for 0.1 SUI"
        fullWidth
        value={mintPrice}
        onChange={onMintPriceChange}
        type="number"
        variant="outlined"
        sx={{ mb: 2, '& .MuiOutlinedInput-root': { bgcolor: 'rgba(0,0,0,0.2)', '& fieldset': { borderColor: 'rgba(156, 77, 255, 0.3)' }, '&:hover fieldset': { borderColor: 'rgba(156, 77, 255, 0.5)' }, '&.Mui-focused fieldset': { borderColor: '#9c4dff' } }, '& .MuiInputLabel-root': { color: 'rgba(255,255,255,0.7)' }, '& .MuiInputBase-input': { color: 'white' } }}
        helperText="1 SUI = 1,000,000,000 MIST"
      />
      <TextField
        label="Mint Capacity"
        placeholder="e.g., 100"
        fullWidth
        value={mintCapacity}
        onChange={onMintCapacityChange}
        type="number"
        variant="outlined"
        sx={{ mb: 2, '& .MuiOutlinedInput-root': { bgcolor: 'rgba(0,0,0,0.2)', '& fieldset': { borderColor: 'rgba(156, 77, 255, 0.3)' }, '&:hover fieldset': { borderColor: 'rgba(156, 77, 255, 0.5)' }, '&.Mui-focused fieldset': { borderColor: '#9c4dff' } }, '& .MuiInputLabel-root': { color: 'rgba(255,255,255,0.7)' }, '& .MuiInputBase-input': { color: 'white' } }}
      />
      <TextField
        label="Royalty Fee (%)"
        placeholder="e.g., 5 for 5%"
        fullWidth
        value={bpsToPercent(royaltyFeeBps)}
        onChange={(e) => {
            const percentValue = e.target.value;
            if (/^\d*\.?\d*$/.test(percentValue)) {
                 onRoyaltyFeeBpsChange({
                    target: { value: percentToBps(percentValue) }
                 } as any);
            } else if (percentValue === '') {
                 onRoyaltyFeeBpsChange({ target: { value: 0 } } as any);
            }
        }}
        type="text"
        variant="outlined"
        sx={{ mb: 2, '& .MuiOutlinedInput-root': { bgcolor: 'rgba(0,0,0,0.2)', '& fieldset': { borderColor: 'rgba(156, 77, 255, 0.3)' }, '&:hover fieldset': { borderColor: 'rgba(156, 77, 255, 0.5)' }, '&.Mui-focused fieldset': { borderColor: '#9c4dff' } }, '& .MuiInputLabel-root': { color: 'rgba(255,255,255,0.7)' }, '& .MuiInputBase-input': { color: 'white' } }}
        helperText="Royalty fee in percentage (e.g., 2.5 for 2.5%)"
      />
    </Paper>
  );
};

export default MetadataPanel; 