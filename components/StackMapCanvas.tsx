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
} from '@xyflow/react';
// Removed flow style import here, moved to globals.css
import StackMapNode from './StackMapNode';

const nodeTypes = {
  homelabNode: StackMapNode,
};

const initialNodes: Node[] = [];
const initialEdges: Edge[] = [];

export default function StackMapCanvas() {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  const onConnect = useCallback(
    (params: Connection) => setEdges((eds) => addEdge(params, eds)),
    [setEdges],
  );

  useEffect(() => {
    fetch('/api/stackmap')
      .then((res) => res.json())
      .then((data: { nodes: Node[]; edges: Edge[] }) => {
        setNodes(data.nodes);
        setEdges(data.edges);
      })
      .catch((err) => console.error('Failed to fetch stackmap:', err));
  }, [setNodes, setEdges]);

  return (
    <div style={{ width: '100vw', height: '100vh' }}>
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
    </div>
  );
}
