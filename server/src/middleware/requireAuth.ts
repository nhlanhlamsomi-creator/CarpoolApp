import { verifyToken } from "@clerk/backend";
import type { RequestHandler } from "express";

export const requireAuth: RequestHandler = async (request, response, next) => {
  const authorization = request.header("authorization");
  const token = authorization?.match(/^Bearer\s+(.+)$/i)?.[1];

  if (!token) {
    response.status(401).json({ error: "Authentication required" });
    return;
  }

  const secretKey = process.env.CLERK_SECRET_KEY;
  if (!secretKey) {
    response.status(500).json({ error: "Authentication is not configured" });
    return;
  }

  try {
    const claims = await verifyToken(token, { secretKey });
    if (typeof claims.sub !== "string" || !claims.sub) {
      response.status(401).json({ error: "Invalid or expired session token" });
      return;
    }

    response.locals.authUserId = claims.sub;
    next();
  } catch {
    response.status(401).json({ error: "Invalid or expired session token" });
  }
};