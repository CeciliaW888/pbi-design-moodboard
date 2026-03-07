import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, Bookmark, BookmarkCheck, Eye, Code, 
  Sparkles, ExternalLink, X, Layout, Palette, 
  Zap, Heart
} from 'lucide-react';
import { saveDesignPattern, getUserSavedPatterns, removeDesignPattern } from '../firebase';

// Pattern data (extracted from standalone app)
const PATTERNS = [
  {
    id: 'bento-grid',
    category: 'layout',
    name: 'Bento Grid',
    nameCn: '便当盒布局',
    description: 'Modular grid with varied card sizes arranged like a Japanese bento box',
    details: 'Dividing content into rounded-corner blocks of varying sizes. Creates visual hierarchy through size contrast while maintaining organization.',
    prompt: '使用 Bento Grid 布局，卡片大小要有对比，保持统一的圆角和间距。',
    examples: ['Apple Watch Ultra', 'Framer showcases', 'Pinterest boards'],
    specs: ['Varied card sizes (2:1 ratio minimum)', 'Consistent rounded corners', 'Uniform spacing (16px typical)', 'High information density']
  },
  {
    id: 'masonry-layout',
    category: 'layout',
    name: 'Masonry Layout',
    nameCn: '瀑布流布局',
    description: 'Waterfall-style staggered columns with varying heights',
    details: 'Images and content arranged in columns with different heights, creating a flowing, organic layout pattern.',
    prompt: '图片展示区域使用 Masonry Layout，不要留有大片空白，列数随屏幕宽度自适应。',
    examples: ['Pinterest', 'Unsplash', 'Design portfolios'],
    specs: ['Variable item heights', 'Fixed column widths', 'Minimal vertical gaps', 'Responsive column count']
  },
  {
    id: 'sticky-sidebar',
    category: 'layout',
    name: 'Sticky Sidebar',
    nameCn: '粘性侧边栏',
    description: 'Navigation that stays fixed while content scrolls',
    details: 'Element remains visible in viewport during scroll, commonly used for navigation, table of contents, or persistent controls.',
    prompt: '左侧导航栏设置为 Sticky Sidebar，当主内容滚动时，它要固定在视窗内。',
    examples: ['Notion sidebar', 'CSS-Tricks navigation', 'Documentation sites'],
    specs: ['position: sticky CSS', 'Stays within viewport', 'Smooth scroll behavior', 'Clear visual anchoring']
  },
  {
    id: 'magazine-layout',
    category: 'layout',
    name: 'Magazine Layout',
    nameCn: '杂志式布局',
    description: 'Editorial-style layout with asymmetric grids and overlapping elements',
    details: 'Print magazine-inspired design emphasizing typographic hierarchy, image interweaving, and generous whitespace.',
    prompt: '页面采用杂志式布局，大标题与图片交错排布，强调排版层级与留白，避免平均分布。',
    examples: ['The Gentlewoman', 'Awwwards winners', 'Editorial sites'],
    specs: ['Asymmetric grid', 'Overlapping elements', 'Large typography', 'Editorial whitespace']
  },
  {
    id: 'split-screen',
    category: 'layout',
    name: 'Split-Screen',
    nameCn: '分屏结构',
    description: 'Page divided into distinct left/right or top/bottom sections',
    details: 'Common ratios: 50/50 or 30/70. Often used for text/product showcases or comparison layouts.',
    prompt: '使用分屏结构，左侧文字右侧产品界面展示，保持强对比与明确焦点。',
    examples: ['Dropbox homepage', 'Intercom site', 'SaaS product pages'],
    specs: ['50/50 or 30/70 ratios', 'Strong color contrast', 'Clear focal points', 'Vertical or horizontal split']
  },
  {
    id: 'fixed-blur-header',
    category: 'layout',
    name: 'Fixed Blur Header',
    nameCn: '固定模糊头部',
    description: 'Sticky navigation with backdrop-filter blur',
    details: 'position: fixed header with backdrop-filter: blur(20px) and semi-transparent background. Stays readable over any content.',
    prompt: '顶部导航使用 fixed 定位 + backdrop-filter: blur(20px) 实现模糊效果。',
    examples: ['Zexi.com', 'iOS Safari', 'Modern web apps'],
    specs: ['position: fixed', 'backdrop-filter: blur(20px)', 'rgba background (0.8 opacity)', 'z-index: 100']
  },
  {
    id: 'glassmorphism',
    category: 'visual',
    name: 'Glassmorphism',
    nameCn: '玻璃拟态',
    description: 'Frosted glass effect with blur, transparency, and subtle borders',
    details: 'Combines semi-transparency, background blur, and border highlights to create depth and hierarchy.',
    prompt: '背景使用 Glassmorphism，12px 高斯模糊 + 15% 白色透明层，加上半透明边框模拟玻璃边缘反光。',
    examples: ['macOS UI', 'Windows 11', 'Stripe cards'],
    specs: ['12px Gaussian blur', '15% white transparency', '1px semi-transparent border', 'backdrop-filter CSS']
  },
  {
    id: 'neumorphism',
    category: 'visual',
    name: 'Neumorphism',
    nameCn: '新态拟物',
    description: 'Soft, embossed UI with same-color shadows',
    details: 'Creates pressed/extruded feel through subtle shadows on same-tone backgrounds. Minimalist aesthetic.',
    prompt: '使用 Neumorphism 风格，背景色与元素一致，双重内阴影实现挤压感，点击时反转阴影提供触觉反馈。',
    examples: ['UI8 designs', 'Dribbble trends', 'Minimalist apps'],
    specs: ['Same-color palette', 'Dual inner shadows', 'Low contrast', 'Soft, subtle depth']
  },
  {
    id: 'claymorphism',
    category: 'visual',
    name: 'Claymorphism',
    nameCn: '黏土拟态',
    description: 'Clay-like inflated 3D style with large rounded corners',
    details: 'Playful, friendly aesthetic with puffy appearance. Often paired with 3D illustrations.',
    prompt: '卡片使用 Claymorphism，大圆角 + 双重内阴影营造膨胀质感，悬停时向上浮起并带弹簧震荡效果。',
    examples: ['Playful brand sites', '3D illustration sites', 'Creative portfolios'],
    specs: ['Large border-radius (24px+)', 'Double inner shadow', 'Inflated appearance', 'Spring-bounce interactions']
  },
  {
    id: 'aurora-gradient',
    category: 'visual',
    name: 'Aurora Gradient',
    nameCn: '极光渐变',
    description: 'Flowing multi-color gradient with organic movement',
    details: 'Dynamic background gradient that slowly flows, creating depth and premium feel. Not a static two-color gradient!',
    prompt: '背景添加动态的 Aurora Gradient，使用深蓝和紫色，并让它缓慢流动。',
    examples: ['Instagram official site', 'Linear app', 'Modern web3 sites'],
    specs: ['Multi-color halos (3-4 colors)', 'Slow animation (15s+)', 'Deep + vibrant tones', 'Organic movement']
  },
  {
    id: 'minimalism',
    category: 'visual',
    name: 'Minimalism',
    nameCn: '极简风格',
    description: 'Limited colors, abundant whitespace, single focal point',
    details: 'Reduce visual noise to emphasize clarity and focus. Classic Apple-style design approach.',
    prompt: '采用极简风格，限制颜色数量，大量留白，突出单一核心信息。',
    examples: ['Apple', 'Linear', 'Notion'],
    specs: ['2-3 colors maximum', 'Generous whitespace', 'Clear hierarchy', 'One primary message']
  },
  {
    id: 'brutalism',
    category: 'visual',
    name: 'Brutalism',
    nameCn: '野性主义',
    description: 'Raw, bold, anti-refined design with high contrast',
    details: 'Intentionally rough aesthetic that breaks traditional design rules. Bold typography and strong contrasts.',
    prompt: '采用野性主义风格，大字号排版，强烈对比色，避免柔和、渐变和阴影。',
    examples: ['Brutalist Websites', 'Craigslist', 'Experimental portfolios'],
    specs: ['Large bold typography', 'High contrast colors', 'No soft shadows/gradients', 'Raw, unpolished aesthetic']
  },
  {
    id: 'grainy-texture',
    category: 'visual',
    name: 'Grainy Texture',
    nameCn: '噪点纹理',
    description: 'Subtle noise overlay for tactile quality',
    details: 'Fine grain texture added to backgrounds/gradients to enhance visual richness without being obvious.',
    prompt: '背景使用细腻噪点纹理叠加在渐变上，增强质感但不过度明显。',
    examples: ['Webflow Showcase', 'Web3 sites', 'Premium brands'],
    specs: ['Subtle opacity (5-10%)', 'Fine grain pattern', 'Layered on gradients', 'Enhances depth']
  },
  {
    id: 'particle-field',
    category: 'visual',
    name: 'Particle Field',
    nameCn: '粒子场',
    description: 'Animated floating dots/stars creating depth and atmosphere',
    details: 'Background layer with 50-100 small particles (2-3px) that float continuously with different speeds. Creates depth and movement without distraction.',
    prompt: '背景添加粒子场效果，50-100个小白点以不同速度漂浮，营造深度感。',
    examples: ['Zexi.com', 'Space-themed sites', 'Web3 landing pages'],
    specs: ['50-100 particles', '2-3px size', 'Continuous float animation', 'Different speeds for depth', 'Low z-index']
  },
  {
    id: '3d-transforms',
    category: 'visual',
    name: '3D Transforms',
    nameCn: '3D变换',
    description: 'CSS 3D depth effects with shadows, rotation, and perspective',
    details: 'Use transform-style: preserve-3d with rotateX/Y, drop-shadows, and radial gradients to create 3D appearance without actual 3D rendering.',
    prompt: '为元素添加 3D 效果，使用 transform-style: preserve-3d 和 rotateX/Y 创建深度感。',
    examples: ['Zexi.com bow tie', 'Apple product showcases', '3D card flips'],
    specs: ['transform-style: preserve-3d', 'rotateX/Y animations', 'drop-shadow for depth', 'radial gradients']
  },
  {
    id: 'huge-typography',
    category: 'visual',
    name: 'Huge Typography',
    nameCn: '巨大字体',
    description: 'Massive headings (100px+) with accent color highlights',
    details: 'Hero headings at 100-130px with generous line-height. Highlight key words in accent color. Creates strong visual impact.',
    prompt: '使用超大字体（100px+）作为标题，关键词用强调色高亮。',
    examples: ['Zexi.com "Real Values"', 'Stripe', 'Apple launches'],
    specs: ['100-130px font-size', 'clamp() for responsive', 'Highlight key words', 'Generous whitespace']
  },
  {
    id: 'social-sidebar',
    category: 'visual',
    name: 'Social Sidebar',
    nameCn: '社交侧栏',
    description: 'Vertical stack of social icons fixed to screen edge',
    details: 'position: fixed vertical icon stack at right/left edge. Icons in glassmorphism circles with hover effects.',
    prompt: '右侧固定社交图标栏，垂直排列，玻璃拟态圆形按钮。',
    examples: ['Zexi.com', 'Personal portfolios', 'Agency sites'],
    specs: ['position: fixed', 'right: 40px', 'Vertical flex', 'Glassmorphism circles', 'Hover glow']
  },
  {
    id: 'void-background',
    category: 'visual',
    name: 'Void Background',
    nameCn: '虚空背景',
    description: 'Pure black (#000) background creating infinite depth',
    details: 'Not dark gray - pure #000000 black. Combined with particles and glow effects creates spacious void aesthetic.',
    prompt: '使用纯黑色 (#000) 背景，营造无限深度的虚空美学。',
    examples: ['Zexi.com', 'Luxury brands', 'Space themes'],
    specs: ['#000000 (not #111)', 'Particle field overlay', 'Glow effects on elements', 'High contrast text']
  },
  {
    id: 'skeleton-screen',
    category: 'animation',
    name: 'Skeleton Screen',
    nameCn: '骨架屏',
    description: 'Loading placeholder that mimics content structure',
    details: 'Gray placeholders with breathing animation shown before content loads. Improves perceived performance.',
    prompt: '在等待 AI 生成结果时，展示 Skeleton Screen（骨架屏）动画，不要显示空白。',
    examples: ['YouTube loading', 'LinkedIn feeds', 'Notion pages'],
    specs: ['Gray placeholder blocks', 'Breathing animation', 'Matches final layout', 'Reduces perceived wait']
  },
  {
    id: 'parallax-scrolling',
    category: 'animation',
    name: 'Parallax Scrolling',
    nameCn: '视差滚动',
    description: 'Background moves slower than foreground creating 3D depth',
    details: 'Multi-layer scroll where background scrolls at 50% speed of foreground, creating spatial depth effect.',
    prompt: '为背景层添加 Parallax Scrolling 效果，滚动速度设置为前景的 50%。',
    examples: ['Firewatch game site', 'Apple iPhone pages', 'Storytelling sites'],
    specs: ['Background at 50% speed', 'Smooth transition', 'Multi-layer depth', 'Enhances storytelling']
  },
  {
    id: 'infinite-marquee',
    category: 'animation',
    name: 'Infinite Marquee',
    nameCn: '无限跑马灯',
    description: 'Continuously scrolling horizontal loop of content',
    details: 'Logos or text scroll horizontally in infinite loop. Pauses on hover for interaction.',
    prompt: '底部放置一个 Infinite Marquee，循环滚动展示客户 LOGO，鼠标悬停时暂停。',
    examples: ['Figma partner logos', 'Off-White branding', 'Client showcase sections'],
    specs: ['Infinite loop animation', 'Pause on hover', 'Smooth continuous motion', 'Duplicate content for seamless loop']
  },
  {
    id: 'reveal-on-scroll',
    category: 'animation',
    name: 'Reveal on Scroll',
    nameCn: '滚动显现',
    description: 'Elements fade in or float up as you scroll to them',
    details: 'Progressive disclosure where elements appear with animation when scrolled into view.',
    prompt: '滑到哪里，那里的元素才浮出来，带淡入和缓动效果。',
    examples: ['Apple product pages', 'DJI drone site', 'Modern portfolios'],
    specs: ['Fade-in transition', 'Float-up motion', 'Easing function', 'Intersection Observer API']
  },
  {
    id: 'scroll-reveal-staggered',
    category: 'animation',
    name: 'Scroll Reveal (Staggered)',
    nameCn: '分组滚动显现',
    description: 'Cards appear one-by-one with staggered delays when scrolling into view',
    details: 'Uses Intersection Observer API to detect viewport entry, then reveals elements sequentially with 0.1-0.2s delays between each. Creates elegant progressive disclosure.',
    prompt: '使用 Intersection Observer API 实现分组滚动显现，每张卡片依次出现，间隔 0.1-0.2 秒。',
    examples: ['Zexi.com', 'Stripe product pages', 'Linear changelog'],
    specs: ['Intersection Observer', 'Sequential delays (nth-child)', 'opacity: 0 → 1', 'translateY(40px) → 0']
  },
  {
    id: 'scrollytelling',
    category: 'animation',
    name: 'Scrollytelling',
    nameCn: '滚动叙事',
    description: 'Scroll-driven narrative with animated content changes',
    details: 'Content and animations triggered by scroll position to tell a story progressively.',
    prompt: '使用滚动叙事（Scrollytelling），随着用户滚动触发内容动画和视觉变化，讲述品牌故事。',
    examples: ['NYT interactive articles', 'Apple launches', 'Data viz stories'],
    specs: ['Scroll-position-based', 'Chapter markers', 'Progressive narrative', 'Immersive experience']
  }
];

const INSPIRATION_SOURCES = {
  showcases: [
    { name: 'Awwwards', url: 'https://awwwards.com', desc: 'Daily website awards' },
    { name: 'Dribbble', url: 'https://dribbble.com', desc: 'Design community' },
    { name: 'Behance', url: 'https://behance.net', desc: 'Adobe portfolio platform' },
    { name: 'SiteInspire', url: 'https://siteinspire.com', desc: 'Web design gallery' },
    { name: 'Mobbin', url: 'https://mobbin.com', desc: 'Mobile UI patterns' },
    { name: 'Land-book', url: 'https://land-book.com', desc: 'Landing page gallery' }
  ],
  influencers: [
    { name: '@zexi_cn', platform: 'RedNote', desc: 'Web design & dev' },
    { name: '@生活自动挡', platform: 'RedNote', desc: 'Productivity & design' },
    { name: 'Steve Schoger', url: 'https://twitter.com/steveschoger', desc: 'UI tips & design' },
    { name: 'Tobias van Schneider', url: 'https://vanschneider.com', desc: 'Product design' },
    { name: 'Rauno Freiberg', url: 'https://rauno.me', desc: 'Design engineering' }
  ],
  newsletters: [
    { name: 'Sidebar', url: 'https://sidebar.io', desc: '5 daily design links' },
    { name: 'Design Systems News', url: 'https://news.design.systems', desc: 'Design systems updates' },
    { name: 'Frontend Focus', url: 'https://frontendfoc.us', desc: 'Frontend development news' },
    { name: 'UI Sources', url: 'https://uisources.com', desc: 'Weekly design inspiration' }
  ],
  components: [
    { name: 'shadcn/ui', url: 'https://ui.shadcn.com', desc: 'React components' },
    { name: 'Radix UI', url: 'https://radix-ui.com', desc: 'Unstyled primitives' },
    { name: 'Aceternity UI', url: 'https://ui.aceternity.com', desc: 'Modern components' },
    { name: 'Magic UI', url: 'https://magicui.design', desc: 'Animated components' }
  ]
};

export default function DesignVocabulary({ user, workspaceId }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeFilter, setActiveFilter] = useState('all');
  const [selectedPattern, setSelectedPattern] = useState(null);
  const [showCodeModal, setShowCodeModal] = useState(false);
  const [savedPatterns, setSavedPatterns] = useState([]);
  const [activeTab, setActiveTab] = useState('patterns'); // patterns | inspiration
  const [copiedId, setCopiedId] = useState(null);

  // Load saved patterns
  useEffect(() => {
    if (user && workspaceId) {
      getUserSavedPatterns(user.uid, workspaceId).then(setSavedPatterns).catch(console.error);
    }
  }, [user, workspaceId]);

  // Filter patterns
  const filteredPatterns = PATTERNS.filter(p => {
    const matchesFilter = activeFilter === 'all' || p.category === activeFilter;
    const matchesSearch = !searchTerm || 
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.nameCn.includes(searchTerm) ||
      p.description.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const handleToggleSave = async (patternId) => {
    if (!user || !workspaceId) return;
    const isSaved = savedPatterns.includes(patternId);
    try {
      if (isSaved) {
        await removeDesignPattern(user.uid, workspaceId, patternId);
        setSavedPatterns(prev => prev.filter(id => id !== patternId));
      } else {
        await saveDesignPattern(user.uid, workspaceId, patternId);
        setSavedPatterns(prev => [...prev, patternId]);
      }
    } catch (e) {
      console.error('Failed to toggle pattern save:', e);
    }
  };

  const handleCopyPrompt = (id, text) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const getCategoryIcon = (category) => {
    switch(category) {
      case 'layout': return Layout;
      case 'visual': return Palette;
      case 'animation': return Zap;
      default: return Sparkles;
    }
  };

  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-surface">
      {/* Header */}
      <div className="border-b border-surface-lighter px-6 py-4 bg-surface-light">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold text-text flex items-center gap-2">
              <Sparkles className="text-primary" size={28} />
              Design Vocabulary
            </h1>
            <p className="text-sm text-text-muted mt-1">
              Interactive library of 24 design patterns with live demos
            </p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setActiveTab('patterns')}
              className={`px-4 py-2 rounded-lg font-medium text-sm transition-all ${
                activeTab === 'patterns'
                  ? 'bg-primary text-white'
                  : 'bg-surface border border-surface-lighter text-text-muted hover:text-text'
              }`}
            >
              Patterns ({PATTERNS.length})
            </button>
            <button
              onClick={() => setActiveTab('inspiration')}
              className={`px-4 py-2 rounded-lg font-medium text-sm transition-all flex items-center gap-2 ${
                activeTab === 'inspiration'
                  ? 'bg-primary text-white'
                  : 'bg-surface border border-surface-lighter text-text-muted hover:text-text'
              }`}
            >
              <Heart size={16} />
              Inspiration
            </button>
          </div>
        </div>

        {activeTab === 'patterns' && (
          <>
            {/* Search */}
            <div className="mb-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" size={18} />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search patterns, terms, or prompts..."
                  className="w-full pl-10 pr-4 py-2.5 bg-surface border border-surface-lighter rounded-lg text-sm text-text placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                />
              </div>
            </div>

            {/* Filters */}
            <div className="flex gap-2 flex-wrap">
              {[
                { id: 'all', label: 'All Patterns', count: PATTERNS.length },
                { id: 'layout', label: 'Layout', count: PATTERNS.filter(p => p.category === 'layout').length },
                { id: 'visual', label: 'Visual', count: PATTERNS.filter(p => p.category === 'visual').length },
                { id: 'animation', label: 'Animation', count: PATTERNS.filter(p => p.category === 'animation').length }
              ].map(({ id, label, count }) => (
                <button
                  key={id}
                  onClick={() => setActiveFilter(id)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                    activeFilter === id
                      ? 'bg-primary text-white shadow-md'
                      : 'bg-surface border border-surface-lighter text-text-muted hover:text-text hover:border-primary'
                  }`}
                >
                  {label} <span className="opacity-70">({count})</span>
                </button>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        {activeTab === 'patterns' ? (
          <div className="p-6">
            {filteredPatterns.length === 0 ? (
              <div className="text-center py-16">
                <Sparkles className="mx-auto mb-4 text-text-muted" size={48} />
                <h3 className="text-lg font-semibold text-text mb-2">No patterns found</h3>
                <p className="text-sm text-text-muted">Try a different search term or filter</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredPatterns.map((pattern) => {
                  const Icon = getCategoryIcon(pattern.category);
                  const isSaved = savedPatterns.includes(pattern.id);
                  
                  return (
                    <motion.div
                      key={pattern.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="bg-surface-light border border-surface-lighter rounded-2xl p-5 hover:shadow-lg transition-all cursor-pointer group"
                      onClick={() => setSelectedPattern(pattern)}
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className={`flex items-center gap-2 px-2.5 py-1 rounded-lg text-xs font-semibold uppercase tracking-wide ${
                          pattern.category === 'layout' ? 'bg-blue-50 text-blue-600' :
                          pattern.category === 'visual' ? 'bg-pink-50 text-pink-600' :
                          'bg-purple-50 text-purple-600'
                        }`}>
                          <Icon size={12} />
                          {pattern.category}
                        </div>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleToggleSave(pattern.id);
                          }}
                          className="p-1.5 hover:bg-surface rounded-lg transition-colors"
                        >
                          {isSaved ? (
                            <BookmarkCheck size={18} className="text-yellow" />
                          ) : (
                            <Bookmark size={18} className="text-text-muted group-hover:text-yellow" />
                          )}
                        </button>
                      </div>

                      <h3 className="text-lg font-bold text-text mb-1">{pattern.name}</h3>
                      <p className="text-sm text-text-muted mb-3">{pattern.nameCn}</p>
                      <p className="text-sm text-text-muted mb-4 line-clamp-2">{pattern.description}</p>

                      <div className="flex gap-2">
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedPattern(pattern);
                          }}
                          className="flex-1 py-2 bg-primary text-white text-xs font-semibold rounded-lg hover:bg-primary-dark transition-colors flex items-center justify-center gap-1.5"
                        >
                          <Eye size={14} />
                          View Demo
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleCopyPrompt(pattern.id, pattern.prompt);
                          }}
                          className="px-3 py-2 bg-surface border border-surface-lighter text-text-muted hover:text-primary hover:border-primary text-xs font-semibold rounded-lg transition-all"
                        >
                          {copiedId === pattern.id ? <Check size={14} /> : <Code size={14} />}
                        </button>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </div>
        ) : (
          <InspirationTab />
        )}
      </div>

      {/* Pattern Detail Modal */}
      <AnimatePresence>
        {selectedPattern && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-6"
            onClick={() => setSelectedPattern(null)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 50 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 50 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-surface-light rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden shadow-2xl"
            >
              <PatternDetailModal 
                pattern={selectedPattern} 
                onClose={() => setSelectedPattern(null)}
                onCopyPrompt={handleCopyPrompt}
                copiedId={copiedId}
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// Pattern Detail Modal Component
function PatternDetailModal({ pattern, onClose, onCopyPrompt, copiedId }) {
  const [activeDemo, setActiveDemo] = useState('preview'); // preview | code
  const Icon = pattern.category === 'layout' ? Layout : pattern.category === 'visual' ? Palette : Zap;

  return (
    <>
      {/* Header */}
      <div className="border-b border-surface-lighter px-6 py-4 flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <div className={`flex items-center gap-2 px-2.5 py-1 rounded-lg text-xs font-semibold uppercase ${
              pattern.category === 'layout' ? 'bg-blue-50 text-blue-600' :
              pattern.category === 'visual' ? 'bg-pink-50 text-pink-600' :
              'bg-purple-50 text-purple-600'
            }`}>
              <Icon size={14} />
              {pattern.category}
            </div>
          </div>
          <h2 className="text-2xl font-bold text-text">{pattern.name}</h2>
          <p className="text-sm text-text-muted">{pattern.nameCn}</p>
        </div>
        <button
          onClick={onClose}
          className="p-2 hover:bg-surface rounded-lg transition-colors"
        >
          <X size={20} className="text-text-muted" />
        </button>
      </div>

      {/* Content */}
      <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
        {/* Description */}
        <div className="mb-6">
          <h3 className="text-sm font-semibold uppercase tracking-wide text-text-muted mb-2">What it is</h3>
          <p className="text-text leading-relaxed">{pattern.details}</p>
        </div>

        {/* Demo Tabs */}
        <div className="mb-4 flex gap-2">
          <button
            onClick={() => setActiveDemo('preview')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              activeDemo === 'preview'
                ? 'bg-primary text-white'
                : 'bg-surface border border-surface-lighter text-text-muted hover:text-text'
            }`}
          >
            <Eye size={16} className="inline mr-1.5" />
            Live Demo
          </button>
          <button
            onClick={() => setActiveDemo('code')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              activeDemo === 'code'
                ? 'bg-primary text-white'
                : 'bg-surface border border-surface-lighter text-text-muted hover:text-text'
            }`}
          >
            <Code size={16} className="inline mr-1.5" />
            Code Example
          </button>
        </div>

        {/* Demo Area */}
        <div className="bg-surface border border-surface-lighter rounded-xl p-6 mb-6">
          {activeDemo === 'preview' ? (
            <PatternDemo pattern={pattern} />
          ) : (
            <PatternCodeExample pattern={pattern} />
          )}
        </div>

        {/* Technical Specs */}
        <div className="mb-6">
          <h3 className="text-sm font-semibold uppercase tracking-wide text-text-muted mb-3">Technical Specs</h3>
          <ul className="space-y-2">
            {pattern.specs.map((spec, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-text">
                <span className="text-primary mt-1">•</span>
                <span>{spec}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Prompt */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-semibold uppercase tracking-wide text-text-muted">Ready-to-Use Prompt</h3>
            <button
              onClick={() => onCopyPrompt(pattern.id, pattern.prompt)}
              className="px-3 py-1.5 bg-primary text-white text-xs font-medium rounded-lg hover:bg-primary-dark transition-colors flex items-center gap-1.5"
            >
              {copiedId === pattern.id ? (
                <>
                  <Check size={14} />
                  Copied!
                </>
              ) : (
                <>
                  <Code size={14} />
                  Copy Prompt
                </>
              )}
            </button>
          </div>
          <div className="bg-surface-light border border-surface-lighter rounded-lg p-4 font-mono text-sm text-text">
            {pattern.prompt}
          </div>
        </div>

        {/* Examples */}
        <div>
          <h3 className="text-sm font-semibold uppercase tracking-wide text-text-muted mb-3">Real-World Examples</h3>
          <div className="flex flex-wrap gap-2">
            {pattern.examples.map((ex, i) => (
              <span
                key={i}
                className="px-3 py-1.5 bg-blue-50 text-blue-600 text-xs font-medium rounded-lg"
              >
                {ex}
              </span>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}

// Pattern Demo Component (renders live interactive demos)
function PatternDemo({ pattern }) {
  // Import the corresponding demo component
  const DemoComponent = getDemoComponent(pattern.id);
  return (
    <div className="min-h-[300px] flex items-center justify-center">
      {DemoComponent ? <DemoComponent /> : (
        <p className="text-text-muted text-sm">Interactive demo coming soon...</p>
      )}
    </div>
  );
}

// Pattern Code Example Component
function PatternCodeExample({ pattern }) {
  const codeExample = getCodeExample(pattern.id);
  return (
    <pre className="text-xs text-text overflow-x-auto">
      <code>{codeExample}</code>
    </pre>
  );
}

// Helper: Get demo component for pattern
function getDemoComponent(patternId) {
  // We'll create these demo components inline below
  const demos = {
    'bento-grid': BentoGridDemo,
    'masonry-layout': MasonryLayoutDemo,
    'sticky-sidebar': StickySidebarDemo,
    'split-screen': SplitScreenDemo,
    'glassmorphism': GlassmorphismDemo,
    'neumorphism': NeumorphismDemo,
    'claymorphism': ClaymorphismDemo,
    'aurora-gradient': AuroraGradientDemo,
    'minimalism': MinimalismDemo,
    'particle-field': ParticleFieldDemo,
    'skeleton-screen': SkeletonScreenDemo,
    'parallax-scrolling': ParallaxScrollingDemo,
    'infinite-marquee': InfiniteMarqueeDemo,
    'reveal-on-scroll': RevealOnScrollDemo,
  };
  return demos[patternId] || null;
}

// Helper: Get code example for pattern
function getCodeExample(patternId) {
  const examples = {
    'bento-grid': `<div className="grid grid-cols-4 gap-4">
  <div className="col-span-2 row-span-2 rounded-2xl bg-surface p-6">
    {/* Large card */}
  </div>
  <div className="rounded-2xl bg-surface p-4">
    {/* Small card */}
  </div>
  <div className="rounded-2xl bg-surface p-4">
    {/* Small card */}
  </div>
</div>`,
    'masonry-layout': `<div className="columns-3 gap-4">
  <div className="break-inside-avoid mb-4">
    <img src="..." className="w-full rounded-xl" />
  </div>
  {/* More items */}
</div>`,
    'sticky-sidebar': `<div className="flex gap-4">
  <aside className="w-64 sticky top-4 h-fit">
    {/* Navigation */}
  </aside>
  <main className="flex-1">
    {/* Content */}
  </main>
</div>`,
    'split-screen': `<div className="grid grid-cols-2 min-h-screen">
  <div className="bg-primary p-12">
    {/* Left content */}
  </div>
  <div className="bg-surface p-12">
    {/* Right content */}
  </div>
</div>`,
    'glassmorphism': `<div className="bg-white/15 backdrop-blur-xl border border-white/20 rounded-2xl p-6">
  {/* Glassmorphism content */}
</div>`,
    'neumorphism': `<div className="bg-[#e0e5ec] shadow-[9px_9px_16px_rgba(163,177,198,0.6),-9px_-9px_16px_rgba(255,255,255,0.5)] rounded-2xl p-6">
  {/* Neumorphic card */}
</div>`,
    'claymorphism': `<div className="rounded-3xl bg-white shadow-[inset_0_-4px_8px_rgba(0,0,0,0.1),inset_0_4px_8px_rgba(255,255,255,0.8),0_8px_24px_rgba(0,0,0,0.15)]">
  {/* Clay card */}
</div>`,
    'aurora-gradient': `<div className="bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600" 
     style={{ backgroundSize: '200% 200%', animation: 'aurora 15s ease infinite' }}>
  {/* Aurora background */}
</div>

@keyframes aurora {
  0%, 100% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
}`,
    'minimalism': `<div className="bg-white p-24 text-center">
  <h1 className="text-4xl font-bold text-gray-900 mb-4">
    Simple.
  </h1>
  <p className="text-gray-500">Less is more.</p>
</div>`,
    'particle-field': `// Using framer-motion
{particles.map((p, i) => (
  <motion.div
    key={i}
    className="absolute bg-white rounded-full"
    animate={{ y: [0, -30, 0], opacity: [0.3, 0.8, 0.3] }}
    transition={{ duration: 10 + i, repeat: Infinity }}
  />
))}`,
    'skeleton-screen': `<div className="animate-pulse space-y-4">
  <div className="h-4 bg-gray-200 rounded w-3/4" />
  <div className="h-4 bg-gray-200 rounded w-1/2" />
</div>`,
    'parallax-scrolling': `// Using framer-motion
<motion.div 
  style={{ y: useTransform(scrollY, [0, 1000], [0, -200]) }}
>
  {/* Background layer */}
</motion.div>`,
    'infinite-marquee': `<div className="overflow-hidden">
  <div className="flex gap-8 animate-marquee">
    {[...logos, ...logos].map(logo => (
      <div key={logo}>{logo}</div>
    ))}
  </div>
</div>

@keyframes marquee {
  from { transform: translateX(0); }
  to { transform: translateX(-50%); }
}`,
    'reveal-on-scroll': `// Using Intersection Observer or framer-motion
<motion.div
  initial={{ opacity: 0, y: 40 }}
  whileInView={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.6 }}
>
  {/* Content */}
</motion.div>`,
  };
  return examples[patternId] || '// Code example coming soon...';
}

// === DEMO COMPONENTS ===

function BentoGridDemo() {
  return (
    <div className="w-full max-w-2xl grid grid-cols-4 gap-3">
      <div className="col-span-2 row-span-2 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 p-6 flex items-center justify-center text-white font-semibold">
        Large Card
      </div>
      <div className="rounded-xl bg-gradient-to-br from-pink-500 to-orange-500 p-4 flex items-center justify-center text-white text-sm">
        Small
      </div>
      <div className="rounded-xl bg-gradient-to-br from-green-500 to-teal-500 p-4 flex items-center justify-center text-white text-sm">
        Small
      </div>
      <div className="col-span-2 rounded-xl bg-gradient-to-br from-yellow-400 to-orange-500 p-4 flex items-center justify-center text-white text-sm">
        Wide Card
      </div>
      <div className="rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 p-4 flex items-center justify-center text-white text-sm">
        Small
      </div>
      <div className="rounded-xl bg-gradient-to-br from-red-500 to-pink-600 p-4 flex items-center justify-center text-white text-sm">
        Small
      </div>
    </div>
  );
}

function GlassmorphismDemo() {
  return (
    <div className="relative w-full max-w-md h-64 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl p-8 flex items-center justify-center overflow-hidden">
      <div className="absolute inset-0 bg-white/10 backdrop-blur-xl border border-white/20 rounded-xl m-4 p-6 flex flex-col items-center justify-center shadow-xl">
        <h3 className="text-white text-lg font-bold mb-2">Glassmorphism Card</h3>
        <p className="text-white/80 text-sm text-center">
          Semi-transparent background with backdrop blur and border highlight
        </p>
      </div>
    </div>
  );
}

function AuroraGradientDemo() {
  return (
    <div className="w-full h-48 rounded-xl overflow-hidden relative">
      <div 
        className="absolute inset-0 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600"
        style={{
          backgroundSize: '200% 200%',
          animation: 'aurora 15s ease infinite'
        }}
      />
      <div className="relative z-10 h-full flex items-center justify-center">
        <h3 className="text-white text-xl font-bold">Aurora Gradient</h3>
      </div>
      <style jsx>{`
        @keyframes aurora {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }
      `}</style>
    </div>
  );
}

function SkeletonScreenDemo() {
  return (
    <div className="w-full max-w-md space-y-4">
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 rounded-full bg-surface-lighter animate-pulse" />
        <div className="flex-1 space-y-2">
          <div className="h-4 bg-surface-lighter rounded animate-pulse w-3/4" />
          <div className="h-3 bg-surface-lighter rounded animate-pulse w-1/2" />
        </div>
      </div>
      <div className="space-y-2">
        <div className="h-4 bg-surface-lighter rounded animate-pulse" />
        <div className="h-4 bg-surface-lighter rounded animate-pulse w-5/6" />
        <div className="h-4 bg-surface-lighter rounded animate-pulse w-4/6" />
      </div>
    </div>
  );
}

function InfiniteMarqueeDemo() {
  const logos = ['React', 'Vue', 'Angular', 'Svelte', 'Next.js', 'Nuxt', 'Remix'];
  return (
    <div className="w-full overflow-hidden">
      <div className="flex gap-8" style={{ animation: 'marquee 20s linear infinite' }}>
        {[...logos, ...logos].map((logo, i) => (
          <div
            key={i}
            className="flex-shrink-0 px-6 py-3 bg-surface-lighter rounded-lg font-semibold text-text-muted"
          >
            {logo}
          </div>
        ))}
      </div>
    </div>
  );
}

function MasonryLayoutDemo() {
  const items = [
    { height: 'h-32', color: 'from-blue-400 to-blue-600' },
    { height: 'h-24', color: 'from-pink-400 to-pink-600' },
    { height: 'h-40', color: 'from-green-400 to-green-600' },
    { height: 'h-28', color: 'from-purple-400 to-purple-600' },
    { height: 'h-36', color: 'from-yellow-400 to-yellow-600' },
    { height: 'h-20', color: 'from-red-400 to-red-600' }
  ];
  return (
    <div className="w-full max-w-2xl grid grid-cols-3 gap-3">
      {items.map((item, i) => (
        <div
          key={i}
          className={`${item.height} rounded-xl bg-gradient-to-br ${item.color}`}
        />
      ))}
    </div>
  );
}

function StickySidebarDemo() {
  return (
    <div className="w-full max-w-2xl h-48 overflow-y-scroll bg-surface-lighter rounded-xl flex gap-4 p-4">
      <div className="w-32 bg-primary/20 rounded-lg p-3 sticky top-4 h-fit">
        <div className="text-xs font-semibold text-primary">Sticky Nav</div>
        <div className="text-[10px] text-text-muted mt-1">Scroll →</div>
      </div>
      <div className="flex-1 space-y-3">
        {[...Array(8)].map((_, i) => (
          <div key={i} className="h-16 bg-surface rounded-lg" />
        ))}
      </div>
    </div>
  );
}

function SplitScreenDemo() {
  return (
    <div className="w-full max-w-2xl h-48 flex gap-0 rounded-xl overflow-hidden">
      <div className="flex-1 bg-gradient-to-br from-blue-600 to-purple-600 p-6 flex items-center justify-center">
        <div className="text-white text-center">
          <h3 className="font-bold mb-2">Product</h3>
          <p className="text-xs opacity-80">Left side</p>
        </div>
      </div>
      <div className="flex-1 bg-surface-light p-6 flex items-center justify-center">
        <div className="text-text text-center">
          <h3 className="font-bold mb-2">Details</h3>
          <p className="text-xs text-text-muted">Right side</p>
        </div>
      </div>
    </div>
  );
}

function NeumorphismDemo() {
  return (
    <div className="w-full max-w-md h-48 bg-[#e0e5ec] rounded-xl p-8 flex items-center justify-center">
      <div 
        className="w-32 h-32 rounded-2xl flex items-center justify-center text-sm font-semibold text-gray-600"
        style={{
          background: '#e0e5ec',
          boxShadow: '9px 9px 16px rgba(163,177,198,0.6), -9px -9px 16px rgba(255,255,255, 0.5)'
        }}
      >
        Neumorphic
      </div>
    </div>
  );
}

function ClaymorphismDemo() {
  return (
    <div className="w-full max-w-md h-48 bg-gradient-to-br from-purple-100 to-pink-100 rounded-xl p-8 flex items-center justify-center">
      <motion.div 
        whileHover={{ y: -8, scale: 1.05 }}
        transition={{ type: 'spring', stiffness: 300 }}
        className="w-32 h-32 rounded-3xl bg-white flex items-center justify-center text-sm font-bold text-purple-600"
        style={{
          boxShadow: 'inset 0 -4px 8px rgba(0,0,0,0.1), inset 0 4px 8px rgba(255,255,255,0.8), 0 8px 24px rgba(0,0,0,0.15)'
        }}
      >
        Clay Card
      </motion.div>
    </div>
  );
}

function MinimalismDemo() {
  return (
    <div className="w-full max-w-md h-48 bg-white rounded-xl p-12 flex flex-col items-center justify-center">
      <h3 className="text-2xl font-bold text-gray-900 mb-4">Simple.</h3>
      <p className="text-sm text-gray-500 text-center">Less is more.<br/>Focus on what matters.</p>
    </div>
  );
}

function ParticleFieldDemo() {
  const particles = [...Array(30)].map((_, i) => ({
    x: Math.random() * 100,
    y: Math.random() * 100,
    size: Math.random() * 3 + 1,
    duration: Math.random() * 10 + 10
  }));

  return (
    <div className="w-full h-48 bg-black rounded-xl overflow-hidden relative">
      {particles.map((p, i) => (
        <motion.div
          key={i}
          className="absolute bg-white rounded-full"
          style={{
            left: `${p.x}%`,
            top: `${p.y}%`,
            width: p.size,
            height: p.size,
          }}
          animate={{
            y: [0, -30, 0],
            opacity: [0.3, 0.8, 0.3]
          }}
          transition={{
            duration: p.duration,
            repeat: Infinity,
            ease: 'easeInOut'
          }}
        />
      ))}
      <div className="absolute inset-0 flex items-center justify-center text-white text-sm">
        Particle Field
      </div>
    </div>
  );
}

function ParallaxScrollingDemo() {
  return (
    <div className="w-full h-48 overflow-hidden relative rounded-xl bg-gradient-to-b from-blue-900 to-purple-900">
      <motion.div
        className="absolute inset-0 bg-gradient-to-b from-blue-400/20 to-purple-400/20"
        style={{ y: 0 }}
        whileInView={{ y: -20 }}
        transition={{ duration: 2 }}
      >
        <div className="h-full flex items-center justify-center text-white text-sm">
          Background Layer (slow)
        </div>
      </motion.div>
      <motion.div
        className="absolute inset-0 flex items-center justify-center"
        style={{ y: 0 }}
        whileInView={{ y: -40 }}
        transition={{ duration: 2 }}
      >
        <div className="bg-white/20 backdrop-blur-sm rounded-xl p-6 text-white font-semibold">
          Foreground Layer (fast)
        </div>
      </motion.div>
    </div>
  );
}

function RevealOnScrollDemo() {
  return (
    <div className="w-full max-w-md space-y-4">
      {[1, 2, 3].map((i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: i * 0.2 }}
          className="h-16 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl flex items-center justify-center text-white font-semibold"
        >
          Card {i}
        </motion.div>
      ))}
    </div>
  );
}

// Inspiration Tab Component
function InspirationTab() {
  return (
    <div className="p-6 space-y-8">
      {/* Showcase Sites */}
      <section>
        <h2 className="text-lg font-bold text-text mb-4 flex items-center gap-2">
          <Sparkles className="text-primary" size={20} />
          Showcase Sites
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {INSPIRATION_SOURCES.showcases.map((site, i) => (
            <a
              key={i}
              href={site.url}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-surface-light border border-surface-lighter rounded-xl p-4 hover:shadow-lg hover:border-primary transition-all group"
            >
              <div className="flex items-start justify-between mb-2">
                <h3 className="font-semibold text-text group-hover:text-primary transition-colors">
                  {site.name}
                </h3>
                <ExternalLink size={16} className="text-text-muted group-hover:text-primary transition-colors" />
              </div>
              <p className="text-sm text-text-muted">{site.desc}</p>
            </a>
          ))}
        </div>
      </section>

      {/* Design Influencers */}
      <section>
        <h2 className="text-lg font-bold text-text mb-4 flex items-center gap-2">
          <Heart className="text-pink-500" size={20} />
          Design Influencers
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {INSPIRATION_SOURCES.influencers.map((person, i) => (
            <div
              key={i}
              className="bg-surface-light border border-surface-lighter rounded-xl p-4"
            >
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold text-sm">
                  {person.name.charAt(1)}
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-text">{person.name}</h3>
                  <p className="text-xs text-text-muted">{person.platform || 'Web'}</p>
                  <p className="text-sm text-text-muted mt-1">{person.desc}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Newsletters */}
      <section>
        <h2 className="text-lg font-bold text-text mb-4 flex items-center gap-2">
          <Zap className="text-yellow" size={20} />
          Newsletters & Blogs
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {INSPIRATION_SOURCES.newsletters.map((newsletter, i) => (
            <a
              key={i}
              href={newsletter.url}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-surface-light border border-surface-lighter rounded-xl p-4 hover:shadow-lg hover:border-primary transition-all group"
            >
              <div className="flex items-start justify-between mb-2">
                <h3 className="font-semibold text-text group-hover:text-primary transition-colors">
                  {newsletter.name}
                </h3>
                <ExternalLink size={16} className="text-text-muted group-hover:text-primary transition-colors" />
              </div>
              <p className="text-sm text-text-muted">{newsletter.desc}</p>
            </a>
          ))}
        </div>
      </section>

      {/* Component Libraries */}
      <section>
        <h2 className="text-lg font-bold text-text mb-4 flex items-center gap-2">
          <Layout className="text-blue-500" size={20} />
          Component Libraries
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {INSPIRATION_SOURCES.components.map((lib, i) => (
            <a
              key={i}
              href={lib.url}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-surface-light border border-surface-lighter rounded-xl p-4 hover:shadow-lg hover:border-primary transition-all group"
            >
              <div className="flex items-start justify-between mb-2">
                <h3 className="font-semibold text-text group-hover:text-primary transition-colors">
                  {lib.name}
                </h3>
                <ExternalLink size={16} className="text-text-muted group-hover:text-primary transition-colors" />
              </div>
              <p className="text-sm text-text-muted">{lib.desc}</p>
            </a>
          ))}
        </div>
      </section>
    </div>
  );
}
