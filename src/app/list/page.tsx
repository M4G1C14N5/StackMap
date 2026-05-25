import React from 'react';
import FloatingSidebar from '../../components/FloatingSidebar';
import AnimatedStackList from '../../components/AnimatedStackList';
import { db } from '../../database/db';

const LOGO_MAP: { [key: string]: string } = {
  'thomas-portfolio': '/assets/portfolio.svg',
  'coolify': '/assets/coolify.svg',
  'mission-control': '/assets/openclaw-logo.svg',
  'postgres': '/assets/Postgresql_elephant.svg.png',
  'redis': '/assets/redis.svg',
  'traefik': '/assets/traefik-proxy.svg',
  'internet': '/assets/internet-54.svg',
  'cloudflare': '/assets/cloudflare.svg',
  'immich': '/assets/immich.svg',
  'n8n': '/assets/n8n-icon.svg',
  'ollama': '/assets/ollama-dark.svg',
  'planka': '/assets/planka.svg',
  'portainer': '/assets/portainer-dark.svg',
  'nextcloud': '/assets/Nextcloud_Logo.svg.png',
  'default': '/assets/ai-agent.svg'
};

function getLogo(label: string): string {
  const normalized = label.toLowerCase();
  if (normalized.includes('thomas-portfolio')) return LOGO_MAP['thomas-portfolio'];
  if (normalized.includes('coolify')) return LOGO_MAP['coolify'];
  if (normalized.includes('mission-control')) return LOGO_MAP['mission-control'];
  if (normalized.includes('traefik')) return LOGO_MAP['traefik'];
  if (normalized.includes('internet')) return LOGO_MAP['internet'];
  if (normalized.includes('cloudflare')) return LOGO_MAP['cloudflare'];
  if (normalized.includes('immich')) return LOGO_MAP['immich'];
  if (normalized.includes('n8n')) return LOGO_MAP['n8n'];
  if (normalized.includes('ollama')) return LOGO_MAP['ollama'];
  if (normalized.includes('planka')) return LOGO_MAP['planka'];
  if (normalized.includes('portainer')) return LOGO_MAP['portainer'];
  if (normalized.includes('redis')) return LOGO_MAP['redis'];
  if (normalized.includes('pluto')) return '/assets/pluto.png';
  if (normalized.includes('epsilon')) return '/assets/epsilon.png';
  if (normalized.includes('hercules')) return '/assets/hercules.png';
  if (normalized.includes('vs code')) return '/assets/Visual_Studio_Code_1.35_icon.svg.png';
  if (normalized.includes('wsl')) return '/assets/Logo_WSL.svg';
  if (normalized.includes('discord')) return '/assets/discord-svgrepo-com.svg';
  return LOGO_MAP['default'];
}

async function getNodes(query: string = '') {
  const rows = await db.query(
    `SELECT id, label, status, subflow_id 
     FROM nodes 
     WHERE label ILIKE $1 OR subflow_id ILIKE $1`,
    [`%${query}%`]
  );

  return rows.rows.map((row: any) => ({
    id: row.id,
    data: {
      label: row.label,
      status: row.status,
      logo: getLogo(row.label),
      subflowId: row.subflow_id
    }
  }));
}

export default async function ListPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const params = await searchParams;
  const query = typeof params.q === 'string' ? params.q : '';
  const nodes = await getNodes(query);

  return (
    <main className="min-h-screen bg-slate-950 p-6 ml-80">
      <FloatingSidebar />
      <header className="mb-10">
        <h2 className="text-3xl font-bold text-white mb-2">Infrastructure Glossary</h2>
        <p className="text-slate-400">Inventory overview of all managed subflows and services.</p>
      </header>
      <AnimatedStackList nodes={nodes} />
    </main>
  );
}
