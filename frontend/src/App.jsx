import React, { useState, useEffect } from 'react';
import { Terminal, BookOpen, Layers, Sun, Moon, Monitor, LogOut, User } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import AgentSandbox from './components/AgentSandbox';
import TheoryHub from './components/TheoryHub';
import LoadingScreen from './components/LoadingScreen';
import AuthPage from './components/AuthPage';
import { useThemeStore } from './store/themeStore';
import { useAuthStore } from './store/useAuthStore';
import useSimulationStore from './store/useSimulationStore';
import SharedPaperViewer from './components/SharedPaperViewer';
import { useIsMobile } from './hooks/useMediaQuery';

export default function App() {
  const isMobile = useIsMobile();
  const [activeTab, setActiveTab] = useState("sandbox");
  const [isLoading, setIsLoading] = useState(true);
  const [sharedPaperUuid, setSharedPaperUuid] = useState(null);
  const { theme, setTheme, initTheme } = useThemeStore();
  const { isAuthenticated, user, logout } = useAuthStore();
  const { syncHistory } = useSimulationStore();

  useEffect(() => {
    initTheme();
    const checkRouting = () => {
      const path = window.location.pathname;
      const hash = window.location.hash;
      if (path.startsWith('/paper/')) {
        const uuid = path.split('/')[2];
        if (uuid) setSharedPaperUuid(uuid);
      } else if (hash.startsWith('#/paper/')) {
        const uuid = hash.split('/')[2];
        const cleanUuid = uuid ? uuid.split('?')[0] : null;
        if (cleanUuid) setSharedPaperUuid(cleanUuid);
      }
    };
    checkRouting();
    window.addEventListener('hashchange', checkRouting);
    return () => window.removeEventListener('hashchange', checkRouting);
  }, [initTheme]);

  useEffect(() => {
    if (isAuthenticated) {
      syncHistory();
    }
  }, [isAuthenticated, syncHistory]);

  if (sharedPaperUuid) {
    return <SharedPaperViewer uuid={sharedPaperUuid} />;
  }

  // Flow: LoadingScreen → Auth (if not logged in) → Main App
  return (
    <>
      {/* 1. Loading Screen (Landing Page) — always shows first */}
      <AnimatePresence>
        {isLoading && <LoadingScreen onComplete={() => setIsLoading(false)} />}
      </AnimatePresence>

      {/* 2. After loading, check auth */}
      {!isLoading && (
        <>
          {!isAuthenticated ? (
            /* 2a. Auth Page — if not logged in */
            <AnimatePresence>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <AuthPage />
              </motion.div>
            </AnimatePresence>
          ) : (
            /* 2b. Main App — after authentication */
            <div className="layout-wrapper">

              {/* Top Horizontal Navbar */}
              <header className="top-navbar">
                <div className="navbar-left" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <div className="sidebar-logo" style={{ marginBottom: 0 }}>
                    <Layers size={24} style={{ color: 'var(--color-accent)' }} />
                    <span>Agentic Lab</span>
                  </div>
                  {!isMobile && (
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.4rem',
                      background: 'rgba(34, 197, 94, 0.08)',
                      border: '1px solid rgba(34, 197, 94, 0.25)',
                      borderRadius: '20px',
                      padding: '0.25rem 0.6rem',
                      fontSize: '0.65rem',
                      fontWeight: 600,
                      letterSpacing: '0.04em',
                      color: '#4ade80',
                      fontFamily: 'var(--font-mono)'
                    }}>
                      <span className="pulse-active" style={{
                        width: '6px',
                        height: '6px',
                        borderRadius: '50%',
                        background: '#22c55e',
                        boxShadow: '0 0 6px #22c55e',
                        display: 'inline-block'
                      }}></span>
                      SYS SEC: SOC-2 ENCLAVE ACTIVE
                    </div>
                  )}
                </div>

                <nav className="navbar-center" style={isMobile ? { width: '100%', display: 'flex', justifyContent: 'center' } : {}}>
                  <ul className="nav-links" style={{
                    flexDirection: isMobile ? 'row' : 'row',
                    display: isMobile ? 'grid' : 'flex',
                    gridTemplateColumns: isMobile ? '1fr 1fr' : 'none',
                    width: isMobile ? '100%' : 'auto',
                    gap: isMobile ? '0.5rem' : '0.75rem'
                  }}>
                    <li>
                      <div 
                        className={`nav-item ${activeTab === 'sandbox' ? 'active' : ''}`}
                        onClick={() => setActiveTab('sandbox')}
                        style={isMobile ? { justifyContent: 'center', padding: '0.5rem 0.4rem', fontSize: '0.8rem', gap: '0.35rem', whiteSpace: 'nowrap' } : {}}
                      >
                        <Terminal size={isMobile ? 16 : 18} style={{ flexShrink: 0 }} />
                        <span>Agent Sandbox</span>
                      </div>
                    </li>
                    <li>
                      <div 
                        className={`nav-item ${activeTab === 'theory' ? 'active' : ''}`}
                        onClick={() => setActiveTab('theory')}
                        style={isMobile ? { justifyContent: 'center', padding: '0.5rem 0.4rem', fontSize: '0.8rem', gap: '0.35rem', whiteSpace: 'nowrap' } : {}}
                      >
                        <BookOpen size={isMobile ? 16 : 18} style={{ flexShrink: 0 }} />
                        <span>Theory & Concepts</span>
                      </div>
                    </li>
                  </ul>
                </nav>

                <div className="navbar-right" style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: isMobile ? '0.5rem' : '1rem',
                  flexWrap: isMobile ? 'wrap' : 'nowrap',
                  justifyContent: isMobile ? 'center' : 'flex-end',
                  width: isMobile ? '100%' : 'auto'
                }}>
                  {/* Theme Switcher */}
                  <div style={{ display: 'flex', gap: '0.25rem', background: 'var(--bg-secondary)', padding: '0.3rem', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                    {[
                      { id: 'light', icon: <Sun size={14} /> },
                      { id: 'dark', icon: <Moon size={14} /> },
                      { id: 'system', icon: <Monitor size={14} /> }
                    ].map(t => (
                      <button
                        key={t.id}
                        onClick={() => setTheme(t.id)}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          padding: '0.35rem 0.6rem',
                          background: theme === t.id ? 'var(--bg-card)' : 'transparent',
                          color: theme === t.id ? 'var(--color-text-main)' : 'var(--color-text-muted)',
                          border: 'none',
                          borderRadius: '6px',
                          cursor: 'pointer',
                          boxShadow: theme === t.id ? '0 2px 4px rgba(0,0,0,0.1)' : 'none',
                          transition: 'all 0.2s'
                        }}
                        title={`${t.id.charAt(0).toUpperCase() + t.id.slice(1)} Mode`}
                      >
                        {t.icon}
                      </button>
                    ))}
                  </div>

                  {/* User Info & Logout */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: isMobile ? '0.4rem' : '0.75rem' }}>
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      padding: isMobile ? '0.35rem 0.5rem' : '0.35rem 0.75rem',
                      background: 'var(--bg-secondary)',
                      borderRadius: '8px',
                      border: '1px solid var(--border-color)',
                      fontSize: '0.8rem',
                      color: 'var(--color-text-muted)',
                    }}>
                      <User size={14} style={{ color: 'var(--color-accent)' }} />
                      {!isMobile && (
                        <span style={{ color: 'var(--color-text-main)', fontWeight: 500 }}>
                          {user?.username || user?.email || 'User'}
                        </span>
                      )}
                    </div>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={logout}
                      title="Sign Out"
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        padding: '0.4rem',
                        background: 'var(--bg-secondary)',
                        border: '1px solid var(--border-color)',
                        borderRadius: '8px',
                        color: 'var(--color-text-muted)',
                        cursor: 'pointer',
                        transition: 'all 0.3s',
                      }}
                    >
                      <LogOut size={16} />
                    </motion.button>
                  </div>
                </div>
              </header>

              {/* Main Content Area */}
              <main className="main-content">
                {activeTab === "sandbox" ? (
                  <AgentSandbox />
                ) : (
                  <TheoryHub />
                )}
              </main>

            </div>
          )}
        </>
      )}
    </>
  );
}
