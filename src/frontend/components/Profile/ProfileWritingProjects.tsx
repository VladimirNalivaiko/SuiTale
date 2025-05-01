import React from 'react';
import {
  Box,
  Card,
  CardContent,
  LinearProgress,
  List,
  ListItem,
  ListItemText,
  Typography,
} from '@mui/material';

interface WritingProject {
  title: string;
  lastEdited: string;
  progress: number;
}

interface ProfileWritingProjectsProps {
  data: WritingProject[];
}

export const ProfileWritingProjects: React.FC<ProfileWritingProjectsProps> = ({ data }) => {
  return (
    <Card sx={{ mb: 4 }}>
      <CardContent>
        <Typography
          variant="h6"
          sx={{ mb: 3, fontWeight: "bold", color: "#4318d1" }}
        >
          Writing Projects
        </Typography>
        <List>
          {data.map((project, index) => (
            <ListItem
              key={index}
              sx={{
                borderBottom: "1px solid",
                borderColor: "divider",
                "&:last-child": {
                  borderBottom: "none",
                },
              }}
            >
              <ListItemText
                primary={
                  <Typography
                    variant="body1"
                    sx={{ fontWeight: 600, color: "#4318d1" }}
                  >
                    {project.title}
                  </Typography>
                }
                secondary={
                  <Box>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                      Last edited: {project.lastEdited}
                    </Typography>
                    <Box sx={{ display: "flex", alignItems: "center" }}>
                      <Box sx={{ width: "100%", mr: 1 }}>
                        <LinearProgress
                          variant="determinate"
                          value={project.progress}
                          sx={{
                            height: 8,
                            borderRadius: 4,
                            bgcolor: "#f7f7ff",
                            "& .MuiLinearProgress-bar": {
                              bgcolor: "#4318d1",
                            },
                          }}
                        />
                      </Box>
                      <Typography variant="body2" color="text.secondary">
                        {project.progress}%
                      </Typography>
                    </Box>
                  </Box>
                }
              />
            </ListItem>
          ))}
        </List>
      </CardContent>
    </Card>
  );
}; 