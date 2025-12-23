<script setup lang="ts">
import { ref, nextTick, onMounted } from 'vue'

interface Message {
  id: number
  role: 'user' | 'assistant'
  content: string
}

interface Visitor {
  name: string
  company: string
  position: string
  email: string
  phone: string
}

const messages = ref<Message[]>([])
const inputText = ref('')
const isLoading = ref(false)
const messagesContainer = ref<HTMLElement | null>(null)
const showVisitorModal = ref(false)
const visitor = ref<Visitor>({ name: '', company: '', position: '', email: '', phone: '' })
const formSubmitted = ref(false)
const messageCount = ref(0)

const quickActions = [
  // Teknoloji & Yetenekler
  'Hangi teknolojilerde deneyimin var?',
  'Hangi frontend teknolojileriyle aktif olarak çalıştın?',
  'Günlük işlerinde en çok kullandığın framework\'ler neler?',
  'Frontend tarafında hangi ekosistemlere hakimsin?',
  'Kullandığın araçlar (framework, UI library, tool) neler?',
  'Backend veya API tarafında hangi teknolojilerle temasın oldu?',

  // Vue.js
  'Vue.js deneyimini anlatır mısın?',
  'Vue.js dışında tecrübe ettiğin kütüphane veya framework\'ler hangileri?',

  // React
  'React ile ne zamandır çalışıyorsun?',
  'React\'i hangi projelerde kullandın?',
  'React\'te en çok hangi özellikleri kullanıyorsun?',
  'React ve Vue arasındaki temel farklar nelerdir?',
  'Hangi senaryoda React\'i, hangi senaryoda Vue\'yu tercih edersin?',
  'Vue\'dan React\'e geçerken seni en çok zorlayan şey ne oldu?',
  'React\'te JSX kullanımı hakkında ne düşünüyorsun?',
  'React\'in öğrenme eğrisi hakkında ne düşünüyorsun?',

  // İş Deneyimi
  'En son nerede çalıştın?',
  'Son çalıştığın şirket hangisiydi?',
  'En son hangi pozisyonda görev aldın?',
  'Son iş deneyiminde hangi projelerde yer aldın?',
  'En uzun süre çalıştığın şirket hangisiydi?',
  'Şu ana kadar hangi sektörlerde yazılım geliştirdin?',
  'Daha önce kurumsal projelerde çalıştın mı?',
  'Fintech / B2B / operasyonel sistem tecrüben var mı?',
  'Daha çok ürün mü yoksa proje bazlı işlerde mi çalıştın?',
  'Bir projede seni teknik olarak en çok zorlayan teknoloji hangisiydi?',

  // İletişim
  'İletişim bilgilerin neler?'
]

const scrollToBottom = async () => {
  await nextTick()
  if (messagesContainer.value) {
    messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight
  }
}

const addMessage = (role: 'user' | 'assistant', content: string) => {
  messages.value.push({
    id: Date.now(),
    role,
    content
  })
  scrollToBottom()
}

const sendMessage = async (text?: string) => {
  const messageText = text || inputText.value.trim()
  if (!messageText || isLoading.value) return

  addMessage('user', messageText)
  inputText.value = ''
  isLoading.value = true
  messageCount.value++

  // 4 mesaj sonra ziyaretçi bilgisi iste (henüz form gönderilmediyse)
  if (messageCount.value === 4 && !formSubmitted.value) {
    showVisitorModal.value = true
  }

  try {
    const response = await $fetch('/api/chat', {
      method: 'POST',
      body: {
        message: messageText,
        history: messages.value.slice(-10),
        visitor: formSubmitted.value ? visitor.value : null
      }
    })

    addMessage('assistant', response.reply)
  } catch (error) {
    console.error('Chat error:', error)
    addMessage('assistant', 'Üzgünüm, bir hata oluştu. Lütfen tekrar deneyin.')
  } finally {
    isLoading.value = false
  }
}

const handleKeydown = (e: KeyboardEvent) => {
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault()
    sendMessage()
  }
}

const submitVisitorInfo = async () => {
  showVisitorModal.value = false

  // Herhangi bir alan doldurulduysa email gönder
  const hasAnyInfo = visitor.value.name || visitor.value.company || visitor.value.position || visitor.value.email || visitor.value.phone

  if (hasAnyInfo) {
    formSubmitted.value = true
    try {
      await $fetch('/api/notify', {
        method: 'POST',
        body: {
          visitor: visitor.value,
          messages: messages.value
        }
      })
    } catch (e) {
      console.error('Notification error:', e)
    }
  }
}

const skipVisitorInfo = () => {
  showVisitorModal.value = false
}

onMounted(() => {
  // Karşılama mesajı
  addMessage('assistant', 'Merhaba! 👋 Ben Halit Enes\'in interaktif özgeçmiş asistanıyım. Deneyimlerim, projelerim veya teknik yetkinliklerim hakkında her şeyi sorabilirsiniz. Size nasıl yardımcı olabilirim?')
})
</script>

<template>
  <div class="chat-container">
    <!-- Header -->
    <header class="chat-header">
      <img
        src="/avatar.svg"
        alt="Halit Enes Büyüktepe"
        class="profile-image"
      />
      <h1>Halit Enes Büyüktepe</h1>
      <p>Frontend Developer | Vue.js & React</p>
    </header>

    <!-- Chat Window -->
    <div class="chat-window">
      <div ref="messagesContainer" class="messages-container">
        <div
          v-for="message in messages"
          :key="message.id"
          :class="['message', message.role]"
        >
          <div class="message-avatar">
            {{ message.role === 'assistant' ? '👨‍💻' : '👤' }}
          </div>
          <div class="message-content">
            {{ message.content }}
          </div>
        </div>

        <!-- Typing Indicator -->
        <div v-if="isLoading" class="message assistant">
          <div class="message-avatar">👨‍💻</div>
          <div class="message-content">
            <div class="typing-indicator">
              <span></span>
              <span></span>
              <span></span>
            </div>
          </div>
        </div>
      </div>

      <!-- Quick Actions - Her zaman görünür -->
      <div class="quick-actions">
        <button
          v-for="action in quickActions"
          :key="action"
          class="quick-action"
          :disabled="isLoading"
          @click="sendMessage(action)"
        >
          {{ action }}
        </button>
      </div>

      <!-- Input Area -->
      <div class="input-area">
        <div class="input-wrapper">
          <textarea
            v-model="inputText"
            placeholder="Bir soru sorun..."
            rows="1"
            @keydown="handleKeydown"
          ></textarea>
          <button
            class="send-button"
            :disabled="!inputText.trim() || isLoading"
            @click="sendMessage()"
          >
            Gönder
          </button>
        </div>
      </div>
    </div>

    <!-- Footer -->
    <footer class="chat-footer">
      <a href="https://linkedin.com/in/halitenes/" target="_blank">LinkedIn</a>
      &nbsp;•&nbsp;
      <a href="https://github.com/halitenes/" target="_blank">GitHub</a>
      &nbsp;•&nbsp;
      <a href="mailto:buyuktepe.halitenes@gmail.com">Email</a>
    </footer>

    <!-- Visitor Modal -->
    <div v-if="showVisitorModal" class="modal-overlay" @click.self="skipVisitorInfo">
      <div class="modal">
        <h3>Tanışalım mı? 🤝</h3>
        <p>İsterseniz kendinizi tanıtabilirsiniz. Bu bilgiler Halit Enes'e iletilecek.</p>

        <input
          v-model="visitor.name"
          type="text"
          placeholder="Adınız (opsiyonel)"
        />
        <input
          v-model="visitor.email"
          type="email"
          placeholder="E-posta adresiniz (opsiyonel)"
        />
        <input
          v-model="visitor.phone"
          type="tel"
          placeholder="Telefon numaranız (opsiyonel)"
        />
        <input
          v-model="visitor.company"
          type="text"
          placeholder="Şirket (opsiyonel)"
        />
        <input
          v-model="visitor.position"
          type="text"
          placeholder="Pozisyon (opsiyonel)"
        />

        <div class="modal-buttons">
          <button class="btn-secondary" @click="skipVisitorInfo">
            Geç
          </button>
          <button class="btn-primary" @click="submitVisitorInfo">
            Gönder
          </button>
        </div>
      </div>
    </div>

    <!-- Floating Agent Button - Form gönderilene kadar göster -->
    <button
      v-if="!showVisitorModal && !formSubmitted"
      class="floating-agent"
      @click="showVisitorModal = true"
      title="İletişime geç!"
    >
      <span class="agent-icon">👋</span>
      <span class="agent-badge">Merhaba!</span>
    </button>
  </div>
</template>
