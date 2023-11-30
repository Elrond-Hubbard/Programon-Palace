import ReactDOM from 'react-dom/client'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'

import 'bootstrap/dist/css/bootstrap.min.css'

import App from './App.jsx'
import Error from './pages/Error.jsx'
import Homepage from './pages/Homepage.jsx'
import Marketplace from './pages/Marketplace.jsx'
import Lobby from './pages/Lobby.jsx'
import Game from './pages/Game.jsx'

const router = createBrowserRouter([
  {
    path: '/',
    element: <App />,
    errorElement: <Error />,
    children: [
      {
        index: true,
        element: <Homepage />
      },
      {
        path: '/marketplace',
        element: <Marketplace />
      },
      {
        path: '/lobby',
        element: <Lobby />
      },
      {
        path: '/game',
        element: <Game />
      }
    ]
  }
])

ReactDOM.createRoot(document.getElementById('root')).render(
  <RouterProvider router={router} />
)
