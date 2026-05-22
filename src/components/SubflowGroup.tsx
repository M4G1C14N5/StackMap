import React, { memo } from 'react';
import { Server } from 'lucide-react';

// Existing camued-server subflow ...
export default memo(({ data }: { data: { label: string, serverName?: string, osVersion?: string } }) => {
  return (
    <div className="relative w-full h-full p-4 pt-12 border-2 border-slate-700/50 rounded-xl bg-slate-950">
      {/* Top Left: Logo + Server Info */}
      <div className="absolute top-2 left-2 flex items-center gap-3">
        <img src="/assets/ubuntu.svg" alt="Ubuntu" className="w-8 h-8 object-contain" />
        <div className="flex flex-col">
          <span className="text-[15px] text-slate-100 font-bold tracking-tight">camued-server</span>
          <span className="text-[11px] text-slate-400 font-medium">Ubuntu 24.04.3 LTS</span>
        </div>
      </div>
      
      {/* Bottom Left: Docker Logo */}
      <div className="absolute bottom-2 left-2">
        <img src="/assets/docker-icon.webp" alt="Docker" className="w-10 h-10 opacity-70" />
      </div>
    </div>
  );
});

// ClawServerSubflow component
export const ClawServerSubflow = () => (
  <div className="relative w-full h-full p-4 pt-12 border-2 border-slate-700/50 rounded-xl bg-slate-950">
    <div className="absolute top-2 left-2 flex items-center gap-3">
      <img src="/assets/openclaw-logo.svg" alt="OpenClaw" className="w-8 h-8 object-contain" />
      <div className="flex flex-col">
        <span className="text-[15px] text-slate-100 font-bold tracking-tight">claw-server</span>
        <span className="text-[11px] text-slate-400 font-medium">Production</span>
      </div>
    </div>
    <div className="absolute bottom-2 right-2">
      <img src="/assets/openclaw-logo.svg" alt="OpenClaw Logo" className="w-10 h-10 opacity-70" />
    </div>
  </div>
);
