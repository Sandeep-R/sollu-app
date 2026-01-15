# Add Tamil Words and Learning Flow

## Overview

This plan adds 300 colloquial Tamil words to the database and implements a learning interface that displays one noun, verb, and adjective simultaneously, allowing learners to mark words as "done" and refresh for new words.

## Database Changes

### 1. Migration: Add word types and 300 words

**File:** `supabase/migrations/003_add_word_types_and_words.sql`

- Add `word_type` enum: `noun`, `verb`, `adjective`
- Add `word_type` column to `words` table
- Insert 100 nouns, 100 verbs, 100 adjectives (colloquial Tamil only)
- Update existing words to have a type (default to noun for the 3 existing words)

### 2. Migration: Add user progress tracking

**File:** `supabase/migrations/004_user_word_progress.sql`

- Create `user_word_progress` table:
  - `id` (UUID, primary key)
  - `user_id` (UUID, references auth.users)
  - `word_id` (INTEGER, references words)
  - `marked_done_at` (TIMESTAMP)
  - `session_id` (TEXT) - to track current session
  - Unique constraint on (user_id, word_id, session_id)
- Enable RLS with policies:
  - Users can insert/select their own progress
  - Users can delete their own progress (for refresh)

## Backend Changes

### 3. Update word actions

**File:** `app/actions/words.ts`

Add new server actions:

- `getRandomWords(userId: string, sessionId: string)` - Fetches one random noun, verb, and adjective, excluding words marked as done in the current session
- `markWordDone(userId: string, wordId: number, sessionId: string)` - Marks a word as done for the current session
- `clearSessionProgress(userId: string, sessionId: string)` - Clears all done words for refresh (or creates new session)

### 4. Update auth utilities

**File:** `lib/auth.ts`

Add helper:

- `getSessionId()` - Generates/retrieves a session ID (can use timestamp or UUID stored in cookie)

## Frontend Changes

### 5. Update FlashcardDeck component

**File:** `components/FlashcardDeck.tsx`

Changes:

- Remove hardcoded words array
- Fetch words from database using `getRandomWords()` action
- Display three flashcards side-by-side (flexbox horizontal layout)
- Add "Done" button on each flashcard
- Add "Refresh Words" button that clears session and fetches new words
- Handle loading and error states
- Generate/retrieve session ID (store in state or cookie)

### 6. Update Flashcard component

**File:** `components/Flashcard.tsx`

Changes:

- Add optional `onMarkDone` callback prop
- Add "Done" button (only show if callback provided)
- Style the done button appropriately

### 7. Update main page

**File:** `app/page.tsx`

Changes:

- Ensure user is authenticated before showing flashcards
- Pass user ID to FlashcardDeck if needed

## Data Flow

```
User visits page
  ↓
FlashcardDeck generates/retrieves sessionId
  ↓
Calls getRandomWords(userId, sessionId)
  ↓
Server queries words table:
  - Filters by word_type (noun, verb, adjective)
  - Excludes words in user_word_progress for this session
  - Returns one random word of each type
  ↓
Display 3 flashcards side-by-side
  ↓
User clicks "Done" on a word
  ↓
Calls markWordDone(userId, wordId, sessionId)
  ↓
Word is hidden/disabled (or removed from display)
  ↓
User clicks "Refresh Words"
  ↓
Calls clearSessionProgress(userId, sessionId)
  ↓
Fetches new random words
```

## Implementation Notes

- Use colloquial Tamil only (avoid formal/scholarly terms)
- Words should be common, everyday vocabulary
- Session ID can be a simple timestamp or UUID stored in browser state
- When all words of a type are done, show a message or allow continuing with already-seen words
- Ensure responsive design for mobile (stack cards vertically on small screens)

## Testing Considerations

- Verify all 300 words are inserted correctly
- Test that done words don't reappear in same session
- Test that refresh clears session and shows new words
- Test that words can reappear after refresh (new session)
- Verify RLS policies work correctly

## Todo List

1. **migration_word_types** - Create migration to add word_type enum and column, insert 300 colloquial Tamil words (100 nouns, 100 verbs, 100 adjectives)
2. **migration_progress** - Create migration for user_word_progress table with RLS policies (depends on: migration_word_types)
3. **update_word_actions** - Add server actions: getRandomWords, markWordDone, clearSessionProgress (depends on: migration_progress)
4. **update_flashcard_deck** - Update FlashcardDeck to fetch from DB, display 3 cards side-by-side, add Done and Refresh buttons (depends on: update_word_actions)
5. **update_flashcard** - Add Done button to Flashcard component with callback support
6. **session_management** - Implement session ID generation and storage (client-side state or cookie)
