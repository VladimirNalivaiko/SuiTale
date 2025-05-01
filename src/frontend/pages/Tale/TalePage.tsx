import Image from "@mui/icons-material/Image";
import Payments from "@mui/icons-material/Payments";
import Share from "@mui/icons-material/Share";
import {
  Avatar,
  Box,
  Button,
  Card,
  CardContent,
  CardMedia,
  Chip,
  Container,
  Divider,
  IconButton,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { DefaultLayout } from "../../layouts";

const TalePage: React.FC = () => {
  // Article data
  const articleData = {
    title: "The Digital Renaissance",
    date: "April 25, 2024",
    readTime: "8 min read",
    wordCount: "1650 words",
    author: {
      name: "Alex Thompson",
      wallet: "0x1357...2468",
      avatar: "",
    },
    content:
      "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.",
    tags: ["Web3", "Blockchain", "Storytelling", "Digital Art"],
    reactions: [
      { emoji: "❤", count: 124 },
      { emoji: "👏", count: 89 },
      { emoji: "🔥", count: 67 },
      { emoji: "💡", count: 45 },
    ],
  };

  // Comments data
  const commentsData = [
    {
      author: "Elena Wright",
      wallet: "0x8976...1234",
      timeAgo: "2 hours ago",
      content: "This is a fascinating perspective on Web3 storytelling!",
      likes: 12,
      replies: [
        {
          author: "Marcus Chen",
          wallet: "0x5432...9876",
          timeAgo: "1 hour ago",
          content: "Completely agree! The metaphors used are brilliant.",
          likes: 5,
        },
      ],
    },
    {
      author: "Sarah Johnson",
      wallet: "0x2468...1357",
      timeAgo: "3 hours ago",
      content:
        "The way you connected traditional storytelling with blockchain concepts is innovative.",
      likes: 8,
      replies: [],
    },
  ];

  return (
    <DefaultLayout>
      <Box sx={{ bgcolor: "background.default", minHeight: "100vh" }}>
        <Container maxWidth="lg" sx={{ py: 4 }}>
          {/* Article Card */}
          <Card elevation={4} sx={{ mb: 4, overflow: "visible", borderRadius: 2 }}>
            {/* Article Image */}
            <CardMedia component="div" sx={{ height: 400, bgcolor: "#d9d9d9" }} />

            <CardContent sx={{ p: 4, pt: 3 }}>
              {/* Article Header */}
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "flex-start",
                  mb: 2,
                }}
              >
                <Typography variant="h4">{articleData.title}</Typography>

                <Stack direction="row" spacing={1}>
                  <IconButton
                    sx={{
                      border: "1px solid",
                      borderColor: "primary.main",
                      borderRadius: 1,
                      width: 38,
                      height: 38,
                    }}
                  >
                    <Share sx={{ color: "primary.main", fontSize: 20 }} />
                  </IconButton>
                  <IconButton
                    sx={{
                      border: "1px solid",
                      borderColor: "primary.main",
                      borderRadius: 1,
                      width: 38,
                      height: 38,
                    }}
                  >
                    <Image sx={{ color: "primary.main", fontSize: 20 }} />
                  </IconButton>
                </Stack>
              </Box>

              {/* Article Metadata */}
              <Stack direction="row" spacing={3} sx={{ mb: 3 }}>
                <Typography variant="body2">{articleData.date}</Typography>
                <Typography variant="body2">{articleData.readTime}</Typography>
                <Typography variant="body2">{articleData.wordCount}</Typography>
              </Stack>

              {/* Author Info */}
              <Box sx={{ display: "flex", alignItems: "center", mb: 3 }}>
                <Avatar sx={{ width: 48, height: 48, bgcolor: "#d9d9d9", mr: 2 }} />
                <Box>
                  <Typography variant="body1" sx={{ fontWeight: 600 }}>
                    {articleData.author.name}
                  </Typography>
                  <Typography variant="body2">{articleData.author.wallet}</Typography>
                </Box>
              </Box>

              {/* Article Content */}
              <Typography variant="body1" sx={{ mb: 3 }}>
                {articleData.content}
              </Typography>

              {/* Tags */}
              <Stack direction="row" spacing={1} sx={{ mb: 3 }}>
                {articleData.tags.map((tag) => (
                  <Chip key={tag} label={tag} />
                ))}
              </Stack>

              <Divider sx={{ my: 2 }} />

              {/* Reactions */}
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  mt: 2,
                }}
              >
                <Stack direction="row" spacing={2}>
                  {articleData.reactions.map((reaction, index) => (
                    <Button
                      key={index}
                      variant="outlined"
                      sx={{
                        minWidth: "auto",
                        px: 2,
                        py: 0.5,
                      }}
                      startIcon={
                        <Typography variant="body1">{reaction.emoji}</Typography>
                      }
                    >
                      {reaction.count}
                    </Button>
                  ))}
                </Stack>

                <Button
                  variant="contained"
                  startIcon={<Payments />}
                  sx={{
                    px: 3,
                    py: 1,
                  }}
                >
                  Tip Author
                </Button>
              </Box>
            </CardContent>
          </Card>

          {/* Comments Section */}
          <Card elevation={4} sx={{ borderRadius: 2 }}>
            <CardContent sx={{ p: 4 }}>
              <Typography variant="h6" sx={{ mb: 3 }}>
                Comments
              </Typography>

              {/* Comment Input */}
              <Box sx={{ display: "flex", mb: 3 }}>
                <Avatar sx={{ width: 40, height: 40, bgcolor: "#d9d9d9", mr: 2 }} />
                <Box sx={{ flexGrow: 1 }}>
                  <TextField
                    fullWidth
                    variant="outlined"
                    placeholder="Write a comment..."
                    multiline
                    rows={2}
                    sx={{ mb: 1 }}
                  />
                  <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
                    <Button variant="contained">Comment</Button>
                  </Box>
                </Box>
              </Box>

              {/* Comments List */}
              {commentsData.map((comment, index) => (
                <Box key={index} sx={{ mb: 2 }}>
                  <Box sx={{ display: "flex", mb: 1 }}>
                    <Avatar sx={{ width: 40, height: 40, bgcolor: "#d9d9d9", mr: 2 }} />
                    <Box sx={{ flexGrow: 1 }}>
                      <Box
                        sx={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "flex-start",
                        }}
                      >
                        <Box>
                          <Typography variant="body1" sx={{ fontWeight: 600 }}>
                            {comment.author}
                          </Typography>
                          <Typography variant="body2" sx={{ mb: 1 }}>
                            {comment.wallet}
                          </Typography>
                        </Box>
                        <Typography variant="body2">{comment.timeAgo}</Typography>
                      </Box>

                      <Typography variant="body1" sx={{ mb: 1 }}>
                        {comment.content}
                      </Typography>

                      <Stack direction="row" spacing={1} sx={{ mb: 1 }}>
                        <Button
                          sx={{
                            p: 0,
                            minWidth: "auto",
                            fontSize: "0.875rem",
                          }}
                        >
                          Like ({comment.likes})
                        </Button>
                        <Button
                          sx={{
                            p: 0,
                            minWidth: "auto",
                            fontSize: "0.875rem",
                          }}
                        >
                          Reply
                        </Button>
                      </Stack>

                      {/* Replies */}
                      {comment.replies.map((reply, replyIndex) => (
                        <Box key={replyIndex} sx={{ display: "flex", ml: 4, mt: 2 }}>
                          <Avatar
                            sx={{
                              width: 32,
                              height: 32,
                              bgcolor: "#d9d9d9",
                              mr: 2,
                            }}
                          />
                          <Box>
                            <Box
                              sx={{
                                display: "flex",
                                justifyContent: "space-between",
                                alignItems: "flex-start",
                                width: "100%",
                              }}
                            >
                              <Box>
                                <Typography variant="body1" sx={{ fontWeight: 600 }}>
                                  {reply.author}
                                </Typography>
                                <Typography variant="body2" sx={{ mb: 1 }}>
                                  {reply.wallet}
                                </Typography>
                              </Box>
                              <Typography variant="body2" sx={{ ml: 4 }}>
                                {reply.timeAgo}
                              </Typography>
                            </Box>

                            <Typography variant="body1" sx={{ mb: 1 }}>
                              {reply.content}
                            </Typography>

                            <Button
                              sx={{
                                p: 0,
                                minWidth: "auto",
                                fontSize: "0.875rem",
                              }}
                            >
                              Like ({reply.likes})
                            </Button>
                          </Box>
                        </Box>
                      ))}
                    </Box>
                  </Box>
                  <Divider sx={{ my: 2 }} />
                </Box>
              ))}
            </CardContent>
          </Card>
        </Container>
      </Box>
    </DefaultLayout>
  );
};

export default TalePage; 