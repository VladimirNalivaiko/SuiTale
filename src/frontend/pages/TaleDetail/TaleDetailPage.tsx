import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Box, CircularProgress, Container, Typography, Alert, Button, Paper, Chip } from '@mui/material';
import { ArrowBack as ArrowBackIcon } from '@mui/icons-material';
import { DefaultLayout } from '../../layouts';
import { useTaleWithContent } from '../../hooks/useTales';
import { TaleWithContent } from '../../api/tales.api'; // Import the type

const TaleDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  // Ensure id is not undefined before calling the hook
  const { data: tale, isLoading, error, isError } = useTaleWithContent(id!, {
    enabled: !!id, // Only run the query if id is available
  });

  if (!id) {
    return (
      <DefaultLayout>
        <Container maxWidth="md" sx={{ py: 4 }}>
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
        <Container maxWidth="md" sx={{ py: 4, textAlign: 'center' }}>
          <CircularProgress />
          <Typography sx={{ mt: 2 }}>Loading tale content...</Typography>
        </Container>
      </DefaultLayout>
    );
  }

  if (isError && error) {
    return (
      <DefaultLayout>
        <Container maxWidth="md" sx={{ py: 4 }}>
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
        <Container maxWidth="md" sx={{ py: 4 }}>
          <Alert severity="info">Tale not found.</Alert>
           <Button variant="outlined" onClick={() => navigate(-1)} startIcon={<ArrowBackIcon />} sx={{ mt: 2 }}>
            Go Back
          </Button>
        </Container>
      </DefaultLayout>
    );
  }

  // Assuming tale.content is HTML string. For security, ensure it's sanitized if it comes from user input.
  // If it's plain text, you might want to format it (e.g., preserve newlines).
  // For Markdown, you'd use a Markdown parser.
  // Here, we'll use dangerouslySetInnerHTML for HTML content. Be cautious with this.
  const createMarkup = (htmlString: string) => {
    return { __html: htmlString };
  };

  return (
    <DefaultLayout>
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Button 
          variant="outlined" 
          onClick={() => navigate('/tales')} // Or navigate(-1) to go back to the previous page
          startIcon={<ArrowBackIcon />} 
          sx={{ mb: 3 }}
        >
          Back to All Tales
        </Button>
        
        <Paper elevation={3} sx={{ p: { xs: 2, sm: 3, md: 4 } }}>
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
          
          {/* Render the main content */}
          {/* Consider using a library to safely render HTML or Markdown */}
          <Box 
            className="tale-content" // For potential global styling
            sx={{ 
              mt: 3,
              '& p': { lineHeight: '1.6', mb: 2 }, // Example styling for paragraphs
              '& h1, & h2, & h3, & h4, & h5, & h6': { mt: 3, mb: 1.5 }, // Example styling for headers
              '& img': { maxWidth: '100%', height: 'auto', borderRadius: '4px', my: 2 }, // Example styling for images in content
              '& a': { color: 'primary.main', textDecoration: 'underline' } // Example styling for links
            }}
            dangerouslySetInnerHTML={createMarkup(tale.content)} 
          />
        </Paper>
      </Container>
    </DefaultLayout>
  );
};

export default TaleDetailPage; 