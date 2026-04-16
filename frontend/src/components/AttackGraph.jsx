import React, { useMemo, useRef, useEffect, useState } from 'react';
import ForceGraph2D from 'react-force-graph-2d';
import { Network } from 'lucide-react';

const AttackGraph = ({ alerts }) => {
  const containerRef = useRef(null);
  const [dims, setDims] = useState({ width: 600, height: 400 });

  // Measure container and update on resize
  useEffect(() => {
    if (!containerRef.current) return;

    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width, height } = entry.contentRect;
        if (width > 0 && height > 0) {
          setDims({ width, height });
        }
      }
    });

    observer.observe(containerRef.current);
    const { clientWidth, clientHeight } = containerRef.current;
    if (clientWidth > 0 && clientHeight > 0) {
      setDims({ width: clientWidth, height: clientHeight });
    }

    return () => observer.disconnect();
  }, []);

  const [timelineProgress, setTimelineProgress] = useState(100);

  const data = useMemo(() => {
    const nodes = [];
    const links = [];
    
    if (!alerts || alerts.length === 0) return { nodes, links };

    // Sort alerts chronologically (oldest first) so we can playback
    const sortedAlerts = [...alerts].sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
    
    // Calculate how many alerts to show based on slider progress (0-100%)
    const visibleCount = Math.max(1, Math.floor((timelineProgress / 100) * sortedAlerts.length));
    const timelineAlerts = sortedAlerts.slice(0, visibleCount);

    const ipMap = new Map();
    const ipTechs = new Map();
    const techMap = new Map();

    const mapTCode = {
      "T1110": "Brute Force",
      "T1190": "Exploit Public-Facing App",
      "T1059": "Command Execution",
      "T1078": "Valid Account"
    };

    const getSevColor = (sev) => {
      if (sev >= 12) return '#ef4444'; // Red (High)
      if (sev >= 7) return '#f59e0b';  // Orange (Medium)
      return '#10b981'; // Green (Low)
    };

    timelineAlerts.forEach((alert) => {
      const ip = alert.source_ip;
      if (!ip) return;
      
      const sev = alert.severity || 1;

      if (!ipMap.has(ip)) {
        ipMap.set(ip, sev);
        ipTechs.set(ip, []);
      } else if (sev > ipMap.get(ip)) {
        ipMap.set(ip, sev);
      }

      const techs = ipTechs.get(ip);
      (alert.mitre_techniques || []).forEach(t => {
        if (!techs.includes(t)) techs.push(t);
        if (!techMap.has(t) || sev > techMap.get(t)) {
            techMap.set(t, sev);
        }
      });
    });

    ipMap.forEach((maxSev, ip) => {
      const ipNodeId = `IP: ${ip}`;
      nodes.push({ id: ipNodeId, group: 'ip', val: 12, color: getSevColor(maxSev) });

      const techs = ipTechs.get(ip);
      let prevNode = ipNodeId;

      techs.forEach(t => {
         const tDesc = mapTCode[t] || "Unknown Technique";
         const techId = `${t}: ${tDesc}`;
         
         if (!nodes.find(n => n.id === techId)) {
            nodes.push({ 
                id: techId, 
                group: 'tech', 
                val: 16, 
                color: getSevColor(techMap.get(t)) 
            });
         }
         
         if (!links.find(l => l.source === prevNode && l.target === techId)) {
             links.push({ source: prevNode, target: techId });
         }
         
         prevNode = techId;
      });
    });

    return { nodes, links };
  }, [alerts, timelineProgress]);

  const fgRef = useRef();

  // Fine-tune forces when graph mounts or data changes
  useEffect(() => {
    if (!fgRef.current) return;
    
    // Increase repulsion between nodes
    fgRef.current.d3Force('charge').strength(-400);
    // Increase the distance of links to spread things out
    fgRef.current.d3Force('link').distance(100);
    // Force the engine to re-run with new parameters
    fgRef.current.d3ReheatSimulation();
  }, [data]);

  return (
    <div
      className="card graph-card"
      style={{ flex: 1, position: 'relative', overflow: 'hidden', minHeight: 600 }}
    >
      <div className="graph-label">
        <Network size={18} color="var(--primary)" />
        <h2 className="section-title">Attack Vector Graph</h2>
      </div>

      <div
        ref={containerRef}
        style={{ position: 'absolute', inset: 0, bottom: '50px' }}
      >
        <ForceGraph2D
          ref={fgRef}
          graphData={data}
          backgroundColor="transparent"
          width={dims.width}
          height={dims.height - 50}
          linkColor={() => 'rgba(255,255,255,0.15)'}
          linkWidth={1.5}
          linkDirectionalArrowLength={4}
          linkDirectionalArrowRelPos={1}
          cooldownTicks={150}
          d3AlphaDecay={0.01}
          nodeCanvasObject={(node, ctx, globalScale) => {
            const radius = node.val ? Math.sqrt(node.val) * 1.5 : 5;
            
            ctx.beginPath();
            ctx.arc(node.x, node.y, radius, 0, 2 * Math.PI, false);
            ctx.fillStyle = node.color || '#6366f1';
            ctx.fill();

            // Label Formatting
            const fontSize = Math.max(10, 14 / globalScale); // Slightly larger font
            ctx.font = `600 ${fontSize}px Inter, sans-serif`;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'top';
            
            // Draw a subtle background behind the text to enhance readability
            const label = node.id;
            const textWidth = ctx.measureText(label).width;
            ctx.fillStyle = 'rgba(10, 10, 12, 0.85)';
            ctx.fillRect(node.x - textWidth / 2 - 4, node.y + radius + 1, textWidth + 8, fontSize + 4);

            ctx.fillStyle = node.color || 'rgba(226, 232, 240, 0.9)';
            ctx.fillText(label, node.x, node.y + radius + 3);
          }}
        />
      </div>

      <div style={{
        position: 'absolute',
        bottom: 0, left: 0, right: 0,
        height: '50px',
        background: 'rgba(0,0,0,0.3)',
        borderTop: '1px solid var(--border)',
        display: 'flex',
        alignItems: 'center',
        padding: '0 20px',
        gap: '16px'
      }}>
        <div style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>
          Attack Rewind
        </div>
        <input 
          type="range" 
          className="slider"
          min="1" 
          max="100" 
          value={timelineProgress}
          onChange={(e) => setTimelineProgress(Number(e.target.value))}
          style={{ flex: 1 }}
        />
        <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--primary)', width: '40px', textAlign: 'right' }}>
          {timelineProgress}%
        </div>
      </div>
    </div>
  );
};

export default AttackGraph;
