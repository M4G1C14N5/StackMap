import React, { memo } from 'react';
import { Handle, Position, NodeProps } from '@xyflow/react';
import { 
  Globe, 
  Lock, 
  Shield, 
  Server, 
  Activity 
} from 'lucide-react';

export interface HomelabNodeData {
  label: string;
  image: string;
  status: 'online' | 'offline';
  visibility: 'public' | 'protected' | 'private';
  server: 'claw-server' | 'camued-server';
  ports?: number[];
}

const StackMapNode = ({ data }: NodeProps) => {
  const nodeData = data as unknown as HomelabNodeData;

  const getVisibilityStyles = () => {
    switch (nodeData.visibility) {
      case 'public':
        return {
          border: 'border-sky-500/40',
          bg: 'bg-sky-500/5',
          text: 'text-sky-400',
          icon: <Globe size={14} />,
          badge: 'Public'
        };
      case 'protected':
        return {
          border: 'border-amber-500/50',
          bg: 'bg-amber-500/5',
          text: 'text-amber-400',
          icon: <Lock size={14} />,
          badge: 'CF Access Gate'
        };
      case 'private':
        return {
          border: 'border-fuchsia-500/40',
          bg: 'bg-fuchsia-500/5',
          text: 'text-fuchsia-400',
          icon: <Shield size={14} />,
          badge: 'ZeroTier Mesh'
        };
    }
  };

  const style = getVisibilityStyles();

  return (
    <div className={`min-w-[220px] rounded-xl border ${style.border} ${style.bg} p-3 shadow-lg backdrop-blur-sm transition-all duration-300`}>
      <Handle type="target" position={Position.Left} className="!bg-slate-700" />
      
      {/* Header: Host & Status */}
      <div className="flex justify-between items-center mb-2">
        <div className="flex items-center gap-1.5 text-[10px] text-slate-400 font-mono">
          <Server size={10} />
          {nodeData.server}
        </div>
        <div className="flex items-center gap-1.5 text-[10px] text-slate-400">
          <div className={`relative flex h-2 w-2`}>
            {nodeData.status === 'online' && (
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            )}
            <span className={`relative inline-flex rounded-full h-2 w-2 ${nodeData.status === 'online' ? 'bg-emerald-500' : 'bg-rose-500'}`}></span>
          </div>
          {nodeData.status.toUpperCase()}
        </div>
      </div>

      {/* Body: Label & Image */}
      <div className="mb-3">
        <h3 className="text-sm font-semibold text-slate-100 truncate">{nodeData.label}</h3>
        <p className="text-[10px] text-slate-500 truncate mt-0.5">{nodeData.image}</p>
      </div>

      {/* Footer: Visibility Badge */}
      <div className={`flex items-center gap-1.5 text-[10px] ${style.text} font-medium`}>
        {style.icon}
        {style.badge}
      </div>

      <Handle type="source" position={Position.Right} className="!bg-slate-700" />
    </div>
  );
};

export default memo(StackMapNode);
