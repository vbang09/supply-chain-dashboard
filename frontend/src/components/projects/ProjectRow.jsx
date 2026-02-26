import { motion } from 'framer-motion';
import { 
  User, 
  Calendar, 
  ChevronRight,
  CheckCircle2,
  Circle,
  Clock,
  PlayCircle,
  Loader2
} from 'lucide-react';
import { formatDistanceToNow, format } from 'date-fns';
import { Progress } from '../ui/progress';

const statusConfig = {
  assigned: {
    icon: Circle,
    color: 'text-slate-500',
    bgColor: 'bg-slate-500',
    progressColor: 'bg-slate-500',
    label: 'Assigned',
  },
  started: {
    icon: PlayCircle,
    color: 'text-blue-500',
    bgColor: 'bg-blue-500',
    progressColor: 'bg-blue-500',
    label: 'Started',
  },
  in_progress: {
    icon: Loader2,
    color: 'text-amber-500',
    bgColor: 'bg-amber-500',
    progressColor: 'bg-amber-500',
    label: 'In Progress',
  },
  done: {
    icon: CheckCircle2,
    color: 'text-emerald-500',
    bgColor: 'bg-emerald-500',
    progressColor: 'bg-emerald-500',
    label: 'Done',
  },
};

const milestones = ['assigned', 'started', 'in_progress', 'done'];

const getMilestoneIndex = (status) => {
  const idx = milestones.indexOf(status);
  return idx >= 0 ? idx : 0;
};

export const ProjectRow = ({ project, index }) => {
  const status = statusConfig[project.status] || statusConfig.assigned;
  const currentMilestoneIndex = getMilestoneIndex(project.status);
  
  const createdAt = project.created_at 
    ? format(new Date(project.created_at), 'MMM dd, yyyy')
    : 'Unknown';

  const getInitials = (name) => {
    if (!name) return '??';
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.4, delay: index * 0.05 }}
      className="group"
      data-testid={`project-row-${project.id}`}
    >
      <div className="glass-card rounded-lg p-5 hover:bg-accent/5 transition-colors">
        {/* Header Row */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-4">
          {/* Project Name & JIRA */}
          <div className="flex-1">
            <div className="flex items-center gap-3">
              <h3 className="text-xl font-bold tracking-tight uppercase font-['Barlow_Condensed'] text-foreground">
                {project.name}
              </h3>
              {project.jira_id && (
                <span className="px-2 py-0.5 rounded bg-accent/10 text-accent text-xs font-mono">
                  {project.jira_id}
                </span>
              )}
            </div>
            {project.description && (
              <p className="text-sm text-muted-foreground mt-1 line-clamp-1">
                {project.description}
              </p>
            )}
          </div>

          {/* People */}
          <div className="flex items-center gap-6">
            {/* Creator */}
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-xs font-medium text-primary">
                {getInitials(project.created_by)}
              </div>
              <div className="hidden sm:block">
                <p className="text-[10px] font-mono text-muted-foreground uppercase tracking-wider">Created by</p>
                <p className="text-sm text-foreground">{project.created_by}</p>
              </div>
            </div>

            <ChevronRight className="w-4 h-4 text-muted-foreground hidden sm:block" />

            {/* Assignee */}
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-accent/10 flex items-center justify-center text-xs font-medium text-accent">
                {getInitials(project.assigned_to)}
              </div>
              <div className="hidden sm:block">
                <p className="text-[10px] font-mono text-muted-foreground uppercase tracking-wider">Assigned to</p>
                <p className="text-sm text-foreground">{project.assigned_to}</p>
              </div>
            </div>

            {/* Date */}
            <div className="hidden md:flex items-center gap-2 text-muted-foreground">
              <Calendar className="w-4 h-4" />
              <span className="text-sm">{createdAt}</span>
            </div>
          </div>
        </div>

        {/* Milestone Progress Bar */}
        <div className="mb-4">
          <div className="flex items-center justify-between mb-2">
            {milestones.map((milestone, idx) => {
              const config = statusConfig[milestone];
              const isCompleted = idx <= currentMilestoneIndex;
              const isCurrent = idx === currentMilestoneIndex;
              const Icon = config.icon;
              
              return (
                <div key={milestone} className="flex flex-col items-center">
                  <motion.div
                    initial={false}
                    animate={{
                      scale: isCurrent ? 1.1 : 1,
                    }}
                    className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      isCompleted ? config.bgColor : 'bg-muted'
                    } ${isCurrent ? 'ring-2 ring-offset-2 ring-offset-background ring-accent' : ''}`}
                  >
                    <Icon className={`w-4 h-4 ${isCompleted ? 'text-white' : 'text-muted-foreground'}`} />
                  </motion.div>
                  <span className={`text-[10px] font-mono uppercase tracking-wider mt-1 ${
                    isCompleted ? 'text-foreground' : 'text-muted-foreground'
                  }`}>
                    {config.label}
                  </span>
                </div>
              );
            })}
          </div>
          
          {/* Progress Line */}
          <div className="relative h-1 bg-muted rounded-full mt-2 mx-4">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${(currentMilestoneIndex / (milestones.length - 1)) * 100}%` }}
              transition={{ duration: 0.5, ease: 'easeOut' }}
              className={`absolute h-full rounded-full ${status.progressColor}`}
            />
          </div>
        </div>

        {/* Progress Percentage */}
        <div className="flex items-center gap-3 mb-4">
          <span className="text-xs font-mono text-muted-foreground uppercase tracking-wider">Progress</span>
          <div className="flex-1">
            <Progress value={project.progress} className="h-2" />
          </div>
          <span className="text-sm font-bold text-foreground">{project.progress}%</span>
        </div>

        {/* Current Note */}
        {project.current_note && (
          <div className="p-3 rounded bg-muted/50 border border-border/50 mb-4">
            <p className="text-[10px] font-mono text-muted-foreground uppercase tracking-wider mb-1">
              Current Status
            </p>
            <p className="text-sm text-foreground">{project.current_note}</p>
          </div>
        )}

        {/* Completed Tasks */}
        {project.completed_tasks && project.completed_tasks.length > 0 && (
          <div>
            <p className="text-[10px] font-mono text-muted-foreground uppercase tracking-wider mb-2">
              Completed
            </p>
            <div className="flex flex-wrap gap-2">
              {project.completed_tasks.map((task, idx) => (
                <span
                  key={idx}
                  className="inline-flex items-center gap-1 px-2 py-1 rounded bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs"
                >
                  <CheckCircle2 className="w-3 h-3" />
                  {task}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
};
