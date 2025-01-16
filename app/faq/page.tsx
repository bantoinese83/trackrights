'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Header } from '../components/Header';
import { Footer } from '../components/Footer';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';

const faqItems = [
  {
    question: 'What is TrackRights?',
    answer:
      'TrackRights is an AI-powered tool that simplifies music contracts for producers and artists. It analyzes legal documents and provides easy-to-understand explanations of complex terms and conditions.',
  },
  {
    question: 'How does TrackRights work?',
    answer:
      'Upload your music contract to our platform, and our AI will analyze the document. It then provides a simplified version of the contract, highlighting key points and explaining complex legal jargon in plain English.',
  },
  {
    question: 'Is my contract information secure?',
    answer:
      'Yes, we take data security very seriously. All uploaded contracts are encrypted and processed securely. We do not store your contracts after analysis unless you explicitly choose to save them in your account.',
  },
  {
    question: 'Can TrackRights replace a lawyer?',
    answer:
      "While TrackRights provides valuable insights and explanations, it's not a substitute for legal advice. We always recommend consulting with a qualified entertainment lawyer for important legal decisions.",
  },
  {
    question: 'What types of contracts can TrackRights analyze?',
    answer:
      'TrackRights is designed to analyze various music industry contracts, including recording agreements, publishing deals, licensing agreements, and management contracts.',
  },
  {
    question: 'How accurate is the AI-powered analysis?',
    answer:
      "Our AI model is trained on a vast database of music contracts and legal documents. While it's highly accurate, we always recommend using it as a supplementary tool alongside professional legal advice.",
  },
  {
    question:
      'Can I use TrackRights for contracts in languages other than English?',
    answer:
      "Currently, TrackRights is optimized for English-language contracts. We're working on expanding our language capabilities in the future.",
  },
  {
    question: 'Is there a limit to how many contracts I can analyze?',
    answer:
      'Our free tier allows for a limited number of contract analyses per month. For users who need to analyze more contracts, we offer premium plans with higher or unlimited usage.',
  },
];

export default function FAQPage() {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredFAQs = faqItems.filter(
    (item) =>
      item.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.answer.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-b from-purple-900 via-indigo-900 to-blue-900">
      <Header />
      <main className="flex-grow container mx-auto px-4 py-12 max-w-4xl">
        <motion.h1
          className="text-4xl md:text-5xl font-bold text-white mb-8 text-center"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          Frequently Asked Questions
        </motion.h1>

        <motion.div
          className="mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <Input
              type="text"
              placeholder="Search FAQs..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 w-full border rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white/10 text-white placeholder-gray-300"
            />
          </div>
        </motion.div>

        <AnimatePresence>
          {filteredFAQs.length > 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <Accordion type="single" collapsible className="w-full space-y-4">
                {filteredFAQs.map((item, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                  >
                    <AccordionItem
                      value={`item-${index}`}
                      className="border border-purple-300/20 rounded-lg overflow-hidden bg-white/5 backdrop-blur-sm"
                    >
                      <AccordionTrigger className="text-left text-lg font-semibold text-white p-4 hover:bg-purple-700/30 transition-colors duration-200">
                        <span>{item.question}</span>
                      </AccordionTrigger>
                      <AccordionContent className="text-purple-100 p-4 bg-purple-800/30">
                        {item.answer}
                      </AccordionContent>
                    </AccordionItem>
                  </motion.div>
                ))}
              </Accordion>
            </motion.div>
          ) : (
            <motion.p
              className="text-center text-purple-200 mt-8"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              No matching FAQs found. Please try a different search term.
            </motion.p>
          )}
        </AnimatePresence>
      </main>
      <Footer />
    </div>
  );
}
