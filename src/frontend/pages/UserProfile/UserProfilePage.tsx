import AttachMoney from "@mui/icons-material/AttachMoney";
import Chat from "@mui/icons-material/Chat";
import Favorite from "@mui/icons-material/Favorite";
import Language from "@mui/icons-material/Language";
import LocationOn from "@mui/icons-material/LocationOn";
import Twitter from "@mui/icons-material/Twitter";
import Visibility from "@mui/icons-material/Visibility";
import {
  Avatar,
  Box,
  Button,
  Card,
  CardContent,
  CardMedia,
  Chip,
  Container,
  Grid,
  Stack,
  Tab,
  Tabs,
  Typography,
} from "@mui/material";
import React from "react";
import { DefaultLayout } from "../../layouts";

const UserProfilePage: React.FC = () => {
  // User profile data
  const userData = {
    name: "Elena Wright",
    walletAddress: "0x8976...1234",
    joinDate: "April 2024",
    followers: "1.2K",
    following: "567",
    bio: "Web3 storyteller and digital art enthusiast. Creating narratives at the intersection of blockchain and creativity.",
    location: "San Francisco, CA",
    website: "elenawright.com",
    twitter: "@elenawright",
    discord: "elena#1234",
  };

  // Statistics data
  const statsData = [
    { value: "23", label: "Stories" },
    { value: "45.2K", label: "Views" },
    { value: "12.4K", label: "Reactions" },
    { value: "456.8", label: "SUI Tips" },
  ];

  // Achievements data
  const achievementsData = [
    {
      emoji: "🏆",
      title: "Top Writer",
      description: "Reached 1000+ followers",
    },
    { emoji: "⭐", title: "Rising Star", description: "10 featured stories" },
    { emoji: "💫", title: "Creative Pioneer", description: "First NFT story" },
  ];

  // Stories data
  const storiesData = [
    {
      title: "The Digital Renaissance",
      timeAgo: "2 days ago",
      readTime: "8 min",
      views: "2.3K",
      likes: "156",
      tips: "23.4 SUI",
    },
    {
      title: "Web3 Chronicles",
      timeAgo: "1 week ago",
      readTime: "12 min",
      views: "1.8K",
      likes: "98",
      tips: "15.7 SUI",
    },
    {
      title: "Blockchain Dreams",
      timeAgo: "2 weeks ago",
      readTime: "6 min",
      views: "3.1K",
      likes: "234",
      tips: "45.2 SUI",
    },
  ];

  const [tabValue, setTabValue] = React.useState(0);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  return (
    <DefaultLayout>
      <Box
        sx={{
          bgcolor: "white",
          display: "flex",
          justifyContent: "center",
          width: "100%",
        }}
      >
        <Box sx={{ width: "100%", maxWidth: 1271, bgcolor: "#f7f7ff" }}>
          {/* Profile Banner */}
          <Box sx={{ position: "relative", mt: 0 }}>
            <Box sx={{ height: 300, bgcolor: "#d9d9d9" }} />
            <Box
              sx={{
                height: 100,
                position: "relative",
                top: -100,
                background:
                  "linear-gradient(90deg, rgba(0,0,0,0) 100%, rgba(0,0,0,0.5) 0%)",
              }}
            />

            <Avatar
              sx={{
                width: 160,
                height: 160,
                border: 4,
                borderColor: "white",
                bgcolor: "#d9d9d9",
                position: "relative",
                top: -220,
                left: 52,
                boxShadow: "0px 4px 12px rgba(0, 0, 0, 0.1)",
              }}
            />

            <Box sx={{ mt: -21, ml: 29 }}>
              <Typography variant="h4" fontWeight="bold" color="#4318d1">
                {userData.name}
              </Typography>

              <Stack
                direction="row"
                spacing={1}
                alignItems="center"
                sx={{ mt: 1 }}
              >
                <Typography variant="body1" color="#666666">
                  {userData.walletAddress}
                </Typography>
                <Box
                  sx={{
                    width: 4,
                    height: 4,
                    bgcolor: "#666666",
                    borderRadius: "50%",
                  }}
                />
                <Typography variant="body1" color="#666666">
                  Joined
                </Typography>
                <Typography variant="body1" color="#666666">
                  {userData.joinDate}
                </Typography>
              </Stack>

              <Stack direction="row" spacing={2} sx={{ mt: 2 }}>
                <Typography variant="body1">
                  <Typography component="span" fontWeight="600" color="#4318d1">
                    {userData.followers}
                  </Typography>{" "}
                  <Typography component="span" color="#666666">
                    Followers
                  </Typography>
                </Typography>

                <Typography variant="body1">
                  <Typography component="span" fontWeight="600" color="#4318d1">
                    {userData.following}
                  </Typography>{" "}
                  <Typography component="span" color="#666666">
                    Following
                  </Typography>
                </Typography>
              </Stack>
            </Box>

            <Stack
              direction="row"
              spacing={2}
              sx={{
                position: "absolute",
                top: 324,
                right: 52,
              }}
            >
              <Button
                variant="outlined"
                sx={{
                  borderColor: "#4318d1",
                  color: "#4318d1",
                  height: 42,
                  width: 137,
                  textTransform: "none",
                  fontWeight: "normal",
                }}
              >
                Edit Profile
              </Button>
              <Button
                variant="contained"
                sx={{
                  bgcolor: "#4318d1",
                  color: "white",
                  height: 42,
                  width: 100,
                  textTransform: "none",
                  fontWeight: "normal",
                  "&:hover": {
                    bgcolor: "#3a14b8",
                  },
                }}
              >
                Follow
              </Button>
            </Stack>
          </Box>

          {/* Main Content */}
          <Container maxWidth="lg" sx={{ mt: 8 }}>
            <Grid container spacing={3}>
              {/* Left Column */}
              <Grid item xs={12} md={4}>
                {/* Bio Card */}
                <Card
                  sx={{
                    mb: 3,
                    boxShadow: "0px 4px 12px rgba(0, 0, 0, 0.1)",
                    borderRadius: 2,
                  }}
                >
                  <CardContent>
                    <Typography variant="body1" color="#333333" sx={{ mb: 3 }}>
                      {userData.bio}
                    </Typography>

                    <Stack spacing={2.5}>
                      <Stack direction="row" spacing={1.5} alignItems="center">
                        <LocationOn fontSize="small" color="action" />
                        <Typography variant="body1" color="#666666">
                          {userData.location}
                        </Typography>
                      </Stack>

                      <Stack direction="row" spacing={1.5} alignItems="center">
                        <Language fontSize="small" color="action" />
                        <Typography variant="body1" color="#4318d1">
                          {userData.website}
                        </Typography>
                      </Stack>

                      <Stack direction="row" spacing={1.5} alignItems="center">
                        <Twitter fontSize="small" color="action" />
                        <Typography variant="body1" color="#666666">
                          {userData.twitter}
                        </Typography>
                      </Stack>

                      <Stack direction="row" spacing={1.5} alignItems="center">
                        <Chat fontSize="small" color="action" />
                        <Typography variant="body1" color="#666666">
                          {userData.discord}
                        </Typography>
                      </Stack>
                    </Stack>
                  </CardContent>
                </Card>

                {/* Statistics Card */}
                <Card
                  sx={{
                    mb: 3,
                    boxShadow: "0px 4px 12px rgba(0, 0, 0, 0.1)",
                    borderRadius: 2,
                  }}
                >
                  <CardContent>
                    <Typography
                      variant="h6"
                      fontWeight="600"
                      color="#4318d1"
                      sx={{ mb: 2 }}
                    >
                      Statistics
                    </Typography>

                    <Grid container spacing={2}>
                      {statsData.slice(0, 2).map((stat, index) => (
                        <Grid item xs={6} key={index}>
                          <Box sx={{ textAlign: "center" }}>
                            <Typography
                              variant="h4"
                              fontWeight="bold"
                              color="#4318d1"
                            >
                              {stat.value}
                            </Typography>
                            <Typography variant="body1" color="#666666">
                              {stat.label}
                            </Typography>
                          </Box>
                        </Grid>
                      ))}
                    </Grid>

                    <Box sx={{ mt: 2 }}>
                      <Grid container spacing={2}>
                        {statsData.slice(2, 4).map((stat, index) => (
                          <Grid item xs={6} key={index}>
                            <Box sx={{ textAlign: "center" }}>
                              <Typography
                                variant="h4"
                                fontWeight="bold"
                                color="#4318d1"
                              >
                                {stat.value}
                              </Typography>
                              <Typography variant="body1" color="#666666">
                                {stat.label}
                              </Typography>
                            </Box>
                          </Grid>
                        ))}
                      </Grid>
                    </Box>
                  </CardContent>
                </Card>

                {/* Achievements Card */}
                <Card
                  sx={{
                    boxShadow: "0px 4px 12px rgba(0, 0, 0, 0.1)",
                    borderRadius: 2,
                  }}
                >
                  <CardContent>
                    <Typography
                      variant="h6"
                      fontWeight="600"
                      color="#4318d1"
                      sx={{ mb: 2 }}
                    >
                      Achievements
                    </Typography>

                    <Stack spacing={3}>
                      {achievementsData.map((achievement, index) => (
                        <Stack direction="row" spacing={1.5} key={index}>
                          <Typography variant="h5">
                            {achievement.emoji}
                          </Typography>
                          <Box>
                            <Typography
                              variant="body1"
                              fontWeight="600"
                              color="#4318d1"
                            >
                              {achievement.title}
                            </Typography>
                            <Typography variant="body2" color="#666666">
                              {achievement.description}
                            </Typography>
                          </Box>
                        </Stack>
                      ))}
                    </Stack>
                  </CardContent>
                </Card>
              </Grid>

              {/* Right Column - Stories */}
              <Grid item xs={12} md={8}>
                <Card
                  sx={{
                    boxShadow: "0px 4px 12px rgba(0, 0, 0, 0.1)",
                    borderRadius: 2,
                  }}
                >
                  <Box sx={{ borderBottom: 1, borderColor: "#f7f7ff", px: 3 }}>
                    <Tabs
                      value={tabValue}
                      onChange={handleTabChange}
                      TabIndicatorProps={{
                        style: {
                          backgroundColor: "#4318d1",
                        },
                      }}
                    >
                      <Tab
                        label="Stories"
                        sx={{
                          textTransform: "none",
                          fontWeight: 500,
                          color: tabValue === 0 ? "#4318d1" : "#666666",
                          "&.Mui-selected": {
                            color: "#4318d1",
                          },
                        }}
                      />
                      <Tab
                        label="Drafts"
                        sx={{
                          textTransform: "none",
                          fontWeight: 500,
                          color: tabValue === 1 ? "#4318d1" : "#666666",
                          "&.Mui-selected": {
                            color: "#4318d1",
                          },
                        }}
                      />
                      <Tab
                        label="Collections"
                        sx={{
                          textTransform: "none",
                          fontWeight: 500,
                          color: tabValue === 2 ? "#4318d1" : "#666666",
                          "&.Mui-selected": {
                            color: "#4318d1",
                          },
                        }}
                      />
                    </Tabs>
                  </Box>

                  <CardContent>
                    <Grid container spacing={3}>
                      {storiesData.map((story, index) => (
                        <Grid item xs={12} sm={6} key={index}>
                          <Card
                            sx={{
                              border: "1px solid #f7f7ff",
                              boxShadow: "none",
                              borderRadius: 2,
                              height: "100%",
                            }}
                          >
                            <CardMedia
                              component="div"
                              sx={{ height: 200, bgcolor: "#d9d9d9" }}
                            />
                            <CardContent>
                              <Typography
                                variant="h6"
                                fontWeight="600"
                                color="#4318d1"
                                gutterBottom
                              >
                                {story.title}
                              </Typography>

                              <Box
                                sx={{
                                  display: "flex",
                                  justifyContent: "space-between",
                                  mb: 2,
                                }}
                              >
                                <Typography variant="body2" color="#666666">
                                  {story.timeAgo}
                                </Typography>
                                <Typography variant="body2" color="#666666">
                                  {story.readTime}
                                </Typography>
                              </Box>

                              <Stack direction="row" spacing={3}>
                                <Stack
                                  direction="row"
                                  spacing={0.5}
                                  alignItems="center"
                                >
                                  <Visibility fontSize="small" color="action" />
                                  <Typography variant="body1" color="#666666">
                                    {story.views}
                                  </Typography>
                                </Stack>

                                <Stack
                                  direction="row"
                                  spacing={0.5}
                                  alignItems="center"
                                >
                                  <Favorite fontSize="small" color="action" />
                                  <Typography variant="body1" color="#666666">
                                    {story.likes}
                                  </Typography>
                                </Stack>

                                <Stack
                                  direction="row"
                                  spacing={0.5}
                                  alignItems="center"
                                >
                                  <AttachMoney fontSize="small" color="action" />
                                  <Typography variant="body1" color="#666666">
                                    {story.tips}
                                  </Typography>
                                </Stack>
                              </Stack>
                            </CardContent>
                          </Card>
                        </Grid>
                      ))}
                    </Grid>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </Container>
        </Box>
      </Box>
    </DefaultLayout>
  );
};

export default UserProfilePage; 