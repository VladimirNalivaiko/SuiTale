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
  useTheme,
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import CloseIcon from '@mui/icons-material/Close';
import Brightness4Icon from '@mui/icons-material/Brightness4';
import Brightness7Icon from '@mui/icons-material/Brightness7';
import SuiTaleIcon from '../../assets/images/SuiTaleIcon.png';
import { navigationLinks } from '../../data';
import { generatePath, useNavigate } from "react-router-dom";
import { useAppTheme } from '../../contexts/ThemeContext';

export const Header: React.FC = () => {
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { mode, toggleTheme, theme: appTheme } = useAppTheme();
  const muiTheme = useTheme();

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
    <AppBar position="static" color="default" elevation={0} sx={{ bgcolor: 'transparent' }}>
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
              sx={{ color: 'text.primary' }}
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

          <IconButton onClick={toggleTheme} color="inherit">
            {mode === 'dark' ? <Brightness7Icon /> : <Brightness4Icon />}
          </IconButton>

          <IconButton
            sx={{ display: { md: 'none' }, color: 'text.primary' }}
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
              backgroundColor: appTheme.palette.background.paper,
            },
          }}
        >
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'flex-end',
              alignItems: 'center',
              p: 1.5,
              borderBottom: `1px solid ${appTheme.palette.divider}`,
            }}
          >
            <IconButton onClick={handleMobileMenuClose} sx={{ color: 'text.primary' }}>
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
                      bgcolor: appTheme.palette.action.hover,
                    },
                  }}
                >
                  <ListItemText
                    primary={link.title}
                    primaryTypographyProps={{
                      variant: 'body1',
                      fontWeight: 'medium',
                      fontSize: '1.1rem',
                      color: appTheme.palette.text.primary,
                    }}
                  />
                </ListItem>
                {index < navigationLinks.length - 1 && <Divider sx={{ bgcolor: appTheme.palette.divider }} />}
              </React.Fragment>
            ))}
          </List>
        </Drawer>
      </Toolbar>
    </AppBar>
  );
}; 