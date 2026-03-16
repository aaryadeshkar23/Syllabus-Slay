import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useGetStudyJoke } from "@workspace/api-client-react";
import { useStudyStore } from "@/store/use-study-store";
import { Loader2, Sparkles } from "lucide-react";

export function SplashScreen({ onComplete }: { onComplete: () => void }) {
  const { data: jokeData, isLoading, error } = useGetStudyJoke();
  const [stage, setStage] = useState<"loading" | "joke" | "punchline" | "entering">("loading");
  
  useEffect(() => {
    if (!isLoading) {
      if (error) {
        setStage("entering");
      } else {
        setStage("joke");
        setTimeout(() => setStage("punchline"), 2500);
        setTimeout(() => setStage("entering"), 5000);
      }
    }
  }, [isLoading, error]);

  useEffect(() => {
    if (stage === "entering") {
      const timer = setTimeout(onComplete, 1500);
      return () => clearTimeout(timer);
    }
  }, [stage, onComplete]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background overflow-hidden">
      {/* Decorative blobs */}
      <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-primary/20 rounded-full blur-[100px] mix-blend-screen" />
      <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-secondary/20 rounded-full blur-[120px] mix-blend-screen" />

      <AnimatePresence mode="wait">
        {stage === "loading" && (
          <motion.div
            key="loading"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.1 }}
            className="flex flex-col items-center text-center space-y-6"
          >
            <div className="relative">
              <Sparkles className="w-16 h-16 text-primary animate-pulse" />
              <div className="absolute inset-0 bg-primary/30 blur-xl rounded-full" />
            </div>
            <h1 className="text-4xl font-display font-bold text-white">Slay The Syllabus</h1>
            <Loader2 className="w-6 h-6 text-muted-foreground animate-spin" />
          </motion.div>
        )}

        {(stage === "joke" || stage === "punchline") && jokeData && (
          <motion.div
            key="joke"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="flex flex-col items-center text-center max-w-lg px-6"
          >
            <Sparkles className="w-8 h-8 text-secondary mb-6" />
            <h2 className="text-2xl md:text-3xl font-display text-white/90 leading-tight">
              "{jokeData.joke}"
            </h2>
            <AnimatePresence>
              {stage === "punchline" && (
                <motion.p
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="mt-8 text-xl text-primary font-medium"
                >
                  {jokeData.punchline}
                </motion.p>
              )}
            </AnimatePresence>
          </motion.div>
        )}

        {stage === "entering" && (
          <motion.div
            key="entering"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center"
          >
            <h2 className="text-3xl font-display text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent font-bold">
              Entering the Grind...
            </h2>
            <div className="w-48 h-1 bg-white/10 rounded-full mt-6 overflow-hidden">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: "100%" }}
                transition={{ duration: 1, ease: "easeInOut" }}
                className="h-full bg-gradient-to-r from-primary to-accent"
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
