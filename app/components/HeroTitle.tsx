import { useState } from 'react'
import { motion } from 'framer-motion'
import { Zap, Shield, FileText, Map } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { TourGuide } from './TourGuide'

const glitterAnimation = `
@keyframes glitter {
  0% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
}
`

interface HeroTitleProps {
  title: string;
  description: string;
}

export function HeroTitle({ description }: HeroTitleProps) {
  const [isTourOpen, setIsTourOpen] = useState(false)

  return (
    <>
      <style jsx global>{`
        ${glitterAnimation}
        .separator {
          display: inline-block;
          margin: 0 0.5rem;
          font-weight: normal;
          color: rgba(255, 255, 255, 0.5);
        }
      `}</style>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center mb-12"
      >
        <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 text-white leading-tight">
          Decode Your <span className="text-purple-300 underline decoration-2 decoration-purple-400">Music Contracts</span> <span className="separator">|</span>{' '}
          For All Music Professionals <span className="separator">|</span> <span className="inline-block animate-pulse" style={{
            background: 'linear-gradient(90deg, #FFD700, #FFA500, #FFD700)',
            backgroundSize: '200% 200%',
            animation: 'glitter 2s linear infinite',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            textShadow: '0 0 5px rgba(255,215,0,0.5)'
          }}>100% Free</span>
        </h1>
        <p className="text-lg md:text-xl lg:text-2xl text-purple-100 mb-8 leading-relaxed max-w-3xl mx-auto">
          {description}
        </p>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          className="flex flex-col items-center space-y-4 mb-8"
        >
          <div className="bg-gradient-to-r from-purple-900/30 to-indigo-900/30 backdrop-blur-sm p-4 rounded-xl border border-purple-500/20 max-w-2xl">
            <p className="text-purple-100 text-center leading-relaxed">
              Powered by our <span className="text-yellow-400 font-semibold">MusicProGuard™</span> algorithm, developed in collaboration with{' '}
              <span className="text-purple-300 font-semibold">elite music industry lawyers</span>,{' '}
              <span className="text-purple-300 font-semibold">top-tier artist managers</span>, and{' '}
              <span className="text-purple-300 font-semibold">experienced music producers</span> to generate the most favorable contracts for all music industry professionals.
            </p>
          </div>
          <div className="flex items-center space-x-2 text-purple-300 text-sm">
            <span>✓ Industry-vetted</span>
            <span>•</span>
            <span>✓ Artist-first approach</span>
            <span>•</span>
            <span>✓ Legal expertise</span>
          </div>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="flex flex-col sm:flex-row justify-center items-center space-y-4 sm:space-y-0 sm:space-x-4 mb-8"
        >
          <Button
            size="lg"
            variant="outline"
            className="bg-white text-purple-600 border-purple-600 hover:bg-purple-600 hover:text-white px-8 py-3 rounded-full font-bold transition-all duration-300 flex items-center mx-auto"
            onClick={() => setIsTourOpen(true)}
          >
            <Map className="mr-2 h-5 w-5" />
            Take a Tour
          </Button>
        </motion.div>
        <div className="flex justify-center space-x-8 mt-8">
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="flex flex-col items-center"
          >
            <div className="bg-purple-500 p-3 rounded-full mb-2">
              <Zap className="w-8 h-8 text-white" />
            </div>
            <span className="text-white font-semibold">Fast Analysis</span>
          </motion.div>
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="flex flex-col items-center"
          >
            <div className="bg-purple-500 p-3 rounded-full mb-2">
              <Shield className="w-8 h-8 text-white" />
            </div>
            <span className="text-white font-semibold">Secure & Private</span>
          </motion.div>
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="flex flex-col items-center"
          >
            <div className="bg-purple-500 p-3 rounded-full mb-2">
              <FileText className="w-8 h-8 text-white" />
            </div>
            <span className="text-white font-semibold">Clear Insights</span>
          </motion.div>
        </div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.5 }}
          className="mt-12 text-white text-lg"
        >
          <p>Trusted by <span className="font-bold text-yellow-400">5000+</span> music industry professionals worldwide</p>
          <p className="text-sm text-purple-200 mt-2">
            Our <span className="text-yellow-400 font-semibold">MusicProGuard™</span> algorithm has analyzed over{' '}
            <span className="font-bold text-white">50,000+</span> music contracts across various roles
          </p>
          <div className="flex justify-center items-center mt-4 space-x-6">
            {['Spotify', 'Apple Music', 'Universal Music', 'Sony Music'].map((brand, index) => (
              <motion.div
                key={brand}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6 + index * 0.1 }}
                className="text-gray-400 text-sm"
              >
                {brand}
              </motion.div>
            ))}
          </div>
        </motion.div>
      </motion.div>
      <TourGuide isOpen={isTourOpen} onClose={() => setIsTourOpen(false)} />
    </>
  )
}

