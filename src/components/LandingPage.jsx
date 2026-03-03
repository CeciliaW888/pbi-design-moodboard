import { useState, useRef } from 'react';
import { motion, useInView, useScroll, useTransform, AnimatePresence } from 'framer-motion';
import {
  Sparkles, Palette, Type, Download, Image, Eye, Code2,
  ArrowRight, Check, X, Minus, Github, ChevronDown, Menu,
  X as XClose, TrendingUp, Layers, MousePointerClick, Zap,
  Sun, Moon
} from 'lucide-react';
import { useTheme } from '../hooks/useTheme';

/* ═══════════════════════════════════════════════════════════════════════
   THEME TOKENS: dark/light color mappings
   ═══════════════════════════════════════════════════════════════════════ */
function useTokens() {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === 'dark';
  return {
    isDark, theme, toggleTheme,
    // Page
    pageBg:       isDark ? 'bg-[#0a0a1a]' : 'bg-[#fafbfe]',
    pageText:     isDark ? 'text-white' : 'text-gray-900',
    selection:    isDark ? 'selection:bg-[#0078D4]/30 selection:text-white' : 'selection:bg-[#0078D4]/20 selection:text-gray-900',
    // Nav
    navBg:        isDark ? 'bg-[#0a0a1a]/80' : 'bg-white/80',
    navBorder:    isDark ? 'border-white/[0.04]' : 'border-gray-200/60',
    navLink:      isDark ? 'text-white/40 hover:text-white hover:bg-white/[0.04]' : 'text-gray-500 hover:text-gray-900 hover:bg-gray-100',
    navMobileBg:  isDark ? 'bg-[#0a0a1a]/95' : 'bg-white/95',
    navMobileLink:isDark ? 'text-white/50 hover:text-white' : 'text-gray-500 hover:text-gray-900',
    brandText:    isDark ? 'text-white' : 'text-gray-900',
    // Cards & surfaces
    cardBg:       isDark ? 'bg-[#14142c]' : 'bg-white',
    cardBorder:   isDark ? 'border-white/[0.05]' : 'border-gray-200',
    cardHoverBorder: isDark ? 'hover:border-white/[0.1]' : 'hover:border-gray-300',
    cardHoverBg:  isDark ? 'hover:bg-[#17172f]' : 'hover:bg-gray-50',
    featureCardBg:isDark ? 'bg-[#14142c]/70' : 'bg-white/80',
    tableBg:      isDark ? 'bg-[#12122a]' : 'bg-white',
    tableRowAlt:  isDark ? 'bg-white/[0.008]' : 'bg-gray-50/50',
    tableRowHover:isDark ? 'hover:bg-white/[0.015]' : 'hover:bg-blue-50/40',
    tableBorder:  isDark ? 'border-white/[0.03]' : 'border-gray-100',
    // Illustration
    browserBg:    isDark ? 'bg-[#13132a]' : 'bg-white',
    browserChrome:isDark ? 'bg-[#1a1a34]' : 'bg-gray-100',
    browserToolbar:isDark ? 'bg-[#16162e]' : 'bg-gray-50',
    canvasBg:     isDark ? 'bg-[#10102a]' : 'bg-[#f8f9fc]',
    mockCardBg:   isDark ? 'bg-[#1e1e3a]' : 'bg-white',
    panelBg:      isDark ? 'bg-[#171730]' : 'bg-gray-50',
    // Text variants
    heading:      isDark ? 'text-white' : 'text-gray-900',
    body:         isDark ? 'text-white/40' : 'text-gray-500',
    muted:        isDark ? 'text-white/30' : 'text-gray-400',
    faint:        isDark ? 'text-white/20' : 'text-gray-300',
    faintest:     isDark ? 'text-white/15' : 'text-gray-200',
    // Borders
    borderLight:  isDark ? 'border-white/[0.04]' : 'border-gray-200/60',
    borderMed:    isDark ? 'border-white/[0.06]' : 'border-gray-200',
    borderHeavy:  isDark ? 'border-white/[0.08]' : 'border-gray-300',
    // Strip / section
    stripBorder:  isDark ? 'border-white/[0.03]' : 'border-gray-100',
    stripText:    isDark ? 'text-white/15' : 'text-gray-300',
    // Misc
    sectionGlow:  isDark ? 'via-[#0078D4]/[0.015]' : 'via-[#0078D4]/[0.03]',
    footerText:   isDark ? 'text-white/25' : 'text-gray-400',
    footerLink:   isDark ? 'text-white/30 hover:text-white/60' : 'text-gray-400 hover:text-gray-600',
    // Dots/grid opacity
    dotOpacity:   isDark ? 'opacity-[0.07]' : 'opacity-[0.25]',
    mockBorder:   isDark ? 'border-white/[0.07]' : 'border-gray-200',
    mockBorderFrame:isDark ? 'border-white/[0.08]' : 'border-gray-300',
    swatchBorder: isDark ? 'border-white/[0.15]' : 'border-gray-300',
    // KPI card text
    kpiLabel:     isDark ? 'text-white/30' : 'text-gray-400',
    kpiValue:     isDark ? 'text-white' : 'text-gray-900',
    kpiSubtext:   isDark ? 'text-white/20' : 'text-gray-300',
    // Panel mock
    panelLabel:   isDark ? 'text-white/25' : 'text-gray-400',
    panelColor:   isDark ? 'text-white/50' : 'text-gray-600',
    panelHex:     isDark ? 'text-white/20' : 'text-gray-400',
    panelFont:    isDark ? 'text-white/60' : 'text-gray-700',
    panelFontSub: isDark ? 'text-white/30' : 'text-gray-400',
    panelDivider: isDark ? 'bg-white/[0.04]' : 'bg-gray-200',
    panelSentLabel:isDark ? 'text-white/25' : 'text-gray-400',
    panelBorderColor:isDark ? 'border-white/10' : 'border-gray-200',
    // Table header
    tableHeaderText:isDark ? 'text-white/30' : 'text-gray-400',
    tableFeatureText:isDark ? 'text-white/55' : 'text-gray-600',
    // Address bar
    addressBg:    isDark ? 'bg-white/[0.04]' : 'bg-gray-200/60',
    addressText:  isDark ? 'text-white/30' : 'text-gray-400',
    // Toolbar mock
    toolbarLabel: isDark ? (i) => i === 0 ? 'bg-[#0078D4]/20 text-[#4da8ff]' : 'text-white/20' : (i) => i === 0 ? 'bg-[#0078D4]/15 text-[#0078D4]' : 'text-gray-400',
    // Skeleton lines
    skeletonDark: isDark ? 'bg-white/[0.06]' : 'bg-gray-200',
    skeletonLight:isDark ? 'bg-white/[0.03]' : 'bg-gray-100',
    // Step number
    stepNum:      isDark ? 'text-[#0078D4]/40' : 'text-[#0078D4]/50',
    // Hover gradient
    hoverGradient:isDark ? 'from-white/[0.08]' : 'from-gray-200/40',
    hoverGradientFeature:isDark ? 'from-white/[0.06]' : 'from-gray-200/30',
    // CellNo bg
    cellNoBg:     isDark ? 'bg-white/[0.03]' : 'bg-gray-100',
    cellNoText:   isDark ? 'text-white/15' : 'text-gray-300',
    // CTA glow
    ctaGlowSmall: 'hover:shadow-[0_0_28px_rgba(0,120,212,0.35)]',
    ctaGlowMed:   'hover:shadow-[0_0_48px_rgba(0,120,212,0.45)]',
    ctaGlowLg:    'hover:shadow-[0_0_64px_rgba(0,120,212,0.5)]',
    // Export button mock
    exportBg:     isDark ? 'bg-[#F2C811]/15' : 'bg-[#F2C811]/20',
    exportText:   isDark ? 'text-[#F2C811]/70' : 'text-[#9a7c00]',
    // Reflection
    reflectionFrom:isDark ? 'from-[#0078D4]/[0.04]' : 'from-[#0078D4]/[0.06]',
    // Shadow
    frameShadow:  isDark ? 'shadow-[0_32px_80px_rgba(0,0,0,0.55)]' : 'shadow-[0_32px_80px_rgba(0,0,0,0.12)]',
    tableShadow:  isDark ? 'shadow-[0_8px_40px_rgba(0,0,0,0.3)]' : 'shadow-[0_8px_40px_rgba(0,0,0,0.06)]',
  };
}

/* ═══════════════════════════════════════════════════════════════════════
   UTILITY: Scroll-triggered fade-in wrapper
   ═══════════════════════════════════════════════════════════════════════ */
function Reveal({ children, className = '', delay = 0, direction = 'up' }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-60px' });
  const variants = {
    hidden: {
      opacity: 0,
      y: direction === 'up' ? 48 : direction === 'down' ? -48 : 0,
      x: direction === 'left' ? 48 : direction === 'right' ? -48 : 0,
    },
    visible: { opacity: 1, y: 0, x: 0 },
  };
  return (
    <motion.div
      ref={ref}
      variants={variants}
      initial="hidden"
      animate={inView ? 'visible' : 'hidden'}
      transition={{ duration: 0.72, delay, ease: [0.22, 1, 0.36, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════
   HERO ILLUSTRATION: Pure CSS/SVG moodboard canvas mockup
   ═══════════════════════════════════════════════════════════════════════ */
function HeroIllustration({ t }) {
  const barColors = ['#0078D4cc', '#0078D4', '#0078D488', '#F2C811', '#0078D4aa'];
  const barHeights = [30, 50, 40, 62, 35];
  const paletteColors = ['#0078D4', '#F2C811', '#107C10', '#D83B01', '#5C2D91'];
  const panelColors = [
    { hex: '#0078D4', label: 'Primary' },
    { hex: '#F2C811', label: 'Accent' },
    { hex: '#107C10', label: 'Positive' },
    { hex: '#D83B01', label: 'Warning' },
  ];

  return (
    <div className="relative w-full max-w-[740px] mx-auto select-none">
      {/* Ambient glow */}
      <div className="absolute -inset-12 bg-[radial-gradient(ellipse_at_center,rgba(0,120,212,0.12),transparent_70%)] blur-2xl pointer-events-none" />
      <div className="absolute -inset-12 bg-[radial-gradient(ellipse_at_70%_80%,rgba(242,200,17,0.08),transparent_60%)] blur-2xl pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 32, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 1.1, delay: 0.25, ease: [0.22, 1, 0.36, 1] }}
        className="relative"
      >
        {/* ── Browser Window Frame ────────────────────────────── */}
        <div className={`rounded-2xl border ${t.mockBorderFrame} ${t.browserBg} ${t.frameShadow} overflow-hidden`}>
          {/* Traffic lights + address bar */}
          <div className={`flex items-center gap-2 px-4 py-2.5 ${t.browserChrome} border-b ${t.borderLight}`}>
            <div className="flex gap-[6px]">
              <div className="w-[11px] h-[11px] rounded-full bg-[#ff5f57]" />
              <div className="w-[11px] h-[11px] rounded-full bg-[#febc2e]" />
              <div className="w-[11px] h-[11px] rounded-full bg-[#28c840]" />
            </div>
            <div className="flex-1 flex justify-center">
              <div className={`px-5 py-[3px] ${t.addressBg} rounded-md text-[11px] ${t.addressText} font-mono tracking-wide`}>
                pbi-design-moodboard.app
              </div>
            </div>
            <div className="w-[52px]" /> {/* spacer to center address bar */}
          </div>

          {/* ── App Chrome (toolbar) ─────────────────────────── */}
          <div className={`flex items-center gap-3 px-4 py-2 ${t.browserToolbar} border-b ${t.borderLight}`}>
            <div className="w-7 h-7 rounded-lg bg-[#0078D4] flex items-center justify-center flex-shrink-0">
              <svg width="14" height="14" viewBox="0 0 20 20" fill="none">
                <rect x="2" y="11" width="4" height="7" rx="1" fill="#F2C811" />
                <rect x="8" y="7" width="4" height="11" rx="1" fill="white" />
                <rect x="14" y="3" width="4" height="15" rx="1" fill="white" opacity="0.7" />
              </svg>
            </div>
            <div className={`h-2.5 w-28 ${t.skeletonDark} rounded`} />
            <div className="ml-auto flex gap-1.5">
              {['Palette', 'Design', 'Preview', 'Export'].map((label, i) => (
                <div
                  key={label}
                  className={`px-2.5 py-1 rounded-md text-[9px] font-medium ${t.toolbarLabel(i)}`}
                >
                  {label}
                </div>
              ))}
            </div>
          </div>

          {/* ── Main Content Area ────────────────────────────── */}
          <div className="flex" style={{ minHeight: 340 }}>
            {/* Canvas */}
            <div className={`flex-1 relative overflow-hidden ${t.canvasBg}`}>
              {/* Dot grid */}
              <div
                className={`absolute inset-0 ${t.dotOpacity}`}
                style={{
                  backgroundImage: 'radial-gradient(circle,#fff 1px,transparent 1px)',
                  backgroundSize: '20px 20px',
                }}
              />

              {/* ---- Card 1: Bar Chart ---- */}
              <motion.div
                initial={{ opacity: 0, x: -24, y: 12 }}
                animate={{ opacity: 1, x: 0, y: 0 }}
                transition={{ delay: 0.7, duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
                className={`absolute top-4 left-4 w-[210px] rounded-xl border ${t.mockBorder} ${t.mockCardBg} shadow-xl overflow-hidden`}
              >
                <div className="h-[105px] bg-gradient-to-br from-[#0078D4]/20 via-transparent to-transparent flex items-end justify-center gap-[6px] px-4 pb-3">
                  {barHeights.map((h, i) => (
                    <motion.div
                      key={i}
                      initial={{ height: 0 }}
                      animate={{ height: h }}
                      transition={{ delay: 1.0 + i * 0.08, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                      className="w-[18px] rounded-t-[3px]"
                      style={{ backgroundColor: barColors[i] }}
                    />
                  ))}
                </div>
                <div className="px-3 py-2.5 space-y-1.5">
                  <div className={`h-[7px] w-24 rounded ${t.skeletonDark}`} />
                  <div className={`h-[7px] w-16 rounded ${t.skeletonLight}`} />
                </div>
              </motion.div>

              {/* ---- Card 2: Donut Chart ---- */}
              <motion.div
                initial={{ opacity: 0, y: 28 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.9, duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
                className={`absolute top-10 left-[235px] w-[175px] rounded-xl border ${t.mockBorder} ${t.mockCardBg} shadow-xl overflow-hidden`}
              >
                <div className="h-[95px] flex items-center justify-center">
                  <svg viewBox="0 0 80 80" className="w-[60px] h-[60px]">
                    <motion.circle
                      cx="40" cy="40" r="32" fill="none" stroke="#0078D4" strokeWidth="9"
                      strokeDasharray="120 82"
                      strokeLinecap="round"
                      initial={{ pathLength: 0 }} animate={{ pathLength: 1 }}
                      transition={{ delay: 1.2, duration: 0.8 }}
                    />
                    <motion.circle
                      cx="40" cy="40" r="32" fill="none" stroke="#F2C811" strokeWidth="9"
                      strokeDasharray="55 147"
                      strokeDashoffset="-120"
                      strokeLinecap="round"
                      initial={{ pathLength: 0 }} animate={{ pathLength: 1 }}
                      transition={{ delay: 1.4, duration: 0.7 }}
                    />
                    <motion.circle
                      cx="40" cy="40" r="32" fill="none" stroke="#28c840" strokeWidth="9"
                      strokeDasharray="27 175"
                      strokeDashoffset="-175"
                      strokeLinecap="round"
                      initial={{ pathLength: 0 }} animate={{ pathLength: 1 }}
                      transition={{ delay: 1.55, duration: 0.6 }}
                    />
                  </svg>
                </div>
                <div className="px-3 py-2.5 space-y-1.5">
                  <div className={`h-[7px] w-20 rounded ${t.skeletonDark}`} />
                  <div className={`h-[7px] w-12 rounded ${t.skeletonLight}`} />
                </div>
              </motion.div>

              {/* ---- Card 3: KPI Card ---- */}
              <motion.div
                initial={{ opacity: 0, x: 24 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 1.05, duration: 0.65 }}
                className={`absolute bottom-4 right-4 w-[155px] rounded-xl border ${t.mockBorder} ${t.mockCardBg} p-3.5 shadow-xl`}
              >
                <div className={`text-[9px] ${t.kpiLabel} font-medium tracking-wide uppercase mb-0.5`}>Total Revenue</div>
                <div className={`text-[22px] font-extrabold ${t.kpiValue} leading-tight`}>$2.4M</div>
                <div className="flex items-center gap-1 mt-1.5">
                  <TrendingUp size={10} className="text-[#28c840]" />
                  <span className="text-[10px] font-semibold text-[#28c840]">+12.5%</span>
                  <span className={`text-[9px] ${t.kpiSubtext} ml-0.5`}>vs prev.</span>
                </div>
              </motion.div>

              {/* ---- Card 4: Line Sparkline ---- */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.2, duration: 0.6 }}
                className={`absolute bottom-4 left-4 w-[200px] rounded-xl border ${t.mockBorder} ${t.mockCardBg} p-3 shadow-xl`}
              >
                <div className={`text-[9px] ${t.kpiLabel} font-medium tracking-wide uppercase mb-2`}>Monthly Trend</div>
                <svg viewBox="0 0 180 40" className="w-full h-[36px]">
                  <defs>
                    <linearGradient id="sparkGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#0078D4" stopOpacity="0.3" />
                      <stop offset="100%" stopColor="#0078D4" stopOpacity="0" />
                    </linearGradient>
                  </defs>
                  <motion.path
                    d="M0,30 Q20,28 35,22 T70,18 T105,10 T140,14 T180,5"
                    fill="none" stroke="#0078D4" strokeWidth="2" strokeLinecap="round"
                    initial={{ pathLength: 0 }} animate={{ pathLength: 1 }}
                    transition={{ delay: 1.5, duration: 1 }}
                  />
                  <path
                    d="M0,30 Q20,28 35,22 T70,18 T105,10 T140,14 T180,5 V40 H0 Z"
                    fill="url(#sparkGrad)" opacity="0.5"
                  />
                </svg>
              </motion.div>

              {/* ---- Floating Palette Swatches ---- */}
              <motion.div
                initial={{ opacity: 0, scale: 0.85 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 1.3, duration: 0.55 }}
                className="absolute bottom-[72px] left-[230px] flex gap-[6px]"
              >
                {paletteColors.map((c, i) => (
                  <motion.div
                    key={c}
                    initial={{ scale: 0, rotate: -45 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ delay: 1.4 + i * 0.07, type: 'spring', stiffness: 320, damping: 14 }}
                    className={`w-8 h-8 rounded-lg border-2 ${t.swatchBorder} shadow-md`}
                    style={{ backgroundColor: c }}
                  />
                ))}
              </motion.div>
            </div>

            {/* ── Right Side-Panel Mock ──────────────────────── */}
            <div className={`w-[170px] ${t.panelBg} border-l ${t.borderLight} p-3 space-y-3 hidden sm:flex flex-col`}>
              <div className={`text-[9px] ${t.panelLabel} font-semibold tracking-widest uppercase`}>Color Palette</div>
              <div className="space-y-[10px]">
                {panelColors.map(({ hex, label }) => (
                  <motion.div
                    key={hex}
                    initial={{ opacity: 0, x: 12 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 1.6, duration: 0.4 }}
                    className="flex items-center gap-2.5"
                  >
                    <div className={`w-[18px] h-[18px] rounded-[5px] border ${t.panelBorderColor} flex-shrink-0`} style={{ backgroundColor: hex }} />
                    <div>
                      <div className={`text-[9px] ${t.panelColor} font-medium leading-none`}>{label}</div>
                      <div className={`text-[8px] ${t.panelHex} font-mono leading-tight mt-[2px]`}>{hex}</div>
                    </div>
                  </motion.div>
                ))}
              </div>

              <div className={`h-px ${t.panelDivider} my-1`} />

              <div className={`text-[9px] ${t.panelLabel} font-semibold tracking-widest uppercase`}>Fonts</div>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.8, duration: 0.4 }}
              >
                <div className={`text-[11px] ${t.panelFont} font-semibold`}>Segoe UI Semibold</div>
                <div className={`text-[9px] ${t.panelFontSub} mt-[2px]`}>Segoe UI &middot; Body</div>
              </motion.div>

              <div className={`h-px ${t.panelDivider} my-1`} />

              <div className={`text-[9px] ${t.panelLabel} font-semibold tracking-widest uppercase`}>Sentinels</div>
              <div className="flex gap-[6px] mt-1">
                {[
                  { c: '#107C10', l: 'Good' },
                  { c: '#F2C811', l: 'Neutral' },
                  { c: '#D83B01', l: 'Bad' },
                ].map(({ c, l }) => (
                  <div key={c} className="flex flex-col items-center gap-1">
                    <div className={`w-4 h-4 rounded-full border ${t.panelBorderColor}`} style={{ backgroundColor: c }} />
                    <span className={`text-[7px] ${t.panelSentLabel}`}>{l}</span>
                  </div>
                ))}
              </div>

              {/* Export button mock */}
              <div className="mt-auto">
                <div className={`w-full py-2 rounded-lg ${t.exportBg} text-center text-[9px] font-bold ${t.exportText} tracking-wide`}>
                  EXPORT THEME
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Reflection / surface shadow */}
        <div className={`absolute -bottom-8 inset-x-8 h-16 bg-gradient-to-b ${t.reflectionFrom} to-transparent rounded-full blur-2xl`} />
      </motion.div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════
   STEP CARD (How It Works)
   ═══════════════════════════════════════════════════════════════════════ */
function StepCard({ step, title, description, icon: Icon, delay, t }) {
  return (
    <Reveal delay={delay}>
      <div className="group relative h-full">
        <div className={`absolute -inset-px rounded-2xl bg-gradient-to-b ${t.hoverGradient} to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />
        <div className={`relative h-full ${t.cardBg} border ${t.cardBorder} rounded-2xl p-6 transition-all duration-500 ${t.cardHoverBorder} ${t.cardHoverBg}`}>
          <div className="flex items-center gap-4 mb-5">
            <div className="w-11 h-11 rounded-xl bg-[#0078D4]/[0.12] flex items-center justify-center text-[#4da8ff]">
              <Icon size={20} strokeWidth={1.8} />
            </div>
            <span className={`text-xs font-bold ${t.stepNum} font-mono`}>0{step}</span>
          </div>
          <h3 className={`text-[17px] font-bold ${t.heading} mb-2 leading-snug`}>{title}</h3>
          <p className={`text-[13px] ${t.body} leading-relaxed`}>{description}</p>
        </div>
      </div>
    </Reveal>
  );
}

/* ═══════════════════════════════════════════════════════════════════════
   FEATURE CARD
   ═══════════════════════════════════════════════════════════════════════ */
function FeatureCard({ title, description, icon: Icon, accentBg, accentText, delay, t }) {
  return (
    <Reveal delay={delay}>
      <div className="group relative h-full">
        <div className={`absolute -inset-px rounded-2xl bg-gradient-to-b ${t.hoverGradientFeature} to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />
        <div className={`relative h-full ${t.featureCardBg} border ${t.cardBorder} rounded-2xl p-7 transition-all duration-500 ${t.cardHoverBorder} hover:-translate-y-1`}>
          <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-5 ${accentBg} ${accentText}`}>
            <Icon size={22} strokeWidth={1.8} />
          </div>
          <h3 className={`text-lg font-bold ${t.heading} mb-2`}>{title}</h3>
          <p className={`text-[13px] ${t.body} leading-relaxed`}>{description}</p>
        </div>
      </div>
    </Reveal>
  );
}

/* ═══════════════════════════════════════════════════════════════════════
   COMPARISON CELL ICONS
   ═══════════════════════════════════════════════════════════════════════ */
function CellYes() {
  return (
    <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-[#28c840]/10">
      <Check size={14} className="text-[#28c840]" strokeWidth={2.5} />
    </span>
  );
}
function CellNo({ t }) {
  return (
    <span className={`inline-flex items-center justify-center w-6 h-6 rounded-full ${t.cellNoBg}`}>
      <X size={14} className={t.cellNoText} strokeWidth={2.5} />
    </span>
  );
}
function CellPartial() {
  return (
    <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-[#F2C811]/10">
      <Minus size={14} className="text-[#F2C811]" strokeWidth={2.5} />
    </span>
  );
}

/* ═══════════════════════════════════════════════════════════════════════
   SECTION HEADING
   ═══════════════════════════════════════════════════════════════════════ */
function SectionHeading({ badge, title, highlight, description, t }) {
  return (
    <Reveal className="text-center mb-16 max-w-2xl mx-auto">
      <p className="text-xs font-bold tracking-[0.2em] uppercase text-[#0078D4] mb-4">{badge}</p>
      <h2 className={`text-3xl md:text-[42px] font-extrabold leading-[1.15] tracking-tight ${t.heading}`}>
        {title}{' '}
        <span className="bg-gradient-to-r from-[#0078D4] via-[#4da8ff] to-[#F2C811] bg-clip-text text-transparent">
          {highlight}
        </span>
      </h2>
      {description && <p className={`mt-5 text-[15px] ${t.body} leading-relaxed`}>{description}</p>}
    </Reveal>
  );
}

/* ═══════════════════════════════════════════════════════════════════════
   MAIN LANDING PAGE COMPONENT
   ═══════════════════════════════════════════════════════════════════════ */
export default function LandingPage({ onEnterApp }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { scrollYProgress } = useScroll();
  const navOpacity = useTransform(scrollYProgress, [0, 0.03], [0, 1]);
  const t = useTokens();

  const scrollTo = (id) => {
    setMobileMenuOpen(false);
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  };

  /* ─── Comparison data ─────────────────────────────────────────── */
  const No = (props) => <CellNo t={t} {...props} />;
  const comparisonRows = [
    ['Free to use',                  CellYes, No,          CellYes,     CellYes],
    ['Open source',                  CellYes, No,          No,          No],
    ['No signup required',           CellYes, No,          CellYes,     CellYes],
    ['Browser-based (zero install)', CellYes, CellYes,     CellYes,     No],
    ['AI-powered design assist',     CellYes, CellYes,     No,          No],
    ['Visual moodboard canvas',      CellYes, CellYes,     No,          No],
    ['Color extraction from images', CellYes, CellPartial, No,          No],
    ['Live Power BI preview',        CellYes, CellYes,     CellPartial, No],
    ['JSON theme export',            CellYes, CellYes,     CellYes,     CellYes],
    ['PBIP visual spec export',      CellYes, No,          No,          No],
    ['Conditional formatting rules', CellYes, No,          No,          CellYes],
    ['Unlimited projects',           CellYes, No,          CellYes,     CellYes],
  ];

  return (
    <div className={`min-h-screen ${t.pageBg} ${t.pageText} ${t.selection} transition-colors duration-300`}>

      {/* ═══════════ NAVIGATION ═══════════════════════════════════ */}
      <motion.nav
        className={`fixed top-0 inset-x-0 z-50 border-b ${t.navBorder}`}
      >
        {/* Blur backdrop that fades in on scroll */}
        <motion.div
          style={{ opacity: navOpacity }}
          className={`absolute inset-0 ${t.navBg} backdrop-blur-2xl`}
        />

        <div className="relative max-w-7xl mx-auto px-6 h-[64px] flex items-center justify-between">
          {/* Logo */}
          <button
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="flex items-center gap-2.5 group"
          >
            <div className="w-9 h-9 rounded-xl bg-[#0078D4] flex items-center justify-center flex-shrink-0 transition-transform duration-300 group-hover:scale-105">
              <svg width="18" height="18" viewBox="0 0 20 20" fill="none">
                <rect x="2" y="11" width="4" height="7" rx="1" fill="#F2C811" />
                <rect x="8" y="7" width="4" height="11" rx="1" fill="white" />
                <rect x="14" y="3" width="4" height="15" rx="1" fill="white" opacity="0.7" />
              </svg>
            </div>
            <span className={`font-bold text-[14px] ${t.brandText} hidden sm:block`}>PBI Design Moodboard</span>
          </button>

          {/* Desktop links */}
          <div className="hidden md:flex items-center gap-1">
            {[
              { id: 'features', label: 'Features' },
              { id: 'how-it-works', label: 'How It Works' },
              { id: 'compare', label: 'Compare' },
            ].map(({ id, label }) => (
              <button
                key={id}
                onClick={() => scrollTo(id)}
                className={`px-4 py-2 text-[13px] ${t.navLink} rounded-lg transition-all duration-200`}
              >
                {label}
              </button>
            ))}
          </div>

          {/* Right: theme toggle + CTA + mobile hamburger */}
          <div className="flex items-center gap-3">
            <button
              onClick={t.toggleTheme}
              className={`p-2 rounded-lg ${t.navLink} transition-colors duration-200`}
              aria-label="Toggle theme"
            >
              {t.isDark ? <Sun size={18} /> : <Moon size={18} />}
            </button>
            <button
              onClick={onEnterApp}
              className={`hidden sm:inline-flex items-center gap-2 px-5 py-2 text-[13px] font-semibold text-white bg-[#0078D4] hover:bg-[#005a9e] rounded-full transition-all duration-300 ${t.ctaGlowSmall}`}
            >
              Open Canvas
              <ArrowRight size={14} strokeWidth={2.5} />
            </button>

            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className={`md:hidden p-2 ${t.navMobileLink} transition-colors`}
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <XClose size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>

        {/* Mobile menu dropdown */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
              className={`relative md:hidden overflow-hidden border-t ${t.navBorder} ${t.navMobileBg} backdrop-blur-2xl`}
            >
              <div className="px-6 py-5 flex flex-col gap-1">
                {['features', 'how-it-works', 'compare'].map((id) => (
                  <button
                    key={id}
                    onClick={() => scrollTo(id)}
                    className={`text-left text-[14px] ${t.navMobileLink} py-2.5 capitalize transition-colors`}
                  >
                    {id.replace(/-/g, ' ')}
                  </button>
                ))}
                <button
                  onClick={onEnterApp}
                  className="mt-3 flex items-center justify-center gap-2 px-5 py-2.5 bg-[#0078D4] text-white text-sm font-semibold rounded-full"
                >
                  Open Canvas <ArrowRight size={14} />
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.nav>

      {/* ═══════════ HERO ════════════════════════════════════════ */}
      <section className="relative pt-28 pb-12 md:pt-36 md:pb-20 px-6">
        {/* Background radials */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-[-200px] left-1/2 -translate-x-1/2 w-[900px] h-[600px] rounded-full bg-[radial-gradient(ellipse,rgba(0,120,212,0.07),transparent_70%)]" />
          <div className="absolute top-[100px] right-[-100px] w-[500px] h-[500px] rounded-full bg-[radial-gradient(ellipse,rgba(242,200,17,0.04),transparent_70%)]" />
        </div>

        <div className="relative max-w-7xl mx-auto">
          {/* Text block */}
          <div className="text-center max-w-[680px] mx-auto mb-14 md:mb-20">
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.55 }}
            >
              <span className="inline-flex items-center gap-2 px-4 py-1.5 text-[11px] font-semibold tracking-wide uppercase text-[#0078D4] bg-[#0078D4]/[0.08] border border-[#0078D4]/[0.15] rounded-full mb-7">
                <Sparkles size={12} strokeWidth={2} />
                Free &amp; Open Source
              </span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.08 }}
              className="text-[36px] sm:text-[48px] md:text-[60px] font-extrabold leading-[1.08] tracking-[-0.02em] mb-6"
            >
              Your Power BI{' '}
              <span className="bg-gradient-to-r from-[#0078D4] via-[#4da8ff] to-[#F2C811] bg-clip-text text-transparent">
                Design System
              </span>
              ,{' '}
              <br className="hidden md:block" />
              In&nbsp;Minutes
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.16 }}
              className={`text-[16px] sm:text-[18px] ${t.body} max-w-[540px] mx-auto mb-9 leading-[1.7]`}
            >
              Upload inspiration screenshots, extract color palettes,
              configure typography, and export production&#8209;ready
              Power&nbsp;BI themes &mdash; all in your browser, with AI&nbsp;assistance.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.24 }}
              className="flex flex-col sm:flex-row items-center justify-center gap-4"
            >
              <button
                onClick={onEnterApp}
                className={`group relative inline-flex items-center gap-2.5 px-8 py-[14px] text-[15px] font-bold text-white bg-[#0078D4] rounded-full transition-all duration-300 hover:bg-[#005a9e] ${t.ctaGlowMed} hover:-translate-y-[2px] overflow-hidden`}
              >
                <span className="relative z-10 flex items-center gap-2.5">
                  Start Designing
                  <ArrowRight size={18} strokeWidth={2.5} className="transition-transform group-hover:translate-x-1" />
                </span>
                {/* Shimmer sweep */}
                <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/[0.12] to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700 ease-in-out" />
              </button>

              <button
                onClick={() => scrollTo('how-it-works')}
                className={`inline-flex items-center gap-2 px-5 py-[14px] text-[14px] ${t.body} font-medium transition-colors duration-200`}
              >
                See how it works
                <ChevronDown size={16} />
              </button>
            </motion.div>
          </div>

          {/* App illustration */}
          <HeroIllustration t={t} />
        </div>
      </section>

      {/* ═══════════ LOGOS / SOCIAL PROOF STRIP ═══════════════════ */}
      <section className={`py-12 px-6 border-y ${t.stripBorder}`}>
        <div className={`max-w-3xl mx-auto flex flex-wrap items-center justify-center gap-x-10 gap-y-4 ${t.stripText} text-[13px] font-medium`}>
          <span className="flex items-center gap-2"><Layers size={16} /> Power BI Themes</span>
          <span className="flex items-center gap-2"><Zap size={16} /> Gemini AI</span>
          <span className="flex items-center gap-2"><Palette size={16} /> Color Science</span>
          <span className="flex items-center gap-2"><MousePointerClick size={16} /> Drag &amp; Drop</span>
          <span className="flex items-center gap-2"><Code2 size={16} /> PBIP Export</span>
        </div>
      </section>

      {/* ═══════════ HOW IT WORKS ════════════════════════════════ */}
      <section id="how-it-works" className="py-24 md:py-32 px-6">
        <div className="max-w-7xl mx-auto">
          <SectionHeading
            badge="How It Works"
            title="From Inspiration to"
            highlight="Production Theme"
            description="Four simple steps to create a consistent, polished Power BI design system."
            t={t}
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            <StepCard
              step={1}
              title="Upload Screenshots"
              description="Drag in your favorite dashboards, branding assets, or UI references as visual inspiration."
              icon={Image}
              delay={0}
              t={t}
            />
            <StepCard
              step={2}
              title="Extract & Refine Colors"
              description="Automatically pull dominant colors from screenshots, then fine-tune your palette with precision."
              icon={Palette}
              delay={0.08}
              t={t}
            />
            <StepCard
              step={3}
              title="Configure Typography"
              description="Pick fonts and sizes, then preview how your choices render on real Power BI chart elements."
              icon={Type}
              delay={0.16}
              t={t}
            />
            <StepCard
              step={4}
              title="Export Your Theme"
              description="Download a production-ready JSON theme, PBIP visual specs, or design tokens in one click."
              icon={Download}
              delay={0.24}
              t={t}
            />
          </div>
        </div>
      </section>

      {/* ═══════════ FEATURES ════════════════════════════════════ */}
      <section id="features" className="relative py-24 md:py-32 px-6">
        {/* Subtle mid-section glow */}
        <div className={`absolute inset-0 bg-gradient-to-b from-transparent ${t.sectionGlow} to-transparent pointer-events-none`} />

        <div className="relative max-w-7xl mx-auto">
          <SectionHeading
            badge="Features"
            title="Everything You Need for"
            highlight="Beautiful Reports"
            t={t}
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            <FeatureCard
              title="AI-Powered Mockups"
              description="Leverage Google Gemini to generate visual ideas, suggest palettes, and refine your design choices with conversational AI."
              icon={Sparkles}
              accentBg="bg-[#a855f7]/[0.12]"
              accentText="text-[#c084fc]"
              delay={0}
              t={t}
            />
            <FeatureCard
              title="Smart Color Extraction"
              description="Drop any screenshot and instantly extract a harmonious color palette, complete with automatic accessibility contrast checks."
              icon={Palette}
              accentBg="bg-[#0078D4]/[0.12]"
              accentText="text-[#4da8ff]"
              delay={0.08}
              t={t}
            />
            <FeatureCard
              title="Live Power BI Preview"
              description="See your design system applied to realistic bar, line, and KPI chart mockups in real time as you iterate on colors and fonts."
              icon={Eye}
              accentBg="bg-[#28c840]/[0.12]"
              accentText="text-[#4ade80]"
              delay={0.16}
              t={t}
            />
            <FeatureCard
              title="One-Click Export"
              description="Export Power BI JSON themes, PBIP visual specifications, or design token files -- ready to hand off to your team."
              icon={Code2}
              accentBg="bg-[#F2C811]/[0.12]"
              accentText="text-[#F2C811]"
              delay={0.24}
              t={t}
            />
          </div>
        </div>
      </section>

      {/* ═══════════ COMPARISON TABLE ════════════════════════════ */}
      <section id="compare" className="py-24 md:py-32 px-6">
        <div className="max-w-5xl mx-auto">
          <SectionHeading
            badge="Compare"
            title="See How We"
            highlight="Stack Up"
            description="PBI Design Moodboard vs. the most popular Power BI theming tools on the market."
            t={t}
          />

          <Reveal delay={0.05}>
            <div className={`rounded-2xl border ${t.borderMed} ${t.tableBg} overflow-hidden ${t.tableShadow}`}>
              <div className="overflow-x-auto">
                <table className="w-full text-[13px] min-w-[640px]">
                  <thead>
                    <tr className={`border-b ${t.borderMed}`}>
                      <th className={`text-left py-4 px-5 ${t.tableHeaderText} font-semibold text-[12px] tracking-wide uppercase w-[36%]`}>
                        Feature
                      </th>
                      <th className="py-4 px-3 text-center">
                        <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#0078D4]/[0.1] border border-[#0078D4]/20">
                          <span className="w-[18px] h-[18px] rounded-[5px] bg-[#0078D4] flex items-center justify-center flex-shrink-0">
                            <svg width="10" height="10" viewBox="0 0 20 20" fill="none">
                              <rect x="2" y="11" width="4" height="7" rx="1" fill="#F2C811" />
                              <rect x="8" y="7" width="4" height="11" rx="1" fill="white" />
                              <rect x="14" y="3" width="4" height="15" rx="1" fill="white" opacity="0.7" />
                            </svg>
                          </span>
                          <span className="text-[11px] font-bold text-[#4da8ff]">Ours</span>
                        </span>
                      </th>
                      <th className={`py-4 px-3 text-center ${t.tableHeaderText} font-semibold text-[11px] tracking-wide`}>Mokkup.ai</th>
                      <th className={`py-4 px-3 text-center ${t.tableHeaderText} font-semibold text-[11px] tracking-wide`}>Theme Gen</th>
                      <th className={`py-4 px-3 text-center ${t.tableHeaderText} font-semibold text-[11px] tracking-wide`}>Manual</th>
                    </tr>
                  </thead>
                  <tbody>
                    {comparisonRows.map(([feature, ...Cells], i) => (
                      <tr
                        key={i}
                        className={`border-b ${t.tableBorder} transition-colors ${t.tableRowHover} ${
                          i % 2 === 0 ? t.tableRowAlt : ''
                        }`}
                      >
                        <td className={`py-3 px-5 ${t.tableFeatureText}`}>{feature}</td>
                        {Cells.map((Cell, j) => (
                          <td key={j} className="py-3 px-3 text-center">
                            <Cell />
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ═══════════ FINAL CTA ══════════════════════════════════ */}
      <section className="relative py-28 md:py-36 px-6">
        {/* Big ambient glow */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute bottom-[-80px] left-1/2 -translate-x-1/2 w-[700px] h-[350px] rounded-full bg-[radial-gradient(ellipse,rgba(0,120,212,0.1),transparent_70%)] blur-2xl" />
        </div>

        <Reveal className="relative max-w-[600px] mx-auto text-center">
          <h2 className="text-[34px] md:text-[52px] font-extrabold leading-[1.1] tracking-[-0.02em] mb-5">
            Ready to{' '}
            <span className="bg-gradient-to-r from-[#0078D4] to-[#F2C811] bg-clip-text text-transparent">
              Design
            </span>
            ?
          </h2>
          <p className={`text-[16px] ${t.body} leading-relaxed mb-9 max-w-md mx-auto`}>
            Start building your Power BI design system right now.
            No account needed. No downloads. No cost.
          </p>
          <button
            onClick={onEnterApp}
            className={`group relative inline-flex items-center gap-2.5 px-10 py-4 text-[16px] font-bold text-white bg-[#0078D4] rounded-full transition-all duration-300 hover:bg-[#005a9e] ${t.ctaGlowLg} hover:-translate-y-[2px]`}
          >
            Open the Canvas
            <ArrowRight size={20} strokeWidth={2.5} className="transition-transform group-hover:translate-x-1" />
          </button>
          <p className={`mt-7 text-[12px] ${t.faint} tracking-wide`}>
            100% free &middot; No signup &middot; Runs entirely in your browser
          </p>
        </Reveal>
      </section>

      {/* ═══════════ FOOTER ═════════════════════════════════════ */}
      <footer className={`border-t ${t.borderLight} py-8 px-6`}>
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-5">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-[#0078D4] flex items-center justify-center flex-shrink-0">
              <svg width="14" height="14" viewBox="0 0 20 20" fill="none">
                <rect x="2" y="11" width="4" height="7" rx="1" fill="#F2C811" />
                <rect x="8" y="7" width="4" height="11" rx="1" fill="white" />
                <rect x="14" y="3" width="4" height="15" rx="1" fill="white" opacity="0.7" />
              </svg>
            </div>
            <span className={`text-[13px] ${t.footerText} font-medium`}>PBI Design Moodboard</span>
          </div>

          <div className={`flex items-center gap-6 text-[12px] ${t.faint}`}>
            <span>Built with React, Tailwind CSS &amp; Framer Motion</span>
            <a
              href="https://github.com"
              target="_blank"
              rel="noopener noreferrer"
              className={`inline-flex items-center gap-1.5 ${t.footerLink} transition-colors duration-200`}
            >
              <Github size={14} />
              GitHub
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
