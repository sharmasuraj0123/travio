import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || '',
})

export async function POST(req: Request) {
  try {
    const { messages, selectedCity, activeSection } = await req.json()

    // Get section-specific context
    const getSectionInstructions = (section: string, city?: string) => {
      const destination = city || 'the destination'
      switch (section) {
        case 'best-time':
          return `Focus specifically on timing information for visiting ${destination}. Include weather patterns, seasons, peak/off-peak periods, festivals, and events. Always mention specific months and what to expect.`
        case 'visa':
          return `Provide comprehensive visa and travel document information for ${destination}. Include application processes, requirements, fees, processing times, and entry restrictions. Be specific about different passport types if relevant.`
        case 'flights':
          return `Focus on flight information for ${destination}. Include major airlines, airports, booking strategies, seasonal price variations, and ground transportation from airports.`
        case 'hotels':
          return `Recommend accommodations in ${destination}. Include various budget ranges, neighborhood guides, booking platforms, amenities, and specific hotel recommendations when possible.`
        case 'itinerary':
          return `Create detailed, practical itineraries for ${destination}. Provide day-by-day plans with timing, transportation between locations, and activity suggestions. Consider different trip lengths.`
        case 'restaurants':
          return `Focus on dining and food experiences in ${destination}. Include local cuisine, must-try dishes, specific restaurant recommendations, dining etiquette, and food safety tips.`
        case 'activities':
          return `Suggest specific places to visit and activities in ${destination}. Include attractions, tours, outdoor activities, cultural experiences, hidden gems, and practical visit information like hours and costs.`
        default:
          return ''
      }
    }

    const sectionInstructions = activeSection ? getSectionInstructions(activeSection, selectedCity) : ''

    // Create a system prompt based on the selected city
    const basePrompt = selectedCity 
      ? `You are a knowledgeable travel assistant specializing in ${selectedCity}. You have deep knowledge about this city's history, culture, attractions, food, transportation, and travel tips.`
      : `You are a helpful travel assistant. You can provide information about cities, countries, landmarks, and travel tips.`

    const systemPrompt = `${basePrompt}

${sectionInstructions}

Always provide detailed, practical, and actionable advice. Be enthusiastic and informative in your responses.`

    const response = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        { role: 'system', content: systemPrompt },
        ...messages
      ],
      temperature: 0.7,
    })

    return Response.json({ 
      content: response.choices[0]?.message?.content || 'Sorry, I could not generate a response.',
      selectedCity,
      activeSection
    })
  } catch (error) {
    console.error('Chat API error:', error)
    return new Response('Error processing chat request', { status: 500 })
  }
} 