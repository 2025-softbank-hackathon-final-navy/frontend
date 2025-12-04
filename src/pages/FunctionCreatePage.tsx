import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useFunctionCreateStore } from '../stores/functionCreateStore'
import { 
  StepIndicator, 
  CodeStep, 
  RuntimeStep,
  PackageStep,
  EnvStep, 
  ReviewStep 
} from '../components/function-create'

export function FunctionCreatePage() {
  const navigate = useNavigate()
  const { t } = useTranslation()
  const { currentStep, setStep, reset } = useFunctionCreateStore()

  const handleCancel = () => {
    reset()
    navigate('/functions')
  }

  // Step에 따른 컴포넌트 렌더링
  const renderStep = () => {
    switch (currentStep) {
      case 'code':
        return <CodeStep />
      case 'runtime':
        return <RuntimeStep />
      case 'packages':
        return <PackageStep />
      case 'env':
        return <EnvStep />
      case 'review':
        return <ReviewStep />
      default:
        return <CodeStep />
    }
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <button
            onClick={handleCancel}
            className="p-2 rounded-lg hover:bg-stone-100 transition-colors"
          >
            <i className="fa-solid fa-arrow-left text-stone-500"></i>
          </button>
          <div>
            <h1 className="text-2xl font-bold text-stone-900 flex items-center gap-2">
              <i className="fa-solid fa-plus-circle text-amber-500"></i>
              {t('functionCreate.title')}
            </h1>
            <p className="text-stone-500 text-sm mt-1">
              {t('functionCreate.subtitle')}
            </p>
          </div>
        </div>
        
        <button
          onClick={handleCancel}
          className="text-sm text-stone-500 hover:text-stone-700 transition-colors"
        >
          {t('common.cancel')}
        </button>
      </div>

      {/* Step Indicator */}
      <div className="mb-8 bg-white rounded-xl border border-stone-200 p-5 shadow-sm">
        <StepIndicator 
          currentStep={currentStep} 
          onStepClick={setStep} 
        />
      </div>

      {/* Step Content */}
      <div className="bg-white rounded-xl border border-stone-200 p-6 shadow-sm">
        {renderStep()}
      </div>
    </div>
  )
}
