// Deterministic "AI Smart Insights" engine. Analyzes a store's sales + inventory
// and produces natural-language recommendations. When ANTHROPIC_API_KEY is set,
// buildHeadline() upgrades the summary line to a Claude-generated one.

import { formatCurrency } from "@/lib/format";

function daysAgo(n) {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() - n);
  return d;
}

export function computeInsights(products, sales) {
  const now = Date.now();
  const since30 = daysAgo(30);
  const since14 = daysAgo(14);
  const since7 = daysAgo(7);
  const sincePrev7 = daysAgo(14);

  const qty14 = {}; // product id -> qty last 14 days
  const qtyName7 = {};
  const qtyNamePrev7 = {};
  let revThisWeek = 0;
  let revPrevWeek = 0;
  const hourBuckets = new Array(24).fill(0);
  const soldNames = new Set();

  for (const s of sales) {
    const created = new Date(s.createdAt);
    if (created < since30) continue;
    const inThisWeek = created >= since7;
    const inPrevWeek = created >= sincePrev7 && created < since7;
    if (inThisWeek) revThisWeek += s.total;
    if (inPrevWeek) revPrevWeek += s.total;
    hourBuckets[created.getHours()] += s.total;
    for (const it of s.items || []) {
      soldNames.add(it.name);
      const pid = String(it.product);
      if (created >= since14) qty14[pid] = (qty14[pid] || 0) + it.quantity;
      if (inThisWeek) qtyName7[it.name] = (qtyName7[it.name] || 0) + it.quantity;
      else if (inPrevWeek) qtyNamePrev7[it.name] = (qtyNamePrev7[it.name] || 0) + it.quantity;
    }
  }

  const insights = [];

  // 1. Reorder suggestions — low stock ranked by urgency, with velocity.
  const lowStock = products
    .filter((p) => p.stock <= p.lowStockThreshold)
    .map((p) => {
      const vel = (qty14[String(p._id)] || 0) / 14;
      const daysLeft = vel > 0 ? Math.round(p.stock / vel) : null;
      return { p, vel, daysLeft };
    })
    .sort((a, b) => a.p.stock - b.p.stock);

  for (const { p, vel, daysLeft } of lowStock.slice(0, 3)) {
    const out = p.stock <= 0;
    let text = `Reorder ${p.name} — ${out ? "out of stock" : `only ${p.stock} ${p.unit} left`}`;
    if (vel > 0 && daysLeft != null) {
      text += out ? `; it sells about ${vel.toFixed(1)}/day.` : `, roughly ${daysLeft} day${daysLeft === 1 ? "" : "s"} of cover at the current pace.`;
    } else {
      text += ".";
    }
    insights.push({ type: "reorder", severity: out ? "high" : "medium", title: "Restock soon", text });
  }

  // 2. Best seller this week, with trend vs last week.
  const topName = Object.keys(qtyName7).sort((a, b) => qtyName7[b] - qtyName7[a])[0];
  if (topName) {
    const q7 = qtyName7[topName];
    const qPrev = qtyNamePrev7[topName] || 0;
    let text = `${topName} is your top seller this week with ${q7} sold`;
    if (qPrev > 0) {
      const change = Math.round(((q7 - qPrev) / qPrev) * 100);
      if (Math.abs(change) >= 8) text += ` — ${change > 0 ? "up" : "down"} ${Math.abs(change)}% vs last week`;
    }
    text += ". Keep it well stocked.";
    insights.push({ type: "trend", severity: "low", title: "Top mover", text });
  }

  // 3. Revenue trend week-over-week.
  if (revPrevWeek > 0) {
    const pct = Math.round(((revThisWeek - revPrevWeek) / revPrevWeek) * 100);
    if (Math.abs(pct) >= 5) {
      insights.push({
        type: "revenue",
        severity: pct < 0 ? "medium" : "low",
        title: pct >= 0 ? "Revenue is up" : "Revenue dipped",
        text: `Revenue is ${pct >= 0 ? "up" : "down"} ${Math.abs(pct)}% vs last week (${formatCurrency(revThisWeek)} vs ${formatCurrency(revPrevWeek)}).`,
      });
    }
  }

  // 4. Dead stock — has stock but no sales in 30 days.
  const dead = products.filter((p) => p.stock > 0 && !soldNames.has(p.name));
  if (dead.length > 0) {
    const sample = dead.slice(0, 2).map((d) => d.name).join(", ");
    insights.push({
      type: "deadstock",
      severity: "low",
      title: "Slow movers",
      text: `${dead.length} item${dead.length === 1 ? "" : "s"} haven't sold in 30 days (e.g. ${sample}). Consider a combo offer or discount.`,
    });
  }

  // 5. Peak hour.
  const totalHourRev = hourBuckets.reduce((a, b) => a + b, 0);
  if (totalHourRev > 0 && sales.length >= 5) {
    let peak = 0;
    for (let h = 0; h < 24; h++) if (hourBuckets[h] > hourBuckets[peak]) peak = h;
    const label = `${((peak + 11) % 12) + 1}${peak < 12 ? "am" : "pm"}`;
    insights.push({
      type: "timing",
      severity: "low",
      title: "Busiest hour",
      text: `Your busiest time is around ${label}. Make sure staff and fast-movers are ready before then.`,
    });
  }

  const reorderCount = lowStock.length;
  const outCount = products.filter((p) => p.stock <= 0).length;

  return { insights, reorderCount, outCount, revThisWeek, revPrevWeek, topName };
}

export function buildHeadline({ reorderCount, outCount, revThisWeek, revPrevWeek }) {
  const parts = [];
  if (reorderCount > 0) {
    parts.push(`${reorderCount} item${reorderCount === 1 ? "" : "s"} to restock${outCount ? ` (${outCount} out of stock)` : ""}`);
  } else {
    parts.push("stock levels look healthy");
  }
  if (revPrevWeek > 0) {
    const pct = Math.round(((revThisWeek - revPrevWeek) / revPrevWeek) * 100);
    if (Math.abs(pct) >= 5) parts.push(`revenue is ${pct >= 0 ? "up" : "down"} ${Math.abs(pct)}% this week`);
  }
  const s = parts.join(", and ");
  return s.charAt(0).toUpperCase() + s.slice(1) + ".";
}

// Optional generative upgrade — only runs if an Anthropic API key is configured.
export async function generativeHeadline(facts, insights) {
  if (!process.env.ANTHROPIC_API_KEY) return null;
  try {
    const { default: Anthropic } = await import("@anthropic-ai/sdk");
    const client = new Anthropic();
    const bullets = insights.map((i) => `- ${i.text}`).join("\n");
    const response = await client.messages.create({
      model: "claude-haiku-4-5",
      max_tokens: 200,
      system:
        "You are a concise retail analyst for a small Indian shop owner. Given data points, write ONE friendly, plain-English sentence summarising what the owner should focus on today. No preamble, no markdown.",
      messages: [
        {
          role: "user",
          content: `Facts: ${JSON.stringify(facts)}\nInsights:\n${bullets}\n\nWrite the one-sentence summary.`,
        },
      ],
    });
    const text = response.content.find((b) => b.type === "text")?.text?.trim();
    return text || null;
  } catch {
    return null;
  }
}
