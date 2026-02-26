import { BrowserRouter, Routes, Route, HashRouter } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import { Header } from './components/layout/Header';
import { DashboardPage } from './pages/DashboardPage';
import { ProjectsPage } from './pages/ProjectsPage';
import { Toaster } from './components/ui/sonner';
import './App.css';

// Use HashRouter for GitHub Pages compatibility
function App() {
  return (
    <ThemeProvider>
      <HashRouter>
        <div className="min-h-screen bg-background">
          <Header />
          <main>
            <Routes>
              <Route path="/" element={<DashboardPage />} />
              <Route path="/projects" element={<ProjectsPage />} />
            </Routes>
          </main>
          <Toaster />
        </div>
      </HashRouter>
    </ThemeProvider>
  );
}

export default App;
