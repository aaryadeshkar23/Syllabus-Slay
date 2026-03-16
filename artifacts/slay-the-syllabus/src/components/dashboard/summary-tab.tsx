import { useState } from "react";
import { FileText, List, BookOpen, Layers, Languages, Loader2 } from "lucide-react";
import { useStudyStore } from "@/store/use-study-store";
import { useSummarizeContent } from "@workspace/api-client-react";
import type { SummarizeRequestType } from "@workspace/api-client-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import ReactMarkdown from "react-markdown";

const SUMMARY_TYPES: { id: SummarizeRequestType; label: string; icon: any }[] = [
  { id: "short", label: "TL;DR", icon: FileText },
  { id: "bullets", label: "Bullet Points", icon: List },
  { id: "exam_notes", label: "Exam Notes", icon: BookOpen },
  { id: "key_concepts", label: "Key Concepts", icon: Layers },
];

export function SummaryTab() {
  const { content } = useStudyStore();
  const [type, setType] = useState<SummarizeRequestType>("bullets");
  const [language, setLanguage] = useState("en");
  
  const { mutate: generateSummary, isPending, data } = useSummarizeContent();

  const handleGenerate = () => {
    if (!content) return;
    generateSummary({ data: { content, type, language } });
  };

  if (!content) {
    return (
      <div className="flex flex-col items-center justify-center h-96 text-center">
        <FileText className="w-16 h-16 text-white/20 mb-4" />
        <h3 className="text-xl font-display text-white/60">No content provided yet.</h3>
        <p className="text-white/40 mt-2">Go to the Upload tab to add your syllabus first.</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Controls */}
      <div className="glass-card p-4 rounded-2xl flex flex-wrap items-center justify-between gap-4">
        <div className="flex gap-2 bg-black/20 p-1 rounded-xl overflow-x-auto custom-scrollbar">
          {SUMMARY_TYPES.map((t) => (
            <button
              key={t.id}
              onClick={() => setType(t.id)}
              className={cn(
                "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap",
                type === t.id ? "bg-primary text-white" : "text-white/60 hover:text-white hover:bg-white/5"
              )}
            >
              <t.icon className="w-4 h-4" /> {t.label}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-black/20 px-3 py-2 rounded-xl border border-white/5">
            <Languages className="w-4 h-4 text-white/50" />
            <select 
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className="bg-transparent text-sm text-white focus:outline-none"
            >
              <option value="en" className="bg-background">English</option>
              <option value="es" className="bg-background">Spanish</option>
              <option value="fr" className="bg-background">French</option>
              <option value="hi" className="bg-background">Hindi</option>
            </select>
          </div>

          <button
            onClick={handleGenerate}
            disabled={isPending}
            className="px-6 py-2 bg-white text-background font-bold rounded-xl hover:bg-white/90 transition-colors disabled:opacity-50 flex items-center gap-2"
          >
            {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
            Generate
          </button>
        </div>
      </div>

      {/* Result Area */}
      <div className="min-h-[400px]">
        {isPending ? (
          <div className="glass-card p-8 rounded-3xl space-y-6 animate-pulse">
            <div className="h-8 bg-white/10 rounded-lg w-1/3"></div>
            <div className="space-y-3">
              <div className="h-4 bg-white/10 rounded w-full"></div>
              <div className="h-4 bg-white/10 rounded w-5/6"></div>
              <div className="h-4 bg-white/10 rounded w-4/6"></div>
            </div>
            <div className="h-40 bg-white/10 rounded-xl w-full"></div>
          </div>
        ) : data ? (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="grid grid-cols-1 lg:grid-cols-3 gap-6"
          >
            <div className="lg:col-span-2 glass-card p-8 rounded-3xl glow-border">
              <h3 className="text-2xl font-display font-bold text-white mb-6 border-b border-white/10 pb-4">Generated Summary</h3>
              <div className="markdown-body">
                <ReactMarkdown>{data.summary}</ReactMarkdown>
              </div>
            </div>

            <div className="space-y-6">
              <div className="glass-card p-6 rounded-3xl bg-primary/5 border-primary/20">
                <h4 className="font-display font-bold text-primary mb-4 flex items-center gap-2">
                  <Sparkles className="w-5 h-5" /> Key Takeaways
                </h4>
                <ul className="space-y-3">
                  {data.keyPoints.map((point, i) => (
                    <li key={i} className="flex gap-3 text-sm text-white/80">
                      <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center shrink-0 text-primary text-xs font-bold">{i+1}</div>
                      <span className="mt-0.5">{point}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="glass-card p-6 rounded-3xl">
                <h4 className="font-display font-bold text-white mb-4">Core Terms</h4>
                <div className="space-y-4">
                  {data.definitions.map((def, i) => (
                    <div key={i} className="bg-black/20 p-3 rounded-xl border border-white/5">
                      <div className="text-accent font-semibold text-sm mb-1">{def.term}</div>
                      <div className="text-white/60 text-sm">{def.definition}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        ) : (
          <div className="glass-card h-96 rounded-3xl flex flex-col items-center justify-center text-center p-8 border-dashed border-2 border-white/10 bg-transparent">
            <Sparkles className="w-12 h-12 text-primary/40 mb-4" />
            <h3 className="text-xl font-display text-white/60">Ready to compress knowledge?</h3>
            <p className="text-white/40 mt-2 max-w-md">Hit generate above to create an AI-powered summary tailored to your study style.</p>
          </div>
        )}
      </div>
    </div>
  );
}

// Ensure Sparkles is imported
import { Sparkles } from "lucide-react";
