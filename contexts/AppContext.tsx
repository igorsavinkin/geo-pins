

import React, { createContext, useState, useEffect, useCallback, useRef } from 'react';
import { User, Landmark, UserRole, Coordinates } from '../types';
import { DEFAULT_LANDMARK_EXPIRATION_MINUTES } from '../constants';
import { useNotifier } from '../hooks/useNotifier';
import { apiService } from '../services/apiService';

interface AppContextType {
  currentUser: User | null;
  users: User[];
  landmarks: Landmark[];
  login: (username: string, password_param: string) => Promise<boolean>;
  logout: () => void;
  registerUser: (username: string, password_param: string) => Promise<boolean>;
  addLandmark: (landmarkData: Omit<Landmark, 'id' | 'addedByUserId' | 'addedByUsername' | 'createdAt'>) => Promise<void>;
  removeLandmark: (landmarkId: string) => Promise<void>;
  addUser: (userData: Omit<User, 'id'>) => Promise<boolean>;
  removeUser: (userId: string) => Promise<void>;
  updateUserRole: (userId: string, newRole: UserRole) => Promise<void>;
  showAddLandmarkModal: boolean;
  setShowAddLandmarkModal: React.Dispatch<React.SetStateAction<boolean>>;
  newLandmarkCoords: Coordinates | null;
  setNewLandmarkCoords: React.Dispatch<React.SetStateAction<Coordinates | null>>;
  selectedLandmark: Landmark | null;
  setSelectedLandmark: React.Dispatch<React.SetStateAction<Landmark | null>>;
  showUserManagement: boolean;
  setShowUserManagement: React.Dispatch<React.SetStateAction<boolean>>;
  getApiKey: () => string | undefined;
  currentUserLocation: Coordinates | null;
  locateUser: () => void;
  isFollowingUser: boolean;
  setIsFollowingUser: React.Dispatch<React.SetStateAction<boolean>>;
  isLoading: boolean;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [landmarks, setLandmarks] = useState<Landmark[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [showAddLandmarkModal, setShowAddLandmarkModal] = useState(false);
  const [newLandmarkCoords, setNewLandmarkCoords] = useState<Coordinates | null>(null);
  const [selectedLandmark, setSelectedLandmark] = useState<Landmark | null>(null);
  const [showUserManagement, setShowUserManagement] = useState(false);
  const [currentUserLocation, setCurrentUserLocation] = useState<Coordinates | null>(null);
  const [locationWatchId, setLocationWatchId] = useState<number | null>(null);
  const [isFollowingUser, setIsFollowingUser] = useState(true);
  const isInitialLocationFoundRef = useRef(false);
  const { addNotification } = useNotifier();

  useEffect(() => {
    const loadData = async () => {
        setIsLoading(true);
        try {
            const [loadedUsers, loadedLandmarks] = await Promise.all([
                apiService.getUsers(),
                apiService.getLandmarks(),
            ]);
            setUsers(loadedUsers);
            setLandmarks(loadedLandmarks);
        } catch (error) {
            console.error("Failed to load initial data", error);
            addNotification("Could not load app data.", "error");
        } finally {
            setIsLoading(false);
        }
    };
    loadData();
  }, [addNotification]);


  const getApiKey = useCallback(() => {
    return (window as any).process?.env?.API_KEY;
  }, []);

  const stopWatchingLocation = useCallback(() => {
    if (locationWatchId !== null && navigator.geolocation) {
      navigator.geolocation.clearWatch(locationWatchId);
      setLocationWatchId(null);
    }
  }, [locationWatchId]);

  useEffect(() => {
    // Cleanup on unmount
    return () => {
      stopWatchingLocation();
    };
  }, [stopWatchingLocation]);

  const locateUser = useCallback(() => {
    if (navigator.geolocation) {
      if (locationWatchId !== null) return; // Already watching

      const watchId = navigator.geolocation.watchPosition(
        (position) => {
          setCurrentUserLocation({
            x: position.coords.longitude,
            y: position.coords.latitude,
          });
          if (!isInitialLocationFoundRef.current) {
            addNotification('Live location tracking started!', 'success');
            isInitialLocationFoundRef.current = true;
          }
        },
        (error) => {
          console.error("Geolocation watch error:", error);
          addNotification(`Error tracking location: ${error.message}`, 'error');
        },
        { enableHighAccuracy: true, timeout: 20000, maximumAge: 0 }
      );
      setLocationWatchId(watchId);
    } else {
      addNotification("Geolocation is not supported by this browser.", 'error');
    }
  }, [addNotification, locationWatchId]);

  const login = async (username: string, password_param: string): Promise<boolean> => {
    const allUsers = await apiService.getUsers();
    setUsers(allUsers);
    const user = allUsers.find(u => u.username === username && u.password === password_param);
    if (user) {
      setCurrentUser(user);
      addNotification('Login successful!', 'success');
      return true;
    }
    addNotification('Invalid username or password.', 'error');
    return false;
  };

  const logout = () => {
    stopWatchingLocation();
    setCurrentUser(null);
    setCurrentUserLocation(null);
    setIsFollowingUser(true);
    isInitialLocationFoundRef.current = false;
    addNotification('Logged out.', 'info');
  };

  const registerUser = async (username: string, password_param: string): Promise<boolean> => {
     const currentUsers = await apiService.getUsers(); // Fetch latest users before check
    if (currentUsers.find(u => u.username.toLowerCase() === username.toLowerCase())) {
      addNotification(`Username "${username}" is already taken. Please choose another.`, 'error');
      return false;
    }
     try {
        const newUser = await apiService.addUser({
            username,
            password: password_param,
            role: UserRole.Driver,
        });
        setUsers(prevUsers => [...prevUsers, newUser]);
        setCurrentUser(newUser);
        addNotification(`Welcome, ${username}! Registration successful.`, 'success');
        return true;
    } catch (error) {
        console.error("Registration failed:", error);
        addNotification("Registration failed. Please try again.", "error");
        return false;
    }
  };

  const addLandmark = async (landmarkData: Omit<Landmark, 'id' | 'addedByUserId' | 'addedByUsername' | 'createdAt'>) => {
    if (!currentUser) return;
    
    // Fallback if form somehow doesn't provide expiresAt
    if (landmarkData.expiresAt === undefined) {
      landmarkData.expiresAt = Date.now() + DEFAULT_LANDMARK_EXPIRATION_MINUTES * 60 * 1000;
    }

    try {
        const newLandmark = await apiService.addLandmark(landmarkData, currentUser);
        setLandmarks(prev => [...prev, newLandmark]);
        addNotification(`Landmark "${newLandmark.name}" added.`, 'success');
        setShowAddLandmarkModal(false);
    } catch(error) {
        console.error("Failed to add landmark", error);
        addNotification("Could not add landmark. Please try again.", 'error');
    }
  };

  const removeLandmark = useCallback(async (landmarkId: string) => {
    if (!currentUser) {
      addNotification('You must be logged in to perform this action.', 'error');
      return;
    }

    const landmarkToRemove = landmarks.find(lm => lm.id === landmarkId);
    if (!landmarkToRemove) {
      addNotification('Landmark not found.', 'error');
      return;
    }

    const landmarkCreator = users.find(user => user.id === landmarkToRemove.addedByUserId);

    let canRemoveCheck = false;
    if (currentUser.role === UserRole.Admin) {
      canRemoveCheck = true;
    } else if (currentUser.role === UserRole.Moderator) {
      if (landmarkCreator?.role !== UserRole.Admin) {
        canRemoveCheck = true;
      }
    } else if (currentUser.id === landmarkToRemove.addedByUserId) {
      canRemoveCheck = true;
    }

    if (canRemoveCheck) {
      try {
        await apiService.removeLandmark(landmarkId);
        setLandmarks(prev => prev.filter(lm => lm.id !== landmarkId));
        addNotification('Landmark removed.', 'success');
        setSelectedLandmark(prev => (prev?.id === landmarkId ? null : prev));
      } catch (error) {
        console.error("Failed to remove landmark", error);
        addNotification("Could not remove landmark. Please try again.", 'error');
      }
    } else {
      addNotification('You do not have permission to remove this landmark.', 'error');
    }
  }, [currentUser, landmarks, users, addNotification, setSelectedLandmark]);


  const addUser = async (userData: Omit<User, 'id'>): Promise<boolean> => {
    if (!currentUser || (currentUser.role !== UserRole.Admin && currentUser.role !== UserRole.Moderator)) {
      addNotification('Permission denied to add users.', 'error');
      return false;
    }
    if (currentUser.role === UserRole.Moderator && (userData.role === UserRole.Admin || userData.role === UserRole.Moderator)) {
        addNotification('Moderators cannot add Admins or other Moderators.', 'error');
        return false;
    }
     const currentUsers = await apiService.getUsers(); // Fetch latest users before check
    if (currentUsers.find(u => u.username.toLowerCase() === userData.username.toLowerCase())) {
        addNotification(`User "${userData.username}" already exists.`, 'error');
        return false;
    }

    try {
        const newUser = await apiService.addUser(userData);
        setUsers(prev => [...prev, newUser]);
        addNotification(`User "${newUser.username}" added.`, 'success');
        return true;
    } catch(error) {
         addNotification('Failed to add user.', 'error');
         return false;
    }
  };

  const removeUser = async (userId: string) => {
    if (!currentUser || (currentUser.role !== UserRole.Admin && currentUser.role !== UserRole.Moderator)) {
      addNotification('Permission denied to remove users.', 'error');
      return;
    }
    const userToRemove = users.find(u => u.id === userId);
    if (!userToRemove) {
        addNotification('User not found.', 'error');
        return;
    }
    if (currentUser.id === userId) {
        addNotification('You cannot remove yourself.', 'error');
        return;
    }
    if (currentUser.role === UserRole.Moderator && (userToRemove.role === UserRole.Admin || userToRemove.role === UserRole.Moderator)) {
        addNotification('Moderators cannot remove Admins or other Moderators.', 'error');
        return;
    }

    try {
        await apiService.removeUser(userId);
        setUsers(prev => prev.filter(u => u.id !== userId));
        setLandmarks(prev => prev.filter(lm => lm.addedByUserId !== userId)); // Also remove from local state
        addNotification(`User "${userToRemove.username}" and their landmarks removed.`, 'success');
    } catch (error) {
        addNotification('Failed to remove user.', 'error');
    }
  };

  const updateUserRole = async (userId: string, newRole: UserRole) => {
    if (!currentUser || currentUser.role !== UserRole.Admin) {
      addNotification('Only Admins can change user roles.', 'error');
      return;
    }
    if (currentUser.id === userId && newRole !== UserRole.Admin) {
        addNotification('Admin cannot demote themselves from Admin role.', 'error');
        return;
    }
    try {
        const updatedUser = await apiService.updateUserRole(userId, newRole);
        if (updatedUser) {
            setUsers(prev => prev.map(u => u.id === userId ? updatedUser : u));
            addNotification('User role updated.', 'success');
        } else {
             addNotification('User not found or failed to update.', 'error');
        }
    } catch (error) {
        addNotification('Failed to update user role.', 'error');
    }
  };

  return (
    <AppContext.Provider value={{
      currentUser, users, landmarks, login, logout, registerUser, addLandmark, removeLandmark,
      addUser, removeUser, updateUserRole,
      showAddLandmarkModal, setShowAddLandmarkModal,
      newLandmarkCoords, setNewLandmarkCoords,
      selectedLandmark, setSelectedLandmark,
      showUserManagement, setShowUserManagement,
      getApiKey,
      currentUserLocation, locateUser,
      isFollowingUser, setIsFollowingUser,
      isLoading
    }}>
      {children}
    </AppContext.Provider>
  );
};

export default AppContext;