import { useState, useEffect, useMemo } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { DotLottieReact } from '@lottiefiles/dotlottie-react';
import {
    getTeams, getDungeons,
    clearDungeon, fightDragon,
    updateDungeon, verifyAdminKey, updateTeamStat,
    createDungeon, triggerAdBreak,
} from '../api/client';

const STATS = ['power', 'hp', 'mana', 'agility', 'brain_power'];
const STAT_ICONS = { power: '⚔️', hp: '❤️', mana: '🔮', agility: '💨', brain_power: '🧠' };

/* ─── Dragon Animation Overlay ───────────────────────────────────── */

function DragonAnimation({ victory, teamName, onClose }) {
    useEffect(() => {
        const timer = setTimeout(onClose, 5000);
        return () => clearTimeout(timer);
    }, [onClose]);

    const winColors = {
        bg: 'radial-gradient(ellipse at center, rgba(255,140,0,0.25) 0%, rgba(10,8,5,0.97) 70%)',
        title: '#ffbf00',
        glow: '0 0 80px rgba(255,191,0,0.5)',
    };
    const lossColors = {
        bg: 'radial-gradient(ellipse at center, rgba(139,0,0,0.3) 0%, rgba(5,5,10,0.97) 70%)',
        title: '#ff4500',
        glow: '0 0 80px rgba(139,0,0,0.5)',
    };
    const c = victory ? winColors : lossColors;

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
                background: c.bg,
                cursor: 'pointer',
            }}
        >
            {/* Lottie dragon */}
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

            {/* Text */}
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
                    color: c.title,
                    textShadow: c.glow,
                    marginBottom: '0.5rem',
                    lineHeight: 1.1,
                }}>
                    {victory ? '🐉 Face the Dragon!' : '💀 Party Defeated'}
                </h2>
                <p style={{
                    fontFamily: 'Space Grotesk',
                    fontSize: 'clamp(0.9rem, 2.5vw, 1.3rem)',
                    color: victory ? '#ffe2ab' : '#9c8f78',
                    marginBottom: '1.5rem',
                }}>
                    {victory
                        ? `${teamName} — get ready to face the dragon!`
                        : `${teamName} limps back to the tavern, battered and broken.`
                    }
                </p>
                <p style={{ fontFamily: 'Space Grotesk', fontSize: 11, color: '#504532', textTransform: 'uppercase', letterSpacing: '0.15em' }}>
                    Click anywhere to continue
                </p>
            </motion.div>

            {/* particle sparks for victory */}
            {victory && [...Array(12)].map((_, i) => (
                <motion.div
                    key={i}
                    initial={{ opacity: 0, scale: 0, x: 0, y: 0 }}
                    animate={{
                        opacity: [0, 1, 0],
                        scale: [0, 1, 0],
                        x: Math.cos((i / 12) * Math.PI * 2) * (120 + Math.random() * 80),
                        y: Math.sin((i / 12) * Math.PI * 2) * (80 + Math.random() * 60),
                    }}
                    transition={{ delay: 0.5 + i * 0.07, duration: 1.2, ease: 'easeOut' }}
                    style={{
                        position: 'absolute',
                        top: '42%', left: '50%',
                        width: 6, height: 6,
                        borderRadius: '50%',
                        background: i % 3 === 0 ? '#ffbf00' : i % 3 === 1 ? '#ff6b35' : '#ffe2ab',
                        boxShadow: '0 0 8px #ffbf00',
                        pointerEvents: 'none',
                    }}
                />
            ))}
        </motion.div>
    );
}

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
   Dragon Encounter — Unified Section
══════════════════════════════════════════════════════════════════════ */

const THRESHOLD = 100;

function StatBar({ stat, value }) {
    const pct = Math.min((value / THRESHOLD) * 100, 100);
    const met = value >= THRESHOLD;
    const colors = {
        power:       { fill: '#ff6b35', label: '#ff9966' },
        hp:          { fill: '#ef4444', label: '#f87171' },
        mana:        { fill: '#818cf8', label: '#a5b4fc' },
        agility:     { fill: '#34d399', label: '#6ee7b7' },
        brain_power: { fill: '#f59e0b', label: '#fcd34d' },
    }[stat] || { fill: '#ffbf00', label: '#ffe2ab' };

    return (
        <div style={{ marginBottom: 6 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 3 }}>
                <span style={{ fontFamily: 'Space Grotesk', fontSize: 10, color: colors.label, textTransform: 'uppercase', letterSpacing: '0.07em' }}>
                    {STAT_ICONS[stat]} {stat.replace('_', ' ')}
                </span>
                <span style={{ fontFamily: 'Space Grotesk', fontSize: 11, fontWeight: 700, color: met ? colors.label : '#9c8f78' }}>
                    {value}<span style={{ color: '#504532', fontWeight: 400 }}>/{THRESHOLD}</span>
                    {met && <span style={{ marginLeft: 4, fontSize: 9, color: '#4caf82' }}>✓</span>}
                </span>
            </div>
            <div style={{ height: 5, borderRadius: 99, background: 'rgba(255,255,255,0.06)', overflow: 'hidden' }}>
                <div style={{
                    height: '100%', width: `${pct}%`, borderRadius: 99,
                    background: met ? `linear-gradient(90deg, ${colors.fill}aa, ${colors.fill})` : `${colors.fill}66`,
                    transition: 'width 0.5s ease',
                    boxShadow: met ? `0 0 6px ${colors.fill}88` : 'none',
                }} />
            </div>
        </div>
    );
}

function TeamEncounterCard({ team, dungeons, adminKey, onDragonFight, onToast, onRefresh }) {
    const allMet = STATS.every(s => (team[s] ?? 0) >= THRESHOLD);
    const [open, setOpen] = useState(false);
    const [selDungeon, setSelDungeon] = useState('');
    const [selPlayer, setSelPlayer] = useState('');
    const [doing, setDoing] = useState(null); // 'dungeon' | 'win' | 'loss'
    const [dragonAnim, setDragonAnim] = useState(null); // null | { victory: bool }

    const dungeonOpts = dungeons.map(d => ({ value: d.id, label: d.name }));
    const playerOpts  = (team.players || []).map(p => ({ value: p.id, label: p.name }));
    const selDungeonData = dungeons.find(d => d.id === selDungeon);

    const doClear = async () => {
        if (!selDungeon) { onToast('Select a dungeon first.', 'warn'); return; }
        setDoing('dungeon');
        try {
            const r = await clearDungeon(selDungeon, team.id, selPlayer, adminKey);
            onToast(`🏆 "${r.dungeon}" cleared! ${r.player?.name || ''} → ${r.player?.class}. Gear: ${r.equipment}`, 'ok');
            onRefresh();
            setSelDungeon(''); setSelPlayer('');
        } catch (e) { onToast(e.message, 'err'); }
        finally { setDoing(null); }
    };

    const doDragon = async (success) => {
        setDoing(success ? 'win' : 'loss');
        try {
            await onDragonFight(team.id, success);
            setDragonAnim({ victory: success });
        } catch (e) { onToast(e.message, 'err'); }
        finally { setDoing(null); }
    };

    const glowColor  = allMet ? 'rgba(255,191,0,0.25)' : 'rgba(80,69,50,0.0)';
    const borderColor= allMet ? 'rgba(255,191,0,0.35)' : 'rgba(80,69,50,0.18)';
    const bgColor    = allMet ? 'linear-gradient(135deg,#1e1b10 0%,#1c1b1b 100%)' : '#1c1b1b';

    return (
        <>
            <AnimatePresence>
                {dragonAnim && (
                    <DragonAnimation
                        victory={dragonAnim.victory}
                        teamName={team.name}
                        onClose={() => setDragonAnim(null)}
                    />
                )}
            </AnimatePresence>
        <div style={{
            background: bgColor, border: `1px solid ${borderColor}`, borderRadius: 10,
            padding: '1.25rem', position: 'relative', overflow: 'hidden',
            boxShadow: allMet ? `0 0 32px ${glowColor}, 0 2px 12px rgba(0,0,0,0.4)` : '0 2px 8px rgba(0,0,0,0.3)',
            transition: 'box-shadow 0.4s',
        }}>
            {/* Subtle shimmer stripe for unlocked */}
            {allMet && (
                <div style={{
                    position: 'absolute', top: 0, left: 0, right: 0, height: 2,
                    background: 'linear-gradient(90deg,transparent,rgba(255,191,0,0.6),transparent)',
                }} />
            )}

            {/* Header row */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.875rem' }}>
                <div>
                    <p style={{ fontFamily: 'Space Grotesk', fontSize: 10, color: '#9c8f78', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 3 }}>Team</p>
                    <h3 style={{ fontFamily: 'Noto Serif, serif', fontSize: '1.1rem', fontWeight: 700, color: allMet ? '#ffe2ab' : '#c9b99a' }}>{team.name}</h3>
                </div>
                <div style={{
                    display: 'flex', alignItems: 'center', gap: 6, padding: '4px 10px',
                    borderRadius: 99, border: `1px solid ${allMet ? 'rgba(255,191,0,0.4)' : 'rgba(80,69,50,0.3)'}`,
                    background: allMet ? 'rgba(255,191,0,0.10)' : 'rgba(30,28,25,0.6)',
                }}>
                    <span style={{ fontSize: 14 }}>{allMet ? '🔓' : '🔒'}</span>
                    <span style={{ fontFamily: 'Space Grotesk', fontSize: 10, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: allMet ? '#ffbf00' : '#504532' }}>
                        {allMet ? 'Unlocked' : 'Locked'}
                    </span>
                </div>
            </div>

            {/* Stat bars */}
            <div style={{ marginBottom: '0.875rem' }}>
                {STATS.map(s => <StatBar key={s} stat={s} value={team[s] ?? 0} />)}
            </div>

            {!allMet && (
                <p style={{ fontFamily: 'Work Sans', fontSize: 11, color: '#504532', fontStyle: 'italic', marginBottom: 0 }}>
                    {STATS.filter(s => (team[s] ?? 0) < THRESHOLD).map(s => `${STAT_ICONS[s]} ${s.replace('_',' ')}`).join(' · ')} need{STATS.filter(s=>(team[s]??0)<THRESHOLD).length===1?'s':''} {THRESHOLD}+
                </p>
            )}

            {allMet && (
                <>
                    {/* Dragon Fight actions */}
                    <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
                        <button onClick={() => doDragon(true)} disabled={!!doing} style={{
                            flex: 1, padding: '0.6rem', borderRadius: 5, border: 'none',
                            background: doing === 'win' ? '#2a2a2a' : 'linear-gradient(to right,#a67c00,#ffbf00)',
                            color: '#402d00', fontFamily: 'Space Grotesk', fontWeight: 700, fontSize: 11,
                            textTransform: 'uppercase', letterSpacing: '0.07em', cursor: doing ? 'wait' : 'pointer',
                            boxShadow: '0 0 14px rgba(255,191,0,0.25)', opacity: doing && doing !== 'win' ? 0.5 : 1,
                        }}>{doing === 'win' ? '...' : '🐉 Dragon Slain'}</button>
                        <button onClick={() => doDragon(false)} disabled={!!doing} style={{
                            flex: 1, padding: '0.6rem', borderRadius: 5,
                            border: '1px solid rgba(139,0,0,0.5)',
                            background: doing === 'loss' ? '#2a2a2a' : 'rgba(147,0,10,0.25)',
                            color: '#ff4500', fontFamily: 'Space Grotesk', fontWeight: 700, fontSize: 11,
                            textTransform: 'uppercase', letterSpacing: '0.07em', cursor: doing ? 'wait' : 'pointer',
                            opacity: doing && doing !== 'loss' ? 0.5 : 1,
                        }}>{doing === 'loss' ? '...' : '💀 Party Defeated'}</button>
                    </div>

                    {/* Dungeon clear toggle */}
                    <button onClick={() => setOpen(o => !o)} style={{
                        width: '100%', padding: '0.45rem', borderRadius: 4,
                        border: '1px solid rgba(80,69,50,0.25)', background: 'transparent',
                        color: '#9c8f78', fontFamily: 'Space Grotesk', fontSize: 10, fontWeight: 700,
                        textTransform: 'uppercase', letterSpacing: '0.07em', cursor: 'pointer',
                    }}>
                        {open ? '▲ Hide' : '⚔ Grant Dungeon Clear'}
                    </button>

                    {open && (
                        <div style={{ marginTop: 10, padding: '1rem', background: 'rgba(0,0,0,0.2)', borderRadius: 6, border: '1px solid rgba(80,69,50,0.2)' }}>
                            <SearchSel label="Dungeon" value={selDungeon} onChange={setSelDungeon} options={dungeonOpts} placeholder="Search dungeon..." />
                            {selDungeonData && (
                                <div style={{ display: 'flex', gap: 6, marginBottom: 8, flexWrap: 'wrap' }}>
                                    <span style={{ fontFamily: 'Space Grotesk', fontSize: 9, color: '#bbc7dc', background: 'rgba(187,199,220,0.08)', border: '1px solid rgba(187,199,220,0.15)', borderRadius: 4, padding: '2px 7px' }}>
                                        {selDungeonData.required_stat.replace('_',' ')} ≥ {selDungeonData.required_amount}
                                    </span>
                                    <span style={{ fontFamily: 'Space Grotesk', fontSize: 9, color: '#ffbf00', background: 'rgba(255,191,0,0.08)', border: '1px solid rgba(255,191,0,0.15)', borderRadius: 4, padding: '2px 7px' }}>
                                        🎒 {selDungeonData.equipment_name} · 🧙 {selDungeonData.class_granted}
                                    </span>
                                </div>
                            )}
                            <Sel label="Player Receiving Class" value={selPlayer} onChange={setSelPlayer} options={playerOpts} placeholder="Select Player..." />
                            <button onClick={doClear} disabled={!selDungeon || doing === 'dungeon'} style={{
                                width: '100%', marginTop: 6, padding: '0.55rem', borderRadius: 4,
                                border: '1px solid rgba(255,191,0,0.3)', background: 'rgba(255,191,0,0.1)',
                                color: '#ffe2ab', fontFamily: 'Space Grotesk', fontWeight: 700, fontSize: 10,
                                textTransform: 'uppercase', letterSpacing: '0.06em',
                                cursor: !selDungeon || doing === 'dungeon' ? 'not-allowed' : 'pointer',
                                opacity: !selDungeon ? 0.4 : 1,
                            }}>{doing === 'dungeon' ? 'Granting...' : '⚔ Grant Clear, Equipment & Class'}</button>
                        </div>
                    )}
                </>
            )}
        </div>
        </>
    );
}

function DragonEncounterSection({ teams, dungeons, adminKey, onDragonFight, onToast, onRefresh, teamFilter, onTeamFilterChange }) {
    const filteredTeams = teamFilter.trim()
        ? teams.filter(t => t.name.toLowerCase().includes(teamFilter.trim().toLowerCase()))
        : [];

    const unlocked = teams.filter(t => STATS.every(s => (t[s] ?? 0) >= THRESHOLD));
    const locked   = teams.filter(t => !STATS.every(s => (t[s] ?? 0) >= THRESHOLD));

    const displayList = filteredTeams.slice().sort((a, b) => {
        const aUnlocked = STATS.every(s => (a[s] ?? 0) >= THRESHOLD);
        const bUnlocked = STATS.every(s => (b[s] ?? 0) >= THRESHOLD);
        if (aUnlocked && !bUnlocked) return -1;
        if (!aUnlocked && bUnlocked) return 1;
        return 0;
    });

    return (
        <section style={{ marginBottom: '3rem' }}>
            {/* Summary bar */}
            <div style={{ display: 'flex', gap: 16, marginBottom: '1.5rem', flexWrap: 'wrap', alignItems: 'center' }}>
                <div style={{ padding: '8px 16px', borderRadius: 6, background: 'rgba(255,191,0,0.08)', border: '1px solid rgba(255,191,0,0.2)' }}>
                    <span style={{ fontFamily: 'Space Grotesk', fontSize: 10, color: '#9c8f78', textTransform: 'uppercase', letterSpacing: '0.08em' }}>🔓 Unlocked</span>
                    <span style={{ fontFamily: 'Space Grotesk', fontSize: 22, fontWeight: 700, color: '#ffbf00', display: 'block', lineHeight: 1.2 }}>{unlocked.length}</span>
                </div>
                <div style={{ padding: '8px 16px', borderRadius: 6, background: 'rgba(80,69,50,0.08)', border: '1px solid rgba(80,69,50,0.2)' }}>
                    <span style={{ fontFamily: 'Space Grotesk', fontSize: 10, color: '#9c8f78', textTransform: 'uppercase', letterSpacing: '0.08em' }}>🔒 Locked</span>
                    <span style={{ fontFamily: 'Space Grotesk', fontSize: 22, fontWeight: 700, color: '#504532', display: 'block', lineHeight: 1.2 }}>{locked.length}</span>
                </div>
                <div style={{ padding: '8px 16px', borderRadius: 6, background: 'rgba(187,199,220,0.05)', border: '1px solid rgba(187,199,220,0.12)' }}>
                    <span style={{ fontFamily: 'Space Grotesk', fontSize: 10, color: '#9c8f78', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Threshold per stat</span>
                    <span style={{ fontFamily: 'Space Grotesk', fontSize: 22, fontWeight: 700, color: '#bbc7dc', display: 'block', lineHeight: 1.2 }}>{THRESHOLD} pts</span>
                </div>

                {/* Team search filter */}
                <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 8 }}>
                    <input
                        value={teamFilter}
                        onChange={e => onTeamFilterChange(e.target.value)}
                        placeholder="🔍 Search team..."
                        style={{
                            background: '#201f1f', border: '1px solid rgba(255,191,0,0.2)',
                            color: '#ffe2ab', fontFamily: 'Space Grotesk', fontSize: 12,
                            padding: '0.5rem 0.875rem', borderRadius: 4, width: 220,
                            outline: 'none',
                        }}
                    />
                    {teamFilter && (
                        <button
                            onClick={() => onTeamFilterChange('')}
                            style={{
                                background: 'rgba(80,69,50,0.2)', border: '1px solid rgba(80,69,50,0.3)',
                                color: '#9c8f78', fontFamily: 'Space Grotesk', fontSize: 10, fontWeight: 700,
                                padding: '0.45rem 0.75rem', borderRadius: 4, cursor: 'pointer',
                                textTransform: 'uppercase', letterSpacing: '0.06em',
                            }}
                        >✕ Clear</button>
                    )}
                </div>
            </div>

            {teams.length === 0 ? (
                <p style={{ fontFamily: 'Work Sans', color: '#504532', fontStyle: 'italic', fontSize: 13 }}>No teams loaded yet.</p>
            ) : !teamFilter.trim() ? (
                <div style={{ textAlign: 'center', padding: '3rem 1rem', border: '1px dashed rgba(255,191,0,0.15)', borderRadius: 8 }}>
                    <span style={{ fontSize: 36, display: 'block', marginBottom: 12 }}>🔍</span>
                    <p style={{ fontFamily: 'Noto Serif, serif', color: '#9c8f78', fontSize: '1rem', fontWeight: 600, marginBottom: 4 }}>Search for a team above</p>
                    <p style={{ fontFamily: 'Work Sans', color: '#504532', fontSize: 12 }}>Type a team name to view their points table.</p>
                </div>
            ) : displayList.length === 0 ? (
                <p style={{ fontFamily: 'Work Sans', color: '#504532', fontStyle: 'italic', fontSize: 13 }}>No team matches <strong style={{ color: '#9c8f78' }}>"{teamFilter}"</strong>.</p>
            ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(500px, 1fr))', gap: '1.5rem' }}>
                    {displayList.map(team => (
                        <TeamEncounterCard
                            key={team.id}
                            team={team}
                            dungeons={dungeons}
                            adminKey={adminKey}
                            onDragonFight={onDragonFight}
                            onToast={onToast}
                            onRefresh={onRefresh}
                        />
                    ))}
                </div>
            )}
        </section>
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

function OverridePanel({ teams, adminKey, onToast, onTeamsRefresh, onTeamSelect }) {
    const [teamId, setTeamId] = useState('');
    const [stat, setStat] = useState('power');
    const [delta, setDelta] = useState(0);
    const [loading, setLoading] = useState(false);

    const teamOpts = teams.map(t => ({ value: t.id, label: t.name }));
    const selectedTeam = teams.find(t => t.id === teamId);

    const handleTeamChange = (id) => {
        setTeamId(id);
        const t = teams.find(x => x.id === id);
        if (t && onTeamSelect) onTeamSelect(t.name);
    };

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
                <SearchSel label="Team" value={teamId} onChange={handleTeamChange} options={teamOpts} placeholder="Search team..." />
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
    const [authenticated, setAuthenticated] = useState(false);
    const [authChecking, setAuthChecking] = useState(!!adminKey);
    const [teams, setTeams] = useState([]);
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
    const [dTeam, setDTeam] = useState('');
    const [selDungeon, setSelDungeon] = useState('');
    const [dPlayer, setDPlayer] = useState('');

    // Config table filters
    const [dungeonFilter, setDungeonFilter] = useState('');
    const [teamFilter, setTeamFilter] = useState('');

    const handleAuth = (key) => { setAdminKey(key); setAuthenticated(true); sessionStorage.setItem('adminKey', key); };
    const handleLogout = () => { setAdminKey(''); setAuthenticated(false); sessionStorage.removeItem('adminKey'); };

    useEffect(() => {
        if (!adminKey) {
            setAuthenticated(false);
            setAuthChecking(false);
            return;
        }

        setAuthChecking(true);
        verifyAdminKey(adminKey)
            .then(() => setAuthenticated(true))
            .catch(() => {
                sessionStorage.removeItem('adminKey');
                setAdminKey('');
                setAuthenticated(false);
            })
            .finally(() => setAuthChecking(false));
    }, [adminKey]);

    const loadData = () => {
        Promise.all([getTeams(), getDungeons()]).then(([t, d]) => {
            setTeams(t.teams || []);
            setDungeons(d.dungeons || []);
        }).catch(e => addToast(`Failed to load data: ${e.message}`, 'err'));
    };

    useEffect(() => { if (authenticated) loadData(); }, [authenticated]);

    if (authChecking) {
        return (
            <main style={{ minHeight: '100vh', display: 'grid', placeItems: 'center', color: '#9c8f78', fontFamily: 'Space Grotesk' }}>
                Verifying key...
            </main>
        );
    }

    if (!authenticated) return <LoginGate onAuthenticated={handleAuth} />;

    const teamOpts = teams.map(t => ({ value: t.id, label: t.name }));
    const dungeonOpts = dungeons.map(d => ({ value: d.id, label: d.name }));
    const playerOpts = teams.find(t => t.id === dTeam)?.players?.map(p => ({ value: p.id, label: p.name })) || [];

    const filteredDungeons = dungeons.filter(d => d.name.toLowerCase().includes(dungeonFilter.toLowerCase()));


    /* ── Game Resolution Handlers ── */

    const handleDragonFight = async (teamId, success) => {
        if (!teamId) { addToast('No team selected.', 'warn'); return; }
        try {
            await fightDragon(teamId, success, adminKey);
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
                    <p style={{ fontFamily: 'Work Sans', color: '#9c8f78', fontSize: 13 }}>Resolve dungeons and dragon fights, override stats, and manage dungeons.</p>
                </div>
                <button onClick={handleLogout} style={{ padding: '8px 16px', background: 'rgba(166,27,16,0.15)', border: '1px solid rgba(166,27,16,0.3)', color: '#ff4500', fontFamily: 'Space Grotesk', fontSize: 10, fontWeight: 700, borderRadius: 4, cursor: 'pointer', textTransform: 'uppercase', letterSpacing: '0.08em' }}>🔓 Logout</button>
            </header>

            {/* ── SECTION 0: Manual Stat Override ── */}
            <h2 style={{ fontFamily: 'Space Grotesk', fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.15em', color: '#9c8f78', marginBottom: '1rem' }}>▸ Manual Stat Override (Fail-Safe)</h2>
            <div style={{ marginBottom: '3rem' }}>
                <OverridePanel teams={teams} adminKey={adminKey} onToast={addToast} onTeamsRefresh={loadData} onTeamSelect={setTeamFilter} />
            </div>

            {/* ── SECTION 1: Dragon Encounter (Unified) ── */}
            <h2 style={{ fontFamily: 'Space Grotesk', fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.15em', color: '#9c8f78', marginBottom: '1rem' }}>▸ Dragon Encounter</h2>
            <DragonEncounterSection
                teams={teams}
                dungeons={dungeons}
                adminKey={adminKey}
                onDragonFight={handleDragonFight}
                onToast={addToast}
                onRefresh={loadData}
                teamFilter={teamFilter}
                onTeamFilterChange={setTeamFilter}
            />

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

            {/* ── SECTION 2: Dungeon Config ── */}
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
