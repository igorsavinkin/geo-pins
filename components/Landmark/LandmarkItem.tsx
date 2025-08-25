import React from 'react';
import { Landmark, UserRole } from '../../types';
import { useAppContext } from '../../hooks/useAppContext';
import { PinIcon, TrashIcon, getColorForUser } from '../../constants';

interface LandmarkItemProps {
  landmark: Landmark;
}

const timeFormatOptions: Intl.DateTimeFormatOptions = {
  hour: '2-digit',
  minute: '2-digit',
  hourCycle: 'h23',
};

const LandmarkItem: React.FC<LandmarkItemProps> = ({ landmark }) => {
  const { removeLandmark, currentUser, users, setSelectedLandmark } = useAppContext();
  
  const landmarkCreator = users.find(user => user.id === landmark.addedByUserId);
  const canRemove = currentUser && (
    currentUser.role === UserRole.Admin ||
    (currentUser.role === UserRole.Moderator && landmarkCreator?.role !== UserRole.Admin) ||
    (currentUser.id === landmark.addedByUserId)
  );


  return (
    <li 
        className="p-3 bg-slate-700 hover:bg-slate-600 rounded-lg shadow transition-colors cursor-pointer group"
        onClick={() => setSelectedLandmark(landmark)}
    >
      <div className="flex justify-between items-start">
        <div className="flex-grow mr-2">
          <div className="flex items-center">
            <PinIcon 
              className="w-5 h-5 mr-2 flex-shrink-0" 
              style={{ color: getColorForUser(landmark.addedByUserId) }} 
            />
            <h3 className="font-semibold text-sky-300 group-hover:text-sky-200">{landmark.name}</h3>
          </div>
          <p className="text-sm text-gray-300 my-2 truncate group-hover:whitespace-normal">{landmark.description}</p>
          <p className="text-xs text-gray-400">added: {new Date(landmark.createdAt).toLocaleString([], timeFormatOptions)}</p>
        </div>
        {canRemove && (
          <button
            onClick={async (e) => {
              e.stopPropagation();
              if (window.confirm("do you really want to remove the pin?")) {
                await removeLandmark(landmark.id);
              }
            }}
            className="text-red-500 hover:text-red-400 p-1 rounded opacity-50 group-hover:opacity-100 transition-opacity flex-shrink-0"
            title="Remove Landmark"
          >
            <TrashIcon className="w-4 h-4" />
          </button>
        )}
      </div>
    </li>
  );
};

export default LandmarkItem;