/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_BASE_URL: string
  // Add other env variables here as needed
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}

// Type declarations for modules without TypeScript support
declare module 'markdown-it' {
  interface MarkdownItOptions {
    html?: boolean
    xhtmlOut?: boolean
    breaks?: boolean
    langPrefix?: string
    linkify?: boolean
    typographer?: boolean
    quotes?: string
    highlight?: (str: string, lang: string) => string
  }

  interface Token {
    type: string
    tag: string
    attrs: [string, string][]
    content: string
    attrSet: (name: string, value: string) => void
  }

  interface MarkdownIt {
    render(text: string): string
    parse(text: string, env?: any): Token[][]
    utils: {
      escapeHtml(text: string): string
    }
    renderer: {
      rules: Record<string, any>
    }
  }

  interface MarkdownItConstructor {
    new (options?: MarkdownItOptions): MarkdownIt
    (options?: MarkdownItOptions): MarkdownIt
  }

  const MarkdownIt: MarkdownItConstructor
  export = MarkdownIt
}

declare module 'highlight.js/lib/core' {
  interface HLJSApi {
    registerLanguage(name: string, language: any): void
    getLanguage(name: string): { name: string } | undefined
    highlight(code: string, options: { language: string }): { value: string }
    highlightAll(): void
  }

  const hljs: HLJSApi
  export default hljs
}

declare module 'highlight.js/lib/languages/*' {
  const language: any
  export default language
}

declare module 'highlight.js' {
  const hljs: {
    registerLanguage(name: string, language: any): void
    getLanguage(name: string): { name: string } | undefined
    highlight(code: string, options: { language: string }): { value: string }
    highlightAll(): void
  }
  export default hljs
}