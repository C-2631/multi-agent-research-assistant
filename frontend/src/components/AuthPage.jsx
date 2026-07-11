import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Layers, Mail, Lock, User, ArrowRight, Eye, EyeOff, AlertCircle } from 'lucide-react';
import { useAuthStore } from '../store/useAuthStore';

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [showColdStartNotice, setShowColdStartNotice] = useState(false);
  const [formData, setFormData] = useState({ email: '', username: '', password: '' });
  const { login, register, isLoading, error, clearError } = useAuthStore();

  useEffect(() => {
    let timer;
    if (isLoading) {
      timer = setTimeout(() => {
        setShowColdStartNotice(true);
      }, 4000);
    } else {
      setShowColdStartNotice(false);
    }
    return () => clearTimeout(timer);
  }, [isLoading]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    clearError();
    if (isLogin) {
      await login(formData.email, formData.password, rememberMe);
    } else {
      if (!formData.username.trim()) return;
      await register(formData.email, formData.username, formData.password, rememberMe);
    }
  };

  const handleInputChange = (field, value) => {
    clearError();
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const toggleMode = () => {
    clearError();
    setIsLogin(!isLogin);
    setFormData({ email: '', username: '', password: '' });
  };

  // Animated floating particles
  const particles = Array.from({ length: 20 }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    y: Math.random() * 100,
    size: Math.random() * 4 + 2,
    duration: Math.random() * 10 + 10,
    delay: Math.random() * 5,
  }));

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'var(--bg-primary)',
      backgroundImage: 
        'linear-gradient(var(--border-color) 1px, transparent 1px), linear-gradient(90deg, var(--border-color) 1px, transparent 1px)',
      backgroundSize: '40px 40px',
      position: 'relative',
      overflow: 'hidden',
      fontFamily: 'var(--font-sans)',
    }}>
      {/* Animated Background Particles */}
      {particles.map(p => (
        <motion.div
          key={p.id}
          style={{
            position: 'absolute',
            left: `${p.x}%`,
            top: `${p.y}%`,
            width: `${p.size}px`,
            height: `${p.size}px`,
            borderRadius: '50%',
            background: 'var(--color-accent)',
            opacity: 0.15,
            pointerEvents: 'none',
          }}
          animate={{
            y: [0, -30, 0, 30, 0],
            x: [0, 15, -15, 0],
            opacity: [0.1, 0.3, 0.1],
          }}
          transition={{
            duration: p.duration,
            delay: p.delay,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
      ))}

      {/* Ambient Glow */}
      <div style={{
        position: 'absolute',
        width: '600px',
        height: '600px',
        background: 'radial-gradient(circle, var(--color-accent-glow) 0%, transparent 70%)',
        opacity: 0.15,
        filter: 'blur(80px)',
        top: '20%',
        left: '50%',
        transform: 'translateX(-50%)',
        pointerEvents: 'none',
      }} />

      {/* Auth Card */}
      <motion.div
        initial={{ opacity: 0, y: 40, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.6, type: 'spring', stiffness: 100 }}
        style={{
          width: '440px',
          maxWidth: '90vw',
          position: 'relative',
          zIndex: 10,
        }}
      >
        {/* Logo Section */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            marginBottom: '2rem',
          }}
        >
          <motion.div
            animate={{ rotate: [0, 360] }}
            transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
            style={{
              width: '64px',
              height: '64px',
              borderRadius: '16px',
              background: 'var(--bg-card)',
              border: '2px solid var(--color-accent)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 0 30px var(--color-accent-glow)',
              marginBottom: '1rem',
            }}
          >
            <Layers size={32} style={{ color: 'var(--color-accent)' }} />
          </motion.div>
          <h1 style={{
            fontSize: '1.8rem',
            fontWeight: 700,
            color: 'var(--color-text-main)',
            letterSpacing: '-0.02em',
            textAlign: 'center',
          }}>
            Agentic Lab
          </h1>
          <p style={{
            color: 'var(--color-text-muted)',
            fontSize: '0.85rem',
            marginTop: '0.4rem',
            textAlign: 'center',
          }}>
            Multi-Agent Research Assistant
          </p>
        </motion.div>

        {/* Card Container */}
        <div
          className="glass-panel block-morphism"
          style={{
            padding: '2rem',
            borderRadius: '16px',
          }}
        >
          {/* Toggle Tabs */}
          <div style={{
            display: 'flex',
            background: 'var(--bg-secondary)',
            borderRadius: '10px',
            padding: '4px',
            marginBottom: '1.5rem',
            border: '1px solid var(--border-color)',
          }}>
            {['Login', 'Sign Up'].map((label, idx) => {
              const active = idx === 0 ? isLogin : !isLogin;
              return (
                <motion.button
                  key={label}
                  onClick={() => { if (idx === 0 ? !isLogin : isLogin) toggleMode(); }}
                  whileTap={{ scale: 0.98 }}
                  style={{
                    flex: 1,
                    padding: '0.6rem',
                    borderRadius: '8px',
                    border: 'none',
                    background: active ? 'var(--bg-card)' : 'transparent',
                    color: active ? 'var(--color-text-main)' : 'var(--color-text-muted)',
                    fontWeight: active ? 600 : 400,
                    fontSize: '0.9rem',
                    cursor: 'pointer',
                    fontFamily: 'var(--font-sans)',
                    boxShadow: active ? '0 2px 8px rgba(0,0,0,0.2)' : 'none',
                    transition: 'all 0.3s',
                  }}
                >
                  {label}
                </motion.button>
              );
            })}
          </div>

          {/* Error Message */}
          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  padding: '0.75rem 1rem',
                  background: 'rgba(239, 68, 68, 0.1)',
                  border: '1px solid rgba(239, 68, 68, 0.3)',
                  borderRadius: '8px',
                  marginBottom: '1rem',
                  fontSize: '0.8rem',
                  color: '#f87171',
                }}
              >
                <AlertCircle size={16} />
                {error}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Cold Start Notice */}
          <AnimatePresence>
            {showColdStartNotice && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  padding: '0.75rem 1rem',
                  background: 'rgba(59, 130, 246, 0.1)',
                  border: '1px solid rgba(59, 130, 246, 0.3)',
                  borderRadius: '8px',
                  marginBottom: '1rem',
                  fontSize: '0.8rem',
                  color: '#60a5fa',
                  lineHeight: 1.4,
                }}
              >
                <Layers size={18} style={{ flexShrink: 0 }} />
                <span>
                  <strong>🚀 Live server waking up...</strong><br />
                  Since the server sleeps after inactivity on free-tier, first login takes ~15-25 seconds. Hang tight!
                </span>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Form */}
          <AnimatePresence mode="wait">
            <motion.form
              key={isLogin ? 'login' : 'signup'}
              initial={{ opacity: 0, x: isLogin ? -20 : 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: isLogin ? 20 : -20 }}
              transition={{ duration: 0.25 }}
              onSubmit={handleSubmit}
              style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}
            >
              {/* Username Field (Sign Up only) */}
              {!isLogin && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  style={{ position: 'relative' }}
                >
                  <User size={16} style={{
                    position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)',
                    color: 'var(--color-text-muted)', pointerEvents: 'none',
                  }} />
                  <input
                    type="text"
                    placeholder="Full Name"
                    value={formData.username}
                    onChange={(e) => handleInputChange('username', e.target.value)}
                    required={!isLogin}
                    style={{
                      width: '100%',
                      padding: '0.75rem 0.75rem 0.75rem 2.5rem',
                      background: 'var(--bg-secondary)',
                      border: '1px solid var(--border-color)',
                      borderRadius: '10px',
                      color: 'var(--color-text-main)',
                      fontSize: '0.9rem',
                      outline: 'none',
                      fontFamily: 'var(--font-sans)',
                      transition: 'border-color 0.3s',
                      boxSizing: 'border-box',
                    }}
                    onFocus={(e) => e.target.style.borderColor = 'var(--color-accent)'}
                    onBlur={(e) => e.target.style.borderColor = 'var(--border-color)'}
                  />
                </motion.div>
              )}

              {/* Email Field */}
              <div style={{ position: 'relative' }}>
                <Mail size={16} style={{
                  position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)',
                  color: 'var(--color-text-muted)', pointerEvents: 'none',
                }} />
                <input
                  type="email"
                  placeholder="Email address"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  required
                  style={{
                    width: '100%',
                    padding: '0.75rem 0.75rem 0.75rem 2.5rem',
                    background: 'var(--bg-secondary)',
                    border: '1px solid var(--border-color)',
                    borderRadius: '10px',
                    color: 'var(--color-text-main)',
                    fontSize: '0.9rem',
                    outline: 'none',
                    fontFamily: 'var(--font-sans)',
                    transition: 'border-color 0.3s',
                    boxSizing: 'border-box',
                  }}
                  onFocus={(e) => e.target.style.borderColor = 'var(--color-accent)'}
                  onBlur={(e) => e.target.style.borderColor = 'var(--border-color)'}
                />
              </div>

              {/* Password Field */}
              <div style={{ position: 'relative' }}>
                <Lock size={16} style={{
                  position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)',
                  color: 'var(--color-text-muted)', pointerEvents: 'none',
                }} />
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Password"
                  value={formData.password}
                  onChange={(e) => handleInputChange('password', e.target.value)}
                  required
                  minLength={6}
                  style={{
                    width: '100%',
                    padding: '0.75rem 2.5rem 0.75rem 2.5rem',
                    background: 'var(--bg-secondary)',
                    border: '1px solid var(--border-color)',
                    borderRadius: '10px',
                    color: 'var(--color-text-main)',
                    fontSize: '0.9rem',
                    outline: 'none',
                    fontFamily: 'var(--font-sans)',
                    transition: 'border-color 0.3s',
                    boxSizing: 'border-box',
                  }}
                  onFocus={(e) => e.target.style.borderColor = 'var(--color-accent)'}
                  onBlur={(e) => e.target.style.borderColor = 'var(--border-color)'}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{
                    position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)',
                    background: 'none', border: 'none', color: 'var(--color-text-muted)',
                    cursor: 'pointer', padding: '2px', display: 'flex',
                  }}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>

              {/* Remember Me Checkbox */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.8rem', color: 'var(--color-text-muted)', marginTop: '-0.2rem' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', cursor: 'pointer', userSelect: 'none' }}>
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    style={{ accentColor: 'var(--color-accent)', cursor: 'pointer', width: '15px', height: '15px' }}
                  />
                  <span>Remember me on this device</span>
                </label>
                {!rememberMe && (
                  <span style={{ fontSize: '0.72rem', color: '#f59e0b', fontStyle: 'italic' }}>Clears on browser close</span>
                )}
              </div>

              {/* Submit Button */}
              <motion.button
                type="submit"
                disabled={isLoading}
                whileHover={{ scale: isLoading ? 1 : 1.02 }}
                whileTap={{ scale: isLoading ? 1 : 0.98 }}
                style={{
                  width: '100%',
                  padding: '0.85rem',
                  background: isLoading ? 'var(--bg-secondary)' : 'var(--color-accent)',
                  color: isLoading ? 'var(--color-text-muted)' : '#000',
                  border: 'none',
                  borderRadius: '10px',
                  fontSize: '0.95rem',
                  fontWeight: 600,
                  cursor: isLoading ? 'wait' : 'pointer',
                  fontFamily: 'var(--font-sans)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.5rem',
                  boxShadow: isLoading ? 'none' : '0 4px 15px var(--color-accent-glow)',
                  transition: 'all 0.3s',
                  marginTop: '0.5rem',
                }}
              >
                {isLoading ? (
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                    style={{
                      width: '20px', height: '20px', border: '2px solid var(--color-text-muted)',
                      borderTop: '2px solid var(--color-accent)', borderRadius: '50%',
                    }}
                  />
                ) : (
                  <>
                    {isLogin ? 'Sign In' : 'Create Account'}
                    <ArrowRight size={18} />
                  </>
                )}
              </motion.button>
            </motion.form>
          </AnimatePresence>

        </div>

        {/* Footer */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          style={{
            textAlign: 'center',
            fontSize: '0.75rem',
            color: 'var(--color-text-muted)',
            marginTop: '1.5rem',
            lineHeight: 1.5,
          }}
        >
          By continuing, you agree to our Terms of Service.
          <br />
          Your research data is stored securely in our database.
        </motion.p>
      </motion.div>
    </div>
  );
}
