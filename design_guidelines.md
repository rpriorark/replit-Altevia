# Visibilia - Plataforma SaaS de Visibilidad Digital
## Guías de Diseño Completas

## Enfoque de Diseño Seleccionado
**Enfoque Basado en Referencias** - Inspirado en plataformas SaaS modernas como Linear, Notion y Vercel, con énfasis en la productividad y gestión empresarial. La plataforma requiere una estética profesional que transmita confianza y sofisticación tecnológica.

## Elementos de Diseño Core

### A. Paleta de Colores
**Modo Oscuro (Principal):**
- Primario: 210 100% 65% (azul tecnológico vibrante)
- Fondo principal: 222 84% 5% (gris carbón profundo)
- Superficie: 217 33% 17% (gris slate)
- Texto primario: 210 40% 98% (blanco cálido)
- Texto secundario: 215 16% 65% (gris claro)

**Modo Claro:**
- Primario: 210 100% 50%
- Fondo: 0 0% 100%
- Superficie: 210 40% 98%
- Texto primario: 222 84% 5%

**Acentos:**
- Éxito: 142 76% 36% (verde confianza)
- Advertencia: 38 92% 50% (naranja alerta)
- Error: 0 84% 60% (rojo crítico)

### B. Tipografía
**Fuentes Primarias:**
- Encabezados: Inter (600-700 weight)
- Cuerpo: Inter (400-500 weight)
- Código/Métricas: JetBrains Mono (400 weight)

**Jerarquía:**
- H1: 48px/52px (landing hero)
- H2: 36px/40px (secciones principales)
- H3: 24px/28px (subsecciones)
- Body: 16px/24px (contenido general)
- Small: 14px/20px (metadatos)

### C. Sistema de Layout
**Espaciado Tailwind:** Usar únicamente unidades 2, 4, 6, 8, 12, 16 para consistencia
- Componentes pequeños: p-2, m-4
- Secciones medianas: p-6, gap-8
- Contenedores principales: p-8, m-12
- Separaciones grandes: mb-16

### D. Librería de Componentes

**Navegación:**
- Header con logo Visibilia, navegación horizontal y avatar de usuario
- Sidebar colapsible para dashboard con iconos de módulos principales

**Elementos de Datos:**
- Cards con bordes sutiles y sombras suaves para métricas
- Tablas responsive para gestión de reseñas
- Gráficos de líneas para evolución de reputación
- Progress bars para límites de plan

**Formularios:**
- Inputs con focus states pronunciados
- Dropdowns con búsqueda para selección de palabras clave
- Textareas grandes para generación de contenido
- Toggles para configuraciones de automatización

**Overlays:**
- Modales centrados para configuración de respuestas automáticas
- Tooltips informativos para métricas complejas
- Alerts discretos para notificaciones de sistema

### E. Tratamiento Visual Específico

**Dashboard Principal:**
- Layout de grilla 3-columna en desktop, stack en móvil
- Cards elevadas con gradiente sutil hacia el borde
- Métricas destacadas con tipografía grande y colores de estado

**Generador de Contenido SEO:**
- Editor de texto expandido con preview en tiempo real
- Toolbar horizontal con opciones de IA
- Panel lateral para configuración de palabras clave

**Gestión de Reseñas:**
- Vista de lista con avatars de clientes y ratings visuales
- Sistema de filtros horizontal
- Respuestas sugeridas por IA en cards separadas

## Imágenes

### Hero Landing Page
- **Imagen Principal:** Dashboard mockup mostrando métricas de visibilidad en pantalla laptop moderna
- **Ubicación:** Hero section, lado derecho en desktop
- **Estilo:** Screenshot estilizado con gradiente overlay y sombra pronunciada

### Secciones de Características
- **Iconografía:** Usar Heroicons para consistencia
- **Ilustraciones:** Elementos SVG minimalistas para representar automatización y crecimiento
- **Sin imágenes stock:** Priorizar gráficos y mockups de interfaz

### Dashboard
- **Gráficos:** Visualizaciones de datos limpias con la paleta de colores establecida
- **Estados vacíos:** Ilustraciones sutiles con CTAs claros
- **Avatares:** Placeholders circulares con iniciales para usuarios

La plataforma debe proyectar sofisticación tecnológica y confiabilidad empresarial, con un equilibrio entre funcionalidad avanzada y simplicidad de uso.