import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || '',
})

export async function POST(req: Request) {
  try {
    const { messages, selectedCity } = await req.json()

    // Create a system prompt based on the selected city
    const systemPrompt = selectedCity 
      ? `You are a knowledgeable travel assistant for the city of ${selectedCity}. You have deep knowledge about this city's history, culture, attractions, food, transportation, and travel tips. When users ask questions, provide detailed, helpful information about ${selectedCity}. 

When users ask about booking a trip or travel planning to ${selectedCity}, provide comprehensive suggestions including:
- Flight options and airlines that serve ${selectedCity}
- Best times to book flights for better prices
- Recommended airports and transportation from airports
- Accommodation suggestions (hotels, hostels, vacation rentals)
- Local transportation options (public transit, car rentals, rideshare)
- Travel insurance recommendations
- Visa/documentation requirements if applicable
- Currency and payment methods
- Weather considerations for trip timing
- Essential items to pack
- Estimated budget ranges for different travel styles

If they ask about other places, politely redirect them to ask about ${selectedCity} or suggest they click on a different city on the globe. Be enthusiastic and informative about ${selectedCity}.`
      : `You are a helpful travel assistant. You can provide information about cities, countries, landmarks, and travel tips. When users ask about specific places, give them detailed, helpful information.

When users ask about booking a trip or travel planning, provide comprehensive suggestions including:
- Flight search recommendations and major airlines
- Best booking platforms and apps
- Tips for finding better flight deals
- Airport and transportation information
- Accommodation options and booking platforms
- Local transportation suggestions
- Travel insurance advice
- Documentation and visa requirements
- Currency exchange and payment methods
- Weather and seasonal considerations
- Packing recommendations
- Budget planning for different travel styles
- Travel safety tips

Always provide practical, actionable advice to help users plan their trips effectively.`

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
      selectedCity 
    })
  } catch (error) {
    console.error('Chat API error:', error)
    return new Response('Error processing chat request', { status: 500 })
  }
} 