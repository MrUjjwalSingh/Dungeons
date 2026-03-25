import { useState, useEffect, useMemo } from 'react';
import {
    getTeams, getQuests, getDungeons,
    startQuest, completeQuest, clearDungeon, fightDragon,
    updateQuest, updateDungeon, verifyAdminKey, updateTeamStat,
    createQuest, createDungeon, triggerAdBreak,
} from '../api/client';

const STATS = ['power', 'hp', 'mana', 'agility', 'brain_power'];
const STAT_ICONS = { power: '⚔️', hp: '❤️', mana: '🔮', agility: '💨', brain_power: '🧠' };

/* ─── Toast System ───────────────────────────────────────────────── */

const TOAST_COL = {
    ok: { bg: 'rgba(76,175,130,0.15)', border: 'rgba(76,175,130,0.4)', text: '#4caf82', icon: '✅' },
    err: { bg: 'rgba(147,0,10,0.25)', border: 'rgba(166,27,16,0.5)', text: '#ff4500', icon: '❌' },
    warn: { bg: 'rgba(251,188,0,0.12)', border: 'rgba(251,188,0,0.4)', text: '#fbbc04', icon: '⚠️' },
    info: { bg: 'rgba(255,191,0,0.1)', border: 'rgba(255,191,0,0.3)', text: '#ffe2ab', icon: 'ℹ️' },
};

function ToastItem({ toast, onDismiss }) {
    const c = TOAST_COL[toast.type] || TOAST_COL.info;
    return (
        <div style={{
            display: 'flex', alignItems: 'flex-start', gap: 10,
            background: c.bg, border: `1px solid ${c.border}`, borderRadius: 8,
            padding: '0.75rem 1rem', minWidth: 300, maxWidth: 440,
            boxShadow: '0 4px 24px rgba(0,0,0,0.4)',
            animation: 'slideInToast 0.25s ease-out',
            fontFamily: 'Space Grotesk', fontSize: 13, color: c.text,
            cursor: 'pointer',
        }} onClick={() => onDismiss(toast.id)}>
            <span style={{ fontSize: 16, lineHeight: 1.4, flexShrink: 0 }}>{c.icon}</span>
            <span style={{ flex: 1, lineHeight: 1.5 }}>{toast.msg}</span>
            <span style={{ fontSize: 16, opacity: 0.5, flexShrink: 0, lineHeight: 1.3 }}>×</span>
        </div>
    );
}

function ToastContainer({ toasts, onDismiss }) {
    return (
        <div style={{
            position: 'fixed', top: 24, right: 24, zIndex: 9999,
            display: 'flex', flexDirection: 'column', gap: 10, alignItems: 'flex-end',
        }}>
            <style>{`
                @keyframes slideInToast {
                    from { opacity: 0; transform: translateX(40px); }
                    to   { opacity: 1; transform: translateX(0); }
                }
            `}</style>
            {toasts.map(t => <ToastItem key={t.id} toast={t} onDismiss={onDismiss} />)}
        </div>
    );
}

/* ─── Shared UI Primitives ───────────────────────────────────────── */

function Panel({ title, icon, glow = 'amber', children }) {
    const s = {
        amber: { border: 'rgba(255,191,0,0.2)', shadow: 'rgba(255,191,0,0.06)', ic: '#ffbf00' },
        green: { border: 'rgba(76,175,130,0.2)', shadow: 'rgba(76,175,130,0.04)', ic: '#4caf82' },
        red: { border: 'rgba(166,27,16,0.4)', shadow: 'rgba(139,0,0,0.10)', ic: '#ff4500' },
        blue: { border: 'rgba(187,199,220,0.2)', shadow: 'rgba(187,199,220,0.04)', ic: '#bbc7dc' },
        purple: { border: 'rgba(180,130,255,0.2)', shadow: 'rgba(180,130,255,0.06)', ic: '#b482ff' },
        teal: { border: 'rgba(0,200,180,0.2)', shadow: 'rgba(0,200,180,0.05)', ic: '#00c8b4' },
    }[glow];
    return (
        <section style={{ background: '#1c1b1b', border: `1px solid ${s.border}`, borderRadius: 8, padding: '1.75rem', boxShadow: `0 0 40px ${s.shadow}` }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: '1.25rem', paddingBottom: '1rem', borderBottom: '1px solid rgba(80,69,50,0.15)' }}>
                <span className="material-symbols-outlined" style={{ color: s.ic, fontSize: 20 }}>{icon}</span>
                <h2 style={{ fontFamily: 'Noto Serif, serif', color: '#ffe2ab', fontSize: '1.1rem', fontWeight: 700 }}>{title}</h2>
            </div>
            {children}
        </section>
    );
}

const lbl = { fontFamily: 'Space Grotesk', fontSize: 10, color: '#9c8f78', textTransform: 'uppercase', letterSpacing: '0.08em', display: 'block', marginBottom: 5 };
const inp = { width: '100%', background: '#2a2a2a', border: '1px solid rgba(80,69,50,0.25)', color: '#e5e2e1', fontFamily: 'Work Sans', fontSize: 13, padding: '0.625rem 0.875rem', borderRadius: 4 };

/** Searchable dropdown */
function SearchSel({ label, value, onChange, options, placeholder }) {
    const id = useMemo(() => `dl_${Math.random().toString(36).slice(2, 8)}`, []);
    const selected = options.find(o => o.value === value);
    const [text, setText] = useState(selected?.label || '');

    useEffect(() => {
        const sel = options.find(o => o.value === value);
        setText(sel?.label || '');
    }, [value, options]);

    const handleInput = (e) => {
        const typed = e.target.value;
        setText(typed);
        const match = options.find(o => o.label.toLowerCase() === typed.toLowerCase());
        onChange(match ? match.value : '');
    };
    const handleBlur = () => {
        const match = options.find(o => o.label.toLowerCase() === text.toLowerCase());
        if (!match) { setText(''); onChange(''); }
    };

    return (
        <div style={{ marginBottom: '0.875rem' }}>
            {label && <label style={lbl}>{label}</label>}
            <input list={id} value={text} onChange={handleInput} onBlur={handleBlur}
                placeholder={placeholder || 'Type to search...'}
                style={{ ...inp, cursor: 'text' }} />
            <datalist id={id}>
                {options.map(o => <option key={o.value} value={o.label} />)}
            </datalist>
        </div>
    );
}

function Sel({ label, value, onChange, options, placeholder }) {
    return (
        <div style={{ marginBottom: '0.875rem' }}>
            {label && <label style={lbl}>{label}</label>}
            <select value={value} onChange={e => onChange(e.target.value)} style={{ ...inp, cursor: 'pointer' }}>
                <option value="">{placeholder || 'Select...'}</option>
                {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
        </div>
    );
}

function Btn({ label, onClick, variant = 'amber', disabled, small }) {
    const v = {
        amber: { bg: '#ffbf00', color: '#402d00', glow: '0 0 12px rgba(255,191,0,0.3)' },
        green: { bg: 'rgba(76,175,130,0.15)', color: '#4caf82', glow: '0 0 10px rgba(76,175,130,0.2)', border: '1px solid rgba(76,175,130,0.35)' },
        red: { bg: 'rgba(147,0,10,0.2)', color: '#ff4500', glow: '0 0 10px rgba(166,27,16,0.25)', border: '1px solid rgba(166,27,16,0.4)' },
        dragWin: { bg: 'linear-gradient(to right,#a67c00,#ffbf00)', color: '#402d00', glow: '0 0 18px rgba(255,191,0,0.35)' },
        dragLoss: { bg: 'rgba(147,0,10,0.25)', color: '#ff4500', glow: '0 0 14px rgba(139,0,0,0.3)', border: '1px solid rgba(139,0,0,0.5)' },
        purple: { bg: 'rgba(180,130,255,0.18)', color: '#b482ff', glow: '0 0 12px rgba(180,130,255,0.2)', border: '1px solid rgba(180,130,255,0.35)' },
        teal: { bg: 'rgba(0,200,180,0.18)', color: '#00c8b4', glow: '0 0 12px rgba(0,200,180,0.2)', border: '1px solid rgba(0,200,180,0.35)' },
    }[variant];
    return (
        <button onClick={onClick} disabled={disabled} style={{
            width: '100%', padding: small ? '0.5rem 0.75rem' : '0.75rem 1rem', borderRadius: 4,
            border: v.border || 'none', fontFamily: 'Space Grotesk', fontWeight: 700,
            fontSize: small ? 11 : 12, textTransform: 'uppercase', letterSpacing: '0.07em',
            background: disabled ? '#2a2a2a' : v.bg, color: disabled ? '#9c8f78' : v.color,
            cursor: disabled ? 'not-allowed' : 'pointer', opacity: disabled ? 0.55 : 1,
            boxShadow: disabled ? 'none' : v.glow, transition: 'all 0.2s', marginBottom: 6,
        }}>{label}</button>
    );
}

/* ─── Config Table Components ────────────────────────────────────── */

function SearchBar({ value, onChange, placeholder }) {
    return (
        <div style={{ marginBottom: '1rem' }}>
            <input value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder || 'Search...'}
                style={{ ...inp, maxWidth: 320, background: '#201f1f', border: '1px solid rgba(80,69,50,0.2)', fontSize: 12, padding: '0.5rem 0.875rem' }} />
        </div>
    );
}

function ConfigTable({ headers, children }) {
    return (
        <div style={{ overflowX: 'auto', borderRadius: 6, border: '1px solid rgba(80,69,50,0.15)' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead><tr style={{ background: '#201f1f' }}>
                    {headers.map(h => <th key={h} style={{ padding: '8px 12px', fontFamily: 'Space Grotesk', fontSize: 9, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#9c8f78', textAlign: 'left', fontWeight: 700, whiteSpace: 'nowrap' }}>{h}</th>)}
                </tr></thead>
                <tbody>{children}</tbody>
            </table>
        </div>
    );
}

/* ── Quest Row ── */
function QuestRow({ quest, adminKey, onSaved, onToast }) {
    const [d, setD] = useState({
        name: quest.name,
        description: quest.description || '',
        bet_stat: quest.bet_stat,
        bet_amount: quest.bet_amount,
        reward_stat: quest.reward_stat,
        reward_amount: quest.reward_amount,
    });
    const [saving, setSaving] = useState(false);

    // keep in sync if parent refreshes
    useEffect(() => {
        setD({
            name: quest.name,
            description: quest.description || '',
            bet_stat: quest.bet_stat,
            bet_amount: quest.bet_amount,
            reward_stat: quest.reward_stat,
            reward_amount: quest.reward_amount,
        });
    }, [quest]);

    const save = async () => {
        if (!d.name.trim()) { onToast('Quest name cannot be empty.', 'warn'); return; }
        setSaving(true);
        try {
            const r = await updateQuest(quest.id, d, adminKey);
            onSaved(r.quest);
            onToast(`✅ "${r.quest.name}" saved successfully.`, 'ok');
        } catch (e) { onToast(`❌ ${e.message}`, 'err'); }
        finally { setSaving(false); }
    };

    const ti = (key, w = 110, type = 'text') => (
        <input type={type} min={type === 'number' ? 0 : undefined}
            value={d[key]}
            onChange={e => setD(p => ({ ...p, [key]: type === 'number' ? Number(e.target.value) : e.target.value }))}
            style={{ width: w, background: '#353534', border: '1px solid rgba(80,69,50,0.3)', color: '#ffe2ab', fontFamily: 'Space Grotesk', fontSize: 12, padding: '4px 8px', borderRadius: 3, textAlign: type === 'number' ? 'center' : 'left' }} />
    );
    const ss = key => (
        <select value={d[key]} onChange={e => setD(p => ({ ...p, [key]: e.target.value }))}
            style={{ background: '#353534', border: '1px solid rgba(80,69,50,0.3)', color: '#bbc7dc', fontFamily: 'Space Grotesk', fontSize: 11, padding: '4px 6px', borderRadius: 3, textTransform: 'uppercase' }}>
            {STATS.map(s => <option key={s} value={s}>{s.replace('_', ' ')}</option>)}
        </select>
    );

    return (
        <tr style={{ borderBottom: '1px solid rgba(80,69,50,0.1)' }}>
            <td style={{ padding: '10px 8px' }}>{ti('name', 140)}</td>
            <td style={{ padding: '10px 8px' }}>{ti('description', 160)}</td>
            <td style={{ padding: '10px 8px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    {ss('bet_stat')}<span style={{ color: '#504532', fontSize: 11 }}>×</span>{ti('bet_amount', 56, 'number')}
                </div>
            </td>
            <td style={{ padding: '10px 8px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    {ss('reward_stat')}<span style={{ color: '#4caf82', fontSize: 11 }}>+</span>{ti('reward_amount', 56, 'number')}
                </div>
            </td>
            <td style={{ padding: '10px 8px', width: 80 }}>
                <button onClick={save} disabled={saving} style={{
                    padding: '4px 12px', background: 'rgba(255,191,0,0.12)',
                    border: '1px solid rgba(255,191,0,0.3)', color: '#ffe2ab',
                    fontFamily: 'Space Grotesk', fontSize: 10, fontWeight: 700,
                    borderRadius: 3, cursor: saving ? 'wait' : 'pointer',
                    textTransform: 'uppercase', letterSpacing: '0.05em',
                    opacity: saving ? 0.6 : 1,
                }}>
                    {saving ? '...' : 'Save'}
                </button>
            </td>
        </tr>
    );
}

/* ── Dungeon Row ── */
function DungeonRow({ dungeon, adminKey, onSaved, onToast }) {
    const [d, setD] = useState({
        name: dungeon.name,
        description: dungeon.description || '',
        required_stat: dungeon.required_stat,
        required_amount: dungeon.required_amount,
        equipment_name: dungeon.equipment_name,
        class_granted: dungeon.class_granted,
    });
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        setD({
            name: dungeon.name,
            description: dungeon.description || '',
            required_stat: dungeon.required_stat,
            required_amount: dungeon.required_amount,
            equipment_name: dungeon.equipment_name,
            class_granted: dungeon.class_granted,
        });
    }, [dungeon]);

    const save = async () => {
        if (!d.name.trim()) { onToast('Dungeon name cannot be empty.', 'warn'); return; }
        setSaving(true);
        try {
            const r = await updateDungeon(dungeon.id, d, adminKey);
            onSaved(r.dungeon);
            onToast(`✅ "${r.dungeon.name}" saved successfully.`, 'ok');
        } catch (e) { onToast(`❌ ${e.message}`, 'err'); }
        finally { setSaving(false); }
    };

    const ti = (key, w = 110, type = 'text') => (
        <input type={type} min={type === 'number' ? 0 : undefined}
            value={d[key]}
            onChange={e => setD(p => ({ ...p, [key]: type === 'number' ? Number(e.target.value) : e.target.value }))}
            style={{ width: w, background: '#353534', border: '1px solid rgba(80,69,50,0.3)', color: '#ffe2ab', fontFamily: 'Space Grotesk', fontSize: 12, padding: '4px 8px', borderRadius: 3, textAlign: type === 'number' ? 'center' : 'left' }} />
    );
    const statSel = (
        <select value={d.required_stat} onChange={e => setD(p => ({ ...p, required_stat: e.target.value }))}
            style={{ background: '#353534', border: '1px solid rgba(80,69,50,0.3)', color: '#bbc7dc', fontFamily: 'Space Grotesk', fontSize: 11, padding: '4px 6px', borderRadius: 3, textTransform: 'uppercase' }}>
            {STATS.map(s => <option key={s} value={s}>{s.replace('_', ' ')}</option>)}
        </select>
    );

    return (
        <tr style={{ borderBottom: '1px solid rgba(80,69,50,0.1)' }}>
            <td style={{ padding: '10px 8px' }}>{ti('name', 130)}</td>
            <td style={{ padding: '10px 8px' }}>{ti('description', 150)}</td>
            <td style={{ padding: '10px 8px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    {statSel}<span style={{ color: '#9c8f78', fontSize: 11 }}>≥</span>{ti('required_amount', 56, 'number')}
                </div>
            </td>
            <td style={{ padding: '10px 8px' }}>{ti('equipment_name', 140)}</td>
            <td style={{ padding: '10px 8px' }}>{ti('class_granted', 110)}</td>
            <td style={{ padding: '10px 8px', width: 80 }}>
                <button onClick={save} disabled={saving} style={{
                    padding: '4px 12px', background: 'rgba(255,191,0,0.12)',
                    border: '1px solid rgba(255,191,0,0.3)', color: '#ffe2ab',
                    fontFamily: 'Space Grotesk', fontSize: 10, fontWeight: 700,
                    borderRadius: 3, cursor: saving ? 'wait' : 'pointer',
                    textTransform: 'uppercase', letterSpacing: '0.05em',
                    opacity: saving ? 0.6 : 1,
                }}>
                    {saving ? '...' : 'Save'}
                </button>
            </td>
        </tr>
    );
}

/* ── Create Quest Form ── */
function CreateQuestForm({ adminKey, onCreated, onToast }) {
    const empty = { name: '', description: '', bet_stat: 'power', bet_amount: 5, reward_stat: 'hp', reward_amount: 10 };
    const [f, setF] = useState(empty);
    const [saving, setSaving] = useState(false);

    const fld = (key, type = 'text', w = '100%') => (
        <input type={type} min={type === 'number' ? 0 : undefined}
            value={f[key]} placeholder={key.replace('_', ' ')}
            onChange={e => setF(p => ({ ...p, [key]: type === 'number' ? Number(e.target.value) : e.target.value }))}
            style={{ ...inp, width: w, background: '#262626' }} />
    );
    const ss = key => (
        <select value={f[key]} onChange={e => setF(p => ({ ...p, [key]: e.target.value }))}
            style={{ ...inp, width: '100%', background: '#262626', cursor: 'pointer', textTransform: 'uppercase' }}>
            {STATS.map(s => <option key={s} value={s}>{STAT_ICONS[s]} {s.replace('_', ' ')}</option>)}
        </select>
    );

    const submit = async () => {
        if (!f.name.trim()) { onToast('Quest name is required.', 'warn'); return; }
        setSaving(true);
        try {
            const r = await createQuest(f, adminKey);
            onToast(`✨ Quest "${r.quest.name}" created!`, 'ok');
            onCreated(r.quest);
            setF(empty);
        } catch (e) { onToast(`❌ ${e.message}`, 'err'); }
        finally { setSaving(false); }
    };

    return (
        <Panel title="Create New Side Quest" icon="add_circle" glow="teal">
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                    <label style={lbl}>Quest Name *</label>
                    {fld('name')}
                </div>
                <div>
                    <label style={lbl}>Description</label>
                    {fld('description')}
                </div>
                <div>
                    <label style={lbl}>Wager Stat *</label>
                    {ss('bet_stat')}
                </div>
                <div>
                    <label style={lbl}>Wager Amount *</label>
                    {fld('bet_amount', 'number')}
                </div>
                <div>
                    <label style={lbl}>Reward Stat *</label>
                    {ss('reward_stat')}
                </div>
                <div>
                    <label style={lbl}>Reward Amount *</label>
                    {fld('reward_amount', 'number')}
                </div>
            </div>
            <div style={{ marginTop: '1rem' }}>
                <Btn label={saving ? 'Creating...' : '✨ Create Side Quest'} onClick={submit} variant="teal" disabled={saving || !f.name.trim()} />
            </div>
        </Panel>
    );
}

/* ── Create Dungeon Form ── */
function CreateDungeonForm({ adminKey, onCreated, onToast }) {
    const empty = { name: '', description: '', required_stat: 'power', required_amount: 20, equipment_name: '', class_granted: '' };
    const [f, setF] = useState(empty);
    const [saving, setSaving] = useState(false);

    const fld = (key, type = 'text', w = '100%') => (
        <input type={type} min={type === 'number' ? 0 : undefined}
            value={f[key]} placeholder={key.replace(/_/g, ' ')}
            onChange={e => setF(p => ({ ...p, [key]: type === 'number' ? Number(e.target.value) : e.target.value }))}
            style={{ ...inp, width: w, background: '#262626' }} />
    );
    const ss = (
        <select value={f.required_stat} onChange={e => setF(p => ({ ...p, required_stat: e.target.value }))}
            style={{ ...inp, background: '#262626', cursor: 'pointer', textTransform: 'uppercase' }}>
            {STATS.map(s => <option key={s} value={s}>{STAT_ICONS[s]} {s.replace('_', ' ')}</option>)}
        </select>
    );

    const submit = async () => {
        if (!f.name.trim() || !f.equipment_name.trim() || !f.class_granted.trim()) {
            onToast('Name, Equipment Name, and Class Granted are required.', 'warn');
            return;
        }
        setSaving(true);
        try {
            const r = await createDungeon(f, adminKey);
            onToast(`🏰 Dungeon "${r.dungeon.name}" created!`, 'ok');
            onCreated(r.dungeon);
            setF(empty);
        } catch (e) { onToast(`❌ ${e.message}`, 'err'); }
        finally { setSaving(false); }
    };

    return (
        <Panel title="Create New Dungeon" icon="add_location_alt" glow="teal">
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                    <label style={lbl}>Dungeon Name *</label>
                    {fld('name')}
                </div>
                <div>
                    <label style={lbl}>Description</label>
                    {fld('description')}
                </div>
                <div>
                    <label style={lbl}>Required Stat *</label>
                    {ss}
                </div>
                <div>
                    <label style={lbl}>Required Amount *</label>
                    {fld('required_amount', 'number')}
                </div>
                <div>
                    <label style={lbl}>Equipment Name *</label>
                    {fld('equipment_name')}
                </div>
                <div>
                    <label style={lbl}>Class Granted *</label>
                    {fld('class_granted')}
                </div>
            </div>
            <div style={{ marginTop: '1rem' }}>
                <Btn label={saving ? 'Creating...' : '🏰 Create Dungeon'} onClick={submit} variant="teal"
                    disabled={saving || !f.name.trim() || !f.equipment_name.trim() || !f.class_granted.trim()} />
            </div>
        </Panel>
    );
}

/* ═══════════════════════════════════════════════════════════════════
   Login Gate
══════════════════════════════════════════════════════════════════════ */

function LoginGate({ onAuthenticated }) {
    const [key, setKey] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleLogin = async (e) => {
        e.preventDefault();
        if (!key.trim()) return;
        setLoading(true); setError('');
        try { await verifyAdminKey(key.trim()); onAuthenticated(key.trim()); }
        catch { setError('Invalid key. Access denied.'); }
        finally { setLoading(false); }
    };

    return (
        <main style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
            <div style={{ width: '100%', maxWidth: 420, background: '#1c1b1b', border: '1px solid rgba(255,191,0,0.15)', borderRadius: 12, padding: '3rem 2.5rem', boxShadow: '0 0 80px rgba(255,191,0,0.06)' }}>
                <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                    <span className="material-symbols-outlined" style={{ fontSize: 48, color: '#ffbf00', display: 'block', marginBottom: 16 }}>verified_user</span>
                    <h1 style={{ fontFamily: 'Noto Serif, serif', color: '#ffe2ab', fontSize: '1.75rem', fontWeight: 900, marginBottom: 6 }}>Game Master Portal</h1>
                    <p style={{ fontFamily: 'Work Sans', color: '#9c8f78', fontSize: 13 }}>Enter the arcane key to proceed.</p>
                </div>
                <form onSubmit={handleLogin}>
                    <label style={lbl}>Admin Key</label>
                    <input type="password" value={key} onChange={e => setKey(e.target.value)} placeholder="Enter admin key..." autoFocus
                        style={{ ...inp, border: `1px solid ${error ? 'rgba(166,27,16,0.5)' : 'rgba(80,69,50,0.3)'}`, color: '#ffe2ab', fontFamily: 'Space Grotesk', fontSize: 14, borderRadius: 6 }} />
                    {error && <p style={{ color: '#ff4500', fontFamily: 'Space Grotesk', fontSize: 12, marginTop: 8, fontWeight: 600 }}>🔒 {error}</p>}
                    <button type="submit" disabled={loading || !key.trim()} style={{
                        width: '100%', marginTop: '1.5rem', padding: '0.875rem', background: loading ? '#2a2a2a' : '#ffbf00', color: '#402d00',
                        fontFamily: 'Space Grotesk', fontWeight: 700, fontSize: 13, textTransform: 'uppercase', letterSpacing: '0.1em',
                        borderRadius: 6, border: 'none', cursor: loading ? 'wait' : 'pointer', boxShadow: '0 0 20px rgba(255,191,0,0.2)',
                    }}>{loading ? 'Verifying...' : 'Enter the Sanctum'}</button>
                </form>
            </div>
        </main>
    );
}

/* ═══════════════════════════════════════════════════════════════════
   Manual Override Panel (Fail-Safe)
══════════════════════════════════════════════════════════════════════ */

function OverridePanel({ teams, adminKey, onToast, onTeamsRefresh }) {
    const [teamId, setTeamId] = useState('');
    const [stat, setStat] = useState('power');
    const [delta, setDelta] = useState(0);
    const [loading, setLoading] = useState(false);

    const teamOpts = teams.map(t => ({ value: t.id, label: t.name }));
    const selectedTeam = teams.find(t => t.id === teamId);

    const handleApply = async () => {
        if (!teamId || delta === 0) { onToast('Select a team and enter a non-zero delta.', 'warn'); return; }
        setLoading(true);
        try {
            const r = await updateTeamStat(teamId, stat, delta, adminKey);
            const { oldValue, newValue } = r.adjusted;
            onToast(`${r.team.name}: ${stat.replace('_', ' ')} ${oldValue} → ${newValue} (${delta > 0 ? '+' : ''}${delta})`, 'ok');
            onTeamsRefresh();
            setDelta(0);
        } catch (e) { onToast(e.message, 'err'); }
        finally { setLoading(false); }
    };

    return (
        <Panel title="Manual Stat Override (Fail-Safe)" icon="build" glow="purple">
            <p style={{ fontFamily: 'Work Sans', fontSize: 12, color: '#9c8f78', marginBottom: '1.25rem', lineHeight: 1.5 }}>
                Directly add or subtract stat points from any team. Use this to fix bugs, correct mistakes, or adjust for edge cases.
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <SearchSel label="Team" value={teamId} onChange={setTeamId} options={teamOpts} placeholder="Search team..." />
                <Sel label="Stat" value={stat} onChange={setStat}
                    options={STATS.map(s => ({ value: s, label: `${STAT_ICONS[s]} ${s.replace('_', ' ')}` }))} />
            </div>

            {selectedTeam && (
                <div style={{ display: 'flex', gap: 12, marginBottom: '1rem', flexWrap: 'wrap' }}>
                    {STATS.map(s => (
                        <div key={s} style={{
                            padding: '6px 12px', borderRadius: 4,
                            background: s === stat ? 'rgba(180,130,255,0.15)' : '#201f1f',
                            border: `1px solid ${s === stat ? 'rgba(180,130,255,0.4)' : 'rgba(80,69,50,0.15)'}`,
                            cursor: 'pointer', transition: 'all 0.2s',
                        }} onClick={() => setStat(s)}>
                            <span style={{ fontFamily: 'Space Grotesk', fontSize: 9, color: '#9c8f78', textTransform: 'uppercase', letterSpacing: '0.08em', display: 'block' }}>{STAT_ICONS[s]} {s.replace('_', ' ')}</span>
                            <span style={{ fontFamily: 'Space Grotesk', fontSize: 18, fontWeight: 700, color: s === stat ? '#b482ff' : '#ffe2ab' }}>{selectedTeam[s] ?? 0}</span>
                        </div>
                    ))}
                </div>
            )}

            <div style={{ marginBottom: '0.875rem' }}>
                <label style={lbl}>Delta (+ to add, − to subtract)</label>
                <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                    {[-10, -5, -1].map(v => (
                        <button key={v} onClick={() => setDelta(d => d + v)} style={{ padding: '6px 10px', background: 'rgba(166,27,16,0.15)', border: '1px solid rgba(166,27,16,0.3)', color: '#ff4500', fontFamily: 'Space Grotesk', fontWeight: 700, fontSize: 12, borderRadius: 4, cursor: 'pointer' }}>{v}</button>
                    ))}
                    <input type="number" value={delta} onChange={e => setDelta(Number(e.target.value))}
                        style={{ width: 100, textAlign: 'center', background: '#2a2a2a', border: '1px solid rgba(80,69,50,0.3)', color: delta > 0 ? '#4caf82' : delta < 0 ? '#ff4500' : '#e5e2e1', fontFamily: 'Space Grotesk', fontWeight: 700, fontSize: 18, padding: '8px', borderRadius: 4 }} />
                    {[+1, +5, +10].map(v => (
                        <button key={v} onClick={() => setDelta(d => d + v)} style={{ padding: '6px 10px', background: 'rgba(76,175,130,0.15)', border: '1px solid rgba(76,175,130,0.3)', color: '#4caf82', fontFamily: 'Space Grotesk', fontWeight: 700, fontSize: 12, borderRadius: 4, cursor: 'pointer' }}>+{v}</button>
                    ))}
                </div>
            </div>

            <Btn label={loading ? 'Applying...' : `Apply Override: ${delta > 0 ? '+' : ''}${delta} ${stat.replace('_', ' ')}`}
                onClick={handleApply} variant="purple" disabled={loading || !teamId || delta === 0} />
        </Panel>
    );
}

/* ═══════════════════════════════════════════════════════════════════
   Main Admin Page
══════════════════════════════════════════════════════════════════════ */
export default function AdminPage() {
    const [adminKey, setAdminKey] = useState(() => sessionStorage.getItem('adminKey') || '');
    const [authenticated, setAuthenticated] = useState(!!adminKey);
    const [teams, setTeams] = useState([]);
    const [quests, setQuests] = useState([]);
    const [dungeons, setDungeons] = useState([]);

    // Toast stack
    const [toasts, setToasts] = useState([]);
    const addToast = (msg, type = 'info') => {
        const id = Date.now() + Math.random();
        setToasts(ts => [...ts, { id, msg, type }]);
        setTimeout(() => setToasts(ts => ts.filter(t => t.id !== id)), 4000);
    };
    const dismissToast = (id) => setToasts(ts => ts.filter(t => t.id !== id));

    // Game resolution state
    const [qTeam, setQTeam] = useState('');
    const [selQuest, setSelQuest] = useState('');
    const [dTeam, setDTeam] = useState('');
    const [selDungeon, setSelDungeon] = useState('');
    const [dPlayer, setDPlayer] = useState('');
    const [drTeam, setDrTeam] = useState('');

    // Config table filters
    const [questFilter, setQuestFilter] = useState('');
    const [dungeonFilter, setDungeonFilter] = useState('');

    const handleAuth = (key) => { setAdminKey(key); setAuthenticated(true); sessionStorage.setItem('adminKey', key); };
    const handleLogout = () => { setAdminKey(''); setAuthenticated(false); sessionStorage.removeItem('adminKey'); };

    const loadData = () => {
        Promise.all([getTeams(), getQuests(), getDungeons()]).then(([t, q, d]) => {
            setTeams(t.teams || []);
            setQuests(q.quests || []);
            setDungeons(d.dungeons || []);
        }).catch(e => addToast(`Failed to load data: ${e.message}`, 'err'));
    };

    useEffect(() => { if (authenticated) loadData(); }, [authenticated]);

    if (!authenticated) return <LoginGate onAuthenticated={handleAuth} />;

    const teamOpts = teams.map(t => ({ value: t.id, label: t.name }));
    const questOpts = quests.map(q => ({ value: q.id, label: q.name }));
    const dungeonOpts = dungeons.map(d => ({ value: d.id, label: d.name }));
    const playerOpts = teams.find(t => t.id === dTeam)?.players?.map(p => ({ value: p.id, label: p.name })) || [];

    const filteredQuests = quests.filter(q => q.name.toLowerCase().includes(questFilter.toLowerCase()));
    const filteredDungeons = dungeons.filter(d => d.name.toLowerCase().includes(dungeonFilter.toLowerCase()));

    /* ── Game Resolution Handlers ── */
    const handleStartQuest = async () => {
        if (!qTeam || !selQuest) { addToast('Select a team and quest first.', 'warn'); return; }
        try {
            const r = await startQuest(selQuest, qTeam, adminKey);
            addToast(`⚔️ Quest started! ${r.wagered.amount} ${r.wagered.stat.replace('_', ' ')} wagered from ${r.team?.name || 'team'}.`, 'ok');
            loadData();
        } catch (e) { addToast(e.message, 'err'); }
    };

    const handleCompleteQuest = async (success) => {
        if (!qTeam || !selQuest) { addToast('Select a team and quest first.', 'warn'); return; }
        try {
            const r = await completeQuest(selQuest, qTeam, success, adminKey);
            addToast(
                success
                    ? `🏆 Quest won — reward added to ${r.team?.name || 'team'}!`
                    : `💀 Quest lost — wager already gone.`,
                success ? 'ok' : 'err'
            );
            loadData();
        } catch (e) { addToast(e.message, 'err'); }
    };

    const handleDungeonClear = async () => {
        if (!dTeam || !selDungeon) { addToast('Select a team and dungeon first.', 'warn'); return; }
        try {
            const r = await clearDungeon(selDungeon, dTeam, dPlayer, adminKey);
            addToast(`🏆 Dungeon "${r.dungeon}" cleared! ${r.player?.name || 'Player'} is now ${r.player?.class}. Equipment: ${r.equipment}.`, 'ok');
            loadData();
        } catch (e) { addToast(e.message, 'err'); }
    };

    const handleDragonFight = async (success) => {
        if (!drTeam) { addToast('Select a team first.', 'warn'); return; }
        try {
            await fightDragon(drTeam, success, adminKey);
            addToast(success ? '🐉 DRAGON SLAIN! Legendary victory!' : '💀 Party defeated... The dragon endures.', success ? 'ok' : 'err');
            loadData();
        } catch (e) { addToast(e.message, 'err'); }
    };

    return (
        <main style={{ maxWidth: 1400, margin: '0 auto', padding: '2rem 2rem 5rem' }}>

            {/* Toast Stack */}
            <ToastContainer toasts={toasts} onDismiss={dismissToast} />

            {/* Header */}
            <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2.5rem' }}>
                <div>
                    <p style={{ fontFamily: 'Space Grotesk', fontSize: 11, color: '#ffbf00', textTransform: 'uppercase', letterSpacing: '0.15em', marginBottom: 8 }}>Game Master</p>
                    <h1 style={{ fontFamily: 'Noto Serif, serif', fontSize: 'clamp(2rem,5vw,3.5rem)', fontWeight: 900, color: '#ffe2ab', lineHeight: 1.1, marginBottom: 8 }}>Arcane Command</h1>
                    <p style={{ fontFamily: 'Work Sans', color: '#9c8f78', fontSize: 13 }}>Resolve games, override stats, create quests and dungeons — all in one place.</p>
                </div>
                <button onClick={handleLogout} style={{ padding: '8px 16px', background: 'rgba(166,27,16,0.15)', border: '1px solid rgba(166,27,16,0.3)', color: '#ff4500', fontFamily: 'Space Grotesk', fontSize: 10, fontWeight: 700, borderRadius: 4, cursor: 'pointer', textTransform: 'uppercase', letterSpacing: '0.08em' }}>🔓 Logout</button>
            </header>

            {/* ── SECTION 0: Manual Stat Override ── */}
            <h2 style={{ fontFamily: 'Space Grotesk', fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.15em', color: '#9c8f78', marginBottom: '1rem' }}>▸ Manual Stat Override (Fail-Safe)</h2>
            <div style={{ marginBottom: '3rem' }}>
                <OverridePanel teams={teams} adminKey={adminKey} onToast={addToast} onTeamsRefresh={loadData} />
            </div>

            {/* ── SECTION 1: Game Resolution ── */}
            <h2 style={{ fontFamily: 'Space Grotesk', fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.15em', color: '#9c8f78', marginBottom: '1rem' }}>▸ Game Resolution</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.25rem', marginBottom: '3rem' }}>

                {/* Side Quest */}
                <Panel title="Side Quest" icon="auto_stories" glow="amber">
                    <SearchSel label="Team" value={qTeam} onChange={setQTeam} options={teamOpts} placeholder="Search team..." />
                    <SearchSel label="Side Quest" value={selQuest} onChange={setSelQuest} options={questOpts} placeholder="Search quest..." />

                    {/* Show wager/reward preview when both are selected */}
                    {selQuest && (() => {
                        const q = quests.find(x => x.id === selQuest);
                        return q ? (
                            <div style={{ display: 'flex', gap: 8, marginBottom: '0.75rem', flexWrap: 'wrap' }}>
                                <span style={{ fontFamily: 'Space Grotesk', fontSize: 10, color: '#ff4500', background: 'rgba(166,27,16,0.12)', border: '1px solid rgba(166,27,16,0.25)', borderRadius: 4, padding: '3px 8px' }}>
                                    Wager: -{q.bet_amount} {q.bet_stat.replace('_', ' ')}
                                </span>
                                <span style={{ fontFamily: 'Space Grotesk', fontSize: 10, color: '#4caf82', background: 'rgba(76,175,130,0.12)', border: '1px solid rgba(76,175,130,0.25)', borderRadius: 4, padding: '3px 8px' }}>
                                    Reward: +{q.reward_amount} {q.reward_stat.replace('_', ' ')}
                                </span>
                            </div>
                        ) : null;
                    })()}

                    <div style={{ marginTop: 14, display: 'flex', flexDirection: 'column', gap: 4 }}>
                        <Btn label="⚔ Start Quest — Deduct Wager" variant="amber" onClick={handleStartQuest} disabled={!qTeam || !selQuest} />
                        <div style={{ height: 1, background: 'rgba(80,69,50,0.15)', margin: '6px 0' }} />
                        <Btn label="✓ Quest Won — Award Reward" variant="green" onClick={() => handleCompleteQuest(true)} disabled={!qTeam || !selQuest} />
                        <Btn label="✗ Quest Lost — Wager Already Gone" variant="red" onClick={() => handleCompleteQuest(false)} disabled={!qTeam || !selQuest} />
                    </div>
                </Panel>

                {/* Dungeon */}
                <Panel title="Main Quest (Dungeon)" icon="castle" glow="amber">
                    <SearchSel label="Team" value={dTeam} onChange={setDTeam} options={teamOpts} placeholder="Search team..." />
                    <SearchSel label="Dungeon" value={selDungeon} onChange={setSelDungeon} options={dungeonOpts} placeholder="Search dungeon..." />

                    {/* Show dungeon requirements preview */}
                    {selDungeon && (() => {
                        const d = dungeons.find(x => x.id === selDungeon);
                        return d ? (
                            <div style={{ display: 'flex', gap: 8, marginBottom: '0.75rem', flexWrap: 'wrap' }}>
                                <span style={{ fontFamily: 'Space Grotesk', fontSize: 10, color: '#bbc7dc', background: 'rgba(187,199,220,0.08)', border: '1px solid rgba(187,199,220,0.2)', borderRadius: 4, padding: '3px 8px' }}>
                                    Req: {d.required_stat.replace('_', ' ')} ≥ {d.required_amount}
                                </span>
                                <span style={{ fontFamily: 'Space Grotesk', fontSize: 10, color: '#ffbf00', background: 'rgba(255,191,0,0.08)', border: '1px solid rgba(255,191,0,0.2)', borderRadius: 4, padding: '3px 8px' }}>
                                    🎒 {d.equipment_name} · 🧙 {d.class_granted}
                                </span>
                            </div>
                        ) : null;
                    })()}

                    <Sel label="Player Receiving Class" value={dPlayer} onChange={setDPlayer} options={playerOpts} placeholder="Select Player..." />
                    <div style={{ marginTop: 14 }}>
                        <Btn label="⚔ Grant Clear, Equipment & Class" variant="amber" onClick={handleDungeonClear} disabled={!dTeam || !selDungeon} />
                    </div>
                </Panel>

                {/* Dragon */}
                <Panel title="Dragon Fight (Final)" icon="local_fire_department" glow="red">
                    <p style={{ fontFamily: 'Work Sans', fontSize: 12, color: '#9c8f78', marginBottom: '1.25rem', lineHeight: 1.5, fontStyle: 'italic' }}>
                        Final encounter. Select the challenging team and declare the outcome.
                    </p>
                    <SearchSel label="Challenging Team" value={drTeam} onChange={setDrTeam} options={teamOpts} placeholder="Search team..." />
                    <div style={{ marginTop: 14, display: 'flex', flexDirection: 'column' }}>
                        <Btn label="🐉 Dragon Slain (Victory!)" variant="dragWin" onClick={() => handleDragonFight(true)} disabled={!drTeam} />
                        <Btn label="💀 Party Defeated" variant="dragLoss" onClick={() => handleDragonFight(false)} disabled={!drTeam} />
                    </div>
                </Panel>
            </div>

            {/* ── SPONSOR: Ad Break Trigger ── */}
            <div style={{ marginBottom: '2rem' }}>
                <Panel title="🚨 Sponsor Ad Break (MMI)" icon="campaign" glow="teal">
                    <p style={{ fontFamily: 'Work Sans', fontSize: 12, color: '#9c8f78', marginBottom: '1rem', lineHeight: 1.5 }}>
                        Push a full-screen Money Mantra Investments ad to <strong>all connected players</strong> for 8 seconds. Use during event breaks!
                    </p>
                    <Btn label="📢 TRIGGER AD BREAK (8s)" variant="teal" onClick={async () => {
                        try {
                            await triggerAdBreak(adminKey);
                            addToast('Ad break triggered! All players will see the MMI ad for 8 seconds.', 'ok');
                        } catch (e) { addToast(e.message, 'err'); }
                    }} />
                </Panel>
            </div>

            {/* ── SECTION 2: Side Quest Config ── */}
            <h2 style={{ fontFamily: 'Space Grotesk', fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.15em', color: '#9c8f78', marginBottom: '1rem' }}>▸ Side Quest Configuration</h2>
            <div style={{ marginBottom: '1.5rem' }}>
                <Panel title="Edit Quest Stats & Name" icon="tune" glow="blue">
                    <p style={{ fontFamily: 'Work Sans', fontSize: 12, color: '#9c8f78', marginBottom: '0.75rem', lineHeight: 1.5 }}>
                        Edit name, description, wager and reward. Click Save on each row after editing.
                    </p>
                    <SearchBar value={questFilter} onChange={setQuestFilter} placeholder="Filter quests by name..." />
                    {filteredQuests.length === 0
                        ? <p style={{ fontFamily: 'Work Sans', fontSize: 13, color: '#504532', fontStyle: 'italic' }}>{quests.length === 0 ? 'No quests in database.' : 'No quests match your filter.'}</p>
                        : <ConfigTable headers={['Name', 'Description', 'Wager (stat × amount)', 'Reward (stat + amount)', 'Save']}>
                            {filteredQuests.map(q => (
                                <QuestRow key={q.id} quest={q} adminKey={adminKey} onToast={addToast}
                                    onSaved={u => setQuests(qs => qs.map(x => x.id === u.id ? { ...x, ...u } : x))} />
                            ))}
                        </ConfigTable>
                    }
                </Panel>
            </div>

            {/* Create Side Quest */}
            <div style={{ marginBottom: '3rem' }}>
                <CreateQuestForm adminKey={adminKey} onToast={addToast}
                    onCreated={q => { setQuests(qs => [...qs, q]); }} />
            </div>

            {/* ── SECTION 3: Dungeon Config ── */}
            <h2 style={{ fontFamily: 'Space Grotesk', fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.15em', color: '#9c8f78', marginBottom: '1rem' }}>▸ Dungeon Configuration</h2>
            <div style={{ marginBottom: '1.5rem' }}>
                <Panel title="Edit Dungeon Stats, Name & Requirements" icon="pentagon" glow="blue">
                    <p style={{ fontFamily: 'Work Sans', fontSize: 12, color: '#9c8f78', marginBottom: '0.75rem', lineHeight: 1.5 }}>
                        Edit name, description, entry requirement, equipment granted, and class unlocked.
                    </p>
                    <SearchBar value={dungeonFilter} onChange={setDungeonFilter} placeholder="Filter dungeons by name..." />
                    {filteredDungeons.length === 0
                        ? <p style={{ fontFamily: 'Work Sans', fontSize: 13, color: '#504532', fontStyle: 'italic' }}>{dungeons.length === 0 ? 'No dungeons in database.' : 'No dungeons match your filter.'}</p>
                        : <ConfigTable headers={['Name', 'Description', 'Required Stat ≥ Amount', 'Equipment', 'Class', 'Save']}>
                            {filteredDungeons.map(d => (
                                <DungeonRow key={d.id} dungeon={d} adminKey={adminKey} onToast={addToast}
                                    onSaved={u => setDungeons(ds => ds.map(x => x.id === u.id ? { ...x, ...u } : x))} />
                            ))}
                        </ConfigTable>
                    }
                </Panel>
            </div>

            {/* Create Dungeon */}
            <div style={{ marginBottom: '3rem' }}>
                <CreateDungeonForm adminKey={adminKey} onToast={addToast}
                    onCreated={d => { setDungeons(ds => [...ds, d]); }} />
            </div>
        </main>
    );
}
