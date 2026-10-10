import { Router } from "express";

const router = Router();

router.get("/", (_request, response) => {
  const publishableKey = (
    process.env.CLERK_PUBLISHABLE_KEY ??
    process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY ??
    ""
  ).trim();

  if (!publishableKey || !/^pk_(test|live)_[A-Za-z0-9]+$/.test(publishableKey)) {
    response.status(503).json({ error: "Clerk is not configured" });
    return;
  }

  response.json({ clerkPublishableKey: publishableKey });
});

export default router;
