import { PrepStation } from '../components'
import { useAppStore } from '../stores/appStore'

export function PrepStationPage() {
  const { isDeployed, setDeployed } = useAppStore()

  const handleDeploy = () => {
    setDeployed(true)
  }

  return <PrepStation onDeploy={handleDeploy} isDeployed={isDeployed} />
}
