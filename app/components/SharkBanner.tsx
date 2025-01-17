'use client';

import React, { useCallback, useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion, useMotionValue, useSpring, useTransform } from 'framer-motion';

const phrases = [
    { highlight: "TrackRights.com", rest: " - Protecting you from the sharks of the music industry", subtext: "Your trusted partner in legal matters" },
    { highlight: "TrackRights.com", rest: " - Navigating the legal waters of music", subtext: "Expert guidance for music professionals" },
    { highlight: "TrackRights.com", rest: " - Your lifeline in the sea of contracts", subtext: "Simplifying complex legal terms" },
    { highlight: "TrackRights.com", rest: " - Keeping you afloat in the music business", subtext: "Ensuring your rights are protected" },
    { highlight: "TrackRights.com", rest: " - Your legal life raft", subtext: "Comprehensive contract analysis" },
    { highlight: "TrackRights.com", rest: " - Swimming with you through legal waters", subtext: "Personalized legal support" },
    { highlight: "TrackRights.com", rest: " - Your anchor in the music industry", subtext: "Stability in your legal affairs" },
    { highlight: "TrackRights.com", rest: " - Guarding you against legal predators", subtext: "Protecting your interests" },
    { highlight: "TrackRights.com", rest: " - Your compass in the legal ocean", subtext: "Navigating legal complexities" },
    { highlight: "TrackRights.com", rest: " - Steering you clear of legal troubles", subtext: "Avoiding potential pitfalls" },
];

export function SharkBanner() {
    const [currentPhrase, setCurrentPhrase] = useState(0);
    const videoRef = useRef<HTMLVideoElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const x = useMotionValue(0);
    const y = useMotionValue(0);

    const rotateX = useTransform(y, [-300, 300], [10, -10]);
    const rotateY = useTransform(x, [-300, 300], [-10, 10]);
    const springRotateX = useSpring(rotateX, { damping: 20, stiffness: 200 });
    const springRotateY = useSpring(rotateY, { damping: 20, stiffness: 200 });

    const [phraseDirection, setPhraseDirection] = useState(1);

    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentPhrase((prev) => {
              return (prev + phraseDirection + phrases.length) % phrases.length
            });
        }, 4000);

        return () => clearInterval(timer);
    }, [phraseDirection]);

    useEffect(() => {
        videoRef.current?.play().catch(error => console.error("Error playing video:", error));
    }, []);

    const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
        const rect = containerRef.current?.getBoundingClientRect();
        if (rect) {
            x.set(e.clientX - (rect.left + rect.width / 2));
            y.set(e.clientY - (rect.top + rect.height / 2));
        }
    }, [x, y]);

    const handleMouseLeave = useCallback(() => {
        x.set(0);
        y.set(0);
    }, [x, y]);
    useCallback(
      (newPhrase: number) => {
          const diff = newPhrase - currentPhrase;
          if (diff > 0 || (newPhrase === 0 && currentPhrase === phrases.length - 1)) {
              setPhraseDirection(1);
          } else {
              setPhraseDirection(-1);
          }
          setCurrentPhrase(newPhrase);
      },
      [currentPhrase, setPhraseDirection]
    );
    return (
      <motion.section
            ref={containerRef}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            style={{ perspective: 1000 }}
            className="relative w-full h-[20vh] sm:h-[25vh] md:h-[30vh] overflow-hidden bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500"
        >
            <video
                ref={videoRef}
                className="absolute inset-0 w-full h-full object-cover"
                style={{ filter: 'brightness(0.4) contrast(1.2) sepia(0.5)' }}
                muted
                loop
                playsInline
                preload="auto"
                aria-hidden="true"
            >
                <source src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/sharks-Y934nNoxgt5xiXPxos3qfeXyIgGA8Z.mp4" type="video/mp4" />
            </video>

            <div className="video-blur"></div>

            <motion.div
                className="relative z-10 container mx-auto px-4 py-8 h-full flex flex-col items-center justify-center"
                style={{ rotateX: springRotateX, rotateY: springRotateY }}
            >
                <AnimatePresence mode="wait"  onExitComplete={() => {}}>
                    <motion.div
                        key={currentPhrase}
                        initial={{ opacity: 0, y: 20 * phraseDirection, scale: 0.9 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -20 * phraseDirection, scale: 0.9 }}
                        transition={{ duration: 0.5 }}
                        className="relative text-center"
                    >
                        <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-white break-words">
                            <motion.span
                                className="text-yellow-300 relative inline-block"
                                initial={{ scale: 1 }}
                                animate={{ scale: [1, 1.1, 1] }}
                                transition={{ type: "spring", stiffness: 700, damping: 30 }}
                            >
                                {phrases[currentPhrase].highlight}
                                <span className="absolute inset-0 animate-glow" />
                            </motion.span>
                            {phrases[currentPhrase].rest}
                        </h2>
                         <motion.p
                            className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-medium text-white mt-2 break-words underline-animation subtext-font big-quote hollow-text"
                            initial={{ opacity: 0, scale: 0.8, rotate: -10 * phraseDirection }}
                            animate={{ opacity: 1, scale: 1, rotate: 0 }}
                            exit={{ opacity: 0, scale: 0.8, rotate: 10 * phraseDirection }}
                            transition={{ duration: 0.5 }}
                        >
                           “{phrases[currentPhrase].subtext}”
                        </motion.p>
                    </motion.div>
                </AnimatePresence>
            </motion.div>

            <style jsx>{`
                :root {
                    --float-duration: 6s;
                    --glow-duration: 3s;
                    --swim-duration: 20s;
                }

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
                        text-shadow: 0 0 20px rgba(255, 255, 255, 0.5), 0 0 40px rgba(255, 255, 255, 0.2);
                    }
                    50% {
                        text-shadow: 0 0 40px rgba(255, 255, 255, 0.8), 0 0 80px rgba(255, 255, 255, 0.4);
                    }
                }

                @media (max-width: 768px) {

                }

                @media (max-width: 480px) {

                }
            `}</style>
        </motion.section>
    );
}