import React from 'react';
import { Box, Typography, IconButton } from '@mui/material';
import AddPhotoAlternateIcon from '@mui/icons-material/AddPhotoAlternate';

interface CoverImageUploadProps {
  coverImage: string;
  onCoverUpload: (event: React.ChangeEvent<HTMLInputElement>) => void;
  isUploading?: boolean;
}

const CoverImageUpload: React.FC<CoverImageUploadProps> = ({ 
  coverImage, 
  onCoverUpload,
  isUploading
}) => {
  return (
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
              onChange={onCoverUpload}
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
            onChange={onCoverUpload}
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
  );
};

export default CoverImageUpload; 