import { useState } from "react";
import { FileText, Link as LinkIcon, Upload, CheckCircle2 } from "lucide-react";
import { useStudyStore } from "@/store/use-study-store";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

export function UploadTab() {
  const { content, setContent, addXP } = useStudyStore();
  const [activeType, setActiveType] = useState<"text" | "url">("text");
  const [inputVal, setInputVal] = useState(content);
  const [isSaved, setIsSaved] = useState(false);

  const handleSave = () => {
    if (!inputVal.trim()) return;
    setContent(inputVal);
    setIsSaved(true);
    addXP(10); // Reward for uploading content
    setTimeout(() => setIsSaved(false), 2000);
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h2 className="text-3xl font-display font-bold text-white mb-2">Feed the Machine</h2>
        <p className="text-white/60">Paste your syllabus, lecture notes, or topic to get started.</p>
      </div>

      <div className="glass-card rounded-3xl overflow-hidden p-1">
        <div className="flex gap-2 p-3 bg-black/20 rounded-t-[1.3rem] border-b border-white/5">
          <button
            onClick={() => setActiveType("text")}
            className={cn(
              "flex items-center gap-2 px-6 py-2.5 rounded-xl font-medium transition-all",
              activeType === "text" ? "bg-white/10 text-white" : "text-white/50 hover:text-white hover:bg-white/5"
            )}
          >
            <FileText className="w-4 h-4" /> Text/Notes
          </button>
          <button
            onClick={() => setActiveType("url")}
            className={cn(
              "flex items-center gap-2 px-6 py-2.5 rounded-xl font-medium transition-all opacity-50 cursor-not-allowed",
              activeType === "url" ? "bg-white/10 text-white" : "text-white/50"
            )}
            title="Coming soon"
          >
            <LinkIcon className="w-4 h-4" /> Web / YouTube URL
          </button>
        </div>

        <div className="p-6">
          <textarea
            value={inputVal}
            onChange={(e) => setInputVal(e.target.value)}
            placeholder="Paste your chaotic notes here. The AI will make sense of it..."
            className="w-full h-80 bg-black/20 border border-white/10 rounded-2xl p-6 text-white placeholder:text-white/20 focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none custom-scrollbar text-lg leading-relaxed"
          />

          <div className="mt-6 flex justify-end">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleSave}
              disabled={!inputVal.trim()}
              className="flex items-center gap-2 px-8 py-3 rounded-xl bg-gradient-to-r from-primary to-accent text-white font-semibold disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_0_15px_rgba(124,58,237,0.3)] hover:shadow-[0_0_25px_rgba(124,58,237,0.5)] transition-all"
            >
              {isSaved ? <CheckCircle2 className="w-5 h-5" /> : <Upload className="w-5 h-5" />}
              {isSaved ? "Saved to Memory!" : "Process Content"}
            </motion.button>
          </div>
        </div>
      </div>
    </div>
  );
}
