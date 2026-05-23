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

function StackMapContent() {
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const { fitView } = useReactFlow();

  const onConnect = useCallback((params: Connection) => setEdges((eds) => addEdge(params, eds)), [setEdges]);

  useEffect(() => {
    fetch('/api/stackmap')
      .then((res) => res.json())
      .then((data: { nodes: any[]; edges: any[] }) => {
        const nodes = data.nodes;
        const subflowNodes = nodes.filter(n => n.data.subflow && n.data.subflow !== 'Global Canvas');
        const subflowIds = [...new Set(subflowNodes.map(n => n.data.subflowId))];
        
        const groupNodes = subflowIds.map((sfId, index) => {
          const nodeInSubflow = subflowNodes.find(n => n.data.subflowId === sfId);
          const label = nodeInSubflow ? nodeInSubflow.data.subflow : sfId;
          const parent = nodeInSubflow ? nodeInSubflow.data.parentSubflow : null;

          let x = 50;
          let y = 50 + (index * 550);
          let width = 750;
          let height = 500;

          if (sfId === 'tom-laptop-subflow') {
            x = 600;
            y = 50;
            width = 400;
          } else if (sfId === 'claw-server-subflow') {
            width = 500;
          }

          return {
            id: `group-${sfId}`,
            type: 'group',
            data: { label: label },
            position: { x, y },
            style: { width, height: height },
            parentId: parent ? `group-${parent}` : undefined,
          };
        });

        const updatedNodes = subflowNodes.map((node) => {
          if (node.data.subflowId === 'claw-server-subflow') {
            const isAgent = node.id.includes('node') && (node.data.label === 'Pluto' || node.data.label === 'Epsilon' || node.data.label === 'Hercules');
            const isMC = node.data.label.includes('mission-control');
            const mcNodes = subflowNodes.filter(n => n.data.subflowId === 'claw-server-subflow' && n.data.label.includes('mission-control'));
            const agentNodes = subflowNodes.filter(n => n.data.subflowId === 'claw-server-subflow' && (n.data.label === 'Pluto' || n.data.label === 'Epsilon' || n.data.label === 'Hercules'));
            if (isMC) {
              const mcIndex = mcNodes.findIndex(n => n.id === node.id);
              return { ...node, position: { x: 100, y: 100 + (mcIndex * 100) }, parentId: `group-${node.data.subflowId}`, extent: 'parent' };
            }
            if (isAgent) {
              const agentIndex = agentNodes.findIndex(n => n.id === node.id);
              return { ...node, position: { x: 300, y: 100 + (agentIndex * 100) }, parentId: `group-${node.data.subflowId}`, extent: 'parent' };
            }
          }
          if (node.data.subflowId === 'tom-laptop-subflow') {
            const laptopNodes = subflowNodes.filter(n => n.data.subflowId === 'tom-laptop-subflow');
            const laptopIndex = laptopNodes.findIndex(n => n.id === node.id);
            return { ...node, position: { x: 150, y: 100 + (laptopIndex * 100) }, parentId: `group-${node.data.subflowId}`, extent: 'parent' };
          }
          // Default logic for camued-server nodes (4x3 grid)
          const camuedNodes = subflowNodes.filter(n => n.data.subflowId === 'camued-server');
          const camuedIndex = camuedNodes.findIndex(n => n.id === node.id);
          const row = Math.floor(camuedIndex / 4);
          const col = camuedIndex % 4;
          return {
            ...node,
            position: { x: 50 + (2 * 110) + (col * 110), y: 50 + (row * 110) },
            parentId: `group-${node.data.subflowId}`,
            extent: 'parent',
          };
        });

        const globalNodes = nodes.filter(n => !n.data.subflow || n.data.subflow === 'Global Canvas').map((node) => {
          if (node.id === '32a8902669fd') return { ...node, position: { x: -500, y: 750 } };
          if (node.id === 'c76b76a07b7a') return { ...node, position: { x: -500, y: 150 } };
          if (node.id === 'cloudflare-dns') return { ...node, position: { x: -700, y: 450 } };
          if (node.id === 'internet-node') return { ...node, position: { x: -900, y: 450 } };
          return node;
        });

        setNodes([...groupNodes, ...updatedNodes, ...globalNodes]);
        setEdges(data.edges);
        setTimeout(() => fitView({ duration: 500 }), 500);
      });
  }, [setNodes, setEdges, fitView]);

  return <ReactFlow nodes={nodes} edges={edges} nodeTypes={nodeTypes} onNodesChange={onNodesChange} onEdgesChange={onEdgesChange} onConnect={onConnect} fitView><Background /><Controls /></ReactFlow>;
}

export default function StackMapCanvas() {
  return <div style={{ width: '100vw', height: '100vh' }}><ReactFlowProvider><StackMapContent /></ReactFlowProvider></div>;
}
