import { useState, useEffect, useCallback } from 'react';
import { Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import HomePage from './pages/HomePage';
import QuestBoardPage from './pages/QuestBoardPage';
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

/* ── MMI Loading Screen ─────────────────────────────────────────── */
function LoadingScreen({ onDone }) {
  const [tipIdx] = useState(() => Math.floor(Math.random() * MMI_TIPS.length));
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setProgress(p => {
        if (p >= 100) { clearInterval(timer); return 100; }
        return p + 2;
      });
    }, 40);
    const done = setTimeout(onDone, 2500);
    return () => { clearInterval(timer); clearTimeout(done); };
  }, [onDone]);

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 99999,
      background: 'radial-gradient(ellipse at center, #1a1a1a 0%, #0a0a0a 100%)',
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      fontFamily: 'Space Grotesk, sans-serif',
    }}>
      <style>{`
                @keyframes mmiPulse { 0%,100% { opacity:0.7; transform:scale(1); } 50% { opacity:1; transform:scale(1.05); } }
                @keyframes shimmer { 0% { background-position: -200% 0; } 100% { background-position: 200% 0; } }
            `}</style>

      {/* MMI Logo */}
      <div style={{
        animation: 'mmiPulse 2s ease-in-out infinite',
        marginBottom: 24,
        textAlign: 'center',
      }}>
        <img src="/assets/mmi-logo.png" alt="Money Mantra Investments"
          style={{
            width: 'clamp(140px, 35vw, 220px)',
            height: 'auto',
            filter: 'drop-shadow(0 0 30px rgba(255,191,0,0.3))',
            borderRadius: 12,
          }} />
      </div>

      {/* Loader bar */}
      <div style={{
        width: 'min(300px, 80vw)',
        height: 4,
        background: '#2a2a2a',
        borderRadius: 2,
        overflow: 'hidden',
        marginBottom: 20,
      }}>
        <div style={{
          height: '100%',
          width: `${progress}%`,
          background: 'linear-gradient(90deg, #ffbf00, #ffe2ab)',
          borderRadius: 2,
          transition: 'width 0.1s linear',
          boxShadow: '0 0 12px rgba(255,191,0,0.4)',
        }} />
      </div>

      {/* Game title */}
      <p style={{
        fontFamily: 'Noto Serif, serif',
        fontSize: 'clamp(1rem, 2.5vw, 1.4rem)',
        color: '#ffe2ab',
        fontWeight: 700,
        marginBottom: 8,
        textAlign: 'center',
      }}>Dragon's Awakening</p>

      <p style={{
        fontSize: 11,
        color: '#504532',
        textAlign: 'center',
        maxWidth: 360,
        lineHeight: 1.6,
      }}>Powered by Money Mantra Investments (MMI)</p>

      {/* Financial tip */}
      <p style={{
        fontSize: 12,
        color: '#00c8b4',
        fontStyle: 'italic',
        textAlign: 'center',
        maxWidth: 380,
        lineHeight: 1.5,
        marginTop: 16,
        opacity: 0.8,
      }}>💰 {MMI_TIPS[tipIdx]}</p>
    </div>
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
    const isAdmin = window.location.pathname.includes('/admin') || window.location.pathname.includes('/gm-portal');
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
    <div style={{ minHeight: '100vh', background: '#131313' }}>
      {/* Loading Screen */}
      {showLoader && <LoadingScreen onDone={dismissLoader} />}

      {/* Full Screen Ad Break */}
      {showAd && <FullScreenAd onDone={dismissAd} />}

      {/* Ambient background orbs */}
      <div className="ambient-orb" style={{ width: 600, height: 600, top: '5%', left: '-10%', background: '#ffe2ab' }} />
      <div className="ambient-orb" style={{ width: 400, height: 400, bottom: '10%', right: '-5%', background: '#bbc7dc' }} />

      <Navbar />

      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/quests" element={<QuestBoardPage />} />
        <Route path="/ledger" element={<LedgerPage />} />
        <Route path="/tavern" element={<TavernPostPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/admin" element={<AdminPage />} />
        <Route path="/gm-portal" element={<AdminPage />} />
      </Routes>
    </div>
  );
}
