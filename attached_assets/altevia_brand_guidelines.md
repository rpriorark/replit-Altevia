# 🎨 ALTEVIA - BRAND GUIDELINES & VISUAL IDENTITY
## Para Video Promocional y Marketing Materials

---

## **LOGO & MARCA**

### Logo Principal
- **Archivo:** `Altevia_logo_design_2c146ee7.png`
- **Simbolismo:** "A" estilizada con flecha ascendente = Crecimiento y Progreso
- **Gradiente:** Magenta a Púrpura (#d946ef → #8b5cf6)
- **Uso:** Backgrounds claros y oscuros
- **Variantes:** Logo + texto, solo símbolo, horizontal, vertical

### Versiones del Logo:
1. **Completo:** Logo + "Altevia" texto
2. **Símbolo:** Solo la "A" para espacios reducidos
3. **Horizontal:** Para headers y footers
4. **Vertical:** Para sidebars y espacios estrechos

---

## **PALETA DE COLORES PRINCIPAL**

### Colores Primarios (HSL Format)
```css
/* PÚRPURA MARCA - Color principal */
--primary: 280 100% 60%;           /* #8b5cf6 */
--primary-dark: 280 100% 70%;      /* Para dark mode */
--primary-light: 280 100% 85%;     /* Versión clara */

/* MAGENTA ACCENT - Color secundario */
--magenta: 320 100% 60%;           /* #d946ef */
--magenta-light: 320 100% 85%;     /* Para highlights */

/* VERDE ÉXITO - Para resultados positivos */
--success: 142 85% 45%;            /* #22c55e */
--success-light: 142 85% 85%;      /* Para backgrounds */

/* ROJO ALERTA - Para problemas/urgencia */
--danger: 350 89% 60%;             /* #ef4444 */
--danger-light: 350 89% 85%;       /* Para warnings */

/* DORADO PREMIUM - Para ROI/valor */
--gold: 45 100% 60%;               /* #fbbf24 */
--gold-light: 45 100% 85%;         /* Para highlights */
```

### Colores de Fondo
```css
/* FONDOS CLAROS */
--bg-light: 0 0% 100%;             /* Blanco puro */
--surface-light: 280 20% 98%;      /* Gris muy claro */
--card-light: 280 25% 96%;         /* Cards/modales */

/* FONDOS OSCUROS */
--bg-dark: 280 50% 6%;             /* Azul muy oscuro */
--surface-dark: 280 40% 8%;        /* Superficies */
--card-dark: 280 45% 10%;          /* Cards oscuras */
```

### Colores de Texto
```css
/* TEXTOS CLAROS */
--text-primary-light: 222 84% 5%;     /* Negro cálido */
--text-secondary-light: 280 10% 40%;   /* Gris medio */
--text-muted-light: 280 5% 60%;        /* Gris claro */

/* TEXTOS OSCUROS */
--text-primary-dark: 280 15% 95%;      /* Blanco cálido */
--text-secondary-dark: 280 15% 70%;    /* Gris claro */
--text-muted-dark: 280 10% 50%;        /* Gris medio */
```

---

## **TIPOGRAFÍA**

### Fuente Principal: Inter
```css
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');

/* JERARQUÍA DE TEXTOS */
.hero-title {
    font-family: 'Inter', sans-serif;
    font-weight: 700;
    font-size: 48px;
    line-height: 1.1;
    letter-spacing: -0.02em;
}

.section-title {
    font-family: 'Inter', sans-serif;
    font-weight: 600;
    font-size: 36px;
    line-height: 1.2;
    letter-spacing: -0.01em;
}

.subtitle {
    font-family: 'Inter', sans-serif;
    font-weight: 500;
    font-size: 20px;
    line-height: 1.4;
}

.body-text {
    font-family: 'Inter', sans-serif;
    font-weight: 400;
    font-size: 16px;
    line-height: 1.6;
}

.small-text {
    font-family: 'Inter', sans-serif;
    font-weight: 400;
    font-size: 14px;
    line-height: 1.5;
}
```

### Reglas Tipográficas:
- **Títulos principales:** Bold (700), grandes, poco spacing
- **Subtítulos:** SemiBold (600), medianos, spacing normal
- **Texto de cuerpo:** Regular (400), legible, line-height 1.6
- **Textos pequeños:** Regular (400), compactos, para metadata

---

## **GRADIENTES MARCA**

### Gradiente Principal (Logo)
```css
background: linear-gradient(135deg, #d946ef 0%, #8b5cf6 100%);
```

### Gradiente Éxito (Resultados)
```css
background: linear-gradient(135deg, #22c55e 0%, #16a34a 100%);
```

### Gradiente Premium (ROI/Valor)
```css
background: linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%);
```

### Gradiente de Fondo Oscuro
```css
background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%);
```

---

## **SOMBRAS Y EFECTOS**

### Sombras para Cards/Elementos
```css
/* Sombra sutil */
box-shadow: 0 4px 12px rgba(139, 92, 246, 0.1);

/* Sombra media */
box-shadow: 0 8px 32px rgba(139, 92, 246, 0.15);

/* Sombra pronunciada */
box-shadow: 0 20px 40px rgba(139, 92, 246, 0.2);

/* Glow effect (para logos/CTAs) */
filter: drop-shadow(0 0 20px rgba(139, 92, 246, 0.5));
```

### Efectos de Hover
```css
/* Buttons y elementos interactivos */
.hover-effect:hover {
    transform: translateY(-2px);
    box-shadow: 0 12px 24px rgba(139, 92, 246, 0.2);
    transition: all 0.3s ease;
}

/* Glow en hover */
.glow-hover:hover {
    filter: drop-shadow(0 0 15px rgba(139, 92, 246, 0.6));
}
```

---

## **ICONOGRAFÍA & ELEMENTOS VISUALES**

### Icons Sistema
- **Librería:** Heroicons / Lucide React
- **Estilo:** Outline para elementos secundarios, Solid para principales
- **Tamaño:** 16px, 20px, 24px, 32px
- **Color:** Seguir paleta de colores (primary, success, danger)

### Elementos de Datos
```css
/* Métricas positivas */
.metric-positive {
    color: var(--success);
    background: rgba(34, 197, 94, 0.1);
    border: 1px solid rgba(34, 197, 94, 0.3);
}

/* Métricas negativas */
.metric-negative {
    color: var(--danger);
    background: rgba(239, 68, 68, 0.1);
    border: 1px solid rgba(239, 68, 68, 0.3);
}

/* Métricas neutrales */
.metric-neutral {
    color: var(--primary);
    background: rgba(139, 92, 246, 0.1);
    border: 1px solid rgba(139, 92, 246, 0.3);
}
```

---

## **COMPONENTES UI ESPECÍFICOS**

### Buttons
```css
/* Primary Button */
.btn-primary {
    background: linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%);
    color: white;
    border: none;
    padding: 12px 24px;
    border-radius: 8px;
    font-weight: 600;
    transition: all 0.3s ease;
}

/* Success Button */
.btn-success {
    background: linear-gradient(135deg, #22c55e 0%, #16a34a 100%);
    color: white;
    border: none;
    padding: 12px 24px;
    border-radius: 8px;
    font-weight: 600;
}

/* CTA Button (grande) */
.btn-cta {
    background: linear-gradient(135deg, #22c55e 0%, #16a34a 100%);
    color: white;
    border: none;
    padding: 20px 40px;
    border-radius: 12px;
    font-size: 20px;
    font-weight: 700;
    box-shadow: 0 10px 30px rgba(34, 197, 94, 0.3);
    animation: pulse 2s infinite;
}
```

### Cards
```css
.card {
    background: var(--card-bg);
    border: 1px solid var(--border-color);
    border-radius: 12px;
    padding: 24px;
    box-shadow: 0 4px 12px rgba(139, 92, 246, 0.08);
}

.card-metric {
    text-align: center;
    padding: 32px 24px;
}

.card-metric .value {
    font-size: 48px;
    font-weight: 700;
    line-height: 1;
    margin-bottom: 8px;
}

.card-metric .label {
    font-size: 16px;
    color: var(--text-secondary);
    margin-bottom: 16px;
}
```

---

## **ANIMACIONES BRAND**

### Animaciones de Entrada
```css
@keyframes slideInUp {
    from { transform: translateY(30px); opacity: 0; }
    to { transform: translateY(0); opacity: 1; }
}

@keyframes fadeInScale {
    from { transform: scale(0.9); opacity: 0; }
    to { transform: scale(1); opacity: 1; }
}

@keyframes logoGlow {
    0%, 100% { filter: drop-shadow(0 0 10px rgba(139, 92, 246, 0.5)); }
    50% { filter: drop-shadow(0 0 25px rgba(139, 92, 246, 0.8)); }
}
```

### Transiciones
```css
/* Transición estándar */
transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);

/* Transición bounce */
transition: all 0.5s cubic-bezier(0.68, -0.55, 0.265, 1.55);

/* Transición suave */
transition: all 0.4s ease-in-out;
```

---

## **APLICACIÓN EN VIDEO PROMOCIONAL**

### Frame 1 (Hook)
- **Background:** Gradiente oscuro (#1f2937 → #374151)
- **Texto:** Rojo alerta (#ef4444) para urgencia
- **Cards:** Fondo blanco con sombras sutiles

### Frame 2 (Problema)
- **Background:** Gradiente oscuro
- **Métricas:** Rojo (#ef4444) con backgrounds rojizos translúcidos
- **Texto:** Amarillo advertencia (#fbbf24)

### Frame 3 (Solución)
- **Background:** Gradiente azul oscuro (#0f172a → #1e293b)
- **Logo:** Gradiente principal con glow
- **Dashboard:** Screenshot real con overlay púrpura
- **Features:** Texto blanco con iconos púrpura

### Frame 4 (Resultados)
- **Background:** Mismo azul oscuro
- **Métricas:** Verde éxito (#22c55e) con backgrounds verdes
- **ROI Box:** Gradiente púrpura con texto blanco

### Frame 5 (CTA)
- **Background:** Gradiente púrpura principal
- **Logo:** Extra grande con pulse animation
- **Button:** Verde éxito con sombra prominente
- **Texto:** Blanco con texto dorado para urgencia

---

## **ASSETS EXPORTABLES**

### Para Herramientas Externas:
1. **Logo SVG:** Escalable para cualquier tamaño
2. **Paleta de colores:** Archivo .ase/.aco para Adobe
3. **Tipografía:** Google Fonts link
4. **Templates:** PSD/Sketch con componentes base
5. **Guidelines PDF:** Esta documentación en formato visual

### Formatos de Entrega:
- **PNG:** 24-bit con transparencia
- **SVG:** Para elementos escalables
- **MP4:** Preview del video promocional
- **CSS:** Variables y clases listas para usar

Esta brand guideline asegura consistencia visual total en el video promocional y futuras piezas de marketing de Altevia.