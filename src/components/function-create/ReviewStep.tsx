import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useFunctionCreateStore, RUNTIME_CONFIG } from '../../stores/functionCreateStore'
import { useCreateFunction } from '../../apis'
import { ConsoleOutput } from './ConsoleOutput'

export function ReviewStep() {
  const navigate = useNavigate()
  const { t } = useTranslation()
  const { 
    functionName, 
    description,
    runtime, 
    code,
    packages,
    memory,
    timeout,
    envVariables,
    isDeploying,
    setDeploying,
    consoleOutput,
    showConsole,
    addConsoleOutput,
    clearConsole,
    setShowConsole,
    prevStep,
    toCreateRequest,
    reset,
  } = useFunctionCreateStore()

  const createFunction = useCreateFunction()
  
  const validEnvVars = envVariables.filter(e => e.key.trim())
  const secretCount = validEnvVars.filter(e => e.isSecret).length
  const packageList = packages.split('\n').filter(p => p.trim())
  const config = RUNTIME_CONFIG[runtime]
  
  const handleDeploy = async () => {
    setDeploying(true)
    clearConsole()
    setShowConsole(true)
    
    const timeStr = () => new Date().toLocaleTimeString()
    
    // 시작 로그
    addConsoleOutput([
      `[${timeStr()}] 🚀 Starting deployment...`,
      `[${timeStr()}] Function: ${functionName}`,
      `[${timeStr()}] Runtime: ${config.label}`,
      '',
    ])
    
    // 빌드 로그
    setTimeout(() => {
      addConsoleOutput([
        `[${timeStr()}] 📦 Packaging function (${(code.length / 1024).toFixed(1)} KB)...`,
        `[${timeStr()}] Configuring resources: ${memory}MB memory, ${timeout}s timeout`,
      ])
    }, 500)
    
    // 환경 변수 로그
    setTimeout(() => {
      if (validEnvVars.length > 0) {
        addConsoleOutput([
          `[${timeStr()}] Setting ${validEnvVars.length - secretCount} env variable(s), ${secretCount} secret(s)...`,
          ...validEnvVars.map(e => `  → ${e.key}=${e.isSecret ? '••••••••' : e.value}`),
        ])
      }
    }, 1000)
    
    // API 호출
    try {
      const request = toCreateRequest()
      
      setTimeout(async () => {
        addConsoleOutput([
          `[${timeStr()}] Uploading to Code Bistro...`,
        ])
        
        try {
          // 실제 API 호출 (현재는 Mock)
          // const result = await createFunction.mutateAsync(request)
          
          // Mock 성공 응답
          setTimeout(() => {
            addConsoleOutput([
              '',
              `[${timeStr()}] ✅ Deployment successful!`,
              '',
              '─── Deployment Info ───',
              `Function: ${request.name}`,
              ...(request.description ? [`Description: ${request.description}`] : []),
              `Runtime: ${config.label}`,
              `Memory: ${memory}MB`,
              `Timeout: ${timeout}s`,
              `URL: https://api.codebistro.dev/fn/${request.name}`,
              `Version: v${Date.now().toString().slice(-6)}`,
              '',
              '🎉 Your function is now live!',
            ])
            
            setDeploying(false)
          }, 1000)
          
        } catch (error) {
          addConsoleOutput([
            '',
            `[${timeStr()}] ❌ Deployment failed!`,
            `Error: ${error instanceof Error ? error.message : 'Unknown error'}`,
          ])
          setDeploying(false)
        }
      }, 1500)
      
    } catch (error) {
      addConsoleOutput([
        `[${timeStr()}] ❌ Error: ${error instanceof Error ? error.message : 'Unknown error'}`,
      ])
      setDeploying(false)
    }
  }

  const handleFinish = () => {
    reset()
    navigate('/functions')
  }
  
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold text-stone-800 flex items-center gap-2">
          <i className="fa-solid fa-rocket text-amber-500"></i>
          {t('functionCreate.review.title')}
        </h2>
        <p className="text-stone-500 text-sm mt-1">
          {t('functionCreate.review.subtitle')}
        </p>
      </div>
      
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Basic Info */}
        <div className="bg-white rounded-xl border border-stone-200 p-5">
          <h4 className="font-semibold text-stone-700 mb-4 flex items-center gap-2">
            <i className="fa-solid fa-info-circle text-blue-500"></i>
            {t('functionCreate.review.basicInfo')}
          </h4>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-stone-500">{t('functionCreate.code.functionName')}</span>
              <span className="font-medium text-stone-800">{functionName}</span>
            </div>
            {description && (
              <div className="flex justify-between">
                <span className="text-stone-500">{t('functionCreate.code.description')}</span>
                <span className="font-medium text-stone-800 text-right max-w-[200px] truncate">
                  {description}
                </span>
              </div>
            )}
            <div className="flex justify-between">
              <span className="text-stone-500">Runtime</span>
              <span className="font-medium text-stone-800">
                <i className={`${config.icon} mr-1`}></i>
                {config.label}
              </span>
            </div>
          </div>
        </div>
        
        {/* Resource Info */}
        <div className="bg-white rounded-xl border border-stone-200 p-5">
          <h4 className="font-semibold text-stone-700 mb-4 flex items-center gap-2">
            <i className="fa-solid fa-microchip text-green-500"></i>
            {t('functionCreate.review.resourceSettings')}
          </h4>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-stone-500">{t('functionCreate.resources.memory')}</span>
              <span className="font-medium text-stone-800">
                {memory >= 1024 ? `${memory / 1024}GB` : `${memory}MB`}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-stone-500">{t('functionCreate.resources.timeout')}</span>
              <span className="font-medium text-stone-800">
                {timeout >= 60 ? `${timeout / 60}m` : `${timeout}s`}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-stone-500">Code Size</span>
              <span className="font-medium text-stone-800">
                {(code.length / 1024).toFixed(1)} KB
              </span>
            </div>
          </div>
        </div>
        
        {/* Packages */}
        <div className="bg-white rounded-xl border border-stone-200 p-5">
          <h4 className="font-semibold text-stone-700 mb-4 flex items-center gap-2">
            <i className="fa-solid fa-cube text-purple-500"></i>
            {t('functionCreate.review.packages')}
          </h4>
          {packageList.length > 0 ? (
            <div className="space-y-1 text-sm max-h-[100px] overflow-y-auto">
              {packageList.map((pkg, i) => (
                <div key={i} className="flex items-center gap-2 bg-stone-50 px-3 py-1.5 rounded">
                  <i className="fa-solid fa-box text-stone-400 text-xs"></i>
                  <span className="font-mono text-stone-700 text-xs">{pkg}</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-stone-400 italic">{t('functionCreate.env.noVariables')}</p>
          )}
        </div>
        
        {/* Env Variables */}
        <div className="bg-white rounded-xl border border-stone-200 p-5">
          <h4 className="font-semibold text-stone-700 mb-4 flex items-center gap-2">
            <i className="fa-solid fa-key text-amber-500"></i>
            {t('functionCreate.review.envVariables')}
          </h4>
          {validEnvVars.length > 0 ? (
            <div className="space-y-2 text-sm">
              {validEnvVars.map((env, i) => (
                <div key={i} className="flex items-center gap-2 bg-stone-50 px-3 py-2 rounded-lg">
                  {env.isSecret && <i className="fa-solid fa-lock text-amber-500 text-xs"></i>}
                  <span className="font-mono text-stone-700">{env.key}</span>
                  <span className="text-stone-400">=</span>
                  <span className="font-mono text-stone-500 truncate">
                    {env.isSecret ? '••••••••' : env.value}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-stone-400 italic">{t('functionCreate.env.noVariables')}</p>
          )}
        </div>
        
        {/* Invoke URL Preview */}
        <div className="bg-white rounded-xl border border-stone-200 p-5">
          <h4 className="font-semibold text-stone-700 mb-4 flex items-center gap-2">
            <i className="fa-solid fa-link text-purple-500"></i>
            {t('functionCreate.review.invokeUrl')}
          </h4>
          <div className="bg-stone-50 rounded-lg p-3 font-mono text-sm break-all text-stone-600">
            https://api.codebistro.dev/fn/{functionName}
          </div>
          <p className="text-xs text-stone-400 mt-2">
            {t('functionCreate.review.invokeUrlDesc')}
          </p>
        </div>
      </div>
      
      {/* Console Output */}
      {showConsole && (
        <ConsoleOutput 
          output={consoleOutput}
          isRunning={isDeploying}
          onClose={() => setShowConsole(false)}
          onClear={clearConsole}
        />
      )}
      
      {/* Navigation */}
      <div className="flex justify-between pt-4 border-t border-stone-200">
        <button
          onClick={prevStep}
          disabled={isDeploying}
          className={`
            flex items-center gap-2 px-6 py-2.5 rounded-lg font-medium transition-colors
            ${isDeploying 
              ? 'text-stone-300 cursor-not-allowed' 
              : 'text-stone-600 hover:bg-stone-100'
            }
          `}
        >
          <i className="fa-solid fa-arrow-left"></i>
          <span>{t('common.prev')}: {t('functionCreate.steps.env')}</span>
        </button>
        
        <div className="flex gap-3">
          {consoleOutput.some(line => line.includes('✅')) ? (
            <button
              onClick={handleFinish}
              className="flex items-center gap-2 px-6 py-2.5 rounded-lg font-medium
                         bg-green-600 text-white hover:bg-green-700 shadow-lg shadow-green-600/25 transition-all"
            >
              <i className="fa-solid fa-check"></i>
              <span>{t('functionCreate.review.complete')}</span>
            </button>
          ) : (
            <button
              onClick={handleDeploy}
              disabled={isDeploying}
              className={`
                flex items-center gap-2 px-6 py-2.5 rounded-lg font-medium transition-all
                ${isDeploying 
                  ? 'bg-amber-400 text-white cursor-not-allowed' 
                  : 'bg-amber-500 text-white hover:bg-amber-600 shadow-lg shadow-amber-500/25'
                }
              `}
            >
              {isDeploying ? (
                <>
                  <i className="fa-solid fa-circle-notch fa-spin"></i>
                  <span>{t('functionCreate.review.deploying')}</span>
                </>
              ) : (
                <>
                  <i className="fa-solid fa-rocket"></i>
                  <span>{t('functionCreate.review.deploy')}</span>
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
