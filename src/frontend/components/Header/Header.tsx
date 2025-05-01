import React, { useState } from 'react';
import {
  AppBar,
  Avatar,
  Box,
  Button,
  IconButton,
  Stack,
  Toolbar,
  Typography,
  Menu,
  MenuItem,
  Drawer,
  List,
  ListItem,
  ListItemText,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import MenuIcon from '@mui/icons-material/Menu';
import SuiTaleIcon from '../../assets/images/SuiTaleIcon.png';
import { navigationLinks } from '../../data';

export const Header: React.FC = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleMobileMenuOpen = () => {
    setMobileMenuOpen(true);
  };

  const handleMobileMenuClose = () => {
    setMobileMenuOpen(false);
  };

  return (
    <AppBar position="static" color="transparent" elevation={0}>
      <Toolbar sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
        <Box display="flex" alignItems="center" sx={{ flexGrow: 1 }}>
          <Avatar
            src={SuiTaleIcon}
            alt="SuiTale Logo"
            sx={{ mr: 1 }}
          />
          <Typography variant="h6" component="div" color="primary">
            SuiTale
          </Typography>
        </Box>

        <Stack direction="row" spacing={3} sx={{ mr: 4, display: { xs: 'none', md: 'flex' }, flexWrap: 'wrap' }}>
          {navigationLinks.map((link) => (
            <Button key={link.path} color="inherit">
              {link.title}
            </Button>
          ))}
        </Stack>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Button
            variant="contained"
            color="primary"
            sx={{ borderRadius: 2 }}
          >
            Connect Wallet
          </Button>

          <IconButton
            sx={{ display: { md: 'none' } }}
            onClick={handleMobileMenuOpen}
          >
            <MenuIcon />
          </IconButton>
        </Box>

        <Drawer
          anchor="top"
          open={mobileMenuOpen}
          onClose={handleMobileMenuClose}
          sx={{
            '& .MuiDrawer-paper': {
              width: '100%',
              position: 'fixed',
              top: 64,
              boxShadow: 3,
            },
          }}
        >
          <List>
            {navigationLinks.map((link) => (
              <ListItem
                key={link.path}
                onClick={handleMobileMenuClose}
                sx={{
                  py: 2,
                  px: 3,
                  '&:hover': {
                    bgcolor: 'action.hover',
                  },
                }}
              >
                <ListItemText
                  primary={link.title}
                  primaryTypographyProps={{
                    variant: 'body1',
                    fontWeight: 'medium',
                  }}
                />
              </ListItem>
            ))}
          </List>
        </Drawer>
      </Toolbar>
    </AppBar>
  );
}; 