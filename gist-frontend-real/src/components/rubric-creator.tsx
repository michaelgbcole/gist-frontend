import React, { useState } from 'react'
import { Plus, Trash2, Save } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { ScrollArea } from "@/components/ui/scroll-area"

type Criterion = {
  name: string
  description: string
  points: number
}

type RubricMakerProps = {
  userId: string
}

export default function RubricMaker({ userId }: RubricMakerProps) {
  const [open, setOpen] = useState(false)
  const [criteria, setCriteria] = useState<Criterion[]>([{ name: '', description: '', points: 0 }])
  const [title, setTitle] = useState('')

  const addCriterion = () => {
    setCriteria([...criteria, { name: '', description: '', points: 0 }])
  }

  const removeCriterion = (index: number) => {
    const newCriteria = criteria.filter((_, i) => i !== index)
    setCriteria(newCriteria)
  }

  const updateCriterion = <K extends keyof Criterion>(index: number, field: K, value: Criterion[K]) => {
    const newCriteria = [...criteria]
    newCriteria[index][field] = value
    setCriteria(newCriteria)
  }

  const handleConfirm = async () => {
    const rubric = {
      title,
      totalScore: totalPoints,
      criteria: criteria.filter(c => c.name && c.description)
    }
    console.log(JSON.stringify(rubric, null, 2))

    try {
      const response = await fetch(`/api/publish-rubric?userId=${userId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(rubric),
      })

      if (!response.ok) {
        throw new Error('Failed to publish rubric')
      }

      alert('Rubric published successfully!')
      setOpen(false)
    } catch (error) {
      console.error('Error publishing rubric:', error)
      alert('Failed to publish rubric. Please try again.')
    }
  }

  const totalPoints = criteria.reduce((sum, criterion) => sum + criterion.points, 0)

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">Create Rubric</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[700px]">
        <DialogHeader>
          <DialogTitle>Rubric Maker</DialogTitle>
        </DialogHeader>
        <ScrollArea className="max-h-[60vh] pr-4">
          <div className="space-y-4">
            <div>
              <Label htmlFor="rubric-title">Rubric Title</Label>
              <Input
                id="rubric-title"
                placeholder="Enter rubric title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="mt-2"
              />
            </div>
            {criteria.map((criterion, index) => (
              <Card key={index}>
                <CardContent className="pt-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <Input
                      placeholder="Criterion name"
                      value={criterion.name}
                      onChange={(e) => updateCriterion(index, 'name', e.target.value)}
                      className="flex-grow mr-2"
                    />
                    <div className="flex items-center space-x-2">
                      <Label htmlFor={`points-${index}`}>Points:</Label>
                      <Input
                        id={`points-${index}`}
                        type="number"
                        min="0"
                        value={criterion.points}
                        onChange={(e) => updateCriterion(index, 'points', parseInt(e.target.value) || 0)}
                        className="w-20"
                      />
                      <Button variant="destructive" size="icon" onClick={() => removeCriterion(index)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  <Textarea
                    placeholder="Criterion description"
                    value={criterion.description}
                    onChange={(e) => updateCriterion(index, 'description', e.target.value)}
                    className="w-full"
                  />
                </CardContent>
              </Card>
            ))}
          </div>
        </ScrollArea>
        <div className="flex justify-between items-center mt-4">
          <Button onClick={addCriterion} variant="outline">
            <Plus className="mr-2 h-4 w-4" /> Add Criterion
          </Button>
          <div className="text-sm font-medium">Total Points: {totalPoints}</div>
        </div>
        <Button onClick={handleConfirm} className="w-full mt-4">
          <Save className="mr-2 h-4 w-4" /> Confirm Rubric
        </Button>
      </DialogContent>
    </Dialog>
  )
}