import { motion } from 'framer-motion';
import { 
  CheckCircle, 
  XCircle, 
  Clock, 
  Wrench,
  ExternalLink,
  AlertCircle
} from 'lucide-react';
import { format, parseISO, isValid } from 'date-fns';

const statusConfig = {
  active: {
    icon: CheckCircle,
    color: 'text-emerald-500',
    bgColor: 'bg-emerald-500',
    label: 'ACTIVE',
  },
  inactive: {
    icon: XCircle,
    color: 'text-slate-500',
    bgColor: 'bg-slate-500',
    label: 'INACTIVE',
  },
  maintenance: {
    icon: Wrench,
    color: 'text-amber-500',
    bgColor: 'bg-amber-500',
    label: 'MAINTENANCE',
  },
};

const impactConfig = {
  low: { color: 'bg-slate-500', label: 'LOW' },
  medium: { color: 'bg-blue-500', label: 'MEDIUM' },
  high: { color: 'bg-amber-500', label: 'HIGH' },
  critical: { color: 'bg-red-500', label: 'CRITICAL' },
};

const formatLastUpdated = (dateStr) => {
  if (!dateStr) return 'Unknown';
  try {
    // Handle different date formats
    let date;
    if (dateStr.includes('T')) {
      date = parseISO(dateStr);
    } else {
      // Handle "YYYY-MM-DD HH:mm:ss" format
      date = new Date(dateStr);
    }
    if (!isValid(date)) return dateStr;
    return format(date, 'MMM dd, yyyy');
  } catch {
    return dateStr;
  }
};

export const StatusCard = ({ dashboard, index }) => {
  const status = statusConfig[dashboard.status] || statusConfig.inactive;
  const impact = impactConfig[dashboard.impact] || impactConfig.low;
  
  const lastUpdated = formatLastUpdated(dashboard.last_updated);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.05 }}
      whileHover={{ scale: 1.02, y: -4 }}
      className="group relative"
      data-testid={`dashboard-card-${dashboard.id}`}
    >
      {/* Tracing beam effect on hover */}
      <div className="absolute -inset-0.5 bg-gradient-to-r from-transparent via-accent/50 to-transparent rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-sm" />
      
      <div className="relative glass-card rounded-lg p-5 h-full flex flex-col">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            {/* Status indicator with pulse */}
            <div className="relative">
              <div className={`w-3 h-3 rounded-full ${status.bgColor}`} />
              {dashboard.status === 'active' && (
                <div className={`absolute inset-0 w-3 h-3 rounded-full ${status.bgColor} animate-ping opacity-75`} />
              )}
            </div>
            <span className={`text-xs font-mono tracking-widest uppercase ${status.color}`}>
              {status.label}
            </span>
          </div>
          
          {/* Impact badge */}
          <div className={`px-2 py-0.5 rounded text-[10px] font-mono tracking-wider text-white ${impact.color}`}>
            {impact.label}
          </div>
        </div>

        {/* Title */}
        <h3 className="text-xl font-bold tracking-tight uppercase font-['Barlow_Condensed'] text-foreground mb-2">
          {dashboard.name}
        </h3>

        {/* Description */}
        {dashboard.description && (
          <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
            {dashboard.description}
          </p>
        )}

        {/* Spacer */}
        <div className="flex-1" />

        {/* Issues Section */}
        {dashboard.ongoing_issues && (
          <div className="mb-4 p-3 rounded bg-destructive/10 border border-destructive/20">
            <div className="flex items-center gap-2 text-destructive mb-1">
              <AlertCircle className="w-4 h-4" />
              <span className="text-xs font-mono tracking-wider uppercase">ISSUE</span>
            </div>
            <p className="text-sm text-destructive/80">
              {dashboard.ongoing_issues}
            </p>
          </div>
        )}

        {/* Footer */}
        <div className="pt-4 border-t border-border/50 space-y-2">
          {/* Owner */}
          {dashboard.owner && (
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground font-mono uppercase tracking-wider">Owner</span>
              <span className="text-foreground">{dashboard.owner}</span>
            </div>
          )}
          
          {/* Last Updated */}
          <div className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground font-mono uppercase tracking-wider flex items-center gap-1">
              <Clock className="w-3 h-3" />
              Updated
            </span>
            <span className="text-foreground">{lastUpdated}</span>
          </div>

          {/* Days indicator */}
          {dashboard.diff_days !== undefined && dashboard.diff_days !== null && (
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground font-mono uppercase tracking-wider">Days Since Update</span>
              <span className={`font-bold ${dashboard.diff_days === 0 ? 'text-emerald-500' : dashboard.diff_days <= 3 ? 'text-blue-500' : 'text-amber-500'}`}>
                {dashboard.diff_days} days
              </span>
            </div>
          )}
        </div>

        {/* URL Link */}
        {dashboard.url && (
          <a
            href={dashboard.url}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-3 flex items-center justify-center gap-2 py-2 rounded bg-accent/10 text-accent hover:bg-accent/20 transition-colors text-sm font-medium"
            data-testid={`dashboard-link-${dashboard.id}`}
          >
            <ExternalLink className="w-4 h-4" />
            Open Dashboard
          </a>
        )}
      </div>
    </motion.div>
  );
};
