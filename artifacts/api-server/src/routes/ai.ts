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
You MUST always respond with valid, parseable JSON matching the requested format exactly. No extra text before or after the JSON.`;

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

async function getYouTubeTranscript(url: string): Promise<string> {
  // Extract video ID from URL
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/,
    /youtube\.com\/shorts\/([^&\n?#]+)/,
  ];
  let videoId = "";
  for (const pat of patterns) {
    const m = url.match(pat);
    if (m) { videoId = m[1]; break; }
  }
  if (!videoId) throw new Error("Could not extract YouTube video ID from URL");

  // Use the YouTube transcript API (no auth needed for public videos with auto-captions)
  const apiUrl = `https://www.youtube.com/watch?v=${videoId}`;
  const response = await fetch(apiUrl, {
    headers: { "User-Agent": "Mozilla/5.0 (compatible; bot)" }
  });
  const html = await response.text();

  // Extract captions URL from YouTube's inline JSON
  const captionsMatch = html.match(/"captionTracks":\[.*?"baseUrl":"(.*?)"/);
  if (!captionsMatch) {
    throw new Error("No transcript available for this video. Please try a video with subtitles/captions enabled.");
  }

  const captionsUrl = captionsMatch[1].replace(/\\u0026/g, "&").replace(/\\\//g, "/");
  const captionsResponse = await fetch(captionsUrl);
  const captionsXml = await captionsResponse.text();

  // Parse XML captions into plain text
  const textMatches = captionsXml.matchAll(/<text[^>]*>(.*?)<\/text>/gs);
  const lines: string[] = [];
  for (const m of textMatches) {
    const text = m[1]
      .replace(/&amp;/g, "&")
      .replace(/&lt;/g, "<")
      .replace(/&gt;/g, ">")
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'")
      .replace(/<[^>]*>/g, "")
      .trim();
    if (text) lines.push(text);
  }

  if (lines.length === 0) throw new Error("Transcript is empty. Try a different video.");
  return lines.join(" ");
}

// YouTube transcript endpoint
router.post("/youtube", async (req: Request, res: Response) => {
  try {
    const { url } = req.body;
    if (!url || typeof url !== "string") {
      res.status(400).json({ error: "validation_error", message: "A YouTube URL is required." });
      return;
    }

    let transcript: string;
    try {
      transcript = await getYouTubeTranscript(url);
    } catch (transcriptErr: unknown) {
      const msg = transcriptErr instanceof Error ? transcriptErr.message : "Failed to fetch transcript";
      res.status(422).json({ error: "transcript_error", message: msg });
      return;
    }

    // Generate comprehensive notes from the transcript
    const prompt = `You are analyzing a YouTube lecture transcript. Extract structured study material.

TRANSCRIPT (first 5000 chars):
${transcript.slice(0, 5000)}

Return valid JSON:
{
  "title": "Video/Lecture Title (inferred from content)",
  "summary": "3-4 paragraph comprehensive summary of the lecture",
  "keyPoints": ["Key point 1", "Key point 2", "...up to 10 key points"],
  "concepts": ["Important concept 1", "Important concept 2", "..."],
  "transcript_excerpt": "First 200 characters of the transcript for preview"
}`;

    const result = await callAI(prompt);
    const parsed = JSON.parse(result);
    res.json({
      title: parsed.title || "YouTube Lecture",
      summary: parsed.summary || "",
      keyPoints: parsed.keyPoints || [],
      concepts: parsed.concepts || [],
      transcript_excerpt: transcript.slice(0, 200),
      full_transcript: transcript.slice(0, 8000), // For subsequent feature use
    });
  } catch (err: unknown) {
    console.error("[youtube error]", err);
    res.status(500).json({ error: "youtube_error", message: "Failed to process YouTube video. Please try again." });
  }
});

router.get("/joke", async (_req: Request, res: Response) => {
  try {
    const result = await callAI(
      `Generate a funny study/education related joke. Return JSON:
{ "joke": "The setup of the joke (WITHOUT the punchline)", "punchline": "The funny punchline" }
Make it witty and relatable for students. Keep the joke setup under 15 words.`
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
      bullets: "Create a bullet-point summary with the top 8-12 key points in simple language.",
      exam_notes: "Create comprehensive exam revision notes with headers and important terms highlighted.",
      key_concepts: "Extract the 6-10 most important concepts, each with a brief explanation.",
      formulas: "Extract all formulas, equations, and mathematical/scientific expressions with explanations.",
    };

    const langInstruction = language && language !== "en"
      ? `IMPORTANT: Translate ALL output text (summary, key points, definitions) to ${language} language.`
      : "";

    const prompt = `Analyze this educational content and generate study material.
Task: ${typeInstructions[type] || typeInstructions.short}
${langInstruction}

CONTENT TO ANALYZE:
${content.slice(0, 6000)}

Return valid JSON with EXACTLY this structure (no extra fields):
{
  "summary": "The complete summary text here (2-4 paragraphs or bullet list depending on type)",
  "keyPoints": ["Point 1", "Point 2", "Point 3", "Point 4", "Point 5"],
  "definitions": [
    {"term": "Term Name", "definition": "Clear definition of this term"},
    {"term": "Another Term", "definition": "Its definition"}
  ]
}`;

    const result = await callAI(prompt);
    const parsed = JSON.parse(result);
    res.json({
      summary: parsed.summary || "Could not generate summary. Please try again.",
      keyPoints: Array.isArray(parsed.keyPoints) ? parsed.keyPoints : [],
      definitions: Array.isArray(parsed.definitions) ? parsed.definitions : [],
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
    const cardCount = Math.min(count, 20);

    const prompt = `Create EXACTLY ${cardCount} high-quality flashcards from the educational content below.
Each flashcard should:
- Test ONE specific concept, definition, fact, formula, or relationship
- Have a clear concise QUESTION on the front
- Have a complete accurate ANSWER on the back (1-3 sentences max)

EDUCATIONAL CONTENT:
${content.slice(0, 5000)}

You MUST return EXACTLY ${cardCount} flashcards. Return valid JSON:
{
  "flashcards": [
    {"id": "1", "front": "What is [concept]?", "back": "Clear answer here."},
    {"id": "2", "front": "Define [term].", "back": "Definition here."},
    {"id": "3", "front": "How does [process] work?", "back": "Explanation here."}
  ]
}`;

    const result = await callAI(prompt);
    const parsed = JSON.parse(result);
    const flashcards = Array.isArray(parsed.flashcards) ? parsed.flashcards : [];
    res.json({ flashcards: flashcards.map((f: { front?: string; back?: string }, i: number) => ({
      id: String(i + 1),
      front: f.front || `Card ${i + 1}`,
      back: f.back || "No answer available"
    })) });
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
    const questionCount = Math.min(count, 15);

    const difficultyInstructions: Record<string, string> = {
      easy: "basic recall and understanding — factual questions",
      medium: "application and analysis — require understanding relationships",
      hard: "synthesis and evaluation — complex multi-step reasoning",
      exam: "high-stakes exam-level — edge cases, deep understanding, tricky distractors",
    };

    let typeSpecificInstructions = "";
    let exampleJson = "";

    if (questionType === "mcq") {
      typeSpecificInstructions = `Multiple Choice Questions:
- Create 4 answer options (A, B, C, D)  
- The correct answer should be randomly distributed (not always option A)
- Distractors should be plausible but clearly incorrect on reflection
- CRITICAL: The "correctAnswer" field MUST EXACTLY match the text of one of the options in the "options" array`;
      exampleJson = `{
  "id": "1",
  "question": "What is photosynthesis?",
  "type": "mcq",
  "options": ["The process plants use to make food from sunlight", "The breakdown of glucose for energy", "The transport of water through plants", "The absorption of minerals from soil"],
  "correctAnswer": "The process plants use to make food from sunlight",
  "explanation": "Photosynthesis is the process by which plants use sunlight, water, and CO2 to produce glucose and oxygen."
}`;
    } else if (questionType === "truefalse") {
      typeSpecificInstructions = `True/False Questions:
- Make half the statements true and half false
- False statements should contain a subtle but clear factual error
- The "options" array must be exactly ["True", "False"]
- The "correctAnswer" must be exactly "True" or "False"`;
      exampleJson = `{
  "id": "1",
  "question": "Photosynthesis produces carbon dioxide as a byproduct.",
  "type": "truefalse",
  "options": ["True", "False"],
  "correctAnswer": "False",
  "explanation": "Photosynthesis produces oxygen (not carbon dioxide) as a byproduct. CO2 is actually consumed during photosynthesis."
}`;
    } else if (questionType === "fillinblank") {
      typeSpecificInstructions = `Fill-in-the-Blank Questions:
- Use ___ to indicate the missing word/phrase in the question
- The "options" array should be empty []
- The "correctAnswer" should be the exact word or short phrase that fills the blank`;
      exampleJson = `{
  "id": "1",
  "question": "Photosynthesis takes place in the ___ of plant cells.",
  "type": "fillinblank",
  "options": [],
  "correctAnswer": "chloroplasts",
  "explanation": "Chloroplasts are the organelles where photosynthesis occurs. They contain chlorophyll, the green pigment that absorbs light."
}`;
    } else {
      typeSpecificInstructions = `Short Answer Questions:
- Questions that require a 1-2 sentence answer
- The "options" array should be empty []
- The "correctAnswer" should be a concise model answer`;
      exampleJson = `{
  "id": "1",
  "question": "Explain the two main stages of photosynthesis.",
  "type": "short",
  "options": [],
  "correctAnswer": "The light-dependent reactions capture solar energy and the Calvin cycle uses that energy to fix CO2 into glucose.",
  "explanation": "Stage 1 (light reactions) occurs in the thylakoid membrane and captures light energy. Stage 2 (Calvin cycle) occurs in the stroma and produces organic molecules."
}`;
    }

    const prompt = `Generate EXACTLY ${questionCount} quiz questions at "${difficulty}" difficulty: ${difficultyInstructions[difficulty]}.

${typeSpecificInstructions}

EDUCATIONAL CONTENT TO BASE QUESTIONS ON:
${content.slice(0, 5000)}

Example of ONE correct question format:
${exampleJson}

Return valid JSON with EXACTLY ${questionCount} questions:
{
  "questions": [/* ${questionCount} question objects here */]
}

CRITICAL RULES:
1. For MCQ: correctAnswer MUST be the EXACT text of one of the 4 options
2. Vary which option position is correct (don't always use option 1)
3. Each question must test DIFFERENT content from the material`;

    const result = await callAI(prompt);
    const parsed = JSON.parse(result);
    const questions = Array.isArray(parsed.questions) ? parsed.questions : [];
    
    // Normalize questions to ensure correctAnswer matches an option
    const normalized = questions.map((q: {
      question?: string; type?: string; options?: string[];
      correctAnswer?: string; explanation?: string;
    }, i: number) => {
      const options = Array.isArray(q.options) ? q.options : [];
      let correctAnswer = q.correctAnswer || "";
      
      // For MCQ: if correctAnswer doesn't match any option, pick the first option
      if (questionType === "mcq" && options.length > 0) {
        const exactMatch = options.find((o: string) => o === correctAnswer);
        if (!exactMatch) {
          // Try case-insensitive match
          const caseMatch = options.find((o: string) => o.toLowerCase() === correctAnswer.toLowerCase());
          correctAnswer = caseMatch || options[0];
        }
      }
      
      return {
        id: String(i + 1),
        question: q.question || `Question ${i + 1}`,
        type: questionType,
        options,
        correctAnswer,
        explanation: q.explanation || "See the source material for more details.",
      };
    });
    
    res.json({ questions: normalized });
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

    const prompt = `Create a hierarchical mind map from this educational content.
Structure:
- 1 central root topic (the main subject — short label, max 4 words)
- 4-6 main branches (major themes/topics — short labels, max 5 words each)
- 2-3 sub-topics per branch (more specific details — short labels, max 6 words each)

CONTENT:
${content.slice(0, 4000)}

Return valid JSON. Labels must be SHORT (max 6 words). No long sentences as labels.
{
  "title": "Main Topic Title",
  "root": {
    "id": "root",
    "label": "Main Topic",
    "children": [
      {
        "id": "b1",
        "label": "Branch 1 Topic",
        "children": [
          {"id": "b1-1", "label": "Subtopic", "children": []},
          {"id": "b1-2", "label": "Subtopic", "children": []}
        ]
      },
      {
        "id": "b2",
        "label": "Branch 2 Topic",
        "children": [
          {"id": "b2-1", "label": "Subtopic", "children": []},
          {"id": "b2-2", "label": "Subtopic", "children": []}
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

    const prompt = `Create a ${planDays}-day study plan.
Student has: ${hoursPerDay} hours/day to study
Exam date: ${examDate} (${daysUntilExam} days away)
Today: ${today.toISOString().split("T")[0]}

SYLLABUS:
${syllabus.slice(0, 3000)}

Guidelines:
- Distribute topics evenly across days
- Include review/revision days in the last 2-3 days
- Leave the day before exam as light revision only
- Activities should be specific and actionable

Return valid JSON:
{
  "plan": [
    {
      "day": 1,
      "date": "${today.toISOString().split("T")[0]}",
      "topics": ["Topic Name"],
      "hours": ${hoursPerDay},
      "activities": ["Read chapter notes", "Create flashcards for key terms", "Practice 5 questions"]
    }
  ],
  "totalDays": ${planDays},
  "tips": ["Study tip 1", "Study tip 2", "Study tip 3", "Study tip 4"]
}`;

    const result = await callAI(prompt);
    const parsed = JSON.parse(result);
    res.json({
      plan: Array.isArray(parsed.plan) ? parsed.plan : [],
      totalDays: parsed.totalDays || planDays,
      tips: Array.isArray(parsed.tips) ? parsed.tips : [],
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
      eli5: "Explain like the person is 5 years old. Use very simple words, fun analogies, and everyday objects as examples. No jargon at all.",
      beginner: "Explain for a complete beginner. Define any technical terms. Use clear analogies. Build from basics.",
      intermediate: "Explain for someone with basic background knowledge. Use proper terminology with brief definitions. Include how it connects to related concepts.",
      advanced: "Give a deep, technical, exam-level explanation. Cover edge cases, nuances, applications, and advanced considerations.",
    };

    const prompt = `Explain this concept: "${concept}"
Level: ${levelInstructions[level]}

Return valid JSON:
{
  "explanation": "Full detailed explanation appropriate for the ${level} level",
  "level": "${level}",
  "examples": ["Concrete example 1", "Concrete example 2", "Concrete example 3"],
  "analogy": "A memorable analogy that makes this concept click"
}`;

    const result = await callAI(prompt);
    const parsed = JSON.parse(result);
    res.json({
      explanation: parsed.explanation || "Could not explain concept.",
      level: parsed.level || level,
      examples: Array.isArray(parsed.examples) ? parsed.examples : [],
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
      ? `You are a helpful, encouraging AI study tutor for 'Slay The Syllabus'. 
The student is studying the following material:

---
${context.slice(0, 2000)}
---

Answer their questions clearly and helpfully. Use the study material context when relevant. 
Always be encouraging and positive. For complex questions, break down the answer step-by-step.
Return valid JSON in the format requested.`
      : `You are a helpful AI study tutor for 'Slay The Syllabus'. 
Answer student questions clearly, step-by-step. Be encouraging and engaging.
Return valid JSON in the format requested.`;

    const chatMessages = [
      { role: "system" as const, content: systemMsg },
      ...messages.map((m: { role: string; content: string }) => ({
        role: m.role as "user" | "assistant",
        content: m.content,
      })),
      {
        role: "user" as const,
        content: `Based on our conversation, respond helpfully. Return valid JSON:
{
  "reply": "Your detailed, helpful, encouraging response here",
  "suggestions": ["Follow-up question they might ask?", "Related concept to explore?", "Practice challenge?"]
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
      reply: parsed.reply || "I'm here to help! Could you rephrase your question?",
      suggestions: Array.isArray(parsed.suggestions) ? parsed.suggestions : [],
    });
  } catch (err: unknown) {
    console.error("[chat error]", err);
    res.status(500).json({ error: "ai_error", message: "AI is thinking hard... Please try again in a moment." });
  }
});

export default router;
