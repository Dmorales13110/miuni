import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    IconRefresh,
    IconLogout,
    IconCheck,
    IconCalculator,
    IconStar,
    IconArrowRight,
    IconBrain,
    IconChartBar,
    IconTrophy,
    IconDeviceFloppy,
    IconLayoutGrid,
    IconList,
    IconProgressCheck
} from '@tabler/icons-react';
import {
    logout,
    loadExercisesForTab,
    saveExercisesForTab,
    getProgressForTab,
    updateProgressForTab,
    resetProgressForTab,
    loadActiveTab,
    saveActiveTab,
    getUserStats
} from '../../utils/api';
import ExpandedExercise from '../../components/ExpandedExercise';
import './Dashboard.css';

const Dashboard = ({ userId, setAuth, username }) => {
    const [exercises, setExercises] = useState([]);
    const [progress, setProgress] = useState({});
    const [selectedIndex, setSelectedIndex] = useState(null);
    const [pendingIncorrectIndex, setPendingIncorrectIndex] = useState(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState(0);
    const [savedStatus, setSavedStatus] = useState('');
    const [stats, setStats] = useState({ totalCompleted: 0, tabsProgress: {} });
    const navigate = useNavigate();

    const generateRandomNumber = () => {
        return Math.floor(100000 + Math.random() * 900000);
    };

    const generateExercise = () => {
        const num1 = generateRandomNumber();
        const num2 = generateRandomNumber();
        const num3 = generateRandomNumber();
        const result = num1 + num2 + num3;
        return { num1, num2, num3, result };
    };

    const generateExercises = () => {
        const newExercises = [];
        for (let i = 0; i < 8; i++) {
            newExercises.push(generateExercise());
        }
        return newExercises;
    };

    const loadTabData = async (tabId) => {
        setLoading(true);

        try {
            const exercisesRes = await loadExercisesForTab(tabId);
            if (exercisesRes.data && exercisesRes.data.exercises) {
                setExercises(exercisesRes.data.exercises);
            } else {
                const newEx = generateExercises();
                setExercises(newEx);
                await saveExercisesForTab(tabId, newEx);
            }

            const progressRes = await getProgressForTab(tabId);
            if (progressRes.data && progressRes.data.progress) {
                setProgress(progressRes.data.progress);
            }

            if (username) {
                const userStats = getUserStats(username);
                setStats(userStats);
            }

        } catch (error) {
            console.error('Error cargando datos:', error);
            const newEx = generateExercises();
            setExercises(newEx);
        }

        setLoading(false);
    };

    useEffect(() => {
        if (username) {
            const savedTab = loadActiveTab(username);
            setActiveTab(savedTab);
            loadTabData(savedTab);
        }
    }, [username]);

    const handleTabChange = async (tabId) => {
        if (tabId === activeTab) return;

        if (username) {
            saveActiveTab(username, tabId);
        }

        setActiveTab(tabId);
        setSelectedIndex(null);
        setPendingIncorrectIndex(null);
        await loadTabData(tabId);
    };

    const handleResetTab = async () => {
        if (window.confirm(`¿Reiniciar todo el progreso de la Tab ${activeTab + 1}? Se generarán nuevos ejercicios.`)) {
            setLoading(true);
            const newExercises = generateExercises();
            setExercises(newExercises);
            await saveExercisesForTab(activeTab, newExercises);
            await resetProgressForTab(activeTab);
            await loadTabData(activeTab);
            setSelectedIndex(null);
            setPendingIncorrectIndex(null);
            setSavedStatus('Tab reiniciada');
            setTimeout(() => setSavedStatus(''), 2000);
            setLoading(false);
        }
    };

    // Reiniciar todas las tabs
    const handleResetAll = async () => {
        if (window.confirm('¿Reiniciar TODO el progreso de TODAS las tabs? Se generarán nuevos ejercicios para todas.')) {
            setLoading(true);
            for (let i = 0; i < 3; i++) {
                const newExercises = generateExercises();
                await saveExercisesForTab(i, newExercises);
                await resetProgressForTab(i);
            }
            await loadTabData(activeTab);
            setSelectedIndex(null);
            setPendingIncorrectIndex(null);
            setSavedStatus('Todo reiniciado');
            setTimeout(() => setSavedStatus(''), 2000);
            setLoading(false);
        }
    };

    const handleLogout = async () => {
        await logout();
        setAuth(false);
        navigate('/login');
    };

    const handleExerciseClick = (index) => {
        if (progress[index] === true) return;
        if (pendingIncorrectIndex !== null) return;
        setSelectedIndex(index);
    };

    const handleBackToGrid = () => {
        setSelectedIndex(null);
    };

    const handleCorrectAnswer = async (index) => {
        await updateProgressForTab(activeTab, index, true);
        setProgress(prev => ({ ...prev, [index]: true }));

        if (username) {
            const userStats = getUserStats(username);
            setStats(userStats);
        }

        setSelectedIndex(null);
        setSavedStatus('Progreso guardado');
        setTimeout(() => setSavedStatus(''), 1500);
    };

    const handleIncorrectAnswer = (index) => {
        setPendingIncorrectIndex(index);
        setSelectedIndex(index);
    };

    const handleRetryCorrect = async (index) => {
        await updateProgressForTab(activeTab, index, true);
        setProgress(prev => ({ ...prev, [index]: true }));

        if (username) {
            const userStats = getUserStats(username);
            setStats(userStats);
        }

        setPendingIncorrectIndex(null);
        setSelectedIndex(null);
        setSavedStatus('Progreso guardado');
        setTimeout(() => setSavedStatus(''), 1500);
    };

    const completedCount = Object.values(progress).filter(v => v === true).length;
    const progressPercentage = (completedCount / 8) * 100;

    const tabNames = ['Nivel 1', 'Nivel 2', 'Nivel 3'];
    const tabColors = ['#667eea', '#f093fb', '#4ECDC4'];

    if (loading) {
        return (
            <div className="dashboard-loading">
                <div className="loading-spinner"></div>
                <p>Cargando tus ejercicios...</p>
            </div>
        );
    }

    if (selectedIndex !== null && exercises[selectedIndex]) {
        return (
            <ExpandedExercise
                exercise={exercises[selectedIndex]}
                exerciseIndex={selectedIndex}
                tabId={activeTab}
                onBack={handleBackToGrid}
                onCorrect={handleCorrectAnswer}
                onIncorrect={handleIncorrectAnswer}
                pendingIncorrect={pendingIncorrectIndex === selectedIndex}
                onRetryCorrect={handleRetryCorrect}
            />
        );
    }

    const totalProgress = Math.round((stats.totalCompleted / 24) * 100);

    return (
        <div className="dashboard-container">
            <div className="bg-shapes">
                <div className="shape shape-1"></div>
                <div className="shape shape-2"></div>
                <div className="shape shape-3"></div>
                <div className="shape shape-4"></div>
            </div>

            <div className="dashboard-content">
                <div className="dashboard-header">
                    <div className="header-left">
                        <div className="logo-icon">
                            <IconCalculator size={32} />
                        </div>
                        <div className="logo-text">
                            <h1>MiUni Kids</h1>
                            <p>¡Hola, {username}! Aprendiendo sumas de 6 dígitos</p>
                        </div>
                    </div>

                    <div className="header-right">
                        <div className="global-stats">
                            <IconProgressCheck size={18} />
                            <div className="stats-info">
                                <span className="stats-label">Progreso total</span>
                                <span className="stats-value">{stats.totalCompleted}/24</span>
                            </div>
                        </div>

                        {savedStatus && (
                            <div className="saved-status">
                                <IconDeviceFloppy size={16} />
                                <span>{savedStatus}</span>
                            </div>
                        )}

                        <button onClick={handleResetTab} className="btn-reset">
                            <IconRefresh size={18} />
                            <span>Reiniciar Nivel</span>
                        </button>

                        <button onClick={handleResetAll} className="btn-reset-all">
                            <IconRefresh size={18} />
                            <span>Reiniciar Todo</span>
                        </button>

                        <button onClick={handleLogout} className="btn-logout">
                            <IconLogout size={18} />
                            <span>Salir</span>
                        </button>
                    </div>
                </div>

                <div className="global-progress-section">
                    <div className="progress-header">
                        <div className="progress-title">
                            <IconTrophy size={20} />
                            <span>Progreso total del juego</span>
                        </div>
                        <span className="progress-percentage">{totalProgress}% completado</span>
                    </div>
                    <div className="progress-bar-container">
                        <div className="progress-bar-fill" style={{ width: `${totalProgress}%` }}>
                            <div className="progress-glow"></div>
                        </div>
                    </div>
                </div>

                <div className="tabs-container">
                    {tabNames.map((name, idx) => {
                        const tabCompleted = stats.tabsProgress[idx] || 0;
                        const isActive = activeTab === idx;
                        return (
                            <button
                                key={idx}
                                className={`tab-button ${isActive ? 'active' : ''}`}
                                onClick={() => handleTabChange(idx)}
                                style={{ '--tab-color': tabColors[idx] }}
                            >
                                <span className="tab-icon">
                                    {idx === 0 && '📚'}
                                    {idx === 1 && '⭐'}
                                    {idx === 2 && '🏆'}
                                </span>
                                <span className="tab-name">{name}</span>
                                <span className="tab-progress">{tabCompleted}/8</span>
                                <div className="tab-progress-bar">
                                    <div
                                        className="tab-progress-fill"
                                        style={{ width: `${(tabCompleted / 8) * 100}%`, backgroundColor: tabColors[idx] }}
                                    ></div>
                                </div>
                            </button>
                        );
                    })}
                </div>

                <div className="progress-section">
                    <div className="progress-header">
                        <div className="progress-title">
                            <IconChartBar size={20} />
                            <span>{tabNames[activeTab]} - Tu progreso</span>
                        </div>
                        <span className="progress-percentage">{Math.round(progressPercentage)}%</span>
                    </div>
                    <div className="progress-bar-container">
                        <div className="progress-bar-fill" style={{ width: `${progressPercentage}%`, backgroundColor: tabColors[activeTab] }}>
                            <div className="progress-glow"></div>
                        </div>
                    </div>
                </div>

                <div className="exercises-grid">
                    {exercises.map((ex, idx) => {
                        const isCompleted = progress[idx] === true;
                        return (
                            <div
                                key={idx}
                                className={`exercise-card ${isCompleted ? 'completed' : ''}`}
                                onClick={() => handleExerciseClick(idx)}
                                style={{ borderColor: isCompleted ? '#4CAF50' : tabColors[activeTab] }}
                            >
                                {isCompleted && (
                                    <div className="completed-badge">
                                        <IconCheck size={16} />
                                    </div>
                                )}

                                <div className="exercise-number">
                                    <span className="number-badge" style={{ background: `linear-gradient(135deg, ${tabColors[activeTab]}, ${tabColors[activeTab]}CC)` }}>
                                        {idx + 1}
                                    </span>
                                    <span className="exercise-label">Ejercicio</span>
                                </div>

                                <div className="exercise-operation">
                                    <div className="operation-row">
                                        <span className="operation-number">{ex.num1.toLocaleString()}</span>
                                        <span className="operation-sign">+</span>
                                    </div>
                                    <div className="operation-row">
                                        <span className="operation-number">{ex.num2.toLocaleString()}</span>
                                        <span className="operation-sign">+</span>
                                    </div>
                                    <div className="operation-row">
                                        <span className="operation-number">{ex.num3.toLocaleString()}</span>
                                        <span className="operation-sign">=</span>
                                    </div>
                                    <div className="operation-line"></div>
                                    <div className="operation-result">
                                        {isCompleted ? (
                                            <span className="result-answer">{ex.result.toLocaleString()}</span>
                                        ) : (
                                            <span className="result-placeholder">???</span>
                                        )}
                                    </div>
                                </div>

                                {!isCompleted && (
                                    <div className="exercise-action">
                                        <button className="solve-btn" style={{ background: `linear-gradient(135deg, ${tabColors[activeTab]}, ${tabColors[activeTab]}CC)` }}>
                                            <span>Resolver</span>
                                            <IconArrowRight size={16} />
                                        </button>
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>

                {completedCount === 8 && (
                    <div className="celebration-card" style={{ background: `linear-gradient(135deg, ${tabColors[activeTab]}, ${tabColors[activeTab]}DD)` }}>
                        <div className="celebration-content">
                            <IconTrophy size={48} />
                            <div>
                                <h3>¡Completaste {tabNames[activeTab]}!</h3>
                                <p>¡Felicidades! Sigue con el siguiente nivel para convertirte en un genio de las matemáticas.</p>
                            </div>
                        </div>
                    </div>
                )}

                {stats.totalCompleted === 24 && (
                    <div className="final-celebration">
                        <div className="final-celebration-content">
                            <div className="confetti">🎉</div>
                            <IconTrophy size={64} color="#FFD700" />
                            <h2>Felicidades</h2>
                            <p>¡Completaste todos los niveles!</p>
                            <button onClick={handleResetAll} className="play-again-btn">
                                Jugar de nuevo
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Dashboard;