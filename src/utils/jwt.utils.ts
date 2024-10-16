import jwt from "jsonwebtoken";
import config from "config";

export function signJwts(
  object: Object,
  keyName: "accessTokenPrivateKey" | "refreshTokenPrivateKey",
  options?: jwt.SignOptions | undefined
) {
  const signingKey = Buffer.from(
    config.get<string>(keyName),
    "base64"
  ).toString("ascii");

  return jwt.sign(object, signingKey, {
    ...(options && options),
    algorithm: "RS256",
  });
}

export function signJwt(
  object: Object,
  keyName: string, // Change this to a single secret key name (e.g. JWT_SECRET)
  options?: jwt.SignOptions | undefined
) {
  const secretKey = process.env.JWT_SECRET || "your_secret_key"; // Use JWT_SECRET for HS256
  return jwt.sign(object, secretKey, {
    ...(options && options),
    algorithm: "HS256", // Use HS256
  });
}

export function verifyJwt(
  token: string,
  keyName: string // Use the same secret key for verification
) {
  const secretKey = process.env.JWT_SECRET || "your_secret_key"; // Use the same secret
  try {
    const decoded = jwt.verify(token, secretKey, { algorithms: ["HS256"] });
    return {
      valid: true,
      expired: false,
      decoded,
    };
  } catch (e: any) {
    console.error(e);
    return {
      valid: false,
      expired: e.message === "jwt expired",
      decoded: null,
    };
  }
}

export function verifyJwts(
  token: string,
  keyName: "accessTokenPublicKey" | "refreshTokenPublicKey"
) {
  const publicKey = Buffer.from(config.get<string>(keyName), "base64").toString(
    "ascii"
  );

  try {
    // const decoded = jwt.verify(token, publicKey);
    const decoded = jwt.verify(token, publicKey, { algorithms: ["RS256"] });
    return {
      valid: true,
      expired: false,
      decoded,
    };
  } catch (e: any) {
    console.error(e);
    return {
      valid: false,
      expired: e.message === "jwt expired",
      decoded: null,
    };
  }
}
