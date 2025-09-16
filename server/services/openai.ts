import OpenAI from "openai";

// the newest OpenAI model is "gpt-5" which was released August 7, 2025. do not change this unless explicitly requested by the user
const openai = new OpenAI({ 
  apiKey: process.env.OPENAI_API_KEY 
});

interface ContentGenerationOptions {
  contentType: string;
  keywords: string;
  businessInfo: string;
  location?: string;
  businessType?: string;
  targetAudience?: string;
  competitors?: string[];
  localEvents?: string[];
  voiceSearchOptimized?: boolean;
}

interface GeneratedContent {
  title: string;
  content: string;
  metaDescription: string;
  localKeywords: string[];
  voiceSearchQueries: string[];
  competitorAnalysis?: string;
  localOptimizationTips: string[];
}

export class OpenAIService {
  private readonly model = "gpt-5"; // the newest OpenAI model is "gpt-5" which was released August 7, 2025

  async generateLocalSEOContent(options: ContentGenerationOptions): Promise<GeneratedContent> {
    const {
      contentType,
      keywords,
      businessInfo,
      location,
      businessType,
      targetAudience,
      competitors = [],
      localEvents = [],
      voiceSearchOptimized = false
    } = options;

    const prompt = this.buildLocalSEOPrompt(options);

    try {
      const response = await openai.chat.completions.create({
        model: this.model,
        messages: [
          {
            role: "system",
            content: `Eres un experto en SEO local y marketing digital para negocios locales. Tu especialidad es crear contenido que aparezca en búsquedas locales de Google, Google My Business, y búsquedas por voz. Siempre incluyes términos geográficos específicos, optimize for "near me" searches, y considera la intención local del usuario.`
          },
          {
            role: "user",
            content: prompt
          }
        ],
        response_format: { type: "json_object" },
        temperature: 0.7,
        max_tokens: 2000
      });

      const result = JSON.parse(response.choices[0].message.content || "{}");
      return this.validateAndFormatResponse(result);
    } catch (error) {
      console.error("Error generating content with OpenAI:", error);
      throw new Error("Failed to generate SEO content");
    }
  }

  private buildLocalSEOPrompt(options: ContentGenerationOptions): string {
    const {
      contentType,
      keywords,
      businessInfo,
      location,
      businessType,
      targetAudience,
      competitors = [],
      localEvents = [],
      voiceSearchOptimized
    } = options;

    return `
Genera contenido SEO optimizado para búsquedas locales con la siguiente información:

TIPO DE CONTENIDO: ${contentType}
PALABRAS CLAVE: ${keywords}
INFORMACIÓN DEL NEGOCIO: ${businessInfo}
${location ? `UBICACIÓN: ${location}` : ''}
${businessType ? `TIPO DE NEGOCIO: ${businessType}` : ''}
${targetAudience ? `AUDIENCIA OBJETIVO: ${targetAudience}` : ''}
${competitors && competitors.length > 0 ? `COMPETIDORES: ${competitors.join(', ')}` : ''}
${localEvents && localEvents.length > 0 ? `EVENTOS LOCALES RELEVANTES: ${localEvents.join(', ')}` : ''}
${voiceSearchOptimized ? 'OPTIMIZAR PARA BÚSQUEDAS POR VOZ: Sí' : ''}

REQUISITOS ESPECÍFICOS PARA SEO LOCAL:
1. Incluir términos geográficos específicos y referencias locales
2. Optimizar para búsquedas "cerca de mí" y "en [ciudad]"
3. Usar lenguaje natural para búsquedas por voz si está habilitado
4. Incluir información relevante para Google My Business
5. Considerar la intención local del usuario (direcciones, horarios, contacto)
6. Incorporar eventos locales si están disponibles
7. Usar long-tail keywords específicas de la ubicación

Responde en formato JSON con la siguiente estructura:
{
  "title": "Título SEO optimizado (max 60 caracteres)",
  "content": "Contenido completo en formato markdown",
  "metaDescription": "Meta descripción (max 160 caracteres)",
  "localKeywords": ["array", "de", "keywords", "locales"],
  "voiceSearchQueries": ["ejemplos", "de", "preguntas", "por", "voz"],
  "competitorAnalysis": "Breve análisis de la competencia local (opcional)",
  "localOptimizationTips": ["tip1", "tip2", "tip3"]
}
`;
  }

  private validateAndFormatResponse(response: any): GeneratedContent {
    return {
      title: response.title || "Título generado",
      content: response.content || "Contenido generado",
      metaDescription: response.metaDescription || "Descripción generada",
      localKeywords: Array.isArray(response.localKeywords) ? response.localKeywords : [],
      voiceSearchQueries: Array.isArray(response.voiceSearchQueries) ? response.voiceSearchQueries : [],
      competitorAnalysis: response.competitorAnalysis || "",
      localOptimizationTips: Array.isArray(response.localOptimizationTips) ? response.localOptimizationTips : []
    };
  }

  async generateGoogleMyBusinessPost(businessInfo: string, occasion: string, location: string): Promise<string> {
    const prompt = `
Crea un post optimizado para Google My Business para un negocio con la siguiente información:

NEGOCIO: ${businessInfo}
OCASIÓN/TEMA: ${occasion}
UBICACIÓN: ${location}

El post debe:
- Ser atractivo y promocional
- Incluir call-to-action
- Mencionar la ubicación
- Ser entre 100-300 caracteres
- Incluir emojis relevantes
- Optimizar para engagement local

Responde solo con el texto del post, sin comillas ni formato adicional.
`;

    try {
      const response = await openai.chat.completions.create({
        model: this.model,
        messages: [
          {
            role: "system",
            content: "Eres un experto en marketing para Google My Business. Creas posts que generan engagement y conversiones para negocios locales."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        temperature: 0.8,
        max_tokens: 150
      });

      return response.choices[0].message.content || "";
    } catch (error) {
      console.error("Error generating GMB post:", error);
      throw new Error("Failed to generate Google My Business post");
    }
  }

  async analyzeLocalCompetitors(businessInfo: string, location: string, competitors: string[]): Promise<string> {
    const prompt = `
Analiza la competencia local para:

NEGOCIO: ${businessInfo}
UBICACIÓN: ${location}
COMPETIDORES: ${competitors.join(', ')}

Proporciona:
1. Análisis de fortalezas y debilidades
2. Oportunidades de diferenciación
3. Estrategias SEO locales recomendadas
4. Keywords locales que deberían targeting

Responde en formato markdown con máximo 300 palabras.
`;

    try {
      const response = await openai.chat.completions.create({
        model: this.model,
        messages: [
          {
            role: "system",
            content: "Eres un analista de mercado especializado en competencia local y SEO. Proporcionas insights accionables para negocios locales."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        temperature: 0.6,
        max_tokens: 500
      });

      return response.choices[0].message.content || "";
    } catch (error) {
      console.error("Error analyzing competitors:", error);
      throw new Error("Failed to analyze local competitors");
    }
  }

  async generateReviewResponse(
    businessName: string,
    businessType: string,
    reviewText: string,
    rating: number,
    reviewerName?: string,
    responseStyle: 'professional' | 'friendly' | 'concise' | 'detailed' = 'professional',
    includeApology: boolean = false,
    includeCallToAction: boolean = true,
    customInstructions?: string
  ): Promise<string> {
    const prompt = this.buildReviewResponsePrompt({
      businessName,
      businessType,
      reviewText,
      rating,
      reviewerName,
      responseStyle,
      includeApology,
      includeCallToAction,
      customInstructions
    });

    try {
      const response = await openai.chat.completions.create({
        model: this.model,
        messages: [
          {
            role: "system",
            content: `Eres un experto en gestión de reputación online para negocios locales. Tu especialidad es crear respuestas profesionales, empáticas y efectivas a reseñas de clientes que mejoren la imagen del negocio y fomenten más reseñas positivas. Siempre mantienes un tono profesional pero cálido.`
          },
          {
            role: "user",
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: 300
      });

      return response.choices[0].message.content || "";
    } catch (error) {
      console.error("Error generating review response:", error);
      throw new Error("Failed to generate review response");
    }
  }

  private buildReviewResponsePrompt(options: {
    businessName: string;
    businessType: string;
    reviewText: string;
    rating: number;
    reviewerName?: string;
    responseStyle: string;
    includeApology: boolean;
    includeCallToAction: boolean;
    customInstructions?: string;
  }): string {
    const {
      businessName,
      businessType,
      reviewText,
      rating,
      reviewerName,
      responseStyle,
      includeApology,
      includeCallToAction,
      customInstructions
    } = options;

    const ratingContext = rating >= 4 ? "positiva" : rating === 3 ? "neutral" : "negativa";
    const nameGreeting = reviewerName ? `${reviewerName}` : "estimado/a cliente";

    return `
Genera una respuesta ${responseStyle} para esta reseña ${ratingContext}:

NEGOCIO: ${businessName} (${businessType})
RESEÑA: "${reviewText}"
CALIFICACIÓN: ${rating}/5 estrellas
${reviewerName ? `NOMBRE DEL REVIEWER: ${reviewerName}` : ''}

CONFIGURACIÓN DE RESPUESTA:
- Estilo: ${responseStyle}
- ${includeApology && rating < 4 ? 'Incluir disculpa si es apropiado' : 'No incluir disculpa'}
- ${includeCallToAction ? 'Incluir llamada a la acción' : 'Sin llamada a la acción'}
${customInstructions ? `INSTRUCCIONES ESPECÍFICAS: ${customInstructions}` : ''}

GUÍAS PARA LA RESPUESTA:
1. ${rating >= 4 ? 'Agradecer la reseña positiva sinceramente' : 'Abordar las preocupaciones con empatía'}
2. ${rating >= 4 ? 'Reforzar los puntos positivos mencionados' : 'Mostrar compromiso con la mejora'}
3. Mencionar el nombre del negocio naturalmente
4. ${includeCallToAction ? 'Invitar a visitar nuevamente o recomendar a otros' : ''}
5. Mantener tono profesional pero cálido
6. Respuesta de 50-150 palabras máximo

Responde solo con el texto de la respuesta, sin comillas ni formato adicional.
`;
  }
}

export const openaiService = new OpenAIService();