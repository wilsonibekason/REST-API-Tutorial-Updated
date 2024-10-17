import { createClient } from "redis";
import jwt from "jsonwebtoken";

// Initialize Redis client
const redisClient = createClient();

redisClient.on("error", (err) => console.error("Redis Client Error", err));

// Connect to Redis
redisClient.connect();

// Function to add token to Redis blacklist
export async function addToTokenBlacklist(token: string) {
  try {
    // Decode the token to get its expiration
    const decoded: any = jwt.decode(token);

    if (!decoded || !decoded.exp) {
      throw new Error("Invalid token");
    }

    const expirationTimeInSeconds = decoded.exp - Math.floor(Date.now() / 1000);

    // Add the token to the Redis blacklist with an expiration time
    await redisClient.setEx(token, expirationTimeInSeconds, "blacklisted");

    console.log("Token blacklisted successfully.");
  } catch (error) {
    console.error("Error blacklisting token: ", error);
    throw new Error("Failed to blacklist token.");
  }
}

// Function to check if a token is blacklisted
export async function isTokenBlacklisted(token: string): Promise<boolean> {
  try {
    const result = await redisClient.get(token);
    return result === "blacklisted";
  } catch (error) {
    console.error("Error checking token blacklist: ", error);
    return false;
  }
}
