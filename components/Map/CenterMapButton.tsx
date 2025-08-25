
import React from 'react';
import { useAppContext } from '../../hooks/useAppContext';
import Button from '../UI/Button';

const GpsFixedIcon: React.FC<{className?: string}> = ({className}) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 24 24" className={className || "w-6 h-6"}>
        <path d="M12 8c-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4-1.79-4-4-4zm8.94 3c-.46-4.17-3.77-7.48-7.94-7.94V1h-2v2.06C6.83 3.52 3.52 6.83 3.06 11H1v2h2.06c.46 4.17 3.77 7.48 7.94 7.94V23h2v-2.06c4.17-.46 7.48-3.77 7.94-7.94H23v-2h-2.06zM12 19c-3.87 0-7-3.13-7-7s3.13-7 7-7 7 3.13 7 7-3.13 7-7 7z"/>
    </svg>
);


const CenterMapButton: React.FC = () => {
  const { isFollowingUser, setIsFollowingUser, locateUser, currentUserLocation } = useAppContext();

  const handleCenter = () => {
    if (!currentUserLocation) {
        // If location is not yet available, try to get it.
        locateUser();
    }
    // Always set to true, so it re-centers and starts following
    setIsFollowingUser(true);
  };

  return (
    <div className="absolute bottom-20 right-4 z-[1000]">
        <Button
          onClick={handleCenter}
          title={isFollowingUser ? "Following your location" : "Center on my location"}
          className={`!p-3 !rounded-full shadow-lg flex items-center justify-center ${
            isFollowingUser ? 'bg-sky-600 hover:bg-sky-500' : 'bg-slate-600 hover:bg-slate-500'
          }`}
          aria-label="Center map on my location"
          size="lg"
        >
          <GpsFixedIcon className="w-6 h-6" />
        </Button>
    </div>
  );
};

export default CenterMapButton;
