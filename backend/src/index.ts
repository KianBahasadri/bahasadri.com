import { Hono } from "hono";

const app = new Hono();

app.all("*", (c) => c.json({ success: true }));

export default app;
