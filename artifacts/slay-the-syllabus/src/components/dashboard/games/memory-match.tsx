import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useStudyStore } from "@/store/use-study-store";
import { useGenerateFlashcards } from "@workspace/api-client-react";
import { Loader2, Trophy, RefreshCcw, Star } from "lucide-react";
import confetti from "canvas-confetti";

interface CardData {
  id: string;
  pairId: string;
  text: string;
  type: "term" | "def";
  isFlipped: boolean;
  isMatched: boolean;
}

export function MemoryMatchGame() {
  const { content, addXP } = useStudyStore();
  const [cards, setCards] = useState<CardData[]>([]);
  const [selected, setSelected] = useState<string[]>([]);
  const [moves, setMoves] = useState(0);
  const [matchedCount, setMatchedCount] = useState(0);
  const [isChecking, setIsChecking] = useState(false);
  const [startTime, setStartTime] = useState<number | null>(null);
  const [elapsed, setElapsed] = useState(0);
  const [gameWon, setGameWon] = useState(false);

  const { mutate: generate, isPending } = useGenerateFlashcards();

  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    if (startTime && !gameWon) {
      interval = setInterval(() => setElapsed(Math.floor((Date.now() - startTime) / 1000)), 1000);
    }
    return () => clearInterval(interval);
  }, [startTime, gameWon]);

  const buildGame = useCallback((pairs: { front: string; back: string }[]) => {
    const deck = pairs.slice(0, 6).flatMap((p, i) => [
      { id: `t-${i}`, pairId: String(i), text: p.front, type: "term" as const, isFlipped: false, isMatched: false },
      { id: `d-${i}`, pairId: String(i), text: p.back, type: "def" as const, isFlipped: false, isMatched: false },
    ]);
    // Fisher-Yates shuffle
    for (let i = deck.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [deck[i], deck[j]] = [deck[j], deck[i]];
    }
    setCards(deck);
    setSelected([]);
    setMoves(0);
    setMatchedCount(0);
    setGameWon(false);
    setElapsed(0);
    setStartTime(Date.now());
  }, []);

  const startGame = () => {
    if (!content) return;
    generate({ data: { content, count: 6 } }, {
      onSuccess: (data) => {
        if (data.flashcards.length > 0) buildGame(data.flashcards);
      },
    });
  };

  const handleCardClick = (cardId: string) => {
    if (isChecking) return;
    const card = cards.find(c => c.id === cardId);
    if (!card || card.isFlipped || card.isMatched || selected.includes(cardId)) return;

    const newSelected = [...selected, cardId];
    setCards(prev => prev.map(c => c.id === cardId ? { ...c, isFlipped: true } : c));

    if (newSelected.length === 2) {
      setSelected([]);
      setMoves(m => m + 1);
      setIsChecking(true);

      const [a, b] = newSelected.map(id => cards.find(c => c.id === id)!);
      const cardB = cards.find(c => c.id === cardId)!;
      const cardA = cards.find(c => c.id === newSelected[0])!;

      const aIsMatch = cardA.pairId === cardB.pairId && cardA.type !== cardB.type;
      if (aIsMatch) {
        setTimeout(() => {
          setCards(prev => prev.map(c =>
            c.pairId === cardA.pairId ? { ...c, isMatched: true } : c
          ));
          const newCount = matchedCount + 1;
          setMatchedCount(newCount);
          addXP(15);
          if (newCount === 6) {
            setGameWon(true);
            confetti({ particleCount: 200, spread: 90, origin: { y: 0.6 } });
            addXP(100);
          }
          setIsChecking(false);
        }, 500);
      } else {
        setTimeout(() => {
          setCards(prev => prev.map(c =>
            newSelected.includes(c.id) ? { ...c, isFlipped: false } : c
          ));
          setIsChecking(false);
        }, 1000);
      }
    } else {
      setSelected(newSelected);
    }
  };

  const formatTime = (s: number) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;

  if (!content) {
    return (
      <div className="text-center py-12 text-white/40">
        <p>Add content in the Knowledge Base tab first to play!</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="flex gap-6 text-sm">
          <span className="text-white/60">Moves: <strong className="text-white">{moves}</strong></span>
          <span className="text-white/60">Matched: <strong className="text-green-400">{matchedCount}/6</strong></span>
          {startTime && <span className="text-white/60">Time: <strong className="text-accent">{formatTime(elapsed)}</strong></span>}
        </div>
        <button
          onClick={startGame}
          disabled={isPending}
          className="px-5 py-2 bg-cyan-600 hover:bg-cyan-500 text-white font-bold rounded-xl flex items-center gap-2 transition-colors disabled:opacity-50"
        >
          {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCcw className="w-4 h-4" />}
          {cards.length ? "New Game" : "Start Game"}
        </button>
      </div>

      {isPending && (
        <div className="h-64 flex items-center justify-center">
          <Loader2 className="w-10 h-10 text-cyan-400 animate-spin" />
        </div>
      )}

      {gameWon && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="glass-card rounded-2xl p-8 text-center glow-border"
        >
          <Trophy className="w-16 h-16 text-yellow-400 mx-auto mb-3" />
          <h3 className="text-2xl font-display font-bold text-white mb-1">You matched them all!</h3>
          <p className="text-white/60">{moves} moves · {formatTime(elapsed)} · +100 XP</p>
          <button onClick={startGame} className="mt-4 px-6 py-2.5 bg-cyan-600 hover:bg-cyan-500 text-white font-bold rounded-xl transition-colors">
            Play Again
          </button>
        </motion.div>
      )}

      {cards.length > 0 && !isPending && (
        <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
          {cards.map((card) => (
            <motion.div
              key={card.id}
              className="aspect-[4/3] cursor-pointer perspective-1000"
              whileHover={!card.isFlipped && !card.isMatched ? { scale: 1.05 } : {}}
              onClick={() => handleCardClick(card.id)}
            >
              <motion.div
                className="w-full h-full relative preserve-3d transition-transform duration-500"
                style={{ transform: card.isFlipped || card.isMatched ? "rotateY(180deg)" : "rotateY(0deg)" }}
              >
                {/* Card back (face-down) */}
                <div className="absolute inset-0 backface-hidden rounded-xl bg-gradient-to-br from-violet-800 to-indigo-900 border-2 border-violet-500/40 flex items-center justify-center shadow-lg">
                  <Star className="w-8 h-8 text-violet-400/60" />
                </div>
                {/* Card front (revealed) */}
                <div
                  className={`absolute inset-0 backface-hidden rounded-xl border-2 flex items-center justify-center p-2 text-center text-xs font-medium leading-tight shadow-lg [transform:rotateY(180deg)] ${
                    card.isMatched
                      ? "bg-green-900/60 border-green-400 text-green-200"
                      : card.type === "term"
                      ? "bg-blue-900/60 border-blue-400/60 text-blue-100"
                      : "bg-fuchsia-900/60 border-fuchsia-400/60 text-fuchsia-100"
                  }`}
                >
                  <span>{card.text}</span>
                </div>
              </motion.div>
            </motion.div>
          ))}
        </div>
      )}

      {cards.length === 0 && !isPending && (
        <div className="h-48 flex flex-col items-center justify-center gap-3 text-white/40 border-2 border-dashed border-white/10 rounded-2xl">
          <span className="text-4xl">🃏</span>
          <p>Match terms to definitions — click "Start Game" to generate cards from your content</p>
        </div>
      )}

      <div className="text-xs text-white/30 flex gap-4">
        <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-blue-700 inline-block" /> Term</span>
        <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-fuchsia-700 inline-block" /> Definition</span>
        <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-green-700 inline-block" /> Matched!</span>
      </div>
    </div>
  );
}
