import React, { useState, useEffect } from 'react';
import { Box, BoxProps } from '@mui/material';
import { TaleSummary } from '../api/tales.api';

// Use same env var as tales.api.ts - consistent API prefix usage
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

interface SmartTaleImageProps extends Omit<BoxProps, 'component'> {
  tale: TaleSummary;
  alt: string;
}

/**
 * Smart Tale Image component with automatic fallback
 * Uses fetch() + blob URL to avoid CORS/CSP issues
 */
export const SmartTaleImage: React.FC<SmartTaleImageProps> = ({ 
  tale, 
  alt, 
  sx,
  ...boxProps 
}) => {
  const [imgSrc, setImgSrc] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  
  useEffect(() => {
    let isMounted = true;
    
    const loadImage = async () => {
      try {
        console.log(`🔍 SmartTaleImage: Starting load for tale ${tale.id} (${tale.title})`);
        setIsLoading(true);
        setHasError(false);
        
        // Always use server endpoint first (which tries DB backup first)
        const serverUrl = `${API_BASE_URL}/tales/${tale.id}/cover`;
        console.log(`🖼️ Loading cover from server (DB backup): ${serverUrl}`);
        
        const response = await fetch(serverUrl);
        console.log(`📡 Server response status: ${response.status} for tale ${tale.id}`);
        
        if (response.ok) {
          const blob = await response.blob();
          if (isMounted) {
            const url = URL.createObjectURL(blob);
            setImgSrc(url);
            setIsLoading(false);
            
            // Log the source from response headers
            const source = response.headers.get('X-Source') || 'unknown';
            console.log(`✅ Cover loaded from: ${source} for tale ${tale.id}`);
          }
        } else {
          console.warn(`⚠️ Server returned ${response.status} for tale ${tale.id}`);
          throw new Error(`Server returned ${response.status}`);
        }
      } catch (error) {
        console.error(`❌ Failed to load cover image for tale ${tale.id}:`, error);
        if (isMounted) {
          setHasError(true);
          setIsLoading(false);
        }
      }
    };
    
    loadImage();
    
    return () => {
      isMounted = false;
      // Cleanup blob URL if it exists
      if (imgSrc && imgSrc.startsWith('blob:')) {
        URL.revokeObjectURL(imgSrc);
      }
    };
  }, [tale.id, tale.title]);
  
  if (isLoading) {
    return (
      <Box
        sx={{
          ...sx,
          backgroundColor: '#f0f0f0',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '12px',
          color: '#666',
        }}
        {...boxProps}
      >
        Loading...
      </Box>
    );
  }
  
  if (hasError || !imgSrc) {
    return (
      <Box
        sx={{
          ...sx,
          backgroundColor: '#f0f0f0',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '12px',
          color: '#999',
        }}
        {...boxProps}
      >
        No cover
      </Box>
    );
  }
  
  return (
    <Box
      component="img"
      src={imgSrc}
      alt={alt}
      sx={{
        ...sx,
      }}
      {...boxProps}
    />
  );
}; 