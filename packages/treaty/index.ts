import { treaty } from "@elysiajs/eden";
import type { App } from "@api/app.ts";

const baseUrl = process.env.YUE_API_URL ?? "http://localhost:3000";

export const api = treaty<App>(baseUrl);
