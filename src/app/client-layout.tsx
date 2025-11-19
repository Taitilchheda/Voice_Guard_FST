'use client';

import { useState } from 'react';
import Navigation from '@/components/Navigation';
import ChatBot from '@/components/ChatBot';
import FloatingButtons from '@/components/FloatingButtons';
import { AuthProvider } from '@/contexts/AuthContext';
import { DetectionProvider } from '@/contexts/DetectionContext';

const ClientLayout = ({ children }: { children: React.ReactNode }) => {
  const [chatOpen, setChatOpen] = useState(false);

  return (
    <AuthProvider>
      <DetectionProvider>
        <Navigation />
        <ChatBot isOpen={chatOpen} onClose={() => setChatOpen(false)} />
        <FloatingButtons setChatOpen={setChatOpen} />
        <main className="pt-16">{children}</main>
      </DetectionProvider>
    </AuthProvider>
  );
};

export default ClientLayout;
