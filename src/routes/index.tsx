import { createBrowserRouter } from 'react-router-dom'
import { RootLayout } from '../layouts/RootLayout'
import { 
  HomePage,
  FunctionCreatePage,
  SimulatorPage,
  ArchitecturePage,
  AISousChefPage,
  FunctionsListPage,
  FunctionDetailPage,
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
        path: 'functions',
        element: <FunctionsListPage />,
      },
      {
        path: 'functions/new',
        element: <FunctionCreatePage />,
      },
      {
        path: 'functions/:id',
        element: <FunctionDetailPage />,
      },
      {
        path: 'ai-helper',
        element: <AISousChefPage />,
      },
      {
        path: 'architecture',
        element: <ArchitecturePage />,
      },
      // Legacy routes 혹시 몰라서 남김
      {
        path: 'simulator',
        element: <SimulatorPage />,
      },
    ],
  },
])
