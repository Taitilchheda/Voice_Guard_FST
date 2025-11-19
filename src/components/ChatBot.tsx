// components/ChatBot.tsx
import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiSend, FiX, FiMessageSquare } from 'react-icons/fi';

const ChatBot = ({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) => {
  const [messages, setMessages] = useState<Array<{ text: string; sender: 'user' | 'bot' }>>([
    { text: "Hello! I'm your VoiceGuard assistant. How can I help you today?", sender: 'bot' }
  ]);
  const [inputValue, setInputValue] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const commonQuestions = [
    "How does deepfake detection work?",
    "What file formats do you support?",
    "How accurate is your system?",
    "Can I analyze live recordings?"
  ];

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = () => {
    if (inputValue.trim() === '') return;

    // Add user message
    const userMessage = { text: inputValue, sender: 'user' as const };
    setMessages(prev => [...prev, userMessage]);
    setInputValue('');

    // Simulate bot response after a delay
    setTimeout(() => {
      const botResponse = generateBotResponse(inputValue);
      setMessages(prev => [...prev, { text: botResponse, sender: 'bot' }]);
    }, 800);
  };

  const generateBotResponse = (question: string) => {
    const lowerQuestion = question.toLowerCase();
    
    if (lowerQuestion.includes('how') && lowerQuestion.includes('work')) {
      return "Our system uses advanced neural networks to analyze spectral patterns, micro-timing, and vocal biomarkers that distinguish synthetic voices from authentic ones. We examine over 150 vocal characteristics for detection.";
    } else if (lowerQuestion.includes('format') || lowerQuestion.includes('support')) {
      return "We support all common audio formats including WAV, MP3, AAC, and FLAC. For best results, we recommend uncompressed WAV files at 16-bit 44.1kHz or higher.";
    } else if (lowerQuestion.includes('accurate') || lowerQuestion.includes('accuracy')) {
      return "Our current detection accuracy is 98.2% for high-quality samples. Accuracy may vary slightly with low-quality recordings or heavily processed audio.";
    } else if (lowerQuestion.includes('live') || lowerQuestion.includes('record')) {
      return "Yes! You can record directly through our web interface or mobile app. Just click the microphone icon on the detection page to start a live analysis.";
    } else if (lowerQuestion.includes('privacy') || lowerQuestion.includes('data')) {
      return "All voice analysis is performed with strict privacy protections. Your audio is encrypted during processing and never stored longer than necessary. You can delete analysis results at any time.";
    } else {
      return "I'm designed to help with VoiceGuard's deepfake detection features. Could you clarify your question or try asking about our detection technology, supported formats, or accuracy?";
    }
  };

  const handleQuickQuestion = (question: string) => {
    setInputValue(question);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          transition={{ type: 'spring', damping: 25 }}
          className="fixed bottom-24 right-8 w-96 max-w-full bg-white dark:bg-gray-800 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden z-50"
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-indigo-700 p-4 text-white flex justify-between items-center">
            <div className="flex items-center">
              <FiMessageSquare className="w-5 h-5 mr-2" />
              <h3 className="font-semibold text-white">VoiceGuard Assistant</h3>
            </div>
            <button 
              onClick={onClose}
              className="p-1 rounded-full hover:bg-white/10 transition-colors"
            >
              <FiX className="w-5 h-5" />
            </button>
          </div>

          {/* Messages */}
          <div className="h-80 overflow-y-auto p-4 space-y-4">
            {messages.map((message, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-xs md:max-w-md rounded-lg px-4 py-2 ${message.sender === 'user' 
                    ? 'bg-blue-600 text-white rounded-br-none' 
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-bl-none'}`}
                >
                  {message.text}
                </div>
              </motion.div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Questions */}
          <div className="px-4 pb-2">
            <h4 className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-2">QUICK QUESTIONS</h4>
            <div className="flex flex-wrap gap-2">
              {commonQuestions.map((question, index) => (
                <motion.button
                  key={index}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handleQuickQuestion(question)}
                  className="text-xs bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200 px-3 py-1 rounded-full transition-colors"
                >
                  {question}
                </motion.button>
              ))}
            </div>
          </div>

          {/* Input */}
          <div className="p-4 border-t border-gray-200 dark:border-gray-700 flex">
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
              placeholder="Type your question..."
              className="flex-1 bg-gray-100 dark:bg-gray-700 rounded-l-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-800 dark:text-gray-200"
            />
            <button
              onClick={handleSendMessage}
              disabled={inputValue.trim() === ''}
              className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white px-4 py-2 rounded-r-lg transition-colors"
            >
              <FiSend className="w-5 h-5" />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ChatBot;