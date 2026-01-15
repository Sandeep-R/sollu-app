'use client'

import { addWord } from '@/app/actions/words'
import { useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export default function AddWordForm() {
  const formRef = useRef<HTMLFormElement>(null)

  async function handleSubmit(formData: FormData) {
    const result = await addWord(formData)
    if (result.success) {
      formRef.current?.reset()
    }
  }

  return (
    <Card className="mb-8">
      <CardHeader>
        <CardTitle>Add New Word</CardTitle>
      </CardHeader>
      <CardContent>
        <form ref={formRef} action={handleSubmit} className="flex flex-col md:flex-row gap-4 items-end">
          <div className="flex-1 space-y-2">
            <Label htmlFor="transliteration">Transliteration *</Label>
            <Input
              type="text"
              id="transliteration"
              name="transliteration"
              required
              placeholder="e.g., Vanakkam"
            />
          </div>
          <div className="flex-1 space-y-2">
            <Label htmlFor="meaning">Meaning *</Label>
            <Input
              type="text"
              id="meaning"
              name="meaning"
              required
              placeholder="e.g., Hello / Greetings"
            />
          </div>
          <div className="flex-1 space-y-2">
            <Label htmlFor="tamil">Tamil Script</Label>
            <Input
              type="text"
              id="tamil"
              name="tamil"
              placeholder="e.g., வணக்கம்"
            />
          </div>
          <Button type="submit">Add Word</Button>
        </form>
      </CardContent>
    </Card>
  )
}
