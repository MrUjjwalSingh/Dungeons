import { useState, useEffect, useRef } from 'react';
import { getLeaderboard, getAnnouncements } from '../api/client';
import gsap from 'gsap';

const RANK_NUMERALS = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII'];

export default function TavernPostPage() {
    const [rankings, setRankings] = useState([]);
    const [announcements, setAnnouncements] = useState([]);
    const [loading, setLoading] = useState(true);
    const whisperRef = useRef([]);

    useEffect(() => {
        async function load() {
            try {
                const [board, ann] = await Promise.all([getLeaderboard(), getAnnouncements()]);
                setRankings(board.leaderboard || []);
                setAnnouncements(ann.announcements || []);
            } catch (e) { console.error(e); }
            finally { setLoading(false); }
        }
        load();
    }, []);

    useEffect(() => {
        if (!loading && whisperRef.current.length) {
            gsap.fromTo(whisperRef.current.filter(Boolean), { x: 20, opacity: 0 }, {
                x: 0, opacity: 1, stagger: 0.1, duration: 0.5, ease: 'power2.out',
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
                <p style={{ fontFamily: 'Space Grotesk', fontSize: 11, color: '#ffbf00', textTransform: 'uppercase', letterSpacing: '0.15em', marginBottom: 8 }}>The Tavern</p>
                <h1 style={{ fontFamily: 'Noto Serif, serif', fontSize: 'clamp(2.5rem, 5vw, 4rem)', fontWeight: 900, color: '#ffe2ab', lineHeight: 1.1 }}>
                    Realm Standings
                </h1>
            </header>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '2.5rem' }}>

                {/* Leaderboard */}
                <section>
                    <h2 style={{ fontFamily: 'Noto Serif, serif', color: '#ffe2ab', fontSize: '1.5rem', fontWeight: 700, marginBottom: '1.5rem' }}>
                        Covenants of Legend
                    </h2>
                    <div className="stone-texture" style={{ background: '#1c1b1b', borderRadius: 8, overflow: 'hidden' }}>
                        {/* Header row */}
                        <div style={{ display: 'grid', gridTemplateColumns: '48px 1fr auto', gap: 16, padding: '0.75rem 1.5rem', borderBottom: '1px solid rgba(80,69,50,0.2)' }}>
                            {['Rank', 'Covenant / Party', 'Score'].map(h => (
                                <span key={h} style={{ fontFamily: 'Space Grotesk', fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#9c8f78' }}>{h}</span>
                            ))}
                        </div>
                        {/* Rows */}
                        {rankings.length === 0 ? (
                            <p style={{ padding: '2rem 1.5rem', fontFamily: 'Work Sans', color: '#504532', fontStyle: 'italic' }}>No teams registered yet.</p>
                        ) : rankings.map((team, i) => (
                            <div key={team.id || i}
                                style={{
                                    display: 'grid',
                                    gridTemplateColumns: '48px 1fr auto',
                                    gap: 16,
                                    padding: i === 0 ? '1.25rem 1.5rem' : '1rem 1.5rem',
                                    alignItems: 'center',
                                    background: i === 0 ? 'linear-gradient(to right, rgba(255,226,171,0.1), transparent)' : 'transparent',
                                    borderLeft: i === 0 ? '4px solid #ffe2ab' : '4px solid transparent',
                                    borderBottom: i < rankings.length - 1 ? '1px solid rgba(80,69,50,0.1)' : 'none',
                                    transition: 'background 0.2s',
                                }}
                            >
                                <span style={{
                                    fontFamily: 'Noto Serif, serif',
                                    fontWeight: 900,
                                    fontSize: i === 0 ? '1.75rem' : '1.25rem',
                                    color: i === 0 ? '#ffe2ab' : '#d4c5ab',
                                }}>
                                    {RANK_NUMERALS[i] || i + 1}
                                </span>
                                <div>
                                    <h3 style={{ fontFamily: 'Noto Serif, serif', color: '#e5e2e1', fontWeight: 700, fontSize: i === 0 ? '1.1rem' : '1rem', marginBottom: 2 }}>
                                        {team.name}
                                    </h3>
                                    <p style={{ fontFamily: 'Work Sans', fontSize: 11, color: '#9c8f78', opacity: 0.6 }}>
                                        {team.players?.map(p => p.name).join(', ') || '3 Adventurers'}
                                    </p>
                                </div>
                                <span style={{
                                    fontFamily: 'Space Grotesk',
                                    fontWeight: 700,
                                    fontSize: i === 0 ? '1.25rem' : '1rem',
                                    color: i === 0 ? '#ffe2ab' : '#bbc7dc',
                                }}>
                                    {team.total_stats?.toLocaleString() || '0'}
                                </span>
                            </div>
                        ))}
                    </div>
                </section>

                {/* Announcements */}
                <section>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                        <h2 style={{ fontFamily: 'Noto Serif, serif', color: '#bbc7dc', fontSize: '1.5rem', fontWeight: 700 }}>
                            Tavern Whispers
                        </h2>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                            <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#ffbf00', boxShadow: '0 0 8px #ffbf00', display: 'inline-block', animation: 'pulse 2s infinite' }} />
                            <span style={{ fontFamily: 'Space Grotesk', fontSize: 10, color: '#ffbf00', textTransform: 'uppercase', fontWeight: 700 }}>Live</span>
                        </div>
                    </div>

                    <div style={{ position: 'relative' }}>
                        {/* Timeline line */}
                        <div style={{ position: 'absolute', left: 24, top: 8, bottom: 8, width: 1, background: 'linear-gradient(to bottom, rgba(255,191,0,0.3), rgba(80,69,50,0.1))' }} />

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            {/* ── Pinned Sponsor Post ── */}
                            <div style={{ paddingLeft: '3rem', position: 'relative' }}>
                                <div style={{
                                    position: 'absolute', left: 18, top: 10, width: 12, height: 12,
                                    borderRadius: '50%',
                                    background: '#00c8b4',
                                    border: '2px solid #131313',
                                    boxShadow: '0 0 10px rgba(0,200,180,0.6)',
                                }} />
                                <div style={{
                                    background: 'linear-gradient(135deg, rgba(0,200,180,0.08), rgba(255,191,0,0.05))',
                                    border: '1px solid rgba(0,200,180,0.2)',
                                    borderRadius: 8,
                                    padding: '1rem 1.25rem',
                                }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                                        <span style={{ fontFamily: 'Space Grotesk', fontSize: 10, color: '#00c8b4', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                            📌 Pinned · Sponsor
                                        </span>
                                    </div>
                                    <p style={{ fontFamily: 'Work Sans', fontSize: 13, color: '#e5e2e1', lineHeight: 1.6, marginBottom: 8 }}>
                                        📜 <strong>GM Announcement:</strong> Want to multiply your gold? Speak to the clerics at <strong>Money Mantra Investments (MMI)</strong>! From Mutual Funds to Life Insurance, they've got your future covered.
                                    </p>
                                    <a href="https://docs.google.com/forms/d/e/1FAIpQLSd6Yza2TDpYL6T85NHXWNJGQLJFDHzaUxXYILlc6teqG2Jafw/viewform"
                                        target="_blank" rel="noopener noreferrer"
                                        style={{
                                            display: 'inline-block',
                                            padding: '6px 14px',
                                            background: '#ffbf00',
                                            color: '#402d00',
                                            fontFamily: 'Space Grotesk',
                                            fontSize: 10,
                                            fontWeight: 700,
                                            textTransform: 'uppercase',
                                            letterSpacing: '0.05em',
                                            borderRadius: 4,
                                            textDecoration: 'none',
                                            boxShadow: '0 0 10px rgba(255,191,0,0.25)',
                                        }}>
                                        Enquire Now — Select Ch.Sambhaji Nagar Branch
                                    </a>
                                </div>
                            </div>
                            {announcements.length === 0 ? (
                                <p style={{ paddingLeft: 48, fontFamily: 'Work Sans', color: '#504532', fontStyle: 'italic', fontSize: 13 }}>The tavern is quiet... for now.</p>
                            ) : announcements.map((ann, i) => (
                                <div key={ann.id || i} ref={el => whisperRef.current[i] = el}
                                    style={{ paddingLeft: '3rem', position: 'relative' }}
                                >
                                    {/* Dot */}
                                    <div style={{
                                        position: 'absolute', left: 18, top: 10, width: 12, height: 12,
                                        borderRadius: '50%',
                                        background: i === 0 ? '#ffbf00' : '#353534',
                                        border: '2px solid #131313',
                                        boxShadow: i === 0 ? '0 0 8px rgba(255,191,0,0.5)' : 'none',
                                        transition: 'all 0.3s',
                                    }} />

                                    <div className="torn-edge" style={{
                                        background: 'rgba(244,228,188,0.04)',
                                        backdropFilter: 'blur(4px)',
                                        padding: '0.875rem 1rem',
                                        borderLeft: `2px solid ${i === 0 ? 'rgba(255,191,0,0.3)' : 'rgba(80,69,50,0.2)'}`,
                                    }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                                            <span style={{ fontFamily: 'Space Grotesk', fontSize: 10, color: i === 0 ? 'rgba(255,191,0,0.8)' : 'rgba(187,199,220,0.5)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                                {ann.createdAt ? new Date(ann.createdAt).toLocaleTimeString() : 'Just Now'}
                                            </span>
                                        </div>
                                        <p style={{ fontFamily: 'Work Sans', fontSize: 13, color: i === 0 ? '#e5e2e1' : '#d4c5ab', lineHeight: 1.5, opacity: i === 0 ? 1 : 0.7 }}>
                                            {ann.message}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>
            </div>
        </main>
    );
}
