
import React from 'react';
import { useAppContext } from '../../hooks/useAppContext';
import { APP_NAME, LogoutIcon, UsersIcon, MenuIcon } from '../../constants';
import Button from '../UI/Button';
import { UserRole } from '../../types';

interface NavbarProps {
  onToggleSidebar: () => void;
}

const Navbar: React.FC<NavbarProps> = ({ onToggleSidebar }) => {
  const { currentUser, logout, setShowUserManagement } = useAppContext();

  return (
    <nav className="bg-slate-900 shadow-lg p-4 flex justify-between items-center relative z-40">
      <div className="flex items-center space-x-4">
        <button
          onClick={onToggleSidebar}
          className="p-1 rounded-md text-gray-400 hover:text-white hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
          aria-label="Toggle landmark menu"
        >
          <MenuIcon className="w-6 h-6" />
        </button>
        <div className="text-2xl font-bold text-sky-400">{APP_NAME}</div>
      </div>
      {currentUser && (
        <div className="flex items-center space-x-4">
          <span className="text-gray-300">
            Welcome, <strong className="text-sky-300">{currentUser.username}</strong> ({currentUser.role})
          </span>
          {(currentUser.role === UserRole.Admin || currentUser.role === UserRole.Moderator) && (
            <Button
              onClick={() => setShowUserManagement(true)}
              variant="secondary"
              size="sm"
              className="bg-slate-700 hover:bg-slate-600 text-sky-300"
            >
              <UsersIcon className="w-5 h-5 mr-2" /> User Management
            </Button>
          )}
          <Button onClick={logout} variant="danger" size="sm" className="bg-red-600 hover:bg-red-500">
            <LogoutIcon className="w-5 h-5 mr-2" /> Logout
          </Button>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
