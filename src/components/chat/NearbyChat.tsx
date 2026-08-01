import { useEffect, useRef, useState } from "react";
import { Bluetooth, BluetoothConnected, Send, X, WifiOff, Radio, ShieldCheck, ShieldAlert, QrCode, Lock } from "lucide-react";
import { toast } from "sonner";
import NearbyPairing from "./NearbyPairing";
import {
  getPairedPeer,
  encryptMessage,
  decryptMessage,
  isEncrypted,
  getDeviceName as getLocalDeviceName,
  type PairedPeer,
} from "@/lib/nearbyCrypto";

// Nordic UART Service — the de-facto standard for BLE serial chat links
const NUS_SERVICE = "6e400001-b5a3-f393-e0a9-e50e24dcca9e";
const NUS_RX = "6e400002-b5a3-f393-e0a9-e50e24dcca9e"; // write
const NUS_TX = "6e400003-b5a3-f393-e0a9-e50e24dcca9e"; // notify

const STORE_KEY = "buzz:nearby-messages";

type BleChar = {
  value?: DataView;
  writeValue(value: BufferSource): Promise<void>;
  startNotifications(): Promise<unknown>;
  addEventListener(type: string, cb: (ev: Event) => void): void;
};
type BleDevice = {
  name?: string;
  gatt?: {
    connect(): Promise<{ getPrimaryService(uuid: string): Promise<{ getCharacteristic(uuid: string): Promise<BleChar> }> }>;
    disconnect(): void;
  };
  addEventListener(type: string, cb: () => void): void;
};
type BleNavigator = Navigator & {
  bluetooth: {
    requestDevice(opts: { filters?: { services?: string[] }[]; optionalServices?: string[] }): Promise<BleDevice>;
  };
};

export interface NearbyMessage {
  id: string;
  text: string;
  mine: boolean;
  at: number;
  via: "bluetooth" | "local";
  secure?: boolean;
}

const load = (): NearbyMessage[] => {
  try {
    return JSON.parse(localStorage.getItem(STORE_KEY) || "[]") as NearbyMessage[];
  } catch {
    return [];
  }
};

interface NearbyChatProps {
  username?: string;
  onClose: () => void;
}

const NearbyChat = ({ username, onClose }: NearbyChatProps) => {
  const [messages, setMessages] = useState<NearbyMessage[]>(load);
  const [input, setInput] = useState("");
  const [btDeviceName, setBtDeviceName] = useState<string | null>(null);
  const [peer, setPeer] = useState<PairedPeer | null>(() => getPairedPeer());
  const [showPairing, setShowPairing] = useState(false);
  const [connecting, setConnecting] = useState(false);
  const rxRef = useRef<BleChar | null>(null);
  const deviceRef = useRef<BleDevice | null>(null);
  const channelRef = useRef<BroadcastChannel | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const peerRef = useRef<PairedPeer | null>(peer);
  useEffect(() => { peerRef.current = peer; }, [peer]);

  const bleSupported = typeof navigator !== "undefined" && "bluetooth" in navigator;

  useEffect(() => {
    localStorage.setItem(STORE_KEY, JSON.stringify(messages.slice(-300)));
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Offline local mesh between Buzz windows/tabs on the same device (no internet needed)
  useEffect(() => {
    const ch = new BroadcastChannel("buzz-nearby");
    channelRef.current = ch;
    ch.onmessage = async (e) => {
      const d = e.data as { text: string; from: string };
      if (!d?.text) return;
      const { text, secure } = await readIncoming(d.text);
      setMessages((p) => [
        ...p,
        { id: crypto.randomUUID(), text: `${d.from}: ${text}`, mine: false, at: Date.now(), via: "local", secure },
      ]);
    };
    return () => ch.close();
  }, []);

  const readIncoming = async (raw: string): Promise<{ text: string; secure: boolean }> => {
    if (!isEncrypted(raw)) return { text: raw, secure: false };
    const current = peerRef.current;
    if (!current) return { text: "🔒 Encrypted message — pair karo padhne ke liye", secure: true };
    try {
      return { text: await decryptMessage(raw, current.publicJwk), secure: true };
    } catch {
      return { text: "🔒 Decrypt fail — safety number check karo", secure: true };
    }
  };

  const connect = async () => {
    if (!bleSupported) {
      toast.error("Is browser mein Bluetooth support nahi hai (Chrome/Edge Android ya desktop use karo)");
      return;
    }
    setConnecting(true);
    try {
      const device = await (navigator as BleNavigator).bluetooth.requestDevice({
        filters: [{ services: [NUS_SERVICE] }],
        optionalServices: [NUS_SERVICE],
      });
      deviceRef.current = device;
      device.addEventListener("gattserverdisconnected", () => {
        setBtDeviceName(null);
        rxRef.current = null;
        toast.message("Bluetooth disconnected");
      });
      const server = await device.gatt!.connect();
      const service = await server.getPrimaryService(NUS_SERVICE);
      rxRef.current = await service.getCharacteristic(NUS_RX);
      const tx = await service.getCharacteristic(NUS_TX);
      await tx.startNotifications();
      tx.addEventListener("characteristicvaluechanged", async (ev) => {
        const value = (ev.target as unknown as BleChar).value;
        if (!value) return;
        const raw = new TextDecoder().decode(value);
        const { text, secure } = await readIncoming(raw);
        setMessages((p) => [...p, { id: crypto.randomUUID(), text, mine: false, at: Date.now(), via: "bluetooth", secure }]);
      });
      setBtDeviceName(device.name || "Buzz device");
      toast.success(`Connected to ${device.name || "device"}`);
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      if (!msg.toLowerCase().includes("cancel")) toast.error("Bluetooth connect failed: " + msg);
    } finally {
      setConnecting(false);
    }
  };

  const disconnect = () => {
    deviceRef.current?.gatt?.disconnect();
    setBtDeviceName(null);
    rxRef.current = null;
  };

  const send = async () => {
    const text = input.trim();
    if (!text) return;
    setInput("");
    const secure = !!peer;
    setMessages((p) => [
      ...p,
      { id: crypto.randomUUID(), text, mine: true, at: Date.now(), via: rxRef.current ? "bluetooth" : "local", secure },
    ]);
    const wire = peer ? await encryptMessage(text, peer.publicJwk) : text;
    channelRef.current?.postMessage({ text: wire, from: username || getLocalDeviceName() });
    if (rxRef.current) {
      try {
        await rxRef.current.writeValue(new TextEncoder().encode(wire));
      } catch {
        toast.error("Bluetooth send failed");
      }
    }
  };

  return (
    <div className="fixed inset-0 z-[90] flex flex-col bg-background">
      <div className="flex items-center justify-between gradient-brand px-4 py-3">
        <div className="flex items-center gap-2.5 text-white">
          {btDeviceName ? <BluetoothConnected className="h-5 w-5" /> : <Bluetooth className="h-5 w-5" />}
          <div>
            <h2 className="text-base font-bold leading-tight">Offline Nearby Chat</h2>
            <p className="text-[11px] opacity-90">
              {btDeviceName ? `Connected · ${btDeviceName}` : "No internet needed 🇮🇳"}
            </p>
          </div>
        </div>
        <button onClick={() => setShowPairing(true)} className="ml-auto mr-1 rounded-full p-2 hover:bg-white/20" title="Secure pairing (QR)">
          <QrCode className="h-5 w-5 text-white" />
        </button>
        <button onClick={onClose} className="rounded-full p-2 hover:bg-white/20" title="Close">
          <X className="h-5 w-5 text-white" />
        </button>
      </div>

      <button
        onClick={() => setShowPairing(true)}
        className={`flex w-full items-center gap-2 border-b border-border px-4 py-2 text-left ${peer ? "bg-primary/10" : "bg-amber-500/10"}`}
      >
        {peer ? <ShieldCheck className="h-4 w-4 text-primary" /> : <ShieldAlert className="h-4 w-4 text-amber-600" />}
        <span className="flex-1 text-[11px] font-medium text-foreground">
          {peer
            ? `End-to-end encrypted with ${peer.name} · Safety no. ${peer.safetyNumber}`
            : "Not encrypted — QR se device pair karo end-to-end encryption ke liye"}
        </span>
        <span className="text-[11px] font-semibold text-primary">{peer ? "Verify" : "Pair"}</span>
      </button>

      {showPairing && (
        <NearbyPairing onPaired={(p) => { setPeer(p); setShowPairing(false); }} onClose={() => setShowPairing(false)} />
      )}

      <div className="flex items-center gap-2 border-b border-border bg-accent/40 px-4 py-2">
        <WifiOff className="h-4 w-4 text-muted-foreground" />
        <p className="text-xs text-muted-foreground flex-1">
          Messages Bluetooth link aur local device mesh par jaate hain — server ya internet ki zarurat nahi.
        </p>
        {btDeviceName ? (
          <button onClick={disconnect} className="rounded-full bg-destructive/10 px-3 py-1.5 text-xs font-semibold text-destructive">
            Disconnect
          </button>
        ) : (
          <button
            onClick={connect}
            disabled={connecting}
            className="flex items-center gap-1.5 rounded-full gradient-brand px-3 py-1.5 text-xs font-semibold text-white disabled:opacity-60"
          >
            <Radio className="h-3.5 w-3.5" />
            {connecting ? "Scanning..." : "Pair Bluetooth"}
          </button>
        )}
      </div>

      <div className="flex-1 space-y-2 overflow-y-auto p-4">
        {messages.length === 0 && (
          <div className="mt-16 text-center">
            <Bluetooth className="mx-auto h-12 w-12 text-primary/40" />
            <p className="mt-3 text-sm font-medium text-foreground">Koi nearby message nahi</p>
            <p className="mt-1 text-xs text-muted-foreground">
              Paas wale Buzz device se pair karo, phir bina internet ke chat karo.
            </p>
          </div>
        )}
        {messages.map((m) => (
          <div key={m.id} className={`flex ${m.mine ? "justify-end" : "justify-start"}`}>
            <div
              className={`max-w-[75%] rounded-2xl px-3.5 py-2 text-sm shadow-sm ${
                m.mine ? "gradient-brand text-white" : "bg-accent text-foreground"
              }`}
            >
              <p className="whitespace-pre-wrap break-words">{m.text}</p>
              <p className={`mt-0.5 text-[10px] ${m.mine ? "text-white/70" : "text-muted-foreground"}`}>
                {new Date(m.at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })} · {m.via}
                {m.secure && <Lock className="ml-1 inline h-2.5 w-2.5" />}
              </p>
            </div>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      <div className="flex items-center gap-2 border-t border-border p-3">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && send()}
          placeholder="Offline message likho..."
          className="flex-1 rounded-full bg-accent px-4 py-2.5 text-sm text-foreground outline-none"
        />
        <button onClick={send} className="flex h-11 w-11 items-center justify-center rounded-full gradient-brand text-white">
          <Send className="h-5 w-5" />
        </button>
      </div>
    </div>
  );
};

export default NearbyChat;
