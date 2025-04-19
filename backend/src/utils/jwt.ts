import jwt from "jsonwebtoken";

import { encrypt, decrypt } from "@/utils/crypto";
import { getConfigs } from "./configs";

const defaultSecret = getConfigs().secretKeyBase;

export function encodeJwt(payload: any, secret = defaultSecret, expired = "3d") {
  return {
    token: jwt.sign(payload, String(secret), {
      expiresIn: expired,
    }),
    refreshToken: jwt.sign(payload, String(secret), {
      expiresIn: "7d",
    }),
  };
}

export function decodeJwt(token: string, secret = defaultSecret) {
  return jwt.verify(token, String(secret));
}

export function encryptJwt(publicPayload: any, privatePayload: any, secret: string, options: any) {
  const encryptedPrivatePayload = encrypt(JSON.stringify(privatePayload), secret);
  return jwt.sign(
    {
      ...publicPayload,
      privateData: encryptedPrivatePayload,
    },
    secret,
    options
  );
}

export function decryptJwt(token: string, secret: string) {
  const { privateData, ...publicPayload }: any = jwt.verify(token, secret);

  let decryptedData;
  try {
    const decryptedString = decrypt(privateData, secret);
    decryptedData = JSON.parse(decryptedString);
  } catch (error) {
    console.log(error);
  }

  return {
    publicPayload: publicPayload,
    privatePayload: decryptedData,
  };
}
