import { useState, useEffect, useRef } from 'react'
import { useNavigate, useParams } from 'react-router-dom'

function ExercisesPage() {
  const { chapterSlug } = useParams()
  const navigate = useNavigate()
  const [answers, setAnswers] = useState({})
  const [timeElapsed, setTimeElapsed] = useState(0)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [showResults, setShowResults] = useState(false)
  const intervalRef = useRef(null)

  const questions = [
    { id: 1, question: 'What is the head of a state government called?', options: ['President', 'Governor', 'Chief Minister', 'Mayor'], correct: 'c' },
    { id: 2, question: 'Who appoints the Governor of a state?', options: ['Chief Minister', 'President of India', 'Prime Minister', 'State Legislature'], correct: 'b' },
    { id: 3, question: 'Which body makes laws for the state?', options: ['Parliament', 'State Legislature', 'Supreme Court', 'Panchayat'], correct: 'b' },
    { id: 4, question: 'The state legislature can be unicameral or bicameral. What does bicameral mean?', options: ['One house', 'Two houses', 'Three houses', 'No house'], correct: 'b' },
    { id: 5, question: 'Who presides over the meetings of the Legislative Assembly?', options: ['Governor', 'Chief Minister', 'Speaker', 'President'], correct: 'c' },
    { id: 6, question: 'Which of the following is a function of the state government?', options: ['Defence', 'Foreign Affairs', 'Police', 'Currency'], correct: 'c' },
    { id: 7, question: 'Who is the constitutional head of the state?', options: ['Chief Minister', 'Governor', 'Speaker', 'President'], correct: 'b' },
    { id: 8, question: 'The Chief Minister is appointed by the:', options: ['Governor', 'President', 'Prime Minister', 'Speaker'], correct: 'a' },
    { id: 9, question: 'The term of the Legislative Assembly is:', options: ['3 years', '4 years', '5 years', '6 years'], correct: 'c' },
    { id: 10, question: 'Which of the following is NOT a state subject?', options: ['Agriculture', 'Education', 'Defence', 'Public Health'], correct: 'c' },
    { id: 11, question: 'Who can dissolve the Legislative Assembly?', options: ['Chief Minister', 'Governor', 'President', 'Speaker'], correct: 'b' },
    { id: 12, question: 'The council of ministers is headed by:', options: ['Governor', 'Chief Minister', 'Speaker', 'President'], correct: 'b' },
    { id: 13, question: 'Which article of the Indian Constitution deals with the Governor?', options: ['Article 153', 'Article 356', 'Article 370', 'Article 44'], correct: 'a' },
    { id: 14, question: 'The state government is responsible for:', options: ['Printing currency', 'Maintenance of law and order', 'Foreign policy', 'Defence'], correct: 'b' },
    { id: 15, question: 'Who is the leader of the opposition in the state assembly?', options: ['Chief Minister', 'Governor', 'Leader of the largest party not in government', 'Speaker'], correct: 'c' },
    { id: 16, question: 'Which of the following is a part of the state legislature?', options: ['Lok Sabha', 'Rajya Sabha', 'Vidhan Sabha', 'Panchayat'], correct: 'c' },
    { id: 17, question: 'The Governor can reserve a bill passed by the state legislature for the consideration of:', options: ['Chief Minister', 'President', 'Supreme Court', 'Parliament'], correct: 'b' },
    { id: 18, question: 'The Chief Minister and the council of ministers are responsible to:', options: ['Governor', 'President', 'State Legislature', 'Supreme Court'], correct: 'c' },
    { id: 19, question: 'Which of the following is a concurrent subject (both state and central government can legislate)?', options: ['Police', 'Education', 'Defence', 'Currency'], correct: 'b' },
    { id: 20, question: 'The Governor\'s term is:', options: ['3 years', '5 years', '6 years', '4 years'], correct: 'b' },
    { id: 21, question: 'Who can impose President\'s Rule in a state?', options: ['Governor', 'Chief Minister', 'President', 'Supreme Court'], correct: 'c' },
    { id: 22, question: 'The state budget is presented by:', options: ['Governor', 'Chief Minister', 'Finance Minister of the state', 'Speaker'], correct: 'c' },
    { id: 23, question: 'Which of the following is NOT a function of the Governor?', options: ['Summoning the state legislature', 'Appointing the Chief Minister', 'Passing laws', 'Giving assent to bills'], correct: 'c' },
    { id: 24, question: 'The state legislature can be dissolved by:', options: ['Chief Minister', 'Governor', 'President', 'Speaker'], correct: 'b' },
    { id: 25, question: 'The council of ministers is collectively responsible to:', options: ['Governor', 'President', 'State Legislature', 'Supreme Court'], correct: 'c' },
    { id: 26, question: 'Which of the following is a state subject?', options: ['Railways', 'Police', 'Defence', 'Banking'], correct: 'b' },
    { id: 27, question: 'The Chief Minister is usually the leader of:', options: ['The majority party in the state assembly', 'The opposition party', 'The Governor', 'The President'], correct: 'a' },
    { id: 28, question: 'The Governor can grant pardons in cases involving:', options: ['State laws', 'Central laws', 'International laws', 'None'], correct: 'a' },
    { id: 29, question: 'The state legislature meets in:', options: ['Parliament House', 'Vidhan Bhavan', 'Supreme Court', 'Raj Bhavan'], correct: 'b' },
    { id: 30, question: 'The Chief Minister\'s council of ministers is appointed by:', options: ['Governor', 'President', 'Chief Minister', 'Speaker'], correct: 'a' },
  ]

  useEffect(() => {
    intervalRef.current = setInterval(() => {
      setTimeElapsed((prev) => prev + 1)
    }, 1000)

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [])

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  const handleAnswerChange = (questionId, option) => {
    if (isSubmitted) return
    setAnswers((prev) => ({
      ...prev,
      [questionId]: option,
    }))
  }

  const handleSubmit = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
    }
    setIsSubmitted(true)
    setShowResults(true)
  }

  const calculateResults = () => {
    const total = questions.length
    const attempted = Object.keys(answers).length
    const correct = questions.filter(
      (q) => answers[q.id] === q.correct
    ).length
    const incorrect = attempted - correct
    const notAttempted = total - attempted
    const score = total > 0 ? Math.round((correct / total) * 100) : 0

    return {
      total,
      attempted,
      notAttempted,
      correct,
      incorrect,
      score,
    }
  }

  const results = showResults ? calculateResults() : null

  return (
    <div className="exercises-page">
      <div className="exercises-header">
        <button onClick={() => navigate(-1)} className="back-button">
          ← Back
        </button>
        <h1>Exercises: How the State Government Works</h1>
        <div className="timer-display">
          <span className="timer-icon">⏱️</span>
          <span className="timer-text">{formatTime(timeElapsed)}</span>
        </div>
      </div>

      {!showResults ? (
        <div className="exercises-content-wrapper">
          <div className="exercises-questions">
            {questions.map((q, index) => {
              const optionLabels = ['a', 'b', 'c', 'd']
              const selectedAnswer = answers[q.id]

              return (
                <div key={q.id} className="question-card">
                  <div className="question-header">
                    <span className="question-number">Question {index + 1}</span>
                    {selectedAnswer && (
                      <span className="answered-badge">Answered</span>
                    )}
                  </div>
                  <h3 className="question-text">{q.question}</h3>
                  <div className="options-list">
                    {q.options.map((option, optIndex) => {
                      const optionLabel = optionLabels[optIndex]
                      const isSelected = selectedAnswer === optionLabel

                      return (
                        <label
                          key={optIndex}
                          className={`option-item ${isSelected ? 'selected' : ''}`}
                        >
                          <input
                            type="radio"
                            name={`question-${q.id}`}
                            value={optionLabel}
                            checked={isSelected}
                            onChange={() => handleAnswerChange(q.id, optionLabel)}
                            disabled={isSubmitted}
                          />
                          <span className="option-label">{optionLabel})</span>
                          <span className="option-text">{option}</span>
                        </label>
                      )
                    })}
                  </div>
                </div>
              )
            })}
          </div>

          <div className="exercises-sidebar">
            <div className="progress-summary">
              <h3>Progress</h3>
              <div className="progress-stats">
                <div className="stat-item">
                  <span className="stat-label">Total Questions:</span>
                  <span className="stat-value">{questions.length}</span>
                </div>
                <div className="stat-item">
                  <span className="stat-label">Answered:</span>
                  <span className="stat-value">{Object.keys(answers).length}</span>
                </div>
                <div className="stat-item">
                  <span className="stat-label">Remaining:</span>
                  <span className="stat-value">
                    {questions.length - Object.keys(answers).length}
                  </span>
                </div>
              </div>
            </div>

            <button
              className="submit-button"
              onClick={handleSubmit}
              disabled={isSubmitted}
            >
              Submit Test
            </button>
          </div>
        </div>
      ) : (
        <div className="results-page">
          <div className="results-header">
            <h2>Test Results</h2>
            <p className="time-taken">Time Taken: {formatTime(timeElapsed)}</p>
          </div>

          <div className="results-content">
            <div className="score-section">
              <div className="score-circle">
                <div className="score-value">{results.score}%</div>
                <div className="score-label">Score</div>
              </div>
              <div className="score-details">
                <div className="score-item correct">
                  <span className="score-icon">✓</span>
                  <div>
                    <div className="score-number">{results.correct}</div>
                    <div className="score-text">Correct</div>
                  </div>
                </div>
                <div className="score-item incorrect">
                  <span className="score-icon">✗</span>
                  <div>
                    <div className="score-number">{results.incorrect}</div>
                    <div className="score-text">Incorrect</div>
                  </div>
                </div>
                <div className="score-item not-attempted">
                  <span className="score-icon">—</span>
                  <div>
                    <div className="score-number">{results.notAttempted}</div>
                    <div className="score-text">Not Attempted</div>
                  </div>
                </div>
              </div>
            </div>

            <div className="pie-chart-section">
              <h3>Performance Breakdown</h3>
              <div className="pie-chart-container">
                <svg width="300" height="300" viewBox="0 0 300 300" className="pie-chart">
                  <circle
                    cx="150"
                    cy="150"
                    r="120"
                    fill="none"
                    stroke="#2d3748"
                    strokeWidth="40"
                  />
                  {results.total > 0 && (
                    <>
                      <circle
                        cx="150"
                        cy="150"
                        r="120"
                        fill="none"
                        stroke="#4CAF50"
                        strokeWidth="40"
                        strokeDasharray={`${(results.correct / results.total) * 753.98} 753.98`}
                        strokeDashoffset="0"
                        transform="rotate(-90 150 150)"
                        className="pie-segment correct"
                      />
                      <circle
                        cx="150"
                        cy="150"
                        r="120"
                        fill="none"
                        stroke="#F44336"
                        strokeWidth="40"
                        strokeDasharray={`${(results.incorrect / results.total) * 753.98} 753.98`}
                        strokeDashoffset={`-${(results.correct / results.total) * 753.98}`}
                        transform="rotate(-90 150 150)"
                        className="pie-segment incorrect"
                      />
                      <circle
                        cx="150"
                        cy="150"
                        r="120"
                        fill="none"
                        stroke="#718096"
                        strokeWidth="40"
                        strokeDasharray={`${(results.notAttempted / results.total) * 753.98} 753.98`}
                        strokeDashoffset={`-${((results.correct + results.incorrect) / results.total) * 753.98}`}
                        transform="rotate(-90 150 150)"
                        className="pie-segment not-attempted"
                      />
                    </>
                  )}
                </svg>
                <div className="pie-legend">
                  <div className="legend-item">
                    <span className="legend-color correct"></span>
                    <span>Correct ({results.correct})</span>
                  </div>
                  <div className="legend-item">
                    <span className="legend-color incorrect"></span>
                    <span>Incorrect ({results.incorrect})</span>
                  </div>
                  <div className="legend-item">
                    <span className="legend-color not-attempted"></span>
                    <span>Not Attempted ({results.notAttempted})</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="detailed-results">
              <h3>Question Review</h3>
              <div className="questions-review">
                {questions.map((q, index) => {
                  const selectedAnswer = answers[q.id]
                  const isCorrect = selectedAnswer === q.correct
                  const optionLabels = ['a', 'b', 'c', 'd']

                  return (
                    <div
                      key={q.id}
                      className={`review-item ${isCorrect ? 'correct' : selectedAnswer ? 'incorrect' : 'not-attempted'}`}
                    >
                      <div className="review-header">
                        <span className="review-number">Q{index + 1}</span>
                        <span className="review-status">
                          {isCorrect ? '✓ Correct' : selectedAnswer ? '✗ Incorrect' : '— Not Attempted'}
                        </span>
                      </div>
                      <p className="review-question">{q.question}</p>
                      <div className="review-answers">
                        <div className="answer-item">
                          <strong>Your Answer:</strong>{' '}
                          {selectedAnswer
                            ? `${selectedAnswer.toUpperCase()}) ${q.options[optionLabels.indexOf(selectedAnswer)]}`
                            : 'Not answered'}
                        </div>
                        {(!isCorrect || !selectedAnswer) && (
                          <div className="answer-item correct-answer">
                            <strong>Correct Answer:</strong>{' '}
                            {q.correct.toUpperCase()}) {q.options[optionLabels.indexOf(q.correct)]}
                          </div>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default ExercisesPage

