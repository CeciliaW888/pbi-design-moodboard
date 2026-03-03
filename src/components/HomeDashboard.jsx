import { useState } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Plus, LayoutTemplate, ArrowRight, Search, BarChart3, TrendingUp, PieChart } from 'lucide-react';
import ProjectCard from './ProjectCard';
import { TEMPLATES } from '../lib/templates';

const TEMPLATE_CHIPS = [
  { id: 'template-financial-report', label: 'Financial Report', Icon: BarChart3 },
  { id: 'template-marketing-dashboard', label: 'Marketing Dashboard', Icon: TrendingUp },
  { id: 'template-sales-analysis', label: 'Sales Analysis', Icon: PieChart },
];

export default function HomeDashboard({
  user,
  projects,
  onOpenProject,
  onNewProject,
  onViewAll,
  onPromptGenerate,
  onRenameProject,
  onDuplicateProject,
  onDeleteProject,
  onUseTemplate,
}) {
  const [promptText, setPromptText] = useState('');

  const handlePromptSubmit = (e) => {
    e.preventDefault();
    if (!promptText.trim()) return;
    onPromptGenerate?.(promptText.trim());
    setPromptText('');
  };

  const recentProjects = (projects || []).slice(0, 6);

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="max-w-5xl mx-auto px-6 py-8">
        {/* Welcome banner */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-2xl font-bold text-text">
            Welcome back{user?.displayName ? `, ${user.displayName.split(' ')[0]}` : ''}
          </h1>
          <p className="text-text-muted mt-1">Design your next Power BI masterpiece</p>
        </motion.div>

        {/* Prompt bar */}
        <motion.form
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          onSubmit={handlePromptSubmit}
          className="relative mb-6"
        >
          <div className="flex items-center gap-3 bg-surface-light border border-surface-lighter rounded-2xl px-4 py-3 focus-within:border-primary/50 transition-colors shadow-sm">
            <Sparkles size={18} className="text-primary flex-shrink-0" />
            <input
              type="text"
              value={promptText}
              onChange={(e) => setPromptText(e.target.value)}
              placeholder="Describe your dashboard theme... e.g. 'Modern dark sales dashboard with blue accents'"
              className="flex-1 bg-transparent outline-none text-sm text-text placeholder:text-text-muted/60"
            />
            <button
              type="submit"
              disabled={!promptText.trim()}
              className="px-4 py-1.5 bg-primary text-white text-sm font-medium rounded-lg hover:bg-primary-dark transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Generate
            </button>
          </div>
        </motion.form>

        {/* Quick template chips */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="flex flex-wrap gap-2 mb-10"
        >
          {TEMPLATE_CHIPS.map(({ id, label, Icon }) => (
            <button
              key={id}
              onClick={() => onUseTemplate?.(id)}
              className="flex items-center gap-2 px-4 py-2 bg-surface border border-surface-lighter rounded-full text-sm text-text-muted hover:text-text hover:border-primary/30 transition-all"
            >
              <Icon size={14} />
              {label}
            </button>
          ))}
        </motion.div>

        {/* Get Started cards */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-10"
        >
          <button
            onClick={onNewProject}
            className="group flex items-center gap-4 p-5 bg-surface-light border border-surface-lighter rounded-xl hover:border-primary/30 hover:shadow-lg transition-all text-left"
          >
            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0 group-hover:bg-primary/20 transition-colors">
              <Plus size={24} className="text-primary" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-text">Start from Scratch</h3>
              <p className="text-xs text-text-muted mt-0.5">Create a blank moodboard and build your design system</p>
            </div>
          </button>
          <button
            onClick={() => onViewAll?.('templates')}
            className="group flex items-center gap-4 p-5 bg-surface-light border border-surface-lighter rounded-xl hover:border-primary/30 hover:shadow-lg transition-all text-left"
          >
            <div className="w-12 h-12 rounded-xl bg-[#6C5CE7]/10 flex items-center justify-center flex-shrink-0 group-hover:bg-[#6C5CE7]/20 transition-colors">
              <LayoutTemplate size={24} className="text-[#6C5CE7]" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-text">Explore Templates</h3>
              <p className="text-xs text-text-muted mt-0.5">Start with a curated design system and customize it</p>
            </div>
          </button>
        </motion.div>

        {/* Recent Projects */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-text">Recent Projects</h2>
            {recentProjects.length > 0 && (
              <button
                onClick={() => onViewAll?.('projects')}
                className="flex items-center gap-1 text-sm text-primary hover:text-primary-dark transition-colors"
              >
                View all <ArrowRight size={14} />
              </button>
            )}
          </div>

          {recentProjects.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {recentProjects.map(project => (
                <ProjectCard
                  key={project.id}
                  project={project}
                  onOpen={onOpenProject}
                  onRename={onRenameProject}
                  onDuplicate={onDuplicateProject}
                  onDelete={onDeleteProject}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-16 bg-surface-light border border-surface-lighter rounded-xl">
              <Search size={32} className="mx-auto mb-3 text-text-muted/30" />
              <p className="text-sm font-medium text-text-muted">No projects yet</p>
              <p className="text-xs text-text-muted/70 mt-1">Create your first project to get started</p>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
