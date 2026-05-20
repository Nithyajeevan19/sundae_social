import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { HeroBanner } from "@/components/HeroBanner";
import { EmotionButtons, type Emotion } from "@/components/EmotionButtons";
import { ReviewFlow } from "@/components/ReviewFlow";
import { FeedbackForm } from "@/components/FeedbackForm";
import { PersonalityQuiz } from "@/components/PersonalityQuiz";
import { SectionReveal } from "@/components/SectionReveal";
import { Confetti } from "@/components/Confetti";
import { LeadCaptureSheet } from "@/components/LeadCaptureSheet";
import { PhotoBooth } from "@/components/PhotoBooth";
import { submitLead } from "@/lib/lead";
import { syncPendingSubmissions } from "@/lib/submissionQueue";
import { toast } from "sonner";

type PostSubmitAction = "main" | "instagram" | "google";
const POST_SUBMIT_STATE_KEY = "sundaeSocial.postSubmitState";

export default function Index() {
  const [emotion, setEmotion] = useState<Emotion | null>(null);
  const [stage, setStage] = useState<"pick" | "follow" | "feedback" | "story">("pick");
  const [celebrate, setCelebrate] = useState(false);
  const [leadOpen, setLeadOpen] = useState(false);
  const [leadDone, setLeadDone] = useState(false);
  const [name, setName] = useState<string>("");
  const [phone, setPhone] = useState<string>("");
  const [postSubmitAction, setPostSubmitAction] = useState<PostSubmitAction>("main");
  const [instagramDone, setInstagramDone] = useState(false);
  const pendingStageRef = useRef<"follow" | "feedback" | null>(null);
  const reviewRef = useRef<HTMLDivElement>(null);
  const storyRef = useRef<HTMLDivElement>(null);

  const fire = () => {
    setCelebrate(true);
    setTimeout(() => setCelebrate(false), 2200);
  };

  useEffect(() => {
    void syncPendingSubmissions();

    const retrySync = () => void syncPendingSubmissions();
    window.addEventListener("online", retrySync);

    return () => window.removeEventListener("online", retrySync);
  }, []);

  useEffect(() => {
    try {
      const saved = window.sessionStorage.getItem(POST_SUBMIT_STATE_KEY);
      if (!saved) return;

      const parsed = JSON.parse(saved) as {
        emotion?: Emotion | null;
        instagramDone?: boolean;
        leadDone?: boolean;
        name?: string;
        phone?: string;
        postSubmitAction?: PostSubmitAction;
        stage?: "follow" | "feedback" | "story";
      };

      if (!parsed.leadDone) return;

      setLeadDone(true);
      setName(parsed.name ?? "");
      setPhone(parsed.phone ?? "");
      setEmotion(parsed.emotion ?? null);
      setInstagramDone(Boolean(parsed.instagramDone));
      setPostSubmitAction(parsed.postSubmitAction ?? "main");
      setStage(parsed.stage ?? "follow");
    } catch (error) {
      console.warn("[post-submit] unable to restore state", error);
    }
  }, []);

  useEffect(() => {
    if (!leadDone) return;

    try {
      window.sessionStorage.setItem(
        POST_SUBMIT_STATE_KEY,
        JSON.stringify({
          emotion,
          instagramDone,
          leadDone,
          name,
          phone,
          postSubmitAction,
          stage,
        }),
      );
    } catch (error) {
      console.warn("[post-submit] unable to save state", error);
    }
  }, [emotion, instagramDone, leadDone, name, phone, postSubmitAction, stage]);

  const handleEmotion = (e: Emotion) => {
    setEmotion(e);
    const next = e === "improve" ? "feedback" : "follow";
    if (!leadDone) {
      pendingStageRef.current = next;
      setLeadOpen(true);
    } else {
      setStage(next);
      fire();
    }
  };

  const handleLeadComplete = (n: string, p: string) => {
    setName(n);
    setPhone(p);
    setLeadDone(true);
    setLeadOpen(false);
    setPostSubmitAction("main");
    const next = pendingStageRef.current;
    pendingStageRef.current = null;
    if (next) {
      setStage(next);
      fire();
    }
  };

  const handleBackToThankYou = () => {
    setPostSubmitAction("main");
    setInstagramDone(false);
    setStage("follow");
    setTimeout(
      () => reviewRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }),
      80,
    );
  };

  const handleInstagramAction = () => {
    setInstagramDone(true);
    setPostSubmitAction("instagram");
    setStage("follow");
  };

  const handleGoogleReviewAction = () => {
    setPostSubmitAction("google");
    setStage("follow");
  };

  useEffect(() => {
    if (postSubmitAction !== "google") return;

    const returnToThankYou = () => {
      setPostSubmitAction("main");
      setInstagramDone(false);
      setStage("follow");
      setTimeout(
        () => reviewRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }),
        80,
      );
    };

    window.addEventListener("focus", returnToThankYou);
    document.addEventListener("visibilitychange", returnToThankYou);

    return () => {
      window.removeEventListener("focus", returnToThankYou);
      document.removeEventListener("visibilitychange", returnToThankYou);
    };
  }, [postSubmitAction]);

  useEffect(() => {
    if (stage === "story") {
      setTimeout(
        () => storyRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }),
        100,
      );
    }
  }, [stage]);

  const firstName = name ? name.split(" ")[0] : "";

  return (
    <main className="mobile-shell">
      <Confetti show={celebrate} />

      <HeroBanner onScrollCta={() => reviewRef.current?.scrollIntoView({ behavior: "smooth" })} />

      <section ref={reviewRef} className="px-6 pb-10 pt-2">
        <SectionReveal>
          <p className="mb-3 text-center text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
            {firstName ? `Hi ${firstName} · ` : ""}Step 1 · How did it go?
          </p>
        </SectionReveal>

        <AnimatePresence mode="wait">
          {stage === "pick" && (
            <motion.div key="pick" exit={{ opacity: 0, y: -10 }}>
              <EmotionButtons onPick={handleEmotion} />
            </motion.div>
          )}

          {stage === "follow" && (
            <motion.div key="follow">
              <ReviewFlow
                instagramDone={instagramDone}
                showBack={postSubmitAction !== "main"}
                onBack={handleBackToThankYou}
                onInstagram={handleInstagramAction}
                onGoogleReview={handleGoogleReviewAction}
                onDone={() => {
                  setPostSubmitAction("main");
                  fire();
                  setStage("story");
                }}
              />
              <button
                onClick={() => {
                  setStage("pick");
                  setEmotion(null);
                }}
                className="mt-4 w-full text-center text-xs text-muted-foreground underline"
              >
                ← Change my answer
              </button>
            </motion.div>
          )}

          {stage === "feedback" && (
            <motion.div key="feedback">
              <FeedbackForm
                onSubmit={async (review) => {
                  try {
                    await submitLead({
                      name,
                      phone,
                      review,
                      reviews: review,
                      feedback: review,
                      suggestion: review,
                      comment: review,
                      rating: emotion ?? "feedback",
                    });
                    fire();
                    setStage("story");
                  } catch (error) {
                    const message =
                      error instanceof Error
                        ? error.message
                        : "Unable to save your feedback. Please try again.";
                    toast.error("Couldnâ€™t save your feedback", { description: message });
                    console.error("[feedback] submission failed", error);
                  }
                }}
              />
              <button
                onClick={() => {
                  setStage("pick");
                  setEmotion(null);
                }}
                className="mt-4 w-full text-center text-xs text-muted-foreground underline"
              >
                ← Change my answer
              </button>
            </motion.div>
          )}

          {stage === "story" && (
            <motion.div
              key="story"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
            >
              {leadDone && emotion !== "improve" && (
                <motion.button
                  type="button"
                  onClick={handleBackToThankYou}
                  className="mb-3 inline-flex items-center rounded-full bg-card/80 px-3 py-1.5 text-xs font-medium text-chocolate shadow-soft backdrop-blur transition hover:bg-card"
                  whileHover={{ y: -1, scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  ← Back
                </motion.button>
              )}
              <div className="rounded-3xl bg-gradient-blush p-5 text-center shadow-pop">
                <span className="text-3xl">🎉</span>
                <h3 className="mt-1 font-display text-xl text-chocolate">
                  Thank you{firstName ? `, ${firstName}` : ", sweet soul"}!
                </h3>
                <p className="mt-1 text-sm text-chocolate/80">
                  {emotion === "improve"
                    ? "Your honest note just helped us get better."
                    : "You just made our whole week."}
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </section>

      <section ref={storyRef} className="px-6 pb-12">
        <SectionReveal>
          <p className="mb-3 text-center text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
            {firstName
              ? `Hi ${firstName}, let's find your Sundae match 🍨`
              : "Step 2 · Just for fun"}
          </p>
        </SectionReveal>
        <SectionReveal delay={0.05}>
          <PersonalityQuiz />
        </SectionReveal>
      </section>

      <section className="px-6 pb-16">
        <SectionReveal>
          <p className="mb-3 text-center text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
            Step 3 · Snap your sundae moment
          </p>
        </SectionReveal>
        <SectionReveal delay={0.05}>
          <PhotoBooth />
        </SectionReveal>
      </section>

      <footer className="px-6 pb-10 text-center">
        <div className="mx-auto inline-flex items-center gap-2 rounded-full bg-card/60 px-4 py-2 text-xs text-muted-foreground backdrop-blur">
          <span>🍨</span>
          Made with love at Sundae Social
        </div>
        <p className="mt-3 text-[11px] text-muted-foreground">
          © {new Date().getFullYear()} Sundae Social · Your Treat Place
        </p>
      </footer>

      <LeadCaptureSheet
        open={leadOpen}
        onClose={() => {
          setLeadOpen(false);
          pendingStageRef.current = null;
        }}
        onComplete={handleLeadComplete}
        rating={emotion ?? ""}
      />
    </main>
  );
}
