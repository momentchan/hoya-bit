import { createRoot } from 'react-dom/client'
import App from './app/App'
import AppBG from './app/AppBG'
import { StrictMode } from 'react'

createRoot(document.querySelector('#root')).render(<StrictMode><App /></StrictMode>)
createRoot(document.querySelector('#root-bg')).render(<StrictMode><AppBG /></StrictMode>)


