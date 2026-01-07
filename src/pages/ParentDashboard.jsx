import { useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import './ParentDashboard.css'

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

// Generate topic mastery data
const generateTopicMastery = (topic) => {
  const mastery = Math.floor(Math.random() * 40) + 60 // 60-100%
  let status
  
  if (mastery >= 80) {
    status = 'On Track'
  } else if (mastery >= 65) {
    status = 'Need Review'
  } else {
    status = 'Need Practice'
  }
  
  return {
    mastery,
    status,
    insights: [
      mastery >= 80 ? 'Excellent understanding of this topic. Continue practicing to maintain mastery.' :
      mastery >= 65 ? 'Good progress. Focus on challenging areas to improve further.' :
      'Needs more attention. Consider additional practice and review sessions.',
      'Regular practice recommended to strengthen understanding.',
      mastery >= 75 ? 'Strong foundation - ready for advanced concepts.' :
      'Build foundational understanding before moving forward.'
    ]
  }
}

// Subject chapters and topics structure
const subjectData = {
  'Mathematics': {
    chapters: [
      {
        name: '3D Geometry',
        topics: ['Circles', 'Triangles', 'Rectangles', 'Polygons', '3D Shapes']
      },
      {
        name: 'Algebra',
        topics: ['Linear Equations', 'Quadratic Equations', 'Polynomials', 'Inequalities', 'Functions']
      },
      {
        name: 'Trigonometry',
        topics: ['Basic Ratios', 'Angles', 'Triangles', 'Unit Circle', 'Identities']
      },
      {
        name: 'Statistics',
        topics: ['Data Collection', 'Mean, Median, Mode', 'Graphs', 'Probability', 'Sampling']
      }
    ]
  },
  'Science': {
    chapters: [
      {
        name: 'Physics',
        topics: ['Force and Motion', 'Energy', 'Electricity', 'Magnetism', 'Waves']
      },
      {
        name: 'Chemistry',
        topics: ['Atoms and Molecules', 'Chemical Reactions', 'Acids and Bases', 'Periodic Table', 'States of Matter']
      },
      {
        name: 'Biology',
        topics: ['Cell Structure', 'Human Body', 'Ecosystems', 'Photosynthesis', 'Genetics']
      },
      {
        name: 'Earth Science',
        topics: ['Water Cycle', 'Rock Cycle', 'Weather', 'Climate', 'Solar System']
      }
    ]
  },
  'Social Studies': {
    chapters: [
      {
        name: 'How the State Government Works',
        topics: [
          'Levels of Government',
          'MLA Definition & Election',
          'Constituency Representation',
          'Majority Rule & Party Formation',
          'Ruling Party vs. Opposition',
          'Roles and Responsibilities',
          'The Legislature',
          'The Executive',
          'The Governor',
          'Coalition Governments',
          'Legislative Assembly Debate',
          'Government Accountability',
          'Press Conferences & Media Role',
          'Government Departments & Functions'
        ]
      },
      {
        name: 'History',
        topics: ['Ancient Civilizations', 'Medieval Period', 'Renaissance', 'World Wars', 'Independence']
      },
      {
        name: 'Geography',
        topics: ['Maps', 'Climate', 'Natural Resources', 'Population', 'Landforms']
      }
    ]
  },
  'English': {
    chapters: [
      {
        name: 'Grammar',
        topics: ['Parts of Speech', 'Tenses', 'Sentence Structure', 'Punctuation', 'Voice']
      },
      {
        name: 'Literature',
        topics: ['Poetry', 'Short Stories', 'Novels', 'Drama', 'Literary Devices']
      },
      {
        name: 'Writing',
        topics: ['Essay Writing', 'Creative Writing', 'Letter Writing', 'Report Writing', 'Story Writing']
      },
      {
        name: 'Comprehension',
        topics: ['Reading Skills', 'Vocabulary', 'Inference', 'Analysis', 'Summary']
      }
    ]
  }
}

function ParentDashboard() {
  const { signOut } = useAuth()
  const [selectedSubject, setSelectedSubject] = useState('Mathematics')
  const [selectedChapter, setSelectedChapter] = useState(null)

  const currentSubjectData = subjectData[selectedSubject]
  const selectedChapterData = selectedChapter 
    ? currentSubjectData.chapters.find(ch => ch.name === selectedChapter)
    : null

  // Calculate overall strengths and areas of improvement based on effort and learning behaviors
  const calculateEffortBasedAnalysis = () => {
    const subjects = ['Mathematics', 'Science', 'Social Studies', 'English']
    const subjectAnalyses = []
    
    // Analyze each subject's learning behaviors
    subjects.forEach((subject) => {
      const retentionRecall = generateRetentionRecallData(subject)
      const errorPatterns = generateErrorPatternsData(subject)
      const effortRating = generateEffortRatingData(subject)
      
      // Calculate effort score (average of all effort metrics)
      const avgEffort = (
        effortRating.effortRatingData.reduce((sum, d) => sum + d.A + d.B + d.C + d.D, 0) / 
        (effortRating.effortRatingData.length * 4)
      )
      
      // Calculate improvement trend (comparing latest vs earliest retention/recall)
      const retentionTrend = retentionRecall.timeSeriesData[retentionRecall.timeSeriesData.length - 1].retention - 
                            retentionRecall.timeSeriesData[0].retention
      const recallTrend = retentionRecall.timeSeriesData[retentionRecall.timeSeriesData.length - 1].recall - 
                         retentionRecall.timeSeriesData[0].recall
      const overallTrend = (retentionTrend + recallTrend) / 2
      
      // Calculate error reduction trend
      const latestErrors = errorPatterns.errorPatternsData[errorPatterns.errorPatternsData.length - 1]
      const earliestErrors = errorPatterns.errorPatternsData[0]
      const latestTotal = latestErrors.A + latestErrors.B + latestErrors.C + latestErrors.D
      const earliestTotal = earliestErrors.A + earliestErrors.B + earliestErrors.C + earliestErrors.D
      const errorReduction = earliestTotal - latestTotal
      
      // Calculate consistency score (variance in effort over time)
      const effortValues = effortRating.effortRatingData.map(d => (d.A + d.B + d.C + d.D) / 4)
      const avgEffortValue = effortValues.reduce((sum, val) => sum + val, 0) / effortValues.length
      const variance = effortValues.reduce((sum, val) => sum + Math.pow(val - avgEffortValue, 2), 0) / effortValues.length
      const consistencyScore = 100 - Math.min(100, variance * 2) // Lower variance = higher consistency
      
      subjectAnalyses.push({
        subject,
        avgEffort,
        overallTrend,
        errorReduction,
        consistencyScore,
        latestRetention: retentionRecall.latestRetention,
        latestRecall: retentionRecall.latestRecall,
        avgTimeSpent: effortRating.effortRatingData.reduce((sum, d) => sum + d.A, 0) / effortRating.effortRatingData.length,
        avgConsistency: effortRating.effortRatingData.reduce((sum, d) => sum + d.B, 0) / effortRating.effortRatingData.length,
        avgCompletion: effortRating.effortRatingData.reduce((sum, d) => sum + d.C, 0) / effortRating.effortRatingData.length,
        avgPersistence: effortRating.effortRatingData.reduce((sum, d) => sum + d.D, 0) / effortRating.effortRatingData.length
      })
    })
    
    // Identify strengths: High effort + positive trends + good consistency
    const strengths = subjectAnalyses
      .filter(subj => 
        subj.avgEffort >= 70 && 
        subj.overallTrend > 0 && 
        subj.consistencyScore >= 75
      )
      .sort((a, b) => (b.avgEffort + b.overallTrend + b.consistencyScore) - (a.avgEffort + a.overallTrend + a.consistencyScore))
      .slice(0, 3)
      .map(subj => ({
        subject: subj.subject,
        story: generateStrengthStory(subj),
        metrics: {
          effort: Math.round(subj.avgEffort),
          improvement: Math.round(subj.overallTrend),
          consistency: Math.round(subj.consistencyScore),
          errorReduction: subj.errorReduction
        }
      }))
    
    // Identify areas of improvement: Lower effort OR negative trends OR low consistency
    const improvements = subjectAnalyses
      .filter(subj => 
        subj.avgEffort < 70 || 
        subj.overallTrend < 0 || 
        subj.consistencyScore < 75
      )
      .sort((a, b) => (a.avgEffort + a.overallTrend + a.consistencyScore) - (b.avgEffort + b.overallTrend + b.consistencyScore))
      .slice(0, 3)
      .map(subj => ({
        subject: subj.subject,
        story: generateImprovementStory(subj),
        metrics: {
          effort: Math.round(subj.avgEffort),
          improvement: Math.round(subj.overallTrend),
          consistency: Math.round(subj.consistencyScore),
          errorReduction: subj.errorReduction
        },
        recommendations: generateRecommendations(subj)
      }))
    
    return { strengths, improvements }
  }

  // Generate narrative story for strengths
  const generateStrengthStory = (subj) => {
    const effortLevel = subj.avgEffort >= 80 ? 'exceptional' : subj.avgEffort >= 70 ? 'strong' : 'good'
    const trendDesc = subj.overallTrend >= 10 ? 'remarkable improvement' : 
                     subj.overallTrend >= 5 ? 'steady progress' : 
                     'positive growth'
    const consistencyDesc = subj.consistencyScore >= 85 ? 'highly consistent' : 'consistent'
    
    if (subj.errorReduction > 10) {
      return `Your child has shown ${effortLevel} dedication in ${subj.subject}, putting in consistent effort that's paying off beautifully. They've demonstrated ${trendDesc} in retention and recall, with a ${consistencyDesc} study routine. Most impressively, they've reduced errors by ${subj.errorReduction} over the past months, showing that their hard work is translating directly into better understanding. This is a testament to their persistence and commitment to improvement.`
    } else {
      return `In ${subj.subject}, your child's ${effortLevel} effort is clearly visible. They maintain a ${consistencyDesc} study schedule and show ${trendDesc} in their learning. Their commitment to regular practice and completion of tasks has created a strong foundation for continued success. The steady upward trend in their performance reflects their determination and hard work.`
    }
  }

  // Generate narrative story for areas of improvement
  const generateImprovementStory = (subj) => {
    if (subj.avgEffort < 65 && subj.overallTrend < 0) {
      return `While your child shows interest in ${subj.subject}, there's an opportunity to increase focused study time. Currently, their effort levels are below optimal, and this is reflected in declining retention rates. However, this is completely addressable - with a structured approach and consistent practice, we can turn this around. The key is building sustainable study habits that match their effort in other subjects.`
    } else if (subj.consistencyScore < 70) {
      return `In ${subj.subject}, your child's understanding is growing, but irregular study patterns are limiting their full potential. While they show good effort when they study, the inconsistency means knowledge isn't being reinforced regularly. Establishing a more consistent routine - even shorter daily sessions - would significantly boost their retention and recall.`
    } else if (subj.overallTrend < 0) {
      return `Your child is putting in effort in ${subj.subject}, but the learning isn't sticking as well as it could. This suggests we need to adjust their study approach - perhaps incorporating more active recall techniques or breaking down complex concepts differently. Their willingness to work hard is there; we just need to optimize how that effort is directed.`
    } else {
      return `In ${subj.subject}, there's room to elevate the effort to match your child's potential. While they're maintaining their current level, increasing focused study time and task completion could unlock significant improvements. With their demonstrated ability to learn, a small increase in structured effort could yield substantial results.`
    }
  }

  // Generate specific recommendations
  const generateRecommendations = (subj) => {
    const recommendations = []
    
    if (subj.avgTimeSpent < 70) {
      recommendations.push(`Increase dedicated study time for ${subj.subject} - aim for 30-45 minutes daily`)
    }
    if (subj.avgConsistency < 70) {
      recommendations.push(`Establish a regular study schedule - consistency is key to retention`)
    }
    if (subj.avgCompletion < 75) {
      recommendations.push(`Focus on completing assigned tasks - this builds confidence and reinforces learning`)
    }
    if (subj.avgPersistence < 65) {
      recommendations.push(`Encourage persistence when facing challenges - break problems into smaller steps`)
    }
    if (subj.overallTrend < 0) {
      recommendations.push(`Try spaced repetition techniques - review material multiple times over days`)
    }
    if (subj.errorReduction < 0) {
      recommendations.push(`Focus on understanding error patterns - identify common mistakes and practice avoiding them`)
    }
    
    return recommendations.length > 0 ? recommendations : [
      `Maintain current effort levels while focusing on active recall practice`,
      `Review challenging concepts weekly to strengthen retention`
    ]
  }

  const { strengths, improvements } = calculateEffortBasedAnalysis()

  const subjects = ['Mathematics', 'Science', 'Social Studies', 'English']
  const retentionRecallData = generateRetentionRecallData(selectedSubject)
  const errorPatternsData = generateErrorPatternsData(selectedSubject)
  const effortRatingData = generateEffortRatingData(selectedSubject)

  return (
    <div className="parent-dashboard">
      <div className="parent-header">
        <h1 className="parent-logo">LearnWyse</h1>
        <button className="signout-button" onClick={signOut}>
          Sign Out
        </button>
      </div>

      <div className="parent-content">
        <div className="parent-hero">
          <h2 className="parent-title">Overall Concept Mastery</h2>
          <p className="parent-subtitle">Track your child's progress across all subjects and chapters</p>
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

        <div className="concept-mastery-container">
          <div className="subject-selector-section">
            <label htmlFor="subject-select" className="subject-select-label">Select Subject:</label>
            <select
              id="subject-select"
              className="subject-select"
              value={selectedSubject}
              onChange={(e) => {
                setSelectedSubject(e.target.value)
                setSelectedChapter(null)
              }}
            >
              {Object.keys(subjectData).map((subject) => (
                <option key={subject} value={subject}>{subject}</option>
              ))}
            </select>
          </div>

          <div className="mastery-layout">
            <div className="chapters-panel">
              <h3 className="panel-title">Chapters</h3>
              <div className="chapters-list">
                {currentSubjectData.chapters.map((chapter, index) => (
                  <div
                    key={index}
                    className={`chapter-item ${selectedChapter === chapter.name ? 'active' : ''}`}
                    onClick={() => setSelectedChapter(chapter.name)}
                  >
                    <span className="chapter-name">{chapter.name}</span>
                    <span className="chapter-topics-count">{chapter.topics.length} topics</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="topics-panel">
              {selectedChapterData ? (
                <>
                  <div className="topics-header">
                    <h3 className="panel-title">{selectedChapterData.name}</h3>
                    <span className="topics-count">{selectedChapterData.topics.length} Topics</span>
                  </div>
                  <div className="topics-grid">
                    {selectedChapterData.topics.map((topic, index) => {
                      const topicData = generateTopicMastery(topic)
                      return (
                        <div key={index} className="topic-card">
                          <div className="topic-header">
                            <h4 className="topic-name">{topic}</h4>
                            <span className={`topic-status topic-status-${topicData.status.toLowerCase().replace(/\s+/g, '-')}`}>
                              {topicData.status}
                            </span>
                          </div>
                          
                          <div className="topic-mastery-chart">
                            <div className="topic-progress-container">
                              <div className="topic-progress-bar">
                                <div 
                                  className="topic-progress-fill"
                                  style={{ width: `${topicData.mastery}%` }}
                                ></div>
                              </div>
                              <span className="topic-mastery-percentage">{topicData.mastery}%</span>
                            </div>
                          </div>

                          <div className="topic-insights">
                            <h5 className="insights-title-small">Insights</h5>
                            <div className="insights-list-small">
                              {topicData.insights.slice(0, 2).map((insight, idx) => (
                                <div key={idx} className="insight-item-small">
                                  <span className="insight-icon-small">💡</span>
                                  <span className="insight-text-small">{insight}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </>
              ) : (
                <div className="no-selection-message">
                  <div className="no-selection-icon">📚</div>
                  <h3>Select a Chapter</h3>
                  <p>Choose a chapter from the left to view topic mastery details</p>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="strengths-improvements-section">
          <h3 className="section-main-title">Strengths & Areas of Improvement</h3>
          <p className="section-subtitle">Based on effort, consistency, and learning behaviors</p>
          
          <div className="strengths-improvements-grid">
            <div className="strengths-panel">
              <div className="panel-header strengths-header">
                <h4 className="panel-subtitle">💪 Strengths - Where Hard Work Pays Off</h4>
                <span className="panel-count">{strengths.length} {strengths.length === 1 ? 'subject' : 'subjects'}</span>
              </div>
              <div className="strengths-list">
                {strengths.length > 0 ? (
                  strengths.map((item, index) => (
                    <div key={index} className="strength-item">
                      <div className="strength-header">
                        <h5 className="strength-subject">{item.subject}</h5>
                        <div className="strength-metrics-badge">
                          <span className="metric-badge">Effort: {item.metrics.effort}%</span>
                          <span className="metric-badge">Trend: +{item.metrics.improvement}%</span>
                          <span className="metric-badge">Consistency: {item.metrics.consistency}%</span>
                        </div>
                      </div>
                      <p className="strength-story">{item.story}</p>
                      {item.metrics.errorReduction > 0 && (
                        <div className="strength-highlight">
                          <span className="highlight-icon">🎯</span>
                          <span className="highlight-text">Reduced errors by {item.metrics.errorReduction} over the past months</span>
                        </div>
                      )}
                    </div>
                  ))
                ) : (
                  <div className="no-data-message">
                    <p>Keep up the great work! Continue maintaining consistent effort across all subjects.</p>
                  </div>
                )}
              </div>
            </div>

            <div className="improvements-panel">
              <div className="panel-header improvements-header">
                <h4 className="panel-subtitle">📈 Areas of Improvement - Growth Opportunities</h4>
                <span className="panel-count">{improvements.length} {improvements.length === 1 ? 'subject' : 'subjects'}</span>
              </div>
              <div className="improvements-list">
                {improvements.length > 0 ? (
                  improvements.map((item, index) => (
                    <div key={index} className="improvement-item">
                      <div className="improvement-header">
                        <h5 className="improvement-subject">{item.subject}</h5>
                        <div className="improvement-metrics-badge">
                          <span className="metric-badge">Effort: {item.metrics.effort}%</span>
                          <span className="metric-badge">Trend: {item.metrics.improvement >= 0 ? '+' : ''}{item.metrics.improvement}%</span>
                          <span className="metric-badge">Consistency: {item.metrics.consistency}%</span>
                        </div>
                      </div>
                      <p className="improvement-story">{item.story}</p>
                      <div className="improvement-recommendations">
                        <h6 className="recommendations-title">💡 Recommendations:</h6>
                        <ul className="recommendations-list">
                          {item.recommendations.map((rec, recIndex) => (
                            <li key={recIndex} className="recommendation-item">{rec}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="no-data-message">
                    <p>Excellent work! All subjects show strong effort and positive trends.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ParentDashboard
