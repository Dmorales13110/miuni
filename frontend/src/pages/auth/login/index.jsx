import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
    IconMail,
    IconLock,
    IconArrowRight,
    IconCalculator,
    IconBrain,
    IconStar,
    IconFriends,
    IconRocket,
    IconUserCircle
} from '@tabler/icons-react';
import { login, getTestUsers } from '../../../utils/api';
import './Login.css';

const Login = ({ setAuth, setUserId }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!email || !password) {
            setError('Por favor, completa todos los campos');
            return;
        }

        setLoading(true);
        setError('');

        try {
            const res = await login(email, password);
            if (res.data.success) {
                setAuth(true);
                setUserId(res.data.user_id);
                navigate('/');
            } else {
                setError(res.data.error || 'Usuario o contraseña incorrectos');
            }
        } catch (err) {
            setError('Error de conexión');
        } finally {
            setLoading(false);
        }
    };

    const testUsers = getTestUsers();

    return (
        <div className="login-container">
            <div className="bg-shapes">
                <div className="shape shape-1"></div>
                <div className="shape shape-2"></div>
                <div className="shape shape-3"></div>
                <div className="shape shape-4"></div>
            </div>

            <div className="login-card">
                <div className="brand-side">
                    <div className="brand-content">
                        <div className="brand-icon">
                            <IconCalculator size={48} stroke={1.5} />
                        </div>
                        <h1 className="brand-title">
                            <span className="gradient-text">MiUni</span> Kids
                        </h1>
                        <p className="brand-subtitle">Aprende matemáticas de forma divertida</p>

                        <div className="stats">
                            <div className="stat">
                                <IconStar size={20} />
                                <span>+1000 ejercicios</span>
                            </div>
                            <div className="stat">
                                <IconFriends size={20} />
                                <span>Modo interactivo</span>
                            </div>
                            <div className="stat">
                                <IconBrain size={20} />
                                <span>Progreso personal</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="form-side">
                    <div className="form-header">
                        <div className="welcome-badge">
                            <IconRocket size={18} />
                            <span>¡Bienvenido de vuelta!</span>
                        </div>
                        <h2>Iniciar Sesión</h2>
                        <p>Ingresa tus credenciales para continuar</p>
                    </div>

                    <div className="test-users-card">
                        <div className="test-users-header">
                            <IconUserCircle size={20} />
                            <span>Cuentas de prueba</span>
                        </div>
                        <div className="test-users-list">
                            {testUsers.map((user, idx) => (
                                <div key={idx} className="test-user" onClick={() => {
                                    setEmail(user.username);
                                    setPassword(user.password);
                                }}>
                                    <div className="test-user-avatar">{user.username[0].toUpperCase()}</div>
                                    <div className="test-user-info">
                                        <strong>{user.username}</strong>
                                        <span>Contraseña: {user.password}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {error && (
                        <div className="error-alert">
                            <span>⚠️</span>
                            <span>{error}</span>
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="login-form">
                        <div className="input-field">
                            <IconMail size={20} className="input-icon" />
                            <input
                                type="text"
                                placeholder="Usuario o correo electrónico"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />
                        </div>

                        <div className="input-field">
                            <IconLock size={20} className="input-icon" />
                            <input
                                type="password"
                                placeholder="Contraseña"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                            />
                        </div>

                        <button type="submit" disabled={loading} className="submit-btn">
                            {loading ? (
                                <div className="spinner"></div>
                            ) : (
                                <>
                                    <span>Comenzar a aprender</span>
                                    <IconArrowRight size={20} />
                                </>
                            )}
                        </button>
                    </form>

                    <div className="register-link">
                        ¿No tienes cuenta? <Link to="/register">Crear cuenta gratis</Link>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Login;