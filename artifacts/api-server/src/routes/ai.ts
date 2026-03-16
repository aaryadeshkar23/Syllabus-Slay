import { Router, type IRouter, type Request, type Response } from "express";
import { openai } from "@workspace/integrations-openai-ai-server";
import {
  SummarizeContentBody,
  GenerateFlashcardsBody,
  GenerateQuizBody,
  GenerateMindMapBody,
  GenerateStudyPlanBody,
  ExplainConceptBody,
  ChatWithAIBody,
} from "@workspace/api-zod";

const router: IRouter = Router();

const SYSTEM_PROMPT = `You are an expert AI study assistant for 'Slay The Syllabus'. 
You help students learn faster with clear, accurate, and engaging explanations.
Always respond with valid JSON matching the requested format exactly.`;

async function callAI(prompt: string, systemPrompt?: string): Promise<string> {
  const response = await openai.chat.completions.create({
    model: "gpt-5.2",
    max_completion_tokens: 8192,
    messages: [
      { role: "system", content: systemPrompt || SYSTEM_PROMPT },
      { role: "user", content: prompt },
    ],
    response_format: { type: "json_object" },
  });
  return response.choices[0]?.message?.content ?? "{}";
}

router.get("/joke", async (_req: Request, res: Response) => {
  try {
    const result = await callAI(
      `Generate a funny study/education related joke. Return JSON with exactly:
{ "joke": "setup of the joke", "punchline": "the punchline" }
Make it witty and relatable for students.`
    );
    res.json(JSON.parse(result));
  } catch (err: unknown) {
    console.error("[joke error]", err);
    res.json({
      joke: "Why did the student eat his homework?",
      punchline: "Because the teacher told him it was a piece of cake!",
    });
  }
});

router.post("/summarize", async (req: Request, res: Response) => {
  try {
    const body = SummarizeContentBody.safeParse(req.body);
    if (!body.success) {
      res.status(400).json({ error: "validation_error", message: body.error.message });
      return;
    }

    const { content, type, language } = body.data;

    const typeInstructions: Record<string, string> = {
      short: "Write a concise 2-3 paragraph summary covering the most important points.",
      bullets: "Create a bullet-point summary with the top 8-12 key points.",
      exam_notes: "Create comprehensive exam revision notes with headers and important terms highlighted.",
      key_concepts: "Extract the 6-10 most important concepts, each with a brief explanation.",
      formulas: "Extract all formulas, equations, and mathematical/scientific expressions with explanations.",
    };

    const langInstruction = language && language !== "en"
      ? `Translate the entire response to ${language}.`
      : "";

    const prompt = `Analyze this educational content and generate a ${type} summary.
${typeInstructions[type] || typeInstructions.short}
${langInstruction}

CONTENT:
${content.slice(0, 6000)}

Return valid JSON exactly matching this structure:
{
  "summary": "The full summary text here",
  "keyPoints": ["point 1", "point 2", "point 3", ...],
  "definitions": [
    {"term": "term name", "definition": "its definition"},
    ...
  ]
}`;

    const result = await callAI(prompt);
    const parsed = JSON.parse(result);
    res.json({
      summary: parsed.summary || "",
      keyPoints: parsed.keyPoints || [],
      definitions: parsed.definitions || [],
    });
  } catch (err: unknown) {
    console.error("[summarize error]", err);
    res.status(500).json({ error: "ai_error", message: "Failed to generate summary. Please try again." });
  }
});

router.post("/flashcards", async (req: Request, res: Response) => {
  try {
    const body = GenerateFlashcardsBody.safeParse(req.body);
    if (!body.success) {
      res.status(400).json({ error: "validation_error", message: body.error.message });
      return;
    }

    const { content, count = 10 } = body.data;

    const prompt = `Create exactly ${Math.min(count, 20)} high-quality flashcards from this educational content.
Each flashcard should test an important concept, fact, term, or formula.

CONTENT:
${content.slice(0, 5000)}

Return valid JSON exactly:
{
  "flashcards": [
    {"id": "1", "front": "Question or term here?", "back": "Answer or definition here"},
    ...
  ]
}`;

    const result = await callAI(prompt);
    const parsed = JSON.parse(result);
    res.json({ flashcards: parsed.flashcards || [] });
  } catch (err: unknown) {
    console.error("[flashcards error]", err);
    res.status(500).json({ error: "ai_error", message: "Failed to generate flashcards. Please try again." });
  }
});

router.post("/quiz", async (req: Request, res: Response) => {
  try {
    const body = GenerateQuizBody.safeParse(req.body);
    if (!body.success) {
      res.status(400).json({ error: "validation_error", message: body.error.message });
      return;
    }

    const { content, difficulty, questionType, count = 5 } = body.data;

    const typeInstructions: Record<string, string> = {
      mcq: `Multiple choice questions with 4 options (A, B, C, D). The "options" array should have exactly 4 strings.`,
      truefalse: `True/False questions. The "options" array should be ["True", "False"]. correctAnswer must be "True" or "False".`,
      fillinblank: `Fill-in-the-blank questions where key terms are removed. The "options" array should be empty [].`,
      short: `Short answer questions. The "options" array should be empty [].`,
    };

    const difficultyInstructions: Record<string, string> = {
      easy: "basic recall and understanding questions",
      medium: "application and analysis questions",
      hard: "synthesis and evaluation questions",
      exam: "high-stakes exam-level questions covering edge cases and deep understanding",
    };

    const prompt = `Generate exactly ${Math.min(count, 15)} ${difficulty} difficulty quiz questions about this content.
Question type: ${typeInstructions[questionType]}
Difficulty level: ${difficultyInstructions[difficulty]}

CONTENT:
${content.slice(0, 5000)}

Return valid JSON exactly:
{
  "questions": [
    {
      "id": "1",
      "question": "Question text here?",
      "type": "${questionType}",
      "options": ["option A", "option B", "option C", "option D"],
      "correctAnswer": "The correct answer",
      "explanation": "Detailed explanation of why this is correct"
    },
    ...
  ]
}`;

    const result = await callAI(prompt);
    const parsed = JSON.parse(result);
    res.json({ questions: parsed.questions || [] });
  } catch (err: unknown) {
    console.error("[quiz error]", err);
    res.status(500).json({ error: "ai_error", message: "Failed to generate quiz. Please try again." });
  }
});

router.post("/mindmap", async (req: Request, res: Response) => {
  try {
    const body = GenerateMindMapBody.safeParse(req.body);
    if (!body.success) {
      res.status(400).json({ error: "validation_error", message: body.error.message });
      return;
    }

    const { content } = body.data;

    const prompt = `Create a hierarchical mind map structure for this educational content.
The mind map should have:
- 1 central topic (the main subject)
- 4-6 main branches (major topics/themes)
- Each branch should have 2-4 sub-topics

CONTENT:
${content.slice(0, 4000)}

Return valid JSON exactly:
{
  "title": "Main Topic Title",
  "root": {
    "id": "root",
    "label": "Main Topic",
    "children": [
      {
        "id": "branch1",
        "label": "First Main Topic",
        "children": [
          {"id": "sub1-1", "label": "Subtopic 1", "children": []},
          {"id": "sub1-2", "label": "Subtopic 2", "children": []}
        ]
      }
    ]
  }
}`;

    const result = await callAI(prompt);
    const parsed = JSON.parse(result);
    res.json({ root: parsed.root, title: parsed.title || "Mind Map" });
  } catch (err: unknown) {
    console.error("[mindmap error]", err);
    res.status(500).json({ error: "ai_error", message: "Failed to generate mind map. Please try again." });
  }
});

router.post("/studyplan", async (req: Request, res: Response) => {
  try {
    const body = GenerateStudyPlanBody.safeParse(req.body);
    if (!body.success) {
      res.status(400).json({ error: "validation_error", message: body.error.message });
      return;
    }

    const { syllabus, examDate, hoursPerDay } = body.data;

    const today = new Date();
    const exam = new Date(examDate);
    const daysUntilExam = Math.max(1, Math.ceil((exam.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)));
    const planDays = Math.min(daysUntilExam, 30);

    const prompt = `Create a ${planDays}-day study plan for a student with ${hoursPerDay} hours per day.
Exam date: ${examDate} (${daysUntilExam} days from today)

SYLLABUS:
${syllabus.slice(0, 3000)}

Generate a realistic, balanced study plan. Include review days and buffer time before the exam.
Return valid JSON exactly:
{
  "plan": [
    {
      "day": 1,
      "date": "YYYY-MM-DD",
      "topics": ["Topic 1", "Topic 2"],
      "hours": ${hoursPerDay},
      "activities": ["Read chapter 1", "Create flashcards", "Practice problems"]
    }
  ],
  "totalDays": ${planDays},
  "tips": ["Study tip 1", "Study tip 2", "Study tip 3"]
}`;

    const result = await callAI(prompt);
    const parsed = JSON.parse(result);
    res.json({
      plan: parsed.plan || [],
      totalDays: parsed.totalDays || planDays,
      tips: parsed.tips || [],
    });
  } catch (err: unknown) {
    console.error("[studyplan error]", err);
    res.status(500).json({ error: "ai_error", message: "Failed to generate study plan. Please try again." });
  }
});

router.post("/explain", async (req: Request, res: Response) => {
  try {
    const body = ExplainConceptBody.safeParse(req.body);
    if (!body.success) {
      res.status(400).json({ error: "validation_error", message: body.error.message });
      return;
    }

    const { concept, level } = body.data;

    const levelInstructions: Record<string, string> = {
      eli5: "Explain like the person is 5 years old. Use very simple words, fun analogies, and relatable everyday examples.",
      beginner: "Explain for a beginner with no prior knowledge. Avoid jargon. Use clear language and simple examples.",
      intermediate: "Explain for someone with some background knowledge. Use proper terminology with definitions.",
      advanced: "Give a deep, technical, exam-level explanation covering edge cases, nuances, and advanced applications.",
    };

    const prompt = `Explain this concept: "${concept}"
Level: ${levelInstructions[level]}

Return valid JSON exactly:
{
  "explanation": "Full explanation text here",
  "level": "${level}",
  "examples": ["Example 1", "Example 2", "Example 3"],
  "analogy": "A helpful analogy or comparison to understand this concept"
}`;

    const result = await callAI(prompt);
    const parsed = JSON.parse(result);
    res.json({
      explanation: parsed.explanation || "",
      level: parsed.level || level,
      examples: parsed.examples || [],
      analogy: parsed.analogy || "",
    });
  } catch (err: unknown) {
    console.error("[explain error]", err);
    res.status(500).json({ error: "ai_error", message: "Failed to explain concept. Please try again." });
  }
});

router.post("/chat", async (req: Request, res: Response) => {
  try {
    const body = ChatWithAIBody.safeParse(req.body);
    if (!body.success) {
      res.status(400).json({ error: "validation_error", message: body.error.message });
      return;
    }

    const { messages, context } = body.data;

    const systemMsg = context
      ? `You are a helpful AI study assistant. The student is currently studying the following material:\n\n${context.slice(0, 2000)}\n\nAnswer their questions clearly and helpfully. Return valid JSON.`
      : `You are a helpful AI study assistant for 'Slay The Syllabus'. Answer student questions clearly, step-by-step. Return valid JSON.`;

    const chatMessages = [
      { role: "system" as const, content: systemMsg },
      ...messages.map((m: { role: string; content: string }) => ({
        role: m.role as "user" | "assistant",
        content: m.content,
      })),
      {
        role: "user" as const,
        content: `Please respond to the conversation above and return JSON:
{
  "reply": "Your detailed, helpful response here",
  "suggestions": ["Follow-up question 1?", "Follow-up question 2?", "Follow-up question 3?"]
}`,
      },
    ];

    const response = await openai.chat.completions.create({
      model: "gpt-5.2",
      max_completion_tokens: 8192,
      messages: chatMessages,
      response_format: { type: "json_object" },
    });

    const result = response.choices[0]?.message?.content ?? "{}";
    const parsed = JSON.parse(result);
    res.json({
      reply: parsed.reply || "I'm here to help! Could you clarify your question?",
      suggestions: parsed.suggestions || [],
    });
  } catch (err: unknown) {
    console.error("[chat error]", err);
    res.status(500).json({ error: "ai_error", message: "AI is thinking hard... Please try again." });
  }
});

export default router;
