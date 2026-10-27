# LinguaSegment - CRM & Plataforma de Segmentación y Gestión de Idiomas

Sistema integral para academias de idiomas con segmentación por **Machine Learning** (K-Means/RFM pedagógico), **Segmentación de Mercadeo** (campañas y prospectos comerciales), pasarela de pagos de costo $0 (**Bre-B, Nequi y Daviplata**), módulo de **Enseñanza Infantil** y agendamiento de clases con recordatorios por WhatsApp y Email.

---

## 🚀 Características Principales

1. **Dashboard General**: Métricas clave en tiempo real, ingresos mensuales proyectados ($40.000.000 COP para 200 estudiantes a $200.000 COP/mes).
2. **Segmentación Machine Learning**: Agrupación automática según desempeño, constancia, retención y nivel de riesgo académico.
3. **Módulo de Mercadeo y Prospectos**: Base de datos flexible (hasta 500 prospectos) para adquisición comercial de nuevos estudiantes.
4. **Enseñanza Infantil**: Módulo adaptativo con gamificación, estrellas pedagógicas y reportes para acudientes/padres de familia.
5. **Módulo de Pagos con Bre-B (Costo $0)**:
   - Integración con el nuevo sistema del Banco de la República de Colombia (**Bre-B**).
   - Códigos QR y llaves para **Nequi** y **Daviplata** sin comisiones por transacción.
   - Generación de recibos de pago oficiales y botón de cobro directo por **WhatsApp en 1 clic**.
6. **Agendamiento y Recordatorios**: Programación de clases individuales y grupales con plantillas de mensajería instantánea.
7. **Centro de Reportes**: Exportación a CSV de estudiantes, prospectos, progreso pedagógico y recaudo de pagos.

---

## 🛠️ Tecnologías Utilizadas

- **Framework**: React 19 + TypeScript
- **Bundler**: Vite
- **Estilos**: Tailwind CSS 4
- **Iconos**: Lucide React
- **Gráficos**: Recharts
- **Algoritmos**: K-Means clustering, Scoring RFM ponderado

---

## 💻 Instalación y Ejecución Local

1. **Clonar el repositorio:**
   ```bash
   git clone https://github.com/rubenmoncadaamaya-cyber/linguasegment-app.git
   cd linguasegment-app
   ```

2. **Instalar dependencias:**
   ```bash
   npm install
   ```

3. **Iniciar en modo desarrollo:**
   ```bash
   npm run dev
   ```
   Abre [http://localhost:3000](http://localhost:3000) en tu navegador.

4. **Compilar para producción:**
   ```bash
   npm run build
   ```
   Genera los archivos listos para producción en la carpeta `dist/`.

---

## 🌐 Publicación en GitHub y Despliegue en Producción

### 1. Vincular a tu GitHub (@rubenmoncadaamaya-cyber)
```bash
git remote add origin https://github.com/rubenmoncadaamaya-cyber/linguasegment-app.git
git branch -M main
git push -u origin main
```

### 2. Despliegue Gratuito en Vercel
1. Ingresa a [Vercel](https://vercel.com) e inicia sesión con tu usuario de GitHub `rubenmoncadaamaya-cyber`.
2. Haz clic en **Add New Project** y selecciona `linguasegment-app`.
3. Framework Preset: **Vite**.
4. Haz clic en **Deploy**. ¡Tu aplicación estará en línea con HTTPS gratuito en 1 minuto!

---

Desarrollado para academias de idiomas en Colombia.
