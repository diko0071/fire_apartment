'use client'

import { useState } from 'react'
import { Calendar } from '@/components/ui/calendar'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Slider } from '@/components/ui/slider'
import { Button } from '@/components/ui/button'
import { CalendarIcon } from 'lucide-react'
import { format } from 'date-fns'
import { ClarifyRequirementsParams } from '../api'

interface FormUIProps {
  onSubmit: (data: ClarifyRequirementsParams) => void
}

export default function FormUI({ onSubmit }: FormUIProps) {
  const [budget, setBudget] = useState(2000)
  const [budgetError, setBudgetError] = useState(false)
  const [moveInDate, setMoveInDate] = useState<Date>()
  const [familySize, setFamilySize] = useState(1)
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>([])

  const amenities = [
    { id: 'gym', label: 'Gym' },
    { id: 'bbq', label: 'BBQ Zone' },
    { id: 'pool', label: 'Swimming Pool' },
    { id: 'parking', label: 'Covered Parking' },
    { id: 'laundry', label: 'In-unit Laundry' },
    { id: 'pet-friendly', label: 'Pet-friendly' },
    { id: 'balcony', label: 'Balcony/Patio' },
  ]

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (budget < 2000) {
      setBudgetError(true)
      return
    }
    setBudgetError(false)
    onSubmit({
      budget: budget.toString(),
      amenities: selectedAmenities,
      moveInDate: moveInDate ? format(moveInDate, 'yyyy-MM-dd') : '',
      familySize: familySize
    })
  }

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Apartment Search Form</CardTitle>
      </CardHeader>
      <CardContent className="space-y-8">
        <form onSubmit={handleSubmit}>
          <div className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="budget">Monthly Budget</Label>
              <div className="flex items-center space-x-4">
                <Slider
                  id="budget"
                  min={500}
                  max={5000}
                  step={100}
                  value={[budget]}
                  onValueChange={(value) => {
                    setBudget(value[0])
                    setBudgetError(value[0] < 3000)
                  }}
                  className="flex-grow"
                />
                <span className="font-semibold">${budget}</span>
              </div>
              {budgetError && (
                <p className="text-red-500 text-sm mt-1">
              You forget where are you searching? It is San Francisco, you can't put less than $3000.
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label>Amenities</Label>
              <div className="grid grid-cols-2 gap-4">
                {amenities.map((amenity) => (
                  <div key={amenity.id} className="flex items-center space-x-2">
                    <Checkbox 
                      id={amenity.id} 
                      checked={selectedAmenities.includes(amenity.id)}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          setSelectedAmenities([...selectedAmenities, amenity.id])
                        } else {
                          setSelectedAmenities(selectedAmenities.filter(id => id !== amenity.id))
                        }
                      }}
                    />
                    <Label htmlFor={amenity.id}>{amenity.label}</Label>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="family-size">Family Size</Label>
              <Input 
                id="family-size" 
                type="number" 
                min={1} 
                value={familySize}
                onChange={(e) => setFamilySize(parseInt(e.target.value))}
                placeholder="Enter family size" 
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="move-in-date">Move-in Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={`w-full justify-start text-left font-normal ${!moveInDate && 'text-muted-foreground'}`}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {moveInDate ? format(moveInDate, 'PPP') : 'Select move-in date'}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={moveInDate}
                    onSelect={setMoveInDate}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            <Button type="submit" className="w-full mt-6" disabled={budgetError}>
              Search Apartments
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
