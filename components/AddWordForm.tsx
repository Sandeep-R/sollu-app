'use client'

import { addWord } from '@/app/actions/words'
import { useRef } from 'react'
import './AdminStyles.css'

export default function AddWordForm() {
  const formRef = useRef<HTMLFormElement>(null)

  async function handleSubmit(formData: FormData) {
    const result = await addWord(formData)
    if (result.success) {
      formRef.current?.reset()
    }
  }

  return (
    <form ref={formRef} action={handleSubmit} className="add-word-form">
      <h2 className="form-title">Add New Word</h2>
      <div className="form-row">
        <div className="form-group">
          <label htmlFor="transliteration" className="form-label">
            Transliteration *
          </label>
          <input
            type="text"
            id="transliteration"
            name="transliteration"
            required
            className="form-input"
            placeholder="e.g., Vanakkam"
          />
        </div>
        <div className="form-group">
          <label htmlFor="meaning" className="form-label">
            Meaning *
          </label>
          <input
            type="text"
            id="meaning"
            name="meaning"
            required
            className="form-input"
            placeholder="e.g., Hello / Greetings"
          />
        </div>
        <div className="form-group">
          <label htmlFor="tamil" className="form-label">
            Tamil Script
          </label>
          <input
            type="text"
            id="tamil"
            name="tamil"
            className="form-input"
            placeholder="e.g., வணக்கம்"
          />
        </div>
        <button type="submit" className="add-button">
          Add Word
        </button>
      </div>
    </form>
  )
}
