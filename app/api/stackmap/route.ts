import { NextResponse } from 'next/server';
import { Node, Edge } from '@xyflow/react';
import Docker from 'dockerode';

interface HomelabNodeData extends Record<string, unknown> {
  label: string;
  image: string;
  status: 'online' | 'offline';
  ports: number[];
  coolifyManaged: boolean;
  server: 'claw-server' | 'camued-server';
  visibility: 'public' | 'protected' | 'private';
}

interface StackMapResult {
  nodes: Node<HomelabNodeData>[];
  edges: Edge[];
}

function cleanContainerName(rawName: string): string {
  return rawName.replace(/^\//, '').split('-')[0] || rawName;
}

function calculateInfrastructureTier(container: Docker.ContainerInfo) {
  const name = container.Names[0].toLowerCase();
  const image = container.Image.toLowerCase();
  const labels = container.Labels || {};

  if (name.includes('proxy') || image.includes('traefik') || image.includes('nginx') || name.includes('tunnel')) {
    return { tier: 'ingress', x: 100, visibility: 'public' as const };
  }

  if (image.includes('postgres') || image.includes('redis') || image.includes('mariadb') || image.includes('mongo')) {
    return { tier: 'backend', x: 1300, visibility: 'private' as const };
  }

  if (name.includes('agent') || name.includes('zerotier') || labels['com.docker.compose.project'] === 'private') {
    return { tier: 'private', x: 900, visibility: 'private' as const };
  }

  return { tier: 'application', x: 500, visibility: 'protected' as const };
}

async function generateHomelabGraph(
  dockerInstances: { host: 'claw-server' | 'camued-server'; client: Docker }[]
): Promise<StackMapResult> {
  const nodes: Node<HomelabNodeData>[] = [];
  const edges: Edge[] = [];
  const networkMap: Record<string, string[]> = {};
  const yTracking = { ingress: 100, application: 100, private: 100, backend: 100 };

  for (const { host, client } of dockerInstances) {
    const containers = await client.listContainers({ all: true });

    containers.forEach((container) => {
      const id = `${host}-${container.Id.substring(0, 12)}`;
      const { tier, x, visibility } = calculateInfrastructureTier(container);
      const y = yTracking[tier as keyof typeof yTracking];
      yTracking[tier as keyof typeof yTracking] += 150;

      nodes.push({
        id,
        type: 'homelabNode',
        position: { x, y },
        data: {
          label: cleanContainerName(container.Names[0]),
          image: container.Image,
          status: container.State === 'running' ? 'online' : 'offline',
          ports: container.Ports.map((p) => p.PublicPort).filter(Boolean),
          coolifyManaged: !!container.Labels['coolify.version'],
          server: host,
          visibility,
        },
      });

      if (container.NetworkSettings?.Networks) {
        Object.keys(container.NetworkSettings.Networks).forEach((netName) => {
          if (netName === 'bridge') return;
          if (!networkMap[netName]) networkMap[netName] = [];
          networkMap[netName].push(id);
        });
      }
    });
  }

  Object.entries(networkMap).forEach(([networkName, containerIds]) => {
    const isVPN = networkName.includes('zerotier') || networkName.includes('mesh');
    
    for (let i = 0; i < containerIds.length - 1; i++) {
      edges.push({
        id: `edge-${networkName}-${containerIds[i]}-${containerIds[i+1]}`,
        source: containerIds[i],
        target: containerIds[i+1],
        animated: true,
        label: networkName,
        style: { 
          stroke: isVPN ? '#8b5cf6' : '#475569', 
          strokeWidth: 2,
          strokeDasharray: isVPN ? '5,5' : '0' 
        }
      });
    }
  });

  return { nodes, edges };
}

export async function GET() {
    const nodes = [
        {
            id: 'node-1',
            type: 'homelabNode',
            position: { x: 100, y: 100 },
            data: {
                label: 'Test Container',
                image: 'nginx:latest',
                status: 'online',
                ports: [80, 443],
                coolifyManaged: true,
                server: 'claw-server',
                visibility: 'public'
            }
        }
    ];
    const edges = [];
    return NextResponse.json({ nodes, edges });
}
