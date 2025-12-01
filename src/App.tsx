import { useState } from 'react'
import {
  Navigation,
  Footer,
  HeroSection,
  PrepStation,
  KitchenSimulator,
  ArchitectureSection,
  AISousChef,
} from './components'

function App() {
  const [isDeployed, setIsDeployed] = useState(true)
  const [aiEnabled, setAiEnabled] = useState(false)

  const handleDeploy = () => {
    setIsDeployed(true)
  }

  const toggleAI = () => {
    setAiEnabled(prev => !prev)
  }

  return (
    <div className="text-stone-800">
      <Navigation />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-24">
        <HeroSection />
        <PrepStation onDeploy={handleDeploy} isDeployed={isDeployed} />
        <KitchenSimulator isDeployed={isDeployed} aiEnabled={aiEnabled} />
        <ArchitectureSection />
        <AISousChef aiEnabled={aiEnabled} onToggle={toggleAI} />
      </main>

      <Footer />
    </div>
  )
}

export default App

