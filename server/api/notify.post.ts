import { Resend } from 'resend'

interface Message {
  role: 'user' | 'assistant'
  content: string
}

interface NotifyRequest {
  visitor: {
    name: string
    email: string
    phone: string
    company: string
    position: string
  }
  messages: Message[]
}

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  const body = await readBody<NotifyRequest>(event)

  // Resend API key yoksa sessizce çık
  if (!config.resendApiKey || !config.notificationEmail) {
    console.log('Email notification skipped: Missing configuration')
    return { success: false, reason: 'not_configured' }
  }

  try {
    const resend = new Resend(config.resendApiKey)

    const visitorInfo = body.visitor
    const messageHistory = body.messages
      .map(m => `${m.role === 'user' ? '👤 Ziyaretçi' : '🤖 Bot'}: ${m.content}`)
      .join('\n\n')

    const emailContent = `
# 🎉 Yeni Özgeçmiş Ziyaretçisi!

## Ziyaretçi Bilgileri
- **İsim:** ${visitorInfo.name || 'Belirtilmedi'}
- **E-posta:** ${visitorInfo.email || 'Belirtilmedi'}
- **Telefon:** ${visitorInfo.phone || 'Belirtilmedi'}
- **Şirket:** ${visitorInfo.company || 'Belirtilmedi'}
- **Pozisyon:** ${visitorInfo.position || 'Belirtilmedi'}

## Sohbet Geçmişi
${messageHistory}

---
*Bu email resume-chatbot tarafından otomatik gönderilmiştir.*
    `.trim()

    // Birden fazla email adresini destekle
    const emailAddresses = config.notificationEmail.split(',').map((e: string) => e.trim())

    await resend.emails.send({
      from: 'Resume Chatbot <onboarding@resend.dev>',
      to: emailAddresses,
      subject: `🎯 Yeni Ziyaretçi: ${visitorInfo.name || 'Anonim'} ${visitorInfo.company ? `(${visitorInfo.company})` : ''}`,
      text: emailContent
    })

    return { success: true }
  } catch (error: any) {
    console.error('Email send error:', error)
    return { success: false, reason: error.message }
  }
})
