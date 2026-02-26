import { Link, useLocation } from 'react-router-dom';
import { useTheme } from '../../context/ThemeContext';
import { Moon, Sun, Activity, FolderKanban, ExternalLink } from 'lucide-react';
import { Button } from '../ui/button';
import { motion } from 'framer-motion';
import { DATA_CONFIG } from '../../config/dataConfig';

const navItems = [
  { path: '/', label: 'DASHBOARDS', icon: Activity },
  { path: '/projects', label: 'PROJECTS', icon: FolderKanban },
];

export const Header = () => {
  const { theme, toggleTheme } = useTheme();
  const location = useLocation();

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 glass-card">
      <div className="container mx-auto flex h-16 items-center justify-between px-4 md:px-8">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-3" data-testid="logo-link">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded bg-[#E53C2E] flex items-center justify-center">
              <span className="text-white font-bold text-xl font-['Barlow_Condensed']">F</span>
            </div>
            <div className="hidden sm:flex flex-col">
              <span className="text-lg font-bold tracking-tight uppercase font-['Barlow_Condensed'] text-foreground">
                FANATICS
              </span>
              <span className="text-[10px] tracking-[0.2em] uppercase text-muted-foreground -mt-1">
                Supply Chain
              </span>
            </div>
          </div>
        </Link>

        {/* Navigation */}
        <nav className="flex items-center gap-1">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            const Icon = item.icon;
            return (
              <Link key={item.path} to={item.path} data-testid={`nav-${item.label.toLowerCase()}`}>
                <motion.div
                  className={`relative px-4 py-2 rounded-md flex items-center gap-2 transition-colors ${
                    isActive
                      ? 'text-foreground'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Icon className="w-4 h-4" />
                  <span className="hidden md:inline text-sm font-medium tracking-wider uppercase font-['Barlow_Condensed']">
                    {item.label}
                  </span>
                  {isActive && (
                    <motion.div
                      layoutId="activeTab"
                      className="absolute inset-0 bg-accent/10 rounded-md border border-accent/20"
                      transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
                    />
                  )}
                </motion.div>
              </Link>
            );
          })}
          
          {/* Submit Request - External Link */}
          <a
            href={DATA_CONFIG.JIRA_FORM_URL}
            target="_blank"
            rel="noopener noreferrer"
            data-testid="nav-submit-request"
          >
            <motion.div
              className="relative px-4 py-2 rounded-md flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <ExternalLink className="w-4 h-4" />
              <span className="hidden md:inline text-sm font-medium tracking-wider uppercase font-['Barlow_Condensed']">
                SUBMIT REQUEST
              </span>
            </motion.div>
          </a>
        </nav>

        {/* Theme Toggle */}
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleTheme}
          data-testid="theme-toggle"
          className="relative overflow-hidden"
        >
          <motion.div
            initial={false}
            animate={{
              rotate: theme === 'dark' ? 0 : 180,
              scale: theme === 'dark' ? 1 : 0,
            }}
            transition={{ duration: 0.3 }}
            className="absolute"
          >
            <Moon className="h-5 w-5" />
          </motion.div>
          <motion.div
            initial={false}
            animate={{
              rotate: theme === 'light' ? 0 : -180,
              scale: theme === 'light' ? 1 : 0,
            }}
            transition={{ duration: 0.3 }}
            className="absolute"
          >
            <Sun className="h-5 w-5" />
          </motion.div>
        </Button>
      </div>
    </header>
  );
};
