import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Lightbulb, Send, Sparkles, X, ChevronRight } from "lucide-react";
import { useExplainConcept } from "@workspace/api-client-react";
import type { ExplainRequestLevel } from "@workspace/api-client-react";
import { cn } from "@/lib/utils";
import ReactMarkdown from "react-markdown";

const LEVELS: { value: ExplainRequestLevel; label: string }[] = [
  { value: "eli5", label: "ELI5 (5 Year Old)" },
  { value: "beginner", label: "Beginner" },
  { value: "intermediate", label: "Intermediate" },
  { value: "advanced", label: "Advanced" },
];

export function ExplainFloatingAction() {
  const [isOpen, setIsOpen] = useState(false);
  const [concept, setConcept] = useState("");
  const [level, setLevel] = useState<ExplainRequestLevel>("beginner");
  
  const { mutate: explain, isPending, data } = useExplainConcept();

  const handleExplain = (e: React.FormEvent) => {
    e.preventDefault();
    if (!concept.trim()) return;
    explain({ data: { concept, level } });
  };

  return (
    <div className="fixed bottom-6 left-6 z-40">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.9, x: -20 }}
            animate={{ opacity: 1, y: 0, scale: 1, x: 0 }}
            exit={{ opacity: 0, y: 20, scale: 0.9, x: -20 }}
            className="absolute bottom-20 left-0 w-80 md:w-96 glass-card rounded-2xl glow-border flex flex-col max-h-[600px]"
          >
            <div className="p-4 border-b border-white/10 flex justify-between items-center bg-white/5 rounded-t-2xl">
              <h3 className="font-display font-semibold text-white flex items-center gap-2">
                <Lightbulb className="w-5 h-5 text-accent" />
                Explain Concept
              </h3>
              <button onClick={() => setIsOpen(false)} className="text-white/50 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 overflow-y-auto flex-1 custom-scrollbar">
              {!data && !isPending && (
                <div className="text-center py-8 text-white/50">
                  <Sparkles className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p>Type any concept you're stuck on, and AI will break it down for you.</p>
                </div>
              )}

              {isPending && (
                <div className="space-y-4 animate-pulse py-4">
                  <div className="h-4 bg-white/10 rounded w-3/4"></div>
                  <div className="h-4 bg-white/10 rounded w-full"></div>
                  <div className="h-4 bg-white/10 rounded w-5/6"></div>
                  <div className="h-20 bg-white/10 rounded-lg w-full mt-4"></div>
                </div>
              )}

              {data && !isPending && (
                <div className="space-y-4">
                  <div className="inline-block px-3 py-1 bg-primary/20 text-primary-foreground text-xs rounded-full border border-primary/30 mb-2">
                    Level: {data.level}
                  </div>
                  <div className="prose prose-invert prose-p:leading-relaxed text-sm">
                    <ReactMarkdown>{data.explanation}</ReactMarkdown>
                  </div>
                  
                  {data.analogy && (
                    <div className="bg-white/5 border-l-2 border-accent p-3 rounded-r-lg mt-4">
                      <strong className="text-accent text-xs uppercase tracking-wider block mb-1">Analogy</strong>
                      <p className="text-sm text-white/80 m-0">{data.analogy}</p>
                    </div>
                  )}

                  {data.examples && data.examples.length > 0 && (
                    <div className="mt-4">
                      <strong className="text-white/90 text-sm block mb-2">Examples:</strong>
                      <ul className="space-y-2">
                        {data.examples.map((ex, i) => (
                          <li key={i} className="flex gap-2 text-sm text-white/70">
                            <ChevronRight className="w-4 h-4 shrink-0 text-primary mt-0.5" />
                            <span>{ex}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}
            </div>

            <form onSubmit={handleExplain} className="p-3 border-t border-white/10 bg-black/20 rounded-b-2xl">
              <div className="flex gap-2 mb-3 overflow-x-auto pb-1 custom-scrollbar">
                {LEVELS.map((lvl) => (
                  <button
                    key={lvl.value}
                    type="button"
                    onClick={() => setLevel(lvl.value)}
                    className={cn(
                      "px-3 py-1 rounded-full text-xs whitespace-nowrap transition-colors border",
                      level === lvl.value 
                        ? "bg-primary text-white border-primary" 
                        : "bg-white/5 text-white/60 border-white/10 hover:bg-white/10"
                    )}
                  >
                    {lvl.label}
                  </button>
                ))}
              </div>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={concept}
                  onChange={(e) => setConcept(e.target.value)}
                  placeholder="E.g. Quantum Entanglement..."
                  className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/20"
                />
                <button
                  type="submit"
                  disabled={isPending || !concept.trim()}
                  className="w-10 h-10 shrink-0 bg-primary hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl flex items-center justify-center text-white transition-colors"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(!isOpen)}
        className="w-14 h-14 rounded-full bg-glass backdrop-blur-md border-2 border-accent/50 shadow-[0_0_20px_rgba(217,70,239,0.3)] flex items-center justify-center text-accent hover:bg-accent hover:text-white transition-all duration-300"
      >
        <Lightbulb className="w-6 h-6" />
      </motion.button>
    </div>
  );
}
