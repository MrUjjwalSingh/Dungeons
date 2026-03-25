import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { getDungeons, getTeam, getDragonEligibility } from '../api/client';
import FinancialTips from '../components/FinancialTips';
import gsap from 'gsap';

const DUNGEON_ICONS = ['auto_stories', 'waves', 'local_fire_department', 'forest', 'ac_unit'];
const TIER_COLORS = {
    'Common Tier': { bg: 'rgba(59,74,91,0.4)', text: '#bbc7dc', border: 'rgba(59,74,91,0.6)' },
    'Rare Tier': { bg: 'rgba(255,184,173,0.1)', text: '#ffb8ad', border: 'rgba(255,184,173,0.3)' },
    'Elite Tier': { bg: 'rgba(255,191,0,0.1)', text: '#ffe2ab', border: 'rgba(255,191,0,0.3)' },
};
const TIERS = ['Common Tier', 'Rare Tier', 'Elite Tier', 'Rare Tier', 'Common Tier'];

export default function HomePage() {
    const [dungeons, setDungeons] = useState([]);
    const [dragonEligible, setDragonEligible] = useState(false);
    const [teamName, setTeamName] = useState(null);
    const [loading, setLoading] = useState(true);
    const cardsRef = useRef([]);
    const navigate = useNavigate();

    useEffect(() => {
        async function load() {
            try {
                const data = await getDungeons();
                setDungeons((data.dungeons || []).slice(0, 5));
                const teamId = localStorage.getItem('teamId');
                if (teamId) {
                    const t = await getTeam(teamId);
                    setTeamName(t.team?.name);
                    const elig = await getDragonEligibility(teamId);
                    setDragonEligible(elig?.eligible);
                }
            } catch (e) {
                console.error(e);
            } finally {
                setLoading(false);
            }
        }
        load();
    }, []);

    useEffect(() => {
        if (!loading && cardsRef.current.length) {
            gsap.fromTo(cardsRef.current.filter(Boolean), {
                y: 40, opacity: 0,
            }, {
                y: 0, opacity: 1, duration: 0.7, stagger: 0.12, ease: 'power3.out',
            });
        }
    }, [loading]);

    if (loading) return (
        <div className="flex items-center justify-center h-64">
            <span className="material-symbols-outlined animate-spin" style={{ color: '#ffbf00', fontSize: 40 }}>autorenew</span>
        </div>
    );

    return (
        <main style={{ maxWidth: 1400, margin: '0 auto', padding: '2rem 2rem 4rem' }}>
            {/* Header */}
            <header style={{ marginBottom: '3rem' }}>
                <p style={{ fontFamily: 'Space Grotesk', fontSize: 11, color: '#ffbf00', textTransform: 'uppercase', letterSpacing: '0.15em', marginBottom: 8 }}>
                    The Dungeon Hub
                </p>
                <h1 style={{ fontFamily: 'Noto Serif, serif', fontSize: 'clamp(2.5rem, 5vw, 4rem)', fontWeight: 900, color: '#ffe2ab', lineHeight: 1.1, marginBottom: 12 }}>
                    Choose Your Fate
                </h1>
                <p style={{ fontFamily: 'Work Sans', color: '#d4c5ab', maxWidth: 600, opacity: 0.8, lineHeight: 1.6 }}>
                    Conquer the depths, claim the artifacts, and prepare for the ultimate confrontation with The Dragon.
                </p>
            </header>

            {/* Dungeon Grid */}
            <section style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.5rem', marginBottom: '4rem' }}>
                {dungeons.map((d, i) => {
                    const tier = TIERS[i % TIERS.length];
                    const tc = TIER_COLORS[tier] || TIER_COLORS['Common Tier'];
                    return (
                        <article
                            key={d.id}
                            ref={el => cardsRef.current[i] = el}
                            className="parchment-mask"
                            style={{
                                background: '#1c1b1b',
                                padding: '1.5rem',
                                display: 'flex',
                                flexDirection: 'column',
                                minHeight: 320,
                                border: '1px solid rgba(80,69,50,0.15)',
                                cursor: 'default',
                                transition: 'box-shadow 0.3s',
                            }}
                            onMouseEnter={e => e.currentTarget.style.boxShadow = '0 0 40px rgba(255,226,171,0.08)'}
                            onMouseLeave={e => e.currentTarget.style.boxShadow = 'none'}
                        >
                            {/* Tier badge */}
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
                                <span style={{
                                    fontFamily: 'Space Grotesk', fontSize: 9, fontWeight: 700,
                                    textTransform: 'uppercase', letterSpacing: '0.1em',
                                    background: tc.bg, color: tc.text,
                                    border: `1px solid ${tc.border}`,
                                    padding: '2px 8px', borderRadius: 12,
                                }}>{tier}</span>
                                <span className="material-symbols-outlined" style={{ color: '#ffbf00', fontSize: 20 }}>{DUNGEON_ICONS[i]}</span>
                            </div>

                            <h3 style={{ fontFamily: 'Noto Serif, serif', fontSize: '1.4rem', color: '#ffe2ab', marginBottom: 8, lineHeight: 1.2 }}>
                                {d.name}
                            </h3>
                            <p style={{ fontFamily: 'Work Sans', fontSize: 13, color: '#d4c5ab', lineHeight: 1.5, flex: 1, opacity: 0.8 }}>
                                {d.description || 'A perilous challenge awaits those brave enough to enter.'}
                            </p>

                            {/* Stats */}
                            <div style={{ marginTop: 20, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: 8 }}>
                                <div>
                                    <span style={{ fontFamily: 'Space Grotesk', fontSize: 9, textTransform: 'uppercase', color: '#9c8f78', display: 'block', marginBottom: 4 }}>Required Stat</span>
                                    <span style={{ fontFamily: 'Space Grotesk', fontSize: 12, fontWeight: 700, color: '#bbc7dc' }}>
                                        {d.required_amount} {d.required_stat?.replace('_', ' ')}
                                    </span>
                                </div>
                                <div style={{ textAlign: 'right' }}>
                                    <span style={{ fontFamily: 'Space Grotesk', fontSize: 9, textTransform: 'uppercase', color: '#9c8f78', display: 'block', marginBottom: 4 }}>Reward</span>
                                    <span style={{ fontFamily: 'Work Sans', fontSize: 12, fontStyle: 'italic', color: '#fbbc00' }}>
                                        {d.equipment_name}
                                    </span>
                                    <span style={{ fontFamily: 'Space Grotesk', fontSize: 10, color: '#bbc7dc', display: 'block' }}>
                                        → {d.class_granted}
                                    </span>
                                </div>
                            </div>
                        </article>
                    );
                })}
            </section>

            {/* Final Boss */}
            <section className="red-glow" style={{
                background: 'linear-gradient(135deg, #1a0505, #050505)',
                border: '1px solid rgba(74,4,4,0.8)',
                borderRadius: 12,
                padding: '3rem 2.5rem',
                display: 'flex',
                flexDirection: 'column',
                gap: '2rem',
            }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    <span style={{ fontFamily: 'Space Grotesk', fontSize: 11, color: '#ff4500', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                        Level 100 World Boss
                    </span>
                    <h2 style={{ fontFamily: 'Noto Serif, serif', fontSize: 'clamp(2rem, 4vw, 3.5rem)', fontWeight: 900, color: '#e5e2e1', lineHeight: 1.1 }}>
                        Final Boss: The Dragon
                    </h2>
                    <p style={{ fontFamily: 'Work Sans', color: '#d4c5ab', maxWidth: 560, lineHeight: 1.6 }}>
                        The Scourge of Aethelgard. His breath consumes kingdoms. Only those wielding three artifacts of the Ancients may challenge his reign.
                    </p>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', flexWrap: 'wrap' }}>
                    <button
                        disabled={!dragonEligible}
                        style={{
                            padding: '1rem 2rem',
                            fontFamily: 'Noto Serif, serif',
                            fontWeight: 700,
                            fontSize: '1rem',
                            borderRadius: 6,
                            border: 'none',
                            cursor: dragonEligible ? 'pointer' : 'not-allowed',
                            background: dragonEligible ? '#ffbf00' : '#353534',
                            color: dragonEligible ? '#402d00' : '#9c8f78',
                            opacity: dragonEligible ? 1 : 0.7,
                            display: 'flex', alignItems: 'center', gap: 8,
                            boxShadow: dragonEligible ? '0 0 20px rgba(255,191,0,0.4)' : 'none',
                            transition: 'all 0.3s',
                        }}
                    >
                        <span className="material-symbols-outlined">{dragonEligible ? 'swords' : 'lock'}</span>
                        {dragonEligible ? 'Challenge the Dragon' : 'Boss Locked'}
                    </button>
                    {!dragonEligible && (
                        <div>
                            <span style={{ fontFamily: 'Space Grotesk', fontSize: 10, color: 'rgba(255,69,0,0.7)', fontWeight: 700, textTransform: 'uppercase', display: 'block' }}>Lock Requirement</span>
                            <span style={{ fontFamily: 'Work Sans', color: '#d4c5ab', fontStyle: 'italic', fontSize: 13 }}>Requires 3 pieces of equipment to unlock</span>
                        </div>
                    )}
                </div>
            </section>

            {/* ── MMI Financial Tips ── */}
            <FinancialTips />

            {/* Unregistered CTA */}
            {!teamName && (
                <div style={{ marginTop: '2rem', background: '#1c1b1b', border: '1px solid rgba(255,191,0,0.15)', borderRadius: 8, padding: '1.5rem 2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
                    <div>
                        <p style={{ fontFamily: 'Noto Serif, serif', fontWeight: 700, color: '#ffe2ab', marginBottom: 4, fontSize: '1.1rem' }}>No Guild Registered</p>
                        <p style={{ fontFamily: 'Work Sans', color: '#9c8f78', fontSize: 13 }}>Sign the Blood Charter to enter the realm and begin your journey.</p>
                    </div>
                    <button
                        onClick={() => navigate('/register')}
                        style={{ padding: '0.75rem 1.5rem', background: '#ffbf00', color: '#402d00', fontFamily: 'Space Grotesk', fontWeight: 700, fontSize: 13, textTransform: 'uppercase', letterSpacing: '0.08em', borderRadius: 4, border: 'none', cursor: 'pointer', boxShadow: '0 0 15px rgba(255,191,0,0.2)' }}
                    >
                        Register Soul
                    </button>
                </div>
            )}
        </main>
    );
}
