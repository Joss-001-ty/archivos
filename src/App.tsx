import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'motion/react';
import { Download, ExternalLink, File as FileIcon, Image as ImageIcon, Music, Video, FileText, Archive, FileSpreadsheet } from 'lucide-react';

// ==== CONFIGURATION ====
const OWNER = "Joss-001-ty";
const REPO = "archivos";
const BRANCH = "main";
const CARPETA = "archivos";
// =======================

const API_URL = `https://api.github.com/repos/${OWNER}/${REPO}/contents/${CARPETA}?ref=${BRANCH}`;

const getCdnUrl = (name: string) => `https://cdn.jsdelivr.net/gh/${OWNER}/${REPO}@${BRANCH}/${CARPETA}/${encodeURIComponent(name)}`;

interface GithubFile {
  name: string;
  sha: string;
  type: string;
}

const TIPOS = {
  imagen: ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg', 'bmp', 'ico', 'tiff', 'tif', 'avif', 'heic', 'heif'],
  video: ['mp4', 'webm', 'ogv', 'mov', 'mkv', 'avi', 'm4v', '3gp', 'flv'],
  audio: ['mp3', 'wav', 'ogg', 'oga', 'flac', 'm4a', 'aac', 'wma', 'opus', 'weba'],
  pdf: ['pdf'],
  texto: ['txt', 'md', 'markdown', 'json', 'csv', 'log', 'xml', 'yaml', 'yml', 'ini', 'conf', 'cfg', 'js', 'jsx', 'ts', 'tsx', 'py', 'java', 'c', 'cpp', 'h', 'hpp', 'cs', 'php', 'rb', 'go', 'rs', 'sh', 'bat', 'ps1', 'sql', 'html', 'htm', 'css', 'scss', 'less', 'vue', 'swift', 'kt', 'lua', 'r', 'pl', 'toml', 'env'],
  oficina: ['doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx', 'odt', 'ods', 'odp', 'rtf'],
  archivo: ['zip', 'rar', '7z', 'tar', 'gz', 'bz2', 'xz', 'iso']
};

const getFileType = (name: string) => {
  const ext = name.split('.').pop()?.toLowerCase() || '';
  for (const [t, exts] of Object.entries(TIPOS)) {
    if (exts.includes(ext)) return t;
  }
  return 'otro';
};

const IconForType = ({ type, className }: { type: string, className?: string }) => {
  const props = { className: `w-8 h-8 stroke-[1.5] ${className || ''}` };
  switch (type) {
    case 'imagen': return <ImageIcon {...props} />;
    case 'video': return <Video {...props} />;
    case 'audio': return <Music {...props} />;
    case 'texto': return <FileText {...props} />;
    case 'oficina': return <FileSpreadsheet {...props} />;
    case 'archivo': return <Archive {...props} />;
    default: return <FileIcon {...props} />;
  }
};

// --- Subcomponents ---

let hoveredElement: HTMLElement | null = null;
let currentHoverRect = { x: 0, y: 0, w: 0, h: 0, alpha: 0, element: null as HTMLElement | null };

const HalftoneBackground = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d', { alpha: false });
    if (!ctx) return;

    let width = window.innerWidth;
    let height = window.innerHeight;

    const handleResize = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = width;
      canvas.height = height;
    };
    
    window.addEventListener('resize', handleResize);
    handleResize();

    const cellSize = 24;
    let time = 0;
    let isVisible = true;

    const handleVisibility = () => { isVisible = document.visibilityState === 'visible'; };
    document.addEventListener('visibilitychange', handleVisibility);

    let lastFrame = 0;
    const frameInterval = 1000 / 30; // 30fps es suficiente para este efecto y reduce carga

    const render = (now: number = 0) => {
      if (!isVisible) {
        animId = requestAnimationFrame(render);
        return;
      }
      if (now - lastFrame < frameInterval) {
        animId = requestAnimationFrame(render);
        return;
      }
      lastFrame = now;
      time += 0.015;
      
      ctx.fillStyle = '#000000';
      ctx.fillRect(0, 0, width, height);

      const cx = width / 2;
      const cy = height / 2;
      const maxR = Math.min(width, height) * 0.4;
      const maxDot = cellSize * 0.95;

      const cols = Math.ceil(width / cellSize);
      const rows = Math.ceil(height / cellSize);
      
      ctx.fillStyle = '#ffffff';

      let targetX = 0, targetY = 0, targetW = 0, targetH = 0, targetAlpha = 0;
      if (hoveredElement) {
          const rect = hoveredElement.getBoundingClientRect();
          targetX = rect.left;
          targetY = rect.top;
          targetW = rect.width;
          targetH = rect.height;
          targetAlpha = 1;
          
          if (currentHoverRect.element !== hoveredElement) {
              // Snap immediately when hovering a new element
              currentHoverRect.x = targetX;
              currentHoverRect.y = targetY;
              currentHoverRect.w = targetW;
              currentHoverRect.h = targetH;
              currentHoverRect.element = hoveredElement;
          } else {
              // Follow smoothly if the element is just scrolling/moving slightly
              currentHoverRect.x += (targetX - currentHoverRect.x) * 0.3;
              currentHoverRect.y += (targetY - currentHoverRect.y) * 0.3;
              currentHoverRect.w += (targetW - currentHoverRect.w) * 0.3;
              currentHoverRect.h += (targetH - currentHoverRect.h) * 0.3;
          }
      } else {
          currentHoverRect.element = null;
      }

      currentHoverRect.alpha += (targetAlpha - currentHoverRect.alpha) * 0.12;
      if (currentHoverRect.alpha < 0.001) currentHoverRect.alpha = 0;

      for (let i = 0; i < cols; i++) {
        for (let j = 0; j < rows; j++) {
          const x = i * cellSize;
          const y = j * cellSize;
          
          const dx = x - cx;
          const dy = y - cy + maxR * 0.1;
          
          let angle = Math.atan2(dy, dx);
          let dist = Math.sqrt(dx * dx + dy * dy);
          
          // Organic twist
          angle += Math.sin(dist * 0.003 - time * 0.5) * 0.3;
          
          // Flower Mask
          const petalRadius = maxR * (0.3 + 0.7 * Math.abs(Math.sin(5 * angle * 0.5 + time * 0.3)));
          const isPetal = dist < petalRadius && dy < maxR * 0.5;
          
          const stemCurve = Math.sin(dy * 0.01 - time * 0.5) * 40;
          const isStem = dy >= maxR * 0.5 && dy < maxR * 1.5 && Math.abs(dx - stemCurve) < 30;
          
          let mask = 0;
          if (isPetal) {
            mask = 1 - Math.pow(dist / petalRadius, 2);
          } else if (isStem) {
            mask = 1 - Math.abs(dx - stemCurve) / 30;
          }

          // Smooth multi-layered noise for the organic 'melted' look
          const nx = i * 0.07;
          const ny = j * 0.07;
          const noise1 = Math.sin(nx + time) * Math.cos(ny - time * 0.8);
          const noise2 = Math.sin(nx * 0.5 - ny * 0.3 + time * 1.2);
          const noise3 = Math.cos(nx * 1.2 + ny * 1.3 - time * 1.5);
          const noise = (noise1 + noise2 + noise3) / 3; // Range ~ -1 to 1
          
          // Ambient background ripples
          let intensity = (noise + 1) * 0.06; 

          // Combine mask with noise
          if (mask > 0) {
            intensity += mask * (0.4 + noise * 0.4);
          }

          if (currentHoverRect.alpha > 0.01) {
             const cx2 = currentHoverRect.x + currentHoverRect.w / 2;
             const cy2 = currentHoverRect.y + currentHoverRect.h / 2;
             const absDx = Math.abs(x - cx2) - currentHoverRect.w / 2;
             const absDy = Math.abs(y - cy2) - currentHoverRect.h / 2;
             const sdt = Math.max(absDx, absDy);
             
             // Dynamic glowing outline effect
             const edgeDist = Math.abs(sdt);
             const outlineSpread = 40; 
             
             if (edgeDist < outlineSpread) {
                const rectMask = Math.pow(1 - (edgeDist / outlineSpread), 2) * currentHoverRect.alpha;
                
                // Breathing and organic dot variation
                const dotVariation = (Math.sin(i * 0.8 + time * 3) * Math.cos(j * 0.8 - time * 2)) * 0.5 + 0.5;
                const breath = Math.sin(time * 2) * 0.3 + 0.7; // 0.4 to 1.0
                
                // Bright white highlight precisely on the edge, varied by dot position and time
                // Lowered intensity multiplier for a softer glow
                intensity += rectMask * (0.3 + dotVariation * 0.8) * breath;
             }
             
             // Very subtle fill inside
             if (sdt < 0) {
                intensity += 0.03 * currentHoverRect.alpha;
             }
          }

          intensity = Math.max(0, Math.min(1, intensity));

          if (intensity > 0.03) {
            // Slight reduction in maximum size and alpha for a more elegant, subtle look
            const size = Math.pow(intensity, 1.3) * maxDot * 0.85;
            const alpha = 0.15 + intensity * 0.65;
            
            ctx.globalAlpha = alpha;
            
            const radius = size > cellSize * 0.5 ? size * 0.4 : size * 0.5;
            
            ctx.beginPath();
            if (ctx.roundRect) {
              ctx.roundRect(x + (cellSize - size)/2, y + (cellSize - size)/2, size, size, radius);
            } else {
              ctx.arc(x + cellSize/2, y + cellSize/2, size/2, 0, Math.PI * 2);
            }
            ctx.fill();
          }
        }
      }
      
      ctx.globalAlpha = 1.0;
      animId = requestAnimationFrame(render);
    };

    let animId = requestAnimationFrame(render);

    return () => {
      window.removeEventListener('resize', handleResize);
      document.removeEventListener('visibilitychange', handleVisibility);
      cancelAnimationFrame(animId);
    };
  }, []);

  return <canvas ref={canvasRef} className="fixed inset-0 z-0 pointer-events-none mix-blend-screen opacity-70" />;
};

const FileCard = ({ file, index }: { file: GithubFile; index: number }) => {
  const [downloading, setDownloading] = useState(false);
  const [textPreview, setTextPreview] = useState<string | null>(null);
  const url = getCdnUrl(file.name);
  const type = getFileType(file.name);

  useEffect(() => {
    if (type === 'texto') {
      fetch(url)
        .then(r => r.text())
        .then(txt => setTextPreview(txt.slice(0, 300)))
        .catch(() => setTextPreview('(preview unavailable)'));
    }
  }, [url, type]);

  const handleDownload = async () => {
    setDownloading(true);
    try {
      const res = await fetch(url);
      const blob = await res.blob();
      const blobUrl = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = blobUrl;
      a.download = file.name;
      document.body.appendChild(a);
      a.click();
      a.remove();
      setTimeout(() => URL.revokeObjectURL(blobUrl), 5000);
    } catch (e) {
      alert('Failed to download.');
    } finally {
      setDownloading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: index * 0.05, ease: [0.22, 1, 0.36, 1] }}
      onMouseEnter={(e) => { hoveredElement = e.currentTarget as HTMLElement; }}
      onMouseLeave={(e) => { if (hoveredElement === e.currentTarget) hoveredElement = null; }}
      className="group relative flex flex-col bg-[#060606]/60 backdrop-blur-lg border border-white/10 p-2.5 sm:p-4 md:p-6 transition-all duration-500 hover:border-white/30 hover:bg-[#060606]/20"
    >
      {/* Decorative mini flower in corner */}
      <div className="absolute -bottom-6 -right-6 w-24 h-24 text-white opacity-[0.03] pointer-events-none transform rotate-12 transition-transform group-hover:scale-110 group-hover:rotate-45 duration-700 font-mono font-bold text-[80px] leading-none text-center">
        *
      </div>

      <div className="relative w-full aspect-square md:aspect-[4/3] bg-[#111] border border-white/20 flex items-center justify-center overflow-hidden mb-3 sm:mb-6 bg-noise">
        {type === 'imagen' && (
          <img src={url} alt={file.name} loading="lazy" className="w-full h-full object-cover filter-print transition-transform duration-700 group-hover:scale-105" />
        )}
        {type === 'video' && (
          <video src={url} muted preload="metadata" playsInline className="w-full h-full object-cover filter-print" />
        )}
        {type === 'pdf' && (
          <iframe
            src={url}
            loading="lazy"
            className="w-full h-full bg-white"
            title={file.name}
          />
        )}
        {type === 'oficina' && (
          <iframe
            src={`https://view.officeapps.live.com/op/view.aspx?src=${encodeURIComponent(url)}`}
            loading="lazy"
            className="w-full h-full bg-white"
            title={file.name}
          />
        )}
        {type === 'texto' && (
          <div className="w-full h-full p-4 overflow-hidden bg-[#060606]/80 backdrop-blur-sm text-xs font-mono text-white whitespace-pre-wrap break-all relative">
             {textPreview || 'Loading...'}
             <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-[#060606] to-transparent"></div>
          </div>
        )}
        {['audio', 'archivo', 'otro'].includes(type) && (
          <div className="text-white/40 group-hover:text-white transition-colors duration-300">
            <IconForType type={type} className="w-16 h-16" />
          </div>
        )}
      </div>

      <div className="flex-grow flex flex-col justify-between relative z-10 bg-transparent">
        <h3 className="font-bold text-xs sm:text-sm md:text-base leading-tight uppercase tracking-tight break-all mb-3 sm:mb-6">
          {file.name}
        </h3>
        
        {type === 'audio' && (
          <audio controls src={url} className="w-full h-8 mb-3 sm:mb-4 opacity-50 grayscale hover:opacity-100 transition-opacity invert" />
        )}

        <div className="flex flex-col gap-1.5 sm:gap-2">
          <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 w-full py-2 sm:py-3 px-2 sm:px-4 border border-white/50 text-[10px] sm:text-xs font-bold uppercase tracking-widest hover:bg-white hover:text-black transition-colors"
          >
            <ExternalLink className="w-4 h-4" /> View
          </a>
          <button
            onClick={handleDownload}
            disabled={downloading}
            className="flex items-center justify-center gap-2 w-full py-2 sm:py-3 px-2 sm:px-4 bg-white text-black border border-white text-[10px] sm:text-xs font-bold uppercase tracking-widest hover:bg-black hover:text-white disabled:opacity-50 disabled:cursor-wait transition-colors"
          >
            <Download className="w-4 h-4" /> {downloading ? 'WAIT' : 'DOWNLOAD'}
          </button>
        </div>
      </div>
    </motion.div>
  );
};

export default function App() {
  const [files, setFiles] = useState<GithubFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch(API_URL)
      .then(r => {
        if (!r.ok) throw new Error('Could not fetch directory contents.');
        return r.json();
      })
      .then((data: GithubFile[]) => {
        const fileList = data.filter(f => f.type === 'file' && f.name !== '.gitkeep');
        setFiles(fileList);
      })
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen relative overflow-hidden bg-[#060606] text-white font-sans selection:bg-white selection:text-black">
      
      <HalftoneBackground />

      {/* Global Halftone/Noise Background Layer */}
      <div className="fixed inset-0 pointer-events-none z-0 opacity-40 bg-noise mix-blend-screen"></div>
      
      {/* CRT Scanline Effect */}
      <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden mix-blend-overlay">
        <motion.div 
          animate={{ y: ["-100vh", "100vh"] }}
          transition={{ repeat: Infinity, duration: 8, ease: "linear" }}
          className="w-full h-32 bg-gradient-to-b from-transparent via-white/10 to-transparent"
        />
      </div>

      <div className="relative z-10 w-full max-w-7xl mx-auto px-6 py-24 md:px-12 md:py-32">
        
        <header className="mb-24 flex flex-col md:flex-row items-center md:items-start justify-between gap-12">
          <div className="flex-1 max-w-2xl relative">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="relative inline-block text-center md:text-left"
            >
              <h1 aria-hidden="true" className="blur-[10px] opacity-90 text-6xl md:text-8xl lg:text-[10rem] font-black tracking-tighter uppercase leading-[0.8]">
                ARCHIVOS
              </h1>
              <h1
                className="absolute inset-0 text-6xl md:text-8xl lg:text-[10rem] font-black tracking-tighter uppercase leading-[0.8]"
                style={{
                  WebkitMaskImage: 'linear-gradient(90deg, transparent 0%, black 35%, black 65%, transparent 100%)',
                  maskImage: 'linear-gradient(90deg, transparent 0%, black 35%, black 65%, transparent 100%)',
                }}
              >
                ARCHIVOS
              </h1>
            </motion.div>
            <motion.p 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 1, delay: 0.4 }}
              className="mt-8 text-sm md:text-base font-semibold tracking-widest uppercase text-gray-400 max-w-md text-center md:text-left"
            >
              Curated collection • Index {files.length.toString().padStart(3, '0')}
            </motion.p>
          </div>
        </header>

        <main className="relative">
          {loading ? (
            <div className="flex justify-center items-center py-32">
              <div className="flex flex-col items-center gap-4">
                <div className="w-12 h-12 border-4 border-white/20 border-t-white rounded-full animate-spin"></div>
                <p className="font-mono text-xs uppercase tracking-widest text-gray-400">Indexing...</p>
              </div>
            </div>
          ) : error ? (
            <div className="p-8 border border-white/20 bg-[#111] inline-block">
              <p className="font-mono text-sm font-bold uppercase text-red-400">Error: {error}</p>
            </div>
          ) : files.length === 0 ? (
            <div className="p-8 border border-white/20 bg-[#111] inline-block">
              <p className="font-mono text-sm font-bold uppercase text-gray-400">No files found.</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-6 md:gap-8 lg:gap-12">
              {files.map((file, i) => (
                <FileCard key={file.sha} file={file} index={i} />
              ))}
            </div>
          )}
        </main>
        
        <footer className="mt-32 pt-8 border-t border-white/20 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="font-mono text-xs uppercase tracking-widest text-gray-500">
            {new Date().getFullYear()} © Joss-001-ty
          </p>
        </footer>
      </div>
    </div>
  );
}
