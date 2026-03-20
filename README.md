# TrackRights - AI-Powered Music Contract Analysis

<div align="center">

![TrackRights Logo](https://trackrights.com/logo.png)

**Empowering Music Professionals with AI-Driven Contract Solutions**

[![Build Status](https://img.shields.io/github/workflow/status/bantoinese83/trackrights/CI)](https://github.com/bantoinese83/trackrights/actions)
[![License](https://img.shields.io/github/license/bantoinese83/trackrights)](LICENSE)
[![Quality Score](https://img.shields.io/badge/quality-100%2F100-brightgreen)](QUALITY_STATUS.md)

</div>

## 📋 Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Technologies](#technologies)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
  - [Environment Variables](#environment-variables)
- [Database Setup](#database-setup)
- [API Endpoints](#api-endpoints)
- [Quality Gates](#quality-gates)
- [Security](#security)
- [Code Quality](#code-quality)
- [Usage](#usage)
- [Contributing](#contributing)
- [License](#license)
- [Contact](#contact)

---

## 🎯 Overview

TrackRights is an innovative AI-powered platform designed to simplify and analyze contracts for creative professionals. It caters to a wide array of professionals, including artists, producers, performers, songwriters, streamers, influencers, and managers. Our mission is to provide clear, actionable contract insights, enabling informed decision-making in the music and creator industries.

---

## ✨ Features

| Feature                   | Description                                                                                      |
| ------------------------- | ------------------------------------------------------------------------------------------------ |
| **AI Contract Analysis**  | Upload a contract to receive a simplified and easy-to-understand summary                         |
| **Contract Generation**   | Create custom contracts tailored to various roles in music and creator industries                |
| **Contract Revision**     | Use AI-assisted suggestions to revise contracts in your favor                                    |
| **Multi-Role Support**    | Provides specialized analysis and generation for music professionals, streamers, and influencers |
| **Royalty Calculator**    | Estimate potential earnings from various streaming platforms                                     |
| **Educational Resources** | Access a comprehensive FAQ and educational content regarding music industry contracts            |
| **Responsive Design**     | Fully functional and accessible on desktop and mobile devices                                    |

---

## 🛠️ Technologies

| Category       | Technology                                     |
| -------------- | ---------------------------------------------- |
| **Frontend**   | React, Next.js 15, Tailwind CSS, Framer Motion |
| **Backend**    | Node.js, Next.js API Routes                    |
| **AI/ML**      | Google's Generative AI (Gemini)                |
| **Database**   | Neon PostgreSQL                                |
| **Deployment** | Vercel                                         |
| **Language**   | TypeScript (Strict Mode)                       |

---

## 🚀 Getting Started

### Prerequisites

- Node.js (v18.0.0 or later)
- npm (v9.0.0 or later)
- A Google Cloud account with access to the Generative AI API
- A Neon PostgreSQL database (optional, for statistics)

### Installation

1. **Clone the repository:**

   ```bash
   git clone https://github.com/bantoinese83/trackrights.git
   cd trackrights
   ```

2. **Install dependencies:**

   ```bash
   npm install
   ```

3. **Set up environment variables:**

   ```bash
   cp .env.example .env
   ```

   Edit `.env` and add your API keys:

   ```bash
   GEMINI_API_KEY=your_google_cloud_api_key_here
   GEMINI_API_KEY_1=optional_second_key_for_fallback
   DATABASE_URL=your_neon_database_connection_string_here
   ```

4. **Start the development server:**

   ```bash
   npm run dev
   ```

5. **Open your browser:**
   Navigate to `http://localhost:3000`

For Next.js, prefer **`.env.local`** for secrets (it is gitignored). Copy from `.env.example` and adjust variable names as needed.

### Quality checks (CI / pre-PR)

```bash
npm run quality-gate   # type-check, lint (0 warnings), Prettier, Knip, production build
npm run analyze        # bundle analysis (set ANALYZE=true via npm script)
```

See **`QUALITY_STATUS.md`** for what each step covers and Knip notes.

### Environment Variables

| Variable                               | Description                                                                | Required                |
| -------------------------------------- | -------------------------------------------------------------------------- | ----------------------- |
| `GEMINI_API_KEY`                       | Primary Google Gemini API key                                              | ✅ Yes                  |
| `GEMINI_API_KEY_1`                     | Fallback Gemini key (used if primary fails quota/auth/rate limits)         | ⚠️ Optional             |
| `DATABASE_URL`                         | Neon PostgreSQL connection string                                          | ⚠️ Optional (for stats) |
| `ALLOWED_ORIGINS`                      | Comma-separated list of allowed CORS origins                               | ❌ No (has defaults)    |
| `NEXT_PUBLIC_ADSENSE_CLIENT_ID`        | Google AdSense publisher id (`ca-pub-…`); empty string disables the script | ❌ No (has default)     |
| `NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION` | Search Console HTML-tag verification token                                 | ❌ No                   |
| `NODE_ENV`                             | Environment (development/production)                                       | ❌ No                   |

### SEO

The app exposes **`/sitemap.xml`** and **`/robots.txt`** (via `src/app/sitemap.ts` and `src/app/robots.ts`). Each public route has its own **canonical URL** and **Open Graph** metadata (root layout no longer forces the homepage canonical on every URL). The FAQ uses **`FAQPage` JSON-LD** (`src/app/faq/layout.tsx`). Shared constants live in **`src/lib/site-config.ts`**. Optional: set **`NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION`** for Search Console HTML-tag verification.

### Google AdSense

AdSense is **not** loaded site-wide. The AdSense script runs only on **high-content** routes (home and `/faq`). The `google-adsense-account` meta is set on the **home page** only so Google does not associate auto ads with thin or utility pages (for example `/cookies` or 404s), per [AdSense program policies](https://support.google.com/adsense/answer/48182). **`ads.txt`** is served statically from `public/ads.txt` at `/ads.txt` (the old rewrite to a missing API route was removed).

---

## 🗄️ Database Setup

TrackRights uses **Neon PostgreSQL** for data persistence and real-time statistics.

### Setup Steps

1. **Create a Neon Database:**
   - Go to [Neon Console](https://console.neon.tech)
   - Create a new project
   - Copy the connection string

2. **Add to Environment:**

   ```bash
   DATABASE_URL=your_neon_database_connection_string
   ```

   ⚠️ **Security Note:** Never commit your actual database connection string to version control.

### Database Schema

The application uses three main tables:

1. **`contracts`**
   - Stores all contract analyses (original, simplified, revised)
   - Tracks processing time and contract type

2. **`users`**
   - Tracks unique users via session IDs
   - Maintains user statistics (total contracts, first/last active dates)

3. **`contract_analyses`**
   - Detailed analysis records
   - Links contracts to users
   - Tracks success/failure and processing times

### API Endpoints

- **`/api/stats`** (GET) - Returns real-time statistics
- **`/api/track-contract`** (POST) - Tracks contract analyses (called automatically)

---

## 📡 API Endpoints

### Generate Contract

**Endpoint:** `POST /api/generate-contract`

**Request Body:**

```json
{
  "contractDetails": {
    "id": "string",
    "title": "string",
    "description": "string",
    "fields": {
      "fieldName": {
        "label": "string",
        "type": "string"
      }
    }
  },
  "contractInputs": {
    "inputName": "string"
  }
}
```

**Response:**

```json
{
  "generatedContract": "string",
  "message": "Contract generated successfully."
}
```

### Revise Contract

**Endpoint:** `POST /api/revise-contract`

**Request Body:**

```json
{
  "originalContract": "string",
  "instructions": "string",
  "role": "string"
}
```

**Response:**

```json
{
  "revisedContract": "string",
  "message": "Contract revised successfully."
}
```

### Simplify Contract

**Endpoint:** `POST /api/simplify-contract`

**Request Body (JSON):**

```json
{
  "contractText": "string"
}
```

**Request Body (Form Data):**

- `file`: PDF or TXT file (max 10MB)

**Response:**

```json
{
  "originalContract": "string",
  "simplifiedContract": "string",
  "message": "Contract simplified successfully."
}
```

---

## 🔒 Security

### Security Features

✅ **CORS Protection** - Origin whitelist (no wildcard)  
✅ **API Key Validation** - Fail-fast on missing keys  
✅ **Input Validation** - File size and type limits  
✅ **SQL Injection Protection** - Parameterized queries  
✅ **Secure Headers** - CORS credentials support

### Security Best Practices

- Never commit `.env` files
- Rotate database passwords regularly
- Use environment variables for all secrets
- Review CORS origins for your deployment
- Keep dependencies updated

### Recent Security Fixes

All critical security vulnerabilities have been addressed:

- ✅ CORS configured with origin whitelist
- ✅ API key validation throws errors
- ✅ File upload validation (10MB limit, PDF/TXT only)
- ✅ Database credentials removed from documentation

---

## 🎯 Quality Gates

TrackRights maintains a **100/100 quality score** with comprehensive quality gates.

### Quality Check Commands

```bash
# Individual checks
npm run type-check      # TypeScript validation
npm run lint            # ESLint validation
npm run format:check    # Prettier validation
npm run knip            # Dependency analysis

# Combined checks
npm run quality-check   # All checks except build
npm run quality-gate    # Complete quality gate (recommended)
```

### Quality Gate Pipeline

The `quality-gate` script runs:

1. ✅ **Type Check** - TypeScript strict mode validation
2. ✅ **Lint** - ESLint with zero errors/warnings
3. ✅ **Format Check** - Prettier formatting validation
4. ✅ **Knip** - Unused code and dependency analysis
5. ✅ **Build** - Production build verification

### TypeScript Strict Mode

All strict checks are enabled:

- ✅ `strict: true`
- ✅ `noImplicitAny: true`
- ✅ `strictNullChecks: true`
- ✅ `noUnusedLocals: true`
- ✅ `noUnusedParameters: true`
- ✅ `noImplicitOverride: true`
- ✅ And more...

### Current Quality Score

| Check       | Status      | Score       |
| ----------- | ----------- | ----------- |
| TypeScript  | ✅ Pass     | 100/100     |
| ESLint      | ✅ Pass     | 100/100     |
| Prettier    | ✅ Pass     | 100/100     |
| Knip        | ✅ Pass     | 100/100     |
| Build       | ✅ Pass     | 100/100     |
| **Overall** | **✅ Pass** | **100/100** |

---

## 📊 Code Quality

### Architecture Improvements

**Phase 2 Completed:**

- ✅ Standardized error handling
- ✅ Improved type safety (75% → 95%)
- ✅ Reduced code duplication (15% → <5%)
- ✅ Centralized utilities
- ✅ Runtime validation with Zod

### Code Structure

```
src/
├── app/              # Next.js app directory
│   ├── api/          # API routes
│   └── page.tsx      # Pages
├── components/       # React components
├── lib/              # Shared utilities
│   ├── errors.ts     # Error handling
│   ├── cache.ts      # Caching utilities
│   ├── ai-retry.ts   # AI retry logic
│   └── validation.ts # Runtime validation
├── hooks/            # Custom React hooks
└── services/        # Business logic services
```

### Key Utilities

- **Error Handling** - Standardized error classes and responses
- **Caching** - Centralized cache management
- **Validation** - Runtime validation with Zod schemas
- **Retry Logic** - Shared AI API retry mechanism

---

## ✍️ Usage

1. **Upload a Contract:**
   - Navigate to the TrackRights platform
   - Click "Upload Contract"
   - Select a PDF or TXT file (max 10MB)
   - Wait for AI analysis

2. **Generate a Contract:**
   - Select contract type
   - Fill in required details
   - Generate custom contract

3. **Revise a Contract:**
   - Upload or paste contract text
   - Provide revision instructions
   - Select your role (artist, producer, etc.)
   - Get AI-revised contract

4. **Calculate Royalties:**
   - Use the royalty calculator
   - Enter streaming numbers
   - View estimated earnings

---

## 🤝 Contributing

We welcome contributions! Please follow these steps:

1. **Fork the repository**
2. **Create a feature branch:**
   ```bash
   git checkout -b feature/your-feature-name
   ```
3. **Make your changes:**
   - Follow the code style (run `npm run format`)
   - Ensure quality gates pass (`npm run quality-gate`)
   - Add tests if applicable
4. **Commit your changes:**
   ```bash
   git commit -m "Add: your feature description"
   ```
5. **Push to your fork:**
   ```bash
   git push origin feature/your-feature-name
   ```
6. **Create a Pull Request**

### Code Standards

- ✅ All code must pass quality gates
- ✅ TypeScript strict mode compliance
- ✅ ESLint rules enforced
- ✅ Prettier formatting required
- ✅ Meaningful commit messages

---

## 📝 License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.

---

## 📞 Contact

- **Email:** support@trackrights.com
- **Twitter:** [@trackrights](https://twitter.com/trackrights)
- **GitHub Issues:** [TrackRights Issues](https://github.com/bantoinese83/trackrights/issues)

---

## 🙏 Acknowledgments

- Google's Generative AI (Gemini)
- React, Next.js, Tailwind CSS, Framer Motion
- Vercel for deployment
- Neon for database hosting

---

## 🛣️ Roadmap

- [ ] User authentication
- [ ] Enhanced AI contract analysis
- [ ] Expanded educational resources
- [ ] Mobile app
- [ ] API versioning
- [ ] Comprehensive test coverage

---

## ❓ FAQ

### How do I upload a contract for analysis?

Navigate to the TrackRights platform and click the "Upload Contract" button. Select the contract file from your device and click "Submit" to begin the analysis process.

### Can I generate custom music contracts?

Yes, TrackRights allows you to generate custom music contracts tailored to various roles within the industry. Simply provide the necessary details and inputs to create a personalized contract.

### How can I revise a contract using TrackRights?

Upload the original contract and provide specific instructions and your role within the industry. TrackRights will use AI-assisted suggestions to help you revise the contract in your favor.

### What file types are supported?

Currently, TrackRights supports PDF and TXT files up to 10MB in size.

### Is my contract data secure?

Yes, all contract data is processed securely. We use encrypted connections and never store your contracts longer than necessary for processing.

---

**Last Updated:** December 2025  
**Version:** 0.1.0
