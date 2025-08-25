
export enum UserRole {
  Driver = 'Driver',
  Leader = 'Leader',
  Moderator = 'Moderator',
  Admin = 'Admin',
}

export interface User {
  id: string;
  username: string;
  password?: string; // Password should ideally not be stored in frontend state long-term
  role: UserRole;
}

export interface Landmark {
  id: string;
  name: string;
  description: string;
  latitude: number; // Representing map click X
  longitude: number; // Representing map click Y
  addedByUserId: string;
  addedByUsername: string; 
  createdAt: number; // Timestamp
  expiresAt?: number | null; // Timestamp, null means never expires
}

export interface Coordinates {
  x: number;
  y: number;
}

export interface NotificationMessage {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info';
}