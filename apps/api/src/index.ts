import { api } from "./app";

const port = Number(process.env.PORT ?? 3000);

api.listen(port);

console.log(`api listening on http://localhost:${port}`);

export type App = typeof api;
