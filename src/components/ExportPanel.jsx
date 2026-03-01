import { useState } from 'react';
import { Download, FileJson, FileText, Code, Check } from 'lucide-react';
import { exportPBITheme, exportFormatSpec, exportPBIPConfig } from '../lib/themeExporter';

export default function ExportPanel({ designSystem }) {
  const [copied, setCopied] = useState(null);

  const exports = [
    {
      id: 'theme',
      label: 'Power BI Theme JSON',
      desc: 'Import directly into Power BI Desktop',
      icon: FileJson,
      filename: `${designSystem.name.replace(/\s+/g, '-').toLowerCase()}.json`,
      mimeType: 'application/json',
      generate: () => exportPBITheme(designSystem)
    },
    {
      id: 'spec',
      label: 'Format Specification',
      desc: 'Human-readable design spec (Markdown)',
      icon: FileText,
      filename: `${designSystem.name.replace(/\s+/g, '-').toLowerCase()}-spec.md`,
      mimeType: 'text/markdown',
      generate: () => exportFormatSpec(designSystem)
    },
    {
      id: 'pbip',
      label: 'PBIP Visual Config',
      desc: 'For Power BI Projects (PBIP format)',
      icon: Code,
      filename: `visual-config.json`,
      mimeType: 'application/json',
      generate: () => exportPBIPConfig(designSystem)
    }
  ];

  const download = (exp) => {
    const content = exp.generate();
    const blob = new Blob([content], { type: exp.mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = exp.filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  const copy = (exp) => {
    navigator.clipboard.writeText(exp.generate()).catch(e => console.error('Copy failed:', e));
    setCopied(exp.id);
    setTimeout(() => setCopied(null), 2000);
  };

  return (
    <div className="space-y-4">
      <h3 className="text-sm font-semibold text-text-muted flex items-center gap-2">
        <Download size={16} className="text-primary" />
        Export Design System
      </h3>

      {designSystem.colors.length === 0 && (
        <p className="text-xs text-text-muted bg-surface rounded-lg p-3">
          💡 Add screenshots and extract colors first to generate meaningful exports.
        </p>
      )}

      {designSystem.colors.length > 0 && designSystem.colors.length !== 8 && (
        <div className="flex items-start gap-2 p-3 bg-yellow-light border border-yellow/30 rounded-lg text-xs text-text-muted">
          <span className="text-yellow-600 flex-shrink-0">⚠️</span>
          <span>
            Your palette has <strong>{designSystem.colors.length}</strong> colors. Power BI themes work best with{' '}
            <strong>exactly 8 data colors</strong>. Go to the Palette tab to adjust.
          </span>
        </div>
      )}

      <div className="space-y-3">
        {exports.map((exp) => (
          <div key={exp.id} className="bg-surface rounded-xl p-4 space-y-3">
            <div className="flex items-start gap-3">
              <exp.icon size={20} className="text-primary mt-0.5" />
              <div>
                <p className="text-sm font-medium">{exp.label}</p>
                <p className="text-xs text-text-muted">{exp.desc}</p>
              </div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => download(exp)}
                className="flex-1 py-2 bg-primary/10 text-primary text-xs font-medium rounded-lg hover:bg-primary/20 transition-colors flex items-center justify-center gap-1"
              >
                <Download size={12} />
                Download
              </button>
              <button
                onClick={() => copy(exp)}
                className="flex-1 py-2 bg-surface-lighter text-text-muted text-xs font-medium rounded-lg hover:text-text transition-colors flex items-center justify-center gap-1"
              >
                {copied === exp.id ? <><Check size={12} className="text-green-400" /> Copied!</> : 'Copy'}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
