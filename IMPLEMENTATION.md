# StackMap Implementation Details

## Multi-Server Asset Collection
The `generateHomelabGraph` function now accepts an array of `dockerInstances`, each mapped to a specific host (`claw-server` or `camued-server`). By iterating through these instances, the aggregator builds a unified node map while prefixing node IDs with the server hostname. This ensures unique React Flow node identifiers despite identical container names across different physical hosts.

## Network Edge Construction
The edge generation logic now classifies network traffic:
- **ZeroTier/VPN Detection**: The logic evaluates the network name property. If it identifies 'zerotier' or 'mesh', it applies distinct visual styling:
  - `stroke: '#8b5cf6'` (Purple tint)
  - `strokeDasharray: '5,5'` (Dashed line)
- **Standard Traffic**: Public or internal standard traffic utilizes a neutral grey solid line (`#475569`).

## 4-Tier Grid Logic
The architecture utilizes a `yTracking` accumulator object. As the parser classifies a container into a tier (ingress, application, private, or backend), it selects the predefined X-coordinate and increments the Y-coordinate by 150px, ensuring a clean vertical flow without node overlap within columns.
EOF
