'use client'

import { deleteWord } from '@/app/actions/words'
import './AdminStyles.css'

interface Word {
  id: number
  transliteration: string
  meaning: string
  tamil: string | null
}

export default function WordList({ words }: { words: Word[] }) {
  async function handleDelete(id: number) {
    if (confirm('Are you sure you want to delete this word?')) {
      await deleteWord(id)
    }
  }

  return (
    <div className="word-list">
      <h2 className="list-title">All Words ({words.length})</h2>
      <table className="words-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Transliteration</th>
            <th>Meaning</th>
            <th>Tamil</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {words.map((word) => (
            <tr key={word.id}>
              <td>{word.id}</td>
              <td>{word.transliteration}</td>
              <td>{word.meaning}</td>
              <td>{word.tamil || '-'}</td>
              <td>
                <button
                  onClick={() => handleDelete(word.id)}
                  className="delete-button"
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {words.length === 0 && (
        <p className="no-words">No words yet. Add your first word above!</p>
      )}
    </div>
  )
}
