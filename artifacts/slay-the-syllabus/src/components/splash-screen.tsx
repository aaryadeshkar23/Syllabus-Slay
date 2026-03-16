import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useGetStudyJoke } from "@workspace/api-client-react";
import { Sparkles } from "lucide-react";

type Stage = "brand" | "joke" | "punchline" | "entering";

// Letter-by-letter animation for the title
function AnimatedTitle({ text }: { text: string }) {
  return (
    <span aria-label={text}>
      {text.split("").map((char, i) => (
        <motion.span
          key={i}
          initial={{ opacity: 0, y: 20, filter: "blur(8px)" }}
          animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          transition={{ delay: 0.4 + i * 0.055, duration: 0.4, ease: "easeOut" }}
          className="inline-block"
          style={{ whiteSpace: char === " " ? "pre" : "normal" }}
        >
          {char}
        </motion.span>
      ))}
    </span>
  );
}

export function SplashScreen({ onComplete }: { onComplete: () => void }) {
  const { data: jokeData, isLoading, error } = useGetStudyJoke();
  const [stage, setStage] = useState<Stage>("brand");

  // Advance from brand → joke once the joke loads (or after minimum brand display)
  useEffect(() => {
    if (stage !== "brand") return;
    // Wait at least 2.5s on brand screen; also wait for joke to load
    const min = setTimeout(() => {
      if (!isLoading) {
        setStage("joke");
      }
    }, 2500);
    return () => clearTimeout(min);
  }, [stage, isLoading]);

  // When joke loads mid-brand, advance as soon as brand minimum elapses
  useEffect(() => {
    if (!isLoading && stage === "brand") {
      // handled by the timer above — no double-fire needed
    }
    if (!isLoading && stage === "brand") return; // timer handles it
  }, [isLoading, stage]);

  // Once joke stage starts, advance to punchline and then entering
  useEffect(() => {
    if (stage === "joke") {
      if (error) {
        // No joke to show — skip straight to entering after brief pause
        const t = setTimeout(() => setStage("entering"), 1500);
        return () => clearTimeout(t);
      }
      // Show joke setup for 3.5 seconds
      const t1 = setTimeout(() => setStage("punchline"), 3500);
      return () => clearTimeout(t1);
    }
    if (stage === "punchline") {
      // Show punchline for 3.5 seconds
      const t2 = setTimeout(() => setStage("entering"), 3500);
      return () => clearTimeout(t2);
    }
  }, [stage, error]);

  // Complete after progress bar
  useEffect(() => {
    if (stage === "entering") {
      const t = setTimeout(onComplete, 2200);
      return () => clearTimeout(t);
    }
  }, [stage, onComplete]);

  const skip = () => {
    setStage("entering");
    setTimeout(onComplete, 400);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background overflow-hidden select-none">
      {/* Animated ambient blobs */}
      <motion.div
        animate={{ scale: [1, 1.2, 1], opacity: [0.15, 0.25, 0.15] }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/30 rounded-full blur-[120px]"
      />
      <motion.div
        animate={{ scale: [1.2, 1, 1.2], opacity: [0.1, 0.2, 0.1] }}
        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
        className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-accent/25 rounded-full blur-[120px]"
      />
      <motion.div
        animate={{ x: [0, 30, 0], opacity: [0.08, 0.15, 0.08] }}
        transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
        className="absolute top-1/2 left-1/2 w-64 h-64 bg-secondary/20 rounded-full blur-[100px]"
      />

      {/* Skip button */}
      {stage !== "entering" && (
        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5 }}
          onClick={skip}
          className="absolute bottom-8 right-8 text-white/25 hover:text-white/60 text-sm font-medium transition-colors tracking-wide"
        >
          Skip →
        </motion.button>
      )}

      <AnimatePresence mode="wait">
        {/* ── Stage 1: Brand / Name reveal ── */}
        {stage === "brand" && (
          <motion.div
            key="brand"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, scale: 0.95, filter: "blur(10px)" }}
            transition={{ duration: 0.5 }}
            className="flex flex-col items-center text-center gap-8 px-6"
          >
            {/* Icon */}
            <motion.div
              initial={{ opacity: 0, scale: 0.5, rotate: -15 }}
              animate={{ opacity: 1, scale: 1, rotate: 0 }}
              transition={{ delay: 0.1, duration: 0.7, type: "spring", stiffness: 200, damping: 14 }}
              className="relative"
            >
              <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-primary/40 to-accent/40 border border-white/10 flex items-center justify-center shadow-[0_0_40px_rgba(124,58,237,0.5)] backdrop-blur-sm">
                <Sparkles className="w-12 h-12 text-white" />
              </div>
              {/* Orbiting dot */}
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                className="absolute -inset-3 rounded-full border border-dashed border-primary/30"
              />
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                className="absolute -top-1 left-1/2 -translate-x-1/2 w-2.5 h-2.5 bg-primary rounded-full shadow-[0_0_8px_rgba(124,58,237,0.8)]"
              />
            </motion.div>

            {/* Title — letter by letter */}
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-display font-extrabold text-white leading-tight tracking-tight">
              <AnimatedTitle text="Slay The Syllabus" />
            </h1>

            {/* Tagline */}
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.6, duration: 0.6 }}
              className="text-lg text-white/40 font-medium tracking-wide"
            >
              Your AI-powered study companion
            </motion.p>

            {/* Loading dots */}
            {isLoading && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 2 }}
                className="flex gap-1.5"
              >
                {[0, 1, 2].map(i => (
                  <motion.span
                    key={i}
                    animate={{ opacity: [0.3, 1, 0.3] }}
                    transition={{ duration: 1.2, repeat: Infinity, delay: i * 0.2 }}
                    className="w-1.5 h-1.5 rounded-full bg-primary/60"
                  />
                ))}
              </motion.div>
            )}
          </motion.div>
        )}

        {/* ── Stage 2: Joke setup ── */}
        {stage === "joke" && jokeData && !error && (
          <motion.div
            key="joke"
            initial={{ opacity: 0, y: 30, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.96 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="flex flex-col items-center text-center max-w-xl px-6 gap-6"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 300 }}
              className="text-4xl"
            >
              😂
            </motion.div>
            <div className="text-white/30 text-xs uppercase tracking-[0.3em] font-semibold">Study Break</div>
            <motion.h2
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3, duration: 0.8 }}
              className="text-2xl md:text-3xl lg:text-4xl font-display font-semibold text-white leading-snug"
            >
              "{jokeData.joke}"
            </motion.h2>
            <motion.div
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ delay: 0.5, duration: 3.5, ease: "linear" }}
              className="w-32 h-0.5 bg-gradient-to-r from-transparent via-white/20 to-transparent origin-left"
            />
          </motion.div>
        )}

        {/* ── Stage 3: Punchline ── */}
        {stage === "punchline" && jokeData && !error && (
          <motion.div
            key="punchline"
            initial={{ opacity: 0, y: 30, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.96 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="flex flex-col items-center text-center max-w-xl px-6 gap-8"
          >
            {/* Re-show the joke setup in smaller text */}
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.45 }}
              transition={{ delay: 0.1, duration: 0.5 }}
              className="text-base md:text-lg text-white/40 font-display italic leading-relaxed"
            >
              "{jokeData.joke}"
            </motion.p>

            {/* Punchline — big reveal */}
            <motion.div
              initial={{ opacity: 0, scale: 0.85, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ delay: 0.25, duration: 0.7, type: "spring", stiffness: 180, damping: 14 }}
              className="relative"
            >
              <div className="absolute inset-0 blur-2xl bg-primary/20 rounded-full scale-150" />
              <p className="relative text-2xl md:text-3xl lg:text-4xl font-display font-bold text-transparent bg-clip-text bg-gradient-to-r from-primary via-fuchsia-400 to-accent leading-tight">
                {jokeData.punchline}
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8 }}
              className="text-3xl"
            >
              😭
            </motion.div>

            <motion.div
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ delay: 0.4, duration: 3.5, ease: "linear" }}
              className="w-32 h-0.5 bg-gradient-to-r from-transparent via-white/20 to-transparent origin-left"
            />
          </motion.div>
        )}

        {/* ── Stage 4: Entering ── */}
        {stage === "entering" && (
          <motion.div
            key="entering"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="flex flex-col items-center gap-6"
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.1, duration: 0.4 }}
              className="text-4xl"
            >
              🚀
            </motion.div>
            <h2 className="text-3xl md:text-4xl font-display font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-primary via-fuchsia-400 to-accent">
              Entering the Grind...
            </h2>
            <div className="w-64 h-1.5 bg-white/10 rounded-full overflow-hidden shadow-inner">
              <motion.div
                initial={{ width: "0%" }}
                animate={{ width: "100%" }}
                transition={{ duration: 1.8, ease: [0.25, 0.46, 0.45, 0.94] }}
                className="h-full bg-gradient-to-r from-primary via-fuchsia-400 to-accent rounded-full"
              />
            </div>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="text-white/30 text-sm tracking-wide"
            >
              Slay The Syllabus
            </motion.p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
