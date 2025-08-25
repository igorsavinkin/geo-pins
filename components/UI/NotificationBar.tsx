
import React from 'react';
import { useNotifier } from '../../hooks/useNotifier';
import { NotificationMessage } from '../../types';

const NotificationBar: React.FC = () => {
  const { notifications, removeNotification } = useNotifier();

  if (notifications.length === 0) {
    return null;
  }

  const getBgColor = (type: NotificationMessage['type']) => {
    switch (type) {
      case 'success': return 'bg-green-600';
      case 'error': return 'bg-red-600';
      case 'info': return 'bg-sky-600';
      default: return 'bg-gray-700';
    }
  };

  return (
    <div className="fixed bottom-0 right-0 p-4 space-y-2 z-[2000]">
      {notifications.map(notif => (
        <div
          key={notif.id}
          className={`flex items-center justify-between p-3 rounded-md shadow-lg text-white text-sm ${getBgColor(notif.type)} transition-all duration-300 ease-in-out transform opacity-0 animate-slideIn`}
          style={{ animationName: 'slideInAnim', animationDuration: '0.5s', animationFillMode: 'forwards' }}

        >
          <span>{notif.message}</span>
          <button 
            onClick={() => removeNotification(notif.id)} 
            className="ml-4 text-lg leading-none hover:text-gray-200"
            aria-label="Close notification"
          >
            &times;
          </button>
        </div>
      ))}
       <style>
        {`
          @keyframes slideInAnim {
            from {
              opacity: 0;
              transform: translateY(20px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }
        `}
      </style>
    </div>
  );
};

export default NotificationBar;
