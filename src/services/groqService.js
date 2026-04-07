// ============================================
// IdeaForge - Groq API Service (Senior Level)
// Features: Error handling, Fallbacks, Timeout, Retry logic
// ============================================

import { GROQ_API_KEY } from '../config/api';
import { EVALUATION_PROMPT, REWRITE_PROMPT, UI_BLUEPRINT_PROMPT, DESIGN_PROMPT_PROMPT } from '../config/prompts';

const GROQ_URL = 'https://api.groq.com/openai/v1/chat/completions';
const TIMEOUT_MS = 15000; // 15 seconds
const MAX_RETRIES = 2;

// Helper: Fetch with timeout
const fetchWithTimeout = async (url, options, timeout = TIMEOUT_MS) => {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeout);
  
  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal
    });
    clearTimeout(id);
    return response;
  } catch (error) {
    clearTimeout(id);
    if (error.name === 'AbortError') {
      throw new Error('Request timeout. Please check your internet connection.');
    }
    throw error;
  }
};

// Helper: Retry logic
const retry = async (fn, retries = MAX_RETRIES) => {
  for (let i = 0; i <= retries; i++) {
    try {
      return await fn();
    } catch (error) {
      if (i === retries) throw error;
      console.log(`Retry ${i + 1}/${retries} after error:`, error.message);
      await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)));
    }
  }
};

// Default fallback scores (when API fails)
const getFallbackScores = () => ({
  problemValidity: 5,
  marketDemand: 5,
  uniqueness: 5,
  feasibility: 5
});

// Validate and sanitize scores
const validateScores = (parsed) => {
  const scores = {
    problemValidity: Number(parsed.problemValidity),
    marketDemand: Number(parsed.marketDemand),
    uniqueness: Number(parsed.uniqueness),
    feasibility: Number(parsed.feasibility)
  };
  
  // Clamp values between 1-10
  for (const key in scores) {
    if (isNaN(scores[key])) scores[key] = 5;
    scores[key] = Math.min(10, Math.max(1, scores[key]));
  }
  
  return scores;
};

export const evaluateIdea = async (idea) => {
  if (!idea || idea.trim().length < 5) {
    throw new Error('Please enter a valid idea (at least 5 characters).');
  }

  if (!GROQ_API_KEY || GROQ_API_KEY === 'YOUR_GROQ_API_KEY_HERE') {
    throw new Error('API key not configured. Add `VITE_GROQ_API_KEY` to `IdeaForge/.env` (project root) and restart `npm run dev`.');
  }

  return retry(async () => {
    const response = await fetchWithTimeout(GROQ_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${GROQ_API_KEY}`
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        messages: [{ role: 'user', content: EVALUATION_PROMPT(idea) }],
        temperature: 0.3,
        response_format: { type: 'json_object' }
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`API Error ${response.status}: ${errorText}`);
    }

    const data = await response.json();
    const content = data.choices[0].message.content;
    
    // Parse with fallback
    let parsed;
    try {
      parsed = JSON.parse(content);
    } catch (e) {
      console.error('Failed to parse AI response as JSON:', content);
      return getFallbackScores();
    }
    
    return validateScores(parsed);
  });
};

export const rewriteIdea = async (idea, scores, finalScore) => {
  if (!idea || idea.trim().length < 5) {
    throw new Error('Please enter a valid idea (at least 5 characters).');
  }

  if (!GROQ_API_KEY || GROQ_API_KEY === 'YOUR_GROQ_API_KEY_HERE') {
    throw new Error('API key not configured. Add `VITE_GROQ_API_KEY` to `IdeaForge/.env` (project root) and restart `npm run dev`.');
  }

  return retry(async () => {
    const response = await fetchWithTimeout(GROQ_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${GROQ_API_KEY}`
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        messages: [{ role: 'user', content: REWRITE_PROMPT(idea, scores, finalScore) }],
        temperature: 0.7
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`API Error ${response.status}: ${errorText}`);
    }

    const data = await response.json();
    const rewritten = data.choices[0].message.content.trim();
    
    // Return original idea as fallback if rewrite is empty
    if (!rewritten || rewritten.length < 5) {
      console.warn('AI returned empty rewrite, using original idea');
      return idea;
    }
    
    return rewritten;
  });
};

export const generateUiBlueprint = async ({ idea, rewrittenIdea }) => {
  if (!idea || idea.trim().length < 5) {
    throw new Error('Please enter a valid idea (at least 5 characters).');
  }

  if (!GROQ_API_KEY || GROQ_API_KEY === 'YOUR_GROQ_API_KEY_HERE') {
    throw new Error('API key not configured. Add `VITE_GROQ_API_KEY` to `IdeaForge/.env` (project root) and restart `npm run dev`.');
  }

  return retry(async () => {
    const response = await fetchWithTimeout(GROQ_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${GROQ_API_KEY}`
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        messages: [{ role: 'user', content: UI_BLUEPRINT_PROMPT({ idea, rewrittenIdea }) }],
        temperature: 0.4,
        response_format: { type: 'json_object' }
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`API Error ${response.status}: ${errorText}`);
    }

    const data = await response.json();
    const content = data.choices[0].message.content;

    try {
      return JSON.parse(content);
    } catch (e) {
      console.error('Failed to parse UI blueprint JSON:', content);
      throw new Error('Blueprint generation failed. Please try again.');
    }
  });
};

export const generateDesignPrompt = async ({ idea, rewrittenIdea, blueprint }) => {
  if (!idea || idea.trim().length < 5) {
    throw new Error('Please enter a valid idea (at least 5 characters).');
  }

  if (!GROQ_API_KEY || GROQ_API_KEY === 'YOUR_GROQ_API_KEY_HERE') {
    throw new Error('API key not configured. Add `VITE_GROQ_API_KEY` to `IdeaForge/.env` (project root) and restart `npm run dev`.');
  }

  return retry(async () => {
    const response = await fetchWithTimeout(GROQ_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${GROQ_API_KEY}`
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        messages: [{ role: 'user', content: DESIGN_PROMPT_PROMPT({ idea, rewrittenIdea, blueprint }) }],
        temperature: 0.35
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`API Error ${response.status}: ${errorText}`);
    }

    const data = await response.json();
    return data.choices[0].message.content.trim();
  });
};