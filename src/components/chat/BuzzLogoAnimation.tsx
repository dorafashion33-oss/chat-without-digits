import { motion, useReducedMotion } from "framer-motion";
import buzzLogo from "@/assets/buzz-logo.jpeg";

interface BuzzLogoAnimationProps {
  size?: "sm" | "md" | "lg" | "xl";
  showAura?: boolean;
  showTagline?: boolean;
  className?: string;
}

const sizeConfig = {
  sm: { img: "h-8 w-8 rounded-lg", badge: "text-[10px] -bottom-1 -right-1", aura: "h-12 w-12" },
  md: { img: "h-12 w-12 rounded-xl", badge: "text-xs -bottom-1 -right-1", aura: "h-20 w-20" },
  lg: { img: "h-16 w-16 rounded-2xl", badge: "text-sm -bottom-1.5 -right-1.5", aura: "h-28 w-28" },
  xl: { img: "h-24 w-24 rounded-3xl", badge: "text-base -bottom-2 -right-2", aura: "h-40 w-40" },
};

export const BuzzLogoAnimation = ({
  size = "md",
  showAura = true,
  showTagline = false,
  className = "",
}: BuzzLogoAnimationProps) => {
  const shouldReduceMotion = useReducedMotion();
  const cfg = sizeConfig[size];

  // 10/10 Spring Physics: Fast, snappy, zero jank
  const springTransition = {
    type: "spring" as const,
    stiffness: 340,
    damping: 20,
    mass: 0.7,
  };

  return (
    <div className={`relative flex flex-col items-center justify-center ${className}`}>
      {/* 1. Purposeful Brand Aura (Expanding Soundwave/Buzz Glow) */}
      {showAura && !shouldReduceMotion && (
        <motion.div
          className={`absolute rounded-full gradient-brand opacity-30 blur-xl pointer-events-none ${cfg.aura}`}
          initial={{ scale: 0.6, opacity: 0 }}
          animate={{
            scale: [0.8, 1.25, 1],
            opacity: [0.15, 0.45, 0.25],
          }}
          transition={{
            duration: 0.8,
            ease: [0.16, 1, 0.3, 1],
            repeat: Infinity,
            repeatType: "reverse",
            repeatDelay: 2.2,
          }}
        />
      )}

      {/* 2. Main Logo Container (Spring Scale + Shimmer Reflection) */}
      <motion.div
        className="relative transform-gpu will-change-transform"
        initial={shouldReduceMotion ? { opacity: 0 } : { scale: 0.7, opacity: 0, rotate: -6 }}
        animate={shouldReduceMotion ? { opacity: 1 } : { scale: 1, opacity: 1, rotate: 0 }}
        transition={springTransition}
      >
        <div className="relative overflow-hidden rounded-[inherit] shadow-2xl">
          <img
            src={buzzLogo}
            alt="Buzz"
            className={`${cfg.img} object-cover shadow-lg border border-white/20`}
          />

          {/* Sleek Specular Light Shimmer (Sweeps across logo in 0.55s) */}
          {!shouldReduceMotion && (
            <motion.div
              className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/35 to-transparent skew-x-12 pointer-events-none"
              initial={{ translateX: "-100%" }}
              animate={{ translateX: "200%" }}
              transition={{
                delay: 0.25,
                duration: 0.6,
                ease: [0.16, 1, 0.3, 1],
              }}
            />
          )}
        </div>

        {/* 3. Snappy Indian Flag Badge (Spring Settles at 0.45s) */}
        <motion.span
          className={`absolute select-none drop-shadow-md ${cfg.badge}`}
          initial={shouldReduceMotion ? { opacity: 0 } : { scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{
            delay: 0.35,
            type: "spring",
            stiffness: 450,
            damping: 16,
          }}
          aria-label="Made in India"
        >
          🇮🇳
        </motion.span>
      </motion.div>

      {/* 4. Optional Tagline / Loading text */}
      {showTagline && (
        <motion.div
          className="mt-3 flex items-center gap-1.5 text-xs text-muted-foreground font-medium"
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.3 }}
        >
          <span>Buzzing securely</span>
          <span className="flex gap-0.5">
            <span className="h-1 w-1 rounded-full bg-primary animate-bounce [animation-delay:0ms]" />
            <span className="h-1 w-1 rounded-full bg-primary animate-bounce [animation-delay:150ms]" />
            <span className="h-1 w-1 rounded-full bg-primary animate-bounce [animation-delay:300ms]" />
          </span>
        </motion.div>
      )}
    </div>
  );
};

export default BuzzLogoAnimation;
