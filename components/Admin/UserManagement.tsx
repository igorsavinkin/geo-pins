

import React, { useState } from 'react';
import { useAppContext } from '../../hooks/useAppContext';
import { User, UserRole } from '../../types';
import Modal from '../UI/Modal';
import Input from '../UI/Input';
import Select from '../UI/Select';
import Button from '../UI/Button';
import { TrashIcon, EditIcon } from '../../constants';

interface UserManagementProps {
  onClose: () => void;
}

const UserManagement: React.FC<UserManagementProps> = ({ onClose }) => {
  const { users, addUser, removeUser, updateUserRole, currentUser } = useAppContext();
  const [newUsername, setNewUsername] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [newRole, setNewRole] = useState<UserRole>(UserRole.Driver);
  const [isAddingUser, setIsAddingUser] = useState(false);
  
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [editRole, setEditRole] = useState<UserRole>(UserRole.Driver);


  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUsername.trim() || !newPassword.trim()) {
        alert("Username and password are required for new user.");
        return;
    }
    setIsAddingUser(true);
    const success = await addUser({ username: newUsername, password: newPassword, role: newRole });
    if (success) {
      setNewUsername('');
      setNewPassword('');
      setNewRole(UserRole.Driver);
    }
    setIsAddingUser(false);
  };
  
  const handleStartEdit = (user: User) => {
    setEditingUser(user);
    setEditRole(user.role);
  };

  const handleSaveEdit = async () => {
    if (editingUser) {
      await updateUserRole(editingUser.id, editRole);
      setEditingUser(null);
    }
  };

  const availableRolesForNewUser = Object.values(UserRole).filter(role => {
    if (currentUser?.role === UserRole.Admin) return true;
    if (currentUser?.role === UserRole.Moderator) return role !== UserRole.Admin && role !== UserRole.Moderator;
    return false;
  });
  
  const availableRolesForEdit = (targetUserRole: UserRole): UserRole[] => {
     if (currentUser?.role === UserRole.Admin) {
        // Admin can change any user to any role, but not demote self from Admin.
        if (editingUser?.id === currentUser.id) return [UserRole.Admin];
        return Object.values(UserRole);
     }
     // Moderators cannot edit Admin or other Moderator roles.
     // And cannot promote anyone to Admin or Moderator.
     if (currentUser?.role === UserRole.Moderator) {
        if (targetUserRole === UserRole.Admin || targetUserRole === UserRole.Moderator) return [targetUserRole]; // Can't change these roles
        return [UserRole.Driver, UserRole.Leader]; // Can only change to Driver or Leader
     }
     return [];
  };


  return (
    <Modal title="User Management" onClose={onClose} size="lg">
      <div className="space-y-6">
        {/* Add User Form */}
        {(currentUser?.role === UserRole.Admin || currentUser?.role === UserRole.Moderator) && (
          <form onSubmit={handleAddUser} className="p-4 bg-slate-700 rounded-lg space-y-3">
            <h3 className="text-lg font-semibold text-sky-300 mb-2">Add New User</h3>
            <Input
              id="newUsername"
              label="Username"
              value={newUsername}
              onChange={(e) => setNewUsername(e.target.value)}
              className="bg-slate-600 border-slate-500 text-white"
              labelClassName="text-sky-200"
              disabled={isAddingUser}
            />
            <Input
              id="newPassword"
              label="Password"
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="bg-slate-600 border-slate-500 text-white"
              labelClassName="text-sky-200"
              disabled={isAddingUser}
            />
            <Select
              id="newRole"
              label="Role"
              value={newRole}
              onChange={(e) => setNewRole(e.target.value as UserRole)}
              options={availableRolesForNewUser.map(r => ({ value: r, label: r }))}
              className="bg-slate-600 border-slate-500 text-white"
              labelClassName="text-sky-200"
              disabled={isAddingUser}
            />
            <Button type="submit" variant="primary" className="bg-green-600 hover:bg-green-500" disabled={isAddingUser}>
              {isAddingUser ? 'Adding...' : 'Add User'}
            </Button>
          </form>
        )}

        {/* User List */}
        <div>
          <h3 className="text-lg font-semibold text-sky-300 mb-3">Existing Users</h3>
          <div className="max-h-96 overflow-y-auto bg-slate-700 p-1 rounded-md">
            <table className="min-w-full divide-y divide-slate-600">
              <thead className="bg-slate-800">
                <tr>
                  <th className="px-4 py-2 text-left text-xs font-medium text-sky-300 uppercase tracking-wider">Username</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-sky-300 uppercase tracking-wider">Role</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-sky-300 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-slate-700 divide-y divide-slate-600">
                {users.map(user => (
                  <tr key={user.id}>
                    <td className="px-4 py-2 whitespace-nowrap text-sm text-white">{user.username}</td>
                    <td className="px-4 py-2 whitespace-nowrap text-sm text-white">
                      {editingUser?.id === user.id && currentUser?.role === UserRole.Admin ? (
                        <Select
                          id={`editRole-${user.id}`}
                          value={editRole}
                          onChange={(e) => setEditRole(e.target.value as UserRole)}
                          options={availableRolesForEdit(user.role).map(r => ({value: r, label: r}))}
                          className="bg-slate-600 border-slate-500 text-white text-sm p-1"
                        />
                      ) : (
                        user.role
                      )}
                    </td>
                    <td className="px-4 py-2 whitespace-nowrap text-sm space-x-2">
                      {currentUser?.role === UserRole.Admin && editingUser?.id === user.id ? (
                        <Button onClick={handleSaveEdit} size="sm" variant="success" className="bg-green-600 hover:bg-green-500">Save</Button>
                      ) : (
                        currentUser?.role === UserRole.Admin && currentUser.id !== user.id && // Admin can edit others
                        (user.role !== UserRole.Admin || user.id !== currentUser.id) && // Don't allow edit button for self if admin wants to demote
                        <Button onClick={() => handleStartEdit(user)} size="sm" variant="secondary" className="bg-yellow-500 hover:bg-yellow-400 text-black">
                          <EditIcon className="w-4 h-4"/>
                        </Button>
                      )}
                       {currentUser?.id !== user.id && 
                        (currentUser?.role === UserRole.Admin || (currentUser?.role === UserRole.Moderator && user.role !== UserRole.Admin && user.role !== UserRole.Moderator)) && (
                        <Button onClick={() => removeUser(user.id)} size="sm" variant="danger" className="bg-red-600 hover:bg-red-500">
                          <TrashIcon className="w-4 h-4"/>
                        </Button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        <div className="flex justify-end pt-4">
             <Button type="button" onClick={onClose} variant="secondary" className="bg-slate-600 hover:bg-slate-500">
                Close
            </Button>
        </div>
      </div>
    </Modal>
  );
};

export default UserManagement;