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
    IconArrowLeft
} from '@tabler/icons-react';
import { getProgress, resetProgress, logout, updateProgress } from '../../utils/api';
import ExpandedExercise from '../../components/ExpandedExercise';
import './Dashboard.css';

const Dashboard = ({ userId, setAuth }) => {
    const [exercises, setExercises] = useState([]);
    const [progress, setProgress] = useState({});
    const [selectedIndex, setSelectedIndex] = useState(null);
    const [pendingIncorrectIndex, setPendingIncorrectIndex] = useState(null);
    const [loading, setLoading] = useState(true);
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

    const loadProgress = async () => {
        try {
            const res = await getProgress();
            if (res.data && res.data.progress) {
                setProgress(res.data.progress);
            }
        } catch (error) {
            console.error('Error cargando progreso:', error);
        }
    };

    useEffect(() => {
        const initExercises = async () => {
            setLoading(true);
            const stored = sessionStorage.getItem(`exercises_${userId}`);
            if (stored) {
                setExercises(JSON.parse(stored));
            } else {
                const newEx = generateExercises();
                setExercises(newEx);
                sessionStorage.setItem(`exercises_${userId}`, JSON.stringify(newEx));
            }
            await loadProgress();
            setLoading(false);
        };

        initExercises();
    }, [userId]);

    const handleReset = async () => {
        if (window.confirm('¿Reiniciar todo el progreso? Se generarán nuevos ejercicios.')) {
            setLoading(true);
            const newExercises = generateExercises();
            setExercises(newExercises);
            sessionStorage.setItem(`exercises_${userId}`, JSON.stringify(newExercises));
            await resetProgress();
            await loadProgress();
            setSelectedIndex(null);
            setPendingIncorrectIndex(null);
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
        await updateProgress(index, true);
        setProgress(prev => ({ ...prev, [index]: true }));
        setSelectedIndex(null);
    };

    const handleIncorrectAnswer = (index) => {
        setPendingIncorrectIndex(index);
        setSelectedIndex(index);
    };

    const handleRetryCorrect = async (index) => {
        await updateProgress(index, true);
        setProgress(prev => ({ ...prev, [index]: true }));
        setPendingIncorrectIndex(null);
        setSelectedIndex(null);
    };

    const completedCount = Object.values(progress).filter(v => v === true).length;
    const progressPercentage = (completedCount / 8) * 100;

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
                            <p>Aprendiendo sumas de 6 dígitos</p>
                        </div>
                    </div>

                    <div className="header-right">
                        <div className="stats-card">
                            <IconChartBar size={20} />
                            <div className="stats-info">
                                <span className="stats-label">Progreso</span>
                                <span className="stats-value">{completedCount}/8</span>
                            </div>
                        </div>

                        <button onClick={handleReset} className="btn-reset">
                            <IconRefresh size={18} />
                            <span>Reiniciar</span>
                        </button>

                        <button onClick={handleLogout} className="btn-logout">
                            <IconLogout size={18} />
                            <span>Salir</span>
                        </button>
                    </div>
                </div>

                <div className="progress-section">
                    <div className="progress-header">
                        <div className="progress-title">
                            <IconTrophy size={20} />
                            <span>Tu progreso</span>
                        </div>
                        <span className="progress-percentage">{Math.round(progressPercentage)}%</span>
                    </div>
                    <div className="progress-bar-container">
                        <div className="progress-bar-fill" style={{ width: `${progressPercentage}%` }}>
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
                            >
                                {isCompleted && (
                                    <div className="completed-badge">
                                        <IconCheck size={16} />
                                    </div>
                                )}

                                <div className="exercise-number">
                                    <span className="number-badge">{idx + 1}</span>
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
                                        <button className="solve-btn">
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
                    <div className="celebration-card">
                        <div className="celebration-content">
                            <IconTrophy size={48} />
                            <div>
                                <h3>¡Felicidades!</h3>
                                <p>Completaste todos los ejercicios. ¡Eres un genio de las matemáticas!</p>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Dashboard;