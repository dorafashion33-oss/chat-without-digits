// End-to-end encryption for Buzz offline / Bluetooth nearby chats.
// ECDH P-256 key agreement + AES-GCM 256 message encryption. No server involved.

const IDENTITY_KEY = "buzz:nearby-identity";
const PEER_KEY = "buzz:nearby-peer";
const DEVICE_NAME_KEY = "buzz:nearby-device-name";

export interface NearbyIdentity {
  publicJwk: JsonWebKey;
  privateJwk: JsonWebKey;
}

export interface PairedPeer {
  name: string;
  publicJwk: JsonWebKey;
  safetyNumber: string;
  pairedAt: number;
}

export interface PairingPayload {
  v: 1;
  n: string; // device name
  k: JsonWebKey; // public key
}

const enc = new TextEncoder();
const dec = new TextDecoder();

const toB64 = (buf: ArrayBuffer) => btoa(String.fromCharCode(...new Uint8Array(buf)));
const fromB64 = (s: string) => Uint8Array.from(atob(s), (c) => c.charCodeAt(0));

/* ---------------- device name ---------------- */

export function getDeviceName(): string {
  let name = localStorage.getItem(DEVICE_NAME_KEY);
  if (!name) {
    const ua = navigator.userAgent;
    const guess = /Android/i.test(ua) ? "Android" : /iPhone|iPad/i.test(ua) ? "iPhone" : /Mac/i.test(ua) ? "Mac" : /Windows/i.test(ua) ? "Windows" : "Device";
    name = `Buzz ${guess} ${Math.floor(1000 + Math.random() * 9000)}`;
    localStorage.setItem(DEVICE_NAME_KEY, name);
  }
  return name;
}

export function setDeviceName(name: string) {
  localStorage.setItem(DEVICE_NAME_KEY, name.trim().slice(0, 40) || getDeviceName());
}

/* ---------------- identity ---------------- */

export async function getIdentity(): Promise<NearbyIdentity> {
  const cached = localStorage.getItem(IDENTITY_KEY);
  if (cached) {
    try {
      return JSON.parse(cached) as NearbyIdentity;
    } catch {
      /* regenerate below */
    }
  }
  const pair = await crypto.subtle.generateKey({ name: "ECDH", namedCurve: "P-256" }, true, ["deriveKey", "deriveBits"]);
  const identity: NearbyIdentity = {
    publicJwk: await crypto.subtle.exportKey("jwk", pair.publicKey),
    privateJwk: await crypto.subtle.exportKey("jwk", pair.privateKey),
  };
  localStorage.setItem(IDENTITY_KEY, JSON.stringify(identity));
  return identity;
}

/* ---------------- pairing ---------------- */

export async function buildPairingPayload(): Promise<string> {
  const id = await getIdentity();
  const payload: PairingPayload = { v: 1, n: getDeviceName(), k: id.publicJwk };
  return "buzz-pair:" + btoa(JSON.stringify(payload));
}

export function parsePairingPayload(raw: string): PairingPayload | null {
  try {
    const body = raw.trim().replace(/^buzz-pair:/, "");
    const parsed = JSON.parse(atob(body)) as PairingPayload;
    if (parsed?.v !== 1 || !parsed.k || !parsed.n) return null;
    return parsed;
  } catch {
    return null;
  }
}

/** Human-verifiable safety number derived from both public keys (order-independent). */
export async function computeSafetyNumber(a: JsonWebKey, b: JsonWebKey): Promise<string> {
  const parts = [`${a.x}${a.y}`, `${b.x}${b.y}`].sort();
  const digest = await crypto.subtle.digest("SHA-256", enc.encode(parts.join("|")));
  const bytes = new Uint8Array(digest).slice(0, 6);
  const groups: string[] = [];
  for (let i = 0; i < 6; i += 2) {
    groups.push(String(((bytes[i] << 8) | bytes[i + 1]) % 100000).padStart(5, "0"));
  }
  return groups.join(" ");
}

export async function pairWithPayload(payload: PairingPayload): Promise<PairedPeer> {
  const id = await getIdentity();
  const safetyNumber = await computeSafetyNumber(id.publicJwk, payload.k);
  const peer: PairedPeer = { name: payload.n, publicJwk: payload.k, safetyNumber, pairedAt: Date.now() };
  localStorage.setItem(PEER_KEY, JSON.stringify(peer));
  return peer;
}

export function getPairedPeer(): PairedPeer | null {
  try {
    const raw = localStorage.getItem(PEER_KEY);
    return raw ? (JSON.parse(raw) as PairedPeer) : null;
  } catch {
    return null;
  }
}

export function unpair() {
  localStorage.removeItem(PEER_KEY);
}

/* ---------------- encryption ---------------- */

async function deriveKey(peerPublicJwk: JsonWebKey): Promise<CryptoKey> {
  const id = await getIdentity();
  const priv = await crypto.subtle.importKey("jwk", id.privateJwk, { name: "ECDH", namedCurve: "P-256" }, false, ["deriveKey"]);
  const pub = await crypto.subtle.importKey("jwk", peerPublicJwk, { name: "ECDH", namedCurve: "P-256" }, false, []);
  return crypto.subtle.deriveKey(
    { name: "ECDH", public: pub },
    priv,
    { name: "AES-GCM", length: 256 },
    false,
    ["encrypt", "decrypt"]
  );
}

const PREFIX = "BZE1:";

export async function encryptMessage(text: string, peerPublicJwk: JsonWebKey): Promise<string> {
  const key = await deriveKey(peerPublicJwk);
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const ct = await crypto.subtle.encrypt({ name: "AES-GCM", iv }, key, enc.encode(text));
  return PREFIX + toB64(iv.buffer) + "." + toB64(ct);
}

export function isEncrypted(raw: string): boolean {
  return raw.startsWith(PREFIX);
}

export async function decryptMessage(raw: string, peerPublicJwk: JsonWebKey): Promise<string> {
  const [ivB64, ctB64] = raw.slice(PREFIX.length).split(".");
  const key = await deriveKey(peerPublicJwk);
  const plain = await crypto.subtle.decrypt(
    { name: "AES-GCM", iv: fromB64(ivB64) },
    key,
    fromB64(ctB64)
  );
  return dec.decode(plain);
}
