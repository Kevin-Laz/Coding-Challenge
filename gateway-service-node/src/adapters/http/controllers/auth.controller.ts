import { Request, Response } from "express";
import jwt from "jsonwebtoken";
import { AUTH_CONSTANTS } from "../../../constants/auth.constants";

export class AuthController {
  /**
   * Endpoint público POST /auth/login para emitir JWTs a clientes autorizados.
   */
  public handleLogin = async (req: Request, res: Response): Promise<void> => {
    const { username, password } = req.body;

    if (!username || !password) {
      res.status(400).json({
        error: AUTH_CONSTANTS.MESSAGES.MISSING_CREDENTIALS,
      });
      return;
    }

    const expectedUser = process.env.AUTH_USERNAME || AUTH_CONSTANTS.MOCK_USER.DEFAULT_USERNAME;
    const expectedPass = process.env.AUTH_PASSWORD || AUTH_CONSTANTS.MOCK_USER.DEFAULT_PASSWORD;

    if (username !== expectedUser || password !== expectedPass) {
      res.status(401).json({
        error: AUTH_CONSTANTS.MESSAGES.INVALID_CREDENTIALS,
      });
      return;
    }

    const secret = process.env.JWT_SECRET || AUTH_CONSTANTS.JWT.DEFAULT_SECRET;
    const expiresIn = (process.env.JWT_EXPIRES_IN || AUTH_CONSTANTS.JWT.DEFAULT_EXPIRES_IN) as jwt.SignOptions["expiresIn"];

    const token = jwt.sign(
      {
        username,
        role: "admin",
      },
      secret,
      { expiresIn }
    );

    res.status(200).json({
      message: AUTH_CONSTANTS.MESSAGES.LOGIN_SUCCESS,
      token,
      tokenType: "Bearer",
      expiresIn,
    });
  };
}
