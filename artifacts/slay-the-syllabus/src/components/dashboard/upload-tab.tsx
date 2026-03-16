import { useState } from "react";
import { FileText, Link as LinkIcon, Upload, CheckCircle2, Youtube, Loader2, AlertCircle } from "lucide-react";
import { useStudyStore } from "@/store/use-study-store";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

function isValidYouTubeUrl(url: string) {
  return /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/|youtube\.com\/shorts\/)/.test(url);
}

export function UploadTab() {
  const { content, setContent, addXP } = useStudyStore();
  const [activeType, setActiveType] = useState<"text" | "url">("text");
  const [textInput, setTextInput] = useState(content);
  const [urlInput, setUrlInput] = useState("");
  const [isSaved, setIsSaved] = useState(false);
  const [isLoadingYT, setIsLoadingYT] = useState(false);
  const [ytError, setYtError] = useState<string | null>(null);
  const [ytResult, setYtResult] = useState<{ title?: string; summary?: string } | null>(null);

  const handleSaveText = () => {
    if (!textInput.trim()) return;
    setContent(textInput);
    setIsSaved(true);
    addXP(10);
    setTimeout(() => setIsSaved(false), 2000);
  };

  const handleYouTube = async () => {
    if (!urlInput.trim() || !isValidYouTubeUrl(urlInput)) {
      setYtError("Please enter a valid YouTube URL (e.g. https://youtube.com/watch?v=...)");
      return;
    }
    setIsLoadingYT(true);
    setYtError(null);
    setYtResult(null);

    try {
      const base = import.meta.env.BASE_URL.replace(/\/$/, "");
      const res = await fetch(`${base}/api/ai/youtube`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: urlInput }),
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Failed to process YouTube video");
      }

      // Build content string from the result
      const fullContent = [
        `# ${data.title}`,
        `## Summary\n${data.summary}`,
        `## Key Points\n${data.keyPoints.map((p: string) => `- ${p}`).join("\n")}`,
        `## Key Concepts\n${data.concepts.map((c: string) => `- ${c}`).join("\n")}`,
      ].join("\n\n");

      setContent(fullContent);
      setTextInput(fullContent);
      setYtResult({ title: data.title, summary: data.summary });
      addXP(20);
      setActiveType("text");
    } catch (err: unknown) {
      setYtError(err instanceof Error ? err.message : "Failed to process YouTube video. Please try again.");
    } finally {
      setIsLoadingYT(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h2 className="text-3xl font-display font-bold text-white mb-2">Feed the Machine</h2>
        <p className="text-white/60">Paste notes, text content, or paste a YouTube lecture URL to get started.</p>
      </div>

      <div className="glass-card rounded-3xl overflow-hidden p-1">
        {/* Tab Switcher */}
        <div className="flex gap-2 p-3 bg-black/20 rounded-t-[1.3rem] border-b border-white/5">
          <button
            onClick={() => setActiveType("text")}
            className={cn(
              "flex items-center gap-2 px-6 py-2.5 rounded-xl font-medium transition-all",
              activeType === "text" ? "bg-white/10 text-white" : "text-white/50 hover:text-white hover:bg-white/5"
            )}
          >
            <FileText className="w-4 h-4" /> Text / Notes
          </button>
          <button
            onClick={() => setActiveType("url")}
            className={cn(
              "flex items-center gap-2 px-6 py-2.5 rounded-xl font-medium transition-all",
              activeType === "url"
                ? "bg-red-500/20 text-red-300 border border-red-500/30"
                : "text-white/50 hover:text-white hover:bg-white/5"
            )}
          >
            <Youtube className="w-4 h-4" /> YouTube URL
          </button>
        </div>

        <div className="p-6">
          {activeType === "text" ? (
            <>
              {ytResult && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mb-4 p-4 bg-green-500/10 border border-green-500/30 rounded-xl text-sm"
                >
                  <CheckCircle2 className="w-4 h-4 text-green-400 inline mr-2" />
                  <span className="text-green-300 font-medium">YouTube loaded:</span>
                  <span className="text-white/70 ml-2">{ytResult.title}</span>
                  <p className="text-white/50 mt-1 text-xs">Content has been extracted and loaded below. You can edit it or proceed to other tabs.</p>
                </motion.div>
              )}
              <textarea
                value={textInput}
                onChange={(e) => setTextInput(e.target.value)}
                placeholder="Paste your chaotic notes here. The AI will make sense of it..."
                className="w-full h-80 bg-black/20 border border-white/10 rounded-2xl p-6 text-white placeholder:text-white/20 focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none custom-scrollbar text-base leading-relaxed"
              />
              <div className="mt-6 flex justify-between items-center">
                <span className="text-white/30 text-sm">{textInput.length} characters</span>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleSaveText}
                  disabled={!textInput.trim()}
                  className="flex items-center gap-2 px-8 py-3 rounded-xl bg-gradient-to-r from-primary to-accent text-white font-semibold disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_0_15px_rgba(124,58,237,0.3)] hover:shadow-[0_0_25px_rgba(124,58,237,0.5)] transition-all"
                >
                  {isSaved ? <CheckCircle2 className="w-5 h-5" /> : <Upload className="w-5 h-5" />}
                  {isSaved ? "Saved to Memory!" : "Process Content"}
                </motion.button>
              </div>
            </>
          ) : (
            <div className="space-y-4">
              <div className="p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-xl text-sm text-yellow-200/80 flex items-start gap-3">
                <Youtube className="w-5 h-5 text-red-400 mt-0.5 shrink-0" />
                <div>
                  <p className="font-medium text-white/90 mb-1">YouTube Lecture Analyzer</p>
                  <p>Paste a YouTube video URL and the AI will extract the transcript and generate structured study notes.</p>
                  <p className="text-yellow-300/60 text-xs mt-1">Works best with videos that have subtitles/captions enabled.</p>
                </div>
              </div>

              <div className="flex gap-3">
                <input
                  type="url"
                  value={urlInput}
                  onChange={(e) => { setUrlInput(e.target.value); setYtError(null); }}
                  placeholder="https://www.youtube.com/watch?v=..."
                  className="flex-1 bg-black/30 border border-white/10 rounded-xl px-5 py-4 text-white placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-red-500/50 text-sm"
                />
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleYouTube}
                  disabled={isLoadingYT || !urlInput.trim()}
                  className="flex items-center gap-2 px-6 py-4 bg-gradient-to-r from-red-600 to-rose-500 text-white font-bold rounded-xl disabled:opacity-50 transition-all shadow-[0_0_15px_rgba(220,38,38,0.4)] whitespace-nowrap"
                >
                  {isLoadingYT ? (
                    <><Loader2 className="w-5 h-5 animate-spin" /> Extracting...</>
                  ) : (
                    <><Youtube className="w-5 h-5" /> Analyze</>
                  )}
                </motion.button>
              </div>

              {ytError && (
                <motion.div
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-start gap-3 p-4 bg-red-500/10 border border-red-500/30 rounded-xl"
                >
                  <AlertCircle className="w-5 h-5 text-red-400 mt-0.5 shrink-0" />
                  <p className="text-red-300 text-sm">{ytError}</p>
                </motion.div>
              )}

              {isLoadingYT && (
                <div className="p-8 text-center space-y-3">
                  <Loader2 className="w-10 h-10 text-red-400 animate-spin mx-auto" />
                  <p className="text-white/60 animate-pulse">Extracting transcript and generating notes...</p>
                  <p className="text-white/30 text-xs">This may take 15-30 seconds depending on video length</p>
                </div>
              )}

              <div className="mt-4 p-4 bg-black/20 rounded-xl border border-white/5">
                <p className="text-white/50 text-sm font-medium mb-2">Example supported URLs:</p>
                <div className="space-y-1">
                  {[
                    "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
                    "https://youtu.be/dQw4w9WgXcQ",
                    "https://youtube.com/shorts/dQw4w9WgXcQ",
                  ].map(url => (
                    <code key={url} className="block text-xs text-white/30 font-mono">{url}</code>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Current content indicator */}
      {content && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mt-4 p-3 bg-green-500/10 border border-green-500/20 rounded-xl flex items-center gap-3"
        >
          <CheckCircle2 className="w-5 h-5 text-green-400 shrink-0" />
          <div>
            <p className="text-green-300 text-sm font-medium">Content loaded — {content.length} characters</p>
            <p className="text-white/40 text-xs">All study tools are now available. Switch to Summary, Flashcards, Quiz, etc.</p>
          </div>
        </motion.div>
      )}
    </div>
  );
}
