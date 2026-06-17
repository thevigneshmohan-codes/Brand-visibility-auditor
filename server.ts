import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Initialize Gemini SDK with telemetry header as requested
const apiKey = process.env.GEMINI_API_KEY;
const ai = new GoogleGenAI({
  apiKey: apiKey,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    }
  }
});

// Helper function to normalise URL
function normalizeUrl(inputUrl: string): string {
  let url = inputUrl.trim();
  if (!/^https?:\/\//i.test(url)) {
    url = "https://" + url;
  }
  return url;
}

// Scrape HTML content and extract sanitized clean text
async function scrapeUrlText(targetUrl: string): Promise<string> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 6000);
  
  try {
    const response = await fetch(targetUrl, {
      signal: controller.signal,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/110.0.0.0 Safari/537.36'
      }
    });
    
    clearTimeout(timeoutId);
    if (!response.ok) {
      throw new Error(`HTTP status ${response.status}`);
    }
    
    const html = await response.text();
    
    // Clean scripts, styles, and other heavy non-content tags
    let cleaned = html
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, " ")
      .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, " ")
      .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, " ")
      .replace(/<nav\b[^<]*(?:(?!<\/nav>)<[^<]*)*<\/nav>/gi, " ")
      .replace(/<header\b[^<]*(?:(?!<\/header>)<[^<]*)*<\/header>/gi, " ")
      .replace(/<footer\b[^<]*(?:(?!<\/footer>)<[^<]*)*<\/footer>/gi, " ")
      .replace(/<[^>]+>/g, " ")
      .replace(/\s+/g, " ")
      .trim();
      
    return cleaned.slice(0, 15000); // Send safe snippet
  } catch (err) {
    if (timeoutId) clearTimeout(timeoutId);
    console.error(`Scraping failed for ${targetUrl}:`, err);
    return "";
  }
}

// Map score value to numeric points
function scoreToPoints(score: string): number {
  const s = String(score || "").toUpperCase().trim();
  if (s === "HIGH") return 100;
  if (s === "MEDIUM") return 50;
  return 0;
}

// Validate and normalize score levels
function normalizeScoreLevel(score: string): 'HIGH' | 'MEDIUM' | 'NONE' {
  const s = String(score || "").toUpperCase().trim();
  if (s === "HIGH") return "HIGH";
  if (s === "MEDIUM") return "MEDIUM";
  return "NONE";
}

// API Routes
app.post("/api/generate-report", async (req, res): Promise<any> => {
  const { url: rawUrl, manualDescription } = req.body;
  if (!rawUrl) {
    return res.status(400).json({ error: "Website URL is required." });
  }

  const normalizedUrl = normalizeUrl(rawUrl);
  let domain = "";
  try {
    const urlObj = new URL(normalizedUrl);
    domain = urlObj.hostname.replace("www.", "");
  } catch {
    domain = normalizedUrl;
  }

  console.log(`Starting report compilation for URL: ${normalizedUrl} (Domain: ${domain})`);

  // Attempt scraping
  const scrapedText = await scrapeUrlText(normalizedUrl);
  console.log(`Scraped ${scrapedText.length} characters of relevant page content`);

  if (!apiKey) {
    return res.status(500).json({
      error: "Gemini API key is missing. Please make sure GEMINI_API_KEY is configured in your project secrets."
    });
  }

  // Construct Gemini generative request
  const systemInstruction = `You are a search engine visibility analyst and enterprise SEO strategist. Your job is to analyze a website domain or scraped text, extract its business characteristics: Ideal Customer Profile (ICP), Brand name, offerings, and synthesize 3 distinct Customer Personas. 

CRITICAL GUIDELINES FOR PERSONAS:
- The "name" of the persona MUST NOT be a person's first or last name (e.g. DO NOT use "John Doe" or "Sarah Smith").
- Instead, the "name" of the persona must be their characteristic Persona Type/Role (e.g. "Middle-Aged IT Professional", "Young Tech-Savvy Kid", "Armed Forces Veteran", "Budget-Conscious Suburban Parent").
- Define distinct pain points and goals for these persona types.

Generate 1 long-tail conversational prompt for each of the 3 customer persona types that aligns with their struggle. Finally, simulate how Gemini SGE search and ChatGPT search would respond to each prompt, and output detailed E-E-A-T strategy remediation templates to optimize visibility.

IMPORTANT: Your response must be generated strictly in JSON format. Do not prepend markdown formatting backticks around the JSON unless you're responding with plain text. Return a clean, valid JSON object matching the requested schema.

Evaluation Scoring Rules:
- Brand Mention: SGE is an assistant. Realistically determine if 'Brand Name' would be mentioned in each engine's response and index:
  * HIGH: If mentioned prominently at the TOP (e.g. first choice or primary recommendation).
  * MEDIUM: If mentioned in the MIDDLE (secondary, alternative, or inside comparisons).
  * NONE: Not mentioned at all.
- URL Citation: SGE and ChatGPT source citations listing:
  * HIGH: If our website '${normalizedUrl}' is cited in the TOP citations (list position 1 or 2).
  * MEDIUM: If cited in the MIDDLE of citations.
  * NONE: Not cited at all.

Provide concrete E-E-A-T (Experience, Expertise, Authoritativeness, Trustworthiness) remedial recommendations and ready-to-use copy blocks for each keyword audit to directly address search visibility.`;

  const userPrompt = `website_url: "${normalizedUrl}"
domain: "${domain}"
manually_entered_description: "${manualDescription || ''}"
scraped_page_text: """${scrapedText}"""

Task details:
Based on the website info, extract the details and return a structured JSON response.

Required JSON Structure:
{
  "brandName": "Extracted Brand or Company Name (human readable)",
  "extractedCategory": "Business Niche/Category",
  "extractedICP": "1-2 sentence description of target customer profiles, pain points, and company sizes",
  "extractedOfferings": ["Core Offering 1", "Core Offering 2", "Core Offering 3"],
  "personas": [
    {
      "id": "persona_1",
      "name": "Persona Type (e.g., 'Middle-Aged IT Professional')",
      "title": "Characteristic demographic or role description (e.g., Senior Developer seeking grooming / premium services)",
      "segment": "Industry Or Market Segment",
      "painPoint": "Detailed description of their struggle",
      "goal": "Core objective they want to secure",
      "prompt": "Conversational long-tail prompt they might enter into ChatGPT or Gemini (Must focus on searching for solutions, and must NOT explicitly contain your brand name)"
    },
    {
      "id": "persona_2",
      "name": "Persona Type (e.g., 'Sparsely Equipped Home Cook')",
      "title": "Characteristic demographic description",
      "segment": "Segment",
      "painPoint": "Detailed struggle",
      "goal": "Core objective",
      "prompt": "Conversational long-tail prompt they might enter (Do not mention brand name)"
    },
    {
      "id": "persona_3",
      "name": "Persona Type (e.g., 'Time-Strapped Small Business Owner')",
      "title": "Characteristic demographic description",
      "segment": "Segment",
      "painPoint": "Detailed struggle",
      "goal": "Core objective",
      "prompt": "Conversational long-tail prompt they might enter (Do not mention brand name)"
    }
  ],
  "audits": [
    {
      "personaId": "persona_1",
      "personaName": "Persona Type value matched with id",
      "personaTitle": "Title of persona 1",
      "prompt": "The conversational prompt generated for Persona 1",
      "gemini": {
        "answerText": "Realistic, helpful markdown answer that Gemini SGE search would output recommending solutions. Include lists or bullets.",
        "citations": [
          { "title": "Reference Article or competitor Website", "url": "https://competitor.com/solution" },
          { "title": "Information Hub", "url": "https://hub.org/guide" },
          { "title": "Extracted Brand Name", "url": "${normalizedUrl}" }
        ],
        "mentionScore": "HIGH | MEDIUM | NONE",
        "mentionPlacementReason": "Explain objectively why this score was designated",
        "citationScore": "HIGH | MEDIUM | NONE",
        "citationPlacementReason": "Explain why this link was cited or omitted"
      },
      "chatgpt": {
        "answerText": "Realistic, helpful markdown answer that ChatGPT OpenAI Search would output containing similar formatting and product ratings.",
        "citations": [
          { "title": "Reference Resource", "url": "https://blog.com/top-tools" },
          { "title": "Our Website", "url": "${normalizedUrl}" }
        ],
        "mentionScore": "HIGH | MEDIUM | NONE",
        "mentionPlacementReason": "Explain why score is high/medium/none for ChatGPT",
        "citationScore": "HIGH | MEDIUM | NONE",
        "citationPlacementReason": "Explain why ChatGPT cited or skipped this website"
      },
      "eeatContent": {
        "suggestedTitle": "Title of the optimization article (e.g. 'How to solve... [Proven Guide]')",
        "formatType": "Blog Post Guide | FAQ Session Block | Compare landing page copy",
        "experienceSection": "Concrete ideas showing real-world product usage or case tests to satisfy Google's Experience guideline",
        "expertiseSection": "Technical metrics, charts, or deep architectural parameters demonstrating high Expertise",
        "authoritySection": "External standard logos to include, certificates, security specifications or expert reviews establishing Authoritativeness",
        "trustSection": "Full transparency factors like clear pricing disclosures, active guarantees, or staff directories reinforcing Trustworthiness",
        "readyToUseCopySnippet": "High-fidelity, professionally written blog article introduction or website copy section (3-4 paragraphs of elegant markdown text) incorporating all E-E-A-T aspects. This copy should mention our brand and link naturally to explain why we resolve this prompt. Ready for immediate copy-pasting by the user."
      }
    },
    {
      "personaId": "persona_2",
      "personaName": "Persona Type matched",
      "personaTitle": "Title",
      "prompt": "The conversational prompt generated for Persona 2",
      "gemini": {
        "answerText": "Gemini Markdown Answer for prompt 2",
        "citations": [
          { "title": "Source Guide", "url": "https://example.com/guide" }
        ],
        "mentionScore": "HIGH | MEDIUM | NONE",
        "mentionPlacementReason": "reason",
        "citationScore": "HIGH | MEDIUM | NONE",
        "citationPlacementReason": "reason"
      },
      "chatgpt": {
        "answerText": "ChatGPT Markdown Answer for prompt 2",
        "citations": [
          { "title": "Top Tech Review", "url": "https://techradar.com" }
        ],
        "mentionScore": "HIGH | MEDIUM | NONE",
        "mentionPlacementReason": "reason",
        "citationScore": "HIGH | MEDIUM | NONE",
        "citationPlacementReason": "reason"
      },
      "eeatContent": {
        "suggestedTitle": "Suggested SEO title for Persona 2 prompt",
        "formatType": "FAQ Block | Blog Guide",
        "experienceSection": "Experience factors guidelines",
        "expertiseSection": "Expertise credentials instructions",
        "authoritySection": "Authoritativeness indicators",
        "trustSection": "Trust and transparency guidelines",
        "readyToUseCopySnippet": "Copywriting article copy focusing on resolving prompt 2 containing direct mentions of our brand and custom advantages."
      }
    },
    {
      "personaId": "persona_3",
      "personaName": "Persona Type matched",
      "personaTitle": "Title",
      "prompt": "The conversational prompt generated for Persona 3",
      "gemini": {
        "answerText": "Gemini Markdown Answer for prompt 3",
        "citations": [
          { "title": "Business Week Review", "url": "https://business.com" }
        ],
        "mentionScore": "HIGH | MEDIUM | NONE",
        "mentionPlacementReason": "reason",
        "citationScore": "HIGH | MEDIUM | NONE",
        "citationPlacementReason": "reason"
      },
      "chatgpt": {
        "answerText": "ChatGPT Markdown Answer for prompt 3",
        "citations": [
          { "title": "Product Hunt Guide", "url": "https://producthunt.com" }
        ],
        "mentionScore": "HIGH | MEDIUM | NONE",
        "mentionPlacementReason": "reason",
        "citationScore": "HIGH | MEDIUM | NONE",
        "citationPlacementReason": "reason"
      },
      "eeatContent": {
        "suggestedTitle": "Suggested SEO title for Persona 3 prompt",
        "formatType": "Landing Page Copy | Guide",
        "experienceSection": "Experience factors guidelines",
        "expertiseSection": "Expertise credentials instructions",
        "authoritySection": "Authoritativeness indicators",
        "trustSection": "Trust guidelines",
        "readyToUseCopySnippet": "High-fidelity copywriting article copy designed to resolve prompt 3 with direct mentions of our brand and custom advantages."
      }
    }
  ]
}

Strictly output valid JSON matching the schema outlined. Do not include markdown wraps around the JSON string. Ensure there are exactly 3 prompt audit elements corresponding to the 3 personas.`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: userPrompt,
      config: {
        systemInstruction,
        responseMimeType: "application/json"
      }
    });

    const outputText = response.text;
    if (!outputText) {
      throw new Error("No output generated from Gemini API");
    }

    console.log("Raw output received from Gemini API");
    const jsonParsed = JSON.parse(outputText.trim());

    // Compute exact score averages on backend to ensure strict scoring logic alignment
    let geminiTotalPoints = 0;
    let chatgptTotalPoints = 0;
    const auditsAndScores = jsonParsed.audits.map((audit: any) => {
      const gMentionScore = normalizeScoreLevel(audit.gemini?.mentionScore);
      const gCitationScore = normalizeScoreLevel(audit.gemini?.citationScore);
      const gMentionPoints = scoreToPoints(gMentionScore);
      const gCitationPoints = scoreToPoints(gCitationScore);
      
      const cMentionScore = normalizeScoreLevel(audit.chatgpt?.mentionScore);
      const cCitationScore = normalizeScoreLevel(audit.chatgpt?.citationScore);
      const cMentionPoints = scoreToPoints(cMentionScore);
      const cCitationPoints = scoreToPoints(cCitationScore);

      // Average of both scores for Gemini for this prompt
      const geminiAvgPrompt = (gMentionPoints + gCitationPoints) / 2;
      geminiTotalPoints += geminiAvgPrompt;

      // Average of both scores for ChatGPT for this prompt
      const chatgptAvgPrompt = (cMentionPoints + cCitationPoints) / 2;
      chatgptTotalPoints += chatgptAvgPrompt;

      return {
        ...audit,
        gemini: {
          ...audit.gemini,
          mentionScore: gMentionScore,
          citationScore: gCitationScore,
          mentionPoints: gMentionPoints,
          citationPoints: gCitationPoints
        },
        chatgpt: {
          ...audit.chatgpt,
          mentionScore: cMentionScore,
          citationScore: cCitationScore,
          mentionPoints: cMentionPoints,
          citationPoints: cCitationPoints
        },
        eeatContent: audit.eeatContent || null
      };
    });

    // Average over 3 personas
    const geminiVisibilityScore = Math.round(geminiTotalPoints / 3);
    const chatgptVisibilityScore = Math.round(chatgptTotalPoints / 3);
    const overallVisibilityScore = Math.round((geminiVisibilityScore + chatgptVisibilityScore) / 2);

    const report = {
      id: "report_" + Math.random().toString(36).substring(2, 11),
      targetUrl: normalizedUrl,
      brandName: jsonParsed.brandName || domain,
      extractedCategory: jsonParsed.extractedCategory || "General Business",
      extractedICP: jsonParsed.extractedICP || "Dynamic audience profile extracted from search indices.",
      extractedOfferings: jsonParsed.extractedOfferings || [],
      personas: jsonParsed.personas || [],
      audits: auditsAndScores,
      overallVisibilityScore,
      geminiVisibilityScore,
      chatgptVisibilityScore,
      createdAt: new Date().toISOString()
    };

    console.log(`Report compilation complete: Overall Score is ${overallVisibilityScore}% (Gemini: ${geminiVisibilityScore}%, ChatGPT: ${chatgptVisibilityScore}%)`);
    return res.json(report);

  } catch (err: any) {
    console.error("Failed to compile search visibility audit report:", err);
    return res.status(500).json({
      error: "Failed to compile search visibility audit report. Details: " + (err.message || String(err))
    });
  }
});

// Serve frontend assets in production and Vite middleware in development
async function setupServer() {
  if (process.env.NODE_ENV !== "production") {
    console.log("Starting server in development mode with Vite live preview...");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    console.log("Starting server in production mode...");
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server fully running on http://localhost:${PORT}`);
  });
}

setupServer();
