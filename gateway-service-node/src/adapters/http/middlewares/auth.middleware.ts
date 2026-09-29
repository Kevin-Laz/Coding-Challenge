import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { AUTH_CONSTANTS } from "../../../constants/auth.constants";

export interface AuthenticatedUserPayload {
  username: string;
  role: string;
}

export interface AuthenticatedRequest extends Request {
  user?: AuthenticatedUserPayload;
}

/**
 * Middleware que protege rutas privadas mediante validación de JSON Web Tokens (JWT).
 * Exige el encabezado HTTP: `Authorization: Bearer <token>`.
 */
export function authenticateJWT(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): void {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith(AUTH_CONSTANTS.JWT.BEARER_PREFIX)) {
    res.status(401).json({
      error: AUTH_CONSTANTS.MESSAGES.MISSING_TOKEN,
    });
    return;
  }

  const token = authHeader.substring(AUTH_CONSTANTS.JWT.BEARER_PREFIX.length).trim();
  const secret = process.env.JWT_SECRET || AUTH_CONSTANTS.JWT.DEFAULT_SECRET;

  try {
    const decoded = jwt.verify(token, secret) as AuthenticatedUserPayload;
    req.user = decoded;
    next();
  } catch (error: unknown) {
    res.status(401).json({
      error: AUTH_CONSTANTS.MESSAGES.INVALID_TOKEN,
      details: error instanceof Error ? error.message : undefined,
    });
  }
}
