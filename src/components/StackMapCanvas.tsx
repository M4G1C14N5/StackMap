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

import SubflowGroup from './SubflowGroup';

const nodeTypes = {
  homelabNode: StackMapNode,
  group: SubflowGroup,
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
        // Group nodes and inject subflow groups
        const nodes = data.nodes;
        const subflowNodes = nodes.filter(n => n.data.subflow && n.data.subflow !== 'Global Canvas');
        const subflowIds = [...new Set(subflowNodes.map(n => n.data.subflowId))]; // Assuming API returns subflowId
        
        const groupNodes = subflowIds
          .map((sfId, index) => {
            const nodeInSubflow = subflowNodes.find(n => n.data.subflowId === sfId);
            const parent = nodeInSubflow ? nodeInSubflow.data.parentSubflow : null;

            return {
              id: `group-${sfId}`,
              type: 'group',
              data: { label: sfId },
              // Offset groups by 600px vertically to prevent overlap
              position: { x: 50, y: 50 + (index * 600) },
              style: { width: 750, height: 500 },
              parentId: parent ? `group-${parent}` : undefined,
            };
          });

        const updatedNodes = subflowNodes.map((node, index) => {
          const row = Math.floor(index / 6);
          const col = index % 6;
          return {
            ...node,
            position: { x: 200 + (col * 100), y: 100 + (row * 100) },
            parentId: `group-${node.data.subflowId}`,
            extent: 'parent',
          };
        });

        // Add back global nodes (not in subflows)
        const globalNodes = nodes.filter(n => !n.data.subflow || n.data.subflow === 'Global Canvas').map((node, index) => {
          if (node.id === '32a8902669fd') {
            return { ...node, position: { x: -400, y: 750 } };
          }
          if (node.id === 'c76b76a07b7a') {
            return { ...node, position: { x: -400, y: 150 } };
          }
          if (node.id === 'cloudflare-dns') {
            return { ...node, position: { x: -600, y: 450 } };
          }
          if (node.id === 'internet-node') {
            return { ...node, position: { x: -800, y: 450 } };
          }
          return node;
        });

        setNodes([...groupNodes, ...updatedNodes, ...globalNodes]);
        setEdges(data.edges);
        setTimeout(() => fitView({ duration: 500 }), 500);
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
