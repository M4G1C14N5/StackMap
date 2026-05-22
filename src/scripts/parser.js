#!/usr/bin/env node
const Docker = require('dockerode');
const { Client } = require('pg');
const yargs = require('yargs/yargs');
const { hideBin } = require('yargs/helpers');

// Parse CLI arguments: server-id and socket-path
const argv = yargs(hideBin(process.argv))
  .option('server-id', { type: 'string', demandOption: true, description: 'ID of the server node' })
  .option('socket', { type: 'string', demandOption: true, description: 'Path to docker socket' })
  .argv;

const docker = new Docker({ socketPath: argv.socket });
const pgClient = new Client({ connectionString: process.env.DATABASE_URL });

async function runParser() {
  try {
    await pgClient.connect();
    const containers = await docker.listContainers({ all: true });

    // 1. Detect environment (ZeroTier/VPLAN presence)
    // Conceptually, checking if a network interface contains 'zt' or if environment variable is set
    // For now, assume if the server has a zerotier_ip set in the DB, it's in the VPLAN
    const serverResult = await pgClient.query(`
      SELECT zerotier_ip FROM servers WHERE id = $1
    `, [argv.serverId]);
    
    // Fallback: If not explicitly configured, we could check for an environment variable
    const inVPlan = !!(serverResult.rows[0]?.zerotier_ip || process.env.VPLAN_ENABLED === 'true');

    // 2. Upsert Server
    await pgClient.query(`
      INSERT INTO servers (id) VALUES ($1) ON CONFLICT (id) DO UPDATE SET status = 'online';
    `, [argv.serverId]);

    // 3. Setup Subflows
    const globalSubflows = [
      { id: 'global-canvas', label: 'Global Canvas', visibility: 'public' }
    ];
    const serverGroup = { id: argv.serverId, label: `${argv.serverId} Node`, visibility: 'public' };
    const vplanSubflows = [
      { id: `${argv.serverId}-public`, label: 'Public Services', server_id: argv.serverId, visibility: 'public' },
      { id: `${argv.serverId}-private`, label: 'Private Auth-Gated Services', server_id: argv.serverId, visibility: 'private' }
    ];

    const subflows = inVPlan ? [...globalSubflows, serverGroup, ...vplanSubflows] : globalSubflows;

    for (const sf of subflows) {
      await pgClient.query(`
        INSERT INTO subflows (id, label, server_id, visibility) 
        VALUES ($1, $2, $3, $4)
        ON CONFLICT (id) DO UPDATE SET label = EXCLUDED.label;
      `, [sf.id, sf.label, sf.server_id || (sf.id === argv.serverId ? null : (sf.id === 'global-canvas' ? null : argv.serverId)), sf.visibility]);
    }

    // 4. Process Containers
    for (const container of containers) {
      const id = container.Id.substring(0, 12);
      const name = container.Names[0].replace('/', '');
      const labels = container.Labels || {};
      const status = container.State === 'running' ? 'online' : 'offline';
      
      // Define rules here to keep it modular
      const subflowRules = [
        { visibility: 'public', subflowId: `${argv.serverId}-public` },
        { visibility: 'private', subflowId: `${argv.serverId}-private` }
      ];

      // Categorize:
      // If in VPLAN, subflow is determined by rules, else null (Global Canvas)
      let subflowId = null;
      let inVPlanNode = false;

      if (inVPlan) {
        inVPlanNode = true;
        const visibility = labels['stackmap.visibility'] || 'private';
        const rule = subflowRules.find(r => r.visibility === visibility);
        subflowId = rule ? rule.subflowId : `${argv.serverId}-private`;
      }

      // Upsert Node logic
      await pgClient.query(`
        INSERT INTO nodes (
          id, label, image, status, coolify_service_hash, compose_project_name, proxy_domain_rule, subflow_id, in_vplan
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
        ON CONFLICT (id) DO UPDATE SET
          status = EXCLUDED.status,
          proxy_domain_rule = EXCLUDED.proxy_domain_rule,
          subflow_id = EXCLUDED.subflow_id,
          in_vplan = EXCLUDED.in_vplan;
      `, [
        id, 
        name, 
        container.Image, 
        status,
        labels['coolify.serviceId'] || null,
        labels['com.docker.compose.project'] || null,
        labels['traefik.http.routers.rule'] || null,
        subflowId,
        inVPlanNode
      ]);
    }
    
    console.log(`Successfully parsed containers for ${argv.serverId}`);
  } catch (err) {
    console.error('Parsing error:', err);
  } finally {
    await pgClient.end();
  }
}

runParser();
