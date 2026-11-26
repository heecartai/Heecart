import React, { useEffect, useState } from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import Loader from './components/Loader.jsx'
import './index.css'

const MIN_MS = 1400 // the loader shows for at least this long on every page load / refresh
const FADE_MS = 400

function Root() {
  const [phase, setPhase] = useState('show') // show -> fade -> done
  useEffect(() => {
    const a = setTimeout(() => setPhase('fade'), MIN_MS)
    const b = setTimeout(() => setPhase('done'), MIN_MS + FADE_MS)
    return () => { clearTimeout(a); clearTimeout(b) }
  }, [])
  return (
    <>
      <App />
      {phase !== 'done' && <Loader fading={phase === 'fade'} />}
    </>
  )
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <Root />
  </React.StrictMode>,
)
