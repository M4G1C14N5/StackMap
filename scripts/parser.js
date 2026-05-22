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

    for (const container of containers) {
      const id = container.Id.substring(0, 12);
      const name = container.Names[0].replace('/', '');
      const labels = container.Labels || {};
      
      // Upsert Node logic
      await pgClient.query(`
        INSERT INTO nodes (
          id, label, image, status, coolify_service_hash, compose_project_name, proxy_domain_rule
        ) VALUES ($1, $2, $3, $4, $5, $6, $7)
        ON CONFLICT (id) DO UPDATE SET
          status = EXCLUDED.status,
          proxy_domain_rule = EXCLUDED.proxy_domain_rule;
      `, [
        id, 
        name, 
        container.Image, 
        container.State,
        labels['coolify.serviceId'] || null,
        labels['com.docker.compose.project'] || null,
        labels['traefik.http.routers.rule'] || null
      ]);

      // Simple edge logic: shared project name
      if (labels['com.docker.compose.project']) {
          // This is just a conceptual placeholder for edge discovery
          // Hercules will expand this logic as requested.
      }
    }
    
    console.log(`Successfully parsed containers for ${argv.serverId}`);
  } catch (err) {
    console.error('Parsing error:', err);
  } finally {
    await pgClient.end();
  }
}

runParser();
