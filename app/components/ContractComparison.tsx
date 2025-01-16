'use client';

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import rehypeRaw from 'rehype-raw'
import { Skeleton } from '@/components/ui/skeleton'
import dynamic from 'next/dynamic'
import { Diamond } from 'lucide-react'
import Image from 'next/image'

const PDFViewer = dynamic(() => import('./PDFViewer'), {
  ssr: false,
  loading: () => <Skeleton className="h-[600px] w-full" />
})

interface ContractComparisonProps {
  originalText: string;
  simplifiedContract: string;
  isPdf?: boolean;
}

const ContractRatingPlaque = ({ rating }: { rating: string }) => {
  const getRatingImage = (rating: string) => {
    switch (rating.toLowerCase()) {
      case 'platinum':
        return 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Screenshot%202025-01-15%20at%204.37.44%E2%80%AFPM-u3RJqMtrGUe6p7FVIDCCUR9WhTFYUP.png'
      case 'gold':
        return 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Screenshot%202025-01-15%20at%204.37.34%E2%80%AFPM-AL61x2Ar4TabESWX0sVeUDVKnJvWq4.png'
      case 'wood':
        return 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Screenshot%202025-01-15%20at%204.37.27%E2%80%AFPM-qI72DM5pc0SXZCPN1LGK8tol1CgX8o.png'
      case 'diamond':
        return 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Screenshot%202025-01-15%20at%204.37.50%E2%80%AFPM-yoMScIahTbQjx2g81rm7e9v4WDLC5w.png'
      default:
        return 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Screenshot%202025-01-15%20at%204.37.44%E2%80%AFPM-u3RJqMtrGUe6p7FVIDCCUR9WhTFYUP.png'
    }
  }

  return (
    <div className="flex flex-col items-center mb-6">
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: "spring", stiffness: 260, damping: 20 }}
        className="relative w-40 h-40 mb-2"
      >
        <Image
          src={getRatingImage(rating) || "/placeholder.svg"}
          alt={`${rating} Rating`}
          fill
          className="object-contain"
        />
      </motion.div>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="flex flex-col items-center"
      >
        <div className="text-2xl font-extrabold text-yellow-400 tracking-wider" style={{ fontFamily: "'Engraver', serif" }}>
          {rating.toUpperCase()}
        </div>
        <div className="text-lg font-semibold text-white tracking-wide" style={{ fontFamily: "'Trajan Pro', serif" }}>
          PLAQUE
        </div>
      </motion.div>
    </div>
  )
}

export function ContractComparison({ originalText, simplifiedContract, isPdf = false }: ContractComparisonProps) {
  const [isLoading, setIsLoading] = useState(true)
  const [contractRating, setContractRating] = useState('wood')

  useEffect(() => {
    if (originalText && simplifiedContract) {
      setIsLoading(false)
      // Extract rating from the markdown content
      const ratingMatch = simplifiedContract.match(/Contract Rating:\s*(WOOD|GOLD|PLATINUM|DIAMOND)/i)
      || originalText.match(/Contract Rating:\s*(WOOD|GOLD|PLATINUM|DIAMOND)/i);
      if (ratingMatch) {
        setContractRating(ratingMatch[1].toLowerCase())
      }
    }
  }, [originalText, simplifiedContract])

  if (isLoading) {
    return (
      <div className="text-center mt-8">
        <Skeleton className="h-6 w-48 mx-auto mb-4" />
        <Skeleton className="h-96 w-full max-w-6xl mx-auto" />
      </div>
    )
  }

  if (!originalText || !simplifiedContract) {
    return (
      <div className="text-center mt-8">
        <p className="text-red-700">Error: Missing contract text.</p>
      </div>
    )
  }

  return (
    <motion.div
      className="w-full max-w-full sm:max-w-6xl mx-auto mt-4 sm:mt-8 px-4 sm:px-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      aria-live="polite"
    >
      <ContractRatingPlaque rating={contractRating} />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-8">
        <div className="mb-8 md:mb-0">
          <h2 className="text-lg sm:text-xl font-semibold mb-2 sm:mb-4 text-white p-4 rounded-t-lg flex items-center shadow-lg">
            <Diamond className="w-5 h-5 mr-2 animate-pulse" />
            Original Contract
          </h2>
          <div className="bg-white p-3 sm:p-4 md:p-6 rounded-lg shadow-md h-[400px] sm:h-[500px] md:h-[600px] overflow-y-auto">
            {isPdf ? (
              <PDFViewer pdfData={originalText} />
            ) : (
              <div className="prose max-w-none text-gray-700 whitespace-pre-line text-sm sm:text-base">
                {originalText}
              </div>
            )}
          </div>
        </div>
        <div>
          <h2 className="text-lg sm:text-xl font-semibold mb-2 sm:mb-4 text-white p-4 rounded-t-lg flex items-center shadow-lg">
            <Diamond className="w-5 h-5 mr-2 animate-pulse"/>
            Simplified Version
          </h2>
          <div className="bg-white p-3 sm:p-4 md:p-6 rounded-lg shadow-md h-[400px] sm:h-[500px] md:h-[600px] overflow-y-auto">
            <ReactMarkdown
              className="prose max-w-none text-xs sm:text-sm md:text-base font-sans"
              remarkPlugins={[remarkGfm]}
              rehypePlugins={[rehypeRaw]}
            >
              {simplifiedContract}
            </ReactMarkdown>
          </div>
        </div>
      </div>
      <style jsx>{`
        .prose {
          font-family: var(--font-sans),serif;
        }
      `}</style>
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@700&display=swap');
        
        @font-face {
          font-family: 'Engraver';
          src: url('https://fonts.cdnfonts.com/css/engravers-mt') format('woff2');
        }
        
        @font-face {
          font-family: 'Trajan Pro';
          src: url('https://fonts.cdnfonts.com/css/trajan-pro') format('woff2');
        }
      `}</style>
    </motion.div>
  )
}

