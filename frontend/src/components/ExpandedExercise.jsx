import React, { useState, useEffect } from 'react';
import {
    IconArrowLeft,
    IconCheck,
    IconX,
    IconRefresh,
    IconArrowRight,
    IconHelpCircle
} from '@tabler/icons-react';
import './ExpandedExercise.css';

const ExpandedExercise = ({
    exercise,
    exerciseIndex,
    onBack,
    onCorrect,
    onIncorrect,
    pendingIncorrect,
    onRetryCorrect
}) => {
    const [userAnswer, setUserAnswer] = useState('');
    const [showFeedback, setShowFeedback] = useState(false);
    const [isCorrect, setIsCorrect] = useState(false);
    const [digitsDragged, setDigitsDragged] = useState({});
    const [scrambledDigits, setScrambledDigits] = useState([]);
    const [showHint, setShowHint] = useState(false);
    const [showSuccessMessage, setShowSuccessMessage] = useState(false);

    const resultString = exercise.result.toString().padStart(7, '0');
    const correctDigits = resultString.split('').map(d => parseInt(d));

    useEffect(() => {
        const shuffled = [...correctDigits];
        for (let i = shuffled.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }
        setScrambledDigits(shuffled);
        setDigitsDragged({});
        setUserAnswer('');
        setShowFeedback(false);
        setIsCorrect(false);
        setShowSuccessMessage(false);
    }, [exercise]);

    useEffect(() => {
        if (pendingIncorrect && !showFeedback) {
            setShowFeedback(true);
            setIsCorrect(false);
        }
    }, [pendingIncorrect]);

    const handleDragStart = (e, digit) => {
        e.dataTransfer.setData('text/plain', digit);
        e.dataTransfer.effectAllowed = 'copy';
        e.target.style.opacity = '0.5';
    };

    const handleDragEnd = (e) => {
        e.target.style.opacity = '1';
    };

    const handleDragOver = (e) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'copy';
    };

    const handleDrop = (e, position) => {
        e.preventDefault();
        if (isCorrect) return;

        const digit = parseInt(e.dataTransfer.getData('text/plain'));

        const newDigits = { ...digitsDragged, [position]: digit };
        setDigitsDragged(newDigits);

        let answer = '';
        for (let i = 0; i < 7; i++) {
            answer += newDigits[i] !== undefined ? newDigits[i] : '_';
        }
        setUserAnswer(answer);
    };

    const handleRemoveDigit = (position) => {
        if (isCorrect) return;
        const newDigits = { ...digitsDragged };
        delete newDigits[position];
        setDigitsDragged(newDigits);

        let answer = '';
        for (let i = 0; i < 7; i++) {
            answer += newDigits[i] !== undefined ? newDigits[i] : '_';
        }
        setUserAnswer(answer);
    };

    const handleCheckAnswer = () => {
        if (userAnswer.includes('_')) {
            return;
        }

        const isAnswerCorrect = parseInt(userAnswer) === exercise.result;
        setShowFeedback(true);
        setIsCorrect(isAnswerCorrect);

        if (isAnswerCorrect) {
            setShowSuccessMessage(true);
            
            setTimeout(() => {
                if (pendingIncorrect) {
                    onRetryCorrect(exerciseIndex);
                } else {
                    onCorrect(exerciseIndex);
                }
            }, 2000);
        } else {
            onIncorrect(exerciseIndex);
        }
    };

    const handleResetExercise = () => {
        const shuffled = [...correctDigits];
        for (let i = shuffled.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }
        setScrambledDigits(shuffled);
        setDigitsDragged({});
        setUserAnswer('');
        setShowFeedback(false);
        setIsCorrect(false);
        setShowSuccessMessage(false);
    };

    return (
        <div className="expanded-container">
            <div className="bg-shapes">
                <div className="shape shape-1"></div>
                <div className="shape shape-2"></div>
                <div className="shape shape-3"></div>
            </div>

            <div className="expanded-content">
                <button onClick={onBack} className="back-btn">
                    <IconArrowLeft size={20} />
                    <span>Volver a ejercicios</span>
                </button>

                <div className="exercise-card-expanded">
                    <div className="exercise-header">
                        <div className="exercise-badge">
                            <span className="badge-number">{exerciseIndex + 1}</span>
                            <span className="badge-text">Ejercicio</span>
                        </div>
                        <button
                            className="hint-btn"
                            onClick={() => setShowHint(!showHint)}
                        >
                            <IconHelpCircle size={20} />
                        </button>
                    </div>

                    {showHint && (
                        <div className="hint-box">
                            <strong>💡 Pista:</strong> Arrastra cada número al lugar correcto.
                            Puedes hacer doble clic en un número para devolverlo.
                        </div>
                    )}

                    <div className="operation-large">
                        <div className="operation-numbers">
                            <div className="op-row">
                                <span className="op-number">{exercise.num1.toLocaleString()}</span>
                                <span className="op-sign">+</span>
                            </div>
                            <div className="op-row">
                                <span className="op-number">{exercise.num2.toLocaleString()}</span>
                                <span className="op-sign">+</span>
                            </div>
                            <div className="op-row">
                                <span className="op-number">{exercise.num3.toLocaleString()}</span>
                                <span className="op-sign">=</span>
                            </div>
                            <div className="op-line"></div>
                            <div className="op-slots">
                                {[0, 1, 2, 3, 4, 5, 6].map(pos => (
                                    <div
                                        key={pos}
                                        className={`digit-slot ${digitsDragged[pos] !== undefined ? 'filled' : 'empty'}`}
                                        onDragOver={handleDragOver}
                                        onDrop={(e) => handleDrop(e, pos)}
                                        onDoubleClick={() => handleRemoveDigit(pos)}
                                    >
                                        {digitsDragged[pos] !== undefined ? digitsDragged[pos] : '?'}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="drag-area">
                        <div className="drag-title">
                            <span> Arrastra los números a su posición</span>
                        </div>
                        <div className="drag-digits">
                            {scrambledDigits.map((digit, idx) => {
                                const isUsed = Object.values(digitsDragged).includes(digit);
                                return (
                                    <div
                                        key={idx}
                                        className={`drag-digit`}
                                        draggable={!isCorrect}
                                        onDragStart={(e) => handleDragStart(e, digit)}
                                        onDragEnd={handleDragEnd}
                                    >
                                        {digit}
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                        <div className="action-buttons">
                            <button onClick={handleResetExercise} className="reset-exercise-btn">
                                <IconRefresh size={18} />
                                <span>Reiniciar</span>
                            </button>
                            <button onClick={handleCheckAnswer} className="check-answer-btn">
                                <span>Verificar respuesta</span>
                                <IconArrowRight size={18} />
                            </button>
                        </div>

                    {showSuccessMessage && (
                        <div className="success-overlay">
                            <div className="success-animation">
                                <div className="success-circle">
                                    <IconCheck size={48} stroke={2} />
                                </div>
                                <h3>¡Excelente!</h3>
                                <p>Respuesta correcta</p>
                                <div className="loading-dots">
                                    <span></span>
                                    <span></span>
                                    <span></span>
                                </div>
                            </div>
                        </div>
                    )}

                    {showFeedback && !showSuccessMessage && (
                        <div className={`feedback-card ${isCorrect ? 'success' : 'error'}`}>
                            <div className="feedback-icon">
                                {isCorrect ? <IconCheck size={24} /> : <IconX size={24} />}
                            </div>
                            <div className="feedback-message">
                                {isCorrect ? (
                                    <>
                                        <strong>¡Correcto!</strong>
                                        <p>Muy bien, sigue así</p>
                                    </>
                                ) : (
                                    <>
                                        <strong>Respuesta incorrecta</strong>
                                        <p>El resultado correcto es {exercise.result.toLocaleString()}</p>
                                        <button onClick={handleResetExercise} className="retry-btn">
                                            Intentar nuevamente
                                        </button>
                                    </>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ExpandedExercise;