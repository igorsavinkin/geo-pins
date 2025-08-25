
import React from 'react';
import { useAppContext } from '../../hooks/useAppContext';
import { useNotifier } from '../../hooks/useNotifier';
import Button from '../UI/Button';

const CrosshairsIcon: React.FC<{className?: string}> = ({className}) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className={className || "w-6 h-6"}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75l3 3m0 0l3-3m-3 3v-7.5M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
);


const PinMyLocationButton: React.FC = () => {
  const { currentUserLocation, setNewLandmarkCoords, setShowAddLandmarkModal, locateUser } = useAppContext();
  const { addNotification } = useNotifier();

  const handlePinLocation = () => {
    if (currentUserLocation) {
      setNewLandmarkCoords(currentUserLocation);
      setShowAddLandmarkModal(true);
    } else {
      addNotification("Your location is not available. Trying to find you...", 'info');
      locateUser(); // Attempt to get location again
    }
  };

  return (
    <div className="absolute bottom-4 right-4 z-[1000]">
        <Button
          onClick={handlePinLocation}
          title="Pin my current location"
          className="!p-3 !rounded-full shadow-lg bg-sky-600 hover:bg-sky-500 flex items-center justify-center"
          aria-label="Pin my current location"
          size="lg"
        >
          <CrosshairsIcon className="w-6 h-6" />
        </Button>
    </div>
  );
};

export default PinMyLocationButton;
