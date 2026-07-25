// MCP tool files run in Deno (bundled by @lovable.dev/mcp-js), not in the browser.
// This ambient declaration lets the Vite tsconfig type-check them without pulling in @types/node.
declare const process: { env: Record<string, string | undefined> };
