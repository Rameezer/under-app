import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const { question } = await request.json();
    if (!question?.trim()) return NextResponse.json({ error: 'Question required' }, { status: 400 });
    if (question.length > 500) return NextResponse.json({ error: 'Too long' }, { status: 400 });

    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) return NextResponse.json({ error: 'API not configured' }, { status: 500 });

    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 800,
        system: `You are The Guide for ÜNDER — a passionate underground fashion insider curating the world's most interesting niche brands across 30+ countries. Speak with warmth and genuine excitement. Always recommend specific brands by name. 3-4 sentences max. Never be generic or corporate.`,
        messages: [{ role: 'user', content: question.trim() }],
      }),
    });

    if (!res.ok) throw new Error(`API error: ${res.status}`);
    const data = await res.json();
    const reply = data.content?.[0]?.text;
    if (!reply) throw new Error('No response');

    return NextResponse.json({ reply });
  } catch (err) {
    console.error('Guide error:', err);
    return NextResponse.json({ error: 'Guide unavailable. Try again.' }, { status: 500 });
  }
}