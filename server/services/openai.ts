import OpenAI from "openai";

// Validate API key availability
if (!process.env.OPENAI_API_KEY) {
  console.error("OPENAI_API_KEY environment variable is required but not set");
}

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

interface ConflictDetectionResult {
  isConflictive: boolean;
  conflictLevel: 'low' | 'medium' | 'high';
  detectedKeywords: string[];
  legalRisk: boolean;
  sentimentScore: number;
  recommendedIndustryType?: 'healthcare' | 'legal' | 'consulting' | 'finance' | 'general';
  riskFactors: string[];
  suggestedResponseApproach: string;
}

export class OpenAIService {
  private readonly model = process.env.OPENAI_MODEL || "gpt-4o"; // Configurable model with safe fallback

  // API Key validation method
  private validateApiKey(): void {
    if (!process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY.trim() === '') {
      throw new Error("OPENAI_SERVICE_UNAVAILABLE");
    }
  }

  // Handle OpenAI errors and convert to our standard error
  private handleOpenAIError(error: any): Error {
    // Handle OpenAI authentication errors
    if (error.status === 401 || error.code === 'invalid_api_key') {
      return new Error("OPENAI_SERVICE_UNAVAILABLE");
    }
    // Handle other OpenAI errors
    if (error.status === 429) {
      return new Error("OPENAI_RATE_LIMITED");
    }
    if (error.status >= 500) {
      return new Error("OPENAI_SERVER_ERROR");
    }
    // Return original error for other cases
    return error;
  }

  // PII/PHI redaction functionality
  private redactPII(text: string): { redactedText: string; redactionMap: Map<string, string> } {
    const redactionMap = new Map<string, string>();
    let redactedText = text;

    // Email redaction
    const emailRegex = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g;
    let emailMatch;
    let emailCount = 1;
    while ((emailMatch = emailRegex.exec(text)) !== null) {
      const placeholder = `[EMAIL_${emailCount}]`;
      redactionMap.set(placeholder, emailMatch[0]);
      redactedText = redactedText.replace(emailMatch[0], placeholder);
      emailCount++;
    }

    // Phone number redaction (various formats)
    const phoneRegex = /(?:\+?1[-.\s]?)?(?:\(?[0-9]{3}\)?[-.\s]?[0-9]{3}[-.\s]?[0-9]{4}|\b[0-9]{3}[-.\s]?[0-9]{3}[-.\s]?[0-9]{4}\b|\b[0-9]{3}[-.\s]?[0-9]{4}\b)/g;
    let phoneMatch;
    let phoneCount = 1;
    while ((phoneMatch = phoneRegex.exec(redactedText)) !== null) {
      const placeholder = `[PHONE_${phoneCount}]`;
      redactionMap.set(placeholder, phoneMatch[0]);
      redactedText = redactedText.replace(phoneMatch[0], placeholder);
      phoneCount++;
    }

    // Name redaction (common patterns in reviews - assumes names preceded by "Dr.", "Mr.", "Ms.", "Mrs.", etc.)
    const titleNameRegex = /\b(?:Dr|Doctor|Mr|Ms|Mrs|Miss)\.?\s+[A-Z][a-z]+(?:\s+[A-Z][a-z]+)?\b/g;
    let nameMatch;
    let nameCount = 1;
    while ((nameMatch = titleNameRegex.exec(redactedText)) !== null) {
      const placeholder = `[NAME_${nameCount}]`;
      redactionMap.set(placeholder, nameMatch[0]);
      redactedText = redactedText.replace(nameMatch[0], placeholder);
      nameCount++;
    }

    // Address patterns (basic street addresses)
    const addressRegex = /\b\d+\s+[A-Za-z\s]+(Street|St|Avenue|Ave|Road|Rd|Boulevard|Blvd|Lane|Ln|Drive|Dr|Way|Circle|Cir)\b/gi;
    let addressMatch;
    let addressCount = 1;
    while ((addressMatch = addressRegex.exec(redactedText)) !== null) {
      const placeholder = `[ADDRESS_${addressCount}]`;
      redactionMap.set(placeholder, addressMatch[0]);
      redactedText = redactedText.replace(addressMatch[0], placeholder);
      addressCount++;
    }

    // Medical record numbers or patient IDs
    const medicalIdRegex = /\b(?:patient|medical|record|ID|MRN)[\s#:]*[A-Z0-9]{6,}\b/gi;
    let medicalIdMatch;
    let medicalIdCount = 1;
    while ((medicalIdMatch = medicalIdRegex.exec(redactedText)) !== null) {
      const placeholder = `[MEDICAL_ID_${medicalIdCount}]`;
      redactionMap.set(placeholder, medicalIdMatch[0]);
      redactedText = redactedText.replace(medicalIdMatch[0], placeholder);
      medicalIdCount++;
    }

    return { redactedText, redactionMap };
  }

  private restorePII(text: string, redactionMap: Map<string, string>): string {
    let restoredText = text;
    for (const [placeholder, originalValue] of Array.from(redactionMap.entries())) {
      restoredText = restoredText.replace(new RegExp(placeholder.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'), originalValue);
    }
    return restoredText;
  }

  async generateLocalSEOContent(options: ContentGenerationOptions): Promise<GeneratedContent> {
    // Validate API key availability at runtime
    this.validateApiKey();

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
      throw this.handleOpenAIError(error);
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
    // Validate API key availability at runtime
    this.validateApiKey();

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
      throw this.handleOpenAIError(error);
    }
  }

  async analyzeLocalCompetitors(businessInfo: string, location: string, competitors: string[]): Promise<string> {
    // Validate API key availability at runtime
    this.validateApiKey();

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
      throw this.handleOpenAIError(error);
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
    customInstructions?: string,
    legalMode: boolean = false,
    industryType?: 'healthcare' | 'legal' | 'consulting' | 'finance' | 'general',
    conflictLevel?: 'low' | 'medium' | 'high'
  ): Promise<string> {
    // Validate API key availability at runtime
    this.validateApiKey();

    // Apply PII redaction to ALL sensitive text before OpenAI processing
    const { redactedText: redactedReviewText, redactionMap: reviewRedactionMap } = this.redactPII(reviewText);
    
    // CRITICAL: Redact reviewerName to prevent PII leak
    let redactedReviewerName: string | undefined;
    let reviewerRedactionMap = new Map<string, string>();
    if (reviewerName) {
      const { redactedText, redactionMap } = this.redactPII(reviewerName);
      redactedReviewerName = redactedText;
      reviewerRedactionMap = redactionMap;
    }

    // CRITICAL: Redact customInstructions to prevent PII leak
    let redactedCustomInstructions: string | undefined;
    let customInstructionsRedactionMap = new Map<string, string>();
    if (customInstructions) {
      const { redactedText, redactionMap } = this.redactPII(customInstructions);
      redactedCustomInstructions = redactedText;
      customInstructionsRedactionMap = redactionMap;
    }

    // Combine all redaction maps for restoration
    const combinedRedactionMap = new Map<string, string>([
      ...Array.from(reviewRedactionMap.entries()),
      ...Array.from(reviewerRedactionMap.entries()),
      ...Array.from(customInstructionsRedactionMap.entries())
    ]);

    const redactedBusinessName = businessName; // Business names are usually not PII
    const redactedBusinessType = businessType; // Business types are not PII
    
    const prompt = this.buildReviewResponsePrompt({
      businessName: redactedBusinessName,
      businessType: redactedBusinessType,
      reviewText: redactedReviewText,
      rating,
      reviewerName: redactedReviewerName,
      responseStyle,
      includeApology,
      includeCallToAction,
      customInstructions: redactedCustomInstructions,
      legalMode,
      industryType,
      conflictLevel
    });

    try {
      const systemPrompt = legalMode 
        ? this.getLegalModeSystemPrompt(industryType, conflictLevel)
        : `Eres un experto en gestión de reputación online para negocios locales. Tu especialidad es crear respuestas profesionales, empáticas y efectivas a reseñas de clientes que mejoren la imagen del negocio y fomenten más reseñas positivas. Siempre mantienes un tono profesional pero cálido.`;

      const response = await openai.chat.completions.create({
        model: this.model,
        messages: [
          {
            role: "system",
            content: systemPrompt
          },
          {
            role: "user",
            content: prompt
          }
        ],
        temperature: legalMode ? 0.5 : 0.7, // Más conservador en modo legal
        max_tokens: legalMode ? 400 : 300
      });

      const generatedResponse = response.choices[0].message.content || "";
      
      // Restore PII in the final response if present using combined redaction map
      return this.restorePII(generatedResponse, combinedRedactionMap);
    } catch (error) {
      console.error("Error generating review response:", error);
      throw this.handleOpenAIError(error);
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
    legalMode?: boolean;
    industryType?: 'healthcare' | 'legal' | 'consulting' | 'finance' | 'general';
    conflictLevel?: 'low' | 'medium' | 'high';
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
      customInstructions,
      legalMode = false,
      industryType,
      conflictLevel
    } = options;

    const ratingContext = rating >= 4 ? "positiva" : rating === 3 ? "neutral" : "negativa";
    const nameGreeting = reviewerName ? `${reviewerName}` : "estimado/a cliente";

    const legalModeInstructions = legalMode ? this.getLegalModeInstructions(industryType, conflictLevel) : '';

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
${legalMode ? `- MODO LEGAL ACTIVADO: Usar enfoque empático y legalmente apropiado` : ''}
${industryType ? `- INDUSTRIA: ${industryType}` : ''}
${conflictLevel ? `- NIVEL DE CONFLICTO: ${conflictLevel}` : ''}
${customInstructions ? `INSTRUCCIONES ESPECÍFICAS: ${customInstructions}` : ''}

GUÍAS PARA LA RESPUESTA:
1. ${rating >= 4 ? 'Agradecer la reseña positiva sinceramente' : 'Abordar las preocupaciones con empatía'}
2. ${rating >= 4 ? 'Reforzar los puntos positivos mencionados' : 'Mostrar compromiso con la mejora'}
3. Mencionar el nombre del negocio naturalmente
4. ${includeCallToAction ? 'Invitar a visitar nuevamente o recomendar a otros' : ''}
5. Mantener tono profesional pero cálido
6. Respuesta de 50-150 palabras máximo

${legalModeInstructions}

Responde solo con el texto de la respuesta, sin comillas ni formato adicional.
`;
  }

  // Legal Mode Support Methods
  private getLegalModeSystemPrompt(industryType?: string, conflictLevel?: string): string {
    const basePrompt = `Eres un especialista en comunicación de crisis y gestión de reputación para negocios que enfrentan reseñas potencialmente conflictivas o sensibles. Tu prioridad es crear respuestas empáticas, profesionales y legalmente apropiadas que demuestren responsabilidad sin admitir culpa legal.`;

    const industrySpecific = industryType ? this.getIndustrySpecificGuidance(industryType) : '';
    const conflictSpecific = conflictLevel ? this.getConflictLevelGuidance(conflictLevel) : '';

    return `${basePrompt}\n\n${industrySpecific}\n\n${conflictSpecific}`;
  }

  private getLegalModeInstructions(industryType?: string, conflictLevel?: string): string {
    return `
INSTRUCCIONES ESPECIALES PARA MODO LEGAL:
- NUNCA admitir culpa o responsabilidad legal directa
- Mostrar empatía genuina y preocupación por la experiencia del cliente
- Ofrecer diálogo constructivo y resolución offline si es apropiado
- Usar lenguaje neutro y profesional, evitar términos confrontacionales
- Enfocarse en valores del negocio y compromiso con la excelencia
- Sugerir contacto directo para resolver preocupaciones específicas
- Evitar detalles específicos del caso que puedan ser problemáticos legalmente
${conflictLevel === 'high' ? '\n- NIVEL ALTO: Respuesta extremadamente cautelosa y empática' : ''}
${industryType === 'healthcare' ? '\n- Considerar privacidad médica y regulaciones HIPAA' : ''}
${industryType === 'legal' ? '\n- Mantener confidencialidad abogado-cliente y estándares éticos' : ''}
`;
  }

  private getIndustrySpecificGuidance(industryType: string): string {
    const guidance = {
      healthcare: `SECTOR SALUD: Mantén estricta confidencialidad médica. Nunca discutas detalles médicos específicos. Enfócate en el compromiso con la atención de calidad y la seguridad del paciente. Sugiere comunicación privada para abordar preocupaciones específicas.`,
      legal: `SERVICIOS LEGALES: Respeta la confidencialidad abogado-cliente. Evita discutir detalles del caso. Enfócate en los valores profesionales y el compromiso con la justicia. Ofrece una conversación privada para aclarar malentendidos.`,
      consulting: `CONSULTORÍA: Mantén la confidencialidad del proyecto. Evita revelar información propietaria o detalles de metodologías. Enfócate en el compromiso con resultados de calidad y satisfacción del cliente.`,
      finance: `SERVICIOS FINANCIEROS: Respeta la privacidad financiera del cliente. Evita discutir transacciones específicas. Enfócate en el compromiso con la transparencia y el servicio fiduciario responsable.`,
      general: `NEGOCIO GENERAL: Mantén profesionalismo y enfócate en los valores fundamentales del negocio: calidad, servicio al cliente y mejora continua.`
    };

    return guidance[industryType as keyof typeof guidance] || guidance.general;
  }

  private getConflictLevelGuidance(conflictLevel: string): string {
    const guidance = {
      low: `CONFLICTO BAJO: Respuesta estándar empática con énfasis en la resolución constructiva.`,
      medium: `CONFLICTO MEDIO: Mayor cuidado en el lenguaje. Enfatizar el diálogo y la comprensión mutua.`,
      high: `CONFLICTO ALTO: Máxima precaución legal. Respuesta muy empática pero extremadamente cautelosa. Enfocar en la resolución offline y el compromiso con la excelencia.`
    };

    return guidance[conflictLevel as keyof typeof guidance] || guidance.low;
  }

  // Enhanced Legal Keyword Detection
  private detectLegalKeywords(text: string): { keywords: string[]; riskScore: number } {
    const legalKeywords = [
      // Legal action terms
      'demanda', 'lawsuit', 'abogado', 'lawyer', 'legal', 'corte', 'court', 'juicio', 'trial',
      'tribunal', 'denuncia', 'complaint', 'acción legal', 'legal action', 'pleito',
      
      // Negligence and malpractice
      'negligencia', 'negligence', 'malpractice', 'malpráctica', 'culpa', 'fault', 'blame',
      'responsabilidad', 'responsibility', 'liable', 'responsible',
      
      // Damages and compensation
      'daños', 'damages', 'compensación', 'compensation', 'reembolso', 'refund',
      'indemnización', 'indemnity', 'pérdidas', 'losses', 'perjuicio', 'harm',
      
      // Medical/Healthcare specific
      'muerte', 'death', 'lesión', 'injury', 'accidente', 'accident', 'emergency',
      'emergencia', 'malpractice médica', 'medical malpractice', 'error médico', 'medical error',
      
      // Financial damages
      'fraude', 'fraud', 'robo', 'theft', 'estafa', 'scam', 'engaño', 'deception',
      
      // Threats and aggressive language
      'voy a demandar', 'will sue', 'reportar', 'report', 'autoridades', 'authorities',
      'regulador', 'regulator', 'inspección', 'inspection', 'multa', 'fine'
    ];

    const detectedKeywords: string[] = [];
    const lowerText = text.toLowerCase();
    
    for (const keyword of legalKeywords) {
      if (lowerText.includes(keyword.toLowerCase())) {
        detectedKeywords.push(keyword);
      }
    }

    // Calculate risk score based on keywords and context
    let riskScore = 0;
    riskScore += detectedKeywords.length * 0.2; // Base score per keyword
    
    // Higher weight for more serious terms
    const highRiskTerms = ['demanda', 'lawsuit', 'abogado', 'lawyer', 'negligencia', 'negligence', 'muerte', 'death', 'fraude', 'fraud'];
    for (const term of highRiskTerms) {
      if (detectedKeywords.includes(term)) {
        riskScore += 0.3;
      }
    }

    return { keywords: detectedKeywords, riskScore: Math.min(riskScore, 1) };
  }

  // Conflict Detection Method
  async detectConflictiveReview(
    reviewText: string,
    rating: number,
    businessType: string
  ): Promise<ConflictDetectionResult> {
    // Validate API key availability at runtime
    this.validateApiKey();

    // Apply PII redaction before analysis
    const { redactedText: redactedReviewText } = this.redactPII(reviewText);
    
    // Pre-analyze for legal keywords
    const { keywords: detectedKeywords, riskScore } = this.detectLegalKeywords(redactedReviewText);
    
    const prompt = `
Analiza esta reseña para determinar si es conflictiva o sensible desde una perspectiva legal y de gestión de reputación:

RESEÑA: "${redactedReviewText}"
CALIFICACIÓN: ${rating}/5 estrellas
TIPO DE NEGOCIO: ${businessType}
KEYWORDS LEGALES DETECTADAS: ${detectedKeywords.join(', ') || 'Ninguna'}

Evalúa específicamente:
1. Presencia de palabras clave conflictivas adicionales no detectadas inicialmente
2. Tono agresivo, amenazante o difamatorio
3. Menciones de daños específicos, compensación, acciones legales
4. Acusaciones de negligencia o mala práctica profesional
5. Amenazas explícitas o implícitas de acciones legales
6. Lenguaje que sugiere daños físicos, emocionales o financieros
7. Contexto que requiere respuesta legal especializada

IMPORTANTE: Considera el contexto del negocio (${businessType}) para evaluar el riesgo apropiadamente.

Responde en formato JSON con la siguiente estructura:
{
  "isConflictive": boolean,
  "conflictLevel": "low" | "medium" | "high",
  "detectedKeywords": ["palabra1", "palabra2"],
  "legalRisk": boolean,
  "sentimentScore": número entre -1 (muy negativo) y 1 (muy positivo),
  "recommendedIndustryType": "healthcare" | "legal" | "consulting" | "finance" | "general",
  "riskFactors": ["factor1", "factor2"],
  "suggestedResponseApproach": "descripción del enfoque recomendado"
}
`;

    try {
      const response = await openai.chat.completions.create({
        model: this.model,
        messages: [
          {
            role: "system",
            content: "Eres un experto en análisis de riesgo legal y gestión de crisis de reputación. Tu especialidad es identificar contenido potencialmente conflictivo que requiere respuestas especializadas, considerando implicaciones legales, regulatorias y de responsabilidad profesional."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        response_format: { type: "json_object" },
        temperature: 0.3, // Muy conservador para análisis consistente
        max_tokens: 600
      });

      const result = JSON.parse(response.choices[0].message.content || "{}");
      
      // Enhance result with pre-detected keywords
      const enhancedResult = {
        ...result,
        detectedKeywords: Array.from(new Set([...detectedKeywords, ...(result.detectedKeywords || [])])),
      };
      
      return this.validateConflictDetectionResult(enhancedResult);
    } catch (error) {
      console.error("Error detecting conflictive review:", error);
      throw this.handleOpenAIError(error);
    }
  }

  private validateConflictDetectionResult(result: any): ConflictDetectionResult {
    return {
      isConflictive: Boolean(result.isConflictive),
      conflictLevel: ['low', 'medium', 'high'].includes(result.conflictLevel) ? result.conflictLevel : 'low',
      detectedKeywords: Array.isArray(result.detectedKeywords) ? result.detectedKeywords : [],
      legalRisk: Boolean(result.legalRisk),
      sentimentScore: typeof result.sentimentScore === 'number' ? Math.max(-1, Math.min(1, result.sentimentScore)) : 0,
      recommendedIndustryType: ['healthcare', 'legal', 'consulting', 'finance', 'general'].includes(result.recommendedIndustryType) 
        ? result.recommendedIndustryType 
        : undefined,
      riskFactors: Array.isArray(result.riskFactors) ? result.riskFactors : [],
      suggestedResponseApproach: result.suggestedResponseApproach || "Respuesta estándar empática"
    };
  }
}

export const openaiService = new OpenAIService();