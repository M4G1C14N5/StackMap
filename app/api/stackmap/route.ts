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
             compose_project_name, proxy_domain_rule
      FROM nodes;
    `;
    
    const edgesQuery = `
      SELECT id, source_node as source, target_node as target, 
             edge_type as label
      FROM edges;
    `;

    const nodesResult = await client.query(nodesQuery);
    const edgesResult = await client.query(edgesQuery);
    client.release();

    const nodes = nodesResult.rows.map(n => ({
      id: n.id,
      type: 'homelabNode',
      position: { x: 0, y: 0 }, // Engine-managed layout or dynamic calc
      data: { 
        label: n.label, 
        image: n.image, 
        status: n.status,
        coolifyManaged: !!n.coolify_service_hash 
      }
    }));

    return NextResponse.json({ nodes, edges: edgesResult.rows });
  } catch (error) {
    console.error('SQL API Error:', error);
    return NextResponse.json({ nodes: [], edges: [] }, { status: 500 });
  }
}
