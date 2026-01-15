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
    <Card className="mb-6 md:mb-8">
      <CardHeader className="p-4 md:p-6">
        <CardTitle className="text-lg md:text-xl">Add New Word</CardTitle>
      </CardHeader>
      <CardContent className="p-4 md:p-6 pt-0">
        <form ref={formRef} action={handleSubmit} className="flex flex-col gap-3 md:gap-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
            <div className="space-y-2">
              <Label htmlFor="transliteration" className="text-sm">Transliteration *</Label>
              <Input
                type="text"
                id="transliteration"
                name="transliteration"
                required
                placeholder="e.g., Vanakkam"
                className="h-10 md:h-10"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="meaning" className="text-sm">Meaning *</Label>
              <Input
                type="text"
                id="meaning"
                name="meaning"
                required
                placeholder="e.g., Hello / Greetings"
                className="h-10 md:h-10"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="tamil" className="text-sm">Tamil Script</Label>
              <Input
                type="text"
                id="tamil"
                name="tamil"
                placeholder="e.g., வணக்கம்"
                className="h-10 md:h-10"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="word_type" className="text-sm">Word Type *</Label>
              <select
                id="word_type"
                name="word_type"
                required
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              >
                <option value="noun">Noun</option>
                <option value="verb">Verb</option>
                <option value="adjective">Adjective</option>
              </select>
            </div>
          </div>
          <Button type="submit" className="w-full md:w-auto md:self-end h-10">Add Word</Button>
        </form>
      </CardContent>
    </Card>
  )
}
