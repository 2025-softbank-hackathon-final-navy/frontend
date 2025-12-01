import { createBrowserRouter } from 'react-router-dom'
import { RootLayout } from '../layouts/RootLayout'
import { 
  HomePage,
  PrepStationPage,
  SimulatorPage,
  ArchitecturePage,
  AISousChefPage,
  FunctionsListPage,
  FunctionDetailPage,
  NodeStatusPage,
} from '../pages'

export const router = createBrowserRouter([
  {
    path: '/',
    element: <RootLayout />,
    children: [
      {
        index: true,
        element: <HomePage />,
      },
      {
        path: 'prep-station',
        element: <PrepStationPage />,
      },
      {
        path: 'simulator',
        element: <SimulatorPage />,
      },
      {
        path: 'architecture',
        element: <ArchitecturePage />,
      },
      {
        path: 'ai-chef',
        element: <AISousChefPage />,
      },
      {
        path: 'functions',
        element: <FunctionsListPage />,
      },
      {
        path: 'functions/:id',
        element: <FunctionDetailPage />,
      },
      {
        path: 'nodes',
        element: <NodeStatusPage />,
      },
    ],
  },
])
