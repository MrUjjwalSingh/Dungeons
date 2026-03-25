import { useState } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import TeamSelector from './TeamSelector';

const ENQUIRY_URL = 'https://docs.google.com/forms/d/e/1FAIpQLSd6Yza2TDpYL6T85NHXWNJGQLJFDHzaUxXYILlc6teqG2Jafw/viewform';

const links = [
    { to: '/', label: 'Home', icon: 'fort' },
    { to: '/quests', label: 'Quests', icon: 'auto_stories' },
    { to: '/ledger', label: 'Ledger', icon: 'menu_book' },
    { to: '/tavern', label: 'Tavern', icon: 'sports_bar' },
];

export default function Navbar() {
    const navigate = useNavigate();
    const location = useLocation();
    const teamName = localStorage.getItem('teamName') || null;
    const [selectorOpen, setSelectorOpen] = useState(false);

    const isAdmin = location.pathname.includes('/admin') || location.pathname.includes('/gm-portal');

    return (
        <>
            {/* ── MMI Sponsor Ticker ── */}
            <div className="mmi-ticker" style={{
                background: 'linear-gradient(90deg, #1a0f00, #2a1a00, #1a0f00)',
                borderBottom: '1px solid rgba(255,191,0,0.15)',
                overflow: 'hidden',
                position: 'relative',
                height: 28,
            }}>
                <style>{`
                    @keyframes tickerScroll {
                        0%   { transform: translateX(100%); }
                        100% { transform: translateX(-100%); }
                    }
                `}</style>
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 32,
                    whiteSpace: 'nowrap',
                    height: '100%',
                    animation: 'tickerScroll 25s linear infinite',
                }}>
                    {[1, 2, 3].map(k => (
                        <span key={k} style={{
                            fontFamily: 'Space Grotesk, sans-serif',
                            fontSize: 11,
                            color: '#ffbf00',
                            letterSpacing: '0.05em',
                        }}>
                            🌟 Proudly sponsored by <strong>Money Mantra Investments (MMI)</strong> — Your Path to Wealth Creation
                            &nbsp;&nbsp;|&nbsp;&nbsp;
                            Mutual Funds · Life Insurance · Health Insurance · Tax Saving
                            &nbsp;&nbsp;|&nbsp;&nbsp;
                            <a href={ENQUIRY_URL} target="_blank" rel="noopener noreferrer"
                                style={{ color: '#00c8b4', textDecoration: 'underline', fontWeight: 700 }}>
                                Enquire Now (Select Ch.Sambhaji Nagar Branch)
                            </a>
                            &nbsp;&nbsp;&nbsp;&nbsp;
                        </span>
                    ))}
                </div>
            </div>

            {/* ══════════════ Desktop Top Navbar ══════════════ */}
            <nav className="desktop-nav" style={{
                background: 'rgba(19,19,19,0.95)',
                backdropFilter: 'blur(12px)',
                boxShadow: '0 10px 30px -15px rgba(255,191,0,0.12)',
                borderBottom: '1px solid rgba(80,69,50,0.15)',
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                padding: '0 2rem',
                height: 56,
                position: 'sticky', top: 0, zIndex: 50,
            }}>
                {/* Logo + links */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 32 }}>
                    <span
                        onClick={() => navigate('/')}
                        style={{
                            cursor: 'pointer', fontFamily: 'Noto Serif, serif',
                            fontSize: '1.4rem', fontWeight: 900, color: '#ffe2ab',
                            textShadow: '0 0 20px rgba(255,226,171,0.4)',
                            userSelect: 'none',
                        }}
                    >Dragon's Awakening</span>

                    <div className="desktop-links" style={{ display: 'flex', gap: 24, alignItems: 'center' }}>
                        {links.map(({ to, label }) => (
                            <NavLink key={to} to={to}
                                style={({ isActive }) => ({
                                    fontFamily: 'Noto Serif, serif',
                                    fontSize: '1rem', fontWeight: 700,
                                    color: isActive ? '#ffe2ab' : '#bbc7dc',
                                    borderBottom: isActive ? '2px solid #ffbf00' : '2px solid transparent',
                                    paddingBottom: 4,
                                    textDecoration: 'none',
                                    opacity: isActive ? 1 : 0.7,
                                    transition: 'all 0.2s',
                                })}
                            >{label}</NavLink>
                        ))}
                    </div>
                </div>

                {/* Right side */}
                <div>
                    {teamName ? (
                        <button onClick={() => setSelectorOpen(true)} style={{
                            display: 'flex', alignItems: 'center', gap: 8,
                            padding: '6px 14px', borderRadius: 6,
                            background: 'rgba(255,191,0,0.08)',
                            border: '1px solid rgba(255,191,0,0.2)',
                            cursor: 'pointer',
                        }}>
                            <span className="material-symbols-outlined" style={{ color: '#ffbf00', fontSize: 16 }}>shield</span>
                            <span style={{ fontFamily: 'Space Grotesk, sans-serif', color: '#ffe2ab', fontSize: 12, fontWeight: 600 }}>
                                {teamName}
                            </span>
                            <span className="material-symbols-outlined" style={{ color: '#504532', fontSize: 14 }}>swap_horiz</span>
                        </button>
                    ) : (
                        <button
                            onClick={() => setSelectorOpen(true)}
                            style={{
                                padding: '8px 20px', fontFamily: 'Space Grotesk, sans-serif',
                                fontWeight: 700, fontSize: 12, textTransform: 'uppercase',
                                letterSpacing: '0.08em',
                                background: '#ffbf00', color: '#402d00',
                                borderRadius: 4, border: 'none', cursor: 'pointer',
                                boxShadow: '0 0 15px rgba(255,191,0,0.2)',
                            }}
                        >Select Team</button>
                    )}
                </div>
            </nav>

            {/* ══════════════ Mobile Bottom Tab Bar ══════════════ */}
            {!isAdmin && (
                <nav className="mobile-bottom-nav" style={{
                    position: 'fixed', bottom: 0, left: 0, right: 0,
                    zIndex: 9980,
                    background: 'rgba(19,19,19,0.97)',
                    backdropFilter: 'blur(12px)',
                    borderTop: '1px solid rgba(80,69,50,0.2)',
                    display: 'flex',
                    height: 60,
                    boxShadow: '0 -4px 20px rgba(0,0,0,0.4)',
                }}>
                    {links.map(({ to, label, icon }) => {
                        const isActive = location.pathname === to;
                        return (
                            <NavLink key={to} to={to} style={{
                                flex: 1,
                                display: 'flex', flexDirection: 'column',
                                alignItems: 'center', justifyContent: 'center',
                                gap: 2,
                                textDecoration: 'none',
                                color: isActive ? '#ffbf00' : '#9c8f78',
                                transition: 'color 0.2s',
                                position: 'relative',
                            }}>
                                {isActive && <div style={{
                                    position: 'absolute', top: 0, left: '25%', right: '25%',
                                    height: 2, background: '#ffbf00', borderRadius: '0 0 2px 2px',
                                }} />}
                                <span className="material-symbols-outlined" style={{
                                    fontSize: 22,
                                    fontVariationSettings: isActive ? "'FILL' 1" : "'FILL' 0",
                                }}>{icon}</span>
                                <span style={{
                                    fontFamily: 'Space Grotesk, sans-serif',
                                    fontSize: 9, fontWeight: 700,
                                    textTransform: 'uppercase',
                                    letterSpacing: '0.05em',
                                }}>{label}</span>
                            </NavLink>
                        );
                    })}

                    {/* Team / Join Tab */}
                    <button onClick={() => setSelectorOpen(true)} style={{
                        flex: 1,
                        display: 'flex', flexDirection: 'column',
                        alignItems: 'center', justifyContent: 'center',
                        gap: 2,
                        background: 'none', border: 'none',
                        color: teamName ? '#ffe2ab' : '#00c8b4',
                        cursor: 'pointer',
                    }}>
                        <span className="material-symbols-outlined" style={{
                            fontSize: 22,
                            fontVariationSettings: "'FILL' 1",
                        }}>{teamName ? 'shield' : 'group_add'}</span>
                        <span style={{
                            fontFamily: 'Space Grotesk, sans-serif',
                            fontSize: 9, fontWeight: 700,
                            textTransform: 'uppercase',
                            letterSpacing: '0.05em',
                            maxWidth: 60,
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                        }}>{teamName || 'Join'}</span>
                    </button>
                </nav>
            )}

            {/* ── Team Selector Modal ── */}
            <TeamSelector isOpen={selectorOpen} onClose={() => setSelectorOpen(false)} />

            {/* ── Responsive CSS ── */}
            <style>{`
                /* Desktop: show top nav, hide bottom */
                .desktop-nav { display: flex !important; }
                .desktop-links { display: flex !important; }
                .mobile-bottom-nav { display: none !important; }

                @media (max-width: 768px) {
                    .desktop-nav { display: flex !important; }
                    .desktop-links { display: none !important; }
                    .desktop-nav {
                        justify-content: center !important;
                        padding: 0 1rem !important;
                        height: 48px !important;
                    }
                    .desktop-nav > div:last-child { display: none !important; }
                    .mobile-bottom-nav { display: flex !important; }
                }
            `}</style>
        </>
    );
}
