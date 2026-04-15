import React, { useMemo } from 'react';
import ForceGraph2D from 'react-force-graph-2d';
import { Network } from 'lucide-react';

const AttackGraph = ({ alerts }) => {
  const data = useMemo(() => {
    const nodes = [
      { id: 'External Network', group: 1, val: 20 },
      { id: 'Internal Core', group: 2, val: 25 },
    ];
    const links = [];

    // Map IP connections from alerts
    const ips = new Set();
    alerts.slice(0, 10).forEach(alert => {
      if (!ips.has(alert.source_ip)) {
        nodes.push({ id: alert.source_ip, group: 3, val: 12 });
        ips.add(alert.source_ip);
      }
      links.push({ source: alert.source_ip, target: 'Internal Core' });
    });

    return { nodes, links };
  }, [alerts]);

  return (
    <div className="card" style={{ flex: 1, position: 'relative', overflow: 'hidden' }}>
      <div style={{ position: 'absolute', top: '15px', left: '15px', zIndex: 10, display: 'flex', alignItems: 'center', gap: '8px' }}>
        <Network size={20} color="var(--primary)" />
        <h2 style={{ margin: 0, fontSize: '1.2rem' }}>Attack Vector Graph</h2>
      </div>
      
      <ForceGraph2D
        graphData={data}
        nodeAutoColorBy="group"
        nodeLabel="id"
        backgroundColor="transparent"
        linkColor={() => 'rgba(255,255,255,0.1)'}
        nodeCanvasObject={(node, ctx, globalScale) => {
          const label = node.id;
          const fontSize = 12 / globalScale;
          ctx.font = `${fontSize}px Sans-Serif`;
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillStyle = node.color;
          ctx.beginPath(); 
          ctx.arc(node.x, node.y, 5, 0, 2 * Math.PI, false); 
          ctx.fill();
          ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
          ctx.fillText(label, node.x, node.y + 10);
        }}
        width={800}
        height={500}
      />
    </div>
  );
};

export default AttackGraph;
