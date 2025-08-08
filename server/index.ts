import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
// setupVite/serveStatic are useful for local dev with a custom server,
// but not needed inside a Vercel Serverless Function.

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// request logging (optional)
app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json.bind(res);
  (res as any).json = function (bodyJson: any, ...args: any[]) {
    capturedJsonResponse = bodyJson;
    return originalResJson(bodyJson, ...args);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        try {
          logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
        } catch {}
      }
      if (logLine.length > 80) logLine = logLine.slice(0, 79) + "…";
      console.log(logLine);
    }
  });

  next();
});

// Attach routes (ignore any return value; do not call listen)
(async () => {
  await registerRoutes(app);
})();

// Centralized error handler (no throw; just respond)
app.use((err: unknown, _req: Request, res: Response, _next: NextFunction) => {
  const status =
    (typeof err === "object" && err && "status" in err && Number((err as any).status)) ||
    (typeof err === "object" && err && "statusCode" in err && Number((err as any).statusCode)) ||
    500;
  const message = err instanceof Error ? err.message : "Internal Server Error";
  res.status(status).json({ message });
});

// Export the Express app as the Serverless Function handler
export default app;
