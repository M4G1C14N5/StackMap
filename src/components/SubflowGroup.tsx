import React, { memo } from 'react';
import { Server } from 'lucide-react';

export default memo(({ data, style }: { data: { label: string, serverName?: string, osVersion?: string }, style?: React.CSSProperties }) => {
  const isClawServer = data.label === 'claw-server';
  const isTomLaptop = data.label === 'tom-laptop';
  const isVplan = data.label === 'vplan';

  return (
    <div className={`relative w-full h-full p-4 pt-12 border-2 ${isVplan ? 'border-dashed border-slate-500/30' : 'border-slate-700/50'} rounded-xl ${isVplan ? 'bg-none' : 'bg-slate-950'}`} style={{ ...style, backgroundImage: isVplan ? 'none' : undefined }}>
      {/* Do not render info if vplan */}
      {!isVplan && (
        <>
          {/* Top Left: Logo + Server Info */}
          <div className="absolute top-2 left-2 flex items-center gap-3">
            <img 
              src={isTomLaptop ? "/assets/Windows_logo_-_2012.svg.png" : "/assets/ubuntu.svg"} 
              alt={isTomLaptop ? "Windows" : "Ubuntu"} 
              className="w-8 h-8 object-contain" 
            />
            <div className="flex flex-col">
              <span className="text-[15px] text-slate-100 font-bold tracking-tight">
                {isClawServer ? 'claw-server' : isTomLaptop ? 'tom-laptop' : 'camued-server'}
              </span>
              <span className="text-[11px] text-slate-400 font-medium">
                {isClawServer ? 'Ubuntu 26.04 LTS' : isTomLaptop ? 'Ubuntu WSL' : 'Ubuntu 24.04.3 LTS'}
              </span>
            </div>
          </div>
          
          {/* Bottom Icons */}
          <div className="absolute bottom-2 left-2">
            <img 
              src={isClawServer ? "/assets/openclaw-logo.svg" : isTomLaptop ? "/assets/Git_icon.svg.png" : "/assets/docker-icon.webp"} 
              alt={isClawServer ? "OpenClaw Logo" : isTomLaptop ? "Git" : "Docker"} 
              className="w-10 h-10 opacity-70" 
            />
          </div>
        </>
      )}
    </div>
  );
});
