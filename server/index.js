import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'

// Загружаем переменные окружения из .env файла
dotenv.config()

const app = express()
const PORT = process.env.PORT || 3001

// Разрешённые домены для CORS
const allowedOrigins = [
  'http://localhost:5173',            // Локальная разработка Vite
  'http://localhost:3000',            // Альтернативный локальный порт
  process.env.FRONTEND_URL,           // Продакшн URL из Railway
  'https://blinkmind.ru',             // Основной домен
  'https://www.blinkmind.ru',         // WWW домен
  'https://blink-site-1.vercel.app'   // Vercel домен
].filter(Boolean)

// Middleware
app.use(cors({
  origin: function (origin, callback) {
    // Разрешаем запросы без origin (например, curl, Postman)
    if (!origin) return callback(null, true)
    
    if (allowedOrigins.includes(origin)) {
      callback(null, true)
    } else {
      console.log('Blocked by CORS:', origin)
      callback(new Error('Not allowed by CORS'))
    }
  }
}))
app.use(express.json())

// Получаем токен и chat_id из переменных окружения
const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN
const CHAT_ID = process.env.TELEGRAM_CHAT_ID

// Health check эндпоинт для мониторинга
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() })
})

// Эндпоинт для отправки формы
app.post('/api/send-form', async (req, res) => {
  try {
    const { name, email, telegram, profession, os, motivation } = req.body

    // Проверяем обязательные поля
    if (!name || !email || !profession || !os) {
      return res.status(400).json({ 
        success: false, 
        error: 'Заполните все обязательные поля' 
      })
    }

    // Проверяем наличие токена и chat_id
    if (!BOT_TOKEN || !CHAT_ID) {
      console.error('TELEGRAM_BOT_TOKEN или TELEGRAM_CHAT_ID не настроены')
      return res.status(500).json({ 
        success: false, 
        error: 'Ошибка конфигурации сервера' 
      })
    }

    // Формируем сообщение для Telegram
    const professionLabels = {
      developer: 'Разработчик',
      designer: 'Дизайнер',
      student: 'Студент',
      freelancer: 'Фрилансер',
      manager: 'Менеджер',
      other: 'Другое'
    }

    const osLabels = {
      windows: 'Windows',
      macos: 'macOS',
      linux: 'Linux'
    }

    const message = `
🚀 *Новая заявка на бета-тест BlinkMind!*

👤 *Имя:* ${escapeMarkdown(name)}
📧 *Email:* ${escapeMarkdown(email)}
${telegram ? `📱 *Telegram:* ${escapeMarkdown(telegram)}` : ''}
💼 *Род деятельности:* ${professionLabels[profession] || profession}
💻 *ОС:* ${osLabels[os] || os}
${motivation ? `\n💬 *Мотивация:*\n${escapeMarkdown(motivation)}` : ''}
    `.trim()

    // Отправляем сообщение в Telegram
    const telegramUrl = `https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`
    
    const response = await fetch(telegramUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        chat_id: CHAT_ID,
        text: message,
        parse_mode: 'Markdown'
      })
    })

    const data = await response.json()

    if (!data.ok) {
      console.error('Ошибка Telegram API:', data)
      return res.status(500).json({ 
        success: false, 
        error: 'Ошибка отправки в Telegram' 
      })
    }

    res.json({ success: true, message: 'Заявка успешно отправлена!' })

  } catch (error) {
    console.error('Ошибка сервера:', error)
    res.status(500).json({ 
      success: false, 
      error: 'Внутренняя ошибка сервера' 
    })
  }
})

// Функция для экранирования специальных символов Markdown
function escapeMarkdown(text) {
  if (!text) return ''
  return text.replace(/[_*[\]()~`>#+=|{}.!-]/g, '\\$&')
}

// Запуск сервера
app.listen(PORT, () => {
  console.log(`✅ Сервер запущен на порту ${PORT}`)
  
  if (!BOT_TOKEN || !CHAT_ID) {
    console.warn('⚠️  Внимание: TELEGRAM_BOT_TOKEN или TELEGRAM_CHAT_ID не настроены!')
    console.warn('   Создайте файл .env по примеру .env.example')
  }
})
