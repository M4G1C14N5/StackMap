"use client";

import React from 'react';
import { motion } from 'framer-motion';

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
};

const item = {
  hidden: { opacity: 0, y: 10 },
  show: { opacity: 1, y: 0 }
};

export default function AnimatedStackList({ nodes }: { nodes: any[] }) {
  return (
    <motion.div 
      variants={container}
      initial="hidden"
      animate="show"
      className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
    >
      {nodes.map((node) => (
        <motion.div
          key={node.id}
          variants={item}
          className="bg-slate-900/50 border border-slate-700/50 p-5 rounded-xl hover:border-blue-500/50 transition-colors flex items-center gap-4"
        >
          <img src={node.data.logo} alt={node.data.label} className="w-10 h-10 object-contain" />
          <div className="flex-1">
            <h3 className="text-white font-medium text-sm">{node.data.label}</h3>
            <p className="text-xs text-slate-400 font-mono">{node.data.subflowId || 'Global'}</p>
          </div>
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full animate-pulse ${node.data.status === 'online' ? 'bg-emerald-500' : 'bg-red-500'}`} />
            <span className="text-xs text-slate-300 capitalize">{node.data.status}</span>
          </div>
        </motion.div>
      ))}
    </motion.div>
  );
}
