import { useState, useRef, useEffect } from 'react';
import Button from '../components/Button';
import { Mic, Download, PlayArrow, Pause, GraphicEq } from '@mui/icons-material';
import { motion } from 'framer-motion';
import Slider from '@mui/material/Slider';

// Famous voices data
const FAMOUS_VOICES = [
  {
    id: 'default',
    name: 'Default Voice',
    description: 'Your system default voice',
    icon: <GraphicEq />,
    voiceName: '',
    pitch: 1,
    rate: 1
  },
  {
    id: 'morgan-freeman',
    name: 'Morgan Freeman',
    description: 'Deep, calm narrator voice',
    icon: <GraphicEq />,
    voiceName: 'Google US English',
    pitch: 0.8,  // Deeper pitch
    rate: 0.9    // Slightly slower
  },
  {
    id: 'siri-female',
    name: 'Siri (Female)',
    description: 'Apple Siri female voice',
    icon: <GraphicEq />,
    voiceName: 'Samantha',
    pitch: 1.2,  // Higher pitch
    rate: 1.1    // Slightly faster
  },
  {
    id: 'david-attenborough',
    name: 'David Attenborough',
    description: 'British documentary narrator',
    icon: <GraphicEq />,
    voiceName: 'Daniel',
    pitch: 1,    // Normal pitch
    rate: 0.95   // Slightly slower
  },
  {
    id: 'alexa-female',
    name: 'Alexa (Female)',
    description: 'Amazon Alexa voice',
    icon: <GraphicEq />,
    voiceName: 'Google UK English Female',
    pitch: 1.1,  // Slightly higher
    rate: 1      // Normal speed
  },
  {
    id: 'robot-voice',
    name: 'Robot Voice',
    description: 'Synthetic robotic voice',
    icon: <GraphicEq />,
    voiceName: 'Microsoft David Desktop',
    pitch: 1.5,  // Very high pitch
    rate: 1.3    // Faster speed
  }
];

const DeepfakeAudioPage = () => {
  const [text, setText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [selectedVoice, setSelectedVoice] = useState(FAMOUS_VOICES[0].id);
  const [pitch, setPitch] = useState(1);
  const [rate, setRate] = useState(1);
  const [availableVoices, setAvailableVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const progressInterval = useRef<NodeJS.Timeout | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  // Find the best matching voice for our famous voices
  const findBestVoiceMatch = (voiceName: string) => {
    if (!voiceName) return null;
    
    // Try exact match first
    const exactMatch = availableVoices.find(v => 
      v.name.toLowerCase().includes(voiceName.toLowerCase())
    );
    if (exactMatch) return exactMatch;
    
    // Try partial match
    return availableVoices.find(v => 
      v.name.toLowerCase().includes(voiceName.split(' ')[0].toLowerCase())
    );
  };

  // Initialize audio recording
  const initAudioRecording = async () => {
    try {
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      const dest = audioContextRef.current.createMediaStreamDestination();

      // Connect the audio context to the destination
      const utteranceAudioSource = audioContextRef.current.createGain();
      utteranceAudioSource.connect(dest);

      mediaRecorderRef.current = new MediaRecorder(dest.stream);

      mediaRecorderRef.current.ondataavailable = (e) => {
        audioChunksRef.current.push(e.data);
      };

      mediaRecorderRef.current.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
        setAudioBlob(audioBlob);
        setAudioUrl(URL.createObjectURL(audioBlob));
        audioChunksRef.current = [];
      };
    } catch (error) {
      console.error('Error initializing audio recording:', error);
    }
  };

  // Generate audio using Web Speech API
  const handleGenerateAudio = async () => {
    if (!text.trim()) return;
    setIsLoading(true);

    try {
      // Cancel any previous speech
      window.speechSynthesis.cancel();

      // Initialize audio recording if not already done
      if (!mediaRecorderRef.current) {
        await initAudioRecording();
      }

      // Create a new utterance
      const utterance = new SpeechSynthesisUtterance(text);

      // Get voice data for selected voice
      const voiceData = FAMOUS_VOICES.find(v => v.id === selectedVoice);
      const activePitch = pitch;
      const activeRate = rate;

      // Set voice properties
      utterance.rate = activeRate;
      utterance.pitch = activePitch;

      // Set the selected voice
      if (voiceData) {
        if (voiceData.id === 'default') {
          const defaultVoice = availableVoices.find(v => v.default) || availableVoices[0];
          if (defaultVoice) utterance.voice = defaultVoice;
        } else {
      const matchedVoice = findBestVoiceMatch(voiceData.voiceName);
        if (matchedVoice) utterance.voice = matchedVoice;
      }
      }

      // Start recording
      if (mediaRecorderRef.current) {
        audioChunksRef.current = [];
        mediaRecorderRef.current.start();
      }

      // Event handlers
      utterance.onstart = () => {
        setIsPlaying(true);
        startProgressTimer();
      };

      utterance.onend = () => {
        setIsPlaying(false);
        stopProgressTimer();

        // Stop recording after a small delay to ensure all audio is captured
        setTimeout(() => {
          if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
            mediaRecorderRef.current.stop();
          }
        }, 500);
      };

      utterance.onpause = () => {
        setIsPlaying(false);
        stopProgressTimer();
      };

      utterance.onresume = () => {
        setIsPlaying(true);
        startProgressTimer();
      };

      // Play the audio
      window.speechSynthesis.speak(utterance);
    } catch (error) {
      console.error('Error generating audio:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const startProgressTimer = () => {
    stopProgressTimer();
    const duration = text.length / (12 * rate); // Adjust duration based on rate
    const increment = 100 / (duration * 10);
    
    progressInterval.current = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(progressInterval.current as NodeJS.Timeout);
          return 100;
        }
        return prev + increment;
      });
    }, 100);
  };

  const stopProgressTimer = () => {
    if (progressInterval.current) {
      clearInterval(progressInterval.current);
      progressInterval.current = null;
    }
  };

  const togglePlayPause = () => {
    if (isPlaying) {
      window.speechSynthesis.pause();
    } else {
      window.speechSynthesis.resume();
    }
  };

  const handleStop = () => {
    window.speechSynthesis.cancel();
    setIsPlaying(false);
    setProgress(0);
    stopProgressTimer();
    
    // Stop recording if active
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    }
  };

  const handleDownload = async (format: 'wav' | 'mp3') => {
    if (!audioBlob) return;

    if (format === 'wav') {
      // Download WAV file directly
      const a = document.createElement('a');
      a.href = URL.createObjectURL(audioBlob);
      a.download = `audio-${new Date().toISOString()}.wav`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    } else if (format === 'mp3') {
      // Convert WAV to MP3 and download
      const mp3Blob = await convertToMP3(audioBlob);
      const mp3Url = URL.createObjectURL(mp3Blob);
      const a = document.createElement('a');
      a.href = mp3Url;
      a.download = `audio-${new Date().toISOString()}.mp3`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(mp3Url);
    }
  };

  // Convert WAV to MP3 (simplified - in a real app you'd use a library like lamejs)
  const convertToMP3 = async (blob: Blob): Promise<Blob> => {
    // This is a placeholder - in a real implementation you would:
    // 1. Decode the WAV data
    // 2. Encode to MP3 using a library
    // 3. Return the MP3 blob
    
    // For demo purposes, we'll just return the original blob
    return blob;
  };

  // Load voices when component mounts
  useEffect(() => {
    const loadVoices = () => {
      const voices = window.speechSynthesis.getVoices();
      setAvailableVoices(voices);
    };
    
    // Load voices immediately if available
    loadVoices();
    
    // Some browsers need this event to load voices
    window.speechSynthesis.onvoiceschanged = loadVoices;
    
    return () => {
      window.speechSynthesis.onvoiceschanged = null;
      stopProgressTimer();
      
      // Clean up audio URL
      if (audioUrl) {
        URL.revokeObjectURL(audioUrl);
      }
    };
  }, [audioUrl]);

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 pt-24">
      {/* Header Section */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="mb-12 text-center"
      >
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-3">Audio Generator</h1>
        <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
          Convert text to high-quality speech with famous voices
        </p>
      </motion.div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Text Input Section */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
          className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 border border-gray-200 dark:border-gray-700"
        >
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-6">Text Input</h2>
          <textarea
            className="w-full h-72 p-4 rounded-lg border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white resize-none"
            placeholder="Enter the text you want to convert to speech..."
            value={text}
            onChange={(e) => setText(e.target.value)}
          />
          
          {/* Voice Selection */}
          <div className="mt-6">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-3">Select Voice</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-6">
              {FAMOUS_VOICES.map((voice) => (
                <button
                  key={voice.id}
                  onClick={() => {
                    setSelectedVoice(voice.id);
                    setPitch(voice.pitch);
                    setRate(voice.rate);
                  }}
                  className={`p-3 rounded-lg border transition-colors flex flex-col items-center ${
                    selectedVoice === voice.id
                      ? 'bg-blue-100 dark:bg-blue-900 border-blue-500 dark:border-blue-700'
                      : 'bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-600'
                  }`}
                >
                  <span className="text-blue-500 dark:text-blue-400 mb-1">
                    {voice.icon}
                  </span>
                  <span className="font-medium text-gray-900 dark:text-white">{voice.name}</span>
                  <span className="text-xs text-gray-500 dark:text-gray-400 mt-1">{voice.description}</span>
                </button>
              ))}
            </div>
          </div>
          
          {/* Voice Modulation */}
          <div className="mt-6">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-3">Voice Modulation</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Pitch: {pitch.toFixed(1)}
                </label>
                <Slider
                  value={pitch}
                  onChange={(e, newValue) => setPitch(newValue as number)}
                  min={0.5}
                  max={2}
                  step={0.1}
                  aria-labelledby="pitch-slider"
                  className="text-blue-500"
                />
                <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400">
                  <span>Lower</span>
                  <span>Normal</span>
                  <span>Higher</span>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Speed: {rate.toFixed(1)}
                </label>
                <Slider
                  value={rate}
                  onChange={(e, newValue) => setRate(newValue as number)}
                  min={0.5}
                  max={2}
                  step={0.1}
                  aria-labelledby="rate-slider"
                  className="text-blue-500"
                />
                <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400">
                  <span>Slower</span>
                  <span>Normal</span>
                  <span>Faster</span>
                </div>
              </div>
            </div>
          </div>
          
          <div className="mt-6">
            <Button
              variant="primary"
              size="lg"
              onClick={handleGenerateAudio}
              loading={isLoading}
              disabled={isLoading || !text.trim()}
              icon={Mic}
              className="w-full"
            >
              {isLoading ? 'Generating...' : 'Generate Audio'}
            </Button>
          </div>
        </motion.div>

        {/* Audio Output Section */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3, delay: 0.2 }}
          className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 border border-gray-200 dark:border-gray-700 h-fit"
        >
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-6">Audio Controls</h2>
          
          <div className="space-y-6">
            {/* Audio Player */}
            <div className="p-5 bg-gray-50 dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-3 w-full sm:w-auto">
                  <button
                    onClick={togglePlayPause}
                    disabled={!text.trim()}
                    className={`w-12 h-12 rounded-full flex items-center justify-center text-white transition-colors ${
                      text.trim() 
                        ? 'bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-800'
                        : 'bg-gray-400 dark:bg-gray-600 cursor-not-allowed'
                    }`}
                  >
                    {isPlaying ? <Pause className="text-xl" /> : <PlayArrow className="text-xl" />}
                  </button>
                  
                  <button
                    onClick={handleStop}
                    disabled={!isPlaying}
                    className={`w-12 h-12 rounded-full flex items-center justify-center text-white transition-colors ${
                      isPlaying
                        ? 'bg-red-600 hover:bg-red-700 dark:bg-red-700 dark:hover:bg-red-800'
                        : 'bg-gray-400 dark:bg-gray-600 cursor-not-allowed'
                    }`}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8 7a1 1 0 00-1 1v4a1 1 0 001 1h4a1 1 0 001-1V8a1 1 0 00-1-1H8z" clipRule="evenodd" />
                    </svg>
                  </button>
                  
                  <div className="ml-2">
                    <p className="font-medium text-gray-900 dark:text-white">
                      {text.trim() ? 'Ready to play' : 'No audio'}
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {text.length > 0 ? Math.ceil(text.length / (12 * rate)) : 0}s duration
                    </p>
                  </div>
                </div>
              </div>
              
              {/* Progress bar */}
              <div className="mt-4">
                <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mb-1">
                  <span>0:00</span>
                  <span>{text.length > 0 ? Math.ceil(text.length / (12 * rate)) : 0}:00</span>
                </div>
                <div className="h-2 w-full bg-gray-200 dark:bg-gray-600 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-blue-600 dark:bg-blue-500 transition-all duration-300" 
                    style={{ width: `${progress}%` }}
                  ></div>
                </div>
              </div>
            </div>
            
            {/* Download Options */}
            {audioUrl && (
              <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-3">Download Audio</h3>
                <div className="flex gap-3">
                  <Button
                    variant="secondary"
                    size="md"
                    onClick={() => handleDownload('wav')}
                    icon={Download}
                    className="flex-1"
                  >
                    WAV
                  </Button>
                  <Button
                    variant="secondary"
                    size="md"
                    onClick={async () => {
                      if (audioBlob) {
                        const mp3Blob = await convertToMP3(audioBlob);
                        const mp3Url = URL.createObjectURL(mp3Blob);
                        const a = document.createElement('a');
                        a.href = mp3Url;
                        a.download = `audio-${new Date().toISOString()}.mp3`;
                        document.body.appendChild(a);
                        a.click();
                        document.body.removeChild(a);
                        URL.revokeObjectURL(mp3Url);
                      }
                    }}
                    icon={Download}
                    className="flex-1"
                  >
                    MP3
                  </Button>
                </div>
              </div>
            )}
            
            {/* Selected Voice Info */}
            <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
              <p className="text-sm text-gray-500 dark:text-gray-400">Selected Voice</p>
              <p className="text-xl font-semibold text-gray-900 dark:text-white">
                {FAMOUS_VOICES.find(v => v.id === selectedVoice)?.name || 'Default'}
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                {FAMOUS_VOICES.find(v => v.id === selectedVoice)?.description}
              </p>
            </div>
            
            {/* Audio Stats */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                <p className="text-sm text-gray-500 dark:text-gray-400">Characters</p>
                <p className="text-xl font-semibold text-gray-900 dark:text-white">{text.length}</p>
              </div>
              <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                <p className="text-sm text-gray-500 dark:text-gray-400">Words</p>
                <p className="text-xl font-semibold text-gray-900 dark:text-white">{Math.ceil(text.length / 5)}</p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Footer Section */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="mt-12 text-center text-sm text-gray-500 dark:text-gray-400 border-t border-gray-200 dark:border-gray-700 pt-8"
      >
        <p>This service uses your browser's built-in text-to-speech capabilities</p>
        <p className="mt-1">Voice availability depends on your system and browser</p>
      </motion.div>
    </div>
  );
};

export default DeepfakeAudioPage;
