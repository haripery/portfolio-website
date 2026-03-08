import {
  TRACKER_AGENT_CARD,
  PROFILER_AGENT_CARD,
  ADVISOR_AGENT_CARD,
  COORDINATOR_AGENT_CARD,
} from "@/lib/protocols/a2a";

/**
 * A2A Agent Card Discovery Endpoint
 *
 * Returns all registered agent cards as a JSON array,
 * following the A2A protocol specification.
 */
export async function GET() {
  return Response.json({
    agents: [
      COORDINATOR_AGENT_CARD,
      TRACKER_AGENT_CARD,
      PROFILER_AGENT_CARD,
      ADVISOR_AGENT_CARD,
    ],
  });
}
