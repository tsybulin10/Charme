function base32tohex(base32) {
  const base32chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";
  let bits = "";
  let hex = "";
  const clean = base32.replace(/=+$/, "").replace(/\s/g, "").toUpperCase();
  
  for (let i = 0; i < clean.length; i++) {
    const val = base32chars.indexOf(clean.charAt(i));
    if (val === -1) {
      throw new Error("Invalid base32 character: " + clean.charAt(i));
    }
    bits += val.toString(2).padStart(5, '0');
  }
  
  for (let i = 0; i + 4 <= bits.length; i += 4) {
    const chunk = bits.substr(i, 4);
    hex = hex + parseInt(chunk, 2).toString(16);
  }
  
  return hex;
}

function hexToBytes(hex) {
  const bytes = new Uint8Array(hex.length / 2);
  for (let i = 0; i < hex.length; i += 2) {
    bytes[i / 2] = parseInt(hex.substr(i, 2), 16);
  }
  return bytes;
}

export function generateBase32Secret() {
  const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";
  let result = "";
  for (let i = 0; i < 16; i++) {
    result += alphabet.charAt(Math.floor(Math.random() * alphabet.length));
  }
  return result;
}

export async function verifyTOTP(code, secretBase32) {
  const cleanCode = code.replace(/\s/g, "");
  if (!/^\d{6}$/.test(cleanCode)) return false;

  const epoch = Math.round(new Date().getTime() / 1000.0);
  const currentStep = Math.floor(epoch / 30);

  // Check current step, previous step, and next step to allow 30s clock drift
  for (let i = -1; i <= 1; i++) {
    const time = currentStep + i;
    const timeHex = time.toString(16).padStart(16, '0');
    const timeBytes = hexToBytes(timeHex);

    try {
      const keyHex = base32tohex(secretBase32);
      const keyBytes = hexToBytes(keyHex);

      const cryptoKey = await window.crypto.subtle.importKey(
        "raw",
        keyBytes,
        { name: "HMAC", hash: { name: "SHA-1" } },
        false,
        ["sign"]
      );

      const signature = await window.crypto.subtle.sign(
        "HMAC",
        cryptoKey,
        timeBytes
      );

      const hmac = new Uint8Array(signature);
      const offset = hmac[hmac.length - 1] & 0xf;
      const otp = (
        ((hmac[offset] & 0x7f) << 24) |
        ((hmac[offset + 1] & 0xff) << 16) |
        ((hmac[offset + 2] & 0xff) << 8) |
        (hmac[offset + 3] & 0xff)
      ) % 1000000;

      const formattedOtp = otp.toString().padStart(6, '0');
      if (formattedOtp === cleanCode) {
        return true;
      }
    } catch (err) {
      console.error("Verification error:", err);
      return false;
    }
  }
  return false;
}
