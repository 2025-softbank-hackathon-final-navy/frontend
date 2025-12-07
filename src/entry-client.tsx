import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { RootLayout } from './layouts/RootLayout'
import {
  HomePage,
  PrepStationPage,
  SimulatorPage,
  ArchitecturePage,
  AISousChefPage,
  FunctionsListPage,
  FunctionDetailPage,
  NodeStatusPage,
} from './pages'
import './styles/globals.css'

ReactDOM.hydrateRoot(
  document.getElementById('root')!,
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<RootLayout />}>
          <Route index element={<HomePage />} />
          <Route path="prep-station" element={<PrepStationPage />} />
          <Route path="simulator" element={<SimulatorPage />} />
          <Route path="architecture" element={<ArchitecturePage />} />
          <Route path="ai-chef" element={<AISousChefPage />} />
          <Route path="functions" element={<FunctionsListPage />} />
          <Route path="functions/:id" element={<FunctionDetailPage />} />
          <Route path="nodes" element={<NodeStatusPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  </React.StrictMode>
)
