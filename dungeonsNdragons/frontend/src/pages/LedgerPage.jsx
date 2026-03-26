import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getTeam } from '../api/client';
import FinancialTips from '../components/FinancialTips';
import { DotLottieReact } from '@lottiefiles/dotlottie-react';
import { AnimatePresence, motion } from 'framer-motion';

const STAT_LABELS = [
    { key: 'power', label: 'Power', icon: 'fitness_center' },
    { key: 'hp', label: 'HP', icon: 'favorite' },
    { key: 'mana', label: 'Mana', icon: 'auto_awesome' },
    { key: 'agility', label: 'Agility', icon: 'bolt' },
    { key: 'brain_power', label: 'Brain Power', icon: 'psychology' },
];

const CLASS_COLORS = {
    Human: '#9c8f78',
    Mage: '#bbc7dc',
    Warrior: '#ffe2ab',
    Rogue: '#ffb4a8',
    Cleric: '#4caf82',
    default: '#9c8f78',
};

function LedgerFlagAnimation({ teamName, onClose }) {
    useEffect(() => {
        const timer = setTimeout(onClose, 5000);
        return () => clearTimeout(timer);
    }, [onClose]);

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
            onClick={onClose}
            style={{
                position: 'fixed', inset: 0, zIndex: 99999,
                display: 'flex', flexDirection: 'column',
                alignItems: 'center', justifyContent: 'center',
                background: 'radial-gradient(ellipse at center, rgba(255,140,0,0.25) 0%, rgba(10,8,5,0.97) 70%)',
                cursor: 'pointer',
            }}
        >
            <motion.div
                initial={{ scale: 0.6, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: 'spring', stiffness: 120, damping: 14, delay: 0.1 }}
                style={{ width: 380, height: 380, maxWidth: '80vw', maxHeight: '50vh' }}
            >
                <DotLottieReact
                    src="/Dragon flag.lottie"
                    autoplay
                    loop
                    style={{ width: '100%', height: '100%' }}
                />
            </motion.div>
            
            <motion.div
                initial={{ y: 40, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.35, duration: 0.5 }}
                style={{ textAlign: 'center', marginTop: '-1rem' }}
            >
                <h2 style={{
                    fontFamily: 'Noto Serif, serif',
                    fontSize: 'clamp(2rem, 6vw, 4rem)',
                    fontWeight: 900,
                    color: '#ffbf00',
                    textShadow: '0 0 80px rgba(255,191,0,0.5)',
                    marginBottom: '0.5rem',
                    lineHeight: 1.1,
                }}>
                    A Challenger Appears!
                </h2>
                <p style={{
                    fontFamily: 'Space Grotesk',
                    fontSize: 'clamp(0.9rem, 2.5vw, 1.3rem)',
                    color: '#ffe2ab',
                    marginBottom: '1.5rem',
                }}>
                    {teamName} is unleashed and ready to face The Dragon.
                </p>
                <p style={{ fontFamily: 'Space Grotesk', fontSize: 11, color: '#504532', textTransform: 'uppercase', letterSpacing: '0.15em' }}>
                    Click anywhere to continue
                </p>
            </motion.div>
        </motion.div>
    );
}

export default function LedgerPage() {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [showAnim, setShowAnim] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        const teamId = localStorage.getItem('teamId');
        if (!teamId) { setLoading(false); return; }
        getTeam(teamId).then(d => {
            setData(d);
            const team = d.team || {};
            const allMet = STAT_LABELS.every(s => (team[s.key] || 0) >= 100);
            if (allMet) setShowAnim(true);
        }).finally(() => setLoading(false));
    }, []);

    if (loading) return (
        <div className="flex items-center justify-center h-64">
            <span className="material-symbols-outlined animate-spin" style={{ color: '#ffbf00', fontSize: 40 }}>autorenew</span>
        </div>
    );

    if (!data) return (
        <main style={{ maxWidth: 1400, margin: '0 auto', padding: '6rem 2rem', textAlign: 'center' }}>
            <span className="material-symbols-outlined" style={{ fontSize: 80, color: '#504532', display: 'block', marginBottom: 24 }}>menu_book</span>
            <h2 style={{ fontFamily: 'Noto Serif, serif', fontSize: '2rem', color: '#ffe2ab', marginBottom: 12 }}>No Guild Found</h2>
            <p style={{ fontFamily: 'Work Sans', color: '#9c8f78', marginBottom: 32 }}>You must forge your covenant before viewing the Ledger.</p>
            <button
                onClick={() => navigate('/register')}
                style={{ padding: '0.875rem 2rem', background: '#ffbf00', color: '#402d00', fontFamily: 'Space Grotesk', fontWeight: 700, fontSize: 13, textTransform: 'uppercase', letterSpacing: '0.1em', borderRadius: 4, border: 'none', cursor: 'pointer', boxShadow: '0 0 20px rgba(255,191,0,0.3)' }}
            >
                Register Your Guild
            </button>
        </main>
    );

    const team = data.team;
    const players = data.players || [];
    const maxStat = Math.max(...STAT_LABELS.map(s => team[s.key] || 0), 1);
    const allMet = STAT_LABELS.every(s => (team[s.key] || 0) >= 100);

    return (
        <main style={{ maxWidth: 1400, margin: '0 auto', padding: '2rem 2rem 4rem' }}>
            <AnimatePresence>
                {showAnim && (
                    <LedgerFlagAnimation
                        teamName={team.name}
                        onClose={() => setShowAnim(false)}
                    />
                )}
            </AnimatePresence>

            {/* Header */}
            <header style={{ marginBottom: '3rem' }}>
                <p style={{ fontFamily: 'Space Grotesk', fontSize: 11, color: '#ffbf00', textTransform: 'uppercase', letterSpacing: '0.15em', marginBottom: 8 }}>Guild Ledger</p>
                <h1 style={{ fontFamily: 'Noto Serif, serif', fontSize: 'clamp(2rem, 5vw, 3.5rem)', fontWeight: 900, color: '#ffe2ab', lineHeight: 1.1 }}>
                    {team.name}
                </h1>
            </header>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>

                {/* Guild Stats Panel */}
                <section style={{ background: '#1c1b1b', borderRadius: 8, padding: '2rem', border: '1px solid rgba(80,69,50,0.15)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: '1.5rem' }}>
                        <span className="material-symbols-outlined" style={{ color: '#ffbf00' }}>bar_chart</span>
                        <h2 style={{ fontFamily: 'Noto Serif, serif', color: '#ffe2ab', fontSize: '1.25rem', fontWeight: 700 }}>Guild Attributes</h2>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                        {STAT_LABELS.map(({ key, label, icon }) => {
                            const val = team[key] || 0;
                            const pct = Math.min((val / maxStat) * 100, 100);
                            return (
                                <div key={key}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                            <span className="material-symbols-outlined" style={{ color: '#ffbf00', fontSize: 16 }}>{icon}</span>
                                            <span style={{ fontFamily: 'Space Grotesk', fontSize: 12, color: '#d4c5ab', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{label}</span>
                                        </div>
                                        <span style={{ fontFamily: 'Space Grotesk', fontSize: 14, fontWeight: 700, color: '#ffe2ab' }}>{val}</span>
                                    </div>
                                    <div className="stat-bar-track">
                                        <div className="stat-bar-fill" style={{ width: `${pct}%` }} />
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </section>

                {/* Roster Panel */}
                <section style={{ background: '#1c1b1b', borderRadius: 8, padding: '2rem', border: '1px solid rgba(80,69,50,0.15)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: '1.5rem' }}>
                        <span className="material-symbols-outlined" style={{ color: '#ffbf00' }}>groups</span>
                        <h2 style={{ fontFamily: 'Noto Serif, serif', color: '#ffe2ab', fontSize: '1.25rem', fontWeight: 700 }}>Guild Roster</h2>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '2rem' }}>
                        {players.map((p, i) => {
                            const classColor = CLASS_COLORS[p.class] || CLASS_COLORS.default;
                            return (
                                <div key={p.id || i} style={{
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                    padding: '0.875rem 1rem',
                                    background: '#201f1f',
                                    borderRadius: 6,
                                }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                        <div style={{ width: 36, height: 36, borderRadius: '50%', background: '#353534', display: 'flex', alignItems: 'center', justifyContent: 'center', border: `1px solid ${classColor}30` }}>
                                            <span className="material-symbols-outlined" style={{ fontSize: 18, color: classColor }}>person</span>
                                        </div>
                                        <span style={{ fontFamily: 'Noto Serif, serif', color: '#e5e2e1', fontWeight: 700 }}>{p.name}</span>
                                    </div>
                                    <span style={{
                                        fontFamily: 'Space Grotesk', fontSize: 10, fontWeight: 700,
                                        textTransform: 'uppercase', letterSpacing: '0.08em',
                                        background: `${classColor}20`, color: classColor,
                                        border: `1px solid ${classColor}40`,
                                        padding: '2px 8px', borderRadius: 4,
                                    }}>{p.class || 'Human'}</span>
                                </div>
                            );
                        })}
                    </div>

                    {/* Inventory */}
                    <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: '1rem' }}>
                            <span className="material-symbols-outlined" style={{ color: '#9c8f78', fontSize: 18 }}>backpack</span>
                            <span style={{ fontFamily: 'Space Grotesk', fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#9c8f78' }}>Shared Vault</span>
                        </div>
                        {(team.equipment || []).length === 0 ? (
                            <p style={{ fontFamily: 'Work Sans', fontSize: 12, color: '#504532', fontStyle: 'italic' }}>No relics claimed yet...</p>
                        ) : (
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                                {team.equipment.map((item, i) => (
                                    <span key={i} className="equipment-tag">
                                        <span className="material-symbols-outlined" style={{ fontSize: 12 }}>diamond</span>
                                        {item}
                                    </span>
                                ))}
                            </div>
                        )}
                    </div>
                </section>
            </div>

            {/* ── MMI Financial Tips ── */}
            <FinancialTips />
        </main>
    );
}
