import { useState, useEffect, useRef, useMemo, useCallback } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { PorcupineWorker } from '@picovoice/porcupine-web'
import { WebVoiceProcessor } from '@picovoice/web-voice-processor'
import * as pdfjsLib from 'pdfjs-dist'
import mascotImage from '../../mascot.png'

// Configure PDF.js worker
if (typeof window !== 'undefined') {
  pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
    'pdfjs-dist/build/pdf.worker.min.js',
    import.meta.url
  ).toString()
}

const PORCUPINE_MODEL_PATH = '/porcupine_params.pv'
const PORCUPINE_KEYWORD_PATH = '/Hey-Mister-Wise_en_wasm_v3_0_0.ppn'

let cachedPorcupineAssets = {
  keywordBase64: null
}

async function fetchBinaryAsBase64(url) {
  const response = await fetch(url)
  if (!response.ok) {
    throw new Error(`Failed to fetch ${url}: ${response.status} ${response.statusText}`)
  }
  const buffer = await response.arrayBuffer()
  const bytes = new Uint8Array(buffer)
  let binary = ''
  for (let i = 0; i < bytes.byteLength; i += 1) {
    binary += String.fromCharCode(bytes[i])
  }
  return window.btoa(binary)
}

function VideoPlayer() {
  const navigate = useNavigate()
  const { chapterSlug } = useParams()
  const [isKeyConceptsOpen, setIsKeyConceptsOpen] = useState(false)
  const [isExercisesOpen, setIsExercisesOpen] = useState(false)
  const [showMiniPlayer, setShowMiniPlayer] = useState(false)
  const videoContainerRef = useRef(null)
  const videoRef = useRef(null)
  const miniVideoRef = useRef(null)
  const accessKey = import.meta.env.VITE_PICOVOICE_ACCESS_KEY
  const [isWakeActive, setIsWakeActive] = useState(false)
  const wakeGlowTimeoutRef = useRef(null)
  const porcupineInstanceRef = useRef(null)
  const assistantAudioRef = useRef(null)
  const isGeneratingRef = useRef(false)
  const [assistantResponse, setAssistantResponse] = useState('')
  const [isGeneratingResponse, setIsGeneratingResponse] = useState(false)
  const [assistantError, setAssistantError] = useState('')
  const [isListening, setIsListening] = useState(false)
  const [userTranscript, setUserTranscript] = useState('')
  const recognitionRef = useRef(null)
  const listeningTimeoutRef = useRef(null)
  const [pdfContent, setPdfContent] = useState('')

  const openAiKey =
    import.meta.env.VITE_OPENAI_API_KEY || import.meta.env.OPENAI_API_KEY || ''
  const elevenLabsKey =
    import.meta.env.VITE_ELEVENLABS_API_KEY || import.meta.env.ELEVENLABS_API_KEY || ''
  const elevenLabsVoiceId =
    import.meta.env.VITE_ELEVENLABS_VOICE_ID || import.meta.env.ELEVENLABS_VOICE_ID || ''

  // Conversation history management with localStorage
  const CONVERSATION_KEY = 'learnwyse_conversation_history'
  const MAX_HISTORY = 5

  const getConversationHistory = useCallback(() => {
    try {
      const stored = localStorage.getItem(CONVERSATION_KEY)
      return stored ? JSON.parse(stored) : []
    } catch (error) {
      console.error('Failed to load conversation history:', error)
      return []
    }
  }, [])

  const addToConversationHistory = useCallback((userMessage, assistantMessage) => {
    try {
      const history = getConversationHistory()
      history.push(
        { role: 'user', content: userMessage },
        { role: 'assistant', content: assistantMessage }
      )
      // Keep only last MAX_HISTORY messages (each exchange is 2 messages)
      const trimmedHistory = history.slice(-MAX_HISTORY * 2)
      localStorage.setItem(CONVERSATION_KEY, JSON.stringify(trimmedHistory))
    } catch (error) {
      console.error('Failed to save conversation history:', error)
    }
  }, [getConversationHistory])

  // Load PDF content on component mount
  useEffect(() => {
    const loadPdfContent = async () => {
      try {
        const pdfPath = '/state_governanace.pdf'
        const loadingTask = pdfjsLib.getDocument(pdfPath)
        const pdf = await loadingTask.promise
        let fullText = ''

        // Extract text from all pages
        for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
          const page = await pdf.getPage(pageNum)
          const textContent = await page.getTextContent()
          const pageText = textContent.items
            .map((item) => item.str)
            .join(' ')
          fullText += pageText + '\n\n'
        }

        setPdfContent(fullText.trim())
      } catch (error) {
        console.error('Failed to load PDF content:', error)
        // Continue without PDF content if loading fails
      }
    }

    if (chapterSlug === 'how-the-state-government-works') {
      loadPdfContent()
    }
  }, [chapterSlug])

  // Load case study script content
  const caseStudyContent = `CASE STUDY: DEVPUR WATER CRISIS

Devpur is a tranquil village in the Suryanagar constituency facing severe water scarcity. Villagers struggle with dropping water levels in wells, forcing them to walk extra miles to rivers with unclean water. Children are getting sick from contaminated water.

A farmer named Vikram has lost half his crop yield due to water scarcity. He complains that the government promised irrigation projects but nothing has happened. Villagers feel forgotten by politicians - the MLA from Suryanagar, Mr. Sharma, hasn't visited the village since winning the election.

This case study illustrates how state government works, the role of MLAs, government accountability, and how citizens can raise concerns about public issues.`

  const generateAssistantResponse = useCallback(async (userInput = '') => {
    if (!openAiKey || !elevenLabsKey || !elevenLabsVoiceId) {
      console.warn('OpenAI or ElevenLabs credentials missing; skipping assistant response.')
      return
    }
    if (isGeneratingRef.current) return

    if (!userInput.trim()) {
      setAssistantError('Please ask a question about the chapter.')
      return
    }

    try {
      isGeneratingRef.current = true
      setIsGeneratingResponse(true)
      setAssistantError('')

      // Get conversation history
      const history = getConversationHistory()

      // System prompt with context
      const systemPrompt = `You are Mister Wise, a friendly and encouraging AI tutor helping a 7th-grade student learn about "How the State Government Works" - a Social Studies chapter.

Your personality:
- Be funny, wise, conversational, and to the point
- Answer in 1-2 sentences maximum
- Always encourage the student and celebrate their learning
- Use simple language appropriate for a 7th grader
- Be enthusiastic and supportive

Your role:
- Answer ONLY questions related to this Social Studies chapter
- If asked about unrelated topics, politely redirect: "I'm here to help with the State Government chapter! What would you like to know about that?"
- Use the chapter content and case study to provide accurate answers

Chapter Context:
This chapter covers:
- Levels of Government (local, state, national)
- MLA (Member of Legislative Assembly) definition and election
- Constituency representation
- Majority rule and party formation
- Ruling party vs. Opposition
- Roles and responsibilities of MLAs, Chief Minister, and Ministers
- The three pillars: Legislature (makes laws), Executive (implements laws), Governor (constitutional oversight)
- Coalition governments
- Legislative Assembly debates
- Government accountability mechanisms
- Press conferences and media role
- Government departments and functions

Case Study Context:
${caseStudyContent}

${pdfContent ? `Chapter PDF Content:
${pdfContent.substring(0, 3000)}${pdfContent.length > 3000 ? '...' : ''}` : ''}

Remember: Keep responses short (1-2 sentences), be encouraging, and stay focused on the chapter content!`

      // Build messages array with system prompt, history, and current user input
      const messages = [
        { role: 'system', content: systemPrompt },
        ...history,
        { role: 'user', content: userInput }
      ]

      const openAiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${openAiKey}`
        },
        body: JSON.stringify({
          model: 'gpt-3.5-turbo',
          messages: messages,
          temperature: 0.8,
          max_tokens: 150
        })
      })

      if (!openAiResponse.ok) {
        const errorText = await openAiResponse.text()
        throw new Error(`OpenAI error: ${openAiResponse.status} ${errorText}`)
      }

      const completion = await openAiResponse.json()
      const assistantText =
        completion?.choices?.[0]?.message?.content?.trim() ||
        'I\'m here to help you understand how state government works! What would you like to know?'

      setAssistantResponse(assistantText)
      
      // Save to conversation history
      addToConversationHistory(userInput, assistantText)

      // Add SSML tags for cheerful/happy tone
      const ttsText = `[cheerily]${assistantText}`

      const ttsResponse = await fetch(
        `https://api.elevenlabs.io/v1/text-to-speech/${encodeURIComponent(elevenLabsVoiceId)}`,
        {
          method: 'POST',
          headers: {
            Accept: 'audio/mpeg',
            'Content-Type': 'application/json',
            'xi-api-key': elevenLabsKey
          },
          body: JSON.stringify({
            text: ttsText,
            model_id: 'eleven_v3',
            voice_settings: {
              stability: 0.5,
              similarity_boost: 0.8
            }
          })
        }
      )

      if (!ttsResponse.ok) {
        const errorText = await ttsResponse.text()
        throw new Error(`ElevenLabs error: ${ttsResponse.status} ${errorText}`)
      }

      const audioBlob = await ttsResponse.blob()
      if (assistantAudioRef.current) {
        assistantAudioRef.current.pause()
        URL.revokeObjectURL(assistantAudioRef.current.src)
      }
      const audioUrl = URL.createObjectURL(audioBlob)
      const audio = new Audio(audioUrl)
      assistantAudioRef.current = audio
      audio.play().catch(() => {})
    } catch (error) {
      console.error(error)
      setAssistantError(error.message || 'Unable to generate assistant response.')
    } finally {
      setIsGeneratingResponse(false)
      isGeneratingRef.current = false
    }
  }, [openAiKey, elevenLabsKey, elevenLabsVoiceId, getConversationHistory, addToConversationHistory, pdfContent, caseStudyContent])

  // Initialize Speech Recognition
  useEffect(() => {
    if (typeof window === 'undefined') return

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
    if (!SpeechRecognition) {
      console.warn('Speech Recognition API not supported in this browser')
      return
    }

    const recognition = new SpeechRecognition()
    recognition.continuous = false
    recognition.interimResults = false
    recognition.lang = 'en-US'
    recognition.maxAlternatives = 1

    recognition.onstart = () => {
      setIsListening(true)
      setUserTranscript('')
      setAssistantError('')
    }

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript
      setUserTranscript(transcript)
      setIsListening(false)
      
      // Generate response with the transcribed text immediately
      if (transcript.trim()) {
        // Use a ref to avoid stale closure
        const currentGenerateResponse = generateAssistantResponse
        currentGenerateResponse(transcript)
      }
    }

    recognition.onerror = (event) => {
      console.error('Speech recognition error:', event.error)
      setIsListening(false)
      
      if (event.error === 'no-speech') {
        setAssistantError('No speech detected. Please try again.')
      } else if (event.error === 'not-allowed') {
        setAssistantError('Microphone permission denied. Please enable microphone access.')
      } else {
        setAssistantError(`Speech recognition error: ${event.error}`)
      }
    }

    recognition.onend = () => {
      setIsListening(false)
      if (listeningTimeoutRef.current) {
        clearTimeout(listeningTimeoutRef.current)
        listeningTimeoutRef.current = null
      }
    }

    recognitionRef.current = recognition

    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop()
        } catch (e) {
          // Ignore errors when stopping
        }
      }
      if (listeningTimeoutRef.current) {
        clearTimeout(listeningTimeoutRef.current)
      }
    }
  }, [generateAssistantResponse])

  const startListening = useCallback(() => {
    if (!recognitionRef.current) {
      setAssistantError('Speech recognition not available. Please use a supported browser.')
      return
    }

    try {
      recognitionRef.current.start()
      
      // Auto-stop after 5 seconds of no speech
      if (listeningTimeoutRef.current) {
        clearTimeout(listeningTimeoutRef.current)
      }
      listeningTimeoutRef.current = setTimeout(() => {
        if (recognitionRef.current && isListening) {
          try {
            recognitionRef.current.stop()
          } catch (e) {
            // Ignore errors
          }
        }
      }, 5000)
    } catch (error) {
      console.error('Failed to start speech recognition:', error)
      setAssistantError('Failed to start listening. Please try again.')
    }
  }, [isListening])

  useEffect(() => {
    const handleScroll = () => {
      if (videoContainerRef.current) {
        const rect = videoContainerRef.current.getBoundingClientRect()
        const videoWrapper = videoContainerRef.current.querySelector('.video-wrapper')
        if (videoWrapper) {
          const wrapperRect = videoWrapper.getBoundingClientRect()
          // Show mini player when video wrapper is scrolled out of view
          setShowMiniPlayer(wrapperRect.bottom < 100)
        }
      }
    }

    const scrollContainer = document.querySelector('.video-content-area')
    if (scrollContainer) {
      scrollContainer.addEventListener('scroll', handleScroll)
      // Also check on initial load
      handleScroll()
      return () => scrollContainer.removeEventListener('scroll', handleScroll)
    }
  }, [])

  // Initialize wake word listener for the custom "Hey Mister Wise" keyword
  useEffect(() => {
    let isCancelled = false

    const initializeWakeWord = async () => {
      if (!accessKey) {
        console.warn(
          'Picovoice AccessKey missing. Set VITE_PICOVOICE_ACCESS_KEY in your environment to enable wake word detection.'
        )
        return
      }

      try {
        if (!cachedPorcupineAssets.keywordBase64) {
          cachedPorcupineAssets.keywordBase64 = await fetchBinaryAsBase64(PORCUPINE_KEYWORD_PATH)
        }

        const detectionCallback = (detection) => {
          if (isCancelled) return
          if (detection?.isUnderstood === false) return
          setIsWakeActive(true)
          if (wakeGlowTimeoutRef.current) {
            clearTimeout(wakeGlowTimeoutRef.current)
          }
          wakeGlowTimeoutRef.current = setTimeout(() => {
            setIsWakeActive(false)
          }, 2000)
          // Start listening for user input after wake word
          startListening()
        }

        const porcupineWorker = await PorcupineWorker.create(
          accessKey,
          {
            base64: cachedPorcupineAssets.keywordBase64,
            label: 'Hey Mister Wise',
            sensitivity: 0.65
          },
          detectionCallback,
          {
            publicPath: PORCUPINE_MODEL_PATH,
            customWritePath: 'learnwyse_porcupine_model',
            version: 3
          },
          {
            processErrorCallback: (error) => {
              console.error('Wake word processing error', error)
            }
          }
        )

        porcupineInstanceRef.current = porcupineWorker
        await WebVoiceProcessor.subscribe(porcupineWorker)
      } catch (error) {
        console.error('Failed to initialize wake word detection', error)
      }
    }

    if (chapterSlug === 'how-the-state-government-works' && typeof window !== 'undefined') {
      initializeWakeWord()
    }

    return () => {
      isCancelled = true
      if (wakeGlowTimeoutRef.current) {
        clearTimeout(wakeGlowTimeoutRef.current)
        wakeGlowTimeoutRef.current = null
      }
      const porcupineWorker = porcupineInstanceRef.current
      if (porcupineWorker) {
        WebVoiceProcessor.unsubscribe(porcupineWorker).catch(() => {})
        porcupineWorker.postMessage?.({ command: 'release' })
        porcupineWorker.terminate?.()
        porcupineInstanceRef.current = null
      }
      setIsWakeActive(false)
      if (assistantAudioRef.current) {
        assistantAudioRef.current.pause()
        URL.revokeObjectURL(assistantAudioRef.current.src)
        assistantAudioRef.current = null
      }
    }
  }, [accessKey, chapterSlug, startListening])

  // Sync mini player with main video
  useEffect(() => {
    const mainVideo = videoRef.current
    const miniVideo = miniVideoRef.current

    if (mainVideo && miniVideo && showMiniPlayer) {
      // Sync from main video to mini player
      const handleMainPlay = () => miniVideo.play().catch(() => {})
      const handleMainPause = () => miniVideo.pause()
      const handleMainTimeUpdate = () => {
        if (Math.abs(miniVideo.currentTime - mainVideo.currentTime) > 0.5) {
          miniVideo.currentTime = mainVideo.currentTime
        }
      }

      // Sync from mini player to main video
      const handleMiniPlay = () => mainVideo.play().catch(() => {})
      const handleMiniPause = () => mainVideo.pause()
      const handleMiniTimeUpdate = () => {
        if (Math.abs(mainVideo.currentTime - miniVideo.currentTime) > 0.5) {
          mainVideo.currentTime = miniVideo.currentTime
        }
      }

      mainVideo.addEventListener('play', handleMainPlay)
      mainVideo.addEventListener('pause', handleMainPause)
      mainVideo.addEventListener('timeupdate', handleMainTimeUpdate)
      
      miniVideo.addEventListener('play', handleMiniPlay)
      miniVideo.addEventListener('pause', handleMiniPause)
      miniVideo.addEventListener('timeupdate', handleMiniTimeUpdate)

      return () => {
        mainVideo.removeEventListener('play', handleMainPlay)
        mainVideo.removeEventListener('pause', handleMainPause)
        mainVideo.removeEventListener('timeupdate', handleMainTimeUpdate)
        miniVideo.removeEventListener('play', handleMiniPlay)
        miniVideo.removeEventListener('pause', handleMiniPause)
        miniVideo.removeEventListener('timeupdate', handleMiniTimeUpdate)
      }
    }
  }, [showMiniPlayer])

  const handleMiniPlayerClick = () => {
    if (videoContainerRef.current) {
      videoContainerRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const handleConceptClick = (timestamp) => {
    if (videoRef.current) {
      videoRef.current.currentTime = timestamp
      videoRef.current.play().catch(() => {})
    }
    if (miniVideoRef.current) {
      miniVideoRef.current.currentTime = timestamp
      miniVideoRef.current.play().catch(() => {})
    }
  }

  // Key concepts with random timestamps (0-87 seconds)
  const keyConcepts = [
    { title: 'Levels of Government', description: 'Government operates at local, state, and national levels, each with distinct responsibilities and functions. Understanding these levels is crucial for comprehending governance structures.', timestamp: 5, time: '0:05' },
    { title: 'MLA Definition & Election', description: 'Members of the Legislative Assembly (MLAs) are elected representatives of specific constituencies. They represent the people of their constituency in the state legislature.', timestamp: 12, time: '0:12' },
    { title: 'Constituency Representation', description: 'Each state is divided into constituencies, with each constituency electing one MLA. This ensures geographical representation in the legislative assembly.', timestamp: 18, time: '0:18' },
    { title: 'Majority Rule & Party Formation', description: 'The political party with more than half the MLAs forms the ruling party. This majority enables them to form the government and implement their policies.', timestamp: 25, time: '0:25' },
    { title: 'Ruling Party vs. Opposition', description: 'The ruling party governs, while the opposition questions and scrutinizes government actions. This dynamic ensures accountability and diverse perspectives.', timestamp: 32, time: '0:32' },
    { title: 'Roles and Responsibilities', description: 'MLAs of the ruling party elect their leader, who then becomes the Chief Minister. The Chief Minister heads the state government and selects or appoints other ministers.', timestamp: 39, time: '0:39' },
    { title: 'The Legislature', description: 'MLAs who debate and make laws for various state affairs.', timestamp: 45, time: '0:45' },
    { title: 'The Executive', description: 'Ministers run different departments who implement these laws and policies.', timestamp: 52, time: '0:52' },
    { title: 'The Governor', description: 'Appointed by the Central Government, ensures the State Government adheres to the Constitution. This maintains constitutional integrity and oversight.', timestamp: 58, time: '0:58' },
    { title: 'Coalition Governments', description: 'When no single party has a majority, multiple parties can form a coalition government. This requires compromise and collaboration among different political ideologies.', timestamp: 64, time: '1:04' },
    { title: 'Legislative Assembly Debate', description: 'The Legislative Assembly is where MLAs debate issues, ask questions, and offer suggestions. This is a forum for discussion and decision-making on state matters.', timestamp: 70, time: '1:10' },
    { title: 'Government Accountability', description: 'The government (Ministers, MLAs etc.) is accountable to the public and the Legislative Assembly is one of the formal mechanisms through which that accountability is exercised. They also answer questions, do press conferences, and address public concerns.', timestamp: 76, time: '1:16' },
    { title: 'Press Conferences & Media Role', description: 'Press conferences are used to communicate government actions and respond to public inquiries. The media plays a crucial role in informing the public and holding the government accountable.', timestamp: 81, time: '1:21' },
    { title: 'Government Departments & Functions', description: 'Various government departments (e.g., Public Works, Health, Education) perform specific functions. These departments are crucial for delivering services and implementing policies.', timestamp: 85, time: '1:25' }
  ]

  const statusOptions = [
    { key: 'done', label: 'Done' },
    { key: 'review', label: 'Mark for review' },
    { key: 'incomplete', label: 'Incomplete' },
  ]

  const [conceptStatuses, setConceptStatuses] = useState(() => {
    const initialStatuses = {}
    keyConcepts.forEach((concept) => {
      initialStatuses[concept.title] = 'incomplete'
    })
    return initialStatuses
  })

  const completedCount = keyConcepts.filter(
    (concept) => conceptStatuses[concept.title] === 'done',
  ).length
  const progressPercent =
    keyConcepts.length > 0
      ? Math.round((completedCount / keyConcepts.length) * 100)
      : 0

  const handleConceptStatusChange = (title, status) => {
    setConceptStatuses((prev) => ({
      ...prev,
      [title]: status,
    }))
  }

  const chapters = {
    history: {
      title: 'History: Our Pasts-II',
      items: [
        'Chapter 1: Tracing Changes Through a Thousand Years',
        'Chapter 2: New Kings and Kingdoms',
        'Chapter 3: The Delhi Sultans',
        'Chapter 4: The Mughal Empire',
        'Chapter 5: Rulers and Buildings',
        'Chapter 6: Towns, Traders, and Craftspersons',
        'Chapter 7: Tribes, Nomads, and the Settled Communities',
        'Chapter 8: Devotional Paths to the Divine',
        'Chapter 9: The Making of Regional Cultures',
        'Chapter 10: Eighteenth-Century Political Formations'
      ]
    },
    civics: {
      title: 'Civics: Social and Political Life-II',
      items: [
        'Chapter 1: On Equality',
        'Chapter 2: Role of the Government in Health',
        'Chapter 3: How the State Government Works',
        'Chapter 4: Growing Up As Boys And Girls',
        'Chapter 5: Women, Changed the World',
        'Chapter 6: Media and Advertisement',
        'Chapter 7: In the Markets Around Us',
        'Chapter 8: A Shirt in the Market'
      ]
    },
    geography: {
      title: 'Geography: Our Environment',
      items: [
        'Chapter 1: Environment',
        'Chapter 2: Inside Our Earth',
        'Chapter 3: Our Changing Earth',
        'Chapter 4: Air',
        'Chapter 5: Water',
        'Chapter 6: Natural Vegetation and Wildlife',
        'Chapter 7: Human Environment - Settlement, Transport and Communication'
      ]
    }
  }

  // Generate random progress for all chapters (consistent across renders)
  const chapterProgress = useMemo(() => {
    const progress = {}
    Object.values(chapters).forEach((section) => {
      section.items.forEach((chapter) => {
        if (chapter !== 'Chapter 3: How the State Government Works') {
          // Generate random progress between 20% and 95%
          progress[chapter] = Math.floor(Math.random() * 76) + 20
        }
      })
    })
    return progress
  }, [])

  const getCurrentChapterTitle = () => {
    if (chapterSlug === 'how-the-state-government-works') {
      return 'Chapter 3: How the State Government Works'
    }
    return 'Chapter'
  }

  const handleChapterClick = (chapterName) => {
    if (chapterName === 'Chapter 3: How the State Government Works') {
      navigate('/study/social-science/video/how-the-state-government-works')
    } else {
      navigate('/study/social-science')
    }
  }

  return (
    <div className="video-player-page">
      <div className="video-player-header">
        <h1 className="video-player-logo" onClick={() => navigate('/study')}>
          LearnWyse
        </h1>
        <h2 className="video-player-title">Social Science</h2>
      </div>

      <div className="video-player-content">
        <div className="chapters-sidebar">
          {Object.entries(chapters).map(([key, section]) => (
            <div key={key} className="chapter-section">
              <h3 className="section-title">{section.title}</h3>
              <ul className="chapter-list">
                {section.items.map((chapter, index) => {
                  const isActive = chapter === getCurrentChapterTitle()
                  const isStateGovernmentChapter = chapter === 'Chapter 3: How the State Government Works'
                  // Use dynamic progress for "How the State Government Works", random for others
                  const chapterProgressValue = isStateGovernmentChapter 
                    ? progressPercent 
                    : chapterProgress[chapter] || 0
                  
                  return (
                    <li
                      key={index}
                      className={`chapter-item ${isActive ? 'active' : ''}`}
                      onClick={() => handleChapterClick(chapter)}
                    >
                      <span className="chapter-item-text">{chapter}</span>
                      <div className="chapter-progress-container">
                        <div className="chapter-progress-bar">
                          <div
                            className="chapter-progress-fill"
                            style={{ width: `${chapterProgressValue}%` }}
                          ></div>
                        </div>
                        <span className="chapter-progress-text">
                          {chapterProgressValue}%
                        </span>
                      </div>
                    </li>
                  )
                })}
              </ul>
            </div>
          ))}
        </div>

        <div className="video-content-area">
          {showMiniPlayer && (
            <div className="mini-player" onClick={handleMiniPlayerClick}>
              <div className="mini-player-wrapper">
                <video
                  ref={miniVideoRef}
                  className="mini-video"
                  controls
                  controlsList="nodownload"
                  preload="metadata"
                  crossOrigin="anonymous"
                  onClick={(e) => e.stopPropagation()}
                >
                  <source src="/how-the-state-government-works.mp4" type="video/mp4" />
                  Your browser does not support the video tag.
                </video>
              </div>
            </div>
          )}
          <div className={`mascot-container ${isWakeActive ? 'wake-active' : ''}`}>
            <img src={mascotImage} alt="Mascot" className="mascot-image" />
          </div>
          <div className="video-container" ref={videoContainerRef}>
            <div className="video-wrapper">
              <video
                ref={videoRef}
                className="lesson-video"
                controls
                controlsList="nodownload"
                preload="metadata"
                crossOrigin="anonymous"
              >
                <source src="/how-the-state-government-works.mp4" type="video/mp4" />
                Your browser does not support the video tag.
              </video>
            </div>
            <div className="video-info">
              <h3 className="video-title">{getCurrentChapterTitle()}</h3>
            </div>

            {chapterSlug === 'how-the-state-government-works' && (
              <>
                <div className="key-concepts-section">
                  <button
                    className="key-concepts-toggle"
                    onClick={() => setIsKeyConceptsOpen(!isKeyConceptsOpen)}
                  >
                    <span>Key Concepts</span>
                    <span className={`toggle-icon ${isKeyConceptsOpen ? 'open' : ''}`}>▼</span>
                  </button>
                  {isKeyConceptsOpen && (
                    <div className="key-concepts-content">
                      <ul className="key-concepts-list">
                        {keyConcepts.map((concept, index) => {
                          const currentStatus = conceptStatuses[concept.title]
                          return (
                            <li key={index} className="key-concept-item">
                              <div className="concept-header">
                                <strong>{concept.title}:</strong>
                                <span className="concept-timestamp">
                                  {formatTime(concept.timestamp)}
                                </span>
                                <button
                                  className="concept-eye-button"
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    handleConceptClick(concept.timestamp)
                                  }}
                                  title="Jump to this timestamp"
                                >
                                  👁️
                                </button>
                              </div>
                              <p className="concept-description">{concept.description}</p>
                              <div className="concept-status-controls">
                                {statusOptions.map((option) => (
                                  <button
                                    key={option.key}
                                    className={`concept-status-button status-${option.key} ${
                                      currentStatus === option.key ? 'active' : ''
                                    }`}
                                    onClick={(e) => {
                                      e.stopPropagation()
                                      handleConceptStatusChange(concept.title, option.key)
                                    }}
                                  >
                                    {option.label}
                                  </button>
                                ))}
                              </div>
                            </li>
                          )
                        })}
                      </ul>
                    </div>
                  )}
                </div>
                <div className="exercises-section">
                  <button
                    className="exercises-toggle"
                    onClick={() => window.open(`/study/social-science/exercises/how-the-state-government-works`, '_blank')}
                  >
                    <span>Exercises</span>
                    <span className="exercises-arrow">→</span>
                  </button>
                </div>
                <div className="mindmap-button-section">
                  <button
                    className="mindmap-button"
                    onClick={() => window.open(`/study/social-science/mindmap/how-the-state-government-works`, '_blank')}
                  >
                    <span className="mindmap-button-icon">🗺️</span>
                    <span className="mindmap-button-text">
                      <span className="mindmap-button-title">View Mind Map</span>
                      <span className="mindmap-button-subtitle">Interactive visual guide</span>
                    </span>
                    <span className="mindmap-button-arrow">→</span>
                  </button>
                </div>
                  <div className="assistant-response-section">
                    <div className="assistant-header">
                      <span className="assistant-label">LearnWyse Assistant</span>
                      {isListening && <span className="assistant-status listening">🎤 Listening…</span>}
                      {isGeneratingResponse && !isListening && <span className="assistant-status">Thinking…</span>}
                    </div>
                    {assistantError && (
                      <div className="assistant-error">
                        {assistantError}
                      </div>
                    )}
                    {userTranscript && (
                      <div className="user-transcript">
                        <strong>You:</strong> {userTranscript}
                      </div>
                    )}
                    {assistantResponse && !assistantError ? (
                      <p className="assistant-response">{assistantResponse}</p>
                    ) : (
                      !assistantError && !isListening && (
                        <p className="assistant-placeholder">
                          Say “Hey Mister Wise” to start a conversation.
                        </p>
                      )
                    )}
                  </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default VideoPlayer

