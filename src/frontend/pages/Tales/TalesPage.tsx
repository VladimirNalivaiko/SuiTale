import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Button, CircularProgress, Container, Grid, Typography, Alert, Skeleton, useTheme } from '@mui/material';
import { DefaultLayout } from '../../layouts';
import { useTales } from '../../hooks/useTales';
import { Tale } from '../../api/tales.api'; // Import Tale type from the api

const TALES_PER_PAGE = 12;

// Skeleton Card Component
const TaleCardSkeleton: React.FC = () => {
  const theme = useTheme();
  return (
    <Box
      sx={{
        border: `1px solid ${theme.palette.divider}`,
        borderRadius: '8px',
        padding: '16px',
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        backgroundColor: theme.palette.background.paper,
      }}
    >
      <Skeleton variant="rectangular" width="100%" height={150} sx={{ borderRadius: '4px', marginBottom: '12px' }} />
      <Skeleton variant="text" sx={{ fontSize: '1.25rem' }} width="80%" />
      <Skeleton variant="text" sx={{ fontSize: '0.875rem', mt: 1 }} />
      <Skeleton variant="text" sx={{ fontSize: '0.875rem' }} width="60%" />
    </Box>
  );
};

const TalesPage: React.FC = () => {
  const [allTales, setAllTales] = useState<Tale[]>([]);
  const [currentOffset, setCurrentOffset] = useState<number>(0);
  const [hasMoreToLoad, setHasMoreToLoad] = useState<boolean>(true);
  const navigate = useNavigate();
  const themeHook = useTheme();

  const { 
    data: newTales,
    isLoading, 
    isFetching,
    error,
    isError 
  } = useTales(TALES_PER_PAGE, currentOffset);

  useEffect(() => {
    if (newTales && newTales.length > 0) {
      setAllTales((prevTales) => {
        const existingIds = new Set(prevTales.map(t => t.id));
        const uniqueNewTales = newTales.filter(t => !existingIds.has(t.id));
        return [...prevTales, ...uniqueNewTales]; 
      });
      if (newTales.length < TALES_PER_PAGE) {
        setHasMoreToLoad(false);
      }
    } else if (newTales && newTales.length === 0 && currentOffset > 0) {
      setHasMoreToLoad(false);
    }
  }, [newTales]);


  const loadMoreTales = () => {
    if (hasMoreToLoad && !isFetching) {
      setCurrentOffset(prevOffset => prevOffset + TALES_PER_PAGE);
    }
  };

  const handleTaleClick = (taleId: string) => {
    navigate(`/tale/${taleId}`);
  };

  interface TaleCardProps {
    tale: Tale; 
    onClick: (id: string) => void;
  }

  const TaleCard: React.FC<TaleCardProps> = ({ tale, onClick }) => {
    return (
      <Box
        sx={{
          border: `1px solid ${themeHook.palette.divider}`,
          borderRadius: '8px',
          padding: '16px',
          cursor: 'pointer',
          transition: 'box-shadow 0.3s ease-in-out, transform 0.2s ease-in-out',
          backgroundColor: themeHook.palette.background.paper,
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          '&:hover': {
            boxShadow: themeHook.shadows[4],
            transform: 'translateY(-4px)',
          },
        }}
        onClick={() => onClick(String(tale.id))} 
      >
        {tale.coverImage && (
          <Box
            component="img"
            src={tale.coverImage}
            alt={tale.title}
            sx={{
              width: '100%',
              height: '150px', 
              objectFit: 'cover',
              borderRadius: '4px',
              marginBottom: '12px',
            }}
          />
        )}
        <Typography variant="h6" component="h3" gutterBottom sx={{ color: 'text.primary' }}>
          {tale.title}
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ flexGrow: 1 }}>
          {tale.description || 'No summary available.'}
        </Typography>
      </Box>
    );
  }

  // Show skeletons during initial load
  if (isLoading && currentOffset === 0) {
    return (
      <DefaultLayout>
        <Container maxWidth="lg" sx={{ py: 4 }}>
          <Typography variant="h3" component="h1" gutterBottom align="center" sx={{ mb: 4 }}>
            All Tales
          </Typography>
          <Grid container spacing={3}>
            {Array.from(new Array(6)).map((_, index) => ( // Show 6 skeletons, for example
              <Grid item xs={12} sm={6} md={4} key={`skeleton-${index}`}>
                <TaleCardSkeleton />
              </Grid>
            ))}
          </Grid>
        </Container>
      </DefaultLayout>
    );
  }

  if (isError && error) {
    return (
      <DefaultLayout>
        <Container maxWidth="lg" sx={{ py: 4 }}>
          <Typography variant="h3" component="h1" gutterBottom align="center" sx={{ mb: 4 }}>
            All Tales
          </Typography>
          <Alert severity="error" sx={{mt: 2}}>
            Failed to load tales: {error instanceof Error ? error.message : 'An unknown error occurred.'}
          </Alert>
        </Container>
      </DefaultLayout>
    );
  }
  
  return (
    <DefaultLayout>
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Typography variant="h3" component="h1" gutterBottom align="center" sx={{ mb: 4 }}>
          All Tales
        </Typography>
        
        {allTales.length === 0 && !isFetching && !hasMoreToLoad && (
           <Typography variant="h6" align="center" sx={{ my: 4 }}>
            No tales found. Check back later!
          </Typography>
        )}

        <Grid container spacing={3}>
          {allTales.map((tale) => (
            <Grid item xs={12} sm={6} md={4} key={tale.id}> 
              <TaleCard tale={tale} onClick={handleTaleClick} />
            </Grid>
          ))}
        </Grid>

        {/* Show CircularProgress for subsequent fetches (load more) */}
        {isFetching && (
          <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
            <CircularProgress />
          </Box>
        )}

        {hasMoreToLoad && !isFetching && allTales.length > 0 && (
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
            <Button variant="contained" onClick={loadMoreTales} disabled={isFetching}>
              Get more
            </Button>
          </Box>
        )}
        {!hasMoreToLoad && allTales.length > 0 && !isFetching && (
          <Typography variant="body1" align="center" sx={{ my: 4, color: 'text.secondary' }}>
            You've reached the end of the tales.
          </Typography>
        )}
      </Container>
    </DefaultLayout>
  );
};

export default TalesPage; 