import { useEffect, useRef, useState } from "react";
import { Bluetooth, BluetoothConnected, Send, X, WifiOff, Radio } from "lucide-react";
import { toast } from "sonner";

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
  const [deviceName, setDeviceName] = useState<string | null>(null);
  const [connecting, setConnecting] = useState(false);
  const rxRef = useRef<BleChar | null>(null);
  const deviceRef = useRef<BleDevice | null>(null);
  const channelRef = useRef<BroadcastChannel | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  const bleSupported = typeof navigator !== "undefined" && "bluetooth" in navigator;

  useEffect(() => {
    localStorage.setItem(STORE_KEY, JSON.stringify(messages.slice(-300)));
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Offline local mesh between Buzz windows/tabs on the same device (no internet needed)
  useEffect(() => {
    const ch = new BroadcastChannel("buzz-nearby");
    channelRef.current = ch;
    ch.onmessage = (e) => {
      const d = e.data as { text: string; from: string };
      if (!d?.text) return;
      setMessages((p) => [
        ...p,
        { id: crypto.randomUUID(), text: `${d.from}: ${d.text}`, mine: false, at: Date.now(), via: "local" },
      ]);
    };
    return () => ch.close();
  }, []);

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
        setDeviceName(null);
        rxRef.current = null;
        toast.message("Bluetooth disconnected");
      });
      const server = await device.gatt!.connect();
      const service = await server.getPrimaryService(NUS_SERVICE);
      rxRef.current = await service.getCharacteristic(NUS_RX);
      const tx = await service.getCharacteristic(NUS_TX);
      await tx.startNotifications();
      tx.addEventListener("characteristicvaluechanged", (ev) => {
        const value = (ev.target as unknown as BleChar).value;
        if (!value) return;
        const text = new TextDecoder().decode(value);
        setMessages((p) => [...p, { id: crypto.randomUUID(), text, mine: false, at: Date.now(), via: "bluetooth" }]);
      });
      setDeviceName(device.name || "Buzz device");
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
    setDeviceName(null);
    rxRef.current = null;
  };

  const send = async () => {
    const text = input.trim();
    if (!text) return;
    setInput("");
    setMessages((p) => [
      ...p,
      { id: crypto.randomUUID(), text, mine: true, at: Date.now(), via: rxRef.current ? "bluetooth" : "local" },
    ]);
    channelRef.current?.postMessage({ text, from: username || "Buzz user" });
    if (rxRef.current) {
      try {
        await rxRef.current.writeValue(new TextEncoder().encode(text));
      } catch {
        toast.error("Bluetooth send failed");
      }
    }
  };

  return (
    <div className="fixed inset-0 z-[90] flex flex-col bg-background">
      <div className="flex items-center justify-between gradient-brand px-4 py-3">
        <div className="flex items-center gap-2.5 text-white">
          {deviceName ? <BluetoothConnected className="h-5 w-5" /> : <Bluetooth className="h-5 w-5" />}
          <div>
            <h2 className="text-base font-bold leading-tight">Offline Nearby Chat</h2>
            <p className="text-[11px] opacity-90">
              {deviceName ? `Connected · ${deviceName}` : "No internet needed 🇮🇳"}
            </p>
          </div>
        </div>
        <button onClick={onClose} className="rounded-full p-2 hover:bg-white/20" title="Close">
          <X className="h-5 w-5 text-white" />
        </button>
      </div>

      <div className="flex items-center gap-2 border-b border-border bg-accent/40 px-4 py-2">
        <WifiOff className="h-4 w-4 text-muted-foreground" />
        <p className="text-xs text-muted-foreground flex-1">
          Messages Bluetooth link aur local device mesh par jaate hain — server ya internet ki zarurat nahi.
        </p>
        {deviceName ? (
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
