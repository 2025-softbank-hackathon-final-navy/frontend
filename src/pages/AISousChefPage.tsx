import { AISousChef } from '../components'
import { useAppStore } from '../stores/appStore'

export function AISousChefPage() {
  const { aiEnabled, toggleAi } = useAppStore()

  return <AISousChef aiEnabled={aiEnabled} onToggle={toggleAi} />
}
