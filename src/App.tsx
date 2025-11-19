import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import Home from './pages/Home';
import Detection from './pages/Detection';
import Dashboard from './pages/Dashboard';
import Feedback from './pages/Feedback';
import AuthPage from './pages/authpage';
import DeepfakeAudio from './pages/DeepfakeAudio'; // New import
import Navigation from './components/Navigation';
import ChatBot from './components/ChatBot';
import { useState } from 'react';
import { DetectionProvider } from './contexts/DetectionContext';
import { AuthProvider, useAuth } from './contexts/AuthContext'; // Assuming you have auth context

// Create a separate component for the floating action button
const FloatingButtons = ({ setChatOpen }: { setChatOpen: (open: boolean) => void }) => {
  const { isAuthenticated } = useAuth(); // Get auth status

  return (
    <div className="fixed z-50 bottom-8 right-8 flex flex-col items-end gap-4">
      {/* Deepfake Audio Button - only show when not authenticated */}
      {!isAuthenticated && (
        <a 
          href="/deepfake-audio"
          className="w-16 h-16 rounded-full bg-indigo-600 shadow-lg hover:bg-indigo-700 transition-all duration-300 flex items-center justify-center text-white"
          title="Deepfake Audio Generator"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
          </svg>
        </a>
      )}
      
      {/* Chat Button */}
      <button 
        onClick={() => setChatOpen(true)}
        className="w-16 h-16 rounded-full bg-blue-600 shadow-lg hover:bg-blue-700 transition-all duration-300 flex items-center justify-center text-white"
        title="Chat Support"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
        </svg>
      </button>
    </div>
  );
};

function App() {
  const [chatOpen, setChatOpen] = useState(false);

  return (
    <Router>
      <AuthProvider>
        <DetectionProvider>
          <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
            <Navigation />
            <ChatBot isOpen={chatOpen} onClose={() => setChatOpen(false)} />
            
            <FloatingButtons setChatOpen={setChatOpen} />

            <AnimatePresence mode="wait">
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/detect" element={<Detection />} />
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/feedback" element={<Feedback />} />
                <Route path="/auth" element={<AuthPage />} />
                <Route path="/deepfake-audio" element={<DeepfakeAudio />} /> {/* New route */}
              </Routes>
            </AnimatePresence>
          </div>
        </DetectionProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;