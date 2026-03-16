import { useState } from "react";
import { useStudyStore } from "@/store/use-study-store";
import { useGenerateFlashcards } from "@workspace/api-client-react";
import { motion, AnimatePresence } from "framer-motion";
import { Layers, Loader2, RefreshCcw, ChevronLeft, ChevronRight, Check } from "lucide-react";
import confetti from "canvas-confetti";

export function FlashcardsTab() {
  const { content, addXP } = useStudyStore();
  const [count, setCount] = useState(10);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [knownCards, setKnownCards] = useState<Set<number>>(new Set());

  const { mutate: generate, isPending, data } = useGenerateFlashcards();

  const handleGenerate = () => {
    if (!content) return;
    generate({ data: { content, count } });
    setCurrentIndex(0);
    setIsFlipped(false);
    setKnownCards(new Set());
  };

  const nextCard = () => {
    if (data && currentIndex < data.flashcards.length - 1) {
      setIsFlipped(false);
      setTimeout(() => setCurrentIndex(c => c + 1), 150);
    }
  };

  const prevCard = () => {
    if (currentIndex > 0) {
      setIsFlipped(false);
      setTimeout(() => setCurrentIndex(c => c - 1), 150);
    }
  };

  const markKnown = () => {
    if (!data) return;
    const newKnown = new Set(knownCards).add(currentIndex);
    setKnownCards(newKnown);
    addXP(5);
    
    if (newKnown.size === data.flashcards.length) {
      confetti({ particleCount: 150, spread: 80, origin: { y: 0.6 } });
      addXP(50); // bonus for finishing deck
    }
    nextCard();
  };

  if (!content) {
    return (
      <div className="flex flex-col items-center justify-center h-96 text-center">
        <Layers className="w-16 h-16 text-white/20 mb-4" />
        <h3 className="text-xl font-display text-white/60">No content provided yet.</h3>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="flex justify-between items-center bg-black/20 p-4 rounded-2xl border border-white/5">
        <div className="flex items-center gap-4">
          <label className="text-sm text-white/60">Deck Size:</label>
          <select 
            value={count} 
            onChange={(e) => setCount(Number(e.target.value))}
            className="bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-white focus:outline-none"
          >
            <option value={5} className="bg-background">5 Cards</option>
            <option value={10} className="bg-background">10 Cards</option>
            <option value={20} className="bg-background">20 Cards</option>
          </select>
        </div>
        <button
          onClick={handleGenerate}
          disabled={isPending}
          className="px-6 py-2 bg-primary text-white font-bold rounded-xl hover:bg-primary/90 transition-colors disabled:opacity-50 flex items-center gap-2"
        >
          {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCcw className="w-4 h-4" />}
          {data ? "Regenerate Deck" : "Create Deck"}
        </button>
      </div>

      {isPending && (
        <div className="h-96 w-full max-w-2xl mx-auto rounded-3xl bg-white/5 animate-pulse border border-white/10 flex items-center justify-center">
          <Loader2 className="w-10 h-10 text-primary animate-spin" />
        </div>
      )}

      {data && !isPending && (
        <div className="flex flex-col items-center">
          <div className="text-white/50 font-mono mb-4 text-sm font-semibold tracking-widest uppercase">
            Card {currentIndex + 1} of {data.flashcards.length}
          </div>
          
          <div className="relative w-full max-w-2xl aspect-[3/2] perspective-[1000px]">
            <motion.div
              className="w-full h-full relative preserve-3d cursor-pointer"
              animate={{ rotateX: isFlipped ? 180 : 0 }}
              transition={{ duration: 0.6, type: "spring", stiffness: 260, damping: 20 }}
              onClick={() => setIsFlipped(!isFlipped)}
            >
              {/* Front */}
              <div className="absolute inset-0 backface-hidden glass-card rounded-3xl flex flex-col items-center justify-center p-8 sm:p-12 text-center glow-border border-white/20">
                <div className="absolute top-6 left-6 text-xs font-bold text-primary tracking-widest uppercase bg-primary/10 px-3 py-1 rounded-full">Front</div>
                <h3 className="text-2xl sm:text-3xl md:text-4xl font-display font-semibold text-white leading-tight">
                  {data.flashcards[currentIndex].front}
                </h3>
                <div className="absolute bottom-6 text-white/30 text-sm">Click to flip</div>
              </div>

              {/* Back */}
              <div className="absolute inset-0 backface-hidden glass-card bg-gradient-to-br from-indigo-900/40 to-purple-900/40 rounded-3xl flex flex-col items-center justify-center p-8 sm:p-12 text-center border-accent/30 shadow-[0_0_30px_rgba(217,70,239,0.15)] [transform:rotateX(180deg)]">
                <div className="absolute top-6 left-6 text-xs font-bold text-accent tracking-widest uppercase bg-accent/10 px-3 py-1 rounded-full">Back</div>
                <p className="text-xl sm:text-2xl text-white/90 leading-relaxed">
                  {data.flashcards[currentIndex].back}
                </p>
                
                {isFlipped && (
                  <div className="absolute bottom-6 flex gap-4 w-full justify-center px-8">
                    <button 
                      onClick={(e) => { e.stopPropagation(); markKnown(); }}
                      className="px-6 py-2 bg-green-500/20 text-green-400 hover:bg-green-500/30 rounded-full font-medium transition-colors border border-green-500/30 flex items-center gap-2"
                    >
                      <Check className="w-4 h-4" /> Got it
                    </button>
                  </div>
                )}
              </div>
            </motion.div>
          </div>

          <div className="flex gap-6 mt-10">
            <button
              onClick={prevCard}
              disabled={currentIndex === 0}
              className="p-4 rounded-full glass-panel hover:bg-white/10 disabled:opacity-30 disabled:hover:bg-transparent transition-all"
            >
              <ChevronLeft className="w-6 h-6 text-white" />
            </button>
            <button
              onClick={nextCard}
              disabled={currentIndex === data.flashcards.length - 1}
              className="p-4 rounded-full glass-panel hover:bg-white/10 disabled:opacity-30 disabled:hover:bg-transparent transition-all"
            >
              <ChevronRight className="w-6 h-6 text-white" />
            </button>
          </div>

          {knownCards.size > 0 && (
            <div className="mt-8 w-full max-w-md">
              <div className="flex justify-between text-xs text-white/50 mb-2">
                <span>Mastery Progress</span>
                <span>{Math.round((knownCards.size / data.flashcards.length) * 100)}%</span>
              </div>
              <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
                <motion.div 
                  className="h-full bg-green-400"
                  initial={{ width: 0 }}
                  animate={{ width: `${(knownCards.size / data.flashcards.length) * 100}%` }}
                />
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
