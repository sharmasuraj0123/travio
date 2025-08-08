'use client'

import { useState, useEffect, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Search as SearchIcon, MapPin, Globe, X } from 'lucide-react'

interface SearchResult {
  id: string
  name: string
  type: 'country' | 'city' | 'landmark'
  coordinates: [number, number]
  description?: string
}

export default function Search() {
  const [isOpen, setIsOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [results, setResults] = useState<SearchResult[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [selectedResult, setSelectedResult] = useState<SearchResult | null>(null)

  // Mock search results - replace with actual API call
  const mockSearchResults: SearchResult[] = [
    {
      id: '1',
      name: 'Paris, France',
      type: 'city',
      coordinates: [2.3522, 48.8566],
      description: 'The City of Light, known for the Eiffel Tower and Louvre Museum'
    },
    {
      id: '2',
      name: 'Tokyo, Japan',
      type: 'city',
      coordinates: [139.6917, 35.6895],
      description: 'A bustling metropolis blending tradition and technology'
    },
    {
      id: '3',
      name: 'New York City, USA',
      type: 'city',
      coordinates: [-74.006, 40.7128],
      description: 'The Big Apple, home to Times Square and Central Park'
    },
    {
      id: '4',
      name: 'Eiffel Tower',
      type: 'landmark',
      coordinates: [2.2945, 48.8584],
      description: 'Iconic iron lattice tower on the Champ de Mars in Paris'
    },
    {
      id: '5',
      name: 'Mount Everest',
      type: 'landmark',
      coordinates: [86.9250, 27.9881],
      description: 'Earth\'s highest mountain above sea level'
    }
  ]

  const handleSearch = async (query: string) => {
    if (!query.trim()) {
      setResults([])
      return
    }

    setIsSearching(true)
    
    // Simulate API delay
    setTimeout(() => {
      const filteredResults = mockSearchResults.filter(result =>
        result.name.toLowerCase().includes(query.toLowerCase()) ||
        result.description?.toLowerCase().includes(query.toLowerCase())
      )
      setResults(filteredResults)
      setIsSearching(false)
    }, 500)
  }

  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      handleSearch(searchQuery)
    }, 300)

    return () => clearTimeout(debounceTimer)
  }, [searchQuery])

  const handleResultSelect = (result: SearchResult) => {
    setSelectedResult(result)
    // In future iterations, this will fly to the location on the map
    console.log(`Selected: ${result.name} at coordinates: ${result.coordinates}`)
    
    // You can emit an event or use a callback to communicate with the map component
    // For now, we'll just close the dialog
    setIsOpen(false)
  }

  const getTypeIcon = (type: SearchResult['type']) => {
    switch (type) {
      case 'country':
        return <Globe className="h-4 w-4" />
      case 'city':
        return <MapPin className="h-4 w-4" />
      case 'landmark':
        return <SearchIcon className="h-4 w-4" />
      default:
        return <MapPin className="h-4 w-4" />
    }
  }

  const getTypeColor = (type: SearchResult['type']) => {
    switch (type) {
      case 'country':
        return 'text-blue-600'
      case 'city':
        return 'text-green-600'
      case 'landmark':
        return 'text-purple-600'
      default:
        return 'text-gray-600'
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 bg-white/20 border-white/30 text-white backdrop-blur-md hover:bg-white/30"
        >
          <SearchIcon className="h-4 w-4 mr-2" />
          Search locations...
        </Button>
      </DialogTrigger>
      
      <DialogContent className="sm:max-w-[600px] max-h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <SearchIcon className="h-5 w-5" />
            Search the World
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 flex flex-col space-y-4">
          {/* Search Input */}
          <div className="relative">
            <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search for countries, cities, landmarks..."
              className="pl-10 pr-10"
            />
            {searchQuery && (
              <Button
                variant="ghost"
                size="icon"
                className="absolute right-2 top-1/2 transform -translate-y-1/2 h-6 w-6"
                onClick={() => setSearchQuery('')}
              >
                <X className="h-3 w-3" />
              </Button>
            )}
          </div>

          {/* Search Results */}
          <div className="flex-1 overflow-y-auto space-y-2">
            {isSearching && (
              <div className="flex items-center justify-center py-8">
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                  <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                </div>
              </div>
            )}

            {!isSearching && results.length === 0 && searchQuery && (
              <div className="text-center py-8 text-gray-500">
                No results found for "{searchQuery}"
              </div>
            )}

            {!isSearching && searchQuery === '' && (
              <div className="text-center py-8 text-gray-500">
                Start typing to search for locations around the world
              </div>
            )}

            {results.map((result) => (
              <div
                key={result.id}
                className="flex items-start space-x-3 p-3 rounded-lg border hover:bg-gray-50 cursor-pointer transition-colors"
                onClick={() => handleResultSelect(result)}
              >
                <div className={`mt-1 ${getTypeColor(result.type)}`}>
                  {getTypeIcon(result.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-medium text-gray-900 truncate">
                    {result.name}
                  </h3>
                  {result.description && (
                    <p className="text-sm text-gray-500 mt-1 line-clamp-2">
                      {result.description}
                    </p>
                  )}
                  <p className="text-xs text-gray-400 mt-1">
                    {result.coordinates[1].toFixed(4)}, {result.coordinates[0].toFixed(4)}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Quick Actions */}
          <div className="border-t pt-4">
            <h4 className="text-sm font-medium text-gray-700 mb-2">Quick Actions</h4>
            <div className="grid grid-cols-2 gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setSearchQuery('Paris')
                  handleSearch('Paris')
                }}
              >
                <MapPin className="h-3 w-3 mr-1" />
                Paris
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setSearchQuery('Tokyo')
                  handleSearch('Tokyo')
                }}
              >
                <MapPin className="h-3 w-3 mr-1" />
                Tokyo
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
} 