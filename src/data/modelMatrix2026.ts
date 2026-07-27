/**
 * modelMatrix2026 — canonical catalogue of the AI models people actually search
 * for in 2026, plus the head-to-head ("X vs Y") pairs generated from it.
 *
 * Feeds:
 *   /vs/:pair            → ModelVersusPage       (e.g. /vs/gpt-5-2-vs-gemini-3-pro)
 *   /{lang}/vs/:pair     → the same page, localised
 *
 * Derived from the late-2026 model-landscape research pass: the frontier
 * reshuffle across OpenAI, Google, Anthropic, xAI and the Chinese open-weight
 * labs, plus the parallel image/video wave.
 */

export type ModelCategory = "chat" | "code" | "image" | "video";

export interface MatrixModel {
  slug: string;
  name: string;
  vendor: string;
  category: ModelCategory;
  /** One-line positioning used in headlines and meta descriptions. */
  tagline: string;
  /** Longer paragraph rendered in the page body. */
  summary: string;
  strengths: string[];
  tradeoffs: string[];
  specs: Array<{ label: string; value: string }>;
  /** Whether the model is reachable inside Megsy AI today. */
  onMegsy: boolean;
}

const m = (
  slug: string,
  name: string,
  vendor: string,
  category: ModelCategory,
  tagline: string,
  summary: string,
  strengths: string[],
  tradeoffs: string[],
  specs: Array<[string, string]>,
  onMegsy = true,
): MatrixModel => ({
  slug,
  name,
  vendor,
  category,
  tagline,
  summary,
  strengths,
  tradeoffs,
  specs: specs.map(([label, value]) => ({ label, value })),
  onMegsy,
});

export const MATRIX_MODELS: MatrixModel[] = [
  // ---------------------------------------------------------------- chat
  m(
    "gpt-5-2",
    "GPT-5.2",
    "OpenAI",
    "chat",
    "OpenAI's general-purpose workhorse for reasoning and long documents.",
    "GPT-5.2 is the model most people mean when they say “ChatGPT” in 2026. It balances reasoning depth against latency better than any previous OpenAI release, handles long documents without losing the thread, and is the safest default when you do not want to think about model selection at all.",
    ["Most consistent all-round reasoning", "Excellent instruction following", "Huge ecosystem of prompts and tooling"],
    ["Not the cheapest per token", "Slower than the mini tiers on trivial tasks"],
    [["Context window", "400K tokens"], ["Best for", "Reasoning, analysis, writing"], ["Modality", "Text + vision"]],
  ),
  m(
    "gpt-5-3-codex",
    "GPT-5.3-Codex",
    "OpenAI",
    "code",
    "OpenAI's coding-specialised model with agentic tool use.",
    "GPT-5.3-Codex is tuned specifically for software work: multi-file edits, repository-scale reasoning and long agentic runs where the model has to keep calling tools without drifting. If your main use case is shipping code, it beats the general chat tiers.",
    ["Repository-scale code edits", "Strong agentic tool loops", "High security-review scores"],
    ["Weaker at creative prose", "Overkill for one-off questions"],
    [["Context window", "400K tokens"], ["Best for", "Coding, refactors, agents"], ["Modality", "Text"]],
  ),
  m(
    "gpt-5-6",
    "GPT-5.6",
    "OpenAI",
    "chat",
    "The newest OpenAI frontier tier, tuned for long agentic runs.",
    "GPT-5.6 is OpenAI's mid-2026 frontier release. The headline change is stamina: it holds quality across very long multi-step runs where earlier models degraded, which matters for research agents and multi-hour workflows.",
    ["Best-in-class long-run stability", "Improved factual grounding", "Strong multimodal reasoning"],
    ["Premium pricing", "Availability varies by region"],
    [["Context window", "1M tokens"], ["Best for", "Agents, deep research"], ["Modality", "Text + vision + audio"]],
  ),
  m(
    "gemini-3-pro",
    "Gemini 3 Pro",
    "Google DeepMind",
    "chat",
    "Google's million-token multimodal flagship.",
    "Gemini 3 Pro is built around context. A million-token window means you can drop an entire codebase, a year of email or a full book in and ask questions without chunking, and its native multimodality means video and audio go in the same prompt as text.",
    ["1M-token context", "Native video and audio understanding", "Very strong at retrieval over long inputs"],
    ["Can be verbose", "Occasionally over-hedges on opinions"],
    [["Context window", "1M tokens"], ["Best for", "Long context, multimodal"], ["Modality", "Text + vision + audio + video"]],
  ),
  m(
    "gemini-3-5-pro",
    "Gemini 3.5 Pro",
    "Google DeepMind",
    "chat",
    "The 2026 refresh of Gemini Pro with sharper reasoning.",
    "Gemini 3.5 Pro keeps the million-token window and adds a noticeable jump in step-by-step reasoning and code quality over Gemini 3 Pro. It is Google's answer to the GPT-5.6 and Claude Opus 5 tier.",
    ["Sharper chain-of-thought than Gemini 3", "Still 1M context", "Fast for its class"],
    ["Newer, so fewer community prompts", "Rate limits on the highest tiers"],
    [["Context window", "1M tokens"], ["Best for", "Reasoning + long context"], ["Modality", "Text + vision + audio + video"]],
  ),
  m(
    "claude-opus-4-5",
    "Claude Opus 4.5",
    "Anthropic",
    "chat",
    "Anthropic's reasoning model that set the SWE-bench bar.",
    "Claude Opus 4.5 is the release that made Anthropic the default choice for serious engineering work, posting the highest SWE-bench numbers of its generation while keeping the careful, low-hallucination writing style Claude is known for.",
    ["Top-tier coding accuracy", "Careful, low-hallucination answers", "Excellent long-form writing"],
    ["Higher latency on hard prompts", "More conservative refusals"],
    [["Context window", "200K tokens"], ["Best for", "Coding, analysis, writing"], ["Modality", "Text + vision"]],
  ),
  m(
    "claude-opus-4-6",
    "Claude Opus 4.6",
    "Anthropic",
    "chat",
    "Million-token Claude with adaptive thinking budgets.",
    "Claude Opus 4.6 pushes the context window to a million tokens and introduces adaptive thinking, where the model decides how much reasoning a prompt actually deserves instead of burning the same budget on everything.",
    ["1M-token context", "Adaptive thinking saves cost", "Strong agentic reliability"],
    ["Premium pricing at full context", "Thinking budget can be unpredictable"],
    [["Context window", "1M tokens"], ["Best for", "Large codebases, research"], ["Modality", "Text + vision"]],
  ),
  m(
    "claude-opus-5",
    "Claude Opus 5",
    "Anthropic",
    "chat",
    "Anthropic's mid-2026 frontier model.",
    "Claude Opus 5 is the current top of the Anthropic stack. It is the model to reach for when the cost of a wrong answer is high — legal review, financial analysis, production refactors — and you would rather wait a few extra seconds.",
    ["Highest Claude accuracy to date", "Superb at nuanced instructions", "Very strong tool use"],
    ["Most expensive Anthropic tier", "Slower than Sonnet for simple work"],
    [["Context window", "1M tokens"], ["Best for", "High-stakes reasoning"], ["Modality", "Text + vision"]],
  ),
  m(
    "claude-sonnet-5",
    "Claude Sonnet 5",
    "Anthropic",
    "chat",
    "The fast, affordable Claude that handles most daily work.",
    "Claude Sonnet 5 is the price/performance sweet spot in Anthropic's line-up: close to Opus quality on everyday tasks at a fraction of the cost and latency. For most chat, drafting and light coding it is the right default.",
    ["Fast responses", "Very good value per token", "Same writing style as Opus"],
    ["Falls behind Opus on the hardest reasoning", "Shorter effective thinking budget"],
    [["Context window", "500K tokens"], ["Best for", "Daily chat, drafting, light code"], ["Modality", "Text + vision"]],
  ),
  m(
    "grok-4-1",
    "Grok 4.1",
    "xAI",
    "chat",
    "xAI's conversational model with live search built in.",
    "Grok 4.1 leans on real-time access: it is the model to use when the answer depends on what happened this week rather than what was in the training data. The tone is looser and more direct than its competitors.",
    ["Real-time information", "Direct, less-hedged answers", "Good at current events"],
    ["Less consistent on formal writing", "Weaker structured output"],
    [["Context window", "256K tokens"], ["Best for", "Current events, research"], ["Modality", "Text + vision"]],
  ),
  m(
    "grok-4-5",
    "Grok 4.5",
    "xAI",
    "chat",
    "Coding-and-agents focused Grok trained on real editor sessions.",
    "Grok 4.5 was trained heavily on real coding-session data, which shows up as unusually practical code suggestions — it tends to propose the edit an experienced developer would actually make rather than a textbook rewrite.",
    ["Practical, editor-shaped code output", "Strong agentic loops", "Fast iteration"],
    ["Smaller ecosystem than OpenAI/Anthropic", "Less careful on safety-critical prose"],
    [["Context window", "256K tokens"], ["Best for", "Coding, agents"], ["Modality", "Text + vision"]],
  ),
  m(
    "grok-5",
    "Grok 5",
    "xAI",
    "chat",
    "xAI's current frontier model.",
    "Grok 5 is xAI's answer to GPT-5.6 and Claude Opus 5, combining the real-time data advantage of earlier Grok releases with a substantial jump in raw reasoning quality.",
    ["Frontier-level reasoning", "Live data access", "Very fast for its tier"],
    ["Newest, so least battle-tested", "Availability varies"],
    [["Context window", "512K tokens"], ["Best for", "Reasoning + live data"], ["Modality", "Text + vision"]],
  ),
  m(
    "deepseek-v4",
    "DeepSeek V4",
    "DeepSeek",
    "chat",
    "The open-weight frontier model with a million-token window.",
    "DeepSeek V4 is the open-weight release that closed most of the gap to the closed frontier. A mixture-of-experts design keeps inference cost low relative to its quality, and the million-token context makes it viable for whole-repository work.",
    ["Open weights", "Extremely low cost per token", "1M-token context"],
    ["Inconsistent on niche languages", "Safety tuning is lighter"],
    [["Context window", "1M tokens"], ["Best for", "Cost-sensitive reasoning, code"], ["Modality", "Text"]],
  ),
  m(
    "qwen-3-5",
    "Qwen 3.5",
    "Alibaba",
    "chat",
    "Alibaba's open-weight multilingual powerhouse.",
    "Qwen 3.5 is the strongest open model for multilingual work, and notably better than most Western models on Arabic, Chinese and South-East Asian languages. That makes it a natural default for non-English chat.",
    ["Best-in-class multilingual quality", "Open weights", "Strong maths and code"],
    ["English prose is slightly stiffer", "Docs mostly in Chinese"],
    [["Context window", "256K tokens"], ["Best for", "Multilingual chat, maths"], ["Modality", "Text + vision"]],
  ),
  m(
    "kimi-k2-5",
    "Kimi K2.5",
    "Moonshot AI",
    "code",
    "Moonshot's coding specialist with near-perfect HumanEval scores.",
    "Kimi K2.5 is tuned relentlessly for code generation and tops the classic function-completion benchmarks. It is a strong, cheap second opinion when a frontier model produces something you do not trust.",
    ["Exceptional code completion", "Very cheap", "Fast"],
    ["Narrower general knowledge", "Weaker at long-form writing"],
    [["Context window", "256K tokens"], ["Best for", "Code generation"], ["Modality", "Text"]],
  ),
  m(
    "glm-5",
    "GLM-5",
    "Zhipu AI",
    "chat",
    "Zhipu's open reasoning model.",
    "GLM-5 is a reasoning-first open model that trades some breadth for step-by-step rigour. It is a good fit for maths, logic and structured extraction where you want the chain of thought to be inspectable.",
    ["Strong structured reasoning", "Open weights", "Good extraction accuracy"],
    ["Smaller community", "Less polished chat persona"],
    [["Context window", "200K tokens"], ["Best for", "Reasoning, extraction"], ["Modality", "Text"]],
  ),
  m(
    "llama-4-maverick",
    "Llama 4 Maverick",
    "Meta",
    "chat",
    "Meta's open model built for self-hosting.",
    "Llama 4 Maverick remains the most widely deployed open model because of licence familiarity and tooling support. If you need to run a capable model on your own hardware, this is still the path of least resistance.",
    ["Most mature open-model tooling", "Self-hostable", "Permissive licence"],
    ["Behind the 2026 frontier on reasoning", "Development pace has slowed"],
    [["Context window", "256K tokens"], ["Best for", "Self-hosting, fine-tuning"], ["Modality", "Text + vision"]],
  ),
  m(
    "mistral-large-3",
    "Mistral Large 3",
    "Mistral AI",
    "chat",
    "Europe's frontier model, strong on European languages.",
    "Mistral Large 3 is the European option: EU-hosted, excellent on French, German, Spanish and Italian, and a common choice where data residency matters more than raw benchmark position.",
    ["EU data residency", "Excellent European languages", "Efficient inference"],
    ["Behind US frontier on hard reasoning", "Smaller context than rivals"],
    [["Context window", "256K tokens"], ["Best for", "European languages, compliance"], ["Modality", "Text + vision"]],
  ),

  // --------------------------------------------------------------- image
  m(
    "nano-banana-2",
    "Nano Banana 2",
    "Google",
    "image",
    "Google's conversational image editor and generator.",
    "Nano Banana 2 changed what people expect from image tools: you edit by talking. Ask for a different background, a colour change or a new pose and it preserves the rest of the frame instead of regenerating from scratch.",
    ["Best-in-class conversational editing", "Preserves identity across edits", "Very fast"],
    ["Less painterly than Midjourney", "Aspect-ratio options are limited"],
    [["Max resolution", "2K"], ["Best for", "Editing, product shots"], ["Speed", "~5s"]],
  ),
  m(
    "nano-banana-pro",
    "Nano Banana Pro",
    "Google",
    "image",
    "The high-fidelity tier of Nano Banana with accurate in-image text.",
    "Nano Banana Pro adds resolution and, crucially, reliable typography. It is the first mainstream model you can trust to render a headline, a label or a poster caption without mangling the letters.",
    ["Accurate in-image text", "High resolution", "Strong prompt adherence"],
    ["More expensive per image", "Slower than the base tier"],
    [["Max resolution", "4K"], ["Best for", "Posters, ads, typography"], ["Speed", "~12s"]],
  ),
  m(
    "midjourney-v8-2",
    "Midjourney v8.2",
    "Midjourney",
    "image",
    "Still the aesthetic benchmark for generated imagery.",
    "Midjourney v8.2 remains the model art directors reach for. Nothing else matches its default sense of light, composition and material — you spend less time prompting to get something that simply looks good.",
    ["Unmatched default aesthetics", "Superb lighting and materials", "Rich style controls"],
    ["Weaker literal prompt adherence", "In-image text still unreliable"],
    [["Max resolution", "4K"], ["Best for", "Art direction, concept art"], ["Speed", "~20s"]],
  ),
  m(
    "flux-2",
    "FLUX.2",
    "Black Forest Labs",
    "image",
    "Open-weight image model with excellent prompt adherence.",
    "FLUX.2 does what you asked for. Where other models interpret, FLUX follows the prompt literally, which makes it the right choice for spec-driven work like product imagery and design systems.",
    ["Literal prompt adherence", "Open weights", "Great at fine detail"],
    ["Less flattering defaults than Midjourney", "Needs longer prompts"],
    [["Max resolution", "4K"], ["Best for", "Product, spec-driven work"], ["Speed", "~10s"]],
  ),
  m(
    "flux-2-max",
    "FLUX.2 Max",
    "Black Forest Labs",
    "image",
    "The maximum-quality FLUX tier.",
    "FLUX.2 Max trades speed for fidelity. Skin, fabric and metal hold up under a 100% crop, which is what you want for anything that ends up in print or on a billboard.",
    ["Highest FLUX fidelity", "Print-ready detail", "Strong at photorealism"],
    ["Slowest FLUX tier", "Highest cost per image"],
    [["Max resolution", "4K+"], ["Best for", "Print, photoreal"], ["Speed", "~25s"]],
  ),

  // --------------------------------------------------------------- video
  m(
    "sora-2",
    "Sora 2",
    "OpenAI",
    "video",
    "OpenAI's video model with synchronised audio.",
    "Sora 2 generates video and matching audio together, which removes the single most tedious step of AI video work. Physics and object permanence are noticeably better than the first generation.",
    ["Native synchronised audio", "Strong physics and continuity", "Great prompt understanding"],
    ["Clip length still limited", "Queue times at peak"],
    [["Max length", "25s"], ["Resolution", "1080p"], ["Audio", "Yes"]],
  ),
  m(
    "veo-3-1",
    "Veo 3.1",
    "Google DeepMind",
    "video",
    "Google's cinematic video model with fine camera control.",
    "Veo 3.1 gives you director-level control: specify the lens, the move, the pacing. It is the most controllable mainstream video model and the easiest to get repeatable results from.",
    ["Precise camera control", "Cinematic look", "Reliable across retries"],
    ["Costlier per second", "Stricter content filters"],
    [["Max length", "60s"], ["Resolution", "4K"], ["Audio", "Yes"]],
  ),
  m(
    "veo-3",
    "Veo 3",
    "Google DeepMind",
    "video",
    "The previous Veo generation, still excellent value.",
    "Veo 3 is the cost-effective Google option. You lose some of 3.1's camera precision but keep the overall look, which is fine for social-format content.",
    ["Good quality per credit", "Solid motion", "Widely available"],
    ["Less camera control than 3.1", "Shorter max clips"],
    [["Max length", "30s"], ["Resolution", "1080p"], ["Audio", "Yes"]],
  ),
  m(
    "runway-gen-4",
    "Runway Gen-4",
    "Runway",
    "video",
    "The editor-first video model with strong character consistency.",
    "Runway Gen-4 is built for people who are actually editing. Character and scene consistency across shots is its strongest card, which is what you need to cut a sequence rather than post a single clip.",
    ["Character consistency across shots", "Editor-grade tooling", "Good image-to-video"],
    ["Lower raw fidelity than Veo", "Audio is separate"],
    [["Max length", "20s"], ["Resolution", "1080p"], ["Audio", "No"]],
  ),
  m(
    "kling",
    "Kling",
    "Kuaishou",
    "video",
    "Fast, affordable video generation with strong human motion.",
    "Kling handles people well — walking, gesturing, dancing — at a price that makes iteration realistic. It is the volume option for social content.",
    ["Excellent human motion", "Low cost", "Fast turnaround"],
    ["Weaker on complex scenes", "Less prompt control"],
    [["Max length", "10s"], ["Resolution", "1080p"], ["Audio", "No"]],
  ),
  m(
    "luma-dream-machine",
    "Luma Dream Machine",
    "Luma AI",
    "video",
    "Fluid, dreamlike motion and strong image-to-video.",
    "Luma Dream Machine produces the smoothest camera drift of the group, which suits atmospheric and abstract work more than literal narrative shots.",
    ["Beautiful fluid motion", "Great image-to-video", "Fast"],
    ["Less literal prompt following", "Short clips"],
    [["Max length", "10s"], ["Resolution", "1080p"], ["Audio", "No"]],
  ),
  m(
    "hailuo",
    "Hailuo",
    "MiniMax",
    "video",
    "Budget video generation with surprisingly good coherence.",
    "Hailuo is the cheapest way to get usable AI video. Quality is a step below the frontier but coherence holds up better than the price suggests.",
    ["Cheapest usable option", "Decent coherence", "Fast queue"],
    ["Lower fidelity", "Limited controls"],
    [["Max length", "10s"], ["Resolution", "720p"], ["Audio", "No"]],
  ),
];

export const getMatrixModel = (slug: string | undefined) =>
  slug ? MATRIX_MODELS.find((x) => x.slug === slug) : undefined;

export const MODELS_BY_CATEGORY: Record<ModelCategory, MatrixModel[]> = {
  chat: MATRIX_MODELS.filter((x) => x.category === "chat"),
  code: MATRIX_MODELS.filter((x) => x.category === "code"),
  image: MATRIX_MODELS.filter((x) => x.category === "image"),
  video: MATRIX_MODELS.filter((x) => x.category === "video"),
};

export interface VersusPair {
  slug: string; // "gpt-5-2-vs-gemini-3-pro"
  a: MatrixModel;
  b: MatrixModel;
}

/**
 * Every meaningful head-to-head pair. Chat and code models are compared against
 * each other (people really do search "Claude Opus 5 vs GPT-5.3-Codex"), while
 * image and video stay within their own category.
 */
function buildPairs(): VersusPair[] {
  const groups: MatrixModel[][] = [
    [...MODELS_BY_CATEGORY.chat, ...MODELS_BY_CATEGORY.code],
    MODELS_BY_CATEGORY.image,
    MODELS_BY_CATEGORY.video,
  ];
  const out: VersusPair[] = [];
  for (const group of groups) {
    for (let i = 0; i < group.length; i += 1) {
      for (let j = i + 1; j < group.length; j += 1) {
        out.push({ slug: `${group[i].slug}-vs-${group[j].slug}`, a: group[i], b: group[j] });
      }
    }
  }
  return out;
}

export const VERSUS_PAIRS: VersusPair[] = buildPairs();

export const VERSUS_SLUGS: string[] = VERSUS_PAIRS.map((p) => p.slug);

/** Resolves "a-vs-b" in either direction so both URL orders work. */
export function getVersusPair(slug: string | undefined): VersusPair | undefined {
  if (!slug) return undefined;
  const direct = VERSUS_PAIRS.find((p) => p.slug === slug);
  if (direct) return direct;
  const idx = slug.indexOf("-vs-");
  if (idx === -1) return undefined;
  const left = slug.slice(0, idx);
  const right = slug.slice(idx + 4);
  const flipped = VERSUS_PAIRS.find((p) => p.slug === `${right}-vs-${left}`);
  return flipped ? { slug: flipped.slug, a: flipped.a, b: flipped.b } : undefined;
}
