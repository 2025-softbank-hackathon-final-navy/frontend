import { KitchenSimulator } from '../components'
import { useAppStore } from '../stores/appStore'

export function SimulatorPage() {
  const { isDeployed, aiEnabled } = useAppStore()

  return <KitchenSimulator isDeployed={isDeployed} aiEnabled={aiEnabled} />
}
