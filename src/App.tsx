import { BrowserRouter } from 'react-router-dom'
import { AppRoutes } from './app/routes'
import { MobileShell } from './components/layout/MobileShell'

function App() {
  return (
    <BrowserRouter>
      <MobileShell>
        <AppRoutes />
      </MobileShell>
    </BrowserRouter>
  )
}

export default App
