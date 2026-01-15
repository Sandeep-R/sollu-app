'use client'

import { deleteWord } from '@/app/actions/words'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

interface Word {
  id: number
  transliteration: string
  meaning: string
  tamil: string | null
  word_type: 'noun' | 'verb' | 'adjective'
}

export default function WordList({ words }: { words: Word[] }) {
  async function handleDelete(id: number) {
    if (confirm('Are you sure you want to delete this word?')) {
      await deleteWord(id)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>All Words ({words.length})</CardTitle>
      </CardHeader>
      <CardContent>
        {words.length === 0 ? (
          <p className="text-center text-muted-foreground py-8">
            No words yet. Add your first word above!
          </p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Transliteration</TableHead>
                <TableHead>Meaning</TableHead>
                <TableHead>Tamil</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {words.map((word) => (
                <TableRow key={word.id}>
                  <TableCell>{word.id}</TableCell>
                  <TableCell className="font-medium">{word.transliteration}</TableCell>
                  <TableCell>{word.meaning}</TableCell>
                  <TableCell>{word.tamil || '-'}</TableCell>
                  <TableCell className="capitalize">{word.word_type}</TableCell>
                  <TableCell>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleDelete(word.id)}
                    >
                      Delete
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  )
}
