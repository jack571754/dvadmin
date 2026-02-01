import { createApp } from 'vue'
import { createPinia } from 'pinia'
import router from './router'
import App from './App.vue'

// Import design system styles
import './assets/styles/variables.css'
import './assets/styles/animations.css'
// Import highlight.js styles
import 'highlight.js/styles/github-dark.css'

const app = createApp(App)

app.use(createPinia())
app.use(router)

app.mount('#app')
