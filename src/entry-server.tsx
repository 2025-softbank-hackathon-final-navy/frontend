import React from 'react'
import ReactDOMServer from 'react-dom/server'
import { StaticRouter } from 'react-router-dom/server'
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
import { Routes, Route } from 'react-router-dom'

export function render(url: string) {
  const html = ReactDOMServer.renderToString(
    <React.StrictMode>
      <StaticRouter location={url}>
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
      </StaticRouter>
    </React.StrictMode>
  )

  return { html }
}
