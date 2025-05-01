export interface Tale {
  id: number;
  title: string;
  author: string;
  reads: string;
  image: string;
}

export interface Author {
  id: number;
  name: string;
  stories: string;
  followers: string;
  avatar: string;
}

export interface HowItWorksStep {
  id: number;
  title: string;
  description: string;
}

export interface NavigationLink {
  title: string;
  path: string;
}

export interface ResourceLink {
  title: string;
  path: string;
} 