// ============================================
// IdeaForge - AI Prompts (Senior Level)
// Optimized for: Consistency, Clarity, Actionable Output
// ============================================

export const EVALUATION_PROMPT = (idea) => `
You are a ruthless product evaluator with zero tolerance for vague ideas. Your job is to kill bad ideas and strengthen good ones.

Analyze this idea:
"""
${idea}
"""

Rate it on these 4 criteria (1-10 scale, where 10 = excellent, 1 = terrible):

CRITERION 1 — Problem Validity (1-10)
Ask: Does this problem actually exist in the real world? Has the user felt pain, lost money, wasted time, or felt frustration because of it?
- 1-3: Imaginary problem. User doesn't care.
- 4-6: Minor annoyance. Not painful enough.
- 7-10: Real, sharp, recurring pain. User would pay to remove it.

CRITERION 2 — Market Demand (1-10)
Ask: Would people actively seek this out? Would they pay? Would they tell friends?
- 1-3: "Nice to have." People smile, forget.
- 4-6: Some interest, but not urgent.
- 7-10: "I need this now." Clear willingness to pay or change behavior.

CRITERION 3 — Uniqueness (1-10)
Ask: Is this different from existing solutions? Does it have a distinct angle or advantage?
- 1-3: Direct clone. Done 100 times.
- 4-6: Minor twist. Not memorable.
- 7-10: Unique insight. Different approach. Clear advantage.

CRITERION 4 — Feasibility (1-10)
Ask: Can a student with AI tools build a working demo in 2 days?
- 1-3: Requires 3+ months, team, heavy infra.
- 4-6: Possible but risky. Many unknowns.
- 7-10: Clear scope. Frontend + API. Works in 2 days.

Respond ONLY in this exact JSON format. No extra text. No markdown. No explanations.

{
  "problemValidity": number,
  "marketDemand": number,
  "uniqueness": number,
  "feasibility": number
}
`;

export const REWRITE_PROMPT = (idea, scores, finalScore) => `
Original idea:
"""
${idea}
"""

Current evaluation:
- Problem Validity: ${scores.problemValidity}/10
- Market Demand: ${scores.marketDemand}/10
- Uniqueness: ${scores.uniqueness}/10
- Feasibility: ${scores.feasibility}/10
- Final Score: ${finalScore}/10

Your task: Rewrite this idea to score 10/10 on ALL four criteria.

RULES:
1. Keep the CORE INTENT of the original idea. Don't change what the user cares about.
2. Make it solve a REAL, PAINFUL problem people actually face (not imaginary).
3. Make it something people would PAY FOR or USE WEEKLY (not just "cool").
4. Make it DIFFERENT from existing solutions — add a unique angle or mechanism. Do not just restate the original text with minor wording changes.
5. Make it BUILDABLE in 2 days by a student with AI tools (simple scope).
6. Avoid generic buzzwords. Use concrete language, specific user groups, and clear scenarios of when they would use it.
7. Do NOT copy whole sentences from the original idea. Rewrite them in a sharper, more specific way.
8. Every rewritten idea must feel tailored to THIS specific input. Avoid using a fixed template or repeating the same structure across different ideas.

OUTPUT FORMAT:
Return ONLY the rewritten idea as plain text. No explanations. No JSON. No markdown.
The text must read like a single, tight product pitch (3–7 sentences), not a bullet list.

Example of good output:
"A WhatsApp bot that reminds parents to pay school fees 3 days before deadline, and auto-generates a polite payment request message they can forward."

Now write the rewritten idea:
`;

export const UI_BLUEPRINT_PROMPT = ({ idea, rewrittenIdea }) => `
You are a senior product designer and UX writer.

Given the product idea below, generate a clean, modern UI plan that a student can follow to design screens fast.

Idea (raw):
"""
${idea}
"""

Idea (forged / improved):
"""
${rewrittenIdea || idea}
"""

Return ONLY valid JSON. No markdown. No extra text.

Requirements:
- Keep it simple and practical: 4 to 6 screens max.
- Light theme only. Avoid harsh/dark colors. Prefer soft neutrals + one accent color.
- Each screen must include: purpose, layout (top/middle/bottom), key components, primary CTA, and 1 microcopy example.
- Provide a small design system: colors (hex), typography scale (names only), spacing rules, and component style rules.
- Provide a "first version to build" checklist.

JSON shape:
{
  "productName": string,
  "oneLinePitch": string,
  "targetUsers": [string],
  "primaryUserGoal": string,
  "screens": [
    {
      "name": string,
      "purpose": string,
      "layout": { "top": [string], "middle": [string], "bottom": [string] },
      "keyComponents": [string],
      "primaryCTA": string,
      "microcopy": { "headline": string, "helperText": string }
    }
  ],
  "designSystem": {
    "colors": { "background": string, "surface": string, "text": string, "mutedText": string, "accent": string, "accentSoft": string, "border": string },
    "typography": { "display": string, "h1": string, "h2": string, "body": string, "caption": string },
    "spacingRules": [string],
    "componentRules": [string]
  },
  "firstVersionChecklist": [string]
}
`;

export const DESIGN_PROMPT_PROMPT = ({ idea, rewrittenIdea, blueprint }) => `
You are a principal product designer. Write an extremely high-quality "AI design prompt" that a user can paste into an AI UI generator (or give to a designer) to produce a polished, modern, responsive UI.

Context:
- App name: ${blueprint?.productName || 'IdeaForge concept'}
- One line pitch: ${blueprint?.oneLinePitch || ''}

Product idea (raw):
"""
${idea}
"""

Improved idea:
"""
${rewrittenIdea || idea}
"""

If available, use this screen plan and design system as the source of truth:
${blueprint ? JSON.stringify(blueprint) : '(no blueprint provided)'}

Output rules:
- Return ONLY a single prompt in plain text. No markdown. No JSON.
- Tone: professional, directive, clear and concise (no filler sentences or repeated phrases).
- Must enforce responsive design for: mobile (360–430), tablet (768–1024), laptop (1280), desktop (1440+).
- Must specify layout grid, spacing, typography hierarchy, component behavior, states (loading/empty/error), and accessibility.
- Light theme only. Soft neutrals + one accent color. Avoid harsh/dark colors.
- Include a section telling the generator: "Do NOT add extra features; follow the provided screens."
- Avoid vague wording like \"modern\" or \"beautiful\" without details; describe concrete visual choices instead (e.g., surface colors, corner radius, elevation, density).

The prompt must include:
1) Visual style direction
2) Information architecture / screens (4–6 max)
3) Per-screen layout blocks and key components
4) Component specs (buttons, inputs, cards, navigation, empty states)
5) Responsive behavior rules
6) Accessibility requirements (contrast, focus, keyboard)
7) Microcopy examples (2–4)
8) Final checklist

Now write the final prompt:
`;