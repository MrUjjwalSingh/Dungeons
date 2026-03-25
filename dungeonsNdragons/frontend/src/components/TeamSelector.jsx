import { useState, useEffect, useRef } from 'react';
import { getTeams, registerTeam } from '../api/client';

const ENQUIRY_URL = 'https://docs.google.com/forms/d/e/1FAIpQLSd6Yza2TDpYL6T85NHXWNJGQLJFDHzaUxXYILlc6teqG2Jafw/viewform';

export default function TeamSelector({ isOpen, onClose }) {
    const [teams, setTeams] = useState([]);
    const [search, setSearch] = useState('');
    const [loading, setLoading] = useState(true);
    const [showCreate, setShowCreate] = useState(false);
    const [form, setForm] = useState({ teamName: '', player1: '', player2: '', player3: '' });
    const [creating, setCreating] = useState(false);
    const [error, setError] = useState('');
    const overlayRef = useRef(null);

    useEffect(() => {
        if (!isOpen) return;
        setLoading(true);
        getTeams()
            .then(d => setTeams(d.teams || []))
            .catch(() => setTeams([]))
            .finally(() => setLoading(false));
    }, [isOpen]);

    const filtered = teams.filter(t =>
        t.name.toLowerCase().includes(search.toLowerCase())
    );

    const selectTeam = (team) => {
        localStorage.setItem('teamId', team.id || team._id);
        localStorage.setItem('teamName', team.name);
        window.location.reload();
    };

    const handleCreate = async (e) => {
        e.preventDefault();
        if (!form.teamName || !form.player1 || !form.player2 || !form.player3) {
            setError('All fields are required.'); return;
        }
        setCreating(true); setError('');
        try {
            const res = await registerTeam({ name: form.teamName, players: [form.player1, form.player2, form.player3] });
            localStorage.setItem('teamId', res.team.id);
            localStorage.setItem('teamName', res.team.name);
            window.location.reload();
        } catch (err) {
            setError(err.message || 'Failed to create team.');
        } finally {
            setCreating(false);
        }
    };

    const handleOverlayClick = (e) => {
        if (e.target === overlayRef.current) onClose();
    };

    if (!isOpen) return null;

    const inp = {
        width: '100%', background: '#2a2a2a', border: '1px solid rgba(80,69,50,0.3)',
        color: '#e5e2e1', fontFamily: 'Work Sans, sans-serif', fontSize: 13,
        padding: '0.75rem 1rem', borderRadius: 6, outline: 'none',
    };

    return (
        <div ref={overlayRef} onClick={handleOverlayClick} style={{
            position: 'fixed', inset: 0, zIndex: 9990,
            background: 'rgba(0,0,0,0.7)',
            backdropFilter: 'blur(6px)',
            display: 'flex', alignItems: 'flex-end', justifyContent: 'center',
        }}>
            <style>{`
                @keyframes slideUp { from { transform: translateY(100%); } to { transform: translateY(0); } }
            `}</style>
            <div style={{
                width: '100%', maxWidth: 480, maxHeight: '85vh',
                background: '#1c1b1b',
                borderTop: '1px solid rgba(255,191,0,0.2)',
                borderRadius: '16px 16px 0 0',
                display: 'flex', flexDirection: 'column',
                animation: 'slideUp 0.3s ease-out',
                overflow: 'hidden',
            }}>
                {/* Header */}
                <div style={{
                    padding: '1.25rem 1.5rem 0.75rem',
                    borderBottom: '1px solid rgba(80,69,50,0.15)',
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                }}>
                    <div>
                        <h2 style={{ fontFamily: 'Noto Serif, serif', color: '#ffe2ab', fontSize: '1.25rem', fontWeight: 900 }}>
                            Select Your Team
                        </h2>
                        <p style={{ fontFamily: 'Work Sans', fontSize: 11, color: '#9c8f78', marginTop: 2 }}>
                            Search for your guild or create a new one
                        </p>
                    </div>
                    <button onClick={onClose} style={{
                        background: 'none', border: 'none', color: '#9c8f78', fontSize: 24,
                        cursor: 'pointer', padding: 4, lineHeight: 1,
                    }}>×</button>
                </div>

                {/* Search */}
                <div style={{ padding: '0.75rem 1.5rem' }}>
                    <div style={{ position: 'relative' }}>
                        <span className="material-symbols-outlined" style={{
                            position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)',
                            color: '#9c8f78', fontSize: 18,
                        }}>search</span>
                        <input value={search} onChange={e => { setSearch(e.target.value); setShowCreate(false); }}
                            placeholder="Search teams..."
                            style={{ ...inp, paddingLeft: 40, background: '#201f1f' }} />
                    </div>
                </div>

                {/* Team List */}
                <div style={{ flex: 1, overflowY: 'auto', padding: '0 1.5rem' }}>
                    {loading ? (
                        <div style={{ textAlign: 'center', padding: '2rem 0' }}>
                            <span className="material-symbols-outlined animate-spin" style={{ color: '#ffbf00', fontSize: 32 }}>autorenew</span>
                        </div>
                    ) : filtered.length > 0 ? (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                            {filtered.map(t => (
                                <button key={t.id || t._id} onClick={() => selectTeam(t)} style={{
                                    display: 'flex', alignItems: 'center', gap: 12,
                                    width: '100%', padding: '0.875rem 1rem',
                                    background: '#201f1f', border: '1px solid rgba(80,69,50,0.15)',
                                    borderRadius: 8, cursor: 'pointer',
                                    transition: 'all 0.2s', textAlign: 'left',
                                }}
                                    onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,191,0,0.06)'; e.currentTarget.style.borderColor = 'rgba(255,191,0,0.3)'; }}
                                    onMouseLeave={e => { e.currentTarget.style.background = '#201f1f'; e.currentTarget.style.borderColor = 'rgba(80,69,50,0.15)'; }}
                                >
                                    <div style={{
                                        width: 36, height: 36, borderRadius: '50%',
                                        background: 'rgba(255,191,0,0.1)',
                                        border: '1px solid rgba(255,191,0,0.2)',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        flexShrink: 0,
                                    }}>
                                        <span className="material-symbols-outlined" style={{ color: '#ffbf00', fontSize: 18 }}>shield</span>
                                    </div>
                                    <div style={{ flex: 1, minWidth: 0 }}>
                                        <p style={{ fontFamily: 'Noto Serif, serif', color: '#ffe2ab', fontWeight: 700, fontSize: 14 }}>
                                            {t.name}
                                        </p>
                                        <p style={{ fontFamily: 'Work Sans', color: '#9c8f78', fontSize: 11, marginTop: 2 }}>
                                            {t.players?.map(p => p.name).join(', ') || '3 Adventurers'}
                                        </p>
                                    </div>
                                    <span className="material-symbols-outlined" style={{ color: '#504532', fontSize: 18 }}>chevron_right</span>
                                </button>
                            ))}
                        </div>
                    ) : (
                        <div style={{ textAlign: 'center', padding: '2rem 0' }}>
                            <span className="material-symbols-outlined" style={{ fontSize: 40, color: '#504532', marginBottom: 8, display: 'block' }}>search_off</span>
                            <p style={{ fontFamily: 'Work Sans', color: '#9c8f78', fontSize: 13 }}>
                                {search ? `No teams matching "${search}"` : 'No teams registered yet.'}
                            </p>
                        </div>
                    )}
                </div>

                {/* Create New Team Section */}
                <div style={{ padding: '0.75rem 1.5rem 1.25rem', borderTop: '1px solid rgba(80,69,50,0.15)' }}>
                    {!showCreate ? (
                        <button onClick={() => setShowCreate(true)} style={{
                            width: '100%', padding: '0.75rem',
                            background: 'rgba(0,200,180,0.12)', border: '1px solid rgba(0,200,180,0.3)',
                            borderRadius: 8, color: '#00c8b4',
                            fontFamily: 'Space Grotesk, sans-serif', fontWeight: 700, fontSize: 12,
                            textTransform: 'uppercase', letterSpacing: '0.08em',
                            cursor: 'pointer',
                            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                        }}>
                            <span className="material-symbols-outlined" style={{ fontSize: 18 }}>add_circle</span>
                            Create New Team
                        </button>
                    ) : (
                        <form onSubmit={handleCreate} style={{
                            background: '#201f1f', borderRadius: 8, padding: '1rem',
                            border: '1px solid rgba(0,200,180,0.2)',
                        }}>
                            <p style={{ fontFamily: 'Space Grotesk', fontSize: 10, color: '#00c8b4', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 10, fontWeight: 700 }}>
                                ✦ Create New Guild ✦
                            </p>
                            <input name="teamName" value={form.teamName} onChange={e => setForm(f => ({ ...f, teamName: e.target.value }))}
                                placeholder="Guild Name *" style={{ ...inp, marginBottom: 8, fontFamily: 'Noto Serif, serif' }} />
                            {['player1', 'player2', 'player3'].map((p, i) => (
                                <input key={p} name={p} value={form[p]} onChange={e => setForm(f => ({ ...f, [p]: e.target.value }))}
                                    placeholder={`Warrior ${i + 1} Name *`} style={{ ...inp, marginBottom: 8 }} />
                            ))}
                            {error && <p style={{ fontFamily: 'Work Sans', fontSize: 11, color: '#ff4500', marginBottom: 8 }}>{error}</p>}
                            <div style={{ display: 'flex', gap: 8 }}>
                                <button type="button" onClick={() => setShowCreate(false)} style={{
                                    flex: 1, padding: '0.625rem', background: '#2a2a2a', border: '1px solid rgba(80,69,50,0.2)',
                                    borderRadius: 6, color: '#9c8f78', fontFamily: 'Space Grotesk', fontSize: 11,
                                    fontWeight: 700, cursor: 'pointer', textTransform: 'uppercase',
                                }}>Cancel</button>
                                <button type="submit" disabled={creating} style={{
                                    flex: 1, padding: '0.625rem',
                                    background: creating ? '#2a2a2a' : '#ffbf00',
                                    color: creating ? '#9c8f78' : '#402d00',
                                    border: 'none', borderRadius: 6,
                                    fontFamily: 'Space Grotesk', fontSize: 11, fontWeight: 700,
                                    cursor: creating ? 'wait' : 'pointer', textTransform: 'uppercase',
                                    boxShadow: creating ? 'none' : '0 0 12px rgba(255,191,0,0.3)',
                                }}>{creating ? 'Forging...' : 'Forge Guild'}</button>
                            </div>
                        </form>
                    )}

                    {/* MMI sponsor tip */}
                    <p style={{
                        fontFamily: 'Work Sans', fontSize: 10, color: '#504532',
                        textAlign: 'center', marginTop: 10, fontStyle: 'italic',
                    }}>💰 Presented by Money Mantra Investments (MMI)</p>
                </div>
            </div>
        </div>
    );
}
