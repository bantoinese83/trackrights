'use client'

import { motion } from 'framer-motion'
import Image from 'next/image'
import { AnimatedCounter } from './AnimatedCounter'
import { FileCheck, Users, Clock, Award, FileText } from 'lucide-react'

const stats = [
  {
    icon: FileCheck,
    value: 342,
    label: 'Contracts Analyzed',
    suffix: '+',
  },
  {
    icon: Users,
    value: 217,
    label: 'Happy Producers',
    suffix: '+',
  },
  {
    icon: Clock,
    value: 30,
    label: 'Average Analysis Time',
    suffix: 's',
  },
  {
    icon: Award,
    value: 95,
    label: 'Accuracy Rate',
    suffix: '%',
  },
  {
    icon: FileText,
    value: 142,
    label: 'Generated Contracts',
    suffix: '+',
  },
];

export function ComicBanner() {
  return (
    <section className="relative py-20 overflow-hidden bg-gradient-to-b from-purple-900 to-indigo-900">
          <div className="absolute inset-0 opacity-20">
          <div className="absolute top-0 left-0 w-1/3 h-full">
              <Image
              src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/DALL%C2%B7E%202025-01-14%2021.50.18%20-%20A%20four-panel%20comic%20strip%20telling%20the%20story%20of%20a%20music%20producer%20signing%20a%20bad%20contract.%20Panel%201_%20The%20music%20producer%20excitedly%20shaking%20hands%20with%20a%20slic-lhWF2AcXOdqixZCOHNlDbj6xDKzP01.webp"
              alt="Comic panel showing contract signing"
              fill
              className="object-cover"
              priority
              />
          </div>
              <div className="absolute top-0 left-1/3 w-1/3 h-full">
              <Image
                  src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/DALL%C2%B7E%202025-01-14%2021.48.14%20-%20A%20four-panel%20comic%20strip%20illustrating%20a%20music%20producer's%20journey%20with%20a%20contract.%20Panel%201_%20A%20music%20producer%20in%20a%20recording%20studio,%20holding%20a%20contract,-nmrJ7YIsyRYsjCmBWoBNlBdaU2G9sH.webp"
                  alt="Comic panel showing BeatContract usage"
                  fill
              className="object-cover"
              priority
              />
          </div>
              <div className="absolute top-0 right-0 w-1/3 h-full">
              <Image
                  src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/DALL%C2%B7E%202025-01-14%2021.49.36%20-%20A%20four-panel%20comic%20strip%20illustrating%20a%20music%20producer's%20experience%20with%20signing%20a%20bad%20contract.%20Panel%201_%20A%20music%20producer%20receives%20a%20contract%20from%20a%20-ZEJE3YFVbHldDazNM0iDMFuBaFOCUs.webp"
                  alt="Comic panel showing contract analysis"
                  fill
                  className="object-cover"
                  priority
              />
              </div>
      </div>
      <div className="relative container mx-auto px-4 text-center z-10">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-4xl md:text-5xl font-bold text-white mb-6"
        >
          Don&#39;t Let Bad Contracts Hold You Back
        </motion.h2>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="text-xl text-purple-100 max-w-2xl mx-auto mb-12"
        >
          Join thousands of music producers who trust BeatContract to analyze and simplify their contracts
        </motion.p>

        <div className="grid grid-cols-2 md:grid-cols-5 gap-8 max-w-6xl mx-auto">
          {stats.map((stat, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 + index * 0.1 }}
              className="relative group"
            >
              <div className="absolute inset-0 bg-white/5 backdrop-blur-sm rounded-lg transform group-hover:scale-105 transition-transform duration-300" />
              <div className="relative p-6">
                <div className="flex justify-center mb-4">
                  <div className="p-3 bg-purple-500/20 rounded-full">
                    <stat.icon className="w-6 h-6 text-purple-300" />
                  </div>
                </div>
                  <div className="text-3xl font-bold text-white mb-2" aria-live="polite">
                  <AnimatedCounter
                    value={stat.value}
                      formatFnAction={(v) => `${v.toLocaleString()}${stat.suffix}`}
                  />
                </div>
                <div className="text-purple-200 text-sm">{stat.label}</div>
              </div>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 0.8 }}
          className="mt-12 text-purple-200 text-sm"
        >
          * Statistics updated in real-time based on our platform usage
        </motion.div>
      </div>
        <div className="absolute top-0 left-0 w-full h-20 bg-gradient-to-b from-purple-900 to-transparent blur-lg"></div>
        <div className="absolute bottom-0 left-0 w-full h-20 bg-gradient-to-t from-indigo-900 to-transparent blur-lg"></div>
    </section>
  )
}