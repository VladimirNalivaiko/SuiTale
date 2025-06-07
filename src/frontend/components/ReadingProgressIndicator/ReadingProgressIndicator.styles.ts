import { Theme, alpha } from '@mui/material';

export const getReadingProgressStyles = (theme: Theme) => ({
  // Container styles for different positions
  container: {
    top: {
      position: 'fixed' as const,
      top: 0,
      left: 0,
      right: 0,
      zIndex: theme.zIndex.appBar + 10, // Higher z-index to ensure visibility
      backgroundColor: alpha(theme.palette.background.paper, 0.95),
      backdropFilter: 'blur(8px)',
      borderBottom: `1px solid ${theme.palette.divider}`,
      boxShadow: `0 2px 8px ${alpha(theme.palette.common.black, 0.1)}`,
    },
    bottom: {
      position: 'fixed' as const,
      bottom: 0,
      left: 0,
      right: 0,
      zIndex: theme.zIndex.appBar + 10,
      backgroundColor: alpha(theme.palette.background.paper, 0.95),
      backdropFilter: 'blur(8px)',
      borderTop: `1px solid ${theme.palette.divider}`,
      boxShadow: `0 -2px 8px ${alpha(theme.palette.common.black, 0.1)}`,
    }
  },

  // Progress bar styles
  progressBar: {
    height: 3,
    backgroundColor: alpha(theme.palette.primary.main, 0.1),
    '& .MuiLinearProgress-bar': {
      transition: 'background-color 0.3s ease',
    }
  },

  // Progress bar colors
  progressBarColors: {
    normal: theme.palette.primary.main,
    complete: theme.palette.success.main,
  },

  // Details section styles
  detailsSection: {
    px: 2,
    py: 1,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    minHeight: 40,
  },

  // Progress text styles
  progressText: {
    color: 'text.secondary',
    fontWeight: 500,
    display: 'flex',
    alignItems: 'center',
    gap: 0.5,
  },

  // Time remaining text styles
  timeText: {
    color: 'text.secondary',
    display: 'flex',
    alignItems: 'center',
    gap: 0.5,
  },

  // Icon styles
  icons: {
    complete: {
      fontSize: 16,
      color: 'success.main',
    },
    time: {
      fontSize: 14,
    }
  }
}); 