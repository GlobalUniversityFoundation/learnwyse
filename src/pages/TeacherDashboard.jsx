import { useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import StudyPlanComponent from '../components/StudyPlan'
import './TeacherDashboard.css'

// Generate Indian student names
const generateIndianNames = (count) => {
  const firstNames = [
    'Arjun', 'Priya', 'Rahul', 'Ananya', 'Vikram', 'Kavya', 'Aditya', 'Isha',
    'Rohan', 'Meera', 'Siddharth', 'Neha', 'Karan', 'Divya', 'Aryan', 'Sneha',
    'Raj', 'Pooja', 'Aman', 'Riya', 'Vivek', 'Shreya', 'Nikhil', 'Anjali',
    'Ravi', 'Kritika', 'Sahil', 'Tanvi', 'Varun', 'Aishwarya', 'Harsh', 'Nisha',
    'Yash', 'Sakshi', 'Akash', 'Pallavi', 'Ritvik', 'Aditi', 'Kunal', 'Swati'
  ]
  
  const lastNames = [
    'Sharma', 'Patel', 'Kumar', 'Singh', 'Gupta', 'Reddy', 'Rao', 'Mehta',
    'Verma', 'Jain', 'Shah', 'Malhotra', 'Agarwal', 'Nair', 'Iyer', 'Menon',
    'Desai', 'Joshi', 'Kapoor', 'Chopra', 'Bansal', 'Arora', 'Saxena', 'Tiwari'
  ]

  const names = []
  const usedNames = new Set()
  
  while (names.length < count) {
    const firstName = firstNames[Math.floor(Math.random() * firstNames.length)]
    const lastName = lastNames[Math.floor(Math.random() * lastNames.length)]
    const fullName = `${firstName} ${lastName}`
    
    if (!usedNames.has(fullName)) {
      usedNames.add(fullName)
      names.push({
        id: names.length + 1,
        name: fullName,
        rollNumber: names.length + 1
      })
    }
  }
  
  // Sort by roll number to ensure sequential order
  return names.sort((a, b) => a.rollNumber - b.rollNumber)
}

// Generate mastery data for a student
const generateMasteryData = (studentId) => {
  const subjects = ['Mathematics', 'Science', 'Social Studies', 'English']
  const statuses = ['On Track', 'Need Review', 'Need Practice']
  
  return subjects.map((subject) => {
    const percentage = Math.floor(Math.random() * 100)
    let status
    
    if (percentage >= 75) {
      status = 'On Track'
    } else if (percentage >= 50) {
      status = 'Need Review'
    } else {
      status = 'Need Practice'
    }
    
    return {
      subject,
      percentage,
      status
    }
  })
}

// Generate SVG path for curve
const generateCurvePath = (data, metric) => {
  const points = data.map((item, index) => {
    const x = (index / (data.length - 1)) * 100
    const y = 100 - item[metric]
    return `${x},${y}`
  })
  
  // Create smooth curve using quadratic bezier
  let path = `M ${points[0]}`
  for (let i = 0; i < points.length - 1; i++) {
    const [x1, y1] = points[i].split(',').map(Number)
    const [x2, y2] = points[i + 1].split(',').map(Number)
    const cpX = (x1 + x2) / 2
    const cpY = (y1 + y2) / 2
    path += ` Q ${x1},${y1} ${cpX},${cpY}`
  }
  const [xLast, yLast] = points[points.length - 1].split(',').map(Number)
  path += ` T ${xLast},${yLast}`
  
  return path
}

// Generate retention and recall data over time for a subject
const generateRetentionRecallData = (subject) => {
  const timePoints = ['Aug', 'Sep', 'Oct', 'Nov', 'Dec']
  
  // Generate time series data with some variation
  let retention = 60
  let recall = 55
  const timeSeriesData = timePoints.map((timePoint, index) => {
    // Add some trend and variation
    retention += Math.floor(Math.random() * 8) - 2 // Slight upward trend with variation
    recall += Math.floor(Math.random() * 8) - 2
    
    // Keep values in reasonable range
    retention = Math.max(40, Math.min(100, retention))
    recall = Math.max(40, Math.min(100, recall))
    
    return {
      time: timePoint,
      retention,
      recall
    }
  })
  
  const latestRetention = timeSeriesData[timeSeriesData.length - 1].retention
  const latestRecall = timeSeriesData[timeSeriesData.length - 1].recall
  
  return {
    timeSeriesData,
    latestRetention,
    latestRecall,
    insights: [
      latestRetention >= 80 ? 'Strong retention rate indicates good understanding of core concepts.' : 
      latestRetention >= 70 ? 'Moderate retention - consider spaced repetition techniques.' :
      'Low retention - focus on foundational concepts and review sessions.',
      latestRecall >= 80 ? 'Excellent recall ability shows strong memory consolidation.' :
      latestRecall >= 70 ? 'Good recall - continue practice exercises.' :
      'Recall needs improvement - implement active recall strategies.',
      latestRetention > latestRecall ? 'Retention exceeds recall - focus on retrieval practice.' :
      latestRecall > latestRetention ? 'Recall exceeds retention - strengthen concept understanding.' :
      'Balanced performance - maintain current learning approach.'
    ]
  }
}

// Generate effort rating data over time for a subject
const generateEffortRatingData = (subject) => {
  const timePoints = ['Aug', 'Sep', 'Oct', 'Nov', 'Dec']
  
  const effortRatingData = timePoints.map((timePoint) => {
    // Generate ratings for each metric (0-100 scale)
    return {
      time: timePoint,
      A: Math.floor(Math.random() * 30) + 60, // Time spent: 60-90
      B: Math.floor(Math.random() * 30) + 65, // Consistency: 65-95
      C: Math.floor(Math.random() * 30) + 70, // Completion: 70-100
      D: Math.floor(Math.random() * 30) + 55   // Persistence: 55-85
    }
  })
  
  const maxValue = 100
  
  // Calculate averages
  const avgTimeSpent = effortRatingData.reduce((sum, d) => sum + d.A, 0) / effortRatingData.length
  const avgConsistency = effortRatingData.reduce((sum, d) => sum + d.B, 0) / effortRatingData.length
  const avgCompletion = effortRatingData.reduce((sum, d) => sum + d.C, 0) / effortRatingData.length
  const avgPersistence = effortRatingData.reduce((sum, d) => sum + d.D, 0) / effortRatingData.length
  
  const insights = [
    avgTimeSpent >= 80 ? 'Excellent time investment - student is dedicating sufficient time to learning.' :
    avgTimeSpent >= 65 ? 'Good time spent - consider encouraging more focused study sessions.' :
    'Time spent needs improvement - recommend structured study schedule.',
    avgConsistency >= 80 ? 'Strong consistency - regular practice is paying off.' :
    avgConsistency >= 65 ? 'Moderate consistency - work on maintaining regular study habits.' :
    'Consistency is low - establish a daily routine.',
    avgCompletion >= 85 ? 'Outstanding task completion - excellent follow-through.' :
    avgCompletion >= 70 ? 'Good completion rate - continue current approach.' :
    'Completion rate needs attention - break tasks into smaller, manageable chunks.',
    avgPersistence >= 75 ? 'High persistence - student shows strong determination.' :
    avgPersistence >= 60 ? 'Moderate persistence - encourage continued effort.' :
    'Persistence needs strengthening - provide positive reinforcement and support.'
  ]
  
  return {
    effortRatingData,
    maxValue,
    insights
  }
}

// Generate error patterns data over time for a subject
const generateErrorPatternsData = (subject) => {
  const timePoints = ['Aug', 'Sep', 'Oct', 'Nov', 'Dec']
  
  const errorPatternsData = timePoints.map((timePoint) => {
    // Generate random error counts for each category (total errors per month)
    const totalErrors = Math.floor(Math.random() * 30) + 10 // 10-40 errors per month
    
    // Distribute errors across 4 categories
    const conceptual = Math.floor(totalErrors * (0.3 + Math.random() * 0.2)) // 30-50%
    const procedural = Math.floor(totalErrors * (0.2 + Math.random() * 0.2)) // 20-40%
    const carelessness = Math.floor(totalErrors * (0.1 + Math.random() * 0.2)) // 10-30%
    const vocabulary = totalErrors - conceptual - procedural - carelessness
    
    return {
      time: timePoint,
      A: Math.max(0, conceptual), // Conceptual understanding
      B: Math.max(0, procedural),  // Procedural errors
      C: Math.max(0, carelessness), // Carelessness
      D: Math.max(0, vocabulary)   // Vocabulary confusion
    }
  })
  
  // Calculate average errors per category
  const avgConceptual = errorPatternsData.reduce((sum, d) => sum + d.A, 0) / errorPatternsData.length
  const avgProcedural = errorPatternsData.reduce((sum, d) => sum + d.B, 0) / errorPatternsData.length
  const avgCarelessness = errorPatternsData.reduce((sum, d) => sum + d.C, 0) / errorPatternsData.length
  const avgVocabulary = errorPatternsData.reduce((sum, d) => sum + d.D, 0) / errorPatternsData.length
  
  const maxValue = Math.max(...errorPatternsData.map(d => d.A + d.B + d.C + d.D))
  
  const insights = [
    avgConceptual > avgProcedural && avgConceptual > avgCarelessness && avgConceptual > avgVocabulary
      ? 'Conceptual errors are the primary concern - focus on building foundational understanding.'
      : avgProcedural > avgConceptual && avgProcedural > avgCarelessness && avgProcedural > avgVocabulary
      ? 'Procedural errors dominate - emphasize step-by-step problem-solving strategies.'
      : avgCarelessness > avgConceptual && avgCarelessness > avgProcedural && avgCarelessness > avgVocabulary
      ? 'Carelessness is the main issue - encourage careful review and double-checking work.'
      : 'Vocabulary confusion is prominent - strengthen subject-specific terminology.',
    avgConceptual > 15 ? 'High conceptual errors suggest need for more visual aids and examples.' :
    avgConceptual < 5 ? 'Low conceptual errors indicate strong understanding of core concepts.' :
    'Conceptual errors are manageable - continue current teaching approach.',
    avgProcedural > 12 ? 'Procedural errors are significant - break down complex procedures into smaller steps.' :
    'Procedural errors are within acceptable range.',
    avgCarelessness > 10 ? 'Carelessness is a concern - implement error-checking routines.' :
    'Carelessness is minimal - good attention to detail.',
    avgVocabulary > 8 ? 'Vocabulary confusion needs attention - incorporate vocabulary building exercises.' :
    'Vocabulary understanding is solid.'
  ]
  
  return {
    errorPatternsData,
    maxValue,
    insights
  }
}

function TeacherDashboard() {
  const { signOut } = useAuth()
  const [selectedClass, setSelectedClass] = useState(null)
  const [selectedStudent, setSelectedStudent] = useState(null)
  const [showLearningBehaviors, setShowLearningBehaviors] = useState(false)
  const [showStudyPlan, setShowStudyPlan] = useState(false)
  const [selectedSubject, setSelectedSubject] = useState('Mathematics')

  const classes = [
    { id: 1, grade: 6, section: 'A', students: 32 },
    { id: 2, grade: 7, section: 'B', students: 28 },
    { id: 3, grade: 8, section: 'A', students: 30 },
    { id: 4, grade: 9, section: 'C', students: 29 },
    { id: 5, grade: 10, section: 'A', students: 31 }
  ]

  const handleViewClass = (classItem) => {
    const students = generateIndianNames(classItem.students)
    setSelectedClass({ ...classItem, students })
  }

  const handleBackToClasses = () => {
    setSelectedClass(null)
    setSelectedStudent(null)
  }

  const handleStudentClick = (student) => {
    const masteryData = generateMasteryData(student.id)
    setSelectedStudent({ ...student, masteryData })
  }

  const handleBackToStudents = () => {
    setSelectedStudent(null)
    setShowLearningBehaviors(false)
  }

  const handleViewLearningBehaviors = () => {
    setShowLearningBehaviors(true)
  }

  const handleBackToStudentDetail = () => {
    setShowLearningBehaviors(false)
    setShowStudyPlan(false)
  }

  const handleCreateStudyPlan = () => {
    setShowStudyPlan(true)
  }

  if (selectedStudent && showStudyPlan) {
    return (
      <div className="teacher-dashboard">
        <div className="teacher-header">
          <h1 className="teacher-logo">LearnWyse</h1>
          <button className="signout-button" onClick={signOut}>
            Sign Out
          </button>
        </div>

        <div className="teacher-content">
          <div className="student-view-header">
            <button className="back-button" onClick={() => setShowStudyPlan(false)}>
              ← Back to Student Detail
            </button>
            <div className="student-view-title">
              <h2 className="student-view-name">{selectedStudent.name}</h2>
              <p className="student-view-subtitle">Create Study Plan</p>
            </div>
          </div>

          <StudyPlanComponent 
            student={selectedStudent} 
            onBack={() => setShowStudyPlan(false)}
          />
        </div>
      </div>
    )
  }

  if (selectedStudent && showLearningBehaviors) {
    const subjects = ['Mathematics', 'Science', 'Social Studies', 'English']
    const retentionRecallData = generateRetentionRecallData(selectedSubject)
    const errorPatternsData = generateErrorPatternsData(selectedSubject)
    const effortRatingData = generateEffortRatingData(selectedSubject)

    return (
      <div className="teacher-dashboard">
        <div className="teacher-header">
          <h1 className="teacher-logo">LearnWyse</h1>
          <button className="signout-button" onClick={signOut}>
            Sign Out
          </button>
        </div>

        <div className="teacher-content">
          <div className="student-view-header">
            <button className="back-button" onClick={handleBackToStudentDetail}>
              ← Back to Student Detail
            </button>
            <div className="student-view-title">
              <h2 className="student-view-name">{selectedStudent.name}</h2>
              <p className="student-view-subtitle">Learning Behaviors</p>
            </div>
          </div>

          <div className="learning-behaviors-container">
            <div className="retention-recall-section">
              <h3 className="mastery-title">Retention and Recall</h3>
              
              <div className="subject-selector-bar">
                {subjects.map((subject) => (
                  <button
                    key={subject}
                    className={`subject-selector-button ${selectedSubject === subject ? 'active' : ''}`}
                    onClick={() => setSelectedSubject(subject)}
                  >
                    {subject}
                  </button>
                ))}
              </div>

              <div className="retention-recall-content">
                <div className="retention-recall-chart">
                  <div className="time-series-chart-container">
                    <div className="time-series-chart">
                      {/* Y-axis label */}
                      <div className="axis-label axis-label-y">Performance (%)</div>
                      
                      {/* X-axis label */}
                      <div className="axis-label axis-label-x">Time</div>
                      
                      {/* Chart area */}
                      <div className="time-series-chart-area">
                        {/* Grid lines */}
                        <div className="time-series-grid">
                          {[0, 20, 40, 60, 80, 100].map((value) => (
                            <div 
                              key={value}
                              className="grid-line grid-line-horizontal" 
                              style={{ bottom: `${value}%` }}
                            ></div>
                          ))}
                        </div>
                        
                        {/* Y-axis ticks */}
                        <div className="axis axis-y">
                          {[0, 20, 40, 60, 80, 100].map((value) => (
                            <div key={value} className="axis-tick" style={{ bottom: `${value}%` }}>
                              {value}
                            </div>
                          ))}
                        </div>
                        
                        {/* X-axis ticks */}
                        <div className="axis axis-x">
                          {retentionRecallData.timeSeriesData.map((data, index) => {
                            const totalPoints = retentionRecallData.timeSeriesData.length
                            // Map to 5% to 95% to avoid edges
                            const leftPercent = 5 + (index / (totalPoints - 1)) * 90
                            return (
                              <div 
                                key={index}
                                className="axis-tick axis-tick-time" 
                                style={{ left: `${leftPercent}%`, transform: 'translateX(-50%)' }}
                              >
                                {data.time}
                              </div>
                            )
                          })}
                        </div>
                        
                        {/* SVG for curves */}
                        <svg className="curve-svg" viewBox="0 0 100 100" preserveAspectRatio="none">
                          {/* Retention curve */}
                          <path
                            className="curve-line curve-retention"
                            d={generateCurvePath(retentionRecallData.timeSeriesData, 'retention')}
                            fill="none"
                            strokeWidth="0.5"
                          />
                          {/* Recall curve */}
                          <path
                            className="curve-line curve-recall"
                            d={generateCurvePath(retentionRecallData.timeSeriesData, 'recall')}
                            fill="none"
                            strokeWidth="0.5"
                          />
                          
                          {/* Data points for retention */}
                          {retentionRecallData.timeSeriesData.map((data, index) => {
                            const totalPoints = retentionRecallData.timeSeriesData.length
                            // Map to 5% to 95% to avoid edges
                            const x = 5 + (index / (totalPoints - 1)) * 90
                            const y = 100 - data.retention
                            return (
                              <circle
                                key={`retention-${index}`}
                                className="curve-point curve-point-retention"
                                cx={x}
                                cy={y}
                                r="1.5"
                              />
                            )
                          })}
                          
                          {/* Data points for recall */}
                          {retentionRecallData.timeSeriesData.map((data, index) => {
                            const totalPoints = retentionRecallData.timeSeriesData.length
                            // Map to 5% to 95% to avoid edges
                            const x = 5 + (index / (totalPoints - 1)) * 90
                            const y = 100 - data.recall
                            return (
                              <circle
                                key={`recall-${index}`}
                                className="curve-point curve-point-recall"
                                cx={x}
                                cy={y}
                                r="1.5"
                              />
                            )
                          })}
                        </svg>
                        
                        {/* Legend */}
                        <div className="chart-legend">
                          <div className="legend-item">
                            <div className="legend-color legend-retention"></div>
                            <span>Retention</span>
                          </div>
                          <div className="legend-item">
                            <div className="legend-color legend-recall"></div>
                            <span>Recall</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="insights-panel">
                  <h4 className="insights-title">Insights</h4>
                  <div className="insights-list">
                    {retentionRecallData.insights.map((insight, index) => (
                      <div key={index} className="insight-item">
                        <span className="insight-icon">💡</span>
                        <span className="insight-text">{insight}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="error-patterns-section">
                <h3 className="mastery-title">Error Patterns</h3>
                
                <div className="subject-selector-bar">
                  {subjects.map((subject) => (
                    <button
                      key={subject}
                      className={`subject-selector-button ${selectedSubject === subject ? 'active' : ''}`}
                      onClick={() => setSelectedSubject(subject)}
                    >
                      {subject}
                    </button>
                  ))}
                </div>
                
                <div className="error-patterns-content">
                  <div className="error-patterns-chart">
                    <div className="histogram-chart-container">
                      <div className="histogram-chart">
                        {/* Y-axis label */}
                        <div className="axis-label axis-label-y">Number of Errors</div>
                        
                        {/* X-axis label */}
                        <div className="axis-label axis-label-x">Time</div>
                        
                        {/* Chart area */}
                        <div className="histogram-chart-area">
                          {/* Grid lines */}
                          <div className="histogram-grid">
                            {[0, 10, 20, 30, 40, 50].map((value) => (
                              <div 
                                key={value}
                                className="grid-line grid-line-horizontal" 
                                style={{ bottom: `${(value / errorPatternsData.maxValue) * 100}%` }}
                              ></div>
                            ))}
                          </div>
                          
                          {/* Y-axis ticks */}
                          <div className="axis axis-y">
                            {[0, 10, 20, 30, 40, 50].filter(v => v <= errorPatternsData.maxValue).map((value) => (
                              <div key={value} className="axis-tick" style={{ bottom: `${(value / errorPatternsData.maxValue) * 100}%` }}>
                                {value}
                              </div>
                            ))}
                          </div>
                          
                          {/* X-axis ticks */}
                          <div className="axis axis-x">
                            {errorPatternsData.errorPatternsData.map((data, index) => {
                              const totalPoints = errorPatternsData.errorPatternsData.length
                              // Map to 10% to 90% to match bar positions
                              const leftPercent = 10 + (index / (totalPoints - 1)) * 80
                              return (
                                <div 
                                  key={index}
                                  className="axis-tick axis-tick-time" 
                                  style={{ left: `${leftPercent}%`, transform: 'translateX(-50%)' }}
                                >
                                  {data.time}
                                </div>
                              )
                            })}
                          </div>
                          
                          {/* Stacked bars */}
                          <div className="histogram-bars">
                            {errorPatternsData.errorPatternsData.map((data, index) => {
                              const total = data.A + data.B + data.C + data.D
                              const totalPoints = errorPatternsData.errorPatternsData.length
                              // Calculate position: 10% to 90% range, evenly spaced with gaps
                              const leftPercent = 10 + (index / (totalPoints - 1)) * 80
                              const barWidth = 12 // Fixed width in percentage
                              
                              return (
                                <div 
                                  key={index}
                                  className="histogram-bar-wrapper"
                                  style={{
                                    left: `${leftPercent}%`,
                                    width: `${barWidth}%`,
                                    transform: 'translateX(-50%)'
                                  }}
                                >
                                  <div className="histogram-bar" style={{ height: `${(total / errorPatternsData.maxValue) * 100}%` }}>
                                    <div 
                                      className="bar-segment bar-segment-A"
                                      style={{ height: `${total > 0 ? (data.A / total) * 100 : 0}%` }}
                                      title={`A: ${data.A}`}
                                    ></div>
                                    <div 
                                      className="bar-segment bar-segment-B"
                                      style={{ height: `${total > 0 ? (data.B / total) * 100 : 0}%` }}
                                      title={`B: ${data.B}`}
                                    ></div>
                                    <div 
                                      className="bar-segment bar-segment-C"
                                      style={{ height: `${total > 0 ? (data.C / total) * 100 : 0}%` }}
                                      title={`C: ${data.C}`}
                                    ></div>
                                    <div 
                                      className="bar-segment bar-segment-D"
                                      style={{ height: `${total > 0 ? (data.D / total) * 100 : 0}%` }}
                                      title={`D: ${data.D}`}
                                    ></div>
                                  </div>
                                </div>
                              )
                            })}
                          </div>
                          
                          {/* Legend */}
                          <div className="chart-legend error-legend">
                            <div className="legend-item">
                              <div className="legend-color legend-A"></div>
                              <span>A: Conceptual Understanding</span>
                            </div>
                            <div className="legend-item">
                              <div className="legend-color legend-B"></div>
                              <span>B: Procedural Errors</span>
                            </div>
                            <div className="legend-item">
                              <div className="legend-color legend-C"></div>
                              <span>C: Carelessness</span>
                            </div>
                            <div className="legend-item">
                              <div className="legend-color legend-D"></div>
                              <span>D: Vocabulary Confusion</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="insights-panel">
                    <h4 className="insights-title">Insights</h4>
                    <div className="insights-list">
                      {errorPatternsData.insights.map((insight, index) => (
                        <div key={index} className="insight-item">
                          <span className="insight-icon">💡</span>
                          <span className="insight-text">{insight}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              <div className="effort-rating-section">
                <h3 className="mastery-title">Effort Rating</h3>
                
                <div className="subject-selector-bar">
                  {subjects.map((subject) => (
                    <button
                      key={subject}
                      className={`subject-selector-button ${selectedSubject === subject ? 'active' : ''}`}
                      onClick={() => setSelectedSubject(subject)}
                    >
                      {subject}
                    </button>
                  ))}
                </div>
                
                <div className="effort-rating-content">
                  <div className="effort-rating-chart">
                    <div className="grouped-bar-chart-container">
                      <div className="grouped-bar-chart">
                        <div className="axis-label axis-label-y">Rating (%)</div>
                        <div className="axis-label axis-label-x">Time</div>
                        <div className="grouped-bar-chart-area">
                          <div className="grouped-bar-grid">
                            {[0, 20, 40, 60, 80, 100].map((value) => (
                              <div 
                                key={value}
                                className="grid-line grid-line-horizontal" 
                                style={{ bottom: `${value}%` }}
                              ></div>
                            ))}
                          </div>
                          <div className="axis axis-y">
                            {[0, 20, 40, 60, 80, 100].map((value) => (
                              <div key={value} className="axis-tick" style={{ bottom: `${value}%` }}>
                                {value}
                              </div>
                            ))}
                          </div>
                          <div className="axis axis-x">
                            {effortRatingData.effortRatingData.map((data, index) => {
                              const totalPoints = effortRatingData.effortRatingData.length
                              const leftPercent = 10 + (index / (totalPoints - 1)) * 80
                              return (
                                <div 
                                  key={index}
                                  className="axis-tick axis-tick-time" 
                                  style={{ left: `${leftPercent}%`, transform: 'translateX(-50%)' }}
                                >
                                  {data.time}
                                </div>
                              )
                            })}
                          </div>
                          <div className="grouped-bars">
                            {effortRatingData.effortRatingData.map((data, index) => {
                              const totalPoints = effortRatingData.effortRatingData.length
                              const groupLeftPercent = 10 + (index / (totalPoints - 1)) * 80
                              
                              return (
                                <div 
                                  key={index}
                                  className="bar-group"
                                  style={{
                                    left: `${groupLeftPercent}%`,
                                    transform: 'translateX(-50%)'
                                  }}
                                >
                                  <div 
                                    className="grouped-bar grouped-bar-A"
                                    style={{
                                      height: `${data.A}%`
                                    }}
                                    title={`Time Spent: ${data.A}%`}
                                  ></div>
                                  <div 
                                    className="grouped-bar grouped-bar-B"
                                    style={{
                                      height: `${data.B}%`
                                    }}
                                    title={`Consistency: ${data.B}%`}
                                  ></div>
                                  <div 
                                    className="grouped-bar grouped-bar-C"
                                    style={{
                                      height: `${data.C}%`
                                    }}
                                    title={`Completion: ${data.C}%`}
                                  ></div>
                                  <div 
                                    className="grouped-bar grouped-bar-D"
                                    style={{
                                      height: `${data.D}%`
                                    }}
                                    title={`Persistence: ${data.D}%`}
                                  ></div>
                                </div>
                              )
                            })}
                          </div>
                          <div className="chart-legend effort-legend">
                            <div className="legend-item">
                              <div className="legend-color legend-A"></div>
                              <span>A: Time Spent</span>
                            </div>
                            <div className="legend-item">
                              <div className="legend-color legend-B"></div>
                              <span>B: Consistency</span>
                            </div>
                            <div className="legend-item">
                              <div className="legend-color legend-C"></div>
                              <span>C: Completion</span>
                            </div>
                            <div className="legend-item">
                              <div className="legend-color legend-D"></div>
                              <span>D: Persistence</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="insights-panel">
                    <h4 className="insights-title">Insights</h4>
                    <div className="insights-list">
                      {effortRatingData.insights.map((insight, index) => (
                        <div key={index} className="insight-item">
                          <span className="insight-icon">💡</span>
                          <span className="insight-text">{insight}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (selectedStudent) {
    return (
      <div className="teacher-dashboard">
        <div className="teacher-header">
          <h1 className="teacher-logo">LearnWyse</h1>
          <button className="signout-button" onClick={signOut}>
            Sign Out
          </button>
        </div>

        <div className="teacher-content">
          <div className="student-view-header">
            <button className="back-button" onClick={handleBackToStudents}>
              ← Back to Students
            </button>
            <div className="student-view-title">
              <h2 className="student-view-name">{selectedStudent.name}</h2>
              <p className="student-view-subtitle">Roll Number: {selectedStudent.rollNumber}</p>
            </div>
          </div>

          <div className="mastery-chart-container">
            <div className="mastery-header">
              <h3 className="mastery-title">Concept Mastery</h3>
              <button className="create-study-plan-button" onClick={handleCreateStudyPlan}>
                Create Study Plan
              </button>
            </div>
            <div className="mastery-subjects">
              {selectedStudent.masteryData.map((item, index) => (
                <div key={index} className="mastery-card">
                  <div className="mastery-subject-header">
                    <span className="mastery-subject-name">{item.subject}</span>
                    <span className={`mastery-status mastery-status-${item.status.toLowerCase().replace(/\s+/g, '-')}`}>
                      {item.status}
                    </span>
                  </div>
                  <div className="mastery-progress-container">
                    <div className="mastery-progress-bar">
                      <div 
                        className="mastery-progress-fill"
                        style={{ width: `${item.percentage}%` }}
                      ></div>
                    </div>
                    <span className="mastery-percentage">{item.percentage}%</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="learning-behaviors-section">
            <button className="learning-behaviors-button" onClick={handleViewLearningBehaviors}>
              View Learning Behaviors →
            </button>
          </div>
        </div>
      </div>
    )
  }

  if (selectedClass) {
    return (
      <div className="teacher-dashboard">
        <div className="teacher-header">
          <h1 className="teacher-logo">LearnWyse</h1>
          <button className="signout-button" onClick={signOut}>
            Sign Out
          </button>
        </div>

        <div className="teacher-content">
          <div className="class-view-header">
            <button className="back-button" onClick={handleBackToClasses}>
              ← Back to Classes
            </button>
            <div className="class-view-title">
              <h2 className="class-view-grade">Grade {selectedClass.grade}, Section {selectedClass.section}</h2>
              <p className="class-view-subtitle">{selectedClass.students.length} Students</p>
            </div>
          </div>

          <div className="students-container">
            {selectedClass.students.map((student) => (
              <div 
                key={student.id} 
                className="student-card"
                onClick={() => handleStudentClick(student)}
                style={{ cursor: 'pointer' }}
              >
                <div className="student-roll">{student.rollNumber}</div>
                <div className="student-name">{student.name}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="teacher-dashboard">
      <div className="teacher-header">
        <h1 className="teacher-logo">LearnWyse</h1>
        <button className="signout-button" onClick={signOut}>
          Sign Out
        </button>
      </div>

      <div className="teacher-content">
        <div className="teacher-hero">
          <h2 className="teacher-title">My Classes</h2>
          <p className="teacher-subtitle">Manage your classes and track student progress</p>
        </div>

        <div className="classes-container">
          {classes.map((classItem) => (
            <div key={classItem.id} className="class-card">
              <div className="class-card-header">
                <div className="class-grade-section">
                  <span className="class-grade">Grade {classItem.grade}</span>
                  <span className="class-section">Section {classItem.section}</span>
                </div>
                <div className="class-icon">📚</div>
              </div>
              <div className="class-details">
                <div className="class-students">
                  <span className="class-label">Students:</span>
                  <span className="class-value">{classItem.students}</span>
                </div>
              </div>
              <button 
                className="class-button"
                onClick={() => handleViewClass(classItem)}
              >
                View Class
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default TeacherDashboard

