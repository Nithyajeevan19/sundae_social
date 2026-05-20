import { motion } from "framer-motion";
import { AnimatedButton } from "./AnimatedButton";
import { Instagram, Star, Share2 } from "lucide-react";

import { INSTAGRAM_URL, GOOGLE_REVIEW_URL } from "@/lib/social";

interface Props {
  instagramDone?: boolean;
  showBack?: boolean;
  onBack?: () => void;
  onInstagram: () => void;
  onGoogleReview: () => void;
  onDone: () => void;
}

export function ReviewFlow({
  instagramDone = false,
  showBack = false,
  onBack,
  onInstagram,
  onGoogleReview,
  onDone,
}: Props) {
  return (
    <>
      {showBack && (
        <motion.button
          type="button"
          onClick={onBack}
          className="mb-3 inline-flex items-center rounded-full bg-card/80 px-3 py-1.5 text-xs font-medium text-chocolate shadow-soft backdrop-blur transition hover:bg-card"
          whileHover={{ y: -1, scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          ← Back
        </motion.button>
      )}

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-3xl bg-card p-6 shadow-soft"
      >
        <div className="text-center">
          <div className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-gradient-blush text-3xl shadow-pop">
            🥹
          </div>
          <h3 className="mt-3 font-display text-2xl text-chocolate">That makes us SO happy</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            Would you support us with a quick Insta follow?
          </p>
        </div>

        <div className="mt-5 space-y-3">
          {!instagramDone && (
            <AnimatedButton
              variant="primary"
              fullWidth
              onClick={() => {
                window.open(INSTAGRAM_URL, "_blank");
                onInstagram();
              }}
            >
              <Instagram size={18} /> Follow on Instagram
            </AnimatedButton>
          )}
          <AnimatedButton
            variant="cream"
            fullWidth
            onClick={() => {
              window.open(GOOGLE_REVIEW_URL, "_blank");
              onGoogleReview();
            }}
          >
            <Star size={18} className="fill-waffle text-waffle" /> Leave Google Review
          </AnimatedButton>
          <AnimatedButton variant="blush" fullWidth onClick={onDone}>
            <Share2 size={18} /> Post Story & Tag Us
          </AnimatedButton>
        </div>
      </motion.div>
    </>
  );
}
