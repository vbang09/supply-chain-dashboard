import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { StatusCard } from '../components/dashboard/StatusCard';
import { RefreshCw, AlertCircle, Activity, CheckCircle, XCircle, Wrench } from 'lucide-react';
import { Button } from '../components/ui/button';
import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

export const DashboardPage = () => {
  const [dashboards, setDashboards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastRefresh, setLastRefresh] = useState(null);

  const fetchDashboards = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await axios.get(`${API}/dashboards`);
      setDashboards(response.data);
      setLastRefresh(new Date());
    } catch (err) {
      console.error('Error fetching dashboards:', err);
      setError('Failed to fetch dashboards. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const seedData = async () => {
    try {
      setLoading(true);
      await axios.post(`${API}/seed`);
      await fetchDashboards();
    } catch (err) {
      console.error('Error seeding data:', err);
      setError('Failed to seed data.');
    }
  };

  useEffect(() => {
    fetchDashboards();
  }, []);

  // Calculate stats
  const stats = {
    total: dashboards.length,
    active: dashboards.filter((d) => d.status === 'active').length,
    inactive: dashboards.filter((d) => d.status === 'inactive').length,
    maintenance: dashboards.filter((d) => d.status === 'maintenance').length,
  };

  return (
    <div className="min-h-screen" data-testid="dashboard-page">
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
                Dashboard Status
              </motion.h1>
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.1 }}
                className="text-muted-foreground mt-2 text-sm md:text-base"
              >
                Monitor all supply chain dashboards in real-time
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
                onClick={fetchDashboards}
                disabled={loading}
                data-testid="refresh-dashboards"
              >
                <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
              {dashboards.length === 0 && (
                <Button
                  variant="default"
                  size="sm"
                  onClick={seedData}
                  disabled={loading}
                  data-testid="seed-data"
                  className="bg-accent text-white hover:bg-accent/90"
                >
                  Load Sample Data
                </Button>
              )}
            </div>
          </div>

          {/* Stats Bar */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8"
          >
            <div className="flex items-center gap-3 p-4 rounded-lg bg-card border border-border">
              <Activity className="w-5 h-5 text-accent" />
              <div>
                <p className="text-2xl font-bold text-foreground">{stats.total}</p>
                <p className="text-xs text-muted-foreground font-mono uppercase tracking-wider">Total</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-4 rounded-lg bg-card border border-emerald-500/30">
              <CheckCircle className="w-5 h-5 text-emerald-500" />
              <div>
                <p className="text-2xl font-bold text-foreground">{stats.active}</p>
                <p className="text-xs text-muted-foreground font-mono uppercase tracking-wider">Active</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-4 rounded-lg bg-card border border-slate-400/30">
              <XCircle className="w-5 h-5 text-slate-500" />
              <div>
                <p className="text-2xl font-bold text-foreground">{stats.inactive}</p>
                <p className="text-xs text-muted-foreground font-mono uppercase tracking-wider">Inactive</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-4 rounded-lg bg-card border border-amber-500/30">
              <Wrench className="w-5 h-5 text-amber-500" />
              <div>
                <p className="text-2xl font-bold text-foreground">{stats.maintenance}</p>
                <p className="text-xs text-muted-foreground font-mono uppercase tracking-wider">Maintenance</p>
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

        {loading && dashboards.length === 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="glass-card rounded-lg p-5 h-64 animate-pulse">
                <div className="h-4 bg-muted rounded w-1/3 mb-4" />
                <div className="h-6 bg-muted rounded w-2/3 mb-2" />
                <div className="h-4 bg-muted rounded w-full mb-4" />
                <div className="flex-1" />
                <div className="h-20 bg-muted rounded" />
              </div>
            ))}
          </div>
        ) : dashboards.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-20"
          >
            <Activity className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
            <h2 className="text-2xl font-bold font-['Barlow_Condensed'] uppercase text-foreground mb-2">
              No Dashboards Found
            </h2>
            <p className="text-muted-foreground mb-6">
              Click "Load Sample Data" to populate with sample dashboards
            </p>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {dashboards.map((dashboard, index) => (
              <StatusCard key={dashboard.id} dashboard={dashboard} index={index} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
