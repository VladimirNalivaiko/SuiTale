import React from 'react';
import { Box, Container, Typography, Grid, useTheme } from '@mui/material';

// Предполагаемые пути к иконкам. Тебе нужно будет их заменить на актуальные.
const SuiLogoLight = '../../../assets/svg/companies/sui-light.svg'; // Пример для светлой темы
const SuiLogoDark = '../../../assets/svg/companies/sui-dark.svg';   // Пример для темной темы
const WalrusLogoLight = '../../../assets/svg/companies/walrus-light.svg';
const WalrusLogoDark = '../../../assets/svg/companies/walrus-dark.svg';

// Обновленная структура для логотипов компаний
const companyLogos = [
  { 
    id: 1, 
    name: 'Sui', 
    logoUrlLight: SuiLogoLight, // Используй текущий SuiLogo как light версию
    logoUrlDark: SuiLogoDark    // Сюда добавишь путь к темной версии Sui лого
  },
  { 
    id: 2, 
    name: 'Walrus', 
    logoUrlLight: WalrusLogoLight, // Используй текущий WalrusLogo как light версию
    logoUrlDark: WalrusLogoDark     // Сюда добавишь путь к темной версии Walrus лого
  },
  // Добавляй другие компании по аналогии
];

export const TrustedBy: React.FC = () => {
  const theme = useTheme();
  const currentMode = theme.palette.mode;

  return (
    <Box 
      sx={{ 
        py: 4, 
        bgcolor: 'background.default',
      }}
    >
      <Container maxWidth="lg">
        <Typography 
          variant="subtitle2" 
          color="text.secondary" 
          align="center" 
          sx={{ 
            mb: 3,
            textTransform: 'uppercase',
            letterSpacing: '1px',
            fontSize: '0.75rem'
          }}
        >
          Trusted by the most exciting projects in Sui
        </Typography>
        
        <Grid 
          container 
          spacing={3} 
          justifyContent="center"
          alignItems="center"
        >
          {companyLogos.map((company) => {
            const logoUrl = currentMode === 'light' ? company.logoUrlLight : company.logoUrlDark;
            return (
              <Grid item key={company.id} xs={6} sm={4} md={3} lg={2}>
                <Box 
                  sx={{ 
                    height: 40, 
                    display: 'flex', 
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Box 
                    sx={{
                      width: '100%',
                      maxWidth: 120, 
                      height: '100%',
                      borderRadius: 1 ,
                      backgroundImage:`url(${logoUrl})`,
                      backgroundSize: 'contain',
                      backgroundPosition: 'center',
                      backgroundRepeat: 'no-repeat',
                      transition: 'opacity 0.3s ease-in-out',
                      opacity: 0.85,
                      '&:hover': {
                        opacity: 1,
                      }
                    }}
                  />
                </Box>
              </Grid>
            );
          })}
        </Grid>
        
        <Typography 
          variant="body2" 
          color="text.secondary" 
          align="center" 
          sx={{ mt: 3, fontSize: '0.75rem' }}
        >
          And many more
        </Typography>
      </Container>
    </Box>
  );
}; 