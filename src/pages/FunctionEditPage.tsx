import { useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useFunctionCreateStore } from '../stores/functionCreateStore'
import { useFunctionStats, useUpdateFunction } from '../apis'
import { 
  StepIndicator, 
  CodeStep, 
  RuntimeStep,
  PackageStep,
  EnvStep, 
  ReviewStep 
} from '../components/function-create'

export function FunctionEditPage() {
  const navigate = useNavigate()
  const { t } = useTranslation()
  const { id: functionId } = useParams<{ id: string }>()
  const { 
    currentStep, 
    setStep, 
    reset, 
    setFunctionName: setName, 
    setDescription, 
    setRuntime, 
    setTimeout: setTimeoutValue,
  } = useFunctionCreateStore()
  const updateFunction = useUpdateFunction()
  
  // 함수 정보 조회
  const { data: functionStats, isLoading } = useFunctionStats({ 
    functionId,
    enabled: !!functionId
  })
  
  // 기존 함수 정보를 store에 로드
  useEffect(() => {
    if (functionStats && functionId) {
      // 기본 정보 설정
      setName(functionStats.name)
      setDescription(functionStats.description || '')
      setRuntime(functionStats.runtime)
      setTimeoutValue(functionStats.timeout)
      
      // 코드와 환경변수는 백엔드에서 제공하지 않으므로 사용자가 직접 수정해야 함
      // TODO: 백엔드에 GET /function/{function_id} 엔드포인트 추가되면 여기서 로드
      // 현재는 기본 코드를 사용하거나 사용자가 새로 입력해야 함
    }
  }, [functionStats, functionId, setName, setDescription, setRuntime, setTimeoutValue])
  
  // 페이지 이탈 시 초기화
  useEffect(() => {
    return () => {
      // 컴포넌트 언마운트 시에는 초기화하지 않음 (사용자가 뒤로가기할 때 데이터 유지)
    }
  }, [])

  const handleCancel = () => {
    reset()
    if (functionId) {
      navigate(`/functions/${functionId}`)
    } else {
      navigate('/functions')
    }
  }

  const handleSave = async () => {
    if (!functionId) return
    
    const state = useFunctionCreateStore.getState()
    
    if (!state.functionName || !state.code) {
      alert('함수 이름과 코드는 필수입니다.')
      return
    }
    
    // envVariables를 envVars 객체로 변환
    const envVars: Record<string, string> = {}
    state.envVariables
      .filter(e => e.key.trim() !== '')
      .forEach(e => {
        envVars[e.key] = e.value
      })
    
    try {
      await updateFunction.mutateAsync({
        functionId,
        request: {
          name: state.functionName,
          runtime: state.runtime,
          sourceCode: state.code,
          description: state.description,
          envVars,
          timeout: state.timeout,
        },
      })
      
      // 성공 시 함수 상세 페이지로 이동
      navigate(`/functions/${functionId}`)
    } catch (error) {
      console.error('Failed to update function:', error)
      alert('함수 수정에 실패했습니다.')
    }
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
        return (
          <div>
            <ReviewStep />
            <div className="mt-6 pt-6 border-t border-stone-200 flex justify-end gap-3">
              <button
                onClick={handleCancel}
                className="px-6 py-2.5 text-stone-600 bg-stone-100 hover:bg-stone-200 rounded-lg font-medium transition-colors"
              >
                {t('common.cancel')}
              </button>
              <button
                onClick={handleSave}
                disabled={updateFunction.isPending}
                className="px-6 py-2.5 bg-gradient-to-r from-amber-500 to-orange-500 text-white font-semibold rounded-lg hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {updateFunction.isPending ? (
                  <>
                    <i className="fa-solid fa-spinner fa-spin mr-2"></i>
                    {t('common.saving', { defaultValue: 'Saving...' })}
                  </>
                ) : (
                  <>
                    <i className="fa-solid fa-save mr-2"></i>
                    {t('common.save', { defaultValue: 'Save Changes' })}
                  </>
                )}
              </button>
            </div>
          </div>
        )
      default:
        return <CodeStep />
    }
  }

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto p-8 text-center">
        <i className="fa-solid fa-spinner fa-spin text-amber-500 text-2xl mb-4"></i>
        <p className="text-stone-500">{t('common.loading', { defaultValue: 'Loading...' })}</p>
      </div>
    )
  }

  if (!functionStats) {
    return (
      <div className="max-w-4xl mx-auto p-8 text-center">
        <p className="text-red-500 mb-4">{t('functionEdit.notFound', { defaultValue: 'Function not found' })}</p>
        <button
          onClick={() => navigate('/functions')}
          className="px-4 py-2 bg-stone-100 text-stone-700 rounded-lg hover:bg-stone-200"
        >
          {t('common.backToList', { defaultValue: 'Back to List' })}
        </button>
      </div>
    )
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
              <i className="fa-solid fa-pen text-amber-500"></i>
              {t('functionEdit.title', { defaultValue: 'Edit Function' })}
            </h1>
          <p className="text-stone-500 text-sm mt-1">
              {functionStats.name}
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

