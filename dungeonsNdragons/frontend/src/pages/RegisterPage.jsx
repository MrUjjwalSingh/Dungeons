import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { registerTeam } from '../api/client';

export default function RegisterPage() {
    const [form, setForm] = useState({ teamName: '', player1: '', player2: '', player3: '' });
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(null);
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleChange = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

    const handleSubmit = async e => {
        e.preventDefault();
        if (!form.teamName || !form.player1 || !form.player2 || !form.player3) {
            setError('All fields are required to forge the covenant.'); return;
        }
        setLoading(true); setError('');
        try {
            const res = await registerTeam({ name: form.teamName, players: [form.player1, form.player2, form.player3] });
            localStorage.setItem('teamId', res.team.id);
            localStorage.setItem('teamName', res.team.name);
            setSuccess(res.team);
        } catch (err) {
            setError(err.message || 'The covenant failed. Try again.');
        } finally {
            setLoading(false);
        }
    };

    const inputStyle = {
        width: '100%',
        background: '#353534',
        border: 'none',
        borderRadius: 4,
        padding: '0.875rem 1rem',
        color: '#e5e2e1',
        fontFamily: 'Work Sans',
        fontSize: 14,
        outline: 'none',
        boxShadow: 'inset 0 2px 8px rgba(0,0,0,0.3)',
        transition: 'box-shadow 0.2s',
    };

    if (success) return (
        <main style={{ maxWidth: 560, margin: '4rem auto', padding: '2rem', textAlign: 'center' }}>
            <div style={{
                background: '#1c1b1b',
                border: '1px solid rgba(255,191,0,0.25)',
                borderRadius: 12,
                padding: '3rem 2rem',
                boxShadow: '0 0 60px rgba(255,191,0,0.1)',
            }}>
                {/* Seal */}
                <div style={{
                    width: 96, height: 96, borderRadius: '50%',
                    background: 'radial-gradient(circle, #ffbf00, #a67c00)',
                    boxShadow: '0 0 40px rgba(255,191,0,0.4)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    margin: '0 auto 1.5rem',
                }}>
                    <span className="material-symbols-outlined" style={{ fontSize: 48, color: '#402d00' }}>verified</span>
                </div>
                <h2 style={{ fontFamily: 'Noto Serif, serif', fontSize: '2rem', fontWeight: 900, color: '#ffe2ab', marginBottom: 8 }}>
                    Covenant Sealed!
                </h2>
                <p style={{ fontFamily: 'Work Sans', color: '#9c8f78', marginBottom: '2rem' }}>Your guild has been forged in the fires of legend.</p>

                {/* Summary card */}
                <div style={{ background: '#201f1f', borderRadius: 8, padding: '1.5rem', marginBottom: '2rem', textAlign: 'left' }}>
                    <p style={{ fontFamily: 'Space Grotesk', fontSize: 11, textTransform: 'uppercase', color: '#9c8f78', marginBottom: 12, letterSpacing: '0.1em' }}>Charter Details</p>
                    <h3 style={{ fontFamily: 'Noto Serif, serif', color: '#ffe2ab', fontSize: '1.25rem', fontWeight: 700, marginBottom: 12 }}>{success.name}</h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                        {(success.players || []).map((p, i) => (
                            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                <span className="material-symbols-outlined" style={{ fontSize: 14, color: '#bbc7dc' }}>person</span>
                                <span style={{ fontFamily: 'Work Sans', color: '#d4c5ab', fontSize: 13 }}>{p.name}</span>
                            </div>
                        ))}
                    </div>
                </div>

                <button
                    onClick={() => navigate('/')}
                    style={{ width: '100%', padding: '1rem', background: '#ffbf00', color: '#402d00', fontFamily: 'Space Grotesk', fontWeight: 700, fontSize: 14, textTransform: 'uppercase', letterSpacing: '0.1em', borderRadius: 4, border: 'none', cursor: 'pointer', boxShadow: '0 0 20px rgba(255,191,0,0.3)' }}
                >
                    Enter the Realm
                </button>
            </div>
        </main>
    );

    return (
        <main style={{ maxWidth: 560, margin: '4rem auto', padding: '2rem 2rem 4rem' }}>
            {/* Header */}
            <header style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
                <p style={{ fontFamily: 'Space Grotesk', fontSize: 11, color: '#00c8b4', textTransform: 'uppercase', letterSpacing: '0.15em', marginBottom: 8 }}>
                    MMI Guild Registration
                </p>
                <h1 style={{ fontFamily: 'Noto Serif, serif', fontSize: 'clamp(2rem, 5vw, 3rem)', fontWeight: 900, color: '#ffe2ab', marginBottom: 12 }}>
                    Join the MMI Guild
                </h1>
                <p style={{ fontFamily: 'Work Sans', color: '#9c8f78', fontSize: 14 }}>
                    Inscribe your guild's name and summon your three warriors.
                </p>
                <p style={{ fontFamily: 'Work Sans', color: '#00c8b4', fontSize: 12, marginTop: 8, fontStyle: 'italic', opacity: 0.8 }}>
                    💰 Presented by Money Mantra Investments — A strong party needs a strong portfolio!
                </p>
            </header>

            <form onSubmit={handleSubmit} style={{ background: '#1c1b1b', border: '1px solid rgba(80,69,50,0.2)', borderRadius: 8, padding: '2.5rem' }}>

                {/* Decorative header rule */}
                <div style={{ borderTop: '1px solid rgba(80,69,50,0.3)', marginBottom: '2rem' }}>
                    <span style={{ fontFamily: 'Noto Serif, serif', fontSize: 12, color: '#504532', marginLeft: 16, background: '#1c1b1b', padding: '0 8px', position: 'relative', top: -10 }}>
                        ✦ Guild Name ✦
                    </span>
                </div>

                <div style={{ marginBottom: '1.5rem' }}>
                    <label style={{ fontFamily: 'Space Grotesk', fontSize: 11, color: '#9c8f78', textTransform: 'uppercase', letterSpacing: '0.08em', display: 'block', marginBottom: 8 }}>
                        Guild Name *
                    </label>
                    <input
                        name="teamName" value={form.teamName} onChange={handleChange}
                        placeholder="e.g., The Iron Vanguard" required
                        style={{ ...inputStyle, fontSize: 16, fontFamily: 'Noto Serif, serif' }}
                        onFocus={e => e.target.style.boxShadow = 'inset 0 2px 8px rgba(0,0,0,0.3), 0 0 0 2px rgba(255,191,0,0.3)'}
                        onBlur={e => e.target.style.boxShadow = 'inset 0 2px 8px rgba(0,0,0,0.3)'}
                    />
                </div>

                <div style={{ borderTop: '1px solid rgba(80,69,50,0.3)', marginBottom: '2rem', marginTop: '2rem' }}>
                    <span style={{ fontFamily: 'Noto Serif, serif', fontSize: 12, color: '#504532', marginLeft: 16, background: '#1c1b1b', padding: '0 8px', position: 'relative', top: -10 }}>
                        ✦ The Three Warriors ✦
                    </span>
                </div>

                {[['player1', 'Warrior I'], ['player2', 'Warrior II'], ['player3', 'Warrior III']].map(([name, label]) => (
                    <div key={name} style={{ marginBottom: '1rem' }}>
                        <label style={{ fontFamily: 'Space Grotesk', fontSize: 11, color: '#9c8f78', textTransform: 'uppercase', letterSpacing: '0.08em', display: 'block', marginBottom: 6 }}>
                            {label} *
                        </label>
                        <input
                            name={name} value={form[name]} onChange={handleChange}
                            placeholder="Adventurer's name" required
                            style={inputStyle}
                            onFocus={e => e.target.style.boxShadow = 'inset 0 2px 8px rgba(0,0,0,0.3), 0 0 0 2px rgba(255,191,0,0.2)'}
                            onBlur={e => e.target.style.boxShadow = 'inset 0 2px 8px rgba(0,0,0,0.3)'}
                        />
                    </div>
                ))}

                {error && (
                    <p style={{ fontFamily: 'Work Sans', fontSize: 12, color: '#ffb4ab', background: 'rgba(147,0,10,0.15)', padding: '0.75rem 1rem', borderRadius: 4, marginBottom: '1rem' }}>
                        {error}
                    </p>
                )}

                <button
                    type="submit" disabled={loading}
                    style={{
                        width: '100%', marginTop: '1.5rem', padding: '1rem',
                        background: loading ? '#353534' : '#ffbf00',
                        color: loading ? '#9c8f78' : '#402d00',
                        fontFamily: 'Space Grotesk', fontWeight: 700, fontSize: 14,
                        textTransform: 'uppercase', letterSpacing: '0.1em',
                        borderRadius: 4, border: 'none',
                        cursor: loading ? 'not-allowed' : 'pointer',
                        boxShadow: loading ? 'none' : '0 0 20px rgba(255,191,0,0.3)',
                        transition: 'all 0.3s',
                    }}
                >
                    {loading ? 'Forging Covenant...' : 'Forge Your Covenant'}
                </button>
            </form>
        </main>
    );
}
