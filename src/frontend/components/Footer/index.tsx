import React from 'react';
import {
  Avatar,
  Box,
  Button,
  Container,
  Grid,
  IconButton,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import FacebookIcon from '@mui/icons-material/Facebook';
import InstagramIcon from '@mui/icons-material/Instagram';
import TwitterIcon from '@mui/icons-material/Twitter';
import { NavigationLink, ResourceLink } from '../../types';
import { navigationLinks, resourceLinks } from '../../data';

export const Footer: React.FC = () => {
  return (
    <Box
      component="footer"
      sx={{
        bgcolor: "primary.main",
        color: "white",
        py: 6,
      }}
    >
      <Container maxWidth="lg">
        <Grid container spacing={4}>
          {/* Brand Section */}
          <Grid item xs={12} md={3}>
            <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
              <Avatar
                src="https://c.animaapp.com/BGr9RM3o/img/image-7.png"
                alt="SuiTale Logo"
                sx={{ mr: 1 }}
              />
              <Typography variant="h6">SuiTale</Typography>
            </Box>
            <Typography variant="body2" sx={{ mb: 3 }}>
              Empowering storytellers in the Web3 era
            </Typography>
            <Stack direction="row" spacing={1}>
              <IconButton
                color="inherit"
                size="small"
                sx={{ bgcolor: "rgba(255,255,255,0.1)" }}
              >
                <TwitterIcon fontSize="small" />
              </IconButton>
              <IconButton
                color="inherit"
                size="small"
                sx={{ bgcolor: "rgba(255,255,255,0.1)" }}
              >
                <FacebookIcon fontSize="small" />
              </IconButton>
              <IconButton
                color="inherit"
                size="small"
                sx={{ bgcolor: "rgba(255,255,255,0.1)" }}
              >
                <InstagramIcon fontSize="small" />
              </IconButton>
            </Stack>
          </Grid>

          {/* Navigation Links */}
          <Grid item xs={12} md={3}>
            <Typography variant="subtitle1" gutterBottom>
              Navigation
            </Typography>
            <Stack spacing={1}>
              {navigationLinks.map((link) => (
                <Button
                  key={link.path}
                  color="inherit"
                  sx={{
                    justifyContent: "flex-start",
                    p: 0,
                    minWidth: "auto",
                    textTransform: "none",
                  }}
                >
                  {link.title}
                </Button>
              ))}
            </Stack>
          </Grid>

          {/* Resources Links */}
          <Grid item xs={12} md={3}>
            <Typography variant="subtitle1" gutterBottom>
              Resources
            </Typography>
            <Stack spacing={1}>
              {resourceLinks.map((link) => (
                <Button
                  key={link.path}
                  color="inherit"
                  sx={{
                    justifyContent: "flex-start",
                    p: 0,
                    minWidth: "auto",
                    textTransform: "none",
                  }}
                >
                  {link.title}
                </Button>
              ))}
            </Stack>
          </Grid>

          {/* Newsletter */}
          <Grid item xs={12} md={3}>
            <Typography variant="subtitle1" gutterBottom>
              Newsletter
            </Typography>
            <Typography variant="body2" sx={{ mb: 2 }}>
              Stay updated with the latest stories and features
            </Typography>
            <Box sx={{ display: "flex" }}>
              <TextField
                variant="outlined"
                placeholder="Enter your email"
                size="small"
                sx={{
                  bgcolor: "rgba(255,255,255,0.1)",
                  borderRadius: 1,
                  "& .MuiOutlinedInput-root": {
                    "& fieldset": {
                      borderColor: "transparent",
                    },
                    "&:hover fieldset": {
                      borderColor: "transparent",
                    },
                  },
                  input: { color: "white" },
                }}
                InputProps={{
                  endAdornment: (
                    <Button
                      variant="contained"
                      color="secondary"
                      size="small"
                    >
                      Subscribe
                    </Button>
                  ),
                }}
              />
            </Box>
          </Grid>
        </Grid>

        {/* Footer Bottom */}
        <Box
          sx={{
            mt: 6,
            pt: 3,
            borderTop: "1px solid rgba(255,255,255,0.1)",
            display: "flex",
            justifyContent: "space-between",
          }}
        >
          <Typography variant="body2">
            © 2024 SuiTale. All rights reserved.
          </Typography>
          <Stack direction="row" spacing={2}>
            <Button
              color="inherit"
              size="small"
              sx={{ textTransform: "none" }}
            >
              Terms
            </Button>
            <Button
              color="inherit"
              size="small"
              sx={{ textTransform: "none" }}
            >
              Privacy
            </Button>
            <Button
              color="inherit"
              size="small"
              sx={{ textTransform: "none" }}
            >
              Contact
            </Button>
          </Stack>
        </Box>
      </Container>
    </Box>
  );
}; 