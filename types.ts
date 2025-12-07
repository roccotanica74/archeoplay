export interface Movie {
  id: string;
  title: string;
  description: string;
  matchScore: number; // 0-100
  year: number;
  duration: string;
  genre: string;
  thumbnailUrl?: string; // Generated via logic if missing
  backdropUrl?: string;
  videoUrl?: string; // Placeholder for video player
}

export interface Category {
  title: string;
  movies: Movie[];
}

export type UserRole = 'user' | 'admin';

export interface User {
  id: string;
  email: string;
  username?: string; // New field
  password?: string; // Stored for mock auth purposes
  name: string;
  surname?: string; // New field
  phone?: string; // New field
  role: UserRole;
  isPaused?: boolean; // New field for account suspension
  myList: Movie[]; // Personal favorites list
}

export type AppView = 'auth' | 'browse' | 'watch' | 'admin';