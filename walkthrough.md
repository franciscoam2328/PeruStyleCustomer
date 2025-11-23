# Guía de Ejecución y Despliegue - PeruStyle

Este documento detalla los pasos para poner en marcha la plataforma **PeruStyle** en tu entorno local y prepararla para producción.

## 1. Requisitos Previos

*   Node.js instalado (v18+ recomendado).
*   Cuenta en [Supabase](https://supabase.com/).
*   Cuenta en [PayPal Developer](https://developer.paypal.com/) (para Sandbox).
*   Cuenta en [Vercel](https://vercel.com/) (opcional, para despliegue).

## 2. Configuración de Base de Datos (Supabase)

1.  Crea un nuevo proyecto en Supabase.
2.  Ve al **SQL Editor** y ejecuta el script contenido en `supabase/schema.sql`. Esto creará:
    *   Tablas: `profiles`, `designs`, `orders`.
    *   Políticas de Seguridad (RLS).
    *   Triggers para creación automática de perfiles.
3.  Ve a **Storage** y crea dos buckets públicos:
    *   `designs`
    *   `avatars`

## 3. Configuración de Variables de Entorno

Crea un archivo `.env.local` en la raíz del proyecto (o configúralas en Vercel) con las siguientes claves:

```env
# Supabase (Obtener en Project Settings -> API)
NEXT_PUBLIC_SUPABASE_URL=https://tu-proyecto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu-anon-key-publica

# PayPal (Obtener en Developer Dashboard -> Apps & Credentials)
PAYPAL_CLIENT_ID=tu-client-id-sandbox
PAYPAL_CLIENT_SECRET=tu-client-secret-sandbox
```

> **Nota**: Para el frontend, asegúrate de reemplazar las constantes en `src/js/supabase.js` si no estás usando un bundler que inyecte `process.env` automáticamente (Vercel lo hace, pero localmente podrías necesitar Vite o configurar manualmente).

## 4. Ejecución Local

1.  Instala las dependencias:
    ```bash
    npm install
    ```

2.  Compila los estilos de Tailwind:
    ```bash
    npm run build
    ```

3.  Para simular el entorno Serverless de Vercel localmente, se recomienda usar Vercel CLI:
    ```bash
    npm i -g vercel
    vercel dev
    ```
    O simplemente usa un servidor estático para el frontend (aunque las funciones API `/api/...` no funcionarán sin Vercel CLI o un servidor Node custom):
    ```bash
    npx serve .
    ```

## 5. Despliegue en Vercel

1.  Sube tu código a GitHub.
2.  Importa el repositorio en Vercel.
3.  En la configuración del proyecto en Vercel, añade las **Variables de Entorno** definidas en el paso 3.
4.  ¡Despliega! Vercel detectará automáticamente la configuración `vercel.json`.

## 6. Flujos de Prueba

### Cliente
1.  Regístrate con un correo nuevo.
2.  Ve a **Diseñar**, personaliza la prenda y guarda el diseño.
3.  Ve a **Planes**, selecciona un plan de pago y completa el flujo de PayPal (Sandbox).
4.  Ve a **Mis Pedidos** para ver el historial.

### Confeccionista
1.  Regístrate con otro correo.
2.  En la base de datos (Supabase), cambia manualmente el rol de este usuario a `maker` en la tabla `profiles` (o crea una pantalla de admin si lo prefieres).
3.  Inicia sesión y accede al **Panel Confeccionista**.
4.  Gestiona los pedidos asignados.

## Estructura del Proyecto

*   `api/`: Backend Serverless (Node.js).
*   `src/`: Frontend (HTML, JS, Tailwind).
*   `supabase/`: Scripts de base de datos.
*   `public/`: Assets estáticos.
