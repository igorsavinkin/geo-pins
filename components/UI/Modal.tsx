
import React from 'react';

interface ModalProps {
  title: string;
  children: React.ReactNode;
  onClose: () => void;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

const Modal: React.FC<ModalProps> = ({ title, children, onClose, size = 'md' }) => {
  const sizeClasses: Record<string, string> = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-[1500] p-4 transition-opacity duration-300 ease-in-out">
      <div 
        className={`bg-slate-800 p-6 rounded-lg shadow-2xl w-full ${sizeClasses[size]} text-white transform transition-all duration-300 ease-in-out scale-95 opacity-0 animate-modalFadeIn`}
        onClick={(e) => e.stopPropagation()}
        style={{ animationName: 'modalFadeInAnim', animationDuration: '0.3s', animationFillMode: 'forwards' }}
      >
        <div className="flex justify-between items-center mb-4 border-b border-slate-700 pb-3">
          <h2 className="text-2xl font-semibold text-sky-400">{title}</h2>
          <button 
            onClick={onClose} 
            className="text-gray-400 hover:text-white text-2xl leading-none p-1 rounded-full hover:bg-slate-700 transition-colors"
            aria-label="Close modal"
          >
            &times;
          </button>
        </div>
        {children}
      </div>
      <style>
        {`
          @keyframes modalFadeInAnim {
            to {
              opacity: 1;
              transform: scale(1);
            }
          }
        `}
      </style>
    </div>
  );
};

// Add this to your global CSS or a style tag in index.html if you prefer not to use inline style tag
// @keyframes modalFadeInAnim {
//   to {
//     opacity: 1;
//     transform: scale(1);
//   }
// }
// .animate-modalFadeIn {
//   animation: modalFadeInAnim 0.3s ease-out forwards;
// }


export default Modal;
