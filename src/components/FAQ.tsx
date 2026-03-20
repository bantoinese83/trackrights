'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { Search, ChevronDown, ChevronUp } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useLocalStorage } from '@/hooks/useLocalStorage';

const faqItems = [
  {
    question: 'Who can benefit from TrackRights?',
    answer:
      'TrackRights is designed for all creative professionals, including artists, producers, performers, songwriters, streamers, influencers, managers, and more. Our AI-powered tool simplifies and analyzes contracts relevant to various roles in music, streaming, and influencer marketing.',
  },
  {
    question: 'How does TrackRights work for different creative professionals?',
    answer:
      'Upload your contract (music, streaming, brand deals, etc.) to our platform, and our AI will analyze the document based on your specific role. It then provides a simplified version of the contract, highlighting key points and explaining complex legal jargon in plain English, tailored to your position.',
  },
  {
    question: 'Is my contract information secure?',
    answer:
      'Yes, we take data security very seriously for all our users. All uploaded contracts are encrypted and processed securely. We do not store your contracts after analysis unless you explicitly choose to save them in your account.',
  },
  {
    question: 'Can TrackRights replace a lawyer?',
    answer:
      "While TrackRights provides valuable insights and explanations for all music professionals, it's not a substitute for legal advice. We always recommend consulting with a qualified entertainment lawyer for important legal decisions, regardless of your role in the music industry.",
  },
  {
    question: 'What types of contracts can TrackRights analyze?',
    answer:
      'TrackRights can analyze various contracts including music industry agreements (recording, publishing, licensing), brand sponsorship deals, platform partnership agreements (Twitch, YouTube, TikTok), influencer management contracts, collaboration agreements, and more. Our system is continually updated to cover a wide range of contract types relevant to different creative professional roles.',
  },
  {
    question:
      'How accurate is the AI-powered analysis for different creative professions?',
    answer:
      "Our AI model is trained on a vast database of contracts and legal documents covering various roles in music, streaming, and influencer marketing. While it's highly accurate, we always recommend using it as a supplementary tool alongside professional legal advice, especially for complex or high-stakes agreements.",
  },
  {
    question:
      'Can I use TrackRights for contracts in languages other than English?',
    answer:
      "Currently, TrackRights is optimized for English-language contracts across all creative professional roles. We're working on expanding our language capabilities in the future to serve a more diverse global creative community.",
  },
  {
    question: 'Is there a limit to how many contracts I can analyze?',
    answer:
      'Our free tier allows for a limited number of contract analyses per month for all users. For creative professionals who need to analyze more contracts, we offer premium plans with higher or unlimited usage, catering to different needs across music, streaming, and influencer industries.',
  },
  {
    question: 'What is Live Lawyer and how does it work?',
    answer:
      'Live Lawyer is our real-time AI consultation feature. After analyzing your contract, you can have a voice conversation with our AI lawyer to ask questions about your contract. Simply click "Start Call" in the Live Lawyer widget, allow microphone access, and speak naturally. The AI will respond with audio answers, referencing your contract analysis. This feature uses advanced voice AI technology to provide instant, conversational legal guidance.',
  },
  {
    question: 'What red flags should I look for in a music contract?',
    answer:
      'Watch for one-sided long terms and options, broad master ownership, heavy royalty deductions and reserves, 360-style income shares, recoupment only from your share, vague "commercially satisfactory" delivery, suspension clauses, perpetual name and likeness rights, and forum or fee rules that favor the other side. Our Red flags guide (main menu) walks through example language and what fairer deals often include — still have an entertainment attorney review anything before you sign.',
  },
];

export function FAQ({ id }: { id?: string }) {
  const [searchTerm, setSearchTerm] = useLocalStorage<string>(
    'trackrights_faq_search',
    ''
  );
  const [expandedIndex, setExpandedIndex] = useLocalStorage<number | null>(
    'trackrights_faq_expanded',
    null
  );

  const filteredFAQs = faqItems.filter(
    (item) =>
      item.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.answer.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const toggleQuestion = (index: number) => {
    setExpandedIndex(expandedIndex === index ? null : index);
  };

  return (
    <section id={id} className="py-24 bg-background text-foreground">
      <div className="container mx-auto px-4">
        <motion.h2
          className="text-center mb-12"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          FAQs for All Creative Professionals
        </motion.h2>

        <motion.div
          className="max-w-2xl mx-auto mb-12"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <div className="relative group">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors" />
            <Input
              type="text"
              placeholder="Search FAQs..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-6 w-full border-2 border-border/50 rounded-xl focus:border-primary focus:ring-2 focus:ring-primary/20 bg-card/50 text-foreground placeholder:text-muted-foreground transition-all shadow-sm"
            />
          </div>
        </motion.div>

        <AnimatePresence>
          {filteredFAQs.length > 0 ? (
            <motion.div
              className="grid gap-4 max-w-4xl mx-auto"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              {filteredFAQs.map((item, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className="bg-card/40 backdrop-blur-sm rounded-xl border border-border/50 overflow-hidden hover:border-primary/30 transition-colors shadow-sm"
                >
                  <Button
                    variant="ghost"
                    onClick={() => toggleQuestion(index)}
                    className="w-full text-left p-6 h-auto flex justify-between items-center hover:bg-primary/5 group"
                  >
                    <span className="text-lg font-semibold text-foreground group-hover:text-primary transition-colors pr-8">
                      {item.question}
                    </span>
                    {expandedIndex === index ? (
                      <ChevronUp className="h-5 w-5 text-primary" />
                    ) : (
                      <ChevronDown className="h-5 w-5 text-muted-foreground group-hover:text-primary" />
                    )}
                  </Button>
                  <AnimatePresence>
                    {expandedIndex === index && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.3 }}
                        className="px-6 pb-6"
                      >
                        <p className="text-muted-foreground leading-relaxed pt-2 border-t border-border/30">
                          {item.answer}
                        </p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              ))}
            </motion.div>
          ) : (
            <motion.p
              className="text-center text-muted-foreground mt-12 text-lg"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              No matching FAQs found. Please try a different search term.
            </motion.p>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
}
