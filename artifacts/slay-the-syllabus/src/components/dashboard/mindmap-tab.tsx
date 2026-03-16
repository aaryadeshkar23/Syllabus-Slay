import { useStudyStore } from "@/store/use-study-store";
import { useGenerateMindMap } from "@workspace/api-client-react";
import { motion } from "framer-motion";
import { Network, Loader2, Workflow } from "lucide-react";

interface MindMapNodeData {
  id: string;
  label: string;
  children: MindMapNodeData[];
}

const LEVEL_COLORS = [
  { bg: "bg-violet-600", border: "border-violet-400", text: "text-white", glow: "shadow-[0_0_12px_rgba(139,92,246,0.6)]" },
  { bg: "bg-blue-600", border: "border-blue-400", text: "text-white", glow: "shadow-[0_0_10px_rgba(59,130,246,0.5)]" },
  { bg: "bg-cyan-700", border: "border-cyan-500", text: "text-white", glow: "shadow-[0_0_8px_rgba(6,182,212,0.4)]" },
  { bg: "bg-fuchsia-700", border: "border-fuchsia-500", text: "text-white", glow: "" },
];

function MindNode({ node, level = 0 }: { node: MindMapNodeData; level?: number }) {
  const colorSet = LEVEL_COLORS[Math.min(level, LEVEL_COLORS.length - 1)];

  if (!node.children || node.children.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: level * 0.05 }}
        className={`px-3 py-2 rounded-lg border text-xs font-medium text-center max-w-[140px] ${colorSet.bg} ${colorSet.border} ${colorSet.text} ${colorSet.glow}`}
      >
        {node.label}
      </motion.div>
    );
  }

  return (
    <div className="flex flex-col items-center">
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: level * 0.05 }}
        className={`px-4 py-2.5 rounded-xl border-2 font-semibold text-center z-10 relative ${
          level === 0 ? "text-base max-w-[200px]" : "text-sm max-w-[160px]"
        } ${colorSet.bg} ${colorSet.border} ${colorSet.text} ${colorSet.glow}`}
      >
        {node.label}
      </motion.div>

      {/* Connector lines + children */}
      <div className="flex flex-col items-center mt-1">
        {/* Vertical line from parent down */}
        <div className="w-0.5 h-5 bg-white/25" />
        
        {/* Horizontal bar spanning children */}
        <div className="relative flex items-start">
          {node.children.length > 1 && (
            <div
              className="absolute top-0 left-0 right-0 h-0.5 bg-white/25"
              style={{ margin: "0 auto" }}
            />
          )}
          <div className="flex gap-4 md:gap-6 lg:gap-8 relative">
            {node.children.map((child, idx) => (
              <div key={child.id ?? idx} className="flex flex-col items-center">
                {/* Vertical stub down to child */}
                <div className="w-0.5 h-5 bg-white/25" />
                <MindNode node={child} level={level + 1} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export function MindMapTab() {
  const { content } = useStudyStore();
  const { mutate: generate, isPending, data } = useGenerateMindMap();

  if (!content) {
    return (
      <div className="flex flex-col items-center justify-center h-96 text-center">
        <Network className="w-16 h-16 text-white/20 mb-4" />
        <h3 className="text-xl font-display text-white/60">No content provided yet.</h3>
        <p className="text-white/40 mt-2">Go to Knowledge Base tab to add content first.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center glass-card p-4 rounded-2xl">
        <h2 className="text-2xl font-display font-bold text-white flex items-center gap-2">
          <Workflow className="w-6 h-6 text-secondary" />
          Knowledge Mind Map
        </h2>
        <button
          onClick={() => generate({ data: { content } })}
          disabled={isPending}
          className="px-6 py-2.5 bg-gradient-to-r from-secondary to-primary text-white font-bold rounded-xl hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center gap-2 shadow-[0_0_15px_rgba(99,102,241,0.4)]"
        >
          {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Network className="w-4 h-4" />}
          {data ? "Regenerate" : "Generate Map"}
        </button>
      </div>

      <div className="glass-card rounded-3xl overflow-auto custom-scrollbar bg-[radial-gradient(ellipse_at_center,rgba(99,102,241,0.06)_0%,transparent_70%)] border border-white/5 min-h-[500px] p-8 md:p-12">
        {isPending ? (
          <div className="flex flex-col items-center justify-center min-h-[400px] text-secondary">
            <Loader2 className="w-12 h-12 animate-spin mb-4" />
            <p className="font-display animate-pulse text-lg">Mapping synaptic connections...</p>
          </div>
        ) : data?.root ? (
          <div className="min-w-max mx-auto pb-4">
            {data.title && (
              <p className="text-center text-white/30 text-sm font-mono uppercase tracking-widest mb-8">
                {data.title}
              </p>
            )}
            <MindNode node={data.root} level={0} />
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center min-h-[400px] text-center text-white/40">
            <Network className="w-20 h-20 mb-4 opacity-30" />
            <p className="text-lg font-display">Click "Generate Map" to visualize your content</p>
            <p className="text-sm mt-2 max-w-sm">The AI will extract topics and create a visual knowledge map</p>
          </div>
        )}
      </div>

      {/* Legend */}
      {data?.root && (
        <div className="flex flex-wrap gap-3 px-2">
          {[
            { label: "Main Topic", color: "bg-violet-600 border-violet-400" },
            { label: "Major Branch", color: "bg-blue-600 border-blue-400" },
            { label: "Sub-topic", color: "bg-cyan-700 border-cyan-500" },
          ].map(({ label, color }) => (
            <div key={label} className="flex items-center gap-2">
              <div className={`w-4 h-4 rounded border-2 ${color}`} />
              <span className="text-xs text-white/50">{label}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
