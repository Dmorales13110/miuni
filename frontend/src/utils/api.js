const USE_MOCK = false;

// ---------------------------------------------------------------------------
// Helpers de localStorage (usados por getUserStats y como caché local)
// ---------------------------------------------------------------------------

export const saveUserExercises = (username, tabId, exercises) => {
    const key = `exercises_${username}_tab${tabId}`;
    localStorage.setItem(key, JSON.stringify(exercises));
};

export const loadUserExercises = (username, tabId) => {
    const key = `exercises_${username}_tab${tabId}`;
    const saved = localStorage.getItem(key);
    return saved ? JSON.parse(saved) : null;
};

export const saveUserProgress = (username, tabId, progress) => {
    const key = `progress_${username}_tab${tabId}`;
    localStorage.setItem(key, JSON.stringify(progress));
};

export const loadUserProgress = (username, tabId) => {
    const key = `progress_${username}_tab${tabId}`;
    const saved = localStorage.getItem(key);
    return saved ? JSON.parse(saved) : null;
};

export const saveActiveTab = (username, tabId) => {
    localStorage.setItem(`activeTab_${username}`, tabId);
};

export const loadActiveTab = (username) => {
    const saved = localStorage.getItem(`activeTab_${username}`);
    return saved ? parseInt(saved) : 0;
};

export const deleteUserData = (username) => {
    for (let i = 0; i < 3; i++) {
        localStorage.removeItem(`exercises_${username}_tab${i}`);
        localStorage.removeItem(`progress_${username}_tab${i}`);
    }
    localStorage.removeItem(`activeTab_${username}`);
};

// ---------------------------------------------------------------------------
// Mock data (solo usado cuando USE_MOCK = true)
// ---------------------------------------------------------------------------

const mockUsers = [
    { id: 1, username: 'mateo', password: '123456', email: 'mateo@ejemplo.com' },
    { id: 2, username: 'sofia', password: '123456', email: 'sofia@ejemplo.com' },
    { id: 3, username: 'lucas', password: '123456', email: 'lucas@ejemplo.com' },
];

let mockSession = null;

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// ---------------------------------------------------------------------------
// Auth
// ---------------------------------------------------------------------------

export const checkSession = async () => {
    if (USE_MOCK) {
        await delay(300);
        return {
            ok: true,
            data: {
                authenticated: mockSession !== null,
                user_id: mockSession?.id,
                username: mockSession?.username
            }
        };
    }

    const response = await fetch('/api/user/session-check.php', { credentials: 'include' });
    const data = await response.json();
    return { ok: response.ok, data };
};

export const login = async (username, password) => {
    if (USE_MOCK) {
        await delay(500);
        const user = mockUsers.find(
            u => (u.username === username || u.email === username) && u.password === password
        );
        if (user) {
            mockSession = user;
            return { ok: true, data: { success: true, user_id: user.id, username: user.username } };
        }
        return { ok: true, data: { success: false, error: '❌ Usuario o contraseña incorrectos' } };
    }

    const response = await fetch('/api/auth/login.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
        credentials: 'include'
    });
    const data = await response.json();
    return { ok: response.ok, data };
};

export const register = async (username, password) => {
    if (USE_MOCK) {
        await delay(500);
        if (mockUsers.find(u => u.username === username)) {
            return { ok: true, data: { success: false, error: '❌ El usuario ya existe. ¡Elige otro nombre!' } };
        }
        const newUser = { id: mockUsers.length + 1, username, password, email: `${username}@ejemplo.com` };
        mockUsers.push(newUser);
        mockSession = newUser;
        return { ok: true, data: { success: true, user_id: newUser.id, username: newUser.username } };
    }

    const response = await fetch('/api/auth/register.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
        credentials: 'include'
    });
    const data = await response.json();
    return { ok: response.ok, data };
};

export const logout = async () => {
    if (USE_MOCK) {
        await delay(200);
        mockSession = null;
        return { ok: true, data: { success: true } };
    }

    const response = await fetch('/api/auth/logout.php', {
        method: 'POST',
        credentials: 'include'
    });
    const data = await response.json();
    return { ok: response.ok, data };
};

// ---------------------------------------------------------------------------
// Progreso — las funciones reales también sincronizan localStorage
// para que getUserStats() funcione correctamente
// ---------------------------------------------------------------------------

export const getProgressForTab = async (tabId, username = null) => {
    if (USE_MOCK) {
        await delay(300);
        if (!mockSession) return { ok: true, data: { error: 'No autenticado' } };

        const savedProgress = loadUserProgress(mockSession.username, tabId);
        const progressObject = savedProgress ?? Object.fromEntries(
            Array.from({ length: 8 }, (_, i) => [i, false])
        );
        return { ok: true, data: { progress: progressObject } };
    }

    const response = await fetch(`/api/user/get-progress.php?tab=${tabId}`, {
        credentials: 'include'
    });
    const data = await response.json();

    // Sincronizar con localStorage para que getUserStats funcione
    if (data.progress && username) {
        saveUserProgress(username, tabId, data.progress);
    }

    return { ok: response.ok, data };
};

export const updateProgressForTab = async (tabId, exerciseIndex, completed, username = null) => {
    if (USE_MOCK) {
        await delay(300);
        if (!mockSession) return { ok: true, data: { error: 'No autenticado' } };

        const currentProgress = loadUserProgress(mockSession.username, tabId) || {};
        const updatedProgress = { ...currentProgress, [exerciseIndex]: completed };
        saveUserProgress(mockSession.username, tabId, updatedProgress);
        return { ok: true, data: { success: true } };
    }

    const response = await fetch('/api/user/update-progress.php', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tab: tabId, exercise_index: exerciseIndex, completed }),
        credentials: 'include'
    });
    const data = await response.json();

    // Sincronizar con localStorage
    if (data.success && username) {
        const currentProgress = loadUserProgress(username, tabId) || {};
        saveUserProgress(username, tabId, { ...currentProgress, [exerciseIndex]: completed });
    }

    return { ok: response.ok, data };
};

export const resetProgressForTab = async (tabId, username = null) => {
    if (USE_MOCK) {
        await delay(300);
        if (!mockSession) return { ok: true, data: { error: 'No autenticado' } };

        const resetProgressObj = Object.fromEntries(
            Array.from({ length: 8 }, (_, i) => [i, false])
        );
        saveUserProgress(mockSession.username, tabId, resetProgressObj);
        return { ok: true, data: { success: true } };
    }

    const response = await fetch(`/api/user/reset-progress.php?tab=${tabId}`, {
        method: 'DELETE',
        credentials: 'include'
    });
    const data = await response.json();

    // Limpiar localStorage
    if (data.success && username) {
        const resetProgressObj = Object.fromEntries(
            Array.from({ length: 8 }, (_, i) => [i, false])
        );
        saveUserProgress(username, tabId, resetProgressObj);
    }

    return { ok: response.ok, data };
};

// ---------------------------------------------------------------------------
// Ejercicios — en modo real se generan en el cliente, no se persisten en BD
// ---------------------------------------------------------------------------

export const saveExercisesForTab = async (tabId, exercises, username = null) => {
    if (USE_MOCK && mockSession) {
        await delay(200);
        saveUserExercises(mockSession.username, tabId, exercises);
    } else if (username) {
        saveUserExercises(username, tabId, exercises);
    }
    return { ok: true, data: { success: true } };
};

export const loadExercisesForTab = async (tabId, username = null) => {
    if (USE_MOCK && mockSession) {
        await delay(200);
        const exercises = loadUserExercises(mockSession.username, tabId);
        return { ok: true, data: { exercises } };
    }
    if (username) {
        const exercises = loadUserExercises(username, tabId);
        return { ok: true, data: { exercises } };
    }
    return { ok: true, data: { exercises: null } };
};

// ---------------------------------------------------------------------------
// Estadísticas globales (lee desde localStorage)
// ---------------------------------------------------------------------------

export const getTestUsers = () => {
    return mockUsers.map(u => ({ username: u.username, password: u.password }));
};

export const getUserStats = (username) => {
    const stats = { totalCompleted: 0, totalExercises: 24, tabsProgress: {} };

    for (let i = 0; i < 3; i++) {
        const progress = loadUserProgress(username, i);
        if (progress) {
            const completed = Object.values(progress).filter(v => v === true).length;
            stats.tabsProgress[i] = completed;
            stats.totalCompleted += completed;
        } else {
            stats.tabsProgress[i] = 0;
        }
    }

    return stats;
};
