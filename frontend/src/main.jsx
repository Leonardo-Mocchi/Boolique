import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { GlobalProvider } from './contexts/GlobalContext.jsx'
import { AuthProvider } from './contexts/AuthContext.jsx'

createRoot(document.getElementById('root')).render(
  <GlobalProvider>
    <AuthProvider>
      <App />
    </AuthProvider>
  </GlobalProvider>
)
