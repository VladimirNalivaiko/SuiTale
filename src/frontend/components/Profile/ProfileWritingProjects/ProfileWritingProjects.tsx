import React from 'react';
import { Card, CardContent, List, ListItem, Typography, LinearProgress, Box } from '@mui/material';
import {
  cardStyles,
  cardContentStyles,
  titleStyles,
  listStyles,
  listItemStyles,
  projectTitleStyles,
  lastEditedStyles,
  progressBarStyles,
} from './ProfileWritingProjects.styles';

interface WritingProject {
  title: string;
  lastEdited: string;
  progress: number;
}

interface ProfileWritingProjectsProps {
  projects: WritingProject[];
}

const ProfileWritingProjects: React.FC<ProfileWritingProjectsProps> = ({ projects }) => {
  return (
    <Card sx={cardStyles}>
      <CardContent sx={cardContentStyles}>
        <Typography variant="h6" sx={titleStyles}>
          Writing Projects
        </Typography>
        <List sx={listStyles}>
          {projects.map((project, index) => (
            <ListItem key={index} sx={listItemStyles}>
              <Box sx={{ width: '100%' }}>
                <Typography variant="subtitle1" sx={projectTitleStyles}>
                  {project.title}
                </Typography>
                <Typography variant="body2" sx={lastEditedStyles}>
                  Last edited: {project.lastEdited}
                </Typography>
                <LinearProgress
                  variant="determinate"
                  value={project.progress}
                  sx={progressBarStyles}
                />
              </Box>
            </ListItem>
          ))}
        </List>
      </CardContent>
    </Card>
  );
};

export default ProfileWritingProjects; 