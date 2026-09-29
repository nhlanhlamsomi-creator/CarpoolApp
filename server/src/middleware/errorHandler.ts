import type { ErrorRequestHandler, RequestHandler } from "express";

export class HttpError extends Error {
  constructor(
    public readonly status: number,
    message: string,
  ) {
    super(message);
    this.name = "HttpError";
  }
}

export const notFoundHandler: RequestHandler = (_request, response) => {
  response.status(404).json({ error: "Endpoint not found" });
};

export const errorHandler: ErrorRequestHandler = (
  error: unknown,
  request,
  response,
  next,
) => {
  if (response.headersSent) {
    next(error);
    return;
  }

  if (error instanceof HttpError) {
    response.status(error.status).json({ error: error.message });
    return;
  }

  if (
    error instanceof SyntaxError &&
    "status" in error &&
    error.status === 400
  ) {
    response.status(400).json({ error: "Invalid JSON request body" });
    return;
  }

  console.error("API request failed", {
    method: request.method,
    path: request.path,
    errorName: error instanceof Error ? error.name : "UnknownError",
  });
  response.status(500).json({ error: "Internal server error" });
};