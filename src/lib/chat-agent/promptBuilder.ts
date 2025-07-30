// src/lib/chat-agent/promptBuilder.ts

import {
  ChatCompletionMessageParam,
  ChatCompletionUserMessageParam,
  ChatCompletionSystemMessageParam
} from 'openai/resources/chat/completions';

interface PromptBuilderParams {
  chatHistory: ChatCompletionMessageParam[];
  userInput: string;
  companyContext: string;
  hiringSummary: string;
  companyName: string;
  naicsCode?: string;
  industry?: string;
  primaryLocation?: string;
  averageWage?: number;
}

function getNextQuestion(
  userTurns: number,
  companyName: string,
  naicsCode?: string,
  industry?: string,
  location?: string,
  wage?: number
): string {
  const wageText = wage ? `Wages here typically start around $${wage}/hr depending on experience.` : '';
  const locationText = location ? ` in ${location}` : '';

  if (userTurns === 0) {
  return `Tell me a bit about the kind of work you've done recently.`;
}

  if (userTurns === 1) {
    return `Any certifications, tickets, or tools you're trained to use that would be good to mention?`;
  }

  if (userTurns === 2) {
    if (naicsCode === '238310' || industry?.toLowerCase().includes('drywall')) {
      return `${companyName} does a lot of commercial drywall and finishing work. Have you ever worked on those kinds of sites?`;
    }
    if (naicsCode?.startsWith('23')) {
      return `${companyName} works on construction projects${locationText}. Have you done any site-based work before?`;
    }
    return `What kind of projects or work environments bring out your best?`;
  }

  if (userTurns === 3) {
    return wageText
      ? `${wageText} What kind of work are you most confident doing?`
      : `Are you looking for full-time, part-time, or flexible work?`;
  }

  return `Looks like we've chatted for a bit — want to leave your contact so someone can follow up?`;
}

export function buildApplyNowPrompt({
  chatHistory,
  userInput,
  companyContext,
  hiringSummary,
  companyName,
  naicsCode,
  industry,
  primaryLocation,
  averageWage
}: PromptBuilderParams): { messages: ChatCompletionMessageParam[] } {
  const userTurns = chatHistory.filter(msg => msg.role === 'user').length;

  const followUpQuestion = getNextQuestion(
    userTurns,
    companyName,
    naicsCode,
    industry,
    primaryLocation,
    averageWage
  );

    const systemPrompt = `
    You are a helpful assistant for a company looking to learn more about job candidates.

    Start the conversation with:
    "${hiringSummary}"

    Use the following company summary as context when evaluating the candidate's fit:
    ${companyContext.trim()}

    Your goals:
    - Ask respectful follow-up questions to understand the person’s work experience, certifications, and interests.
    - If the user’s background seems unrelated to the company’s type of work (based on industry, NAICS code, or company summary), **gently acknowledge this and let them know it might not be a match.** You can still ask if they’ve done anything related or are exploring new fields.
    
    - "I'm here to help with job-related conversations for ${companyName}. Let’s keep things focused on that."

    - You do not need to repeat the company name or industry in every message. Only mention them when useful to ground the conversation.
    - Occasionally refer to the type of work this company does to keep the chat relevant.
    - Do not reference job titles, benefits, or training unless found in the company summary.
    - Do not promise a job or follow-up unless the person shares contact info.

    Current industry: ${industry || 'Unknown'}
    NAICS code: ${naicsCode || 'Unknown'}
    Location: ${primaryLocation || 'Unknown'}

    Ask this next:
    ${followUpQuestion}
    `.trim();

    const messages: ChatCompletionMessageParam[] = [
    {
        role: 'system',
        content: systemPrompt
    } as ChatCompletionSystemMessageParam,
    ...(chatHistory.length === 0
        ? [
            {
            role: 'user',
            content: userInput
            } as ChatCompletionUserMessageParam
        ]
        : [
            ...chatHistory.slice(-5),
            {
            role: 'user',
            content: userInput
            } as ChatCompletionUserMessageParam
        ])
    ];

  return { messages };
}