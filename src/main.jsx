import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext';
import { ColorProvider } from './context/ColorContext';
import './index.css'

import RootLayout from './layouts/RootLayout.jsx'
import Home from './pages/Home.jsx'
import Login from './pages/Login.jsx'
import Register from './pages/Register.jsx'
import Spaces from './pages/Spaces.jsx'
import SpaceDetail from './pages/SpaceDetail.jsx'

const router = createBrowserRouter([
  {
    path: '/',
    element: <RootLayout />,
    children: [
      {
        index: true,
        element: <Home />,
      },
      {
        path: 'spaces',
        element: <Spaces />,
      },
      {
        path: 'space/:id',
        element: <SpaceDetail />,
      },
    ],
  },
  {
    path: '/login',
    element: <Login />,
  },
  {
    path: '/register',
    element: <Register />,
  },
])

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <AuthProvider>
      <ColorProvider>
        <RouterProvider router={router} />
      </ColorProvider>
    </AuthProvider>
  </StrictMode>,
)
