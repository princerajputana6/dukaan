// AI-assisted forecasting engine. Computes deterministic sales, profit, and
// stock projections from historical sales, and (when ANTHROPIC_API_KEY is set)
// adds a short Claude-generated narrative summary.

function dayKey(d) {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x.toISOString().slice(0, 10);
}

function addDays(base, n) {
  const d = new Date(base);
  d.setDate(d.getDate() + n);
  return d;
}

// Ordinary least-squares slope/intercept for points (0..n-1) -> y.
function linreg(ys) {
  const n = ys.length;
  if (n < 2) return { slope: 0, intercept: ys[0] || 0 };
  let sx = 0, sy = 0, sxx = 0, sxy = 0;
  for (let i = 0; i < n; i++) {
    sx += i;
    sy += ys[i];
    sxx += i * i;
    sxy += i * ys[i];
  }
  const denom = n * sxx - sx * sx;
  if (denom === 0) return { slope: 0, intercept: sy / n };
  const slope = (n * sxy - sx * sy) / denom;
  const intercept = (sy - slope * sx) / n;
  return { slope, intercept };
}

export function computeProjections(products, sales, { historyDays = 30, horizonDays = 30 } = {}) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Build daily revenue/profit buckets over the history window.
  const revByDay = {};
  const profitByDay = {};
  for (let i = historyDays - 1; i >= 0; i--) {
    const k = dayKey(addDays(today, -i));
    revByDay[k] = 0;
    profitByDay[k] = 0;
  }

  // Per-product units sold in the last 14 and 30 days (for velocity).
  const qty14 = {};
  const qty30 = {};
  const since14 = addDays(today, -14);
  const since30 = addDays(today, -30);

  for (const s of sales) {
    const created = new Date(s.createdAt);
    const k = dayKey(created);
    if (k in revByDay) {
      revByDay[k] += s.total || 0;
      profitByDay[k] += s.profit || 0;
    }
    for (const it of s.items || []) {
      const pid = String(it.product);
      if (created >= since30) qty30[pid] = (qty30[pid] || 0) + it.quantity;
      if (created >= since14) qty14[pid] = (qty14[pid] || 0) + it.quantity;
    }
  }

  const dayKeys = Object.keys(revByDay);
  const revSeries = dayKeys.map((k) => revByDay[k]);
  const profitSeries = dayKeys.map((k) => profitByDay[k]);

  const daily = dayKeys.map((k) => ({
    date: k,
    revenue: Math.round(revByDay[k]),
    profit: Math.round(profitByDay[k]),
  }));

  // Trend via linear regression; forecast forward, floored at 0.
  const revFit = linreg(revSeries);
  const profitFit = linreg(profitSeries);
  const n = revSeries.length;

  const forecast = [];
  let salesNext7 = 0, salesNext30 = 0, profitNext7 = 0, profitNext30 = 0;
  for (let i = 0; i < horizonDays; i++) {
    const x = n + i;
    const rev = Math.max(0, revFit.slope * x + revFit.intercept);
    const prof = Math.max(0, profitFit.slope * x + profitFit.intercept);
    const date = dayKey(addDays(today, i + 1));
    forecast.push({ date, revenue: Math.round(rev), profit: Math.round(prof) });
    if (i < 7) {
      salesNext7 += rev;
      profitNext7 += prof;
    }
    salesNext30 += rev;
    profitNext30 += prof;
  }

  // Week-over-week trend for a headline percentage.
  const last7 = revSeries.slice(-7).reduce((a, b) => a + b, 0);
  const prev7 = revSeries.slice(-14, -7).reduce((a, b) => a + b, 0);
  const trendPct = prev7 > 0 ? Math.round(((last7 - prev7) / prev7) * 100) : null;
  const avgDailyRevenue = n > 0 ? revSeries.reduce((a, b) => a + b, 0) / n : 0;

  // Stock depletion projection — per-product velocity and days of cover.
  const stockouts = products
    .map((p) => {
      const perDay = ((qty14[String(p._id)] || 0) / 14) * 0.5 +
        ((qty30[String(p._id)] || 0) / 30) * 0.5; // blend recent + longer trend
      const daysLeft = perDay > 0 ? p.stock / perDay : null;
      return {
        id: String(p._id),
        name: p.name,
        unit: p.unit,
        stock: p.stock,
        perDay: Math.round(perDay * 10) / 10,
        daysLeft: daysLeft == null ? null : Math.round(daysLeft),
        stockoutDate: daysLeft == null ? null : dayKey(addDays(today, daysLeft)),
      };
    })
    .filter((s) => s.perDay > 0)
    .sort((a, b) => (a.daysLeft ?? Infinity) - (b.daysLeft ?? Infinity));

  return {
    daily,
    forecast,
    salesNext7: Math.round(salesNext7),
    salesNext30: Math.round(salesNext30),
    profitNext7: Math.round(profitNext7),
    profitNext30: Math.round(profitNext30),
    avgDailyRevenue: Math.round(avgDailyRevenue),
    trendPct,
    stockouts: stockouts.slice(0, 12),
    hasData: sales.length > 0,
  };
}

// Optional generative narrative — one short paragraph. Falls back to null.
export async function generativeProjection(facts) {
  if (!process.env.ANTHROPIC_API_KEY) return null;
  try {
    const { default: Anthropic } = await import("@anthropic-ai/sdk");
    const client = new Anthropic();
    const response = await client.messages.create({
      model: "claude-haiku-4-5",
      max_tokens: 300,
      system:
        "You are a concise business analyst for a small Indian shop owner. Given forecast figures, write 2-3 short plain-English sentences on what the numbers mean and one action to take. Rupee amounts use ₹. No markdown, no preamble.",
      messages: [
        { role: "user", content: `Forecast data: ${JSON.stringify(facts)}\n\nWrite the summary.` },
      ],
    });
    return response.content.find((b) => b.type === "text")?.text?.trim() || null;
  } catch {
    return null;
  }
}
