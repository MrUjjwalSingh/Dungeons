import { useState, useEffect, useCallback } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { DotLottieReact } from '@lottiefiles/dotlottie-react';
import { Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import HomePage from './pages/HomePage';
import LedgerPage from './pages/LedgerPage';
import TavernPostPage from './pages/TavernPostPage';
import RegisterPage from './pages/RegisterPage';
import AdminPage from './pages/AdminPage';
import { getAnnouncements } from './api/client';

const ENQUIRY_URL = 'https://docs.google.com/forms/d/e/1FAIpQLSd6Yza2TDpYL6T85NHXWNJGQLJFDHzaUxXYILlc6teqG2Jafw/viewform';

const MMI_TIPS = [
  "A strong party needs a strong portfolio.",
  "Shield your HP with armor, shield your family with MMI Life Insurance.",
  "Your gold won't grow in a chest. Let MMI help you multiply it.",
  "Planning for retirement? Start investing with MMI today.",
  "Diversify your stats like you diversify your portfolio.",
];

/* ── Lottie Intro Screen ───────────────────────────────────── */
function LoadingScreen({ onDone }) {
  useEffect(() => {
    const t = setTimeout(onDone, 3800);
    return () => clearTimeout(t);
  }, [onDone]);

  return (
    <motion.div
      key="intro"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, transition: { duration: 0.7 } }}
      transition={{ duration: 0.5 }}
      style={{
        position: 'fixed', inset: 0, zIndex: 99999,
        background: '#0a0605',
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        overflow: 'hidden',
      }}
    >
      {/* Radial fire glow behind the animation */}
      <div style={{
        position: 'absolute', inset: 0,
        background: 'radial-gradient(ellipse 70% 60% at 50% 55%, rgba(200,80,0,0.18) 0%, transparent 70%)',
        pointerEvents: 'none',
      }} />

      {/* Lottie */}
      <motion.div
        initial={{ scale: 0.85, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.2, duration: 0.7, ease: 'easeOut' }}
        style={{ width: 'min(520px, 90vw)', height: 'min(520px, 90vw)' }}
      >
        <DotLottieReact
          src="/Game Character Design with Dragon Effect.lottie"
          autoplay
          loop
          style={{ width: '100%', height: '100%' }}
        />
      </motion.div>

      {/* Title text */}
      <motion.div
        initial={{ y: 24, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.6, duration: 0.6 }}
        style={{ textAlign: 'center', marginTop: '-1.5rem' }}
      >
        <h1 style={{
          fontFamily: 'Noto Serif, serif',
          fontSize: 'clamp(1.8rem, 5vw, 3rem)',
          fontWeight: 900,
          color: '#ffe2ab',
          textShadow: '0 0 40px rgba(255,140,0,0.5)',
          letterSpacing: '0.04em',
          marginBottom: 6,
        }}>Dragon's Awakening</h1>
        <p style={{
          fontFamily: 'Space Grotesk',
          fontSize: 12,
          color: '#504532',
          textTransform: 'uppercase',
          letterSpacing: '0.2em',
        }}>The realm stirs...</p>
      </motion.div>
    </motion.div>
  );
}

/* ── Full Screen Ad Break ───────────────────────────────────────── */
function FullScreenAd({ onDone }) {
  const [countdown, setCountdown] = useState(8);

  useEffect(() => {
    if (countdown <= 0) {
      onDone();
      return;
    }

    const timer = setTimeout(() => {
      setCountdown(c => c - 1);
    }, 1000);

    return () => clearTimeout(timer);
  }, [countdown, onDone]);

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 99998,
      background: 'rgba(0,0,0,0.92)',
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      fontFamily: 'Space Grotesk, sans-serif',
      backdropFilter: 'blur(8px)',
    }}>
      <style>{`
                @keyframes adGlow { 0%,100% { box-shadow: 0 0 40px rgba(255,191,0,0.3); } 50% { box-shadow: 0 0 80px rgba(255,191,0,0.6); } }
            `}</style>

      {/* Badge */}
      <div style={{
        background: 'rgba(255,191,0,0.12)',
        border: '1px solid rgba(255,191,0,0.3)',
        borderRadius: 20,
        padding: '4px 16px',
        marginBottom: 24,
        fontSize: 10,
        color: '#ffbf00',
        textTransform: 'uppercase',
        letterSpacing: '0.15em',
        fontWeight: 700,
      }}>📢 A Word From Our Sponsor</div>

      {/* Logo */}
      <div style={{
        animation: 'adGlow 2s ease-in-out infinite',
        borderRadius: 16,
        padding: '2rem 3rem',
        background: 'linear-gradient(135deg, rgba(255,191,0,0.08), rgba(0,200,180,0.05))',
        border: '1px solid rgba(255,191,0,0.2)',
        textAlign: 'center',
        marginBottom: 24,
      }}>
        <img src="/assets/mmi-logo.png" alt="Money Mantra Investments"
          style={{
            width: 'clamp(160px, 40vw, 260px)',
            height: 'auto',
            filter: 'drop-shadow(0 0 40px rgba(255,191,0,0.4))',
            borderRadius: 12,
          }} />
      </div>

      {/* Message */}
      <p style={{
        color: '#d4c5ab',
        fontSize: 15,
        textAlign: 'center',
        maxWidth: 480,
        lineHeight: 1.6,
        marginBottom: 12,
      }}>
        🌟 Secure your party's future! From Mutual Funds to Life Insurance, MMI is your path to wealth creation.
      </p>

      {/* CTA */}
      <a href={ENQUIRY_URL} target="_blank" rel="noopener noreferrer"
        style={{
          display: 'inline-block',
          padding: '10px 24px',
          background: '#ffbf00',
          color: '#402d00',
          fontWeight: 700,
          fontSize: 12,
          textTransform: 'uppercase',
          letterSpacing: '0.08em',
          borderRadius: 4,
          textDecoration: 'none',
          boxShadow: '0 0 20px rgba(255,191,0,0.3)',
          marginBottom: 16,
        }}>Enquire Now — Ch.Sambhaji Nagar Branch</a>

      {/* Countdown */}
      <p style={{ color: '#504532', fontSize: 11 }}>Returning to the realm in {countdown}s...</p>
    </div>
  );
}

/* ── Main App ───────────────────────────────────────────────────── */
export default function App() {
  const [showLoader, setShowLoader] = useState(true);
  const [showAd, setShowAd] = useState(false);
  const [lastAdId, setLastAdId] = useState(() => sessionStorage.getItem('lastAdId') || '');

  const dismissLoader = useCallback(() => setShowLoader(false), []);
  const dismissAd = useCallback(() => setShowAd(false), []);

  // Poll for ad breaks every 5 seconds (only on non-admin pages)
  useEffect(() => {
    const isAdmin =
      window.location.pathname.includes('/admin') ||
      window.location.pathname.includes('/gm-portal') ||
      window.location.pathname.includes('/knights');
    if (isAdmin) return;

    const poll = setInterval(async () => {
      try {
        const data = await getAnnouncements();
        const ann = data.announcements || [];
        const adBreak = ann.find(a => a.message === '__ADBREAK__');
        if (adBreak && adBreak.id !== lastAdId) {
          setLastAdId(adBreak.id);
          sessionStorage.setItem('lastAdId', adBreak.id);
          setShowAd(true);
        }
      } catch { /* ignore */ }
    }, 5000);
    return () => clearInterval(poll);
  }, [lastAdId]);

  return (
    <div style={{
      minHeight: '100vh',
      background: `
        linear-gradient(rgba(10,6,5,0.82), rgba(10,6,5,0.82)),
        url('/image.png') center/cover no-repeat fixed
      `,
    }}>
      <AnimatePresence>
        {showLoader && <LoadingScreen onDone={dismissLoader} />}
      </AnimatePresence>

      {/* Full Screen Ad Break */}
      {showAd && <FullScreenAd onDone={dismissAd} />}

      {/* Ambient background orbs */}
      <div className="ambient-orb" style={{ width: 600, height: 600, top: '5%', left: '-10%', background: '#ffe2ab' }} />
      <div className="ambient-orb" style={{ width: 400, height: 400, bottom: '10%', right: '-5%', background: '#bbc7dc' }} />

      <Navbar />

      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/ledger" element={<LedgerPage />} />
        <Route path="/tavern" element={<TavernPostPage />} />
        <Route path="/knights" element={<AdminPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/admin" element={<AdminPage />} />
        <Route path="/gm-portal" element={<AdminPage />} />
      </Routes>
    </div>
  );
}
