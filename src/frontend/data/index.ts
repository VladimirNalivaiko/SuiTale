import { ROUTES } from "../types/constants";
import { Tale, Author, HowItWorksStep, NavigationLink, ResourceLink } from '../types';

export const popularTales: Tale[] = [
  {
    id: 1,
    title: "The Digital Renaissance",
    author: "Elena Wright",
    reads: "2.3k reads",
    image: "https://c.animaapp.com/BGr9RM3o/img/image-2.png",
  },
  {
    id: 2,
    title: "Web3 Chronicles",
    author: "Marcus Chen",
    reads: "1.8k reads",
    image: "https://c.animaapp.com/BGr9RM3o/img/image-2.png",
  },
  {
    id: 3,
    title: "Blockchain Dreams",
    author: "Sarah Johnson",
    reads: "3.1k reads",
    image: "https://c.animaapp.com/BGr9RM3o/img/image-2.png",
  },
];

export const featuredAuthors: Author[] = [
  {
    id: 1,
    name: "Elena Wright",
    stories: "23 stories",
    followers: "5.2k followers",
    avatar: "https://c.animaapp.com/BGr9RM3o/img/image-5.png",
  },
  {
    id: 2,
    name: "Marcus Chen",
    stories: "15 stories",
    followers: "3.8k followers",
    avatar: "https://c.animaapp.com/BGr9RM3o/img/image-5.png",
  },
  {
    id: 3,
    name: "Sarah Johnson",
    stories: "31 stories",
    followers: "6.5k followers",
    avatar: "https://c.animaapp.com/BGr9RM3o/img/image-5.png",
  },
];

export const howItWorksSteps: HowItWorksStep[] = [
  {
    id: 1,
    title: "Connect Wallet",
    description: "Link your SUI wallet to start your journey in decentralized storytelling",
  },
  {
    id: 2,
    title: "Create Tale",
    description: "Write and format your tale using our intuitive editor",
  },
  {
    id: 3,
    title: "Publish & Earn",
    description: "Publish your story as an NFT and earn rewards from readers",
  },
];

export const navigationLinks: NavigationLink[] = [
  { title: "Home", path: ROUTES.INITIAL_ROUTE },
];

export const resourceLinks: ResourceLink[] = [
  { title: "Help Center", path: "/help" },
  { title: "Documentation", path: "/docs" },
  { title: "Terms of Service", path: "/terms" },
  { title: "Privacy Policy", path: "/privacy" },
]; 