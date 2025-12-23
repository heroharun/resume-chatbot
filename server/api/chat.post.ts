import Groq from 'groq-sdk'
import resumeData from '~/data/resume.json'

interface Message {
  role: 'user' | 'assistant'
  content: string
}

interface ChatRequest {
  message: string
  history: Message[]
  visitor: {
    name: string
    company: string
    position: string
  } | null
}

const systemPrompt = `Sen Halit Enes Büyüktepe'nin interaktif özgeçmiş asistanısın. Ziyaretçilerin Halit Enes hakkında sorduğu sorulara cevap veriyorsun.

## Kurallar:
1. SADECE aşağıdaki özgeçmiş bilgilerine dayanarak cevap ver
2. Bilmediğin veya özgeçmişte olmayan konular hakkında tahmin yapma
3. Türkçe yanıt ver (kullanıcı İngilizce sorarsa İngilizce yanıt verebilirsin)
4. Samimi, profesyonel ve yardımsever ol
5. Yanıtları kısa ve öz tut (2-3 paragrafı geçme)
6. Teknik detayları sorulduğunda açıkla
7. İletişim bilgileri sorulduğunda paylaş

## Özgeçmiş Bilgileri:

### Kişisel Bilgiler:
- İsim: ${resumeData.personal.name}
- Ünvan: ${resumeData.personal.title}
- Lokasyon: ${resumeData.personal.location}
- Email: ${resumeData.personal.email}
- Telefon: ${resumeData.personal.phone}
- LinkedIn: ${resumeData.personal.linkedin}
- GitHub: ${resumeData.personal.github}

### Özet:
${resumeData.summary}

### Teknik Seviye:
${resumeData.technicalLevel}

### Yetenekler:
- Frontend: ${resumeData.skills.frontend.join(', ')}
- Backend: ${resumeData.skills.backend.join(', ')}
- Database: ${resumeData.skills.database.join(', ')}
- Tools: ${resumeData.skills.tools.join(', ')}
- Diğer: ${resumeData.skills.other.join(', ')}

### İş Deneyimi:
${resumeData.experience.map(exp => `
**${exp.company}** - ${exp.position} (${exp.period}, ${exp.duration})
${exp.description}
${exp.projects ? exp.projects.map(p => `- ${p.name}: ${p.description}`).join('\n') : ''}
Teknolojiler: ${exp.technologies.join(', ')}
`).join('\n')}

### Eğitim:
${resumeData.education.map(edu => `- ${edu.institution}: ${edu.degree} (${edu.year})`).join('\n')}

### Güçlü Yönler:
${resumeData.strengths.map(s => `- ${s}`).join('\n')}

### Proje Türleri:
${resumeData.projectTypes.map(p => `- ${p}`).join('\n')}

### Diller:
- Türkçe: ${resumeData.languages.turkish}
- İngilizce: ${resumeData.languages.english}
`

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  const body = await readBody<ChatRequest>(event)

  if (!config.groqApiKey) {
    throw createError({
      statusCode: 500,
      message: 'Groq API key is not configured'
    })
  }

  try {
    const groq = new Groq({ apiKey: config.groqApiKey })

    // Sohbet geçmişini oluştur
    const messages: { role: 'system' | 'user' | 'assistant'; content: string }[] = [
      { role: 'system', content: systemPrompt }
    ]

    // Geçmiş mesajları ekle
    body.history.forEach(msg => {
      messages.push({
        role: msg.role,
        content: msg.content
      })
    })

    // Yeni mesajı ekle
    messages.push({ role: 'user', content: body.message })

    const completion = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages,
      temperature: 0.7,
      max_tokens: 1024
    })

    const reply = completion.choices[0]?.message?.content || 'Üzgünüm, yanıt oluşturamadım.'

    return { reply }
  } catch (error: any) {
    console.error('Groq API error:', error)
    throw createError({
      statusCode: 500,
      message: error.message || 'Failed to generate response'
    })
  }
})
