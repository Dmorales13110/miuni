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
    loadUserProgress,
    saveUserProgress
} from '../../utils/api';
import ExpandedExercise from '../../components/ExpandedExercise';
import './Dashboard.css';

const Dashboard = ({ userId, setAuth, username }) => {
    const [exercises, setExercises] = useState([]);
    const [progressByTab, setProgressByTab] = useState({});
    const [selectedIndex, setSelectedIndex] = useState(null);
    const [pendingIncorrectIndex, setPendingIncorrectIndex] = useState(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState(0);
    const [savedStatus, setSavedStatus] = useState('');
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
            const exercisesRes = await loadExercisesForTab(tabId, username);
            if (exercisesRes.data && exercisesRes.data.exercises) {
                setExercises(exercisesRes.data.exercises);
            } else {
                const newEx = generateExercises();
                setExercises(newEx);
                await saveExercisesForTab(tabId, newEx, username);
            }

            const progressRes = await getProgressForTab(tabId, username);
            if (progressRes.data && progressRes.data.progress) {
                setProgressByTab(prev => ({ ...prev, [tabId]: progressRes.data.progress }));
            } else if (username) {
                const local = loadUserProgress(username, tabId);
                if (local) setProgressByTab(prev => ({ ...prev, [tabId]: local }));
            }

        } catch (error) {
            console.error('Error cargando datos:', error);
            const newEx = generateExercises();
            setExercises(newEx);
            if (username) {
                const local = loadUserProgress(username, tabId);
                if (local) setProgressByTab(prev => ({ ...prev, [tabId]: local }));
            }
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

        // Si el tab ya fue cargado antes, solo recargar ejercicios (el progreso ya está en caché)
        if (progressByTab[tabId] !== undefined) {
            try {
                const exercisesRes = await loadExercisesForTab(tabId, username);
                if (exercisesRes.data && exercisesRes.data.exercises) {
                    setExercises(exercisesRes.data.exercises);
                }
            } catch (error) {
                console.error('Error cargando ejercicios:', error);
            }
        } else {
            await loadTabData(tabId);
        }
    };

    const handleResetTab = async () => {
        if (window.confirm(`¿Reiniciar todo el progreso de la Tab ${activeTab + 1}? Se generarán nuevos ejercicios.`)) {
            setLoading(true);
            setProgressByTab(prev => ({ ...prev, [activeTab]: {} }));
            if (username) saveUserProgress(username, activeTab, {});
            const newExercises = generateExercises();
            setExercises(newExercises);
            await saveExercisesForTab(activeTab, newExercises, username);
            await resetProgressForTab(activeTab, username);
            await loadTabData(activeTab);
            setSelectedIndex(null);
            setPendingIncorrectIndex(null);
            setSavedStatus('Tab reiniciada');
            setTimeout(() => setSavedStatus(''), 2000);
            setLoading(false);
        }
    };

    const handleResetAll = async () => {
        if (window.confirm('¿Reiniciar TODO el progreso de TODAS las tabs? Se generarán nuevos ejercicios para todas.')) {
            setLoading(true);
            setProgressByTab({});
            for (let i = 0; i < 3; i++) {
                if (username) saveUserProgress(username, i, {});
                const newExercises = generateExercises();
                await saveExercisesForTab(i, newExercises, username);
                await resetProgressForTab(i, username);
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

    const progress = progressByTab[activeTab] || {};

    const handleExerciseClick = (index) => {
        if (progress[index] === true) return;
        if (pendingIncorrectIndex !== null) return;
        setSelectedIndex(index);
    };

    const handleBackToGrid = () => {
        setSelectedIndex(null);
    };

    const handleCorrectAnswer = async (index) => {
        const updated = { ...(progressByTab[activeTab] || {}), [index]: true };
        setProgressByTab(prev => ({ ...prev, [activeTab]: updated }));
        if (username) saveUserProgress(username, activeTab, updated);

        try {
            await updateProgressForTab(activeTab, index, true, username);
        } catch (error) {
            console.error('Error guardando progreso en DB:', error);
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
        const updated = { ...(progressByTab[activeTab] || {}), [index]: true };
        setProgressByTab(prev => ({ ...prev, [activeTab]: updated }));
        if (username) saveUserProgress(username, activeTab, updated);

        try {
            await updateProgressForTab(activeTab, index, true, username);
        } catch (error) {
            console.error('Error guardando progreso en DB:', error);
        }

        setPendingIncorrectIndex(null);
        setSelectedIndex(null);
        setSavedStatus('Progreso guardado');
        setTimeout(() => setSavedStatus(''), 1500);
    };

    const completedCount = Object.values(progress).filter(v => v === true).length;
    const progressPercentage = (completedCount / 8) * 100;

    const tabsCompleted = [0, 1, 2].map(i =>
        Object.values(progressByTab[i] || {}).filter(v => v === true).length
    );
    const totalCompleted = tabsCompleted.reduce((a, b) => a + b, 0);
    const totalProgress = Math.round((totalCompleted / 24) * 100);

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
                                <span className="stats-value">{totalCompleted}/24</span>
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
                        const tabCompleted = tabsCompleted[idx];
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

                {totalCompleted === 24 && (
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