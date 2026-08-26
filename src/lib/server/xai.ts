import { getSql } from "@/lib/db";
import { newId } from "@/lib/utils";
import type { Category } from "@/lib/catalog";
import type { Condition } from "@/lib/pricing";

export type IdentifiedItem = {
  brand: string;
  model: string;
  name: string;
  category: Category;
  condition: Condition;
  confidence: number;
};

const CATEGORIES: Category[] = [
  "phone",
  "tablet",
  "laptop",
  "headphones",
  "console",
  "camera",
  "watch",
  "sneakers",
  "lego",
  "kitchen",
  "vacuum",
  "bike",
  "speaker",
  "gpu",
  "monitor",
  "other",
];

const CONDITIONS: Condition[] = ["like_new", "good", "fair", "poor"];

function asCategory(v: unknown): Category {
  return CATEGORIES.includes(v as Category) ? (v as Category) : "other";
}

function asCondition(v: unknown): Condition {
  return CONDITIONS.includes(v as Condition) ? (v as Condition) : "good";
}

export async function identifyPhoto(imageBase64: string, scanToken: string): Promise<{
  items: IdentifiedItem[];
  costCents: number;
  latencyMs: number;
}> {
  const apiKey = process.env.XAI_API_KEY;
  if (!apiKey) {
    throw new Error("Photo scan is unavailable here. Search the item name instead.");
  }

  const started = Date.now();
  const res = await fetch("https://api.x.ai/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: "grok-4.5",
      temperature: 0,
      max_tokens: 700,
      messages: [
        {
          role: "system",
          content:
            "You identify used consumer goods for resale pricing. Return JSON only. No markdown. Schema: {\"items\":[{\"brand\":\"\",\"model\":\"\",\"name\":\"\",\"category\":\"phone|tablet|laptop|headphones|console|camera|watch|sneakers|lego|kitchen|vacuum|bike|speaker|gpu|monitor|other\",\"condition\":\"like_new|good|fair|poor\",\"confidence\":0.0}]}. Up to 6 distinct sellable items. Ignore trash, cables-only, and unidentifiable blobs. condition is cosmetic + completeness.",
        },
        {
          role: "user",
          content: [
            {
              type: "image_url",
              image_url: { url: `data:image/jpeg;base64,${imageBase64}` },
            },
            {
              type: "text",
              text: "Identify every distinct resaleable item. Prefer specific model names.",
            },
          ],
        },
      ],
    }),
  });

  const latencyMs = Date.now() - started;
  const costCents = 4;
  const sql = await getSql();

  if (!res.ok) {
    await sql`insert into api_usage (id, provider, kind, cost_cents, latency_ms, status, scan_token)
      values (${newId()}, ${"xai"}, ${"vision"}, ${costCents}, ${latencyMs}, ${"error"}, ${scanToken})`;
    throw new Error("Could not read the photo. Try a clearer shot or search the name.");
  }

  const body = (await res.json()) as {
    choices?: { message?: { content?: string } }[];
  };
  const text = body.choices?.[0]?.message?.content ?? "";
  const parsed = parseItems(text);

  await sql`insert into api_usage (id, provider, kind, cost_cents, latency_ms, status, scan_token)
    values (${newId()}, ${"xai"}, ${"vision"}, ${costCents}, ${latencyMs}, ${"ok"}, ${scanToken})`;

  return { items: parsed, costCents, latencyMs };
}

function parseItems(text: string): IdentifiedItem[] {
  const start = text.indexOf("{");
  const end = text.lastIndexOf("}");
  if (start < 0 || end < 0) return [];
  try {
    const json = JSON.parse(text.slice(start, end + 1)) as {
      items?: Array<Record<string, unknown>>;
    };
    const items = Array.isArray(json.items) ? json.items : [];
    return items.slice(0, 6).map((raw) => ({
      brand: String(raw.brand ?? "").slice(0, 80),
      model: String(raw.model ?? "").slice(0, 80),
      name: String(raw.name ?? raw.model ?? "Item").slice(0, 120),
      category: asCategory(raw.category),
      condition: asCondition(raw.condition),
      confidence: Math.min(1, Math.max(0, Number(raw.confidence) || 0.5)),
    }));
  } catch {
    return [];
  }
}
