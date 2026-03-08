import { checkRateLimit } from "@/lib/rate-limit";
import { runVisitorIntelPipeline } from "@/lib/agents/coordinator";
import type { VisitorSignals } from "@/lib/agents/tracker-agent";

export const maxDuration = 60;

const visitorIntelRateLimit = {
  max: 15,
  windowMs: 15 * 60 * 1000,
  prefix: "visitor-intel",
};

export async function POST(req: Request) {
  // Rate limit: 15 requests per 15 minutes per IP
  const rl = await checkRateLimit(visitorIntelRateLimit);
  if (!rl.success) {
    return new Response(
      JSON.stringify({
        error: "Too many requests. Please try again later.",
      }),
      {
        status: 429,
        headers: {
          "Content-Type": "application/json",
          "Retry-After": String(Math.ceil(rl.retryAfterMs / 1000)),
        },
      }
    );
  }

  let signals: VisitorSignals;
  try {
    signals = await req.json();
  } catch {
    return new Response(JSON.stringify({ error: "Invalid request body" }), {
      status: 400,
    });
  }

  // Basic validation
  if (!signals || typeof signals !== "object") {
    return new Response(JSON.stringify({ error: "Missing visitor signals" }), {
      status: 400,
    });
  }

  try {
    const stream = await runVisitorIntelPipeline(signals);

    return new Response(stream, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache, no-transform",
        Connection: "keep-alive",
      },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("[visitor-intel] Error:", message);
    return new Response(JSON.stringify({ error: "Pipeline failed" }), {
      status: 500,
    });
  }
}
