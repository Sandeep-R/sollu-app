# Learner-Admin Conversation Flow

## Overview

Build a conversation flow between learners and admins where learners write Tamil sentences after completing words, admins reply, and learners translate the reply to English. The flow must be completed before learners can refresh words.

## Database Changes

### 1. Migration: Create conversations table

**File:** `supabase/migrations/005_conversations.sql`

Create `conversations` table:

- `id` (UUID, primary key)
- `user_id` (UUID, references auth.users)
- `session_id` (TEXT) - links to learning session
- `learner_sentence_tamil` (TEXT) - learner's Tamil sentence
- `learner_sentence_english` (TEXT, nullable) - learner's English translation (if provided)
- `admin_reply_tamil` (TEXT, nullable) - admin's Tamil reply
- `learner_translation_english` (TEXT, nullable) - learner's English translation of admin reply
- `status` (ENUM: 'pending', 'replied', 'completed')
- `word_ids_used` (INTEGER[]) - array of word IDs used in learner sentence
- `created_at` (TIMESTAMP)
- `admin_replied_at` (TIMESTAMP, nullable)
- `completed_at` (TIMESTAMP, nullable)

Create status enum:

```sql
CREATE TYPE conversation_status AS ENUM ('pending', 'replied', 'completed');
```

RLS Policies:

- Learners can insert/select/update their own conversations
- Admins can select all conversations
- Admins can update conversations (to add replies)
- Learners can update their own conversations (to add translations)

### 2. Migration: Add conversation status check function

**File:** `supabase/migrations/005_conversations.sql` (continued)

Create helper function to check if user has active conversation:

```sql
CREATE OR REPLACE FUNCTION has_active_conversation(p_user_id UUID, p_session_id TEXT)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM conversations 
    WHERE user_id = p_user_id 
    AND session_id = p_session_id 
    AND status IN ('pending', 'replied')
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

## Backend Changes

### 3. Create conversation actions

**File:** `app/actions/conversations.ts`

Server actions:

- `submitLearnerSentence(userId, sessionId, sentenceTamil, wordIds)` - Creates conversation with status 'pending'
- `getActiveConversation(userId, sessionId)` - Gets current active conversation for user/session
- `getAllConversations()` - Admin only, gets all conversations with user info
- `replyToConversation(conversationId, replyTamil)` - Admin replies, sets status to 'replied'
- `submitTranslation(conversationId, translationEnglish)` - Learner translates admin reply, sets status to 'completed'
- `checkHasActiveConversation(userId, sessionId)` - Checks if user has active conversation

### 4. Update word actions

**File:** `app/actions/words.ts`

Modify `getRandomWords()`:

- Check if user has active conversation
- If active conversation exists, return error or handle appropriately

Add helper:

- `canRefreshWords(userId, sessionId)` - Returns boolean indicating if refresh is allowed

## Frontend Changes

### 5. Update FlashcardDeck component

**File:** `components/FlashcardDeck.tsx`

Changes:

- After all 3 words are marked done, show sentence submission form instead of refresh button
- Form includes:
  - Text area for Tamil sentence
  - Selection/display of which word(s) were used
  - Submit button
- After submission, show waiting state with message "Waiting for admin reply..."
- Poll or check for admin reply periodically
- When admin replies, show admin's Tamil sentence and translation input form
- After translation submission, show completion message and enable refresh button
- Hide refresh button until conversation is completed

### 6. Create SentenceSubmissionForm component

**File:** `components/SentenceSubmissionForm.tsx`

New component:

- Text area for Tamil sentence input
- Display which words are available (noun, verb, adjective)
- Submit button
- Validation (must use at least one word, sentence required)
- Calls `submitLearnerSentence` action

### 7. Create WaitingState component

**File:** `components/WaitingState.tsx`

New component:

- Shows "Waiting for admin reply..." message
- Loading spinner/animation
- Optionally polls for updates

### 8. Create TranslationForm component

**File:** `components/TranslationForm.tsx`

New component:

- Displays admin's Tamil reply
- Text area for English translation
- Submit button
- Calls `submitTranslation` action

### 9. Create Admin Conversations page

**File:** `app/admin/conversations/page.tsx`

New page:

- Table showing all conversations
- Columns: Learner email, Tamil sentence, Status, Admin reply, Learner translation, Created date, Actions
- Filter by status (pending, replied, completed)
- For pending conversations: Reply form/button
- For replied conversations: Show admin reply
- For completed conversations: Show full conversation thread

### 10. Create ConversationList component

**File:** `components/ConversationList.tsx`

New component:

- Displays conversations in table format
- Status badges (pending/replied/completed)
- Reply button for pending conversations
- View details for all conversations

### 11. Create ReplyForm component

**File:** `components/ReplyForm.tsx`

New component:

- Text area for admin Tamil reply
- Submit button
- Calls `replyToConversation` action

### 12. Update admin dashboard navigation

**File:** `app/admin/page.tsx`

Add navigation link to conversations page:

- "Conversations" link/button in header
- Link to `/admin/conversations`

### 13. Update main page

**File:** `app/page.tsx`

Ensure user authentication is checked before showing FlashcardDeck.

## Data Flow

```
Learner completes all 3 words
  ↓
Sentence submission form appears
  ↓
Learner writes Tamil sentence using word(s)
  ↓
Submit → Creates conversation (status: 'pending')
  ↓
Waiting state shown to learner
  ↓
Admin views conversations page
  ↓
Admin sees pending conversation
  ↓
Admin writes Tamil reply
  ↓
Submit → Updates conversation (status: 'replied', admin_reply_tamil set)
  ↓
Learner sees admin reply + translation form
  ↓
Learner translates to English
  ↓
Submit → Updates conversation (status: 'completed', learner_translation_english set)
  ↓
Completion message shown
  ↓
Refresh button becomes available
```

## State Management

- Track active conversation state in FlashcardDeck
- Use polling or server-side checks to detect admin reply
- Disable refresh button when active conversation exists
- Show appropriate UI based on conversation status

## Implementation Notes

- Use real-time subscriptions or polling to detect admin replies (polling simpler for MVP)
- Store word IDs used in sentence for tracking
- Validate that learner uses at least one of the three words
- Admin can see all conversations, filter by status
- Conversation is tied to session_id to prevent multiple active conversations
- After completion, learner can start new session with new words

## Testing Considerations

- Test conversation creation after completing words
- Test admin reply flow
- Test translation submission
- Test that refresh is blocked during active conversation
- Test that refresh becomes available after completion
- Test multiple learners submitting conversations
- Test admin viewing and replying to multiple conversations
- Verify RLS policies work correctly

## Todo List

1. **migration_conversations** - Create migration for conversations table with status enum, word tracking, and RLS policies
2. **conversation_actions** - Create server actions: submitLearnerSentence, getActiveConversation, getAllConversations, replyToConversation, submitTranslation (depends on: migration_conversations)
3. **update_word_actions** - Add canRefreshWords helper and update getRandomWords to check for active conversations (depends on: conversation_actions)
4. **sentence_form** - Create SentenceSubmissionForm component with Tamil input and word selection (depends on: conversation_actions)
5. **waiting_state** - Create WaitingState component for showing pending admin reply (depends on: conversation_actions)
6. **translation_form** - Create TranslationForm component for translating admin reply (depends on: conversation_actions)
7. **update_flashcard_deck** - Update FlashcardDeck to show sentence form after words done, handle conversation flow, hide refresh until complete (depends on: sentence_form, waiting_state, translation_form, update_word_actions)
8. **admin_conversations_page** - Create admin conversations page with table and filters (depends on: conversation_actions)
9. **conversation_list** - Create ConversationList component for displaying conversations table (depends on: conversation_actions)
10. **reply_form** - Create ReplyForm component for admin replies (depends on: conversation_actions)
11. **update_admin_nav** - Add Conversations link to admin dashboard navigation (depends on: admin_conversations_page)
