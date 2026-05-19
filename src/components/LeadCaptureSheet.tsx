import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { X, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { AnimatedButton } from "./AnimatedButton";
import { Confetti } from "./Confetti";
import { submitLead, isValidPhone } from "@/lib/lead";

interface Props {
  open: boolean;
  onClose: () => void;
  onComplete: (name: string) => void;
}

type Step = "name" | "phone" | "success";

export function LeadCaptureSheet({ open, onClose, onComplete }: Props) {
  const [step, setStep] = useState<Step>("name");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [shake, setShake] = useState(false);
  const [hint, setHint] = useState<string | null>(null);
  const [emoji, setEmoji] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [celebrate, setCelebrate] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) {
      setStep("name");
      setName("");
      setPhone("");
      setHint(null);
      setEmoji(null);
      setSubmitting(false);
      setCelebrate(false);
    }
  }, [open]);

  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 350);
  }, [open, step]);

  const pulseError = (msg: string, e: string) => {
    setHint(msg);
    setEmoji(e);
    setShake(true);
    setTimeout(() => setShake(false), 500);
  };

  const handleNameNext = () => {
    if (!name.trim()) {
      pulseError("Don't be shy, tell us your name 💛", "🥺");
      return;
    }
    setHint(null);
    setEmoji(null);
    setStep("phone");
  };

  const handleSubmit = async () => {
    const cleanName = name.trim();
    const cleanPhone = phone.trim();

    if (!cleanPhone || !isValidPhone(cleanPhone)) {
      pulseError("Enter a valid 10-digit mobile number 🍧", "🙈");
      return;
    }
    setHint(null);
    setEmoji(null);
    setSubmitting(true);
    try {
      await submitLead({ name: cleanName, phone: cleanPhone });
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Unable to save your details. Please try again.";
      setSubmitting(false);
      toast.error("Couldn’t save your spot", { description: message });
      pulseError(message, "🍦");
      return;
    }
    setSubmitting(false);
    setCelebrate(true);
    setStep("success");
    toast.success("Sweet! Your details were saved", {
      description: "We’ll keep the Sundae Social treats coming.",
    });
    setTimeout(() => {
      onComplete(cleanName);
      setName("");
      setPhone("");
    }, 1400);
  };

  const progress = step === "name" ? 1 : 2;

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-50 flex items-end justify-center sm:items-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <Confetti show={celebrate} />
          <motion.button
            aria-label="Close"
            className="absolute inset-0 bg-chocolate/40 backdrop-blur-sm"
            onClick={onClose}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          />

          <motion.div
            role="dialog"
            aria-modal="true"
            initial={{ y: 80, opacity: 0, scale: 0.98 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: 80, opacity: 0 }}
            transition={{ type: "spring", stiffness: 260, damping: 26 }}
            className="relative mx-auto w-full max-w-md rounded-t-[2rem] bg-card p-6 pb-8 shadow-pop sm:rounded-3xl"
          >
            {/* drag handle */}
            <div className="mx-auto mb-2 h-1.5 w-12 rounded-full bg-soft-beige sm:hidden" />

            <button
              onClick={onClose}
              className="absolute right-4 top-4 grid h-9 w-9 place-items-center rounded-full bg-soft-beige text-chocolate"
              aria-label="Close"
            >
              <X size={16} />
            </button>

            {/* floating dessert accents */}
            <motion.span
              className="absolute -left-2 -top-4 text-3xl"
              animate={{ y: [0, -6, 0], rotate: [-8, 8, -8] }}
              transition={{ duration: 4, repeat: Infinity }}
            >
              🍨
            </motion.span>
            <motion.span
              className="absolute -right-1 top-12 text-2xl"
              animate={{ y: [0, 8, 0], rotate: [10, -10, 10] }}
              transition={{ duration: 5, repeat: Infinity }}
            >
              🍓
            </motion.span>

            {step !== "success" && (
              <>
                <p className="text-center text-[11px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                  Step {progress} of 2
                </p>
                <div className="mx-auto mt-2 h-1.5 w-24 overflow-hidden rounded-full bg-soft-beige">
                  <motion.div
                    className="h-full bg-gradient-warm"
                    animate={{ width: `${(progress / 2) * 100}%` }}
                    transition={{ type: "spring", stiffness: 140, damping: 20 }}
                  />
                </div>
              </>
            )}

            <AnimatePresence mode="wait">
              {step === "name" && (
                <motion.div
                  key="name"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="mt-5 text-center"
                >
                  <h3 className="font-display text-2xl text-chocolate">
                    Before you leave, tell us your sweet name 🍨
                  </h3>
                  <p className="mt-1 text-sm text-muted-foreground">
                    We'll save a spot just for you.
                  </p>

                  <motion.div
                    animate={shake ? { x: [-8, 8, -6, 6, -3, 3, 0] } : { x: 0 }}
                    transition={{ duration: 0.45 }}
                    className="mt-5"
                  >
                    <input
                      ref={inputRef}
                      type="text"
                      value={name}
                      onChange={(e) => {
                        setName(e.target.value);
                        if (hint) {
                          setHint(null);
                          setEmoji(null);
                        }
                      }}
                      onKeyDown={(e) => e.key === "Enter" && handleNameNext()}
                      placeholder="Your name"
                      className="w-full rounded-2xl border-2 border-border bg-cream px-5 py-4 text-center text-lg font-medium text-chocolate placeholder:text-muted-foreground/60 focus:border-primary focus:outline-none focus:ring-4 focus:ring-primary/20 transition"
                    />
                  </motion.div>

                  <AnimatePresence>
                    {hint && (
                      <motion.div
                        initial={{ opacity: 0, y: -6 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        className="mt-3 flex items-center justify-center gap-2 text-sm text-chocolate"
                      >
                        <motion.span
                          key={emoji ?? ""}
                          initial={{ scale: 0.4, rotate: -20 }}
                          animate={{ scale: 1, rotate: 0 }}
                          transition={{ type: "spring", stiffness: 300 }}
                          className="text-2xl"
                        >
                          {emoji}
                        </motion.span>
                        <span>{hint}</span>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  <motion.div
                    className="mt-6"
                    animate={{ scale: [1, 1.02, 1] }}
                    transition={{ duration: 2.4, repeat: Infinity }}
                  >
                    <AnimatedButton variant="primary" fullWidth onClick={handleNameNext}>
                      Continue →
                    </AnimatedButton>
                  </motion.div>
                </motion.div>
              )}

              {step === "phone" && (
                <motion.div
                  key="phone"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="mt-5 text-center"
                >
                  <h3 className="font-display text-2xl text-chocolate">
                    Nice to meet you, {name.split(" ")[0]} 💖
                  </h3>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Drop your number — your treat is almost ready 🍧
                  </p>

                  <motion.div
                    animate={shake ? { x: [-8, 8, -6, 6, -3, 3, 0] } : { x: 0 }}
                    transition={{ duration: 0.45 }}
                    className="mt-5"
                  >
                    <input
                      ref={inputRef}
                      type="tel"
                      inputMode="tel"
                      value={phone}
                      onChange={(e) => {
                        setPhone(e.target.value);
                        if (hint) {
                          setHint(null);
                          setEmoji(null);
                        }
                      }}
                      onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
                      placeholder="+91 98765 43210"
                      className="w-full rounded-2xl border-2 border-border bg-cream px-5 py-4 text-center text-lg font-medium tracking-wide text-chocolate placeholder:text-muted-foreground/60 focus:border-primary focus:outline-none focus:ring-4 focus:ring-primary/20 transition"
                    />
                  </motion.div>

                  <AnimatePresence>
                    {hint && (
                      <motion.div
                        initial={{ opacity: 0, y: -6 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        className="mt-3 flex items-center justify-center gap-2 text-sm text-chocolate"
                      >
                        <motion.span
                          key={emoji ?? ""}
                          initial={{ scale: 0.4, rotate: -20 }}
                          animate={{ scale: 1, rotate: 0 }}
                          transition={{ type: "spring", stiffness: 300 }}
                          className="text-2xl"
                        >
                          {emoji}
                        </motion.span>
                        <span>{hint}</span>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  <motion.div
                    className="mt-6"
                    animate={!submitting ? { scale: [1, 1.02, 1] } : {}}
                    transition={{ duration: 2.4, repeat: Infinity }}
                  >
                    <AnimatedButton
                      variant="primary"
                      fullWidth
                      onClick={handleSubmit}
                      disabled={submitting}
                    >
                      {submitting ? (
                        <>
                          <Loader2 size={18} className="animate-spin" /> Saving…
                        </>
                      ) : (
                        <>Save my spot 🍨</>
                      )}
                    </AnimatedButton>
                  </motion.div>

                  <p className="mt-3 text-[11px] text-muted-foreground">
                    We'll only use this to send you sweet surprises.
                  </p>
                </motion.div>
              )}

              {step === "success" && (
                <motion.div
                  key="success"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="mt-4 py-6 text-center"
                >
                  <motion.div
                    initial={{ scale: 0, rotate: -30 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ type: "spring", stiffness: 220, damping: 14 }}
                    className="mx-auto grid h-20 w-20 place-items-center rounded-full bg-gradient-blush text-5xl shadow-pop"
                  >
                    🍨
                  </motion.div>
                  <h3 className="mt-4 font-display text-2xl text-chocolate">Sweet! You're in 💖</h3>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Your treat is almost ready, {name.split(" ")[0]}.
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
