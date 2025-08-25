import React, { useState } from 'react';
import { useAppContext } from '../../hooks/useAppContext';
import { useNotifier } from '../../hooks/useNotifier';
import { Coordinates, UserRole } from '../../types';
import Modal from '../UI/Modal';
import Input from '../UI/Input';
import Button from '../UI/Button';
import { DEFAULT_LANDMARK_EXPIRATION_MINUTES } from '../../constants';

interface AddLandmarkFormProps {
  coords: Coordinates;
  onClose: () => void;
}

const AddLandmarkForm: React.FC<AddLandmarkFormProps> = ({ coords, onClose }) => {
  const { addLandmark, currentUser } = useAppContext();
  const { addNotification } = useNotifier();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [expirationMinutes, setExpirationMinutes] = useState(String(DEFAULT_LANDMARK_EXPIRATION_MINUTES));
  const [neverExpires, setNeverExpires] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const canSetPermanent = currentUser && (currentUser.role === UserRole.Leader || currentUser.role === UserRole.Admin || currentUser.role === UserRole.Moderator);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      addNotification('Name is required.', 'error');
      return;
    }

    let landmarkExpiresAt: number | null = null;
    if (canSetPermanent && neverExpires) {
        landmarkExpiresAt = null;
    } else {
        const minutes = parseInt(expirationMinutes, 10);
        if (isNaN(minutes) || minutes <= 0) {
            addNotification('Please enter a valid, positive lifetime in minutes.', 'error');
            return;
        }
        
        // Drivers have a max lifetime of 1 day (1440 minutes)
        if (!canSetPermanent && minutes > 1440) {
             addNotification('Drivers can set a maximum lifetime of 1 day (1440 minutes).', 'error');
            return;
        }
        
        landmarkExpiresAt = Date.now() + minutes * 60 * 1000;
    }

    setIsSubmitting(true);
    await addLandmark({
      name,
      description,
      latitude: coords.y, // map Y is latitude
      longitude: coords.x, // map X is longitude
      expiresAt: landmarkExpiresAt,
    });
    // On success, the context closes the modal, so this component unmounts.
    // No need to setIsSubmitting(false) unless there's an error handled inside addLandmark that doesn't close the modal.
  };

  if (!currentUser) return null;

  return (
    <Modal title="Add New Landmark" onClose={onClose}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          id="landmarkName"
          label="Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          className="bg-slate-700 border-slate-600 text-white"
          labelClassName="text-sky-300"
          disabled={isSubmitting}
        />
        
        <div>
            <Input
              id="landmarkExpiration"
              label="Lifetime (minutes)"
              type="number"
              value={expirationMinutes}
              onChange={(e) => setExpirationMinutes(e.target.value)}
              disabled={neverExpires || isSubmitting}
              min="1"
              required
              className="bg-slate-700 border-slate-600 text-white disabled:bg-slate-800 disabled:cursor-not-allowed"
              labelClassName="text-sky-300"
            />
            {canSetPermanent && (
                 <div className="mt-2 flex items-center">
                    <input
                        id="neverExpires"
                        type="checkbox"
                        checked={neverExpires}
                        onChange={(e) => setNeverExpires(e.target.checked)}
                        className="h-4 w-4 rounded border-gray-500 text-sky-600 focus:ring-sky-500 bg-slate-700"
                        disabled={isSubmitting}
                    />
                    <label htmlFor="neverExpires" className="ml-2 block text-sm text-gray-300">
                        Never Expires
                    </label>
                </div>
            )}
        </div>


        <div className="flex justify-end space-x-3 pt-4">
          <Button type="button" onClick={onClose} variant="secondary" className="bg-slate-600 hover:bg-slate-500" disabled={isSubmitting}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" className="bg-sky-600 hover:bg-sky-500" disabled={isSubmitting}>
            {isSubmitting ? 'Adding...' : 'Add Landmark'}
          </Button>
        </div>

        <div>
          <Input
            id="landmarkDescription"
            label="Description (Optional)"
            type="text"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="bg-slate-700 border-slate-600 text-white"
            labelClassName="text-sky-300"
            disabled={isSubmitting}
          />
        </div>
      </form>
    </Modal>
  );
};

export default AddLandmarkForm;