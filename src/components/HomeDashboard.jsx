import { motion } from 'framer-motion';
import { Palette, LayoutTemplate, Zap, ArrowRight, Search } from 'lucide-react';
import ProjectCard from './ProjectCard';
import PathCard from './PathCard';

export default function HomeDashboard({
  user,
  projects,
  onOpenProject,
  onNewProject,
  onViewAll,
  onRenameProject,
  onDuplicateProject,
  onDeleteProject,
  onUseTemplate,
  onNewPrototype,
}) {
  const recentProjects = (projects || []).slice(0, 6);

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="max-w-5xl mx-auto px-6 py-8">
        {/* Welcome banner */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-10"
        >
          <h1 className="text-2xl font-bold text-text">
            Welcome back{user?.displayName ? `, ${user.displayName.split(' ')[0]}` : ''}
          </h1>
          <p className="text-text-muted mt-1">What would you like to create?</p>
        </motion.div>

        {/* Three path cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-12">
          <PathCard
            icon={Palette}
            iconGradient="from-blue-500 to-blue-600"
            title='I Have Inspiration'
            description="Upload image or paste URL to extract colors, fonts, and style"
            buttonText="Upload Image"
            buttonVariant="primary"
            onClick={onNewProject}
            delay={0}
          />
          <PathCard
            icon={LayoutTemplate}
            iconGradient="from-purple-500 to-purple-600"
            title='I Want a Template'
            description="Browse 12 curated dashboard themes and customize for your brand"
            buttonText="Browse Templates"
            buttonVariant="outline"
            onClick={() => onViewAll?.('gallery')}
            delay={0.05}
          />
          <PathCard
            icon={Zap}
            iconGradient="from-yellow-400 to-yellow-500"
            title='Start Blank'
            description="Create from scratch with AI or manual design"
            buttonText="Create"
            buttonVariant="outline"
            onClick={onNewPrototype}
            delay={0.1}
          />
        </div>

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
