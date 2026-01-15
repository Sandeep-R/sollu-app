# Sollu - Language Learning App

A language learning app to help teach Tamil with interactive flashcards.

## Features

- Interactive flashcards with Tamil words (transliterated)
- Flip cards to reveal meanings
- Navigate through cards with Previous/Next buttons
- Beautiful, modern UI with smooth animations

## Getting Started

### Prerequisites

- Node.js 18+ installed
- npm or yarn package manager

### Installation

1. Install dependencies:
```bash
npm install
```

2. Run the development server:
```bash
npm run dev
```

3. Open [http://localhost:3000](http://localhost:3000) in your browser to see the app.

## Project Structure

```
sollu-app/
├── app/
│   ├── layout.tsx      # Root layout
│   ├── page.tsx        # Home page
│   └── globals.css     # Global styles
├── components/
│   ├── Flashcard.tsx   # Individual flashcard component
│   └── FlashcardDeck.tsx # Flashcard deck container
├── package.json
├── tsconfig.json
└── next.config.js
```

## Deployment

This app is configured to deploy on Vercel:

1. Push your code to GitHub
2. Import your repository in Vercel
3. Vercel will automatically detect Next.js and deploy

## Future Plans

- Integrate Supabase for database storage
- Add more Tamil words and phrases
- Implement user progress tracking
- Add pronunciation audio
- Create spaced repetition system
