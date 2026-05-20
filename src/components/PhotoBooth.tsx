import { AnimatePresence, motion } from "framer-motion";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  Camera,
  RefreshCw,
  Download,
  Share2,
  X,
  SwitchCamera,
  Sparkles,
  Copy,
  Check,
} from "lucide-react";
import { toast } from "sonner";
import { AnimatedButton } from "./AnimatedButton";
import { toPng } from "html-to-image";
import { INSTAGRAM_URL, INSTAGRAM_HANDLE } from "@/lib/social";

type FrameKey = "filmstrip" | "polaroid" | "story";

const FRAMES: { key: FrameKey; label: string; emoji: string }[] = [
  { key: "filmstrip", label: "Film strip", emoji: "🎞️" },
  { key: "polaroid", label: "Polaroid", emoji: "📸" },
  { key: "story", label: "Dessert story", emoji: "🍨" },
];

function formatDate() {
  const d = new Date();
  return d.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export function PhotoBooth() {
  const [open, setOpen] = useState(false);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [photo, setPhoto] = useState<string | null>(null);
  const [frame, setFrame] = useState<FrameKey>("polaroid");
  const [facing, setFacing] = useState<"user" | "environment">("user");
  const [flash, setFlash] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [copied, setCopied] = useState(false);

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const frameRef = useRef<HTMLDivElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const stopStream = useCallback(() => {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    setStream(null);

    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  }, []);

  const startCamera = useCallback(
    async (mode: "user" | "environment" = facing) => {
      setErr(null);

      try {
        stopStream();

        const s = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: mode,
            width: { ideal: 1080 },
            height: { ideal: 1440 },
          },
          audio: false,
        });

        streamRef.current = s;
        setStream(s);

        if (videoRef.current) {
          videoRef.current.srcObject = s;
          await videoRef.current.play().catch(() => {});
        }
      } catch (e) {
        console.error(e);
        setErr("Camera access denied. Enable camera permission to continue.");
      }
    },
    [facing, stopStream]
  );



  useEffect(() => {
    if (open && !photo) {
      void startCamera(facing);
    }

    return () => {
      stopStream();
    };
  }, [open, photo, facing, startCamera, stopStream]);

  const flipCamera = async () => {
    const next = facing === "user" ? "environment" : "user";
    setFacing(next);
    await startCamera(next);
  };

  const capture = () => {
    const v = videoRef.current;
    const c = canvasRef.current;
    if (!v || !c) return;

    setFlash(true);
    setTimeout(() => setFlash(false), 350);

    const w = v.videoWidth || 720;
    const h = v.videoHeight || 960;

    c.width = w;
    c.height = h;

    const ctx = c.getContext("2d");
    if (!ctx) return;

    ctx.save();
    if (facing === "user") {
      ctx.translate(w, 0);
      ctx.scale(-1, 1);
    }
    ctx.drawImage(v, 0, 0, w, h);
    ctx.restore();

    const data = c.toDataURL("image/jpeg", 0.92);
    setPhoto(data);
    stopStream();
  };

  const retake = async () => {
    setPhoto(null);
    await startCamera(facing);
  };

  const close = () => {
    stopStream();
    setPhoto(null);
    setErr(null);
    setBusy(false);
    setOpen(false);
  };

  const exportImage = async (): Promise<string | null> => {
    if (!frameRef.current) return null;

    return await toPng(frameRef.current, {
      pixelRatio: 3,
      cacheBust: true,
      backgroundColor: "#FFF4EA",
    });
  };

  const downloadImage = async () => {
    if (busy) return;
    setBusy(true);

    try {
      const dataUrl = await exportImage();
      if (!dataUrl) return;

      const a = document.createElement("a");
      a.href = dataUrl;
      a.download = "sundae-social-booth.png";
      document.body.appendChild(a);
      a.click();
      a.remove();

      toast.success("Saved to your device 🍨", {
        description: "Post it on your Story and tag @sundaesocial.in ✨",
      });
    } catch (e) {
      console.error(e);
      toast.error("Couldn't save the image");
    } finally {
      setBusy(false);
    }
  };

  const shareOrDownload = async () => {
    if (busy) return;
    setBusy(true);

    try {
      const dataUrl = await exportImage();
      if (!dataUrl) return;

      const blob = await (await fetch(dataUrl)).blob();
      const file = new File([blob], "sundae-social-booth.png", {
        type: "image/png",
      });

      const nav = navigator as Navigator & {
        canShare?: (d: ShareData) => boolean;
      };

      if (nav.canShare?.({ files: [file] })) {
        await nav.share({
          files: [file],
          title: "Sundae Social",
          text: "My Sundae Social moment 🍨",
        });
        toast.success("Shared! Tag @sundaesocial.in 💖");
      } else {
        const a = document.createElement("a");
        a.href = dataUrl;
        a.download = "sundae-social-booth.png";
        document.body.appendChild(a);
        a.click();
        a.remove();

        window.open(INSTAGRAM_URL, "_blank");
        toast.success("Image saved ✨", {
          description: "Open Instagram → Story → upload it and tag us!",
        });
      }
    } catch (e) {
      console.error(e);
      toast.error("Couldn't share — try downloading instead");
    } finally {
      setBusy(false);
    }
  };

  const copyHandle = async () => {
    try {
      await navigator.clipboard.writeText(INSTAGRAM_HANDLE);
      setCopied(true);
      toast.success(`Copied ${INSTAGRAM_HANDLE} 💖`);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      toast.error("Couldn't copy — long-press to copy manually");
    }
  };

  return (
    <AnimatePresence mode="wait">
      {!open ? (
        <motion.button
          key="closed"
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.98 }}
          onClick={() => setOpen(true)}
          className="group relative w-full overflow-hidden rounded-3xl bg-gradient-warm p-5 text-left shadow-pop"
        >
          <div className="absolute -right-4 -top-4 text-6xl opacity-30">📸</div>
          <span className="inline-flex items-center gap-1 rounded-full bg-white/25 px-3 py-1 text-[10px] font-semibold uppercase tracking-widest text-cream backdrop-blur">
            <Sparkles size={12} /> New
          </span>
          <h3 className="mt-3 font-display text-2xl leading-tight text-cream">
            Sundae Selfie Booth
          </h3>
          <p className="mt-1 text-sm text-cream/90">
            Snap a pic, pick a frame, share the sweetness ✨
          </p>
          <div className="mt-4 inline-flex items-center gap-2 rounded-full bg-cream px-4 py-2 text-sm font-semibold text-chocolate">
            <Camera size={16} /> Open booth
          </div>
        </motion.button>
      ) : (
        <motion.div
          key="open"
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.98 }}
          className="relative flex h-[580px] w-full flex-col overflow-hidden rounded-3xl bg-gradient-hero shadow-pop"
        >
          {/* Header */}
          <div className="shrink-0 flex items-center justify-between px-5 pb-3 pt-4">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
                Sundae Social
              </p>
              <h3 className="font-display text-xl text-chocolate">Selfie Booth</h3>
            </div>
            <button
              onClick={close}
              className="grid h-10 w-10 place-items-center rounded-full bg-card shadow-soft text-chocolate"
              aria-label="Close"
            >
              <X size={18} />
            </button>
          </div>

          {/* Live camera or preview */}
          <div className="relative mx-4 mb-4 min-h-0 flex-1 max-w-full overflow-hidden rounded-[2rem] bg-chocolate shadow-pop">
            {!photo ? (
              <>
                <video
                  ref={videoRef}
                  autoPlay
                  muted
                  playsInline
                  className="absolute inset-0 h-full w-full object-cover"
                  style={{ transform: facing === "user" ? "scaleX(-1)" : "none" }}
                />

                {/* Corner brackets */}
                {[
                  "top-3 left-3 border-l-2 border-t-2 rounded-tl-xl",
                  "top-3 right-3 border-r-2 border-t-2 rounded-tr-xl",
                  "bottom-3 left-3 border-l-2 border-b-2 rounded-bl-xl",
                  "bottom-3 right-3 border-r-2 border-b-2 rounded-br-xl",
                ].map((c, i) => (
                  <span
                    key={i}
                    className={`pointer-events-none absolute h-8 w-8 border-cream/80 ${c}`}
                  />
                ))}

                <div className="pointer-events-none absolute left-3 top-3 rounded-full bg-cherry px-2 py-0.5 text-[10px] font-semibold uppercase tracking-widest text-cream">
                  ● Live
                </div>

                {err && (
                  <div className="absolute inset-0 grid place-items-center bg-chocolate/80 p-6 text-center text-sm text-cream">
                    {err}
                  </div>
                )}
              </>
            ) : (
              <motion.div
                key={frame}
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.35, ease: "easeOut" }}
                className="h-full w-full"
              >
                <FramedPhoto frame={frame} photo={photo} innerRef={frameRef} />
              </motion.div>
            )}

            {/* Flash overlay */}
            <AnimatePresence>
              {flash && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 0.9 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="pointer-events-none absolute inset-0 bg-white"
                />
              )}
            </AnimatePresence>
          </div>

          {/* Controls */}
          <div className="shrink-0 px-5 pb-5">
            {!photo ? (
              <div className="flex items-center justify-between gap-4">
                <button
                  onClick={flipCamera}
                  className="grid h-12 w-12 place-items-center rounded-full bg-card shadow-soft text-chocolate"
                  aria-label="Flip camera"
                >
                  <SwitchCamera size={18} />
                </button>

                <motion.button
                  whileTap={{ scale: 0.9 }}
                  onClick={capture}
                  disabled={!stream}
                  className="relative grid h-20 w-20 place-items-center rounded-full bg-cream shadow-pop disabled:opacity-50"
                  aria-label="Capture"
                >
                  <span className="absolute inset-1.5 rounded-full border-2 border-chocolate/30" />
                  <span className="h-14 w-14 rounded-full bg-gradient-warm" />
                </motion.button>

                <div className="h-12 w-12" />
              </div>
            ) : (
              <>
                <div className="mb-3 flex justify-center gap-2">
                  {FRAMES.map((f) => (
                    <button
                      key={f.key}
                      onClick={() => setFrame(f.key)}
                      className={`rounded-full px-3 py-1.5 text-xs font-semibold transition ${
                        frame === f.key
                          ? "bg-gradient-warm text-cream shadow-pop"
                          : "bg-card text-chocolate shadow-soft"
                      }`}
                    >
                      {f.emoji} {f.label}
                    </button>
                  ))}
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <AnimatedButton variant="cream" onClick={retake} className="flex-1">
                      <RefreshCw size={16} /> Retake
                    </AnimatedButton>

                    <AnimatedButton
                      variant="primary"
                      onClick={shareOrDownload}
                      className="flex-1"
                      disabled={busy}
                    >
                      <Share2 size={16} />
                      {busy ? "Saving…" : "Share to Story"}
                    </AnimatedButton>
                  </div>

                  <div className="flex items-center gap-2">
                    <AnimatedButton
                      variant="blush"
                      onClick={downloadImage}
                      className="flex-1"
                      disabled={busy}
                    >
                      <Download size={16} /> Download
                    </AnimatedButton>

                    <AnimatedButton variant="cream" onClick={copyHandle} className="flex-1">
                      {copied ? <Check size={16} /> : <Copy size={16} />}
                      {copied ? "Copied" : "Copy @handle"}
                    </AnimatedButton>
                  </div>

                  <p className="pt-1 text-center text-[11px] text-muted-foreground">
                    Tip: post on your Story & tag {INSTAGRAM_HANDLE} for a sweet surprise 💖
                  </p>
                </div>
              </>
            )}
          </div>

          <canvas ref={canvasRef} className="hidden" />
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function FramedPhoto({
  frame,
  photo,
  innerRef,
}: {
  frame: FrameKey;
  photo: string;
  innerRef: React.RefObject<HTMLDivElement | null>;
}) {
  if (frame === "filmstrip") {
    return (
      <div ref={innerRef} className="relative h-full w-full bg-chocolate p-3">
        {/* sprocket holes */}
        <div className="absolute inset-y-0 left-0 flex w-3 flex-col justify-around py-2">
          {Array.from({ length: 10 }).map((_, i) => (
            <span key={i} className="h-2 w-2 rounded-sm bg-cream/90" />
          ))}
        </div>
        <div className="absolute inset-y-0 right-0 flex w-3 flex-col justify-around py-2">
          {Array.from({ length: 10 }).map((_, i) => (
            <span key={i} className="h-2 w-2 rounded-sm bg-cream/90" />
          ))}
        </div>

        <div className="mx-3 flex h-full flex-col overflow-hidden rounded-md">
          <div className="bg-cream/10 py-1 text-center text-[9px] font-bold uppercase tracking-[0.3em] text-cream">
            Sundae Social · 35mm
          </div>
          <img src={photo} alt="" className="h-full w-full flex-1 object-cover" />
          <div className="flex items-center justify-between bg-cream/10 px-3 py-1 text-[9px] font-bold uppercase tracking-widest text-cream">
            <span>@sundaesocial.in</span>
            <span>{formatDate()}</span>
          </div>
        </div>

        <span className="absolute -right-2 -top-2 text-2xl">🍒</span>
        <span className="absolute -bottom-2 -left-2 text-2xl">✨</span>
      </div>
    );
  }

  if (frame === "polaroid") {
    return (
      <div
        ref={innerRef}
        className="relative grid h-full w-full place-items-center bg-soft-beige p-6"
        style={{
          backgroundImage:
            "radial-gradient(circle at 20% 30%, rgba(232,138,162,0.25), transparent 40%), radial-gradient(circle at 80% 70%, rgba(244,178,58,0.25), transparent 40%)",
        }}
      >
        <div className="relative w-full max-w-[80%] -rotate-2 rounded-md bg-cream p-3 shadow-pop">
          <span className="absolute -top-3 left-1/2 h-5 w-16 -translate-x-1/2 -rotate-3 rounded-sm bg-waffle/60" />
          <img src={photo} alt="" className="aspect-square w-full object-cover" />
          <div className="mt-3 flex items-center justify-between px-1 pb-1">
            <p
              className="text-chocolate"
              style={{
                fontFamily: "Caveat, cursive, var(--font-display)",
                fontSize: 22,
                lineHeight: 1,
              }}
            >
              Sundae mood 🍨
            </p>
            <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
              {formatDate()}
            </p>
          </div>
        </div>

        <span className="absolute left-4 top-4 text-2xl">🌸</span>
        <span className="absolute right-5 top-8 text-xl">✨</span>
        <span className="absolute bottom-6 left-6 text-xl">🍒</span>
        <span className="absolute bottom-4 right-4 text-[10px] font-bold uppercase tracking-[0.25em] text-chocolate/70">
          @sundaesocial.in
        </span>
      </div>
    );
  }

  return (
    <div
      ref={innerRef}
      className="relative h-full w-full overflow-hidden bg-gradient-warm"
    >
      <div
        className="absolute inset-0 opacity-30 mix-blend-overlay"
        style={{
          background:
            "radial-gradient(circle at 30% 20%, #fff, transparent 60%)",
        }}
      />
      {["🍨", "✨", "🍒", "🧁", "🌸", "🍫", "✨", "🍓"].map((e, i) => (
        <span
          key={i}
          className="absolute text-2xl drop-shadow"
          style={{
            left: `${((i * 37) % 85) + 5}%`,
            top: `${((i * 53) % 80) + 4}%`,
          }}
        >
          {e}
        </span>
      ))}

      <div className="relative z-10 flex h-full flex-col items-center px-5 pb-5 pt-6">
        <span className="rounded-full bg-white/25 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.25em] text-cream backdrop-blur">
          Sundae Social
        </span>
        <h4 className="mt-2 font-display text-2xl leading-tight text-cream drop-shadow">
          today tasted like ✨
        </h4>

        <div className="relative mt-4 w-full flex-1 overflow-hidden rounded-2xl border-4 border-cream/90 shadow-pop">
          <img src={photo} alt="" className="h-full w-full object-cover" />
          <span className="absolute -left-3 -top-3 h-6 w-20 rotate-[-12deg] bg-cream/70" />
          <span className="absolute -bottom-3 -right-3 h-6 w-20 rotate-[12deg] bg-cream/70" />
        </div>

        <div className="mt-3 flex w-full items-center justify-between text-cream">
          <p
            style={{
              fontFamily: "Caveat, cursive, var(--font-display)",
              fontSize: 22,
              lineHeight: 1,
            }}
          >
            your treat place 🍦
          </p>
          <p className="text-[10px] font-bold uppercase tracking-widest">
            {formatDate()}
          </p>
        </div>

        <p className="mt-1 w-full text-left text-[10px] font-bold uppercase tracking-[0.3em] text-cream/90">
          @sundaesocial.in
        </p>
      </div>
    </div>
  );
}