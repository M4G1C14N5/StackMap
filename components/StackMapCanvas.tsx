"use client";
import React, { useCallback, useEffect } from 'react';
import {
  ReactFlow,
  useNodesState,
  useEdgesState,
  addEdge,
  Background,
  Controls,
  Connection,
  Edge,
  Node,
  useReactFlow,
  ReactFlowProvider,
} from '@xyflow/react';
import StackMapNode from './StackMapNode';

const nodeTypes = {
  homelabNode: StackMapNode,
};

const initialNodes: Node[] = [];
const initialEdges: Edge[] = [];

function StackMapContent() {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const { fitView } = useReactFlow();

  const onConnect = useCallback(
    (params: Connection) => setEdges((eds) => addEdge(params, eds)),
    [setEdges],
  );

  useEffect(() => {
    fetch('/api/stackmap')
      .then((res) => res.json())
      .then((data: { nodes: any[]; edges: any[] }) => {
        setNodes(data.nodes);
        setEdges(data.edges);
        // Delay fitView slightly to allow render
        setTimeout(fitView, 100);
      })
      .catch((err) => console.error('Failed to fetch stackmap:', err));
  }, [setNodes, setEdges, fitView]);

  return (
    <ReactFlow
      nodes={nodes}
      edges={edges}
      nodeTypes={nodeTypes}
      onNodesChange={onNodesChange}
      onEdgesChange={onEdgesChange}
      onConnect={onConnect}
      fitView
    >
      <Background />
      <Controls />
    </ReactFlow>
  );
}

export default function StackMapCanvas() {
  return (
    <div style={{ width: '100vw', height: '100vh' }}>
      <ReactFlowProvider>
        <StackMapContent />
      </ReactFlowProvider>
    </div>
  );
}
