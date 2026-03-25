import { useState, useEffect, useRef } from 'react';
import { getQuests } from '../api/client';
import gsap from 'gsap';

const STAT_ICONS = {
    power: 'fitness_center', hp: 'favorite', mana: 'auto_awesome',
    agility: 'bolt', brain_power: 'psychology',
};

export default function QuestBoardPage() {
    const [quests, setQuests] = useState([]);
    const [loading, setLoading] = useState(true);
    const cardsRef = useRef([]);

    useEffect(() => {
        getQuests().then(d => setQuests(d.quests || [])).finally(() => setLoading(false));
    }, []);

    useEffect(() => {
        if (!loading && cardsRef.current.length) {
            gsap.fromTo(cardsRef.current.filter(Boolean), { y: 30, opacity: 0 }, {
                y: 0, opacity: 1, stagger: 0.1, duration: 0.6, ease: 'power2.out',
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
                    The Bounty Board
                </p>
                <h1 style={{ fontFamily: 'Noto Serif, serif', fontSize: 'clamp(2.5rem, 5vw, 4rem)', fontWeight: 900, color: '#ffe2ab', lineHeight: 1.1, marginBottom: 12 }}>
                    Available Quests
                </h1>
                <p style={{ fontFamily: 'Work Sans', color: '#d4c5ab', opacity: 0.8 }}>
                    Gamble your stats for glory. Choose wisely, adventurer.
                </p>
            </header>

            {quests.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '5rem 2rem', color: '#9c8f78' }}>
                    <span className="material-symbols-outlined" style={{ fontSize: 64, opacity: 0.3, display: 'block', marginBottom: 16 }}>auto_stories</span>
                    <p style={{ fontFamily: 'Noto Serif, serif', fontSize: '1.5rem', color: '#d4c5ab', marginBottom: 8 }}>The Quest Board is empty...</p>
                    <p style={{ fontFamily: 'Work Sans', fontSize: 13 }}>No bounties have been posted yet.</p>
                </div>
            ) : (
                <section style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
                    gap: '1.5rem',
                }}>
                    {quests.map((q, i) => (
                        <article
                            key={q.id}
                            ref={el => cardsRef.current[i] = el}
                            className="torn-edge"
                            style={{
                                background: 'rgba(244,228,188,0.04)',
                                backdropFilter: 'blur(4px)',
                                padding: '1.5rem',
                                borderLeft: '2px solid rgba(255,191,0,0.25)',
                                transition: 'background 0.3s, transform 0.3s',
                                cursor: 'default',
                            }}
                            onMouseEnter={e => {
                                e.currentTarget.style.background = 'rgba(244,228,188,0.08)';
                                e.currentTarget.style.transform = 'translateY(-2px)';
                            }}
                            onMouseLeave={e => {
                                e.currentTarget.style.background = 'rgba(244,228,188,0.04)';
                                e.currentTarget.style.transform = 'none';
                            }}
                        >
                            {/* Title row */}
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                    <span className="material-symbols-outlined" style={{ color: '#ffbf00', fontSize: 18 }}>
                                        {STAT_ICONS[q.reward_stat] || 'star'}
                                    </span>
                                    <h3 style={{ fontFamily: 'Noto Serif, serif', fontWeight: 700, color: '#ffe2ab', fontSize: '1.1rem' }}>
                                        {q.name}
                                    </h3>
                                </div>
                                <span className="material-symbols-outlined" style={{ color: '#9c8f78', fontSize: 16, opacity: 0.4 }}>history_edu</span>
                            </div>

                            {/* Description */}
                            <p style={{ fontFamily: 'Work Sans', fontSize: 13, color: '#d4c5ab', lineHeight: 1.6, marginBottom: 20, opacity: 0.8 }}>
                                {q.description || 'A mysterious quest with unknown consequences.'}
                            </p>

                            {/* Risk / Reward */}
                            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                                <span className="risk-badge">
                                    <span className="material-symbols-outlined" style={{ fontSize: 12 }}>skull</span>
                                    Risk: {q.bet_amount} {q.bet_stat?.replace('_', ' ')}
                                </span>
                                <span className="reward-badge">
                                    <span className="material-symbols-outlined" style={{ fontSize: 12 }}>star</span>
                                    Reward: +{q.reward_amount} {q.reward_stat?.replace('_', ' ')}
                                </span>
                            </div>
                        </article>
                    ))}
                </section>
            )}
        </main>
    );
}
