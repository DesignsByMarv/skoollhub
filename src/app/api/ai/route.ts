import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { query } = await req.json();

    if (!query || !query.trim()) {
      return NextResponse.json({ error: 'Query is required' }, { status: 400 });
    }

    const tavilyApiKey = process.env.TAVILY_API_KEY;
    let searchResults: Array<{ title: string; content: string; url: string }> = [];

    if (tavilyApiKey) {
      try {
        const tavilyResponse = await fetch('https://api.tavily.com/search', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            api_key: tavilyApiKey,
            query: `${query} Nigerian university campus student`,
            search_depth: 'basic',
            max_results: 3,
          }),
        });

        if (tavilyResponse.ok) {
          const tavilyData = await tavilyResponse.json();
          searchResults = tavilyData.results || [];
        }
      } catch (err) {
        console.error('Tavily search error:', err);
      }
    }

    // Format final response based on search results or fallback logic
    let reply = '';

    if (searchResults.length > 0) {
      const formattedContext = searchResults
        .map((item) => `• **${item.title}**\n${item.content}`)
        .join('\n\n');

      reply = `Here is the latest campus & web information for **"${query}"**:\n\n${formattedContext}`;
    } else {
      // Intelligent campus fallback responses if search API key isn't present or returned empty
      reply = `I processed your request for **"${query}"** on SkoollHub.\n\n` +
        `• **Hostels & Housing:** You can filter off-campus listings around your campus in the Hostels tab.\n` +
        `• **Roommates:** Match with verified students based on budget and lifestyle in the Roommates section.\n` +
        `• **Campus Updates:** Check the top stories and feeds for live announcements!`;
    }

    return NextResponse.json({ reply });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'AI processing failed' }, { status: 500 });
  }
}