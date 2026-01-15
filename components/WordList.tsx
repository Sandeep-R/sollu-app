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
      <CardHeader className="p-4 md:p-6">
        <CardTitle className="text-lg md:text-xl">All Words ({words.length})</CardTitle>
      </CardHeader>
      <CardContent className="p-4 md:p-6 pt-0">
        {words.length === 0 ? (
          <p className="text-center text-muted-foreground py-6 md:py-8 text-sm md:text-base">
            No words yet. Add your first word above!
          </p>
        ) : (
          <div className="overflow-x-auto -mx-4 md:mx-0">
            <div className="min-w-[600px] md:min-w-0 px-4 md:px-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="hidden md:table-cell w-16">ID</TableHead>
                    <TableHead className="min-w-[120px]">Transliteration</TableHead>
                    <TableHead className="min-w-[120px]">Meaning</TableHead>
                    <TableHead className="hidden md:table-cell min-w-[100px]">Tamil</TableHead>
                    <TableHead className="w-20">Type</TableHead>
                    <TableHead className="w-24">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {words.map((word) => (
                    <TableRow key={word.id}>
                      <TableCell className="hidden md:table-cell text-sm">{word.id}</TableCell>
                      <TableCell className="font-medium text-sm">{word.transliteration}</TableCell>
                      <TableCell className="text-sm">{word.meaning}</TableCell>
                      <TableCell className="hidden md:table-cell text-sm">{word.tamil || '-'}</TableCell>
                      <TableCell className="capitalize text-sm">{word.word_type}</TableCell>
                      <TableCell>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleDelete(word.id)}
                          className="h-8 px-2 md:px-3 text-xs md:text-sm min-w-[44px]"
                        >
                          Delete
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
