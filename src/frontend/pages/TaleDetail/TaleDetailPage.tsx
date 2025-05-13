import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Box, CircularProgress, Container, Typography, Alert, Button, Paper, Chip, Skeleton, Grid } from '@mui/material';
import { ArrowBack as ArrowBackIcon } from '@mui/icons-material';
import { DefaultLayout } from '../../layouts';
import { useTaleWithContent } from '../../hooks/useTales';
import { TaleWithContent } from '../../api/tales.api';

// Skeleton Component for Tale Detail Page
const TaleDetailSkeleton: React.FC = () => (
  <Paper elevation={3} sx={{ p: { xs: 2, sm: 3, md: 4 }, backgroundColor: '#ffffff' }}>
    <Skeleton variant="rectangular" width="100%" height={300} sx={{ borderRadius: '4px', mb: 3 }} />
    <Skeleton variant="text" sx={{ fontSize: '2.5rem' }} width="70%" /> {/* Mimic h3 */}
    <Box sx={{ mb: 2, display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 1, mt: 1 }}>
      <Skeleton variant="text" width={100} />
      <Skeleton variant="text" width={20} />
      <Skeleton variant="text" width={80} />
    </Box>
    <Box sx={{ mb: 3 }}>
      <Skeleton variant="rounded" width={60} height={24} sx={{ mr: 1, display: 'inline-block' }} />
      <Skeleton variant="rounded" width={70} height={24} sx={{ mr: 1, display: 'inline-block' }} />
    </Box>
    <Skeleton variant="text" sx={{ fontSize: '1rem', mb: 1 }} />
    <Skeleton variant="text" sx={{ fontSize: '1rem', mb: 1 }} />
    <Skeleton variant="text" sx={{ fontSize: '1rem', mb: 3 }} width="80%" />
    
    <Skeleton variant="rectangular" width="100%" height={50} sx={{ mt: 3, mb: 1.5 }}/>
    <Skeleton variant="text" sx={{ mb: 1 }} />
    <Skeleton variant="text" sx={{ mb: 1 }} />
    <Skeleton variant="text" width="90%" sx={{ mb: 1 }}/>
    <Skeleton variant="rectangular" width="100%" height={50} sx={{ mt: 3, mb: 1.5 }}/>
    <Skeleton variant="text" sx={{ mb: 1 }} />
    <Skeleton variant="text" sx={{ mb: 1 }} />
    <Skeleton variant="text" width="90%" sx={{ mb: 1 }}/>
  </Paper>
);

const TaleDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  // Removed the options object, relying on default behavior for undefined id in queryKey
  const { data: tale, isLoading, error, isError } = useTaleWithContent(id!); 

  if (!id) {
    return (
      <DefaultLayout>
        <Container maxWidth="md" sx={{ py: 4, backgroundColor: '#ffffff' }}>
          <Alert severity="error">Tale ID is missing. Cannot load the tale.</Alert>
          <Button variant="outlined" onClick={() => navigate(-1)} startIcon={<ArrowBackIcon />} sx={{ mt: 2 }}>
            Go Back
          </Button>
        </Container>
      </DefaultLayout>
    );
  }

  if (isLoading) {
    return (
      <DefaultLayout>
        <Container maxWidth="md" sx={{ py: 4, backgroundColor: '#ffffff' }}>
          <Button 
            variant="outlined" 
            onClick={() => navigate('/tales')} 
            startIcon={<ArrowBackIcon />} 
            sx={{ mb: 3 }}
          >
            Back to All Tales
          </Button>
          <TaleDetailSkeleton />
        </Container>
      </DefaultLayout>
    );
  }

  if (isError && error) {
    return (
      <DefaultLayout>
        <Container maxWidth="md" sx={{ py: 4, backgroundColor: '#ffffff' }}>
          <Alert severity="error">
            Failed to load tale: {error instanceof Error ? error.message : 'An unknown error occurred.'}
          </Alert>
          <Button variant="outlined" onClick={() => navigate(-1)} startIcon={<ArrowBackIcon />} sx={{ mt: 2 }}>
            Go Back
          </Button>
        </Container>
      </DefaultLayout>
    );
  }

  if (!tale) {
    return (
      <DefaultLayout>
        <Container maxWidth="md" sx={{ py: 4, backgroundColor: '#ffffff' }}>
          <Alert severity="info">Tale not found.</Alert>
           <Button variant="outlined" onClick={() => navigate(-1)} startIcon={<ArrowBackIcon />} sx={{ mt: 2 }}>
            Go Back
          </Button>
        </Container>
      </DefaultLayout>
    );
  }

  const createMarkup = (htmlString: string) => {
    return { __html: htmlString };
  };

  return (
    <DefaultLayout>
      <Container maxWidth="md" sx={{ py: 4, backgroundColor: '#ffffff' }}>
        <Button 
          variant="outlined" 
          onClick={() => navigate('/tales')} 
          startIcon={<ArrowBackIcon />} 
          sx={{ mb: 3 }}
        >
          Back to All Tales
        </Button>
        
        <Paper elevation={3} sx={{ p: { xs: 2, sm: 3, md: 4 }, backgroundColor: '#ffffff' /* Ensuring Paper is also white */ }}>
          {tale.coverImage && (
            <Box
              component="img"
              src={tale.coverImage}
              alt={tale.title}
              sx={{
                width: '100%',
                maxHeight: '400px',
                objectFit: 'cover',
                borderRadius: '4px',
                mb: 3,
              }}
            />
          )}
          <Typography variant="h3" component="h1" gutterBottom>
            {tale.title}
          </Typography>
          
          <Box sx={{ mb: 2, display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 1 }}>
            <Typography variant="caption" color="text.secondary">
              Reading time: {tale.readingTime} min
            </Typography>
            <Typography variant="caption" color="text.secondary">
              &bull;
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Words: {tale.wordCount}
            </Typography>
          </Box>

          {tale.tags && tale.tags.length > 0 && (
            <Box sx={{ mb: 3 }}>
              {tale.tags.map((tag) => (
                <Chip key={tag} label={tag} size="small" sx={{ mr: 1, mb: 1 }} />
              ))}
            </Box>
          )}
          
          <Typography variant="subtitle1" color="text.secondary" paragraph>
            {tale.description}
          </Typography>
          
          {(!tale.content || tale.content.trim() === '') ? (
            <Alert severity="info" sx={{mt: 3}}>The content for this tale is currently empty.</Alert>
          ) : (
            <Box 
              className="tale-content" 
              sx={{ 
                mt: 3,
                fontSize: '1rem', // Base font size for content
                backgroundColor: 'transparent', // Content block should inherit background
                '& p': { lineHeight: '1.7', mb: '1.25em' }, 
                '& h1, & h2, & h3, & h4, & h5, & h6': { mt: '1.5em', mb: '0.75em', lineHeight: '1.3' },
                '& h1': { fontSize: '2.2rem' },
                '& h2': { fontSize: '1.8rem' },
                '& h3': { fontSize: '1.5rem' },
                '& img': { maxWidth: '100%', height: 'auto', borderRadius: '4px', my: '1.5em', display: 'block', marginLeft: 'auto', marginRight: 'auto' },
                '& a': { color: 'primary.main', textDecoration: 'underline', '&:hover': { textDecoration: 'none' } },
                '& ul, & ol': { pl: '2em', mb: '1.25em', '& li': { mb: '0.5em', lineHeight: '1.6' } },
                '& blockquote': { borderLeft: '4px solid', borderColor: 'divider', pl: '1em', ml: 0, my: '1.5em', fontStyle: 'italic', color: 'text.secondary' },
                '& pre': { 
                  backgroundColor: 'action.hover', 
                  padding: '1em', 
                  borderRadius: '4px', 
                  overflowX: 'auto', 
                  fontSize: '0.9em', 
                  lineHeight: '1.5', 
                  my: '1.5em' 
                },
                '& code': { 
                  backgroundColor: 'action.hover', 
                  padding: '0.2em 0.4em', 
                  borderRadius: '3px', 
                  fontSize: '0.9em', 
                  fontFamily: 'monospace'
                },
                '& table': { width: '100%', borderCollapse: 'collapse', my: '1.5em' },
                '& th, & td': { border: '1px solid', borderColor: 'divider', padding: '0.5em 0.75em', textAlign: 'left' },
                '& th': { backgroundColor: 'action.focus' }
              }}
              dangerouslySetInnerHTML={createMarkup(tale.content)} 
            />
          )}
        </Paper>
      </Container>
    </DefaultLayout>
  );
};

export default TaleDetailPage; 