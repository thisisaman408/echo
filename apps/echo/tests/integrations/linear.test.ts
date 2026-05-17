import { afterEach, describe, expect, it, vi } from "vitest";

const createIssueMock = vi.fn();
const usersMock = vi.fn();

vi.mock("@linear/sdk", () => ({
  LinearClient: class {
    createIssue = createIssueMock;
    users = usersMock;
  },
}));

afterEach(() => {
  vi.clearAllMocks();
});

describe("linear.createIssue", () => {
  it("creates an issue with the mapped priority and resolved assignee", async () => {
    usersMock.mockResolvedValue({
      nodes: [{ id: "user_42" }],
    });
    createIssueMock.mockResolvedValue({
      issue: Promise.resolve({
        id: "issue_1",
        identifier: "ECH-1",
        url: "https://linear.app/x/issue/ECH-1",
        title: "Send proposal",
      }),
    });

    const { createIssue } = await import("@/integrations/linear");

    const result = await createIssue({
      title: "Send proposal",
      description: "Body",
      priority: "high",
      assigneeEmail: "sarah@acme.com",
    });

    expect(result.identifier).toBe("ECH-1");
    expect(createIssueMock).toHaveBeenCalledWith(
      expect.objectContaining({
        title: "Send proposal",
        priority: 2,
        assigneeId: "user_42",
      }),
    );
  });

  it("throws when the SDK returns no issue", async () => {
    usersMock.mockResolvedValue({ nodes: [] });
    createIssueMock.mockResolvedValue({ issue: Promise.resolve(undefined) });

    const { createIssue } = await import("@/integrations/linear");

    await expect(
      createIssue({ title: "x" }),
    ).rejects.toThrow(/no issue/);
  });
});
