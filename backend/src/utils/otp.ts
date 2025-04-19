import { prisma } from "@/database/prisma";
import bcryptjs from "bcryptjs";
import crypto from "crypto";
import * as OTPAuth from "otpauth";
import { getConfigs } from "./configs";

const OTP_VALIDITY = 15 * 60;
const OTP_DIGITS = 6;

/**
 * Generates a one-time password (OTP) for the given email
 * Now using the otpauth library for TOTP (Time-based One-Time Password)
 * @param email - The email address
 * @returns A 6-digit OTP code
 */
export function generateOTP(email?: string): string {
  const { appEnv } = getConfigs();
  if (!email || appEnv === "development" || appEnv === "staging") {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  const totp = new OTPAuth.TOTP({
    issuer: "WeatherReport",
    label: email,
    algorithm: "SHA1",
    digits: OTP_DIGITS,
    period: OTP_VALIDITY,
    secret: generateSecret(email),
  });

  return totp.generate();
}

/**
 * Generate a secret for TOTP based on email and app secret
 * @param email - User's email address
 * @returns A secret key for TOTP
 */
function generateSecret(email: string): OTPAuth.Secret {
  const appSecret = getConfigs().secretKeyBase || "default-secret-key";
  const secretBase = `${email}:${appSecret}:${Math.floor(Date.now() / (OTP_VALIDITY * 1000))}`;
  const hash = crypto.createHash("sha256").update(secretBase).digest("hex").substring(0, 20);
  return OTPAuth.Secret.fromUTF8(hash);
}

/**
 * Hash OTP for secure storage
 * @param otp - The OTP to hash
 * @returns Hashed OTP string
 */
export function hashOTP(otp: string): string {
  return bcryptjs.hashSync(otp, 5);
}

/**
 * Compare plain OTP with hashed OTP
 * @param plainOTP - The plain text OTP
 * @param hashedOTP - The hashed OTP from database
 * @returns Boolean indicating if OTP matches
 */
export function compareOTP(plainOTP: string, hashedOTP: string): boolean {
  return bcryptjs.compareSync(plainOTP, hashedOTP);
}

/**
 * Save OTP to database
 * @param email - User's email address
 * @param otp - The OTP to save
 */
export async function saveOTP(email: string, otp: string): Promise<void> {
  const hashedOTP = hashOTP(otp);

  await prisma.oTP.deleteMany({
    where: { email },
  });

  await prisma.oTP.create({
    data: {
      email,
      hashedOTP,
    },
  });
}

/**
 * Verify OTP from database
 * @param email - User's email address
 * @param otp - The OTP to verify
 * @returns Boolean indicating if OTP is valid
 */
export async function verifyOTPFromDB(email: string, otp: string): Promise<boolean> {
  const otpRecord = await prisma.oTP.findUnique({
    where: { email },
  });

  if (!otpRecord) {
    return false;
  }

  const otpCreatedAt = new Date(otpRecord.createdAt);
  const now = new Date();
  const diffInMinutes = (now.getTime() - otpCreatedAt.getTime()) / (1000 * 60);

  if (diffInMinutes > 15) {
    await prisma.oTP.delete({
      where: { email },
    });
    return false;
  }

  const isValid = compareOTP(otp, otpRecord.hashedOTP);

  if (isValid) {
    await prisma.oTP.delete({
      where: { email },
    });
  }

  return isValid;
}

/**
 * Verify TOTP directly without database
 * @param email - User's email address
 * @param otp - The OTP to verify
 * @returns Boolean indicating if OTP is valid
 */
export function verifyTOTP(email: string, otp: string): boolean {
  const { appEnv } = getConfigs();

  if (appEnv === "development" || appEnv === "staging") {
    if (otp === "123456") {
      return true;
    }
  }

  const totp = new OTPAuth.TOTP({
    issuer: "WeatherReport",
    label: email,
    algorithm: "SHA1",
    digits: OTP_DIGITS,
    period: OTP_VALIDITY,
    secret: generateSecret(email),
  });

  return totp.validate({ token: otp, window: 1 }) !== null;
}

/**
 * Create and store a legacy OTP with secret for compatibility
 * @param identifier - The email or other identifier
 * @param type - The type of OTP (e.g., 'user', 'merchant')
 * @returns An object containing the OTP token and secret
 */
export const createLegacyOTP = (identifier: string, type: string): { token: string; secret: string } => {
  const token = generateOTP();

  const hash = crypto.createHmac("sha256", token).update(`${identifier}:${type}`).digest("hex");

  return {
    token,
    secret: hash,
  };
};

/**
 * Verify a legacy OTP with its secret
 * @param token - The OTP token to verify
 * @param secret - The previously generated secret
 * @param identifier - The email or other identifier
 * @param type - The type of OTP
 * @returns A boolean indicating whether the OTP is valid
 */
export const verifyLegacyOTP = (token: string, secret: string, identifier: string, type: string): boolean => {
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

    if (appEnv === "development" || appEnv === "staging") {
      if (token === "123456") {
        return true;
      }
    }

    return verifyLegacyOTP(token, secret, identifier, type);
  } catch (error) {
    return false;
  }
};

/**
 * Setup a cron job to clean up expired OTPs
 * Deletes OTPs older than 15 minutes
 */
export async function cleanupExpiredOTPs(): Promise<void> {
  const fifteenMinutesAgo = new Date(Date.now() - 15 * 60 * 1000);

  await prisma.oTP.deleteMany({
    where: {
      createdAt: {
        lt: fifteenMinutesAgo,
      },
    },
  });
}
