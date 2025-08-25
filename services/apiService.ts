import { User, Landmark, UserRole } from '../types';

// --- Constants (previously in constants.tsx) ---
const DEFAULT_USERS: User[] = [
  { id: 'admin1', username: 'admin', password: 'password', role: UserRole.Admin },
  { id: 'mod1', username: 'moderator', password: 'password', role: UserRole.Moderator },
  { id: 'leader1', username: 'leader', password: 'password', role: UserRole.Leader },
  { id: 'driver1', username: 'driver', password: 'password', role: UserRole.Driver },
  { id: 'driver2', username: 'driver2', password: 'password', role: UserRole.Driver },
];

const DB_KEY = 'geoPinDatabase';
const SIMULATED_LATENCY = 200; // ms

interface Database {
  users: User[];
  landmarks: Landmark[];
}

// --- Helper Functions ---

const readDb = (): Database => {
  try {
    const data = localStorage.getItem(DB_KEY);
    if (data) {
      return JSON.parse(data);
    }
  } catch (error) {
    console.error("Failed to read from localStorage", error);
  }
  // If nothing in localStorage, initialize with default users
  const initialDb: Database = {
    users: DEFAULT_USERS,
    landmarks: [],
  };
  writeDb(initialDb);
  return initialDb;
};

const writeDb = (db: Database) => {
  try {
    localStorage.setItem(DB_KEY, JSON.stringify(db));
  } catch (error) {
    console.error("Failed to write to localStorage", error);
  }
};

const simulateApiCall = <T>(data: T): Promise<T> => {
  return new Promise(resolve => {
    setTimeout(() => {
      resolve(data);
    }, SIMULATED_LATENCY);
  });
};


// --- API Service ---

export const apiService = {
  // --- User Methods ---
  async getUsers(): Promise<User[]> {
    const db = readDb();
    return simulateApiCall(db.users);
  },
  
  async addUser(userData: Omit<User, 'id'>): Promise<User> {
    const db = readDb();
    const newUser: User = {
      ...userData,
      id: `user-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    };
    db.users.push(newUser);
    writeDb(db);
    return simulateApiCall(newUser);
  },
  
  async removeUser(userId: string): Promise<string> {
    const db = readDb();
    const userIndex = db.users.findIndex(u => u.id === userId);
    if (userIndex > -1) {
        db.users.splice(userIndex, 1);
        // Also remove their landmarks
        db.landmarks = db.landmarks.filter(lm => lm.addedByUserId !== userId);
        writeDb(db);
    }
    return simulateApiCall(userId);
  },
  
  async updateUserRole(userId: string, newRole: UserRole): Promise<User | null> {
    const db = readDb();
    const user = db.users.find(u => u.id === userId);
    if (user) {
        user.role = newRole;
        writeDb(db);
        return simulateApiCall(user);
    }
    return simulateApiCall(null);
  },

  // --- Landmark Methods ---
  async getLandmarks(): Promise<Landmark[]> {
    const db = readDb();
    return simulateApiCall(db.landmarks);
  },

  async addLandmark(landmarkData: Omit<Landmark, 'id' | 'addedByUserId' | 'addedByUsername' | 'createdAt'>, currentUser: User): Promise<Landmark> {
    const db = readDb();
    const newLandmark: Landmark = {
      ...landmarkData,
      id: `lm-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      addedByUserId: currentUser.id,
      addedByUsername: currentUser.username,
      createdAt: Date.now(),
    };
    db.landmarks.push(newLandmark);
    writeDb(db);
    return simulateApiCall(newLandmark);
  },
  
  async removeLandmark(landmarkId: string): Promise<string> {
    const db = readDb();
    const landmarkIndex = db.landmarks.findIndex(lm => lm.id === landmarkId);
    if(landmarkIndex > -1) {
        db.landmarks.splice(landmarkIndex, 1);
        writeDb(db);
    }
    return simulateApiCall(landmarkId);
  },
};