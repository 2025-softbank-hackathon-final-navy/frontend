import { useNavigate } from 'react-router-dom'
import { PrepStation } from '../components'
import { useAppStore } from '../stores/appStore'

export function FunctionCreatePage() {
  const navigate = useNavigate()
  const { setDeployed } = useAppStore()

  const handleDeploy = () => {
    setDeployed(true)
    // After deployment, navigate to functions list
    navigate('/functions')
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate('/functions')}
          className="p-2 rounded-lg hover:bg-stone-100 transition-colors"
        >
          <i className="fa-solid fa-arrow-left text-stone-500"></i>
        </button>
        <div>
          <h1 className="text-2xl font-bold text-stone-900">Create New Function</h1>
          <p className="text-stone-500 text-sm mt-1">
            새로운 서버리스 함수를 생성합니다
          </p>
        </div>
      </div>

      {/* PrepStation Component */}
      <PrepStation onDeploy={handleDeploy} isDeployed={false} />
    </div>
  )
}

