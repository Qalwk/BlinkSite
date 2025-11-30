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
    profession: '',
    os: '',
    motivation: ''
  })
  
  const [quizStep, setQuizStep] = useState(0)
  const [quizAnswers, setQuizAnswers] = useState<string[]>([])
  const [showQuizResult, setShowQuizResult] = useState(false)
  const [openFaq, setOpenFaq] = useState<number | null>(null)
  const [formSubmitted, setFormSubmitted] = useState(false)

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setFormSubmitted(true)
  }

  const quizQuestions = [
    {
      question: 'Кем ты работаешь?',
      options: ['Разработчик', 'Дизайнер', 'Студент', 'Фрилансер', 'Менеджер', 'Другое']
    },
    {
      question: 'Сколько часов в день проводишь за компьютером?',
      options: ['Менее 4 часов', '4-6 часов', '6-8 часов', '8-10 часов', 'Более 10 часов']
    },
    {
      question: 'Как часто чувствуешь усталость или выгорание?',
      options: ['Редко', 'Иногда', 'Часто', 'Почти каждый день']
    },
    {
      question: 'Что больше всего мешает продуктивности?',
      options: ['Отвлечения', 'Усталость', 'Прокрастинация', 'Нет чёткого плана', 'Всё вместе']
    }
  ]

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
          <button className="btn btn-primary header-cta" onClick={scrollToForm}>
            Стать бета-тестером
          </button>
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
                <p>Устаёшь, даже если работаешь 8+ часов?</p>
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
                <p>Просто разреши доступ к веб-камере. Видео не записывается и никуда не передаётся.</p>
              </div>
              <div className="step-visual">
                <div className="step-icon">📸</div>
              </div>
            </div>
            <div className="step">
              <div className="step-number">02</div>
              <div className="step-content">
                <h3>Работай как обычно</h3>
                <p>BlinkMind незаметно анализирует микросигналы: моргания, мимику, позу — и определяет твоё состояние.</p>
              </div>
              <div className="step-visual">
                <div className="step-icon">🧠</div>
              </div>
            </div>
            <div className="step">
              <div className="step-number">03</div>
              <div className="step-content">
                <h3>Получай подсказки</h3>
                <p>Умные уведомления подскажут, когда пора сделать паузу, а когда ты на пике концентрации.</p>
              </div>
              <div className="step-visual">
                <div className="step-icon">💡</div>
              </div>
            </div>
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
              <button className="btn btn-primary" onClick={scrollToForm}>
                Хочу попробовать
              </button>
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
                        onClick={() => handleQuizAnswer(option)}
                      >
                        {option}
                      </button>
                    ))}
                  </div>
                </div>
              </>
            ) : (
              <div className="quiz-result">
                <span className="quiz-result-icon">📊</span>
                <h2>Твой результат</h2>
                <p className="quiz-result-text">
                  Судя по ответам, ты мог бы <span className="highlight">повысить продуктивность на 40-60%</span>, 
                  если бы работал в согласии с ритмом мозга, а не против него.
                </p>
                <div className="quiz-result-stats">
                  <div className="result-stat">
                    <span className="result-value">~2ч</span>
                    <span className="result-label">Экономия времени в день</span>
                  </div>
                  <div className="result-stat">
                    <span className="result-value">-70%</span>
                    <span className="result-label">Меньше усталости</span>
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
              </div>
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
                  <button type="submit" className="btn btn-primary btn-full">
                    Отправить заявку
                    <span className="btn-arrow">→</span>
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
            <button className="btn btn-primary btn-large" onClick={scrollToForm}>
              Стать бета-тестером
              <span className="btn-arrow">→</span>
            </button>
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
            <p>Интеллектуальный ассистент продуктивности</p>
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
