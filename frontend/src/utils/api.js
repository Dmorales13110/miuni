const USE_MOCK = true;

const mockUsers = [
    { id: 1, username: 'mateo', password: '123456', email: 'mateo@ejemplo.com' },
    { id: 2, username: 'sofia', password: '123456', email: 'sofia@ejemplo.com' },
    { id: 3, username: 'lucas', password: '123456', email: 'lucas@ejemplo.com' },
];

let mockProgress = {};

let mockSession = null;

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
            if (!mockProgress[user.id]) {
                mockProgress[user.id] = Array(8).fill(false);
            }
            return {
                ok: true,
                data: { success: true, user_id: user.id, username: user.username }
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
        mockProgress[newUser.id] = Array(8).fill(false);

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

export const getProgress = async () => {
    if (USE_MOCK) {
        await delay(300);
        if (!mockSession) {
            return { ok: true, data: { error: 'No autenticado' } };
        }

        const progress = mockProgress[mockSession.id] || Array(8).fill(false);
        const progressObject = {};
        progress.forEach((completed, index) => {
            progressObject[index] = completed;
        });

        return { ok: true, data: { progress: progressObject } };
    }

    const response = await fetch('/api/get_progress.php', { credentials: 'include' });
    return response;
};

export const updateProgress = async (exerciseIndex, completed) => {
    if (USE_MOCK) {
        await delay(300);
        if (!mockSession) {
            return { ok: true, data: { error: 'No autenticado' } };
        }

        if (!mockProgress[mockSession.id]) {
            mockProgress[mockSession.id] = Array(8).fill(false);
        }
        mockProgress[mockSession.id][exerciseIndex] = completed;

        return { ok: true, data: { success: true } };
    }

    const response = await fetch('/api/update_progress.php', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ exercise_index: exerciseIndex, completed }),
        credentials: 'include'
    });
    return response;
};

export const resetProgress = async () => {
    if (USE_MOCK) {
        await delay(300);
        if (!mockSession) {
            return { ok: true, data: { error: 'No autenticado' } };
        }

        mockProgress[mockSession.id] = Array(8).fill(false);
        return { ok: true, data: { success: true } };
    }

    const response = await fetch('/api/reset_progress.php', {
        method: 'DELETE',
        credentials: 'include'
    });
    return response;
};

export const getTestUsers = () => {
    return mockUsers.map(u => ({ username: u.username, password: u.password }));
};