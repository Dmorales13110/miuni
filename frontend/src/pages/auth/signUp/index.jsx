import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
    IconUser,
    IconMail,
    IconLock,
    IconArrowRight,
    IconCalculator,
    IconCheck,
    IconX,
    IconConfetti
} from '@tabler/icons-react';
import { register } from '../../../utils/api';
import './Register.css';

const Register = ({ setAuth, setUserId, setUsername: setUserUsername }) => {
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const hasMinLength = password.length >= 6;
    const hasNumber = /\d/.test(password);
    const hasLetter = /[a-zA-Z]/.test(password);
    const passwordsMatch = password === confirmPassword && password !== '';
    const passwordStrength = [hasMinLength, hasNumber, hasLetter].filter(Boolean).length;

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!username || !email || !password || !confirmPassword) {
            setError('Por favor, completa todos los campos');
            return;
        }

        if (password !== confirmPassword) {
            setError('Las contraseñas no coinciden');
            return;
        }

        if (passwordStrength < 2) {
            setError('Usa al menos 6 caracteres, letras y números');
            return;
        }

        setLoading(true);
        setError('');

        try {
            const res = await register(username, password);
            if (res.data.success) {
                setAuth(true);
                setUserId(res.data.user_id);
                setUserUsername(res.data.username);
                navigate('/');
            } else {
                setError(res.data.error || 'No se pudo crear la cuenta');
            }
        } catch (err) {
            setError('Error de conexión');
        } finally {
            setLoading(false);
        }
    };

    const getPasswordStrengthText = () => {
        if (passwordStrength === 0) return 'Ingresa una contraseña';
        if (passwordStrength === 1) return 'Contraseña débil';
        if (passwordStrength === 2) return 'Contraseña media';
        return 'Contraseña fuerte';
    };

    const getPasswordStrengthColor = () => {
        if (passwordStrength === 0) return '#94A3B8';
        if (passwordStrength === 1) return '#EF4444';
        if (passwordStrength === 2) return '#F59E0B';
        return '#10B981';
    };

    return (
        <div className="register-container">
            <div className="bg-shapes">
                <div className="shape shape-1"></div>
                <div className="shape shape-2"></div>
                <div className="shape shape-3"></div>
            </div>

            <div className="register-card">
                {/* Lado izquierdo - Gradiente Morado/Azul */}
                <div className="brand-side" style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
                    <div className="brand-content">
                        <div className="brand-icon">
                            <IconConfetti size={48} stroke={1.5} />
                        </div>
                        <h1 className="brand-title">¡Únete a la<br />aventura! 🎨</h1>
                        <p className="brand-subtitle">Crea tu cuenta y comienza a aprender</p>

                        <div className="benefits">
                            <div className="benefit">
                                <IconCheck size={18} />
                                <span>Ejercicios ilimitados</span>
                            </div>
                            <div className="benefit">
                                <IconCheck size={18} />
                                <span>Guarda tu progreso</span>
                            </div>
                            <div className="benefit">
                                <IconCheck size={18} />
                                <span>Interfaz divertida</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Lado derecho - Formulario */}
                <div className="form-side">
                    <div className="form-header">
                        <div className="welcome-badge" style={{ background: '#F3E8FF', color: '#764ba2' }}>
                            <IconCalculator size={18} />
                            <span>¡Nueva cuenta!</span>
                        </div>
                        <h2>Regístrate gratis</h2>
                        <p>Comienza tu aventura matemática hoy</p>
                    </div>

                    {error && (
                        <div className="error-alert">
                            <span>⚠️</span>
                            <span>{error}</span>
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="register-form">
                        <div className="input-field">
                            <IconUser size={20} className="input-icon" />
                            <input
                                type="text"
                                placeholder="Nombre de usuario"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                required
                            />
                        </div>

                        <div className="input-field">
                            <IconMail size={20} className="input-icon" />
                            <input
                                type="email"
                                placeholder="Correo electrónico"
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

                        {password && (
                            <div className="password-strength">
                                <div className="strength-bar">
                                    <div
                                        className="strength-fill"
                                        style={{
                                            width: `${(passwordStrength / 3) * 100}%`,
                                            backgroundColor: getPasswordStrengthColor()
                                        }}
                                    ></div>
                                </div>
                                <div className="strength-info">
                                    <span style={{ color: getPasswordStrengthColor() }}>
                                        {getPasswordStrengthText()}
                                    </span>
                                    <div className="strength-icons">
                                        {hasMinLength ? <IconCheck size={14} color="#10B981" /> : <IconX size={14} color="#EF4444" />}
                                        {hasNumber ? <IconCheck size={14} color="#10B981" /> : <IconX size={14} color="#EF4444" />}
                                        {hasLetter ? <IconCheck size={14} color="#10B981" /> : <IconX size={14} color="#EF4444" />}
                                    </div>
                                </div>
                            </div>
                        )}

                        <div className="input-field">
                            <IconLock size={20} className="input-icon" />
                            <input
                                type="password"
                                placeholder="Confirmar contraseña"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                required
                            />
                        </div>

                        {confirmPassword && !passwordsMatch && (
                            <div className="password-error">
                                <IconX size={14} />
                                <span>Las contraseñas no coinciden</span>
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={loading}
                            className="submit-btn"
                            style={{ background: 'linear-gradient(135deg, #667eea, #764ba2)' }}
                        >
                            {loading ? (
                                <div className="spinner"></div>
                            ) : (
                                <>
                                    <span>Crear cuenta</span>
                                    <IconArrowRight size={20} />
                                </>
                            )}
                        </button>
                    </form>

                    <div className="login-link">
                        ¿Ya tienes cuenta? <Link to="/login" style={{ color: '#667eea' }}>Iniciar sesión</Link>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Register;