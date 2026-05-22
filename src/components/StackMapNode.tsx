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
  logo: string;
  status: 'online' | 'offline';
  visibility: 'public' | 'protected' | 'private';
  server: string;
  subflow: string;
  ports?: number[];
  coolifyManaged?: boolean;
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
    <div className={`w-[90px] h-[90px] rounded-xl border ${style.border} ${style.bg} p-1 shadow-lg backdrop-blur-sm transition-all duration-300 flex flex-col items-center justify-between`}>
      <Handle type="target" position={Position.Left} className="!bg-slate-700" />
      
      {/* Header: Status */}
      <div className="w-full flex justify-end">
        <div className={`relative flex h-2 w-2`}>
          {nodeData.status === 'online' && (
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
          )}
          <span className={`relative inline-flex rounded-full h-2 w-2 ${nodeData.status === 'online' ? 'bg-emerald-500' : 'bg-rose-500'}`}></span>
        </div>
      </div>

      {/* Body: Logo */}
      <div className="flex-1 flex items-center justify-center -mt-2 bg-white/10 rounded-lg overflow-hidden w-[70px] h-[70px]">
        <img src={nodeData.logo} alt={nodeData.label} className="w-[60px] h-[60px] object-contain" />
      </div>

      {/* Footer: Name */}
      <div className="w-full text-center">
        <h3 className="text-[9px] font-semibold text-slate-100 truncate px-1">{nodeData.label}</h3>
      </div>

      <Handle type="source" position={Position.Right} className="!bg-slate-700" />
    </div>
  );
};

export default memo(StackMapNode);
