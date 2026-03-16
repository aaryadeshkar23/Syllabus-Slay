import { useStudyStore } from "@/store/use-study-store";
import { useGenerateMindMap } from "@workspace/api-client-react";
import type { MindMapNode } from "@workspace/api-client-react";
import { motion } from "framer-motion";
import { Network, Loader2, Workflow } from "lucide-react";

const MindMapTreeNode = ({ node, level = 0 }: { node: MindMapNode; level?: number }) => {
  const colors = [
    "from-primary to-indigo-600",
    "from-secondary to-cyan-600",
    "from-accent to-pink-600",
    "from-orange-500 to-amber-500"
  ];
  const colorClass = colors[level % colors.length];

  return (
    <div className="flex flex-col items-center">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className={`px-6 py-3 rounded-xl bg-gradient-to-r ${colorClass} text-white font-semibold text-sm shadow-lg max-w-[200px] text-center z-10 relative`}
      >
        {node.label}
      </motion.div>

      {node.children && node.children.length > 0 && (
        <div className="flex flex-col items-center relative mt-4">
          {/* Vertical line from parent to horizontal line */}
          <div className="w-px h-6 bg-white/20 absolute -top-4" />
          
          {/* Horizontal line spanning children */}
          {node.children.length > 1 && (
            <div className="h-px bg-white/20 absolute top-2" style={{
              width: `calc(100% - ${100 / node.children.length}%)`
            }} />
          )}

          <div className="flex gap-4 sm:gap-8 pt-2">
            {node.children.map((child, idx) => (
              <div key={child.id || idx} className="relative flex flex-col items-center pt-4">
                {/* Vertical line to child */}
                <div className="w-px h-4 bg-white/20 absolute top-0" />
                <MindMapTreeNode node={child} level={level + 1} />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export function MindMapTab() {
  const { content } = useStudyStore();
  const { mutate: generate, isPending, data } = useGenerateMindMap();

  if (!content) {
    return (
      <div className="flex flex-col items-center justify-center h-96 text-center">
        <Network className="w-16 h-16 text-white/20 mb-4" />
        <h3 className="text-xl font-display text-white/60">No content provided yet.</h3>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center glass-card p-4 rounded-2xl">
        <h2 className="text-2xl font-display font-bold text-white flex items-center gap-2">
          <Workflow className="w-6 h-6 text-secondary" />
          Knowledge Map
        </h2>
        <button
          onClick={() => generate({ data: { content } })}
          disabled={isPending}
          className="px-6 py-2 bg-secondary text-white font-bold rounded-xl hover:bg-secondary/90 transition-colors disabled:opacity-50 flex items-center gap-2"
        >
          {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : "Generate Map"}
        </button>
      </div>

      <div className="glass-card p-8 rounded-3xl min-h-[500px] overflow-auto custom-scrollbar flex items-center justify-center bg-black/40 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-white/5 to-transparent">
        {isPending ? (
          <div className="flex flex-col items-center text-secondary">
            <Loader2 className="w-12 h-12 animate-spin mb-4" />
            <p className="font-display animate-pulse">Mapping synaptic connections...</p>
          </div>
        ) : data ? (
          <div className="min-w-max p-10">
            <h3 className="text-center text-3xl font-display font-bold text-white/30 mb-12 uppercase tracking-widest">{data.title}</h3>
            <MindMapTreeNode node={data.root} />
          </div>
        ) : (
          <div className="text-center text-white/40">
            <Network className="w-16 h-16 mx-auto mb-4 opacity-50" />
            <p>Click generate to visualize the structure of your notes.</p>
          </div>
        )}
      </div>
    </div>
  );
}
