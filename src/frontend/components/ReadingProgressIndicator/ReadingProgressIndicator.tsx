import React from 'react';
import {
  Box,
  LinearProgress,
  Typography,
  Fade,
  useTheme
} from '@mui/material';
import { AccessTime as AccessTimeIcon, CheckCircle as CheckCircleIcon } from '@mui/icons-material';
import { getReadingProgressStyles } from './ReadingProgressIndicator.styles';

interface ReadingProgressIndicatorProps {
  /** Progress percentage (0-100) */
  progress: number;
  /** Whether reading is complete */
  isComplete: boolean;
  /** Estimated time remaining in minutes */
  estimatedTimeRemaining: number;
  /** Position of the indicator */
  position?: 'top' | 'bottom';
  /** Whether to show detailed info (time remaining) */
  showDetails?: boolean;
  /** Minimum progress to show the indicator */
  minimumProgress?: number;
  /** Custom className */
  className?: string;
}

/**
 * Reading Progress Indicator Component
 * Shows a progress bar with optional time remaining information
 */
export const ReadingProgressIndicator: React.FC<ReadingProgressIndicatorProps> = ({
  progress,
  isComplete,
  estimatedTimeRemaining,
  position = 'top',
  showDetails = true,
  minimumProgress = 5,
  className
}) => {
  const theme = useTheme();
  const styles = getReadingProgressStyles(theme);
  
  const shouldShow = progress >= minimumProgress || isComplete;

  return (
    <Fade in={shouldShow} timeout={300}>
      <Box
        className={className}
        sx={styles.container[position]}
      >
        {/* Progress Bar */}
        <LinearProgress
          variant="determinate"
          value={progress}
          sx={{
            ...styles.progressBar,
            '& .MuiLinearProgress-bar': {
              ...styles.progressBar['& .MuiLinearProgress-bar'],
              backgroundColor: isComplete 
                ? styles.progressBarColors.complete
                : styles.progressBarColors.normal,
            }
          }}
        />

        {/* Details Section */}
        {showDetails && (
          <Box sx={styles.detailsSection}>
            {/* Progress Percentage */}
            <Typography
              variant="caption"
              sx={styles.progressText}
            >
              {isComplete ? (
                <>
                  <CheckCircleIcon sx={styles.icons.complete} />
                  Reading Complete
                </>
              ) : (
                `${progress}% read`
              )}
            </Typography>

            {/* Time Remaining */}
            {!isComplete && estimatedTimeRemaining > 0 && (
              <Typography
                variant="caption"
                sx={styles.timeText}
              >
                <AccessTimeIcon sx={styles.icons.time} />
                {estimatedTimeRemaining === 1 
                  ? '~1 min left'
                  : `~${estimatedTimeRemaining} mins left`
                }
              </Typography>
            )}
          </Box>
        )}
      </Box>
    </Fade>
  );
}; 