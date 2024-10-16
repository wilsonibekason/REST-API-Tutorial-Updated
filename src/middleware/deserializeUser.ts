import { get } from "lodash";
import { Request, Response, NextFunction } from "express";
import { verifyJwt } from "../utils/jwt.utils";
import { reIssueAccessToken } from "../service/session.service";

const deserializeUser = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const accessToken = get(req, "headers.authorization", "").replace(
    /^Bearer\s/,
    ""
  );

  const refreshToken = get(req, "headers.x-refresh");

  console.log("Received Access Token:", accessToken);
  if (!accessToken) {
    return next();
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
    return next();
  }

  return next();
};

export default deserializeUser;
