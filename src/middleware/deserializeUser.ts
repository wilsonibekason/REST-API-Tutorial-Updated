import { get } from "lodash";
import { Request, Response, NextFunction } from "express";
import { verifyJwt } from "../utils/jwt.utils";
import { reIssueAccessToken } from "../service/session.service";
import { isTokenBlacklisted } from "../utils/tokenBlacklistService";

const deserializeUser = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const accessToken = get(req, "headers.authorization", "").replace(
    /^Bearer\s/,
    ""
  );
  //  const token = req.headers.authorization?.split(" ")[1]; // Bearer token

  const refreshToken = get(req, "headers.x-refresh");

  console.log("Received Access Token:", accessToken);
  if (!accessToken) {
    return next();
  } // Check if the token is blacklisted
  const isBlacklisted = await isTokenBlacklisted(accessToken);
  if (isBlacklisted) {
    return res.status(401).send("Token is blacklisted.");
  }

  const { decoded, expired, valid } = verifyJwt(
    accessToken,
    "accessTokenPublicKey"
  );

  // decoded replaced with valid
  if (valid) {
    console.log("Decoded User from Access Token:", decoded);
    res.locals.user = decoded;
    return next();
  }

  if (expired && refreshToken) {
    const token = Array.isArray(refreshToken) ? refreshToken[0] : refreshToken;
    const newAccessToken = await reIssueAccessToken({ refreshToken: token });

    if (newAccessToken) {
      res.setHeader("x-access-token", newAccessToken);
    }

    const result = verifyJwt(newAccessToken as string, "accessTokenPublicKey");

    res.locals.user = result.decoded;
    console.log("Newly Decoded User from Access Token:", decoded);
    console.log("user Response", res.locals.user);
    return next();
  }

  console.log("user Response", res.locals.user);

  return next();
};

export default deserializeUser;
