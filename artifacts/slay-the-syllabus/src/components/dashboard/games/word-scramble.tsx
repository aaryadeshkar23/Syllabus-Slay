import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useStudyStore } from "@/store/use-study-store";
import { useGenerateFlashcards } from "@workspace/api-client-react";
import { Loader2, Shuffle, Trophy, RefreshCcw, Send } from "lucide-react";
import { cn } from "@/lib/utils";
import confetti from "canvas-confetti";

function scramble(word: string): string {
  const arr = word.split("");
  // Keep scrambling until it's actually different
  let out: string;
  let attempts = 0;
  do {
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    out = arr.join("");
    attempts++;
  } while (out === word && attempts < 10);
  return out;
}

interface Puzzle {
  word: string;
  hint: string;
  scrambled: string;
}

export function WordScrambleGame() {
  const { content, addXP } = useStudyStore();
  const [puzzles, setPuzzles] = useState<Puzzle[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [input, setInput] = useState("");
  const [feedback, setFeedback] = useState<"correct" | "wrong" | null>(null);
  const [score, setScore] = useState(0);
  const [skipped, setSkipped] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [revealed, setRevealed] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const { mutate: generate, isPending } = useGenerateFlashcards();

  const startGame = () => {
    if (!content) return;
    generate({ data: { content, count: 8 } }, {
      onSuccess: (data) => {
        // Extract single-word or short-phrase terms from flashcard fronts
        const terms = data.flashcards
          .map(f => {
            const words = f.front.replace(/[?!.,]/g, "").split(" ");
            // Prefer the last meaningful word (usually the key term) or single-word fronts
            return { word: words[words.length - 1], hint: f.back };
          })
          .filter(t => t.word.length >= 4 && /^[a-zA-Z]+$/.test(t.word))
          .slice(0, 6);

        if (terms.length === 0) {
          alert("Could not extract suitable words. Try different content.");
          return;
        }
        const built: Puzzle[] = terms.map(t => ({
          word: t.word,
          hint: t.hint.slice(0, 80) + (t.hint.length > 80 ? "…" : ""),
          scrambled: scramble(t.word),
        }));
        setPuzzles(built);
        setCurrentIndex(0);
        setInput("");
        setFeedback(null);
        setScore(0);
        setSkipped(0);
        setGameOver(false);
        setRevealed(false);
        setTimeout(() => inputRef.current?.focus(), 100);
      },
    });
  };

  const current = puzzles[currentIndex];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!current || !input.trim()) return;
    const isRight = input.trim().toLowerCase() === current.word.toLowerCase();
    setFeedback(isRight ? "correct" : "wrong");
    if (isRight) {
      addXP(20);
      setScore(s => s + 20);
      if (!revealed) addXP(5); // bonus for no reveal
    }
    setTimeout(advance, 1200);
  };

  const advance = () => {
    setInput("");
    setFeedback(null);
    setRevealed(false);
    if (currentIndex + 1 >= puzzles.length) {
      setGameOver(true);
      confetti({ particleCount: 80, spread: 60, origin: { y: 0.6 } });
    } else {
      setCurrentIndex(i => i + 1);
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  };

  const skip = () => {
    setSkipped(s => s + 1);
    advance();
  };

  const reveal = () => {
    setRevealed(true);
  };

  if (!content) {
    return (
      <div className="text-center py-12 text-white/40">
        <p>Add content in the Knowledge Base tab first to play!</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {puzzles.length === 0 && !gameOver && (
        <div className="text-center py-8 space-y-6">
          <div className="w-20 h-20 mx-auto rounded-full bg-green-600/20 border-2 border-green-500/40 flex items-center justify-center">
            <Shuffle className="w-10 h-10 text-green-400" />
          </div>
          <div>
            <h3 className="text-xl font-display font-bold text-white mb-2">Word Scramble</h3>
            <p className="text-white/60 max-w-sm mx-auto">Unscramble key study terms extracted from your content. Use hints if you're stuck!</p>
          </div>
          <button
            onClick={startGame}
            disabled={isPending}
            className="px-8 py-3 bg-gradient-to-r from-green-600 to-emerald-500 text-white font-bold rounded-xl flex items-center gap-2 mx-auto shadow-[0_0_20px_rgba(22,163,74,0.4)]"
          >
            {isPending ? <Loader2 className="w-5 h-5 animate-spin" /> : <Shuffle className="w-5 h-5" />}
            {isPending ? "Generating..." : "Scramble My Terms!"}
          </button>
        </div>
      )}

      {gameOver && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center py-8 space-y-5"
        >
          <Trophy className="w-16 h-16 text-yellow-400 mx-auto" />
          <h3 className="text-2xl font-display font-bold text-white">Puzzle Solved!</h3>
          <div className="flex gap-4 justify-center">
            <div className="glass-card p-4 rounded-2xl text-center min-w-[80px]">
              <div className="text-2xl font-bold text-green-400">{score}</div>
              <div className="text-xs text-white/50">XP Earned</div>
            </div>
            <div className="glass-card p-4 rounded-2xl text-center min-w-[80px]">
              <div className="text-2xl font-bold text-red-400">{skipped}</div>
              <div className="text-xs text-white/50">Skipped</div>
            </div>
          </div>
          <button onClick={startGame} disabled={isPending} className="px-8 py-3 bg-gradient-to-r from-green-600 to-emerald-500 text-white font-bold rounded-xl flex items-center gap-2 mx-auto">
            <RefreshCcw className="w-5 h-5" /> Play Again
          </button>
        </motion.div>
      )}

      {current && !gameOver && (
        <AnimatePresence mode="wait">
          <motion.div
            key={currentIndex}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-5"
          >
            {/* Progress */}
            <div className="flex justify-between items-center text-sm">
              <span className="text-white/60">Word {currentIndex + 1} of {puzzles.length}</span>
              <span className="text-green-400 font-bold">{score} XP</span>
            </div>

            {/* Scrambled word */}
            <div className="glass-card rounded-2xl p-8 text-center glow-border">
              <p className="text-xs text-white/40 uppercase tracking-widest mb-4">Unscramble this word</p>
              <div className="flex gap-2 justify-center flex-wrap">
                {current.scrambled.split("").map((letter, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className="w-10 h-12 rounded-lg bg-green-600/20 border-2 border-green-500/40 flex items-center justify-center text-xl font-bold font-mono text-green-300 uppercase"
                  >
                    {letter}
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Hint */}
            <div className="p-4 bg-white/5 border border-white/10 rounded-xl text-sm text-white/60">
              <span className="text-white/30 uppercase text-xs tracking-widest block mb-1">Hint</span>
              {current.hint}
            </div>

            {/* Input */}
            <form onSubmit={handleSubmit} className="flex gap-3">
              <input
                ref={inputRef}
                value={input}
                onChange={e => setInput(e.target.value)}
                placeholder="Type your answer..."
                disabled={!!feedback}
                className={cn(
                  "flex-1 bg-black/30 border rounded-xl px-5 py-3.5 text-white font-mono text-lg uppercase tracking-widest placeholder:text-white/20 focus:outline-none focus:ring-2 transition-all",
                  feedback === "correct" ? "border-green-400 focus:ring-green-400/30 bg-green-900/20" :
                  feedback === "wrong" ? "border-red-400 focus:ring-red-400/30 bg-red-900/20 animate-pulse" :
                  "border-white/10 focus:ring-primary/30"
                )}
              />
              <button type="submit" disabled={!input.trim() || !!feedback} className="px-5 py-3.5 bg-green-600 hover:bg-green-500 text-white font-bold rounded-xl disabled:opacity-50 transition-colors flex items-center gap-2">
                <Send className="w-4 h-4" />
              </button>
            </form>

            {feedback && (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className={cn("text-center font-bold text-lg", feedback === "correct" ? "text-green-400" : "text-red-400")}
              >
                {feedback === "correct" ? "🎉 Correct! +20 XP" : `❌ The answer was "${current.word}"`}
              </motion.p>
            )}

            {!feedback && (
              <div className="flex gap-3 justify-center">
                {!revealed && (
                  <button onClick={reveal} className="px-4 py-2 text-sm text-white/40 hover:text-white/70 border border-white/10 rounded-lg transition-colors">
                    Reveal Answer
                  </button>
                )}
                {revealed && (
                  <p className="text-accent text-sm">Answer: <strong className="text-white">{current.word}</strong></p>
                )}
                <button onClick={skip} className="px-4 py-2 text-sm text-white/40 hover:text-white/70 border border-white/10 rounded-lg transition-colors">
                  Skip
                </button>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      )}
    </div>
  );
}
