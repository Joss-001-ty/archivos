import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Download, ExternalLink, File as FileIcon, Image as ImageIcon, Music, Video, FileText, Archive, FileSpreadsheet } from 'lucide-react';

// ==== CONFIGURATION ====
const OWNER = "Joss-001-ty";
const REPO = "kokekieras";
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

const SVGDefinitions = () => (
  <svg width="0" height="0" className="absolute" aria-hidden="true">
    <defs>
      <pattern id="halftoneSparse" width="6" height="6" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
        <circle cx="1.5" cy="1.5" r="1.2" fill="currentColor" />
      </pattern>
      <pattern id="halftoneDense" width="3" height="3" patternUnits="userSpaceOnUse" patternTransform="rotate(15)">
        <circle cx="1" cy="1" r="1" fill="currentColor" />
      </pattern>
      
      {/* Warped Grid (Op-Art style from image 2) */}
      <pattern id="warpedGrid" width="60" height="60" patternUnits="userSpaceOnUse">
        <path d="M 60 0 L 0 0 0 60" fill="none" stroke="currentColor" strokeWidth="1.5" />
      </pattern>
      <filter id="warp" x="-20%" y="-20%" width="140%" height="140%">
        <feTurbulence type="fractalNoise" baseFrequency="0.005" numOctaves="2" result="noise" />
        <feDisplacementMap in="SourceGraphic" in2="noise" scale="120" xChannelSelector="R" yChannelSelector="G" />
      </filter>

      {/* Pixelated Halftone Dither (Blocky style from image 3) */}
      <pattern id="pixelDither" width="32" height="32" patternUnits="userSpaceOnUse">
        <rect x="0" y="0" width="4" height="4" fill="currentColor" opacity="0.9"/>
        <rect x="8" y="4" width="2" height="2" fill="currentColor" opacity="0.5"/>
        <rect x="16" y="12" width="8" height="8" fill="currentColor" opacity="0.2"/>
        <rect x="28" y="6" width="2" height="2" fill="currentColor" opacity="0.8"/>
        <rect x="4" y="24" width="4" height="4" fill="currentColor" opacity="0.4"/>
        <rect x="14" y="28" width="2" height="2" fill="currentColor" opacity="0.9"/>
        <rect x="24" y="20" width="4" height="4" fill="currentColor" opacity="0.6"/>
        <rect x="12" y="2" width="2" height="2" fill="currentColor" opacity="0.3"/>
        <rect x="2" y="14" width="2" height="2" fill="currentColor" opacity="0.7"/>
        <rect x="22" y="30" width="2" height="2" fill="currentColor" opacity="0.5"/>
      </pattern>
      <mask id="ditherMask">
        <radialGradient id="fadeGrad" cx="50%" cy="50%" r="70%">
          <stop offset="0%" stopColor="white" stopOpacity="1" />
          <stop offset="100%" stopColor="black" stopOpacity="0" />
        </radialGradient>
        <rect width="100%" height="100%" fill="url(#fadeGrad)" />
      </mask>

      <symbol id="flor" viewBox="0 0 100 100">
        {/* Stamen/Pistil lines radiating out, made of dots */}
        <path d="M50 50 Q30 20 10 30" fill="none" stroke="currentColor" strokeWidth="1" strokeDasharray="1 3" strokeLinecap="round" />
        <path d="M50 50 Q20 40 5 50" fill="none" stroke="currentColor" strokeWidth="1.5" strokeDasharray="1 4" strokeLinecap="round" />
        <path d="M50 50 Q30 70 20 90" fill="none" stroke="currentColor" strokeWidth="1" strokeDasharray="1 3" strokeLinecap="round" />
        <path d="M50 50 Q60 20 80 15" fill="none" stroke="currentColor" strokeWidth="2" strokeDasharray="1 4" strokeLinecap="round" />
        <path d="M50 50 Q80 40 95 45" fill="none" stroke="currentColor" strokeWidth="1" strokeDasharray="1 3" strokeLinecap="round" />
        <path d="M50 50 Q70 70 85 85" fill="none" stroke="currentColor" strokeWidth="1.5" strokeDasharray="1 4" strokeLinecap="round" />
        
        {/* Dense center */}
        <circle cx="50" cy="50" r="8" fill="url(#halftoneDense)" />
        <circle cx="50" cy="50" r="14" fill="none" stroke="currentColor" strokeWidth="2" strokeDasharray="1 4" />
        
        {/* Petals using sparse dots */}
        <path d="M50 50 C 45 30 30 25 25 35 C 30 45 45 55 50 50" fill="url(#halftoneSparse)" />
        <path d="M50 50 C 55 30 70 25 75 35 C 70 45 55 55 50 50" fill="url(#halftoneSparse)" />
        <path d="M50 50 C 60 65 75 75 70 85 C 60 75 50 65 50 50" fill="url(#halftoneSparse)" />
        <path d="M50 50 C 40 65 25 75 30 85 C 40 75 50 65 50 50" fill="url(#halftoneSparse)" />
      </symbol>
    </defs>
  </svg>
);

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
      className="group relative flex flex-col bg-[#060606]/60 backdrop-blur-xl border border-white/20 p-4 md:p-6 transition-all duration-300 hover:border-white hover:bg-[#060606]/80 hover:shadow-[8px_8px_0px_0px_rgba(255,255,255,1)]"
    >
      {/* Decorative mini flower in corner */}
      <svg className="absolute -bottom-6 -right-6 w-24 h-24 text-white opacity-10 pointer-events-none transform rotate-12 transition-transform group-hover:scale-110 group-hover:rotate-45 duration-700">
        <use href="#flor" />
      </svg>

      <div className="relative w-full aspect-square md:aspect-[4/3] bg-[#111] border border-white/20 flex items-center justify-center overflow-hidden mb-6 bg-noise">
        {type === 'imagen' && (
          <img src={url} alt={file.name} loading="lazy" className="w-full h-full object-cover filter-print transition-transform duration-700 group-hover:scale-105" />
        )}
        {type === 'video' && (
          <video src={url} muted preload="metadata" playsInline className="w-full h-full object-cover filter-print" />
        )}
        {type === 'texto' && (
          <div className="w-full h-full p-4 overflow-hidden bg-[#060606]/80 backdrop-blur-sm text-xs font-mono text-white whitespace-pre-wrap break-all relative">
             {textPreview || 'Loading...'}
             <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-[#060606] to-transparent"></div>
          </div>
        )}
        {['audio', 'pdf', 'oficina', 'archivo', 'otro'].includes(type) && (
          <div className="text-white/40 group-hover:text-white transition-colors duration-300">
            <IconForType type={type} className="w-16 h-16" />
          </div>
        )}
      </div>

      <div className="flex-grow flex flex-col justify-between relative z-10 bg-transparent">
        <h3 className="font-bold text-sm md:text-base leading-tight uppercase tracking-tight break-all mb-6">
          {file.name}
        </h3>
        
        {type === 'audio' && (
          <audio controls src={url} className="w-full h-8 mb-4 opacity-50 grayscale hover:opacity-100 transition-opacity invert" />
        )}

        <div className="flex flex-col gap-2">
          <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 w-full py-3 px-4 border border-white/50 text-xs font-bold uppercase tracking-widest hover:bg-white hover:text-black transition-colors"
          >
            <ExternalLink className="w-4 h-4" /> View
          </a>
          <button
            onClick={handleDownload}
            disabled={downloading}
            className="flex items-center justify-center gap-2 w-full py-3 px-4 bg-white text-black border border-white text-xs font-bold uppercase tracking-widest hover:bg-black hover:text-white disabled:opacity-50 disabled:cursor-wait transition-colors"
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
      <SVGDefinitions />
      
      {/* Global Halftone/Noise Background Layer */}
      <div className="fixed inset-0 pointer-events-none z-0 opacity-40 bg-noise mix-blend-screen"></div>
      
      {/* Decorative Warped Grid (Op-Art Style) */}
      <svg className="fixed inset-0 w-full h-full pointer-events-none z-0 text-white opacity-[0.06]" aria-hidden="true">
        <rect width="100%" height="100%" fill="url(#warpedGrid)" filter="url(#warp)" />
      </svg>
      
      {/* Pixelated Halftone Scatter (Digital Dither Style) */}
      <svg className="fixed inset-0 w-full h-full pointer-events-none z-0 text-white opacity-[0.15]" aria-hidden="true">
        <rect width="100%" height="100%" fill="url(#pixelDither)" mask="url(#ditherMask)" />
      </svg>

      {/* Decorative Giant Background Flowers */}
      <svg className="fixed -top-32 -right-32 w-[600px] h-[600px] text-white opacity-[0.05] pointer-events-none transform -rotate-12 z-0">
        <use href="#flor" />
      </svg>
      <svg className="fixed top-2/3 -left-48 w-[800px] h-[800px] text-white opacity-[0.03] pointer-events-none transform rotate-45 z-0">
        <use href="#flor" />
      </svg>

      <div className="relative z-10 w-full max-w-7xl mx-auto px-6 py-24 md:px-12 md:py-32">
        
        <header className="mb-24 flex flex-col md:flex-row items-center md:items-start justify-between gap-12">
          <div className="flex-1 max-w-2xl relative">
            {/* Flower overlapping text */}
            <svg className="absolute -top-16 -left-12 w-32 h-32 text-white opacity-40 pointer-events-none transform -rotate-12 mix-blend-screen hidden md:block">
              <use href="#flor" />
            </svg>
            <motion.h1 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="text-6xl md:text-8xl lg:text-[10rem] font-black tracking-tighter uppercase leading-[0.8] mix-blend-screen relative z-10 text-center md:text-left"
            >
              ARCHI<br/>VOS
            </motion.h1>
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
                <svg className="w-12 h-12 text-white animate-spin" viewBox="0 0 100 100">
                  <use href="#flor" />
                </svg>
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
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 md:gap-12">
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
          <svg className="w-8 h-8 text-white opacity-20" viewBox="0 0 100 100">
            <use href="#flor" />
          </svg>
        </footer>
      </div>
    </div>
  );
}
