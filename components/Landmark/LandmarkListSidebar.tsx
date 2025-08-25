
import React, { useState } from 'react';
import { useAppContext } from '../../hooks/useAppContext';
import LandmarkItem from './LandmarkItem';
import Input from '../UI/Input';
import Select from '../UI/Select';

interface LandmarkListSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const LandmarkListSidebar: React.FC<LandmarkListSidebarProps> = ({ isOpen, onClose }) => {
  const { landmarks } = useAppContext();
  const [searchTerm, setSearchTerm] = useState('');

  const visibleLandmarks = landmarks
    .filter(lm => !lm.expiresAt || lm.expiresAt > Date.now())
    .filter(lm =>
        (lm.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
         lm.description.toLowerCase().includes(searchTerm.toLowerCase()))
    )
    .sort((a, b) => b.createdAt - a.createdAt);

  return (
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 bg-black bg-opacity-60 z-30 transition-opacity duration-300 ease-in-out ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Sidebar Panel */}
      <aside
        className={`fixed top-0 left-0 w-80 bg-slate-800 h-full flex flex-col shadow-2xl z-40 transform transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}
        aria-label="Landmarks menu"
      >
        <header className="p-4 border-b border-slate-700 flex-shrink-0">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold text-sky-400">Landmarks</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-white p-1 rounded-full hover:bg-slate-700 text-2xl leading-none"
              aria-label="Close menu"
            >
              &times;
            </button>
          </div>
        </header>
        
        <div className="p-4 space-y-4 flex-shrink-0">
           <Input
            id="searchLandmarks"
            type="text"
            placeholder="Search landmarks..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="bg-slate-700 border-slate-600 text-white focus:ring-sky-500 focus:border-sky-500"
          />
        </div>

        <div className="flex-grow overflow-y-auto px-4">
          {visibleLandmarks.length > 0 ? (
            <ul className="space-y-3">
              {visibleLandmarks.map(landmark => (
                <LandmarkItem key={landmark.id} landmark={landmark} />
              ))}
            </ul>
          ) : (
            <p className="text-gray-400 text-center py-4">No landmarks found matching your criteria, or no landmarks added yet.</p>
          )}
        </div>
         <footer className="p-4 border-t border-slate-700 text-center text-sm text-gray-500 flex-shrink-0">
            {visibleLandmarks.length} landmark(s) found
        </footer>
      </aside>
    </>
  );
};

export default LandmarkListSidebar;