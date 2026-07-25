import { createClient } from "@supabase/supabase-js";
import { defineTool, type ToolContext } from "@lovable.dev/mcp-js";
import { z } from "zod";

function client(ctx: ToolContext) {
  return createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_PUBLISHABLE_KEY!, {
    global: { headers: { Authorization: `Bearer ${ctx.getToken()}` } },
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

export default defineTool({
  name: "search_faqs",
  title: "Search CDBL FAQs",
  description: "Search Frequently Asked Questions by keyword. Returns matching question/answer pairs.",
  inputSchema: {
    query: z.string().min(1).describe("Keyword or phrase to search for."),
  },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: async ({ query }, ctx) => {
    const { data, error } = await client(ctx)
      .from("faqs")
      .select("id, question, answer, category")
      .or(`question.ilike.%${query}%,answer.ilike.%${query}%`)
      .order("display_order")
      .limit(20);

    if (error) return { content: [{ type: "text", text: error.message }], isError: true };
    return {
      content: [{ type: "text", text: JSON.stringify(data, null, 2) }],
      structuredContent: { faqs: data ?? [] },
    };
  },
});
