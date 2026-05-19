import { motion, type HTMLMotionProps } from "framer-motion";
import { forwardRef, type ReactNode } from "react";
import { cn } from "@/lib/utils";

type Variant = "primary" | "blush" | "cocoa" | "ghost" | "cream";

interface Props extends Omit<HTMLMotionProps<"button">, "children"> {
  children: ReactNode;
  variant?: Variant;
  fullWidth?: boolean;
}

const variants: Record<Variant, string> = {
  primary: "bg-gradient-warm text-primary-foreground shadow-pop",
  blush: "bg-gradient-blush text-chocolate shadow-soft",
  cocoa: "bg-gradient-cocoa text-cream shadow-soft",
  cream: "bg-card text-chocolate border border-border shadow-soft",
  ghost: "bg-transparent text-chocolate",
};

export const AnimatedButton = forwardRef<HTMLButtonElement, Props>(
  ({ children, variant = "primary", fullWidth, className, ...rest }, ref) => {
    return (
      <motion.button
        ref={ref}
        whileTap={{ scale: 0.96 }}
        whileHover={{ y: -2 }}
        transition={{ type: "spring", stiffness: 400, damping: 22 }}
        className={cn(
          "relative inline-flex items-center justify-center gap-2 rounded-full px-6 py-4 font-semibold tracking-tight",
          "text-base select-none",
          variants[variant],
          fullWidth && "w-full",
          className,
        )}
        {...rest}
      >
        {children}
      </motion.button>
    );
  },
);
AnimatedButton.displayName = "AnimatedButton";
