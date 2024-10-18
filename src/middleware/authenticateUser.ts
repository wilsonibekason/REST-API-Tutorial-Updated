import { get } from "lodash";
import { Request, Response, NextFunction } from "express";
import { verifyJwt } from "../utils/jwt.utils";
import { reIssueAccessToken } from "../service/session.service";
import { isTokenBlacklisted } from "../utils/tokenBlacklistService";

const authenticate = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const accessToken = get(req, "headers.authorization", "").replace(
    /^Bearer\s/,
    ""
  );

  if (!accessToken) {
    return res.status(401).send("Access token is missing.");
  }

  const isBlacklisted = await isTokenBlacklisted(accessToken);
  if (isBlacklisted) {
    return res.status(401).send("Token is blacklisted.");
  }

  const { decoded, expired, valid } = verifyJwt(
    accessToken,
    "accessTokenPublicKey"
  );

  if (!valid) {
    return res.status(401).send("Invalid token.");
  }
  if (expired && req.headers["x-refresh"]) {
    const refreshToken = req.headers["x-refresh"];
    const token = Array.isArray(refreshToken) ? refreshToken[0] : refreshToken;

    if (typeof token !== "string") {
      return res.status(401).send("Invalid refresh token.");
    }

    const newAccessToken = await reIssueAccessToken({ refreshToken: token });
    if (newAccessToken) {
      res.setHeader("x-access-token", newAccessToken);
    }

    const result = verifyJwt(newAccessToken as string, "accessTokenPublicKey");
    req.user = result.decoded;
  } else {
    req.user = decoded;
  }

  next();
};

export default authenticate;
