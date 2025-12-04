import { useTranslation } from 'react-i18next'
import { useFunctionCreateStore, RUNTIME_CONFIG } from '../../stores/functionCreateStore'

export function RuntimeStep() {
  const { t } = useTranslation()
  const { 
    runtime,
    memory, 
    setMemory, 
    timeout, 
    setTimeout,
    prevStep,
    nextStep 
  } = useFunctionCreateStore()

  const memoryOptions = [128, 256, 512, 1024, 2048]
  const timeoutOptions = [10, 30, 60, 120, 300]
  const config = RUNTIME_CONFIG[runtime]

  const formatMemory = (mem: number) => {
    return mem >= 1024 ? `${mem / 1024}GB` : `${mem}MB`
  }

  const formatTimeoutValue = (t: number) => {
    return t >= 60 ? `${t / 60}m` : `${t}s`
  }
  
  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold text-stone-800 flex items-center gap-2">
          <i className="fa-solid fa-microchip text-amber-500"></i>
          {t('functionCreate.resources.title')}
        </h2>
        <p className="text-stone-500 text-sm mt-1">
          {t('functionCreate.resources.subtitle')}
        </p>
      </div>
      
      {/* Selected Runtime Info */}
      <div className="bg-stone-50 rounded-xl p-4 border border-stone-200 flex items-center gap-4">
        <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center">
          <i className={`${config.icon} text-amber-600 text-xl`}></i>
        </div>
        <div>
          <div className="text-sm text-stone-500">{t('functionCreate.code.selectRuntime')}</div>
          <div className="font-semibold text-stone-800">{config.label}</div>
        </div>
        <div className="ml-auto">
          <span className="text-xs bg-amber-100 text-amber-700 px-2 py-1 rounded-full">
            .{config.extension}
          </span>
        </div>
      </div>
      
      {/* Memory Selection */}
      <div>
        <label className="block text-sm font-medium text-stone-700 mb-3">
          <i className="fa-solid fa-memory text-amber-500 mr-1.5"></i>
          {t('functionCreate.resources.memory')}
        </label>
        <div className="flex flex-wrap gap-3">
          {memoryOptions.map((mem) => (
            <button
              key={mem}
              onClick={() => setMemory(mem)}
              className={`
                px-5 py-3 rounded-xl font-medium transition-all border-2
                ${memory === mem 
                  ? 'bg-amber-500 text-white border-amber-500 shadow-lg shadow-amber-500/25' 
                  : 'bg-white text-stone-600 border-stone-200 hover:border-stone-300 hover:shadow-md'
                }
              `}
            >
              {formatMemory(mem)}
            </button>
          ))}
        </div>
        <p className="text-xs text-stone-400 mt-2 flex items-center gap-1">
          <i className="fa-solid fa-circle-info"></i>
          {t('functionCreate.resources.memoryDesc')}
        </p>
      </div>
      
      {/* Timeout Selection */}
      <div>
        <label className="block text-sm font-medium text-stone-700 mb-3">
          <i className="fa-solid fa-clock text-amber-500 mr-1.5"></i>
          {t('functionCreate.resources.timeout')}
        </label>
        <div className="flex flex-wrap gap-3">
          {timeoutOptions.map((t) => (
            <button
              key={t}
              onClick={() => setTimeout(t)}
              className={`
                px-5 py-3 rounded-xl font-medium transition-all border-2
                ${timeout === t 
                  ? 'bg-amber-500 text-white border-amber-500 shadow-lg shadow-amber-500/25' 
                  : 'bg-white text-stone-600 border-stone-200 hover:border-stone-300 hover:shadow-md'
                }
              `}
            >
              {formatTimeoutValue(t)}
            </button>
          ))}
        </div>
        <p className="text-xs text-stone-400 mt-2 flex items-center gap-1">
          <i className="fa-solid fa-circle-info"></i>
          {t('functionCreate.resources.timeoutDesc')}
        </p>
      </div>
      
      {/* Summary Card */}
      <div className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-xl p-5 border border-amber-200">
        <h4 className="font-semibold text-stone-700 mb-3 flex items-center gap-2">
          <i className="fa-solid fa-list-check text-amber-500"></i>
          {t('functionCreate.review.resourceSettings')}
        </h4>
        <div className="grid grid-cols-3 gap-4 text-sm">
          <div className="bg-white/70 rounded-lg p-3">
            <span className="text-stone-500 text-xs">Runtime</span>
            <div className="font-semibold text-stone-800 mt-1 flex items-center gap-1">
              <i className={`${config.icon} text-sm`}></i>
              {config.label}
            </div>
          </div>
          <div className="bg-white/70 rounded-lg p-3">
            <span className="text-stone-500 text-xs">{t('functionCreate.resources.memory')}</span>
            <div className="font-semibold text-stone-800 mt-1">
              {formatMemory(memory)}
            </div>
          </div>
          <div className="bg-white/70 rounded-lg p-3">
            <span className="text-stone-500 text-xs">{t('functionCreate.resources.timeout')}</span>
            <div className="font-semibold text-stone-800 mt-1">
              {formatTimeoutValue(timeout)}
            </div>
          </div>
        </div>
      </div>
      
      {/* Navigation */}
      <div className="flex justify-between pt-4 border-t border-stone-200">
        <button
          onClick={prevStep}
          className="flex items-center gap-2 px-6 py-2.5 rounded-lg font-medium
                     text-stone-600 hover:bg-stone-100 transition-colors"
        >
          <i className="fa-solid fa-arrow-left"></i>
          <span>{t('common.prev')}: {t('functionCreate.steps.code')}</span>
        </button>
        
        <button
          onClick={nextStep}
          className="flex items-center gap-2 px-6 py-2.5 rounded-lg font-medium
                     bg-amber-500 text-white hover:bg-amber-600 shadow-lg shadow-amber-500/25 transition-all"
        >
          <span>{t('common.next')}: {t('functionCreate.steps.packages')}</span>
          <i className="fa-solid fa-arrow-right"></i>
        </button>
      </div>
    </div>
  )
}
