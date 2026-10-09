import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { query } = await req.json();

    if (!query) {
      return NextResponse.json({ error: 'Query is required' }, { status: 400 });
    }

    // 1. Fetch live contextual search results using Tavily API
    let searchContext = '';
    const tavilyApiKey = process.env.TAVILY_API_KEY;

    if (tavilyApiKey) {
      const tavilyResponse = await fetch('https://api.tavily.com/search', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          api_key: tavilyApiKey,
          query: `${query} Nigerian university campus student info`,
          search_depth: 'basic',
          max_results: 3,
        }),
      });

      if (tavilyResponse.ok) {
        const tavilyData = await tavilyResponse.json();
        searchContext = tavilyData.results
          ?.map((r: { title: string; content: string }) => `${r.title}: ${r.content}`)
          .join('\n\n');
      }
    }

    // 2. Draft the assistant response (incorporating Tavily context if present)
    const reply = searchContext
      ? `Here is what I found regarding "${query}":\n\n${searchContext}`
      : `I'm your SkoollHub AI assistant. I can help you search for hostel listings, roommate matches, class schedules, or campus updates!`;

    return NextResponse.json({ reply });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'AI processing failed' }, { status: 500 });
  }
}