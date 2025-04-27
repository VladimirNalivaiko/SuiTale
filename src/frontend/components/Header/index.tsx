import React from 'react';
import { AppBar, Avatar, Box, Button, IconButton, Stack, Toolbar, Typography } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import { NavigationLink } from '../../types';
import { navigationLinks } from '../../data';

export const Header: React.FC = () => {
  return (
    <AppBar position="static" color="transparent" elevation={0}>
      <Toolbar>
        <Box display="flex" alignItems="center" sx={{ flexGrow: 1 }}>
          <Avatar
            src="https://c.animaapp.com/BGr9RM3o/img/image-7.png"
            alt="SuiTale Logo"
            sx={{ mr: 1 }}
          />
          <Typography variant="h6" component="div" color="primary">
            SuiTale
          </Typography>
        </Box>

        <Stack direction="row" spacing={3} sx={{ mr: 4 }}>
          {navigationLinks.map((link) => (
            <Button key={link.path} color="inherit">
              {link.title}
            </Button>
          ))}
        </Stack>

        <IconButton>
          <SearchIcon />
        </IconButton>

        <Button
          variant="contained"
          color="primary"
          sx={{ ml: 2, borderRadius: 2 }}
        >
          Connect Wallet
        </Button>
      </Toolbar>
    </AppBar>
  );
}; 