export interface FaqItem {
  question: string;
  answer: string;
}

export const faqItems: FaqItem[] = [
  {
    question: 'What is TrackRights?',
    answer:
      'TrackRights is an AI-powered tool that simplifies music contracts for all music industry professionals including artists, producers, songwriters, managers, performers, and labels. It analyzes legal documents and provides easy-to-understand explanations of complex terms and conditions.',
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
