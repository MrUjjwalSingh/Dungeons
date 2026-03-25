const API_BASE = import.meta.env.VITE_API_URL || '/api';

const handleResponse = async (res) => {
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Something went wrong');
    return data;
};

// ── Teams ──────────────────────────────────────────────────────────
export const registerTeam = ({ name, players }) =>
    fetch(`${API_BASE}/teams`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ teamName: name, players }),
    }).then(handleResponse);

export const getTeams = () =>
    fetch(`${API_BASE}/teams`).then(handleResponse);

export const getTeam = (id) =>
    fetch(`${API_BASE}/teams/${id}`).then(handleResponse);

// ── Quests ─────────────────────────────────────────────────────────
export const getQuests = () =>
    fetch(`${API_BASE}/quests`).then(handleResponse);

export const updateQuest = (questId, data, adminKey) =>
    fetch(`${API_BASE}/quests/${questId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', 'x-admin-key': adminKey },
        body: JSON.stringify(data),
    }).then(handleResponse);

export const createQuest = (data, adminKey) =>
    fetch(`${API_BASE}/quests`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-admin-key': adminKey },
        body: JSON.stringify(data),
    }).then(handleResponse);

/** Start a quest — deducts wager stat upfront */
export const startQuest = (questId, teamId, adminKey) =>
    fetch(`${API_BASE}/quests/${questId}/start`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-admin-key': adminKey },
        body: JSON.stringify({ teamId }),
    }).then(handleResponse);

/** Complete a quest — awards reward stat on success */
export const completeQuest = (questId, teamId, success, adminKey) =>
    fetch(`${API_BASE}/quests/${questId}/complete`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-admin-key': adminKey },
        body: JSON.stringify({ teamId, success }),
    }).then(handleResponse);

// ── Dungeons ───────────────────────────────────────────────────────
export const getDungeons = () =>
    fetch(`${API_BASE}/dungeons`).then(handleResponse);

export const updateDungeon = (dungeonId, data, adminKey) =>
    fetch(`${API_BASE}/dungeons/${dungeonId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', 'x-admin-key': adminKey },
        body: JSON.stringify(data),
    }).then(handleResponse);

export const createDungeon = (data, adminKey) =>
    fetch(`${API_BASE}/dungeons`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-admin-key': adminKey },
        body: JSON.stringify(data),
    }).then(handleResponse);

export const clearDungeon = (dungeonId, teamId, playerId, adminKey) =>
    fetch(`${API_BASE}/dungeons/${dungeonId}/clear`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-admin-key': adminKey },
        body: JSON.stringify({ teamId, playerId }),
    }).then(handleResponse);

// ── Board ──────────────────────────────────────────────────────────
export const getLeaderboard = () =>
    fetch(`${API_BASE}/board/leaderboard`).then(handleResponse);

export const getAnnouncements = () =>
    fetch(`${API_BASE}/board/announcements`).then(handleResponse);

export const triggerAdBreak = (adminKey) =>
    fetch(`${API_BASE}/board/adbreak`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-admin-key': adminKey },
    }).then(handleResponse);

// ── Dragon ─────────────────────────────────────────────────────────
export const getDragonEligibility = (teamId) =>
    fetch(`${API_BASE}/dragon/eligibility/${teamId}`).then(handleResponse);

export const fightDragon = (teamId, success, adminKey) =>
    fetch(`${API_BASE}/dragon/fight`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-admin-key': adminKey },
        body: JSON.stringify({ teamId, success }),
    }).then(handleResponse);

// ── Admin Auth ─────────────────────────────────────────────────────
export const verifyAdminKey = (adminKey) =>
    fetch(`${API_BASE}/admin/verify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-admin-key': adminKey },
    }).then(handleResponse);

// ── Manual Stat Override ───────────────────────────────────────────
export const updateTeamStat = (teamId, statName, delta, adminKey) =>
    fetch(`${API_BASE}/teams/${teamId}/stats`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', 'x-admin-key': adminKey },
        body: JSON.stringify({ statName, delta }),
    }).then(handleResponse);
