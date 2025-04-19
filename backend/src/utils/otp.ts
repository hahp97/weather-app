import crypto from "crypto";
import { getConfigs } from "./configs";

/**
 * Generates a one-time password (OTP) for the given email and type
 * @param identifier - The email or other identifier
 * @param type - The type of OTP (e.g., 'user', 'merchant')
 * @returns An object containing the OTP token and secret
 */
export const generateOTP = (identifier: string, type: string): { token: string; secret: string } => {
  // Generate a 6-digit OTP
  const token = Math.floor(100000 + Math.random() * 900000).toString();

  // Create a hash using the token, identifier, and type
  const hash = crypto.createHmac("sha256", token).update(`${identifier}:${type}`).digest("hex");

  return {
    token,
    secret: hash,
  };
};

/**
 * Verifies if the provided OTP is valid
 * @param token - The OTP token to verify
 * @param secret - The previously generated secret
 * @param identifier - The email or other identifier
 * @param type - The type of OTP
 * @returns A boolean indicating whether the OTP is valid
 */
export const verifyOTP = (token: string, secret: string, identifier: string, type: string): boolean => {
  const hash = crypto.createHmac("sha256", token).update(`${identifier}:${type}`).digest("hex");

  return hash === secret;
};

/**
 * Validates an OTP with support for development mode
 * @param options - Validation options
 * @returns A boolean indicating if the OTP is valid
 */
export const validateOtp = ({
  token,
  secret,
  identifier,
  type = "user",
}: {
  token: string;
  secret: string;
  identifier: string;
  type?: string;
}): boolean => {
  try {
    const { appEnv } = getConfigs();

    // For development and staging environments, accept "123456" as valid token
    if (appEnv === "development" || appEnv === "staging") {
      if (token === "123456") {
        return true;
      }
    }

    // For all environments, validate OTP normally
    return verifyOTP(token, secret, identifier, type);
  } catch (error) {
    return false;
  }
};
