import * as OTPAuth from "otpauth";
import { getConfigs } from "./configs";

export const generateOTP = (phoneNumber: string, issuer: string, period: number = 60) => {
  const secret = new OTPAuth.Secret({ size: 20 });

  const totp = new OTPAuth.TOTP({
    // Provider or service the account is associated with.
    issuer: issuer || "phonenumber",
    // Account identifier.
    label: phoneNumber,
    // Algorithm used for the HMAC function, possible values are:
    //   "SHA1", "SHA224", "SHA256", "SHA384", "SHA512",
    //   "SHA3-224", "SHA3-256", "SHA3-384" and "SHA3-512".
    algorithm: "SHA1",
    // Length of the generated tokens.
    digits: 6,
    // Interval of time for which a token is valid, in seconds.
    period: period, // default by 60 seconds
    // Arbitrary key encoded in base32 or `OTPAuth.Secret` instance
    // (if omitted, a cryptographically secure random secret is generated).
    secret: secret,
    //   or: `OTPAuth.Secret.fromBase32("US3WHSG7X5KAPV27VANWKQHF3SH3HULL")`
    //   or: `new OTPAuth.Secret()`
  });
  const token = totp.generate();
  return {
    token,
    secret: secret.hex,
  };
};

export const validateOtp = ({
  token,
  secret,
  label,
  issuer,
  period = 60,
}: {
  token: string;
  secret: string;
  label?: string;
  issuer?: string;
  period?: number;
}): boolean => {
  try {
    const secretKey = OTPAuth.Secret.fromHex(secret);

    const totp = new OTPAuth.TOTP({
      issuer: issuer || "phonenumber",
      label: label || "user",
      algorithm: "SHA1",
      digits: 6,
      period: period,
      secret: secretKey,
    });

    const { appEnv } = getConfigs();

    // For development and staging environments, accept "123456" as valid token
    if (appEnv === "development") {
      if (token === "123456") {
        return true;
      }
    }

    // For all environments, validate OTP normally
    const result = totp.validate({ token });
    return result !== null;
  } catch (error) {
    return false;
  }
};
