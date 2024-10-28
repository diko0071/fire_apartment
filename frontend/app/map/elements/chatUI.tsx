import React, { useState, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Loader2, Check } from "lucide-react"
import FormUI from './formUI'
import { ClarifyRequirementsParams, RentalItem } from '../api'
import { steps } from '../pages/mapPage'  // Import steps from mapPage

type Message = {
  id: number
  text: string
  sender: 'user' | 'bot'
}

interface ChatInterfaceProps {
  onSendMessage: (message: string) => void
  currentLocation: string
  onPlaceRequest: (place: string) => void
  messages: Message[]
  addressReviewStep: number
  showForm: boolean
  onFormSubmit: (data: ClarifyRequirementsParams) => void
  apiResults: RentalItem[]
  isLoading: boolean
  loadingSteps: string[]
}

export default function ChatInterface({ 
  onSendMessage, 
  currentLocation, 
  onPlaceRequest, 
  messages, 
  addressReviewStep,
  showForm,
  onFormSubmit,
  apiResults,
  isLoading,
  loadingSteps
}: ChatInterfaceProps) {
  const [input, setInput] = useState('')
  const [budgetWarning, setBudgetWarning] = useState(false)

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault()
    if (input.trim()) {
      onSendMessage(input)
      setInput('')
    }
  }

  const handleFormSubmit = (data: ClarifyRequirementsParams) => {
    if (parseInt(data.budget) < 2000) {
      setBudgetWarning(true)
    } else {
      setBudgetWarning(false)
      onFormSubmit(data)
    }
  }

  const renderAddressReview = () => {
    return (
      <div className="mb-4 p-2 rounded-lg bg-muted">
        {loadingSteps.map((step, index) => (
          <div key={index} className="flex items-center mb-2">
            {index === loadingSteps.length - 1 && isLoading ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Check className="mr-2 h-4 w-4 text-green-500" />
            )}
            <span className="text-black">{step}</span>
          </div>
        ))}
      </div>
    )
  }

  const renderApiResults = () => {
    if (apiResults.length > 0) {
      return (
        <div className="mb-4 p-2 rounded-lg bg-muted">
          <h3 className="font-bold mb-2">Rental Suggestions:</h3>
          {apiResults.map((result, index) => (
            <div key={index} className="mb-2">
              <p><strong>Address:</strong> {result.address}</p>
              <p><strong>Reason:</strong> {result.reason}</p>
              <p><strong>Score:</strong> {result.score}</p>
              <p><strong>Review Summary:</strong> {result.summary_of_review}</p>
            </div>
          ))}
        </div>
      )
    }
    return null
  }

  return (
    <div className="w-full h-full flex flex-col">
      <div className="mb-4">Current location: {currentLocation}</div>
      <ScrollArea className="flex-grow">
        {messages.map(message => (
          <div
            key={message.id}
            className={`mb-4 p-2 rounded-lg ${
              message.sender === 'user' ? 'bg-primary text-primary-foreground ml-auto' : 'bg-muted'
            } max-w-[80%]`}
          >
            {message.text.split('\n').map((line, index) => (
              <p key={index}>{line}</p>
            ))}
          </div>
        ))}
        {renderAddressReview()}
        {renderApiResults()}
        {showForm && <FormUI onSubmit={handleFormSubmit} />}
      </ScrollArea>
      <form onSubmit={handleSend} className="mt-4 flex">
        <Input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type a message..."
          className="flex-grow"
        />
        <Button type="submit" className="ml-2">Send</Button>
      </form>
    </div>
  )
}
