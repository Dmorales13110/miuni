import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { MantineProvider } from '@mantine/core'
import { Notifications } from '@mantine/notifications'
import App from './App'
import '@mantine/core/styles.css'
import '@mantine/notifications/styles.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <MantineProvider
      theme={{
        fontFamily: 'Arial Rounded MT Bold, "Comic Neue", Arial, sans-serif',
        headings: {
          fontFamily: 'Arial Rounded MT Bold, "Comic Neue", Arial, sans-serif',
        },
        colors: {
          brand: ['#FF6B6B', '#FF8E8E', '#FFB0B0', '#FFD1D1', '#FFF0F0'],
        },
        primaryColor: 'brand',
        defaultRadius: 'xl',
      }}
      withGlobalStyles
      withNormalizeCSS
    >
      <Notifications />
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </MantineProvider>
  </React.StrictMode>
)