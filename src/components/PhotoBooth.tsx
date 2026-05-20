import { AnimatePresence, motion } from "framer-motion";
import { useCallback, useEffect, useRef, useState, type CSSProperties, type RefObject } from "react";
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

type FrameKey =
  | "filmstrip"
  | "polaroid"
  | "story"
  | "scrapbook"
  | "pressedBloom"
  | "instaPost"
  | "tornMoodboard"
  | "pinnedPolaroid"
  | "beachPolaroid"
  | "sunnyCollage"
  | "dessertDate"
  | "besties"
  | "lateCravings"
  | "treatReceipt"
  | "mirrorGlow"
  | "waffleBoard";

type FilterKey =
  | "clean"
  | "warmVintage"
  | "dreamyPink"
  | "caramelGlow"
  | "chocolateMood"
  | "strawberrySoft"
  | "retroDisposable"
  | "softGrain"
  | "sunsetWarmth"
  | "dreamyBlur"
  | "glossyBright"
  | "cozyCafe";

interface FilterDef {
  key: FilterKey;
  label: string;
  emoji: string;
  css: string;
  swatch: string;
  overlay?: CSSProperties;
  veil?: CSSProperties;
}

const FRAMES: { key: FrameKey; label: string; emoji: string; category: string }[] = [
  { key: "filmstrip", label: "Film strip", emoji: "🎞️", category: "Original" },
  { key: "polaroid", label: "Polaroid", emoji: "📸", category: "Original" },
  { key: "story", label: "Dessert story", emoji: "🍨", category: "Original" },
  { key: "scrapbook", label: "Scrapbook", emoji: "🌼", category: "Scrapbook" },
  { key: "pressedBloom", label: "Pressed bloom", emoji: "🌸", category: "Scrapbook" },
  { key: "instaPost", label: "Social post", emoji: "♡", category: "Social" },
  { key: "tornMoodboard", label: "Moodboard", emoji: "💌", category: "Collage" },
  { key: "pinnedPolaroid", label: "Pinned note", emoji: "📌", category: "Polaroid" },
  { key: "beachPolaroid", label: "Beach pin", emoji: "☀️", category: "Polaroid" },
  { key: "sunnyCollage", label: "Sunny collage", emoji: "🌻", category: "Collage" },
  { key: "dessertDate", label: "Dessert date", emoji: "🍒", category: "Date" },
  { key: "besties", label: "Besties", emoji: "🫶", category: "Friends" },
  { key: "lateCravings", label: "Late cravings", emoji: "🌙", category: "Mood" },
  { key: "treatReceipt", label: "Treat receipt", emoji: "🧾", category: "Social" },
  { key: "mirrorGlow", label: "Mirror glow", emoji: "✨", category: "Glow" },
  { key: "waffleBoard", label: "Waffle board", emoji: "🧇", category: "Dessert" },
];

const GRAIN =
  "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 160 160' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.95' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='.35'/%3E%3C/svg%3E\")";

const FILTERS: FilterDef[] = [
  {
    key: "clean",
    label: "Clean",
    emoji: "✨",
    css: "contrast(1.02) saturate(1.03)",
    swatch: "linear-gradient(135deg, #fff7ee, #f7d9df)",
  },
  {
    key: "warmVintage",
    label: "Warm vintage",
    emoji: "📷",
    css: "sepia(.18) contrast(.96) saturate(.9) brightness(1.04)",
    swatch: "linear-gradient(135deg, #f4d3a5, #ba8b5d)",
    overlay: { background: "rgba(245, 194, 128, .18)", mixBlendMode: "multiply" },
  },
  {
    key: "dreamyPink",
    label: "Dreamy pink",
    emoji: "💗",
    css: "brightness(1.08) contrast(.94) saturate(1.18)",
    swatch: "linear-gradient(135deg, #ffd8e7, #f5a4bd)",
    overlay: { background: "linear-gradient(135deg, rgba(255, 192, 214, .28), rgba(255, 244, 234, .1))", mixBlendMode: "screen" },
  },
  {
    key: "caramelGlow",
    label: "Caramel glow",
    emoji: "🍯",
    css: "sepia(.12) brightness(1.08) saturate(1.08) contrast(.98)",
    swatch: "linear-gradient(135deg, #f8c66d, #d98948)",
    overlay: { background: "radial-gradient(circle at 70% 20%, rgba(255, 223, 141, .35), transparent 55%)", mixBlendMode: "soft-light" },
  },
  {
    key: "chocolateMood",
    label: "Chocolate mood",
    emoji: "🍫",
    css: "sepia(.2) contrast(1.08) brightness(.9) saturate(.85)",
    swatch: "linear-gradient(135deg, #6b3a2b, #2a1710)",
    overlay: { background: "rgba(74, 36, 24, .18)", mixBlendMode: "multiply" },
  },
  {
    key: "strawberrySoft",
    label: "Strawberry soft",
    emoji: "🍓",
    css: "brightness(1.06) saturate(1.08) contrast(.96)",
    swatch: "linear-gradient(135deg, #ffd6d6, #ec6f86)",
    overlay: { background: "linear-gradient(180deg, rgba(255, 120, 143, .22), rgba(255, 244, 234, .06))", mixBlendMode: "screen" },
  },
  {
    key: "retroDisposable",
    label: "Retro disposable",
    emoji: "🎞️",
    css: "sepia(.14) saturate(.78) contrast(1.12) brightness(1.02)",
    swatch: "linear-gradient(135deg, #ffe7a6, #7aa07b)",
    overlay: { backgroundImage: GRAIN, opacity: .18, mixBlendMode: "overlay" },
  },
  {
    key: "softGrain",
    label: "Soft grain",
    emoji: "☁️",
    css: "contrast(.98) brightness(1.04) saturate(.96)",
    swatch: "linear-gradient(135deg, #f4eadf, #d7c8b6)",
    overlay: { backgroundImage: GRAIN, opacity: .14, mixBlendMode: "multiply" },
  },
  {
    key: "sunsetWarmth",
    label: "Sunset warmth",
    emoji: "🌅",
    css: "sepia(.08) brightness(1.05) saturate(1.22)",
    swatch: "linear-gradient(135deg, #ffb36b, #ee6d83)",
    overlay: { background: "linear-gradient(35deg, rgba(255, 144, 91, .28), rgba(255, 215, 124, .14))", mixBlendMode: "soft-light" },
  },
  {
    key: "dreamyBlur",
    label: "Dreamy blur",
    emoji: "🫧",
    css: "brightness(1.08) contrast(.92) saturate(1.1) blur(.25px)",
    swatch: "linear-gradient(135deg, #fff4ea, #d7eff2)",
    overlay: { background: "radial-gradient(circle at 30% 20%, rgba(255,255,255,.35), transparent 42%)", mixBlendMode: "screen" },
  },
  {
    key: "glossyBright",
    label: "Glossy bright",
    emoji: "💎",
    css: "brightness(1.12) contrast(1.06) saturate(1.12)",
    swatch: "linear-gradient(135deg, #ffffff, #f4b23a)",
    veil: { background: "linear-gradient(115deg, transparent 20%, rgba(255,255,255,.32) 42%, transparent 64%)" },
  },
  {
    key: "cozyCafe",
    label: "Cozy cafe",
    emoji: "☕",
    css: "sepia(.22) brightness(.98) contrast(.98) saturate(.92)",
    swatch: "linear-gradient(135deg, #d7b18a, #7a4a33)",
    overlay: { background: "rgba(168, 106, 62, .14)", mixBlendMode: "multiply" },
  },
];

function formatDate() {
  const d = new Date();
  return d.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function getFilter(key: FilterKey) {
  return FILTERS.find((filter) => filter.key === key) ?? FILTERS[0];
}

export function PhotoBooth() {
  const [open, setOpen] = useState(false);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [photo, setPhoto] = useState<string | null>(null);
  const [frame, setFrame] = useState<FrameKey>("polaroid");
  const [filter, setFilter] = useState<FilterKey>("clean");
  const [facing, setFacing] = useState<"user" | "environment">("user");
  const [flash, setFlash] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [copied, setCopied] = useState(false);

  const activeFilter = getFilter(filter);
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
    [facing, stopStream],
  );

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

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
    <>
      <button
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
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] overflow-hidden bg-chocolate/90 backdrop-blur-md"
          >
            <motion.div
              initial={{ y: "100%", scale: 0.98 }}
              animate={{ y: 0, scale: 1 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", stiffness: 200, damping: 26 }}
              className="relative flex h-full w-full flex-col overflow-hidden bg-gradient-hero"
            >
              <div className="pointer-events-none absolute inset-0 overflow-hidden">
                {["🍒", "✨", "🍓", "🍨", "🧇"].map((emoji, i) => (
                  <motion.span
                    key={emoji}
                    className="absolute text-xl opacity-25"
                    style={{
                      left: `${8 + i * 21}%`,
                      top: `${12 + ((i * 17) % 70)}%`,
                    }}
                    animate={{ y: [0, -8, 0], rotate: [-5, 6, -5] }}
                    transition={{ duration: 4 + i, repeat: Infinity, ease: "easeInOut" }}
                  >
                    {emoji}
                  </motion.span>
                ))}
              </div>

              {/* Header */}
              <div className="relative z-10 shrink-0 flex items-center justify-between px-5 pb-3 pt-[max(1.25rem,env(safe-area-inset-top))]">
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
                    Sundae Social
                  </p>
                  <h3 className="font-display text-xl text-chocolate">Selfie Booth</h3>
                </div>
                <button
                  onClick={close}
                  className="grid h-10 w-10 place-items-center rounded-full bg-card shadow-soft"
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
                      className="absolute inset-0 h-full w-full object-cover transition-[filter] duration-300"
                      style={{
                        transform: facing === "user" ? "scaleX(-1)" : "none",
                        filter: activeFilter.css,
                      }}
                    />
                    <FilterVeil filter={activeFilter} />

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
                    key={`${frame}-${filter}`}
                    initial={{ opacity: 0, scale: 0.96 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.35, ease: "easeOut" }}
                    className="h-full w-full"
                  >
                    <FramedPhoto frame={frame} photo={photo} filter={filter} innerRef={frameRef} />
                  </motion.div>
                )}

                {/* Flash overlay */}
                <AnimatePresence>
                  {flash && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: [0, 0.9, 0] }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.35 }}
                      className="pointer-events-none absolute inset-0 bg-white"
                    />
                  )}
                </AnimatePresence>
              </div>

              {/* Controls */}
              <div className="relative z-10 shrink-0 px-5 pb-[max(1.5rem,env(safe-area-inset-bottom))]">
                <FilterStrip active={filter} photo={photo ?? undefined} onPick={setFilter} />

                {!photo ? (
                  <div className="flex items-center justify-between gap-4">
                    <button
                      onClick={flipCamera}
                      className="grid h-12 w-12 place-items-center rounded-full bg-card shadow-soft"
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
                    <div className="mb-3 flex snap-x gap-2 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                      {FRAMES.map((f) => (
                        <motion.button
                          key={f.key}
                          whileTap={{ scale: 0.96 }}
                          onClick={() => setFrame(f.key)}
                          className={`shrink-0 snap-start rounded-full px-3 py-1.5 text-xs font-semibold transition ${
                            frame === f.key
                              ? "bg-gradient-warm text-cream shadow-pop"
                              : "bg-card text-chocolate shadow-soft"
                          }`}
                        >
                          {f.emoji} {f.label}
                        </motion.button>
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
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

function FilterStrip({
  active,
  photo,
  onPick,
}: {
  active: FilterKey;
  photo?: string;
  onPick: (filter: FilterKey) => void;
}) {
  return (
    <div className="mb-3 flex snap-x gap-2 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
      {FILTERS.map((filter) => (
        <motion.button
          key={filter.key}
          type="button"
          whileTap={{ scale: 0.96 }}
          onClick={() => onPick(filter.key)}
          className={`flex shrink-0 snap-start items-center gap-2 rounded-full px-2.5 py-1.5 text-[11px] font-semibold transition ${
            active === filter.key
              ? "bg-gradient-warm text-cream shadow-pop"
              : "bg-card text-chocolate shadow-soft"
          }`}
        >
          <span
            className="relative grid h-6 w-6 overflow-hidden rounded-full border border-cream/70 text-[10px]"
            style={{ background: filter.swatch }}
          >
            {photo ? (
              <>
                <img
                  src={photo}
                  alt=""
                  className="h-full w-full object-cover"
                  style={{ filter: filter.css }}
                />
                <FilterVeil filter={filter} />
              </>
            ) : (
              filter.emoji
            )}
          </span>
          {filter.label}
        </motion.button>
      ))}
    </div>
  );
}

function FilterVeil({ filter }: { filter: FilterDef }) {
  return (
    <>
      {filter.overlay && <span className="pointer-events-none absolute inset-0" style={filter.overlay} />}
      {filter.veil && <span className="pointer-events-none absolute inset-0" style={filter.veil} />}
    </>
  );
}

function PhotoLayer({
  photo,
  filter,
  className,
  imgClassName = "object-cover",
}: {
  photo: string;
  filter: FilterKey;
  className: string;
  imgClassName?: string;
}) {
  const activeFilter = getFilter(filter);
  const hasPositionClass = /\b(absolute|fixed|relative|sticky)\b/.test(className);

  return (
    <div className={`${hasPositionClass ? "" : "relative"} overflow-hidden ${className}`}>
      <img
        src={photo}
        alt=""
        className={`h-full w-full transition-[filter] duration-300 ${imgClassName}`}
        style={{ filter: activeFilter.css }}
      />
      <FilterVeil filter={activeFilter} />
    </div>
  );
}

function Tape({ className = "" }: { className?: string }) {
  return <span className={`absolute h-5 w-20 rounded-sm bg-cream/65 shadow-soft ${className}`} />;
}

function SparkleField({ dark = false }: { dark?: boolean }) {
  return (
    <>
      {["✦", "·", "✧", "·", "✦", "♡"].map((s, i) => (
        <span
          key={`${s}-${i}`}
          className={`absolute text-lg ${dark ? "text-chocolate/30" : "text-cream/70"}`}
          style={{
            left: `${8 + ((i * 19) % 82)}%`,
            top: `${8 + ((i * 29) % 78)}%`,
            transform: `rotate(${i * 11}deg)`,
          }}
        >
          {s}
        </span>
      ))}
    </>
  );
}

function FramedPhoto({
  frame,
  photo,
  filter,
  innerRef,
}: {
  frame: FrameKey;
  photo: string;
  filter: FilterKey;
  innerRef: RefObject<HTMLDivElement | null>;
}) {
  if (frame === "filmstrip") {
    return (
      <div ref={innerRef} className="relative h-full w-full bg-chocolate p-3">
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
          <PhotoLayer photo={photo} filter={filter} className="w-full flex-1" />
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
          <Tape className="-top-3 left-1/2 -translate-x-1/2 -rotate-3 bg-waffle/60" />
          <PhotoLayer photo={photo} filter={filter} className="aspect-square w-full" />
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

  if (frame === "story") {
    return (
      <div ref={innerRef} className="relative h-full w-full overflow-hidden bg-gradient-warm">
        <div
          className="absolute inset-0 opacity-30 mix-blend-overlay"
          style={{
            background: "radial-gradient(circle at 30% 20%, #fff, transparent 60%)",
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
            <PhotoLayer photo={photo} filter={filter} className="h-full w-full" />
            <Tape className="-left-3 -top-3 rotate-[-12deg]" />
            <Tape className="-bottom-3 -right-3 rotate-[12deg]" />
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
            <p className="text-[10px] font-bold uppercase tracking-widest">{formatDate()}</p>
          </div>

          <p className="mt-1 w-full text-left text-[10px] font-bold uppercase tracking-[0.3em] text-cream/90">
            @sundaesocial.in
          </p>
        </div>
      </div>
    );
  }

  if (frame === "scrapbook") {
    return (
      <div ref={innerRef} className="relative h-full w-full overflow-hidden bg-cream p-7">
        <div
          className="absolute inset-0 opacity-60"
          style={{
            backgroundImage:
              "radial-gradient(circle at 2px 2px, rgba(74,36,24,.08) 1px, transparent 0)",
            backgroundSize: "18px 18px",
          }}
        />
        <Tape className="left-1/2 top-5 -translate-x-1/2 -rotate-2 bg-waffle/45" />
        <div className="relative z-10 mt-8 rotate-[-3deg] bg-soft-beige p-4 shadow-pop">
          <PhotoLayer photo={photo} filter={filter} className="aspect-[4/3] w-full" />
        </div>
        <span className="absolute -left-4 bottom-20 text-7xl text-waffle/50">✽</span>
        <span className="absolute bottom-16 right-5 text-5xl text-chocolate/35">❀</span>
        <span className="absolute right-4 top-20 text-6xl text-chocolate/25">⌇</span>
        <div className="absolute bottom-6 left-7 right-7 flex items-end justify-between">
          <p
            className="text-chocolate"
            style={{ fontFamily: "Caveat, cursive, var(--font-display)", fontSize: 28 }}
          >
            sweet little memory
          </p>
          <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-chocolate/60">
            SUNDAE SOCIAL
          </p>
        </div>
      </div>
    );
  }

  if (frame === "pressedBloom") {
    return (
      <div
        ref={innerRef}
        className="relative h-full w-full overflow-hidden bg-soft-beige p-5"
        style={{ backgroundImage: GRAIN }}
      >
        <Tape className="left-5 top-7 rotate-[-9deg]" />
        <Tape className="bottom-28 right-3 rotate-[14deg]" />
        <div className="relative z-10 mt-12 rounded-sm bg-cream p-3 shadow-pop">
          <PhotoLayer photo={photo} filter={filter} className="aspect-[4/5] w-full" />
        </div>
        <div className="absolute -right-2 top-5 rotate-12 text-7xl">🌸</div>
        <div className="absolute -left-2 bottom-24 -rotate-12 text-6xl">🌼</div>
        <p
          className="absolute bottom-8 left-6 right-6 text-center text-chocolate"
          style={{ fontFamily: "Caveat, cursive, var(--font-display)", fontSize: 30 }}
        >
          Love, pure and timeless.
        </p>
      </div>
    );
  }

  if (frame === "instaPost") {
    return (
      <div ref={innerRef} className="relative grid h-full w-full place-items-center overflow-hidden bg-chocolate/20 p-4">
        <PhotoLayer photo={photo} filter={filter} className="absolute inset-0 scale-110 opacity-45 blur-sm" />
        <div className="relative z-10 w-full rounded-[1.25rem] border-[3px] border-chocolate bg-cream p-3 shadow-pop">
          <div className="mb-2 flex items-center gap-2 text-chocolate">
            <span className="grid h-7 w-7 place-items-center rounded-full bg-gradient-warm text-xs">🍨</span>
            <span className="text-sm font-bold">Friendship Photo Collage</span>
            <span className="ml-auto flex gap-1">
              <span className="h-3 w-3 rounded-full bg-chocolate" />
              <span className="h-3 w-3 rounded-full bg-chocolate" />
              <span className="h-3 w-3 rounded-full bg-chocolate" />
            </span>
          </div>
          <div className="border-[3px] border-chocolate">
            <PhotoLayer photo={photo} filter={filter} className="aspect-square w-full" />
          </div>
          <div className="mt-3 flex items-center gap-3 text-3xl text-chocolate">
            <span>♡</span>
            <span>○</span>
            <span>⌁</span>
            <span className="ml-auto">▱</span>
          </div>
          <p className="mt-1 text-[10px] font-bold uppercase tracking-[0.22em] text-chocolate/60">
            @sundaesocial.in
          </p>
        </div>
      </div>
    );
  }

  if (frame === "tornMoodboard") {
    return (
      <div ref={innerRef} className="relative h-full w-full overflow-hidden bg-cream p-4">
        <PhotoLayer photo={photo} filter={filter} className="absolute left-4 top-4 h-[36%] w-[58%] rotate-[-4deg] border-[6px] border-cream shadow-pop" />
        <PhotoLayer photo={photo} filter={filter} className="absolute right-4 top-[28%] h-[36%] w-[56%] rotate-[5deg] border-[6px] border-cream shadow-pop" />
        <PhotoLayer photo={photo} filter={filter} className="absolute bottom-20 left-6 h-[30%] w-[52%] rotate-[-2deg] border-[6px] border-cream shadow-pop" />
        <span className="absolute left-2 top-[30%] -rotate-12 text-5xl">📷</span>
        <div className="absolute bottom-24 right-6 rounded-sm bg-cream px-3 py-1 text-xl text-chocolate shadow-soft">
          Love
        </div>
        <div className="absolute bottom-16 right-8 rounded-sm bg-cream px-3 py-1 text-xl text-chocolate shadow-soft">
          yourself
        </div>
        <span className="absolute bottom-20 right-3 text-5xl text-cherry">♥</span>
        <SparkleField dark />
      </div>
    );
  }

  if (frame === "pinnedPolaroid") {
    return (
      <div ref={innerRef} className="relative h-full w-full overflow-hidden bg-soft-beige p-5">
        <div className="absolute right-5 top-5 h-36 w-28 rotate-3 bg-cream p-2 shadow-pop">
          <PhotoLayer photo={photo} filter={filter} className="aspect-square w-full opacity-80" />
        </div>
        <div className="relative z-10 mt-9 w-[84%] rounded-sm bg-cream p-3 pb-12 shadow-pop">
          <span className="absolute -top-4 left-1/2 h-8 w-8 -translate-x-1/2 rounded-full bg-card shadow-soft" />
          <PhotoLayer photo={photo} filter={filter} className="aspect-[4/5] w-full" />
        </div>
        <div className="absolute right-8 top-44 h-36 border-r border-chocolate/30" />
        <div className="absolute bottom-12 left-7">
          <p
            className="text-chocolate"
            style={{ fontFamily: "Caveat, cursive, var(--font-display)", fontSize: 32 }}
          >
            Sundae & chill
          </p>
          <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-chocolate/55">
            {formatDate()}
          </p>
        </div>
      </div>
    );
  }

  if (frame === "beachPolaroid") {
    return (
      <div
        ref={innerRef}
        className="relative grid h-full w-full place-items-center overflow-hidden p-6"
        style={{
          background:
            "radial-gradient(circle at 20% 20%, rgba(255,255,255,.38), transparent 30%), linear-gradient(135deg, #d7b18a, #b9895f)",
        }}
      >
        <SparkleField />
        <div className="relative w-[78%] rotate-[-4deg] bg-cream p-3 pb-16 shadow-pop">
          <span className="absolute -top-6 left-1/2 h-10 w-12 -translate-x-1/2 rounded-b-md bg-chocolate/80" />
          <PhotoLayer photo={photo} filter={filter} className="aspect-[3/4] w-full" />
          <p className="absolute bottom-5 left-1/2 -translate-x-1/2 text-4xl text-chocolate">♡</p>
        </div>
        <span className="absolute bottom-8 rounded-full bg-cream/70 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.24em] text-chocolate">
          @sundaesocial.in
        </span>
      </div>
    );
  }

  if (frame === "sunnyCollage") {
    return (
      <div ref={innerRef} className="relative h-full w-full overflow-hidden bg-waffle/35 p-5">
        <div className="absolute inset-0 opacity-40" style={{ backgroundImage: GRAIN }} />
        <div className="absolute -left-5 top-12 text-8xl text-waffle">✿</div>
        <div className="absolute left-7 top-28 h-28 w-10 rounded-full bg-green-700/70" />
        <div className="absolute left-12 top-36 h-24 w-10 rotate-45 rounded-full bg-green-700/70" />
        <div className="relative z-10 mt-20 rounded-sm bg-soft-beige p-4 shadow-pop">
          <div className="border-[8px] border-cream">
            <PhotoLayer photo={photo} filter={filter} className="aspect-[4/3] w-full" />
          </div>
        </div>
        <PhotoLayer photo={photo} filter={filter} className="absolute -right-6 -top-3 h-28 w-44 rotate-6 border-[6px] border-cream shadow-soft" />
        <p className="absolute bottom-8 left-5 right-5 text-center text-[10px] font-bold uppercase tracking-[0.35em] text-chocolate/60">
          SUNDAE SOCIAL · SUNNY LITTLE OUTING
        </p>
      </div>
    );
  }

  if (frame === "dessertDate") {
    return (
      <div ref={innerRef} className="relative h-full w-full overflow-hidden bg-gradient-blush p-5">
        <SparkleField />
        <div className="relative z-10 flex h-full flex-col">
          <div className="flex items-center justify-between text-cream">
            <p className="text-[10px] font-bold uppercase tracking-[0.35em]">SUNDAE SOCIAL</p>
            <span className="text-2xl">🍒</span>
          </div>
          <div className="mt-4 flex-1 overflow-hidden rounded-[2rem] border-4 border-cream shadow-pop">
            <PhotoLayer photo={photo} filter={filter} className="h-full w-full" />
          </div>
          <div className="mt-4 rounded-2xl bg-cream/85 p-4 text-chocolate shadow-soft">
            <p className="font-display text-2xl leading-none">dessert date energy</p>
            <p className="mt-1 text-[10px] font-bold uppercase tracking-[0.25em]">
              sweet memories · {formatDate()}
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (frame === "besties") {
    return (
      <div ref={innerRef} className="relative h-full w-full overflow-hidden bg-cream p-5">
        <div className="absolute inset-0 opacity-60" style={{ backgroundImage: GRAIN }} />
        <PhotoLayer photo={photo} filter={filter} className="absolute left-4 top-12 h-[38%] w-[70%] -rotate-3 rounded-3xl border-4 border-soft-beige shadow-pop" />
        <PhotoLayer photo={photo} filter={filter} className="absolute bottom-20 right-4 h-[38%] w-[70%] rotate-3 rounded-3xl border-4 border-soft-beige shadow-pop" />
        <div className="absolute left-6 top-5 rounded-full bg-gradient-warm px-4 py-2 text-xs font-bold uppercase tracking-[0.22em] text-cream shadow-soft">
          bestie cam
        </div>
        <span className="absolute right-7 top-[43%] text-5xl">🫶</span>
        <span className="absolute left-5 bottom-12 text-4xl">🍨</span>
        <p className="absolute bottom-7 right-5 text-[10px] font-bold uppercase tracking-[0.28em] text-chocolate/60">
          @sundaesocial.in
        </p>
      </div>
    );
  }

  if (frame === "lateCravings") {
    return (
      <div ref={innerRef} className="relative h-full w-full overflow-hidden bg-chocolate p-5">
        <div className="absolute inset-0 opacity-50" style={{ backgroundImage: GRAIN }} />
        <SparkleField />
        <div className="relative z-10 flex h-full flex-col justify-between">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.35em] text-cream/70">
              after hours
            </p>
            <h4 className="mt-1 font-display text-3xl leading-none text-cream">
              late-night cravings
            </h4>
          </div>
          <div className="relative my-5 flex-1 overflow-hidden rounded-[2rem] border border-cream/40 shadow-pop">
            <PhotoLayer photo={photo} filter={filter} className="h-full w-full" />
            <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-chocolate/80 to-transparent p-4">
              <p className="text-sm font-semibold text-cream">this deserved a story</p>
            </div>
          </div>
          <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-cream/70">
            SUNDAE SOCIAL · {INSTAGRAM_HANDLE}
          </p>
        </div>
      </div>
    );
  }

  if (frame === "treatReceipt") {
    return (
      <div ref={innerRef} className="relative grid h-full w-full place-items-center overflow-hidden bg-soft-beige p-6">
        <PhotoLayer photo={photo} filter={filter} className="absolute inset-0 opacity-25 blur-sm" />
        <div className="relative z-10 w-full rounded-sm bg-cream p-5 text-chocolate shadow-pop">
          <p className="text-center text-[10px] font-bold uppercase tracking-[0.35em]">
            SUNDAE SOCIAL
          </p>
          <p className="mt-1 text-center text-xs uppercase tracking-[0.25em] text-chocolate/60">
            your treat place
          </p>
          <div className="my-4 border-y border-dashed border-chocolate/30 py-3">
            <PhotoLayer photo={photo} filter={filter} className="aspect-square w-full rounded-lg" />
          </div>
          {["sundae memory", "main character energy", "story-ready mood"].map((line) => (
            <div key={line} className="flex justify-between py-1 text-xs font-semibold uppercase tracking-widest">
              <span>{line}</span>
              <span>♡</span>
            </div>
          ))}
          <div className="mt-4 border-t border-dashed border-chocolate/30 pt-3 text-center">
            <p className="font-display text-2xl">thank you sweet soul</p>
            <p className="text-[10px] font-bold uppercase tracking-[0.28em] text-chocolate/60">
              {formatDate()}
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (frame === "mirrorGlow") {
    return (
      <div ref={innerRef} className="relative h-full w-full overflow-hidden bg-gradient-hero p-5">
        <div className="absolute inset-0 opacity-50" style={{ backgroundImage: GRAIN }} />
        <div className="relative z-10 grid h-full place-items-center">
          <div className="relative h-[78%] w-[82%] rounded-[3rem] border-[10px] border-cream/85 bg-cream/30 p-3 shadow-pop">
            <PhotoLayer photo={photo} filter={filter} className="h-full w-full rounded-[2.25rem]" />
            <div className="absolute left-4 top-8 h-24 w-8 rounded-full bg-white/40 blur-xl" />
          </div>
        </div>
        <div className="absolute left-5 top-5 rounded-full bg-card/80 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.25em] text-chocolate shadow-soft">
          glossy bright
        </div>
        <p
          className="absolute bottom-7 left-5 right-5 text-center text-chocolate"
          style={{ fontFamily: "Caveat, cursive, var(--font-display)", fontSize: 30 }}
        >
          caught in a sweet little glow ✨
        </p>
      </div>
    );
  }

  return (
    <div ref={innerRef} className="relative h-full w-full overflow-hidden bg-soft-beige p-5">
      <div
        className="absolute inset-0 opacity-35"
        style={{
          backgroundImage:
            "linear-gradient(30deg, rgba(122,74,51,.18) 12%, transparent 12%, transparent 50%, rgba(122,74,51,.18) 50%, rgba(122,74,51,.18) 62%, transparent 62%)",
          backgroundSize: "32px 32px",
        }}
      />
      <div className="relative z-10 flex h-full flex-col">
        <div className="rounded-3xl bg-cream/85 p-3 shadow-pop">
          <PhotoLayer photo={photo} filter={filter} className="aspect-[4/5] w-full rounded-2xl" />
        </div>
        <div className="mt-4 rounded-3xl bg-card/85 p-4 text-chocolate shadow-soft">
          <p className="text-[10px] font-bold uppercase tracking-[0.35em]">SUNDAE SOCIAL</p>
          <h4 className="mt-1 font-display text-3xl leading-none">waffle board mood</h4>
          <p className="mt-2 text-sm text-chocolate/75">
            sprinkles, stories, and main character dessert energy.
          </p>
        </div>
        <div className="mt-auto flex justify-between text-3xl">
          <span>🍓</span>
          <span>🧇</span>
          <span>🍒</span>
          <span>✨</span>
        </div>
      </div>
    </div>
  );
}
