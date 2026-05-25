import React from 'react';

interface DemoBannerProps {
  userEmail?: string;
}

/**
 * Demo Mode Banner Component
 * Displayed at the top of the dashboard when user is in demo/read-only mode
 */
export const DemoBanner: React.FC<DemoBannerProps> = ({ userEmail = 'demo@orbitworld.com' }) => {
  return (
    <div className="w-full bg-gradient-to-r from-amber-50 to-orange-50 border-b-2 border-amber-300 px-4 py-3 shadow-sm">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        <div className="flex items-center gap-3 flex-1">
          <div className="flex-shrink-0">
            <svg
              className="h-5 w-5 text-amber-600"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                clipRule="evenodd"
              />
            </svg>
          </div>
          <div className="flex-1">
            <p className="text-sm font-semibold text-amber-900">
              🔒 Demo Mode - Read-Only Access
            </p>
            <p className="text-xs text-amber-700 mt-0.5">
              You are logged in as <span className="font-mono font-semibold">{userEmail}</span> with read-only permissions. 
              You can view all data but cannot create, edit, or delete records.
            </p>
          </div>
        </div>
        <div className="flex-shrink-0 text-xs text-amber-600 font-medium px-3 py-1 bg-amber-100 rounded-full whitespace-nowrap">
          Viewing Only
        </div>
      </div>
    </div>
  );
};

export default DemoBanner;
