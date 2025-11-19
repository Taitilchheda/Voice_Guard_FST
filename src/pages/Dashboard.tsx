'use client';

// pages/Dashboard.tsx

import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { Line, Bar, Doughnut } from 'react-chartjs-2';
import { Chart, registerables } from 'chart.js';
import { FiDownload, FiFilter, FiAlertCircle, FiCheckCircle, FiPlayCircle, FiStopCircle, FiMapPin } from 'react-icons/fi';

Chart.register(...registerables);

const Dashboard = () => {
  const [timeRange, setTimeRange] = useState('monthly');
  const [currentlyPlaying, setCurrentlyPlaying] = useState<number | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const handlePlay = (scanId: number, sampleUrl?: string) => {
    if (currentlyPlaying === scanId) {
      audioRef.current?.pause();
      audioRef.current = null;
      setCurrentlyPlaying(null);
      return;
    }

    if (!sampleUrl) return;

    audioRef.current?.pause();
    const audio = new Audio();
    audio.crossOrigin = 'anonymous';
    audio.src = sampleUrl;
    audio.volume = 1;
    audioRef.current = audio;
    audio.play().catch(console.error);
    setCurrentlyPlaying(scanId);
    audio.onended = () => {
      setCurrentlyPlaying((prev) => (prev === scanId ? null : prev));
      audioRef.current = null;
    };
  };

  useEffect(() => {
    return () => audioRef.current?.pause();
  }, []);

  const WaveAnimation = () => (
    <div className="wave-container flex items-center space-x-1 h-6">
      {[1, 2, 3, 4].map((wave) => (
        <motion.div
          key={wave}
          className="wave h-full w-1 bg-blue-500 rounded-full"
          animate={{
            height: ['50%', '100%', '50%'],
            opacity: [0.5, 1, 0.5],
          }}
          transition={{
            duration: 0.8,
            repeat: Infinity,
            delay: wave * 0.2,
          }}
        />
      ))}
    </div>
  );

  const detectionData = {
    labels: ['Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct'],
    datasets: [
      {
        label: 'Deepfake Detections',
        data: [48, 62, 71, 68, 74, 77, 82],
        borderColor: '#5E5ADB',
        backgroundColor: 'rgba(94, 90, 219, 0.1)',
        tension: 0.4,
        fill: true,
      },
    ],
  };

  const riskData = {
    labels: ['High Risk', 'Medium Risk', 'Low Risk'],
    datasets: [
      {
        data: [38, 44, 18],
        backgroundColor: ['#EF4444', '#F59E0B', '#10B981'],
        borderWidth: 0,
      },
    ],
  };

  const analysisData = {
    labels: ['May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct'],
    datasets: [
      {
        label: 'Deepfakes',
        data: [54, 61, 68, 72, 79, 82],
        backgroundColor: '#5E5ADB',
        borderRadius: 6,
      },
      {
        label: 'Authentic',
        data: [312, 298, 344, 331, 348, 356],
        backgroundColor: '#10B981',
        borderRadius: 6,
      },
    ],
  };

  type RecentScan = {
    id: number;
    date: string;
    name: string;
    result: boolean;
    confidence: number;
    location: string;
    sampleUrl?: string;
  };

  const recentScans: RecentScan[] = [
    {
      id: 1,
      date: '2024-11-20 14:32 UTC',
      name: 'BoardMeeting_CFO.wav',
      result: true,
      confidence: 98,
      location: 'New York, USA',
      sampleUrl: '/samples/biden-original.wav',
    },
    {
      id: 2,
      date: '2024-11-19 18:11 UTC',
      name: 'Supplier_Contract_Call.mp3',
      result: false,
      confidence: 31,
      location: 'Toronto, Canada',
      sampleUrl: '/samples/obama-to-biden.wav',
    },
    {
      id: 3,
      date: '2024-11-19 09:05 UTC',
      name: 'Emergency_Response_CheckIn.wav',
      result: true,
      confidence: 95,
      location: 'Berlin, Germany',
      sampleUrl: '/samples/linus-original-DEMO.mp3',
    },
    {
      id: 4,
      date: '2024-11-18 21:44 UTC',
      name: 'Investor_Update_Voicemail.m4a',
      result: true,
      confidence: 93,
      location: 'Singapore',
      sampleUrl: '/samples/linus-to-musk-DEMO.mp3',
    },
    {
      id: 5,
      date: '2024-11-18 08:57 UTC',
      name: 'Outbound_Collection_Attempt.wav',
      result: false,
      confidence: 22,
      location: 'London, UK',
      sampleUrl: '/samples/linus-to-musk-DEMO.mp3',
    },
  ];

  return (
    <div className="container mx-auto px-4 pt-28 py-12">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
        <motion.h1 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-3xl md:text-4xl font-bold dark:text-white"
        >
          Detection Analytics
        </motion.h1>
        
        <div className="flex items-center space-x-4 mt-4 md:mt-0">
          <div className="relative">
          <select 
  value={timeRange}
  onChange={(e) => setTimeRange(e.target.value)}
  className="appearance-none bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg pl-4 pr-8 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-white"
>
  <option className="text-white" value="weekly">Weekly</option>
  <option className="text-white" value="monthly">Monthly</option>
  <option className="text-white" value="quarterly">Quarterly</option>
</select>

            <FiFilter className="absolute right-3 top-2.5 text-gray-400" />
          </div>
          <button className="flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors">
            <FiDownload className="mr-2" /> Export
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <motion.div 
          whileHover={{ y: -5 }}
          className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow border border-gray-100 dark:border-gray-700"
        >
          <p className="text-sm text-gray-600 dark:text-gray-300 mb-1">Total Scans</p>
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">3,842</h3>
          <p className="text-sm text-green-500">+11.2% from last month</p>
        </motion.div>
        
        <motion.div 
          whileHover={{ y: -5 }}
          className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow border border-gray-100 dark:border-gray-700"
        >
          <p className="text-sm text-gray-600 dark:text-gray-300 mb-1">Deepfakes Detected</p>
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">312</h3>
          <p className="text-sm text-green-500">+9.1% from last month</p>
        </motion.div>
        
        <motion.div 
          whileHover={{ y: -5 }}
          className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow border border-gray-100 dark:border-gray-700"
        >
          <p className="text-sm text-gray-600 dark:text-gray-300 mb-1">Detection Accuracy</p>
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">98.4%</h3>
          <p className="text-sm text-green-500">+0.4% improvement</p>
        </motion.div>
        
        <motion.div 
          whileHover={{ y: -5 }}
          className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow border border-gray-100 dark:border-gray-700"
        >
          <p className="text-sm text-gray-600 dark:text-gray-300 mb-1">Avg. Processing Time</p>
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">2.1s</h3>
          <p className="text-sm text-green-500">-0.6s from last month</p>
        </motion.div>
      </div>

      {/* Charts */}
      <div className="grid lg:grid-cols-2 gap-8 mb-8">
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-100 dark:border-gray-700"
        >
          <h3 className="text-lg font-semibold mb-4 dark:text-white">Detection Trends</h3>
          <div className="h-64">
            <Line 
              data={detectionData} 
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { display: false } },
                scales: {
                  y: { beginAtZero: true, grid: { color: 'rgba(0, 0, 0, 0.05)' } },
                  x: { grid: { display: false } }
                }
              }} 
            />
          </div>
        </motion.div>
        
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-100 dark:border-gray-700"
        >
          <h3 className="text-lg font-semibold mb-4 dark:text-white">Risk Distribution</h3>
          <div className="h-64">
            <Doughnut 
              data={riskData} 
              options={{
                cutout: '70%',
                plugins: { legend: { position: 'right' } },
                maintainAspectRatio: false
              }} 
            />
          </div>
        </motion.div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-100 dark:border-gray-700 mb-8">
        <h3 className="text-lg font-semibold mb-4 dark:text-white">Detection vs Authentic</h3>
        <div className="h-64">
          <Bar 
            data={analysisData} 
            options={{
              responsive: true,
              maintainAspectRatio: false,
              plugins: { legend: { position: 'top' } },
              scales: {
                x: { stacked: true, grid: { display: false } },
                y: { stacked: true, grid: { color: 'rgba(0, 0, 0, 0.05)' } }
              }
            }} 
          />
        </div>
      </div>

      {/* Recent Scans */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700 overflow-hidden">
        <div className="p-6 border-b border-gray-100 dark:border-gray-700">
          <h3 className="text-lg font-semibold dark:text-white">Recent Scans</h3>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-left border-b border-gray-100 dark:border-gray-700">
                <th className="p-4 text-sm font-medium text-gray-600 dark:text-gray-300">Date</th>
                <th className="p-4 text-sm font-medium text-gray-600 dark:text-gray-300">File Name</th>
                <th className="p-4 text-sm font-medium text-gray-600 dark:text-gray-300">Origin</th>
                <th className="p-4 text-sm font-medium text-gray-600 dark:text-gray-300">Result</th>
                <th className="p-4 text-sm font-medium text-gray-600 dark:text-gray-300">Confidence</th>
                <th className="p-4 text-sm font-medium text-gray-600 dark:text-gray-300">Play</th>
              </tr>
            </thead>
            <tbody>
              {recentScans.map((scan) => {
                const isPlaying = currentlyPlaying === scan.id;
                return (
                  <tr key={scan.id} className="border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                    <td className="p-4 text-sm dark:text-white whitespace-nowrap">{scan.date}</td>
                    <td className="p-4 text-sm dark:text-white">{scan.name}</td>
                    <td className="p-4 text-sm dark:text-white">
                      <span className="inline-flex items-center text-xs font-medium px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100">
                        <FiMapPin className="mr-1" /> {scan.location}
                      </span>
                    </td>
                  <td className="p-4">
                    {scan.result ? (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100">
                        <FiCheckCircle className="mr-1" /> Authentic
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100">
                        <FiAlertCircle className="mr-1" /> Deepfake
                      </span>
                    )}
                  </td>
                    <td className="p-4 text-sm dark:text-white">{scan.confidence}%</td>
                    <td className="p-4 flex items-center space-x-2">
                      <button
                        onClick={() => handlePlay(scan.id, scan.sampleUrl)}
                        disabled={!scan.sampleUrl}
                        className={`flex items-center px-3 py-1 rounded-lg text-sm font-medium transition-colors ${scan.sampleUrl ? 'bg-blue-600 hover:bg-blue-700 text-white' : 'bg-gray-600 text-gray-300 cursor-not-allowed'}`}
                      >
                      {isPlaying ? (
                        <>
                          <FiStopCircle className="mr-1" /> Stop
                        </>
                      ) : (
                        <>
                          <FiPlayCircle className="mr-1" /> Play Sample
                        </>
                      )}
                      </button>
                      {isPlaying && <WaveAnimation />}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
