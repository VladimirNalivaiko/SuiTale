import React, { useState } from 'react';
import {
  Box,
  Typography,
  TextField,
  Button,
  Stack,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Card,
  CardContent,
} from '@mui/material';
import { DefaultLayout } from '../../layouts/DefaultLayout';

const CreateStoryPage: React.FC = () => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState('');
  const [coverImage, setCoverImage] = useState<File | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Implement story creation logic
    console.log({ title, content, category, coverImage });
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setCoverImage(e.target.files[0]);
    }
  };

  return (
    <DefaultLayout>
      <Box sx={{ p: 4, bgcolor: '#f7f7ff' }}>
        <Typography variant="h4" component="h1" sx={{ mb: 4, color: '#4318d1', fontWeight: 'bold' }}>
          Create New Story
        </Typography>

        <Card sx={{ maxWidth: 800, mx: 'auto' }}>
          <CardContent>
            <form onSubmit={handleSubmit}>
              <Stack spacing={4}>
                <TextField
                  label="Story Title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  fullWidth
                  required
                  sx={{ '& .MuiOutlinedInput-root': { bgcolor: '#fff' } }}
                />

                <TextField
                  label="Story Content"
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  fullWidth
                  required
                  multiline
                  rows={10}
                  sx={{ '& .MuiOutlinedInput-root': { bgcolor: '#fff' } }}
                />

                <FormControl fullWidth>
                  <InputLabel>Category</InputLabel>
                  <Select
                    value={category}
                    label="Category"
                    onChange={(e) => setCategory(e.target.value)}
                    sx={{ bgcolor: '#fff' }}
                  >
                    <MenuItem value="fiction">Fiction</MenuItem>
                    <MenuItem value="non-fiction">Non-Fiction</MenuItem>
                    <MenuItem value="poetry">Poetry</MenuItem>
                    <MenuItem value="essay">Essay</MenuItem>
                  </Select>
                </FormControl>

                <Box>
                  <Typography variant="subtitle1" sx={{ mb: 1 }}>
                    Cover Image
                  </Typography>
                  <Button
                    variant="outlined"
                    component="label"
                    sx={{ mr: 2 }}
                  >
                    Upload Image
                    <input
                      type="file"
                      hidden
                      accept="image/*"
                      onChange={handleImageChange}
                    />
                  </Button>
                  {coverImage && (
                    <Typography variant="body2" color="text.secondary">
                      {coverImage.name}
                    </Typography>
                  )}
                </Box>

                <Button
                  type="submit"
                  variant="contained"
                  size="large"
                  sx={{
                    bgcolor: '#4318d1',
                    '&:hover': { bgcolor: '#3a14b8' },
                  }}
                >
                  Publish Story
                </Button>
              </Stack>
            </form>
          </CardContent>
        </Card>
      </Box>
    </DefaultLayout>
  );
};

export default CreateStoryPage; 