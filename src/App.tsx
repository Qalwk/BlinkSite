import { useState, useEffect, useRef } from 'react'
import './App.css'

function App() {
  const cursorRef = useRef<HTMLDivElement>(null)
  const cursorDotRef = useRef<HTMLDivElement>(null)
  const [isHovering, setIsHovering] = useState(false)

  useEffect(() => {
    const cursor = cursorRef.current
    const cursorDot = cursorDotRef.current
    
    if (!cursor || !cursorDot) return

    let mouseX = 0
    let mouseY = 0
    let cursorX = 0
    let cursorY = 0

    const moveCursor = (e: MouseEvent) => {
      mouseX = e.clientX
      mouseY = e.clientY
    }

    const animate = () => {
      // Smooth follow effect
      cursorX += (mouseX - cursorX) * 0.15
      cursorY += (mouseY - cursorY) * 0.15
      
      cursor.style.left = cursorX + 'px'
      cursor.style.top = cursorY + 'px'
      cursorDot.style.left = mouseX + 'px'
      cursorDot.style.top = mouseY + 'px'
      
      requestAnimationFrame(animate)
    }

    const handleMouseEnter = () => setIsHovering(true)
    const handleMouseLeave = () => setIsHovering(false)

    // Add hover listeners to interactive elements
    const interactiveElements = document.querySelectorAll('a, button, input, textarea, select, .quiz-option, .faq-item')
    interactiveElements.forEach(el => {
      el.addEventListener('mouseenter', handleMouseEnter)
      el.addEventListener('mouseleave', handleMouseLeave)
    })

    window.addEventListener('mousemove', moveCursor)
    animate()

    return () => {
      window.removeEventListener('mousemove', moveCursor)
      interactiveElements.forEach(el => {
        el.removeEventListener('mouseenter', handleMouseEnter)
        el.removeEventListener('mouseleave', handleMouseLeave)
      })
    }
  }, [])
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    telegram: '',
    profession: '',
    os: '',
    motivation: ''
  })
  
  const [quizStep, setQuizStep] = useState(0)
  const [quizAnswers, setQuizAnswers] = useState<string[]>([])
  const [showQuizResult, setShowQuizResult] = useState(false)
  const [openFaq, setOpenFaq] = useState<number | null>(null)
  const [formSubmitted, setFormSubmitted] = useState(false)
  const [formLoading, setFormLoading] = useState(false)
  const [formError, setFormError] = useState('')

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setFormLoading(true)
    setFormError('')

    try {
      const response = await fetch('/api/send-form', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      })

      const data = await response.json()

      if (data.success) {
        setFormSubmitted(true)
      } else {
        setFormError(data.error || 'Произошла ошибка при отправке')
      }
    } catch (error) {
      console.error('Ошибка отправки формы:', error)
      setFormError('Не удалось отправить заявку. Попробуйте позже.')
    } finally {
      setFormLoading(false)
    }
  }

  // Система подсчёта баллов для квиза
  // Каждый ответ имеет "вес" - чем выше балл, тем больше потенциал улучшения с BlinkMind
  const quizQuestions = [
    {
      question: 'Кем ты работаешь?',
      options: [
        { text: 'Разработчик', points: 3 },      // Высокая когнитивная нагрузка
        { text: 'Дизайнер', points: 3 },         // Визуальная работа, усталость глаз
        { text: 'Студент', points: 2 },          // Долгие сессии обучения
        { text: 'Фрилансер', points: 3 },        // Нет чёткого графика, риск переработки
        { text: 'Менеджер', points: 2 },         // Много переключений внимания
        { text: 'Другое', points: 1 }            // Неизвестная специфика
      ]
    },
    {
      question: 'Сколько часов в день проводишь за компьютером?',
      options: [
        { text: 'Менее 4 часов', points: 1 },    // Низкий риск усталости
        { text: '4-6 часов', points: 2 },        // Умеренная нагрузка
        { text: '6-8 часов', points: 3 },        // Стандартный рабочий день
        { text: '8-10 часов', points: 4 },       // Повышенная нагрузка
        { text: 'Более 10 часов', points: 5 }    // Критическая нагрузка
      ]
    },
    {
      question: 'Как часто чувствуешь усталость или выгорание?',
      options: [
        { text: 'Редко', points: 1 },            // Хорошее состояние
        { text: 'Иногда', points: 2 },           // Умеренные проблемы
        { text: 'Часто', points: 4 },            // Серьёзные проблемы
        { text: 'Почти каждый день', points: 5 } // Критическое состояние
      ]
    },
    {
      question: 'Что больше всего мешает продуктивности?',
      options: [
        { text: 'Отвлечения', points: 3 },       // Проблема с фокусом
        { text: 'Усталость', points: 4 },        // Проблема с энергией
        { text: 'Прокрастинация', points: 3 },   // Проблема с мотивацией
        { text: 'Нет чёткого плана', points: 2 },// Проблема с организацией
        { text: 'Всё вместе', points: 5 }        // Комплексная проблема
      ]
    }
  ]

  // Функция подсчёта результатов квиза
  const calculateQuizResult = (answers: string[]) => {
    let totalPoints = 0
    
    // Считаем общие баллы
    answers.forEach((answer, questionIndex) => {
      const question = quizQuestions[questionIndex]
      const selectedOption = question.options.find(opt => opt.text === answer)
      if (selectedOption) {
        totalPoints += selectedOption.points
      }
    })

    // Максимум баллов: 3 + 5 + 5 + 5 = 18
    // Минимум баллов: 1 + 1 + 1 + 2 = 5
    
    // Определяем уровень и персонализированный результат
    if (totalPoints <= 7) {
      return {
        level: 'green',
        title: 'Ты в хорошей форме! 💚',
        description: 'У тебя неплохой баланс, но даже небольшая оптимизация может дать заметный результат.',
        productivityGain: '15-25%',
        timeSaved: '~45 мин',
        fatigueReduction: '-30%',
        emoji: '🌱'
      }
    } else if (totalPoints <= 11) {
      return {
        level: 'yellow',
        title: 'Есть потенциал для роста 💛',
        description: 'Ты справляешься, но работаешь не в полную силу. BlinkMind поможет найти твой оптимальный ритм.',
        productivityGain: '30-45%',
        timeSaved: '~1 час',
        fatigueReduction: '-50%',
        emoji: '⚡'
      }
    } else if (totalPoints <= 15) {
      return {
        level: 'orange',
        title: 'Пора что-то менять 🧡',
        description: 'Твой мозг работает на износ. Умное управление энергией может кардинально изменить ситуацию.',
        productivityGain: '40-60%',
        timeSaved: '~2 часа',
        fatigueReduction: '-70%',
        emoji: '🔥'
      }
    } else {
      return {
        level: 'red',
        title: 'Срочно нужна помощь ❤️',
        description: 'Ты на грани выгорания. BlinkMind поможет восстановить баланс и вернуть продуктивность без жертв.',
        productivityGain: '60-80%',
        timeSaved: '~3 часа',
        fatigueReduction: '-85%',
        emoji: '🚀'
      }
    }
  }

  const handleQuizAnswer = (answer: string) => {
    const newAnswers = [...quizAnswers, answer]
    setQuizAnswers(newAnswers)
    
    if (quizStep < quizQuestions.length - 1) {
      setQuizStep(quizStep + 1)
    } else {
      setShowQuizResult(true)
    }
  }

  const resetQuiz = () => {
    setQuizStep(0)
    setQuizAnswers([])
    setShowQuizResult(false)
  }

  const scrollToForm = () => {
    document.getElementById('beta-form')?.scrollIntoView({ behavior: 'smooth' })
  }

  const features = [
    {
      icon: '👁️',
      title: 'Анализ концентрации',
      description: 'Отслеживаем фокус и усталость через веб-камеру в реальном времени'
    },
    {
      icon: '🧠',
      title: 'Умные микросигналы',
      description: 'Учёт морганий, мимики и позы — не просто счётчик часов'
    },
    {
      icon: '⏰',
      title: 'Персональный ритм',
      description: 'Подстраиваемся под твой биоритм, а не навязываем таймеры'
    },
    {
      icon: '📊',
      title: 'Качественная статистика',
      description: 'Не часы за экраном, а реальная эффективность и фокус'
    },
    {
      icon: '💡',
      title: 'Умные подсказки',
      description: 'Знаем, когда пора сделать паузу, а когда ты на пике'
    },
    {
      icon: '🔒',
      title: 'Полная приватность',
      description: 'Все данные остаются на твоём компьютере'
    }
  ]

  const benefits = [
    'Больше продуктивных часов — меньше выгорания',
    'Глубокая концентрация, когда это важно',
    'Чёткий ритм работы и отдыха — без хаоса',
    'Контроль над ресурсом: знай, когда ты в форме',
    'Реальная эффективность, а не «много часов за экраном»'
  ]

  const faqItems = [
    {
      question: 'Это сложно настроить?',
      answer: 'Нет, 1 клик — и сессия запущена. Просто разреши доступ к камере и начни работать.'
    },
    {
      question: 'Нужно платить?',
      answer: 'Нет, бета-версия полностью бесплатна, без скрытых платежей и обязательств.'
    },
    {
      question: 'Мои данные в безопасности?',
      answer: 'Да, видео не сохраняется и не передаётся. Вся обработка происходит локально на твоём устройстве.'
    },
    {
      question: 'Что нужно для работы?',
      answer: 'Компьютер с веб-камерой и желание попробовать. Windows, macOS или Linux.'
    },
    {
      question: 'Как это работает технически?',
      answer: 'Мы используем компьютерное зрение для анализа микросигналов: частота морганий, направление взгляда, поза. Алгоритм определяет уровень концентрации и усталости.'
    }
  ]

  const securityFeatures = [
    { icon: '🔐', text: 'Видео не сохраняется' },
    { icon: '💻', text: 'Обработка только на твоём ПК' },
    { icon: '🚫', text: 'Никакой передачи третьим лицам' },
    { icon: '⚡', text: 'Отключи камеру в любой момент' }
  ]

  return (
    <div className="landing">
      {/* Custom Cursor */}
      <div ref={cursorRef} className={`cursor ${isHovering ? 'hovering' : ''}`}>
        <div className="cursor-ring"></div>
      </div>
      <div ref={cursorDotRef} className={`cursor-dot ${isHovering ? 'hovering' : ''}`}></div>
      {/* Header */}
      <header className="header">
        <div className="container header-content">
          <a href="#" className="logo">
            <span className="logo-icon">◉</span>
            <span>BlinkMind</span>
          </a>
          <nav className="nav">
            <a href="#features">Возможности</a>
            <a href="#how-it-works">Как работает</a>
            <a href="#faq">FAQ</a>
          </nav>
          <div className="header-right">
            <div className="social-links">
              <a href="https://t.me/+KmQ1IjNqwRY3YmE6" target="_blank" rel="noopener noreferrer" className="social-link" title="Telegram">
                <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20">
                  <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/>
                </svg>
              </a>
              <a href="https://vk.com/blinkmind" target="_blank" rel="noopener noreferrer" className="social-link" title="VK">
                <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20">
                  <path d="M15.684 0H8.316C1.592 0 0 1.592 0 8.316v7.368C0 22.408 1.592 24 8.316 24h7.368C22.408 24 24 22.408 24 15.684V8.316C24 1.592 22.408 0 15.684 0zm3.692 17.123h-1.744c-.66 0-.864-.525-2.05-1.727-1.033-1-1.49-1.135-1.744-1.135-.356 0-.458.102-.458.593v1.575c0 .424-.135.678-1.253.678-1.846 0-3.896-1.118-5.335-3.202C4.624 10.857 4 8.857 4 8.386c0-.254.102-.491.593-.491h1.744c.44 0 .61.203.78.677.863 2.49 2.303 4.675 2.896 4.675.22 0 .322-.102.322-.66V9.721c-.068-1.186-.695-1.287-.695-1.71 0-.203.17-.407.44-.407h2.744c.372 0 .508.203.508.643v3.473c0 .372.17.508.271.508.22 0 .407-.136.813-.542 1.254-1.406 2.151-3.574 2.151-3.574.119-.254.322-.491.763-.491h1.744c.525 0 .644.27.525.643-.22 1.017-2.354 4.031-2.354 4.031-.186.305-.254.44 0 .78.186.254.796.779 1.203 1.253.745.847 1.32 1.558 1.473 2.05.17.49-.085.744-.576.744z"/>
                </svg>
              </a>
            </div>
            <button className="btn btn-primary header-cta" onClick={scrollToForm}>
              Стать бета-тестером
            </button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="hero">
        <div className="hero-bg">
          <div className="hero-glow"></div>
          <div className="hero-grid"></div>
          <div className="hero-orbs">
            <div className="orb orb-1"></div>
            <div className="orb orb-2"></div>
            <div className="orb orb-3"></div>
          </div>
        </div>
        <div className="container hero-content">
          <div className="hero-text">
            <div className="hero-badge">🚀 Открыт набор бета-тестеров</div>
            <h1>
              Работай не по часам,<br />
              а по <span className="highlight">ритму мозга</span>
            </h1>
            <p className="hero-description">
              BlinkMind — интеллектуальный ассистент продуктивности. 
              Анализирует твоё состояние через веб-камеру и подсказывает, 
              когда работать, а когда отдохнуть.
            </p>
            <div className="hero-buttons">
              <button className="btn btn-primary" onClick={scrollToForm}>
                Записаться на бета
                <span className="btn-arrow">→</span>
              </button>
              <a href="#how-it-works" className="btn btn-secondary">
                Как это работает
              </a>
              <div className="social-links">
                <a href="https://t.me/+KmQ1IjNqwRY3YmE6" target="_blank" rel="noopener noreferrer" className="social-link" title="Telegram">
                  <svg viewBox="0 0 24 24" fill="currentColor" width="24" height="24">
                    <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/>
                  </svg>
                </a>
                <a href="https://vk.com/blinkmind" target="_blank" rel="noopener noreferrer" className="social-link" title="VK">
                  <svg viewBox="0 0 24 24" fill="currentColor" width="24" height="24">
                    <path d="M15.684 0H8.316C1.592 0 0 1.592 0 8.316v7.368C0 22.408 1.592 24 8.316 24h7.368C22.408 24 24 22.408 24 15.684V8.316C24 1.592 22.408 0 15.684 0zm3.692 17.123h-1.744c-.66 0-.864-.525-2.05-1.727-1.033-1-1.49-1.135-1.744-1.135-.356 0-.458.102-.458.593v1.575c0 .424-.135.678-1.253.678-1.846 0-3.896-1.118-5.335-3.202C4.624 10.857 4 8.857 4 8.386c0-.254.102-.491.593-.491h1.744c.44 0 .61.203.78.677.863 2.49 2.303 4.675 2.896 4.675.22 0 .322-.102.322-.66V9.721c-.068-1.186-.695-1.287-.695-1.71 0-.203.17-.407.44-.407h2.744c.372 0 .508.203.508.643v3.473c0 .372.17.508.271.508.22 0 .407-.136.813-.542 1.254-1.406 2.151-3.574 2.151-3.574.119-.254.322-.491.763-.491h1.744c.525 0 .644.27.525.643-.22 1.017-2.354 4.031-2.354 4.031-.186.305-.254.44 0 .78.186.254.796.779 1.203 1.253.745.847 1.32 1.558 1.473 2.05.17.49-.085.744-.576.744z"/>
                  </svg>
                </a>
              </div>
            </div>
            <div className="hero-stats">
              <div className="stat">
                <span className="stat-value">500+</span>
                <span className="stat-label">Заявок на бета</span>
              </div>
              <div className="stat">
                <span className="stat-value">94%</span>
                <span className="stat-label">Довольных тестеров</span>
              </div>
              <div className="stat">
                <span className="stat-value">2.5×</span>
                <span className="stat-label">Рост фокуса</span>
              </div>
            </div>
          </div>
          <div className="hero-visual">
            <div className="hero-mockup">
              <div className="mockup-header">
                <div className="mockup-dots">
                  <span></span><span></span><span></span>
                </div>
                <span className="mockup-title">BlinkMind</span>
              </div>
              <div className="mockup-content">
                <div className="mockup-metric">
                  <div className="metric-circle high">
                    <span>87%</span>
                  </div>
                  <span className="metric-label">Фокус</span>
                </div>
                <div className="mockup-status">
                  <span className="status-indicator active"></span>
                  <span>Отличная концентрация</span>
                </div>
                <div className="mockup-chart">
                  <div className="chart-bar" style={{ height: '60%' }}></div>
                  <div className="chart-bar" style={{ height: '80%' }}></div>
                  <div className="chart-bar" style={{ height: '45%' }}></div>
                  <div className="chart-bar" style={{ height: '90%' }}></div>
                  <div className="chart-bar active" style={{ height: '87%' }}></div>
                </div>
                <div className="mockup-tip">
                  💡 Ещё 23 минуты до рекомендуемого перерыва
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Problem Section */}
      <section className="problem">
        <div className="container">
          <div className="problem-content">
            <h2>Знакомо?</h2>
            <div className="problem-grid">
              <div className="problem-card">
                <span className="problem-icon">😮‍💨</span>
                <p>Устаёшь, даже если работаешь меньше 4 часов?</p>
              </div>
              <div className="problem-card">
                <span className="problem-icon">⏱️</span>
                <p>Pomodoro-таймер не видит, что ты уже выгорел</p>
              </div>
              <div className="problem-card">
                <span className="problem-icon">📋</span>
                <p>To-do списки — пустые обещания без понимания ресурса</p>
              </div>
              <div className="problem-card">
                <span className="problem-icon">🧘</span>
                <p>Расфокусировка и прокрастинация съедают время</p>
              </div>
            </div>
            <div className="problem-quote">
              <p>«Сколько раз ты ловил себя на мысли "устал/выгорел", хотя вроде работал?»</p>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="features" id="features">
        <div className="container">
          <div className="section-header">
            <h2>Что даёт <span className="highlight">BlinkMind</span></h2>
            <p>Не очередной таймер, а умный ассистент твоей когнитивной энергии</p>
          </div>
          <div className="features-grid">
            {features.map((feature, index) => (
              <div className="feature-card" key={index}>
                <span className="feature-icon">{feature.icon}</span>
                <h3>{feature.title}</h3>
                <p>{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="how-it-works" id="how-it-works">
        <div className="container">
          <div className="section-header">
            <h2>Как это работает</h2>
            <p>Три простых шага к осознанной продуктивности</p>
          </div>
          <div className="steps">
            <div className="step">
              <div className="step-number">01</div>
              <div className="step-content">
                <h3>Включи камеру</h3>
                <p>Всё работает локально — видео не записывается и не передаётся куда-либо.</p>
              </div>
              <div className="step-visual">
                <div className="step-icon">📸</div>
              </div>
            </div>
            <div className="step">
              <div className="step-number">02</div>
              <div className="step-content">
                <h3>Работай как обычно</h3>
                <p>BlinkMind анализирует микросигналы: моргания, мимику, позу — и определяет твоё состояние в реальном времени.</p>
              </div>
              <div className="step-visual">
                <div className="step-icon">🧠</div>
              </div>
            </div>
            <div className="step">
              <div className="step-number">03</div>
              <div className="step-content">
                <h3>Получай умные подсказки</h3>
                <p>Система уведомлений работает в режиме онлайн: подскажет, когда сделать паузу, заварить чай или размяться.</p>
              </div>
              <div className="step-visual">
                <div className="step-icon">💡</div>
              </div>
            </div>
          </div>
          <div className="how-it-works-cta">
            <a href="https://t.me/blinkm1nd/446" target="_blank" rel="noopener noreferrer" className="btn btn-outline">
              Посмотреть функционал приложения
            </a>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="benefits">
        <div className="container">
          <div className="benefits-content">
            <div className="benefits-text">
              <h2>Что ты получишь</h2>
              <ul className="benefits-list">
                {benefits.map((benefit, index) => (
                  <li key={index}>
                    <span className="benefit-check">✓</span>
                    {benefit}
                  </li>
                ))}
              </ul>
              <div className="cta-with-social">
                <button className="btn btn-primary" onClick={scrollToForm}>
                  Хочу попробовать
                </button>
                <a href="https://t.me/blinkm1nd/446" target="_blank" rel="noopener noreferrer" className="btn btn-outline">
                  Посмотреть функционал
                </a>
                <div className="social-links">
                  <a href="https://t.me/+KmQ1IjNqwRY3YmE6" target="_blank" rel="noopener noreferrer" className="social-link" title="Telegram">
                    <svg viewBox="0 0 24 24" fill="currentColor" width="24" height="24">
                      <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/>
                    </svg>
                  </a>
                  <a href="https://vk.com/blinkmind" target="_blank" rel="noopener noreferrer" className="social-link" title="VK">
                    <svg viewBox="0 0 24 24" fill="currentColor" width="24" height="24">
                      <path d="M15.684 0H8.316C1.592 0 0 1.592 0 8.316v7.368C0 22.408 1.592 24 8.316 24h7.368C22.408 24 24 22.408 24 15.684V8.316C24 1.592 22.408 0 15.684 0zm3.692 17.123h-1.744c-.66 0-.864-.525-2.05-1.727-1.033-1-1.49-1.135-1.744-1.135-.356 0-.458.102-.458.593v1.575c0 .424-.135.678-1.253.678-1.846 0-3.896-1.118-5.335-3.202C4.624 10.857 4 8.857 4 8.386c0-.254.102-.491.593-.491h1.744c.44 0 .61.203.78.677.863 2.49 2.303 4.675 2.896 4.675.22 0 .322-.102.322-.66V9.721c-.068-1.186-.695-1.287-.695-1.71 0-.203.17-.407.44-.407h2.744c.372 0 .508.203.508.643v3.473c0 .372.17.508.271.508.22 0 .407-.136.813-.542 1.254-1.406 2.151-3.574 2.151-3.574.119-.254.322-.491.763-.491h1.744c.525 0 .644.27.525.643-.22 1.017-2.354 4.031-2.354 4.031-.186.305-.254.44 0 .78.186.254.796.779 1.203 1.253.745.847 1.32 1.558 1.473 2.05.17.49-.085.744-.576.744z"/>
                    </svg>
                  </a>
                </div>
              </div>
            </div>
            <div className="benefits-visual">
              <div className="benefits-card">
                <div className="benefits-chart">
                  <div className="chart-title">Продуктивность за неделю</div>
                  <div className="chart-comparison">
                    <div className="chart-item">
                      <div className="chart-label">До BlinkMind</div>
                      <div className="chart-progress">
                        <div className="progress-bar before" style={{ width: '45%' }}></div>
                      </div>
                      <span className="chart-value">45%</span>
                    </div>
                    <div className="chart-item">
                      <div className="chart-label">С BlinkMind</div>
                      <div className="chart-progress">
                        <div className="progress-bar after" style={{ width: '87%' }}></div>
                      </div>
                      <span className="chart-value highlight">87%</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Quiz Section */}
      <section className="quiz" id="quiz">
        <div className="container">
          <div className="quiz-card">
            {!showQuizResult ? (
              <>
                <div className="quiz-header">
                  <span className="quiz-badge">🎯 Мини-тест</span>
                  <h2>Проверь свой рабочий ритм за 1 минуту</h2>
                  <div className="quiz-progress">
                    <div 
                      className="quiz-progress-bar" 
                      style={{ width: `${((quizStep + 1) / quizQuestions.length) * 100}%` }}
                    ></div>
                  </div>
                  <span className="quiz-step">{quizStep + 1} / {quizQuestions.length}</span>
                </div>
                <div className="quiz-content">
                  <h3>{quizQuestions[quizStep].question}</h3>
                  <div className="quiz-options">
                    {quizQuestions[quizStep].options.map((option, index) => (
                      <button 
                        key={index}
                        className="quiz-option"
                        onClick={() => handleQuizAnswer(option.text)}
                      >
                        {option.text}
                      </button>
                    ))}
                  </div>
                </div>
              </>
            ) : (
              (() => {
                const result = calculateQuizResult(quizAnswers)
                return (
                  <div className={`quiz-result quiz-result-${result.level}`}>
                    <span className="quiz-result-icon">{result.emoji}</span>
                    <h2>{result.title}</h2>
                    <p className="quiz-result-text">
                      {result.description}
                      {' '}
                      <span className="highlight">Потенциал роста: +{result.productivityGain}</span>
                    </p>
                    <div className="quiz-result-stats">
                      <div className="result-stat">
                        <span className="result-value">{result.timeSaved}</span>
                        <span className="result-label">Экономия времени в день</span>
                      </div>
                      <div className="result-stat">
                        <span className="result-value">{result.fatigueReduction}</span>
                        <span className="result-label">Меньше усталости</span>
                      </div>
                      <div className="result-stat">
                        <span className="result-value">+{result.productivityGain}</span>
                        <span className="result-label">Рост продуктивности</span>
                      </div>
                    </div>
                    <div className="quiz-result-buttons">
                      <button className="btn btn-primary" onClick={scrollToForm}>
                        Записаться на бета-тест
                      </button>
                      <button className="btn btn-secondary" onClick={resetQuiz}>
                        Пройти снова
                      </button>
                    </div>
                    <a href="https://t.me/blinkm1nd/446" target="_blank" rel="noopener noreferrer" className="btn btn-outline quiz-demo-link">
                      Посмотреть функционал приложения
                    </a>
                    <div className="social-links quiz-social">
                      <a href="https://t.me/+KmQ1IjNqwRY3YmE6" target="_blank" rel="noopener noreferrer" className="social-link" title="Telegram">
                        <svg viewBox="0 0 24 24" fill="currentColor" width="24" height="24">
                          <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/>
                        </svg>
                      </a>
                      <a href="https://vk.com/blinkmind" target="_blank" rel="noopener noreferrer" className="social-link" title="VK">
                        <svg viewBox="0 0 24 24" fill="currentColor" width="24" height="24">
                          <path d="M15.684 0H8.316C1.592 0 0 1.592 0 8.316v7.368C0 22.408 1.592 24 8.316 24h7.368C22.408 24 24 22.408 24 15.684V8.316C24 1.592 22.408 0 15.684 0zm3.692 17.123h-1.744c-.66 0-.864-.525-2.05-1.727-1.033-1-1.49-1.135-1.744-1.135-.356 0-.458.102-.458.593v1.575c0 .424-.135.678-1.253.678-1.846 0-3.896-1.118-5.335-3.202C4.624 10.857 4 8.857 4 8.386c0-.254.102-.491.593-.491h1.744c.44 0 .61.203.78.677.863 2.49 2.303 4.675 2.896 4.675.22 0 .322-.102.322-.66V9.721c-.068-1.186-.695-1.287-.695-1.71 0-.203.17-.407.44-.407h2.744c.372 0 .508.203.508.643v3.473c0 .372.17.508.271.508.22 0 .407-.136.813-.542 1.254-1.406 2.151-3.574 2.151-3.574.119-.254.322-.491.763-.491h1.744c.525 0 .644.27.525.643-.22 1.017-2.354 4.031-2.354 4.031-.186.305-.254.44 0 .78.186.254.796.779 1.203 1.253.745.847 1.32 1.558 1.473 2.05.17.49-.085.744-.576.744z"/>
                        </svg>
                      </a>
                    </div>
                  </div>
                )
              })()
            )}
          </div>
        </div>
      </section>

      {/* Security Section */}
      <section className="security">
        <div className="container">
          <div className="security-content">
            <div className="security-text">
              <span className="security-badge">🛡️ Безопасность</span>
              <h2>Твоя приватность — наш приоритет</h2>
              <p>
                Мы понимаем, что доступ к камере — это вопрос доверия. 
                Поэтому BlinkMind работает полностью локально.
              </p>
            </div>
            <div className="security-grid">
              {securityFeatures.map((feature, index) => (
                <div className="security-card" key={index}>
                  <span className="security-icon">{feature.icon}</span>
                  <span>{feature.text}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Beta Form Section */}
      <section className="beta-form" id="beta-form">
        <div className="container">
          <div className="form-wrapper">
            <div className="form-info">
              <span className="form-badge">🎁 Бесплатно</span>
              <h2>Стань бета-тестером BlinkMind</h2>
              <p>
                Получи ранний доступ к приложению, влияй на развитие продукта 
                и помоги нам сделать его лучше.
              </p>
              <ul className="form-benefits">
                <li>✓ Бесплатный доступ навсегда для первых тестеров</li>
                <li>✓ Приоритетная поддержка</li>
                <li>✓ Влияние на функционал</li>
                <li>✓ Эксклюзивные фичи</li>
              </ul>
            </div>
            <div className="form-card">
              {!formSubmitted ? (
                <form onSubmit={handleSubmit}>
                  <div className="form-group">
                    <label htmlFor="name">Имя или никнейм</label>
                    <input 
                      type="text" 
                      id="name" 
                      name="name" 
                      placeholder="Как к тебе обращаться?"
                      value={formData.name}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="email">Email</label>
                    <input 
                      type="email" 
                      id="email" 
                      name="email" 
                      placeholder="твой@email.com"
                      value={formData.email}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="telegram">Telegram</label>
                    <input 
                      type="text" 
                      id="telegram" 
                      name="telegram" 
                      placeholder="@username"
                      value={formData.telegram}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div className="form-row">
                    <div className="form-group">
                      <label htmlFor="profession">Род деятельности</label>
                      <select 
                        id="profession" 
                        name="profession"
                        value={formData.profession}
                        onChange={handleInputChange}
                        required
                      >
                        <option value="">Выбери...</option>
                        <option value="developer">Разработчик</option>
                        <option value="designer">Дизайнер</option>
                        <option value="student">Студент</option>
                        <option value="freelancer">Фрилансер</option>
                        <option value="manager">Менеджер</option>
                        <option value="other">Другое</option>
                      </select>
                    </div>
                    <div className="form-group">
                      <label htmlFor="os">Операционная система</label>
                      <select 
                        id="os" 
                        name="os"
                        value={formData.os}
                        onChange={handleInputChange}
                        required
                      >
                        <option value="">Выбери...</option>
                        <option value="windows">Windows</option>
                        <option value="macos">macOS</option>
                        <option value="linux">Linux</option>
                      </select>
                    </div>
                  </div>
                  <div className="form-group">
                    <label htmlFor="motivation">Почему хочешь участвовать? (необязательно)</label>
                    <textarea 
                      id="motivation" 
                      name="motivation" 
                      rows={3}
                      placeholder="Расскажи о своих ожиданиях..."
                      value={formData.motivation}
                      onChange={handleInputChange}
                    ></textarea>
                  </div>
                  {formError && (
                    <p className="form-error">{formError}</p>
                  )}
                  <button 
                    type="submit" 
                    className="btn btn-primary btn-full"
                    disabled={formLoading}
                  >
                    {formLoading ? 'Отправка...' : 'Отправить заявку'}
                    {!formLoading && <span className="btn-arrow">→</span>}
                  </button>
                  <p className="form-note">
                    Мы свяжемся в течение 24 часов. Места ограничены!
                  </p>
                </form>
              ) : (
                <div className="form-success">
                  <span className="success-icon">🎉</span>
                  <h3>Заявка отправлена!</h3>
                  <p>Спасибо за интерес к BlinkMind. Мы свяжемся с тобой в ближайшее время.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="faq" id="faq">
        <div className="container">
          <div className="section-header">
            <h2>Частые вопросы</h2>
            <p>Ответы на то, что ты хотел спросить</p>
          </div>
          <div className="faq-list">
            {faqItems.map((item, index) => (
              <div 
                className={`faq-item ${openFaq === index ? 'open' : ''}`} 
                key={index}
                onClick={() => setOpenFaq(openFaq === index ? null : index)}
              >
                <div className="faq-question">
                  <h3>{item.question}</h3>
                  <span className="faq-toggle">{openFaq === index ? '−' : '+'}</span>
                </div>
                <div className="faq-answer">
                  <p>{item.answer}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="final-cta">
        <div className="container">
          <div className="cta-content">
            <h2>Готов начать?</h2>
            <p>Запишись на бета-тест прямо сейчас — количество мест ограничено</p>
            <div className="cta-with-social">
              <button className="btn btn-primary btn-large" onClick={scrollToForm}>
                Стать бета-тестером
                <span className="btn-arrow">→</span>
              </button>
              <div className="social-links">
                <a href="https://t.me/+KmQ1IjNqwRY3YmE6" target="_blank" rel="noopener noreferrer" className="social-link" title="Telegram">
                  <svg viewBox="0 0 24 24" fill="currentColor" width="28" height="28">
                    <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/>
                  </svg>
                </a>
                <a href="https://vk.com/blinkmind" target="_blank" rel="noopener noreferrer" className="social-link" title="VK">
                  <svg viewBox="0 0 24 24" fill="currentColor" width="28" height="28">
                    <path d="M15.684 0H8.316C1.592 0 0 1.592 0 8.316v7.368C0 22.408 1.592 24 8.316 24h7.368C22.408 24 24 22.408 24 15.684V8.316C24 1.592 22.408 0 15.684 0zm3.692 17.123h-1.744c-.66 0-.864-.525-2.05-1.727-1.033-1-1.49-1.135-1.744-1.135-.356 0-.458.102-.458.593v1.575c0 .424-.135.678-1.253.678-1.846 0-3.896-1.118-5.335-3.202C4.624 10.857 4 8.857 4 8.386c0-.254.102-.491.593-.491h1.744c.44 0 .61.203.78.677.863 2.49 2.303 4.675 2.896 4.675.22 0 .322-.102.322-.66V9.721c-.068-1.186-.695-1.287-.695-1.71 0-.203.17-.407.44-.407h2.744c.372 0 .508.203.508.643v3.473c0 .372.17.508.271.508.22 0 .407-.136.813-.542 1.254-1.406 2.151-3.574 2.151-3.574.119-.254.322-.491.763-.491h1.744c.525 0 .644.27.525.643-.22 1.017-2.354 4.031-2.354 4.031-.186.305-.254.44 0 .78.186.254.796.779 1.203 1.253.745.847 1.32 1.558 1.473 2.05.17.49-.085.744-.576.744z"/>
                  </svg>
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="footer">
        <div className="container footer-content">
          <div className="footer-brand">
            <a href="#" className="logo">
              <span className="logo-icon">◉</span>
              <span>BlinkMind</span>
            </a>
            <p>Твой личный ассистент продуктивности</p>
            <div className="social-links footer-social">
              <a href="https://t.me/+KmQ1IjNqwRY3YmE6" target="_blank" rel="noopener noreferrer" className="social-link" title="Telegram">
                <svg viewBox="0 0 24 24" fill="currentColor" width="24" height="24">
                  <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/>
                </svg>
              </a>
              <a href="https://vk.com/blinkmind" target="_blank" rel="noopener noreferrer" className="social-link" title="VK">
                <svg viewBox="0 0 24 24" fill="currentColor" width="24" height="24">
                  <path d="M15.684 0H8.316C1.592 0 0 1.592 0 8.316v7.368C0 22.408 1.592 24 8.316 24h7.368C22.408 24 24 22.408 24 15.684V8.316C24 1.592 22.408 0 15.684 0zm3.692 17.123h-1.744c-.66 0-.864-.525-2.05-1.727-1.033-1-1.49-1.135-1.744-1.135-.356 0-.458.102-.458.593v1.575c0 .424-.135.678-1.253.678-1.846 0-3.896-1.118-5.335-3.202C4.624 10.857 4 8.857 4 8.386c0-.254.102-.491.593-.491h1.744c.44 0 .61.203.78.677.863 2.49 2.303 4.675 2.896 4.675.22 0 .322-.102.322-.66V9.721c-.068-1.186-.695-1.287-.695-1.71 0-.203.17-.407.44-.407h2.744c.372 0 .508.203.508.643v3.473c0 .372.17.508.271.508.22 0 .407-.136.813-.542 1.254-1.406 2.151-3.574 2.151-3.574.119-.254.322-.491.763-.491h1.744c.525 0 .644.27.525.643-.22 1.017-2.354 4.031-2.354 4.031-.186.305-.254.44 0 .78.186.254.796.779 1.203 1.253.745.847 1.32 1.558 1.473 2.05.17.49-.085.744-.576.744z"/>
                </svg>
              </a>
            </div>
          </div>
          <div className="footer-links">
            <a href="#features">Возможности</a>
            <a href="#how-it-works">Как работает</a>
            <a href="#faq">FAQ</a>
            <a href="#beta-form">Бета-тест</a>
          </div>
          <div className="footer-copy">
            <p>© 2025 BlinkMind. Все права защищены.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default App
