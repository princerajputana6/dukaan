import { NextResponse } from "next/server";
import { resolveScope } from "@/lib/scope";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

// Extraction schema — Claude returns items in exactly this shape.
const SCHEMA = {
  type: "object",
  properties: {
    items: {
      type: "array",
      items: {
        type: "object",
        properties: {
          name: { type: "string" },
          quantity: { type: "number" },
          costPrice: { type: "number" },
          sellingPrice: { type: "number" },
          unit: { type: "string" },
          category: { type: "string" },
        },
        required: ["name", "quantity", "costPrice", "sellingPrice", "unit", "category"],
        additionalProperties: false,
      },
    },
  },
  required: ["items"],
  additionalProperties: false,
};

const SYSTEM = `You are an inventory assistant for a small Indian shop. You read a photo of a supplier purchase bill / receipt and extract the line items so the owner can add them to inventory.

Rules:
- Return ONE row per distinct product on the bill.
- name: the product name, cleaned up and title-cased (fix obvious OCR errors, drop item codes).
- quantity: the number of units purchased (integer where possible; default 1 if not shown).
- costPrice: the PER-UNIT purchase price in rupees (if only a line total and quantity are shown, divide). Numbers only, no currency symbol.
- sellingPrice: a suggested retail price. If the bill shows an MRP, use it; otherwise estimate a reasonable retail price (roughly cost + 15-25% for groceries/FMCG). Never below costPrice.
- unit: one of pcs, pack, box, kg, ltr, g, ml — infer from the item.
- category: a short category like Beverages, Snacks, Groceries, Dairy, Confectionery, Cigarettes, Pan & Tobacco, or Uncategorized.
- Ignore totals, taxes, GST lines, discounts, subtotals, invoice numbers, and shop details — only real products.
- If the image is not a bill or has no readable items, return an empty items array.`;

function parseImage(image) {
  // Accepts a data URL ("data:image/png;base64,....") or bare base64.
  const m = /^data:(image\/[a-zA-Z0-9.+-]+);base64,(.*)$/s.exec(image || "");
  if (m) return { mediaType: m[1], data: m[2] };
  return { mediaType: "image/jpeg", data: image };
}

export async function POST(request) {
  try {
    const scope = await resolveScope();
    if (scope.error)
      return NextResponse.json({ error: scope.error.message }, { status: scope.error.status });

    if (!process.env.ANTHROPIC_API_KEY) {
      return NextResponse.json(
        { error: "AI receipt scanning is not configured on this server." },
        { status: 503 }
      );
    }

    const { image } = await request.json();
    if (!image) {
      return NextResponse.json({ error: "No image provided" }, { status: 400 });
    }
    const { mediaType, data } = parseImage(image);
    if (!data) {
      return NextResponse.json({ error: "Could not read the image data" }, { status: 400 });
    }

    const { default: Anthropic } = await import("@anthropic-ai/sdk");
    const client = new Anthropic();

    const response = await client.messages.create({
      model: "claude-haiku-4-5",
      max_tokens: 4096,
      system: SYSTEM,
      output_config: { format: { type: "json_schema", schema: SCHEMA } },
      messages: [
        {
          role: "user",
          content: [
            {
              type: "image",
              source: { type: "base64", media_type: mediaType, data },
            },
            {
              type: "text",
              text: "Extract every product line item from this bill for inventory import.",
            },
          ],
        },
      ],
    });

    if (response.stop_reason === "refusal") {
      return NextResponse.json(
        { error: "The image could not be processed. Please add items manually." },
        { status: 422 }
      );
    }

    const text = response.content.find((b) => b.type === "text")?.text || "{}";
    let parsed;
    try {
      parsed = JSON.parse(text);
    } catch {
      return NextResponse.json(
        { error: "Could not understand the receipt. Please add items manually." },
        { status: 422 }
      );
    }

    const items = Array.isArray(parsed.items) ? parsed.items : [];
    return NextResponse.json({ data: { items } });
  } catch (err) {
    return NextResponse.json(
      { error: err.message || "Receipt scan failed" },
      { status: 500 }
    );
  }
}
