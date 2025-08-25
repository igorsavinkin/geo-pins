

import React, { useEffect, useState } from 'react';
import { useAppContext } from './hooks/useAppContext';
import Navbar from './components/Layout/Navbar';
import MapDisplay from './components/Map/MapDisplay';
import LandmarkListSidebar from './components/Landmark/LandmarkListSidebar';
import UserManagement from './components/Admin/UserManagement';
import AddLandmarkForm from './components/Map/AddLandmarkForm';
import NotificationBar from './components/UI/NotificationBar';
import { UserRole } from './types';
import AuthPage from './components/Auth/AuthPage';
import Button from './components/UI/Button';
import Spinner from './components/UI/Spinner';

const timeFormatOptions: Intl.DateTimeFormatOptions = {
  hour: '2-digit',
  minute: '2-digit',
  hourCycle: 'h23',
};

const App: React.FC = () => {
  const { currentUser, users, showAddLandmarkModal, setShowAddLandmarkModal, newLandmarkCoords, selectedLandmark, setSelectedLandmark, showUserManagement, setShowUserManagement, locateUser, removeLandmark, isLoading } = useAppContext();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isRemoving, setIsRemoving] = useState(false);


  useEffect(() => {
    if (currentUser) {
      locateUser();
    }
  }, [currentUser, locateUser]);

  // Logic to determine if the remove button should be shown
  const landmarkCreator = selectedLandmark ? users.find(user => user.id === selectedLandmark.addedByUserId) : null;
  const canRemove = currentUser && selectedLandmark && (
    currentUser.role === UserRole.Admin ||
    (currentUser.role === UserRole.Moderator && landmarkCreator?.role !== UserRole.Admin) ||
    (currentUser.id === selectedLandmark.addedByUserId)
  );

  if (isLoading) {
    return (
      <div className="h-screen w-screen flex flex-col justify-center items-center bg-slate-900 text-white">
        <Spinner />
        <div className="text-2xl font-semibold mt-4">Loading GeoPin...</div>
      </div>
    );
  }

  if (!currentUser) {
    return (
      <div className="min-h-full bg-gradient-to-br from-slate-900 to-slate-700 flex flex-col justify-center items-center p-4">
        <div className="text-center mb-8">
          <h1 className="text-5xl font-bold text-white mb-2">GeoPin</h1>
          <p className="text-xl text-sky-300">Share and discover landmarks together.</p>
        </div>
        <AuthPage /> {/* Use AuthPage here */}
        <NotificationBar />
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-gray-800 text-white">
      <Navbar onToggleSidebar={() => setIsSidebarOpen(prev => !prev)} />
      <main className="flex-grow relative min-h-0">
        {/* Map container is positioned in the background to allow other elements to overlay it. */}
        <div className="absolute inset-0 z-0">
          <MapDisplay />
        </div>
        <LandmarkListSidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
      </main>

      {showAddLandmarkModal && newLandmarkCoords && (
        <AddLandmarkForm
          coords={newLandmarkCoords}
          onClose={() => setShowAddLandmarkModal(false)}
        />
      )}

      {selectedLandmark && (
         <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-[1500] p-4" onClick={() => setSelectedLandmark(null)}>
          <div className="bg-slate-800 p-6 rounded-lg shadow-2xl w-full max-w-md text-white" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-start mb-4">
              <h2 className="text-2xl font-semibold text-sky-400">{selectedLandmark.name}</h2>
              <button onClick={() => setSelectedLandmark(null)} className="text-gray-400 hover:text-white text-2xl leading-none p-1 rounded-full hover:bg-slate-700 transition-colors" aria-label="Close landmark details">&times;</button>
            </div>
            <p className="text-gray-300 mb-4">{selectedLandmark.description}</p>
            <p className="text-xs text-gray-400">added: {new Date(selectedLandmark.createdAt).toLocaleString([], timeFormatOptions)}</p>
            <div className="mt-6 flex justify-end items-center space-x-3">
              {canRemove && (
                <Button
                  onClick={async () => {
                    if (window.confirm("do you really want to remove the pin?")) {
                      setIsRemoving(true);
                      await removeLandmark(selectedLandmark.id);
                      setIsRemoving(false);
                    }
                  }}
                  variant="danger"
                  disabled={isRemoving}
                >
                  {isRemoving ? 'Removing...' : 'Remove'}
                </Button>
              )}
              <Button
                onClick={() => setSelectedLandmark(null)}
                variant="secondary"
                className="bg-slate-600 hover:bg-slate-500"
              >
                Close
              </Button>
            </div>
          </div>
        </div>
      )}

      {showUserManagement && (currentUser.role === UserRole.Admin || currentUser.role === UserRole.Moderator) && (
        <UserManagement onClose={() => setShowUserManagement(false)} />
      )}
      <NotificationBar />
    </div>
  );
};

export default App;