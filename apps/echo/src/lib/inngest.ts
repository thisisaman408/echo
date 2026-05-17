import { Inngest } from "inngest";

/**
 * ECHO event bus. `meetingId` is the universal correlation key across the
 * 5-agent pipeline. Event payloads are kept loosely typed here and validated
 * at the consuming function boundary with Zod.
 */
export type EchoEvent =
  | {
      name: "echo/meeting.recording_done";
      data: { recallBotId: string; recordingUrl?: string };
    }
  | {
      name: "echo/agents.start";
      data: { meetingId: string };
    }
  | {
      name: "echo/agent.completed";
      data: {
        meetingId: string;
        agent:
          | "action_extractor"
          | "stakeholder_classifier"
          | "decision_maker"
          | "comms_drafter"
          | "executor";
        durationMs: number;
      };
    };

export const inngest = new Inngest({ id: "echo" });
