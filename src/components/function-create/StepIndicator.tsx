import { useTranslation } from 'react-i18next'
import { WIZARD_STEPS, type WizardStep } from '../../stores/functionCreateStore'

interface StepIndicatorProps {
  currentStep: WizardStep
  onStepClick: (step: WizardStep) => void
}

// Step ID를 번역 키로 매핑
const stepTranslationKeys: Record<WizardStep, string> = {
  code: 'functionCreate.steps.code',
  runtime: 'functionCreate.steps.resources',
  packages: 'functionCreate.steps.packages',
  env: 'functionCreate.steps.env',
  review: 'functionCreate.steps.review',
}

export function StepIndicator({ currentStep, onStepClick }: StepIndicatorProps) {
  const { t } = useTranslation()
  const currentIndex = WIZARD_STEPS.findIndex(s => s.id === currentStep)
  
  return (
    <div className="w-full">
      {/* Desktop View */}
      <div className="hidden md:flex items-center justify-between">
        {WIZARD_STEPS.map((step, index) => {
          const isActive = step.id === currentStep
          const isCompleted = index < currentIndex
          const isClickable = index <= currentIndex
          const label = t(stepTranslationKeys[step.id])
          
          return (
            <div key={step.id} className="flex items-center flex-1">
              {/* Step Circle */}
              <button
                onClick={() => isClickable && onStepClick(step.id)}
                disabled={!isClickable}
                className={`
                  relative flex items-center justify-center w-10 h-10 rounded-full
                  font-bold text-sm transition-all duration-300
                  ${isActive 
                    ? 'bg-amber-500 text-white shadow-lg shadow-amber-500/30 scale-110' 
                    : isCompleted 
                      ? 'bg-green-500 text-white cursor-pointer hover:bg-green-600' 
                      : 'bg-stone-200 text-stone-500'
                  }
                  ${isClickable && !isActive ? 'cursor-pointer' : ''}
                `}
              >
                {isCompleted ? (
                  <i className="fa-solid fa-check"></i>
                ) : (
                  <i className={step.icon}></i>
                )}
              </button>
              
              {/* Step Label */}
              <div className={`
                ml-3 mr-4 transition-colors
                ${isActive ? 'text-amber-600 font-semibold' : isCompleted ? 'text-green-600' : 'text-stone-400'}
              `}>
                <div className="text-xs uppercase tracking-wider">Step {index + 1}</div>
                <div className="text-sm">{label}</div>
              </div>
              
              {/* Connector Line */}
              {index < WIZARD_STEPS.length - 1 && (
                <div className="flex-1 h-0.5 mx-2">
                  <div 
                    className={`h-full transition-all duration-500 ${
                      isCompleted ? 'bg-green-500' : 'bg-stone-200'
                    }`}
                  />
                </div>
              )}
            </div>
          )
        })}
      </div>
      
      {/* Mobile View */}
      <div className="md:hidden">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs text-stone-500 uppercase tracking-wider">
            Step {currentIndex + 1} of {WIZARD_STEPS.length}
          </span>
          <span className="text-sm font-semibold text-amber-600">
            {t(stepTranslationKeys[currentStep])}
          </span>
        </div>
        
        {/* Progress Bar */}
        <div className="h-2 bg-stone-200 rounded-full overflow-hidden">
          <div 
            className="h-full bg-amber-500 transition-all duration-500 rounded-full"
            style={{ width: `${((currentIndex + 1) / WIZARD_STEPS.length) * 100}%` }}
          />
        </div>
        
        {/* Step Pills */}
        <div className="flex gap-2 mt-3">
          {WIZARD_STEPS.map((step, index) => {
            const isActive = step.id === currentStep
            const isCompleted = index < currentIndex
            const label = t(stepTranslationKeys[step.id])
            
            return (
              <button
                key={step.id}
                onClick={() => index <= currentIndex && onStepClick(step.id)}
                className={`
                  flex-1 py-1.5 px-2 rounded-lg text-xs font-medium
                  transition-all duration-200
                  ${isActive 
                    ? 'bg-amber-100 text-amber-700 border-2 border-amber-500' 
                    : isCompleted 
                      ? 'bg-green-100 text-green-700 border border-green-200' 
                      : 'bg-stone-100 text-stone-400 border border-stone-200'
                  }
                `}
              >
                <i className={`${isCompleted ? 'fa-solid fa-check' : step.icon} mr-1`}></i>
                <span className="hidden sm:inline">{label.split(' ')[0]}</span>
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}
