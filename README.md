# Image Background Remover

A simple web app to remove image backgrounds using remove.bg API, built with Next.js 14, TypeScript, and Tailwind CSS. Deployed on Cloudflare Pages.

## Features

- 📤 Drag & drop image upload
- 🎨 Instant background removal
- ⬇️ Download transparent PNG
- 🔒 No image storage (all in memory)
- ☁️ Deployed on Cloudflare Pages

## Tech Stack

- **Frontend**: Next.js 14 (App Router), TypeScript, Tailwind CSS
- **Backend**: Cloudflare Pages Functions (Edge)
- **AI**: remove.bg API

## Getting Started

### 1. Clone & Install

```bash
npm install
```

### 2. Set Environment Variable

Create a `.env.local` file:

```bash
REMOVE_BG_API_KEY=your_remove_bg_api_key
```

Get your free API key at: https://www.remove.bg/api

### 3. Run Locally

```bash
npm run dev
```

Open http://localhost:3000

### 4. Deploy to Cloudflare Pages

```bash
npm run deploy
```

Or connect your GitHub repository to Cloudflare Pages:

1. Go to Cloudflare Dashboard → Pages
2. Connect to GitHub
3. Select this repository
4. Build command: `npm run build`
5. Output directory: `.vercel/output/static`
6. Add environment variable: `REMOVE_BG_API_KEY`

## API

### POST /api/remove-bg

Remove background from an image.

**Request:**

- Content-Type: `multipart/form-data`
- Body: `image` (image file)

**Response:**

```json
{
  "success": true,
  "data": {
    "image": "data:image/png;base64,..."
  }
}
```

## License

MIT
