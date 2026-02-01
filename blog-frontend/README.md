# Blog Frontend

A modern blog frontend application built with Vue 3, TypeScript, and Vite.

## Tech Stack

- **Vue 3.4.38** - Progressive JavaScript framework
- **TypeScript 4.9.4** - Type-safe JavaScript
- **Vite 5.4.1** - Next generation frontend tooling
- **Vue Router 4** - Official router for Vue.js
- **Pinia** - State management library
- **Markdown-it** - Markdown parser
- **Highlight.js** - Syntax highlighter

## Features

- Display blog articles with pagination
- Article detail page with Markdown rendering
- Code syntax highlighting for multiple languages
- Article archive organized by year
- Responsive design
- Loading and error states
- Page transition animations

## Project Structure

```
blog-frontend/
├── index.html           # Entry HTML file
├── package.json         # Project dependencies
├── vite.config.ts       # Vite configuration
├── tsconfig.json        # TypeScript configuration
├── src/
│   ├── main.ts          # Application entry point
│   ├── App.vue          # Root component
│   ├── styles/
│   │   └── main.css     # Global styles
│   ├── router/
│   │   └── index.ts     # Vue Router configuration
│   └── views/           # Page components
│       ├── Home.vue              # Home page (article list)
│       ├── ArticleDetail.vue     # Article detail page
│       ├── Archive.vue           # Archive page
│       ├── About.vue             # About page
│       └── NotFound.vue          # 404 page
└── vite-env.d.ts        # Vite TypeScript declarations
```

## Installation

```bash
# Install dependencies
npm install
# or
yarn install
```

## Development

```bash
# Start development server
npm run dev
# or
yarn dev
```

The application will be available at `http://localhost:5173`

## Build

```bash
# Build for production
npm run build
# or
yarn build
```

The production files will be in the `dist/` directory.

## Preview

```bash
# Preview production build
npm run preview
# or
yarn preview
```

## API Configuration

The application proxies API requests to the backend server. The default proxy configuration in `vite.config.ts` forwards `/api` requests to `http://localhost:9000/api`.

To change the backend URL, update the `server.proxy` configuration in `vite.config.ts`:

```typescript
server: {
  proxy: {
    '/api': {
      target: 'http://your-backend-url:port',
      changeOrigin: true,
      rewrite: (path) => path.replace(/^\/api/, '/api'),
    },
  },
}
```

## Supported Languages for Code Highlighting

- JavaScript
- TypeScript
- Python
- JSON
- XML/HTML
- CSS
- SQL
- Bash/Shell

## License

MIT
