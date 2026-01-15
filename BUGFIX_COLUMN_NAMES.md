# Bug Fix: Column Name Mismatch

## Issue
When clicking "Evaluate Sentence", the error "Failed to fetch words" occurred.

## Root Cause
The database schema and the evaluation action had mismatched column names:

### Database Schema (from migrations):
```sql
CREATE TABLE words (
  id SERIAL PRIMARY KEY,
  transliteration TEXT NOT NULL,
  meaning TEXT NOT NULL,
  tamil TEXT,
  word_type word_type NOT NULL
);
```

### What the Code Was Querying (WRONG):
```typescript
.select('id, tamil, english, pronunciation, type')
```

The columns `english`, `pronunciation`, and `type` don't exist in the database!

## Fix Applied

**File:** [app/actions/evaluations.ts](app/actions/evaluations.ts)

**Changed:**
```typescript
// Before (WRONG):
const { data: words, error: wordsError } = await supabase
  .from('words')
  .select('id, tamil, english, pronunciation, type')  // ❌ Wrong column names
  .in('id', wordIds)

const wordList: Word[] = (words || []).map((w) => ({
  id: w.id,
  tamil: w.tamil,
  english: w.english,           // ❌ Wrong
  pronunciation: w.pronunciation, // ❌ Wrong
  type: w.type,                  // ❌ Wrong
}))
```

```typescript
// After (CORRECT):
const { data: words, error: wordsError } = await supabase
  .from('words')
  .select('id, tamil, meaning, transliteration, word_type')  // ✅ Correct column names
  .in('id', wordIds)

const wordList: Word[] = (words || []).map((w) => ({
  id: w.id,
  tamil: w.tamil,
  english: w.meaning,           // ✅ Map meaning → english
  pronunciation: w.transliteration, // ✅ Map transliteration → pronunciation
  type: w.word_type,            // ✅ Map word_type → type
}))
```

## Column Mapping

| LLM Interface Field | Database Column |
|---------------------|-----------------|
| `english` | `meaning` |
| `pronunciation` | `transliteration` |
| `type` | `word_type` |
| `tamil` | `tamil` ✅ (same) |

## Why This Mapping?

The LLM `Word` interface (in [lib/llm/types.ts](lib/llm/types.ts)) expects:
```typescript
interface Word {
  id: number
  tamil: string
  english: string      // The English meaning
  pronunciation?: string // Pronunciation/transliteration
  type?: string        // Word type (noun/verb/adjective)
}
```

But the database uses different names for these concepts:
- `meaning` instead of `english`
- `transliteration` instead of `pronunciation`
- `word_type` instead of `type`

The mapping ensures the LLM receives the data in the format it expects while querying the correct database columns.

## Status

✅ **Fixed** - The evaluation should now work correctly when you click "Evaluate Sentence"

## Testing

To verify the fix:
1. Login as a learner
2. Select words from flashcards
3. Write a Tamil sentence
4. Click "Evaluate Sentence"
5. Should now fetch words successfully and show evaluation feedback
