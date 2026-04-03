const USE_MOCK = true;

// Datos mock para usuarios
const mockUsers = [
    { id: 1, username: 'mateo', password: '123456', email: 'mateo@ejemplo.com' },
    { id: 2, username: 'sofia', password: '123456', email: 'sofia@ejemplo.com' },
    { id: 3, username: 'lucas', password: '123456', email: 'lucas@ejemplo.com' },
];

let mockSession = null;

export const saveUserExercises = (username, tabId, exercises) => {
    const key = `exercises_${username}_tab${tabId}`;
    localStorage.setItem(key, JSON.stringify(exercises));
    console.log(` Ejercicios guardados para ${username} - Tab ${tabId + 1}`);
};

export const loadUserExercises = (username, tabId) => {
    const key = `exercises_${username}_tab${tabId}`;
    const saved = localStorage.getItem(key);
    if (saved) {
        console.log(` Ejercicios cargados para ${username} - Tab ${tabId + 1}`);
        return JSON.parse(saved);
    }
    console.log(` No hay ejercicios previos para ${username} - Tab ${tabId + 1}`);
    return null;
};

export const saveUserProgress = (username, tabId, progress) => {
    const key = `progress_${username}_tab${tabId}`;
    localStorage.setItem(key, JSON.stringify(progress));
    const completedCount = Object.values(progress).filter(v => v === true).length;
    console.log(`Progreso guardado para ${username} - Tab ${tabId + 1}: ${completedCount}/8 completados`);
};

export const loadUserProgress = (username, tabId) => {
    const key = `progress_${username}_tab${tabId}`;
    const saved = localStorage.getItem(key);
    if (saved) {
        console.log(`Progreso cargado para ${username} - Tab ${tabId + 1}`);
        return JSON.parse(saved);
    }
    console.log(`No hay progreso previo para ${username} - Tab ${tabId + 1}`);
    return null;
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
    console.log(`Datos eliminados para ${username}`);
};

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

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
    const response = await fetch('/api/session_check.php', { credentials: 'include' });
    return response;
};

export const login = async (username, password) => {
    if (USE_MOCK) {
        await delay(500);

        const user = mockUsers.find(u => (u.username === username || u.email === username) && u.password === password);

        if (user) {
            mockSession = user;
            return {
                ok: true,
                data: {
                    success: true,
                    user_id: user.id,
                    username: user.username
                }
            };
        }
        return {
            ok: true,
            data: { success: false, error: '❌ Usuario o contraseña incorrectos' }
        };
    }

    const response = await fetch('/api/login.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
        credentials: 'include'
    });
    return response;
};

export const register = async (username, password) => {
    if (USE_MOCK) {
        await delay(500);

        if (mockUsers.find(u => u.username === username)) {
            return {
                ok: true,
                data: { success: false, error: '❌ El usuario ya existe. ¡Elige otro nombre!' }
            };
        }

        const newUser = {
            id: mockUsers.length + 1,
            username,
            password,
            email: `${username}@ejemplo.com`
        };
        mockUsers.push(newUser);
        mockSession = newUser;

        return {
            ok: true,
            data: { success: true, user_id: newUser.id, username: newUser.username }
        };
    }

    const response = await fetch('/api/register.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
        credentials: 'include'
    });
    return response;
};

export const logout = async () => {
    if (USE_MOCK) {
        await delay(200);
        mockSession = null;
        return { ok: true, data: { success: true } };
    }

    const response = await fetch('/api/logout.php', {
        method: 'POST',
        credentials: 'include'
    });
    return response;
};

export const getProgressForTab = async (tabId) => {
    if (USE_MOCK) {
        await delay(300);
        if (!mockSession) {
            return { ok: true, data: { error: 'No autenticado' } };
        }

        const savedProgress = loadUserProgress(mockSession.username, tabId);
        let progressObject = {};

        if (savedProgress) {
            progressObject = savedProgress;
        } else {
            for (let i = 0; i < 8; i++) {
                progressObject[i] = false;
            }
        }

        return { ok: true, data: { progress: progressObject } };
    }

    const response = await fetch(`/api/get_progress.php?tab=${tabId}`, { credentials: 'include' });
    return response;
};

export const updateProgressForTab = async (tabId, exerciseIndex, completed) => {
    if (USE_MOCK) {
        await delay(300);
        if (!mockSession) {
            return { ok: true, data: { error: 'No autenticado' } };
        }

        const currentProgress = loadUserProgress(mockSession.username, tabId) || {};
        const updatedProgress = { ...currentProgress, [exerciseIndex]: completed };
        saveUserProgress(mockSession.username, tabId, updatedProgress);

        return { ok: true, data: { success: true } };
    }

    const response = await fetch('/api/update_progress.php', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tab: tabId, exercise_index: exerciseIndex, completed }),
        credentials: 'include'
    });
    return response;
};

export const resetProgressForTab = async (tabId) => {
    if (USE_MOCK) {
        await delay(300);
        if (!mockSession) {
            return { ok: true, data: { error: 'No autenticado' } };
        }

        const resetProgressObj = {};
        for (let i = 0; i < 8; i++) {
            resetProgressObj[i] = false;
        }
        saveUserProgress(mockSession.username, tabId, resetProgressObj);

        return { ok: true, data: { success: true } };
    }

    const response = await fetch(`/api/reset_progress.php?tab=${tabId}`, {
        method: 'DELETE',
        credentials: 'include'
    });
    return response;
};

export const saveExercisesForTab = async (tabId, exercises) => {
    if (USE_MOCK && mockSession) {
        await delay(200);
        saveUserExercises(mockSession.username, tabId, exercises);
        return { ok: true, data: { success: true } };
    }
    return { ok: true, data: { success: true } };
};

export const loadExercisesForTab = async (tabId) => {
    if (USE_MOCK && mockSession) {
        await delay(200);
        const exercises = loadUserExercises(mockSession.username, tabId);
        return { ok: true, data: { exercises } };
    }
    return { ok: true, data: { exercises: null } };
};

export const getTestUsers = () => {
    return mockUsers.map(u => ({ username: u.username, password: u.password }));
};

export const getUserStats = (username) => {
    const stats = {
        totalCompleted: 0,
        totalExercises: 24,
        tabsProgress: {}
    };

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