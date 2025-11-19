'use client';

import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';

type Props = {
  setChatOpen: (open: boolean) => void;
};

const FloatingButtons = ({ setChatOpen }: Props) => {
  const { isAuthenticated } = useAuth();

  return (
    <>
      {!isAuthenticated && (
        <Link
          href="/deepfake-audio"
          className="fixed z-50 bottom-6 left-4 sm:left-8 w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-indigo-600 shadow-lg hover:bg-indigo-700 transition-all duration-300 flex items-center justify-center text-white"
          title="Deepfake Audio Generator"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6 sm:h-8 sm:w-8"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"
            />
          </svg>
        </Link>
      )}

      <button
        onClick={() => setChatOpen(true)}
        className="fixed z-50 bottom-6 right-4 sm:right-8 w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-blue-600 shadow-lg hover:bg-blue-700 transition-all duration-300 flex items-center justify-center text-white"
        title="Chat Support"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-6 w-6 sm:h-8 sm:w-8"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
          />
        </svg>
      </button>
    </>
  );
};

export default FloatingButtons;
