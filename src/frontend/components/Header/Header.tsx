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
  Drawer,
  List,
  ListItem,
  ListItemText,
  Divider,
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import CloseIcon from '@mui/icons-material/Close';
import SuiTaleIcon from '../../assets/images/SuiTaleIcon.png';
import { navigationLinks } from '../../data';
import { generatePath, useNavigate } from "react-router-dom";

export const Header: React.FC = () => {
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleMobileMenuOpen = (event: React.MouseEvent) => {
    setMobileMenuOpen(true);
  };

  const handleMobileMenuClose = () => {
    setMobileMenuOpen(false);
  };

  const handleMenuItemClick = (route: string) => {
    navigate(generatePath(route));
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
            <Button 
              key={link.path} 
              color="inherit"
              onClick={() => handleMenuItemClick(link.path)}
            >
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
          anchor="right"
          open={mobileMenuOpen}
          onClose={handleMobileMenuClose}
          sx={{
            '& .MuiDrawer-paper': {
              width: 280,
              boxSizing: 'border-box',
              backgroundColor: '#ffffff',
            },
          }}
        >
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'flex-end',
              alignItems: 'center',
              p: 1.5,
            }}
          >
            <IconButton onClick={handleMobileMenuClose}>
              <CloseIcon />
            </IconButton>
          </Box>
          <List sx={{ pt: 0 }}>
            {navigationLinks.map((link, index) => (
              <React.Fragment key={link.path}>
                <ListItem
                  onClick={() => {
                    handleMenuItemClick(link.path);
                    handleMobileMenuClose();
                  }}
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
                      fontSize: '1.1rem',
                    }}
                  />
                </ListItem>
                {index < navigationLinks.length - 1 && <Divider />}
              </React.Fragment>
            ))}
          </List>
        </Drawer>
      </Toolbar>
    </AppBar>
  );
}; 