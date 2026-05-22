const fallback = (stats) => {
  const leader = stats?.leader;
  const chaser = stats?.chaser;
  const lastResult = stats?.lastResult;

  if (stats?.purpose === "report" && lastResult) {
    const rank = stats?.player?.rank ? `Wallet rank #${stats.player.rank}` : "Wallet rank pending";
    const todayRank = stats?.player?.todayRank ? `today #${stats.player.todayRank}` : "today board pending";
    return lastResult.goal
      ? `${lastResult.squad} delivers under pressure: ${lastResult.shot} shot, keeper ${lastResult.keeper}, ${lastResult.points} points. ${rank}, ${todayRank}.`
      : `${lastResult.squad} survives a keeper read: ${lastResult.shot} shot met by ${lastResult.keeper}, ${lastResult.points} grit points. ${rank}, ${todayRank}.`;
  }

  if (lastResult) {
    return lastResult.goal
      ? `${lastResult.squad} scores. The AI keeper guessed ${lastResult.keeper}, but the shot went ${lastResult.shot}. The squad earns ${lastResult.points} points.`
      : `${lastResult.squad} is denied. The keeper read ${lastResult.shot} perfectly and keeps the arena tense.`;
  }

  if (!leader) {
    return "The arena is open. No squad has taken control yet.";
  }

  if (!chaser) {
    return `${leader.name} Squad controls the spot with ${leader.points} points. One challenger could still change the story.`;
  }

  const gap = leader.points - chaser.points;
  return gap === 0
    ? `${leader.name} and ${chaser.name} are level. The next penalty can flip the table.`
    : `${leader.name} leads ${chaser.name} by ${gap} points. The pressure is on.`;
};

const cache = new Map();
const MAX_BODY_BYTES = 8000;
const CACHE_TTL_MS = 45000;

async function readJson(req) {
  if (req.body && typeof req.body === "object") return req.body;
  const chunks = [];
  let size = 0;
  for await (const chunk of req) {
    size += chunk.length;
    if (size > MAX_BODY_BYTES) {
      throw new Error("Payload too large");
    }
    chunks.push(chunk);
  }
  if (!chunks.length) return {};
  return JSON.parse(Buffer.concat(chunks).toString("utf8"));
}

function normalizeBody(body) {
  return {
    purpose: String(body?.purpose || "commentary").slice(0, 20),
    totalShots: Number(body?.totalShots || 0),
    totalGoals: Number(body?.totalGoals || 0),
    leader: body?.leader
      ? {
          name: String(body.leader.name || "").slice(0, 60),
          points: Number(body.leader.points || 0),
          goals: Number(body.leader.goals || 0),
          shots: Number(body.leader.shots || 0),
          todayPoints: Number(body.leader.todayPoints || 0),
        }
      : null,
    chaser: body?.chaser
      ? {
          name: String(body.chaser.name || "").slice(0, 60),
          points: Number(body.chaser.points || 0),
          goals: Number(body.chaser.goals || 0),
          shots: Number(body.chaser.shots || 0),
          todayPoints: Number(body.chaser.todayPoints || 0),
        }
      : null,
    player: body?.player
      ? {
          rank: Number(body.player.rank || 0),
          todayRank: Number(body.player.todayRank || 0),
          points: Number(body.player.points || 0),
          streak: Number(body.player.streak || 0),
        }
      : null,
    lastResult: body?.lastResult
      ? {
          squad: String(body.lastResult.squad || "").slice(0, 60),
          shot: String(body.lastResult.shot || "").slice(0, 16),
          keeper: String(body.lastResult.keeper || "").slice(0, 16),
          goal: Boolean(body.lastResult.goal),
          points: Number(body.lastResult.points || 0),
        }
      : null,
  };
}

module.exports = async (req, res) => {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    res.statusCode = 405;
    res.end(JSON.stringify({ error: "Method not allowed" }));
    return;
  }

  let body;
  try {
    body = await readJson(req);
  } catch {
    res.statusCode = 400;
    res.end(JSON.stringify({ error: "Invalid JSON" }));
    return;
  }

  body = normalizeBody(body);
  const fallbackText = fallback(body);
  const cacheKey = JSON.stringify(body);
  const cached = cache.get(cacheKey);
  if (cached && Date.now() - cached.createdAt < CACHE_TTL_MS) {
    res.setHeader("Content-Type", "application/json");
    res.end(JSON.stringify({ commentary: cached.commentary, source: cached.source, cached: true }));
    return;
  }

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    res.setHeader("Content-Type", "application/json");
    res.end(JSON.stringify({ commentary: fallbackText, source: "fallback" }));
    return;
  }

  try {
    const response = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: process.env.OPENAI_MODEL || "gpt-4.1-mini",
        input: [
          {
            role: "system",
            content:
              body.purpose === "report"
                ? "You are the XKick Oracle, writing a shareable World Cup match report for an on-chain X Layer penalty shootout. Write one vivid sentence under 42 words. Mention wallet rank if present. No hashtags. No markdown."
                : "You are the XKick Oracle, a punchy World Cup AI commentator for an on-chain X Layer penalty shootout game. Write one vivid sentence under 45 words. No hashtags. No markdown.",
          },
          {
            role: "user",
            content: JSON.stringify(body),
          },
        ],
        max_output_tokens: 90,
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenAI request failed: ${response.status}`);
    }

    const data = await response.json();
    const text =
      data.output_text ||
      data.output?.flatMap((item) => item.content || []).find((item) => item.type === "output_text")?.text ||
      fallbackText;

    res.setHeader("Content-Type", "application/json");
    cache.set(cacheKey, { commentary: text, source: "openai", createdAt: Date.now() });
    res.end(JSON.stringify({ commentary: text, source: "openai" }));
  } catch {
    res.setHeader("Content-Type", "application/json");
    res.end(JSON.stringify({ commentary: fallbackText, source: "fallback" }));
  }
};
