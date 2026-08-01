import { useEffect, useRef, useState } from "react";
import { QRCodeSVG } from "qrcode.react";
import { Camera, ClipboardPaste, Check, ShieldCheck, Pencil, X, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import {
  buildPairingPayload,
  parsePairingPayload,
  pairWithPayload,
  getDeviceName,
  setDeviceName,
  getPairedPeer,
  unpair,
  type PairedPeer,
} from "@/lib/nearbyCrypto";

type BarcodeDetectorLike = {
  detect(source: CanvasImageSource): Promise<{ rawValue: string }[]>;
};

interface NearbyPairingProps {
  onPaired: (peer: PairedPeer) => void;
  onClose: () => void;
}

const NearbyPairing = ({ onPaired, onClose }: NearbyPairingProps) => {
  const [payload, setPayload] = useState("");
  const [name, setName] = useState(getDeviceName());
  const [editingName, setEditingName] = useState(false);
  const [manual, setManual] = useState("");
  const [scanning, setScanning] = useState(false);
  const [peer, setPeer] = useState<PairedPeer | null>(getPairedPeer());
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const rafRef = useRef<number>();

  const refreshPayload = () => { buildPairingPayload().then(setPayload); };

  useEffect(() => { refreshPayload(); }, []);

  const stopScan = () => {
    setScanning(false);
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
  };

  useEffect(() => stopScan, []);

  const acceptRaw = async (raw: string) => {
    const parsed = parsePairingPayload(raw);
    if (!parsed) { toast.error("Ye valid Buzz pairing code nahi hai"); return; }
    const paired = await pairWithPayload(parsed);
    setPeer(paired);
    onPaired(paired);
    stopScan();
    toast.success(`Paired with ${paired.name} — end-to-end encrypted`);
  };

  const startScan = async () => {
    const Detector = (window as unknown as { BarcodeDetector?: new (o: { formats: string[] }) => BarcodeDetectorLike }).BarcodeDetector;
    if (!Detector) { toast.error("Is browser mein camera QR scan nahi hai — code paste karo"); return; }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } });
      streamRef.current = stream;
      setScanning(true);
      requestAnimationFrame(async () => {
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          await videoRef.current.play().catch(() => {});
        }
        const detector = new Detector({ formats: ["qr_code"] });
        const tick = async () => {
          if (!videoRef.current || !streamRef.current) return;
          try {
            const codes = await detector.detect(videoRef.current);
            const hit = codes.find((c) => c.rawValue.startsWith("buzz-pair:"));
            if (hit) { await acceptRaw(hit.rawValue); return; }
          } catch { /* frame not ready */ }
          rafRef.current = requestAnimationFrame(tick);
        };
        tick();
      });
    } catch {
      toast.error("Camera permission chahiye QR scan ke liye");
    }
  };

  const saveName = () => {
    setDeviceName(name);
    setName(getDeviceName());
    setEditingName(false);
    refreshPayload();
    toast.success("Device name updated");
  };

  return (
    <div className="fixed inset-0 z-[95] flex flex-col bg-background">
      <div className="flex items-center justify-between gradient-brand px-4 py-3 text-white">
        <div className="flex items-center gap-2.5">
          <ShieldCheck className="h-5 w-5" />
          <div>
            <h2 className="text-base font-bold leading-tight">Secure Pairing</h2>
            <p className="text-[11px] opacity-90">QR scan karo — end-to-end encrypted offline chat</p>
          </div>
        </div>
        <button onClick={() => { stopScan(); onClose(); }} className="rounded-full p-2 hover:bg-white/20" title="Close">
          <X className="h-5 w-5" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-5 space-y-5">
        {/* Device name verification */}
        <div className="rounded-2xl border border-border p-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">This device</p>
          {editingName ? (
            <div className="mt-2 flex gap-2">
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="flex-1 rounded-xl bg-accent px-3 py-2 text-sm outline-none"
                maxLength={40}
              />
              <button onClick={saveName} className="rounded-xl gradient-brand px-3 text-white">
                <Check className="h-4 w-4" />
              </button>
            </div>
          ) : (
            <div className="mt-1 flex items-center gap-2">
              <p className="text-base font-semibold text-foreground">{name}</p>
              <button onClick={() => setEditingName(true)} className="rounded-full p-1.5 hover:bg-accent" title="Rename">
                <Pencil className="h-3.5 w-3.5 text-muted-foreground" />
              </button>
            </div>
          )}
          <p className="mt-1 text-xs text-muted-foreground">
            Pair karne se pehle dono devices par yehi naam dikhna chahiye.
          </p>
        </div>

        {/* Paired state */}
        {peer && (
          <div className="rounded-2xl border border-primary/30 bg-primary/5 p-4">
            <div className="flex items-center gap-2">
              <ShieldCheck className="h-5 w-5 text-primary" />
              <p className="text-sm font-semibold text-foreground">Paired with {peer.name}</p>
            </div>
            <p className="mt-2 text-xs text-muted-foreground">Safety number — dono devices par same hona chahiye:</p>
            <p className="mt-1 font-mono text-sm tracking-wider text-foreground">{peer.safetyNumber}</p>
            <button
              onClick={() => { unpair(); setPeer(null); toast.message("Unpaired"); }}
              className="mt-3 rounded-full bg-destructive/10 px-3 py-1.5 text-xs font-semibold text-destructive"
            >
              Unpair
            </button>
          </div>
        )}

        {/* My QR */}
        <div className="rounded-2xl border border-border p-4 text-center">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Mera pairing QR</p>
          <div className="mt-3 inline-block rounded-2xl bg-white p-3">
            {payload && <QRCodeSVG value={payload} size={180} level="M" fgColor="#6d28d9" />}
          </div>
          <div className="mt-3 flex items-center justify-center gap-2">
            <button
              onClick={() => { navigator.clipboard.writeText(payload); toast.success("Pairing code copied"); }}
              className="rounded-full bg-accent px-3 py-1.5 text-xs font-semibold text-foreground"
            >
              Copy code
            </button>
            <button onClick={refreshPayload} className="rounded-full bg-accent p-2" title="Refresh">
              <RefreshCw className="h-3.5 w-3.5 text-muted-foreground" />
            </button>
          </div>
        </div>

        {/* Scan */}
        <div className="rounded-2xl border border-border p-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Doosre device ka QR scan karo</p>
          {scanning ? (
            <div className="mt-3 space-y-2">
              <video ref={videoRef} playsInline muted className="h-56 w-full rounded-2xl bg-black object-cover" />
              <button onClick={stopScan} className="w-full rounded-full bg-accent py-2 text-xs font-semibold">Stop scanning</button>
            </div>
          ) : (
            <button
              onClick={startScan}
              className="mt-3 flex w-full items-center justify-center gap-2 rounded-full gradient-brand py-2.5 text-sm font-semibold text-white"
            >
              <Camera className="h-4 w-4" /> Scan QR
            </button>
          )}

          <div className="mt-4 flex gap-2">
            <input
              value={manual}
              onChange={(e) => setManual(e.target.value)}
              placeholder="ya pairing code paste karo"
              className="flex-1 rounded-xl bg-accent px-3 py-2 text-xs outline-none"
            />
            <button onClick={() => acceptRaw(manual)} className="rounded-xl bg-accent px-3" title="Pair from code">
              <ClipboardPaste className="h-4 w-4 text-muted-foreground" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NearbyPairing;
