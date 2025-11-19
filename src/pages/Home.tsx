import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { FiShield, FiActivity, FiLock, FiBarChart2, FiGlobe, FiUsers, FiTrendingUp, FiAward } from 'react-icons/fi';

const Home = () => {
  return (
    <div className="container mx-auto px-4 pt-28 py-12">
      {/* Hero Section */}
      <motion.section 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-700 p-8 md:p-12 text-white mb-16 shadow-xl"
      >
        <div className="relative z-10 max-w-3xl">
          <motion.h1 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-4xl md:text-5xl font-bold mb-4 leading-tight"
          >
            Detect & Secure Your Voice with AI-Powered Deepfake Detection
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="text-xl mb-8"
          >
            Our advanced neural networks analyze voice patterns to identify synthetic audio with 98.2% accuracy.
          </motion.p>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
          >
            <Link 
              to="/detect" 
              className="inline-flex items-center px-8 py-3 bg-white text-blue-600 font-semibold rounded-full hover:bg-gray-100 transition-all duration-300 shadow-lg hover:shadow-xl"
            >
              Analyze Voice Now
              <svg className="ml-2 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path>
              </svg>
            </Link>
          </motion.div>
        </div>
      </motion.section>

      {/* Stats Section */}
      <motion.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        className="bg-gray-900 text-white rounded-xl p-8 mb-16 grid grid-cols-2 md:grid-cols-4 gap-8"
      >
        <StatItem icon={<FiTrendingUp className="w-8 h-8" />} value="98.7%" label="Accuracy" />
        <StatItem icon={<FiGlobe className="w-8 h-8" />} value="150+" label="Countries" />
        <StatItem icon={<FiUsers className="w-8 h-8" />} value="10K+" label="Users" />
        <StatItem icon={<FiAward className="w-8 h-8" />} value="24/7" label="Monitoring" />
      </motion.div>

      {/* Features Section */}
      <section className="mb-16">
        <h2 className="text-3xl font-bold text-center mb-12 dark:text-white">Advanced Detection Technology</h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => (
            <FeatureCard key={index} {...feature} />
          ))}
        </div>
      </section>

      {/* How It Works */}
      <section className="bg-white dark:bg-gray-800 rounded-2xl p-8 md:p-12 shadow-lg mb-16">
        <h2 className="text-3xl font-bold mb-8 dark:text-white">How Our Detection Works</h2>
        <div className="space-y-8">
          {steps.map((step, index) => (
            <StepItem key={index} index={index} {...step} />
          ))}
        </div>
      </section>

      {/* Final CTA */}
      <motion.section
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        className="text-center py-16"
      >
        <h2 className="text-3xl font-bold mb-6 dark:text-white">Ready to Secure Your Voice?</h2>
        <p className="text-xl mb-8 max-w-2xl mx-auto text-gray-600 dark:text-gray-300">
          Join thousands of users protecting their vocal identity today.
        </p>
        <Link 
          to="/detect" 
          className="inline-flex items-center px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium text-lg shadow-lg hover:shadow-xl transition-all"
        >
          Start Free Analysis
        </Link>
      </motion.section>
    </div>
  );
};

// Component Definitions
const StatItem = ({ icon, value, label }: { icon: React.ReactNode, value: string, label: string }) => (
  <div className="text-center">
    <div className="text-blue-400 mb-2 flex justify-center">{icon}</div>
    <div className="text-2xl font-bold mb-1">{value}</div>
    <div className="text-gray-400 text-sm">{label}</div>
  </div>
);

const FeatureCard = ({ icon, title, description }: { icon: React.ReactNode, title: string, description: string }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    whileHover={{ y: -5 }}
    className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-100 dark:border-gray-700 hover:shadow-xl transition-all duration-300"
  >
    <div className="text-blue-600 dark:text-blue-400 mb-4">{icon}</div>
    <h3 className="text-xl font-semibold mb-2 dark:text-white">{title}</h3>
    <p className="text-gray-600 dark:text-gray-300">{description}</p>
  </motion.div>
);

const StepItem = ({ index, title, description }: { index: number, title: string, description: string }) => (
  <motion.div 
    initial={{ opacity: 0, x: index % 2 === 0 ? -20 : 20 }}
    animate={{ opacity: 1, x: 0 }}
    transition={{ delay: index * 0.2 }}
    className="flex flex-col md:flex-row gap-6 items-start"
  >
    <div className="flex-shrink-0 w-16 h-16 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center text-blue-600 dark:text-blue-300 text-xl font-bold">
      {index + 1}
    </div>
    <div>
      <h3 className="text-xl font-semibold mb-2 dark:text-white">{title}</h3>
      <p className="text-gray-600 dark:text-gray-300">{description}</p>
    </div>
  </motion.div>
);

// Data Arrays
const features = [
  {
    icon: <FiShield className="w-8 h-8" />,
    title: "Real-time Analysis",
    description: "Instant detection of synthetic voice patterns with our proprietary AI algorithms."
  },
  {
    icon: <FiActivity className="w-8 h-8" />,
    title: "Blockchain Verification",
    description: "Immutable verification records stored on decentralized blockchain networks."
  },
  {
    icon: <FiLock className="w-8 h-8" />,
    title: "Enterprise Security",
    description: "Military-grade encryption for all your voice authentication needs."
  },
  {
    icon: <FiBarChart2 className="w-8 h-8" />,
    title: "Detailed Analytics",
    description: "Comprehensive reports with confidence scores and risk assessments."
  }
];

const steps = [
  {
    title: "Upload or Record",
    description: "Provide a voice sample by uploading an audio file or recording directly in your browser."
  },
  {
    title: "AI Processing",
    description: "Our neural networks analyze spectral patterns, micro-timing, and vocal biomarkers."
  },
  {
    title: "Instant Results",
    description: "Receive a detailed authenticity report with confidence scores and risk indicators."
  }
];

export default Home;