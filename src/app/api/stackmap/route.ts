 import { NextResponse } from 'next/server';
  import { Pool } from 'pg';

  const pool = new Pool({ connectionString: process.env.DATABASE_URL });

  export async function GET() {
    try {
      const client = await pool.connect();

      // Fetch nodes and format for React Flow
      const nodesQuery = `
        SELECT id, label, image, status,
               container_network_ip, coolify_service_hash,
               compose_project_name, proxy_domain_rule, subflow_id
        FROM nodes
        WHERE is_visible = true;
      `;

      const edgesQuery = `
        SELECT id, source_node as source, target_node as target,
               NULL as label
        FROM edges;
      `;

      const nodesResult = await client.query(nodesQuery);
      const subflowsResult = await client.query('SELECT id, label, server_id, parent_subflow_id FROM subflows');
      const edgesResult = await client.query(edgesQuery);
      client.release();

      const subflows = subflowsResult.rows.reduce((acc, sf) => {
        acc[sf.id] = { label: sf.label, parent: sf.parent_subflow_id };
        return acc;
      }, {});

  const LOGO_MAP = {
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

  function getLogo(label) {
    const normalized = label.toLowerCase();
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
    if (normalized.includes('nextcloud')) return LOGO_MAP['nextcloud'];
    if (normalized.includes('postgres') || normalized.includes('db')) return LOGO_MAP['postgres'];
    return LOGO_MAP['default'];
  }

      const nodes = [
        ...nodesResult.rows.map((n, index) => {
          const row = Math.floor(index / 5);
          const col = index % 5;

          // Calculate a centered starting point
          const totalNodes = nodesResult.rows.length;
          const cols = Math.min(totalNodes, 5);
          const rows = Math.ceil(totalNodes / 5);
          const startX = (cols * 150) / 2;
          const startY = (rows * 150) / 2;

          return {
            id: n.id,
            type: 'homelabNode',
            position: { x: -startX + (col * 150), y: -startY + (row * 150) },
            data: {
              label: n.label,
              logo: getLogo(n.label),
              status: n.status,
              subflowId: n.subflow_id,
              subflow: n.subflow_id ? subflows[n.subflow_id].label : 'Global Canvas',
              parentSubflow: n.subflow_id ? subflows[n.subflow_id].parent : null,
              server: n.subflow_id ? n.subflow_id.split('-').slice(0, 2).join('-') : 'Global',
              visibility: 'public',
              coolifyManaged: !!n.coolify_service_hash
            }
          };
        })
      ];

      return NextResponse.json({ nodes, edges: edgesResult.rows });
    } catch (error) {
      console.error('SQL API Error:', error);
      return NextResponse.json({ nodes: [], edges: [] }, { status: 500 });
    }
  }