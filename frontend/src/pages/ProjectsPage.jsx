import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ProjectRow } from '../components/projects/ProjectRow';
import { 
  RefreshCw, 
  AlertCircle, 
  FolderKanban, 
  CheckCircle2,
  Clock,
  PlayCircle,
  Circle,
  ExternalLink
} from 'lucide-react';
import { Button } from '../components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;
const JIRA_FORM_URL = 'https://toppsdigital.atlassian.net/jira/core/projects/SCT2/form/309';

export const ProjectsPage = () => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastRefresh, setLastRefresh] = useState(null);
  const [activeTab, setActiveTab] = useState('all');

  const fetchProjects = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await axios.get(`${API}/projects`);
      setProjects(response.data);
      setLastRefresh(new Date());
    } catch (err) {
      console.error('Error fetching projects:', err);
      setError('Failed to fetch projects. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const seedData = async () => {
    try {
      setLoading(true);
      await axios.post(`${API}/seed`);
      await fetchProjects();
    } catch (err) {
      console.error('Error seeding data:', err);
      setError('Failed to seed data.');
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  // Calculate stats
  const stats = {
    total: projects.length,
    assigned: projects.filter((p) => p.status === 'assigned').length,
    started: projects.filter((p) => p.status === 'started').length,
    in_progress: projects.filter((p) => p.status === 'in_progress').length,
    done: projects.filter((p) => p.status === 'done').length,
  };

  // Filter projects by status
  const filteredProjects = activeTab === 'all' 
    ? projects 
    : projects.filter((p) => p.status === activeTab);

  return (
    <div className="min-h-screen" data-testid="projects-page">
      {/* Header Section */}
      <div className="border-b border-border/40 glass-card">
        <div className="container mx-auto px-4 md:px-8 py-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <motion.h1
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-4xl md:text-5xl font-bold tracking-tight uppercase font-['Barlow_Condensed'] text-foreground"
              >
                Project Tracker
              </motion.h1>
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.1 }}
                className="text-muted-foreground mt-2 text-sm md:text-base"
              >
                Track project progress and milestones
              </motion.p>
            </div>

            <div className="flex items-center gap-3">
              {lastRefresh && (
                <span className="text-xs text-muted-foreground font-mono">
                  Updated: {lastRefresh.toLocaleTimeString()}
                </span>
              )}
              <Button
                variant="outline"
                size="sm"
                onClick={fetchProjects}
                disabled={loading}
                data-testid="refresh-projects"
              >
                <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
              <a
                href={JIRA_FORM_URL}
                target="_blank"
                rel="noopener noreferrer"
              >
                <Button
                  variant="default"
                  size="sm"
                  data-testid="submit-project-request"
                  className="bg-accent text-white hover:bg-accent/90"
                >
                  <ExternalLink className="w-4 h-4 mr-2" />
                  Submit Request
                </Button>
              </a>
            </div>
          </div>

          {/* Stats Bar */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="grid grid-cols-2 md:grid-cols-5 gap-4 mt-8"
          >
            <div className="flex items-center gap-3 p-4 rounded-lg bg-card border border-border">
              <FolderKanban className="w-5 h-5 text-accent" />
              <div>
                <p className="text-2xl font-bold text-foreground">{stats.total}</p>
                <p className="text-xs text-muted-foreground font-mono uppercase tracking-wider">Total</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-4 rounded-lg bg-card border border-slate-400/30">
              <Circle className="w-5 h-5 text-slate-500" />
              <div>
                <p className="text-2xl font-bold text-foreground">{stats.assigned}</p>
                <p className="text-xs text-muted-foreground font-mono uppercase tracking-wider">Assigned</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-4 rounded-lg bg-card border border-blue-500/30">
              <PlayCircle className="w-5 h-5 text-blue-500" />
              <div>
                <p className="text-2xl font-bold text-foreground">{stats.started}</p>
                <p className="text-xs text-muted-foreground font-mono uppercase tracking-wider">Started</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-4 rounded-lg bg-card border border-amber-500/30">
              <Clock className="w-5 h-5 text-amber-500" />
              <div>
                <p className="text-2xl font-bold text-foreground">{stats.in_progress}</p>
                <p className="text-xs text-muted-foreground font-mono uppercase tracking-wider">In Progress</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-4 rounded-lg bg-card border border-emerald-500/30">
              <CheckCircle2 className="w-5 h-5 text-emerald-500" />
              <div>
                <p className="text-2xl font-bold text-foreground">{stats.done}</p>
                <p className="text-xs text-muted-foreground font-mono uppercase tracking-wider">Done</p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 md:px-8 py-8">
        {error && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mb-6 p-4 rounded-lg bg-destructive/10 border border-destructive/20 flex items-center gap-3"
          >
            <AlertCircle className="w-5 h-5 text-destructive" />
            <span className="text-destructive">{error}</span>
          </motion.div>
        )}

        {/* Tabs for filtering */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-6">
          <TabsList className="bg-muted/50">
            <TabsTrigger value="all" data-testid="tab-all">All</TabsTrigger>
            <TabsTrigger value="assigned" data-testid="tab-assigned">Assigned</TabsTrigger>
            <TabsTrigger value="started" data-testid="tab-started">Started</TabsTrigger>
            <TabsTrigger value="in_progress" data-testid="tab-in-progress">In Progress</TabsTrigger>
            <TabsTrigger value="done" data-testid="tab-done">Done</TabsTrigger>
          </TabsList>
        </Tabs>

        {loading && projects.length === 0 ? (
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="glass-card rounded-lg p-5 h-48 animate-pulse">
                <div className="flex justify-between mb-4">
                  <div className="h-6 bg-muted rounded w-1/3" />
                  <div className="h-6 bg-muted rounded w-1/4" />
                </div>
                <div className="h-8 bg-muted rounded w-full mb-4" />
                <div className="h-20 bg-muted rounded" />
              </div>
            ))}
          </div>
        ) : filteredProjects.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-20"
          >
            <FolderKanban className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
            <h2 className="text-2xl font-bold font-['Barlow_Condensed'] uppercase text-foreground mb-2">
              {projects.length === 0 ? 'No Projects Found' : 'No Projects in This Category'}
            </h2>
            <p className="text-muted-foreground mb-6">
              {projects.length === 0 
                ? 'Click "Load Sample Data" on the Dashboard page to populate sample data'
                : 'Try selecting a different filter tab'}
            </p>
            {projects.length === 0 && (
              <Button
                variant="default"
                onClick={seedData}
                disabled={loading}
                data-testid="seed-data-projects"
                className="bg-accent text-white hover:bg-accent/90"
              >
                Load Sample Data
              </Button>
            )}
          </motion.div>
        ) : (
          <div className="space-y-4">
            {filteredProjects.map((project, index) => (
              <ProjectRow key={project.id} project={project} index={index} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
