'use client'

import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence, useMotionValue, useTransform, useSpring } from 'framer-motion'

const phrases = [
  { text: "", highlight: "TrackRights.com", rest: " - Your shield against predatory contracts" },
  { text: "", highlight: "TrackRights.com", rest: " - Turn the tide in your favor" },
  { text: "", highlight: "TrackRights.com", rest: " - Navigate the music industry safely" },
  { text: "", highlight: "TrackRights.com", rest: " - Your AI-powered legal guardian" },
  { text: "", highlight: "TrackRights.com", rest: " - Where producers take control" }
]

const Particles = () => {
  const [particles, setParticles] = useState<React.ReactNode[]>([])

  useEffect(() => {
    const generateParticles = () => {
      return [...Array(50)].map((_, i) => (
        <motion.div
          key={i}
          className="particle absolute bg-white/30 rounded-full"
          initial={{
            top: `${Math.random() * 100}%`,
            left: `${Math.random() * 100}%`,
            width: `${Math.random() * 3 + 1}px`,
            height: `${Math.random() * 3 + 1}px`,
          }}
          animate={{
            top: [
              `${Math.random() * 100}%`,
              `${Math.random() * 100}%`,
              `${Math.random() * 100}%`,
            ],
            left: [
              `${Math.random() * 100}%`,
              `${Math.random() * 100}%`,
              `${Math.random() * 100}%`,
            ],
          }}
          transition={{
            duration: Math.random() * 10 + 5,
            repeat: Infinity,
            repeatType: "reverse",
          }}
        />
      ))
    }

    setParticles(generateParticles())
  }, [])

  return <div className="absolute inset-0 z-0">{particles}</div>
}

export function SharkBanner() {
  const [currentPhrase, setCurrentPhrase] = useState(0)
  const videoRef = useRef<HTMLVideoElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })

  // 3D tilt effect values
  const x = useMotionValue(0)
  const y = useMotionValue(0)

  // Transform mouse position into rotation values
  const rotateX = useTransform(y, [-300, 300], [10, -10])
  const rotateY = useTransform(x, [-300, 300], [-10, 10])

  // Add spring physics to the rotation
  const springConfig = { damping: 20, stiffness: 200 }
  const springRotateX = useSpring(rotateX, springConfig)
  const springRotateY = useSpring(rotateY, springConfig)

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentPhrase((prev) => (prev + 1) % phrases.length)
    }, 4000)
    return () => clearInterval(timer)
  }, [])

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.play().catch(error => console.error("Error playing video:", error))
    }
  }, [])

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = containerRef.current?.getBoundingClientRect()
    if (rect) {
      const centerX = rect.left + rect.width / 2
      const centerY = rect.top + rect.height / 2
      x.set(e.clientX - centerX)
      y.set(e.clientY - centerY)
    }
  }

  const handleMouseLeave = () => {
    x.set(0)
    y.set(0)
  }

  const springAnimation = {
    type: "spring",
    stiffness: 700,
    damping: 30
  }

  return (
    <motion.section
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{
        perspective: 1000,
      }}
      className="relative w-full h-[40vh] overflow-hidden bg-blue-950"
    >
      <Particles />

      <div className="absolute inset-0 bg-gradient-to-b from-blue-950/30 via-blue-950/50 to-blue-950 mix-blend-overlay animate-pulse" />

      <video
        ref={videoRef}
        className="absolute inset-0 w-full h-full object-cover"
        style={{ filter: 'brightness(0.4) contrast(1.2)' }}
        muted
        loop
        playsInline
      >
        <source src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/sharks-Y934nNoxgt5xiXPxos3qfeXyIgGA8Z.mp4" type="video/mp4" />
        Your browser does not support the video tag.
      </video>

      <motion.div
        className="relative z-10 container mx-auto px-4 py-8 h-full flex flex-col items-center justify-center"
        style={{
          rotateX: springRotateX,
          rotateY: springRotateY,
        }}
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={currentPhrase}
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.9 }}
            transition={{ duration: 0.5 }}
            className="relative"
          >
            <h2 className="text-5xl md:text-6xl lg:text-7xl font-bold mb-6 leading-tight text-center shark-banner-text">
              {phrases[currentPhrase].text}
              <motion.span
                className="text-white relative inline-block"
                initial={{ scale: 1 }}
                animate={{ scale: [1, 1.1, 1] }}
                transition={springAnimation}
              >
                {phrases[currentPhrase].highlight}
                <span className="absolute inset-0 animate-glow" />
              </motion.span>
              {phrases[currentPhrase].rest}
            </h2>
            <div className="absolute inset-0 shark-banner-text-mask" aria-hidden="true">
              {phrases[currentPhrase].text}
              <span className="text-transparent">{phrases[currentPhrase].highlight}</span>
              {phrases[currentPhrase].rest}
            </div>
          </motion.div>
        </AnimatePresence>
      </motion.div>

      <style jsx>{`
        @keyframes float {
          0%, 100% {
            transform: translateY(0) translateX(0);
          }
          25% {
            transform: translateY(-20px) translateX(10px);
          }
          50% {
            transform: translateY(-35px) translateX(-10px);
          }
          75% {
            transform: translateY(-20px) translateX(8px);
          }
        }

        @keyframes glow {
          0%, 100% {
            text-shadow: 0 0 20px rgba(255, 255, 255, 0.5),
                         0 0 40px rgba(255, 255, 255, 0.2);
          }
          50% {
            text-shadow: 0 0 40px rgba(255, 255, 255, 0.8),
                         0 0 80px rgba(255, 255, 255, 0.4);
          }
        }

        .shark-banner-text {
          font-family: 'Salome', cursive;
          color: transparent;
          -webkit-text-stroke: 2px rgba(255, 255, 255, 0.8);
          text-stroke: 2px rgba(255, 255, 255, 0.8);
          font-size: 3rem;
          text-shadow: 0 0 20px rgba(255, 255, 255, 0.1);
          animation: textFloat 6s ease-in-out infinite;
        }

        @keyframes textFloat {
          0%, 100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-10px);
          }
        }

        .shark-banner-text-mask {
          font-family: 'Salome', cursive;
          font-size: inherit;
          font-weight: inherit;
          line-height: inherit;
          background: url('https://hebbkx1anhila5yf.public.blob.vercel-storage.com/sharks-Y934nNoxgt5xiXPxos3qfeXyIgGA8Z.mp4') repeat;
          background-clip: text;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          animation: sharkSwim 20s linear infinite;
          filter: brightness(1.5) contrast(1.2);
        }

        .animate-glow {
          animation: glow 3s ease-in-out infinite;
        }

        @keyframes sharkSwim {
          0% {
            background-position: 0% 50%;
          }
          100% {
            background-position: 100% 50%;
          }
        }

        @media (max-width: 768px) {
          .shark-banner-text, .shark-banner-text-mask {
            font-size: 2.5rem;
          }
        }

        @media (max-width: 480px) {
          .shark-banner-text, .shark-banner-text-mask {
            font-size: 2rem;
          }
        }

        .particle {
          pointer-events: none;
          opacity: 0.6;
          will-change: transform;
        }
      `}</style>
    </motion.section>
  )
}

