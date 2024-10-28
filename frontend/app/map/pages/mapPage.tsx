'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import 'leaflet/dist/leaflet.css'
import L from 'leaflet'
import axios from 'axios'
import ChatInterface from '../elements/chatUI'
import { dummyAddressReviewData } from '@/app/utils/dummyData'
import RentalService, { ClarifyRequirementsParams, RentalItem } from '../api'
import FormUI from '../elements/formUI'
import { Loader2 } from "lucide-react"

delete (L.Icon.Default.prototype as any)._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.3.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.3.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.3.1/images/marker-shadow.png',
})

const cities = {
  sanFrancisco: { name: 'San Francisco', position: [37.7749, -122.4194] },
  newYork: { name: 'New York', position: [40.7128, -74.0060] }
}

type Message = {
  id: number
  text: string
  sender: 'user' | 'bot'
}

export const steps = [
  "Understanding requirements",
  "Searching the map",
  "Matching results to requirements",
  "Reading reviews",
  "Comparing prices",
  "Sifting through reviews and resident experiences",
  "Deep diving into the areas",
  "Finalizing results",
  "Almost done!",
  "Couple more seconds...",
  "Really almost finished, keep waiting, it will be worth it!"
]

function MapController({ city, customMarker, zoomLevel }: { city: string; customMarker: [number, number] | null; zoomLevel: number }) {
  const map = useMap()
  React.useEffect(() => {
    if (customMarker) {
      map.setView(customMarker, zoomLevel)
    } else if (city in cities) {
      map.setView(cities[city as keyof typeof cities].position as L.LatLngExpression, 12)
    }
  }, [city, customMarker, map, zoomLevel])
  return null
}

export default function ChatAndLeafletMap() {
  const [selectedCity, setSelectedCity] = useState('sanFrancisco')
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [address, setAddress] = useState('')
  const [customMarker, setCustomMarker] = useState<[number, number] | null>(null)
  const [zoomLevel, setZoomLevel] = useState<number>(12)
  const [addressReviewIndex, setAddressReviewIndex] = useState<number | null>(null)
  const [isAddressReviewActive, setIsAddressReviewActive] = useState(false)
  const [addressReviewStep, setAddressReviewStep] = useState(0)
  const [initialRender, setInitialRender] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState<ClarifyRequirementsParams | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [apiResults, setApiResults] = useState<RentalItem[]>([])
  const [markers, setMarkers] = useState<{ position: [number, number]; popup: string }[]>([])
  const [loadingSteps, setLoadingSteps] = useState<string[]>([])

  useEffect(() => {
    // Set default city to San Francisco when component mounts
    moveToCity('sanFrancisco')
  }, [])

  useEffect(() => {
    setInitialRender(false)
  }, [])

  useEffect(() => {
    if (isAddressReviewActive) {
      const interval = setInterval(() => {
        setAddressReviewStep((prevStep) => {
          if (prevStep >= 10) { // Change this from 11 to 10
            clearInterval(interval)
            return prevStep
          }
          return prevStep + 1
        })
      }, 2000)

      return () => clearInterval(interval)
    }
  }, [isAddressReviewActive])

  useEffect(() => {
    if (isAddressReviewActive && addressReviewStep < 3 && addressReviewStep >= 0) {
      const currentPlace = dummyAddressReviewData.places[addressReviewStep]
      if (currentPlace) {
        handlePlaceRequest(currentPlace.address)
      }
    }
  }, [addressReviewStep, isAddressReviewActive])

  const handleSend = async (input: string) => {
    if (input.trim()) {
      const newMessage: Message = { id: Date.now(), text: input, sender: 'user' }
      setMessages(prevMessages => [...prevMessages, newMessage])
      
      // Show the form when a user sends a message
      setShowForm(true)

      if (input.toLowerCase() === 'address_review') {
        setIsAddressReviewActive(true)
        setAddressReviewStep(0)
      } else if (input.toLowerCase().includes('san francisco')) {
        moveToCity('sanFrancisco')
      } else if (input.toLowerCase().includes('new york')) {
        moveToCity('newYork')
      } else if (input.toLowerCase().startsWith('go to ')) {
        const addressToSearch = input.slice(6).trim()
        handlePlaceRequest(addressToSearch)
      }
    }
  }

  const handlePlaceRequest = async (place: string) => {
    setAddress(place)
    if (place.trim()) {
      try {
        const response = await axios.get(`https://nominatim.openstreetmap.org/search`, {
          params: {
            q: place,
            format: 'json',
            limit: 1,
          },
        })
        if (response.data && response.data.length > 0) {
          const { lat, lon } = response.data[0]
          setCustomMarker([parseFloat(lat), parseFloat(lon)])
          setSelectedCity('')
          setZoomLevel(16)
        } else {
          console.error('Place not found')
          // You might want to add some user feedback here
        }
      } catch (error) {
        console.error('Error geocoding place:', error)
        // You might want to add some user feedback here
      }
    }
  }

  const moveToCity = (city: 'sanFrancisco' | 'newYork') => {
    setSelectedCity(city)
    setCustomMarker(null)
  }

  const handleFormSubmit = useCallback(async (data: ClarifyRequirementsParams) => {
    setFormData(data)
    setShowForm(false)
    setIsLoading(true)
    setAddressReviewStep(0)
    setLoadingSteps([])

    try {
      for (let i = 0; i < 11; i++) {
        await new Promise(resolve => setTimeout(resolve, 5000))
        setAddressReviewStep(prevStep => prevStep + 1)
        setLoadingSteps(prevSteps => [...prevSteps, steps[i]])
      }

      const results = await RentalService.clarifyRequirements(data)
      setApiResults(results)
      console.log(results)
      setAddressReviewStep(11)
      setLoadingSteps(prevSteps => [...prevSteps, "Results received!"])

      // Add markers for all results
      const newMarkers = await Promise.all(results.map(async (result) => {
        const geocodeResponse = await axios.get(`https://nominatim.openstreetmap.org/search`, {
          params: {
            q: result.address,
            format: 'json',
            limit: 1,
          },
        })
        if (geocodeResponse.data && geocodeResponse.data.length > 0) {
          const { lat, lon } = geocodeResponse.data[0]
          return {
            position: [parseFloat(lat), parseFloat(lon)] as [number, number],
            popup: result.address
          }
        }
        return null
      }))
      setMarkers(newMarkers.filter((marker): marker is { position: [number, number]; popup: string } => marker !== null))
    } finally {
      setIsLoading(false)
    }
  }, [])

  return (
    <div className="flex h-screen">
      {/* Chat Interface */}
      <div className="w-1/3 p-4 border-r">
        <ChatInterface 
          onSendMessage={handleSend}
          currentLocation={customMarker ? `${customMarker[0]}, ${customMarker[1]}` : cities[selectedCity as keyof typeof cities].name}
          onPlaceRequest={handlePlaceRequest}
          messages={messages}
          isLoading={isLoading}
          addressReviewStep={addressReviewStep}
          showForm={showForm}
          onFormSubmit={handleFormSubmit}
          apiResults={apiResults}
          loadingSteps={loadingSteps}
        />
      </div>

      {/* Map */}
      <div className="w-2/3">
        <MapContainer center={cities.sanFrancisco.position as L.LatLngExpression} zoom={12} style={{ height: '100%', width: '100%' }}>
          <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
          <MapController city={selectedCity} customMarker={customMarker} zoomLevel={zoomLevel} />
          {markers.map((marker, index) => (
            <Marker key={index} position={marker.position}>
              <Popup>{marker.popup}</Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>
    </div>
  )
}
