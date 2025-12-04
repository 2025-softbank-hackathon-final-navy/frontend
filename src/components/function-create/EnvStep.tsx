import { useTranslation } from 'react-i18next'
import { useFunctionCreateStore } from '../../stores/functionCreateStore'

export function EnvStep() {
  const { t } = useTranslation()
  const { 
    envVariables,
    addEnvVariable,
    removeEnvVariable,
    updateEnvVariable,
    prevStep,
    nextStep 
  } = useFunctionCreateStore()

  const validEnvCount = envVariables.filter(e => e.key.trim()).length
  const secretCount = envVariables.filter(e => e.key.trim() && e.isSecret).length
  
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold text-stone-800 flex items-center gap-2">
          <i className="fa-solid fa-key text-amber-500"></i>
          {t('functionCreate.env.title')}
        </h2>
        <p className="text-stone-500 text-sm mt-1">
          {t('functionCreate.env.subtitle')}
        </p>
      </div>
      
      {/* Info Banner */}
      <div className="bg-blue-50 border border-blue-100 rounded-xl px-4 py-3 flex items-start gap-3">
        <i className="fa-solid fa-circle-info text-blue-500 mt-0.5"></i>
        <div className="text-sm text-blue-700">
          <strong>Tip:</strong> {t('functionCreate.env.secretDesc')}
        </div>
      </div>
      
      {/* Variables List */}
      <div className="space-y-3">
        {envVariables.map((env, index) => (
          <div 
            key={index} 
            className="flex items-center gap-3 p-4 bg-white rounded-xl border border-stone-200 
                       hover:border-stone-300 transition-all shadow-sm"
          >
            {/* Key Input */}
            <div className="flex-1">
              <label className="block text-xs text-stone-500 mb-1">Key</label>
              <input
                type="text"
                placeholder={t('functionCreate.env.keyPlaceholder')}
                value={env.key}
                onChange={(e) => updateEnvVariable(index, 'key', e.target.value.toUpperCase().replace(/[^A-Z0-9_]/g, '_'))}
                className="w-full bg-stone-50 border border-stone-200 rounded-lg px-3 py-2 text-sm 
                           text-stone-700 font-mono focus:outline-none focus:border-amber-500 
                           focus:ring-2 focus:ring-amber-500/20 transition-all"
              />
            </div>
            
            <div className="text-stone-300 font-mono mt-5">=</div>
            
            {/* Value Input */}
            <div className="flex-1">
              <label className="block text-xs text-stone-500 mb-1">Value</label>
              <input
                type={env.isSecret ? 'password' : 'text'}
                placeholder={t('functionCreate.env.valuePlaceholder')}
                value={env.value}
                onChange={(e) => updateEnvVariable(index, 'value', e.target.value)}
                className="w-full bg-stone-50 border border-stone-200 rounded-lg px-3 py-2 text-sm 
                           text-stone-700 font-mono focus:outline-none focus:border-amber-500 
                           focus:ring-2 focus:ring-amber-500/20 transition-all"
              />
            </div>
            
            {/* Secret Toggle */}
            <div className="mt-5">
              <button
                onClick={() => updateEnvVariable(index, 'isSecret', !env.isSecret)}
                className={`
                  p-2.5 rounded-lg transition-all flex items-center gap-1.5
                  ${env.isSecret 
                    ? 'bg-amber-100 text-amber-600 hover:bg-amber-200' 
                    : 'bg-stone-100 text-stone-400 hover:bg-stone-200'
                  }
                `}
                title={env.isSecret ? t('functionCreate.env.secret') : 'Normal'}
              >
                <i className={`fa-solid ${env.isSecret ? 'fa-lock' : 'fa-lock-open'}`}></i>
              </button>
            </div>
            
            {/* Delete Button */}
            <div className="mt-5">
              <button
                onClick={() => removeEnvVariable(index)}
                disabled={envVariables.length === 1}
                className={`
                  p-2.5 rounded-lg transition-all
                  ${envVariables.length === 1
                    ? 'bg-stone-50 text-stone-300 cursor-not-allowed'
                    : 'bg-stone-100 text-stone-400 hover:bg-red-100 hover:text-red-500'
                  }
                `}
                title={t('common.delete')}
              >
                <i className="fa-solid fa-trash-can"></i>
              </button>
            </div>
          </div>
        ))}
      </div>
      
      {/* Add Variable Button */}
      <button
        onClick={addEnvVariable}
        className="w-full p-4 border-2 border-dashed border-stone-300 rounded-xl 
                   text-stone-500 hover:border-amber-500 hover:text-amber-600 hover:bg-amber-50 
                   transition-all flex items-center justify-center gap-2"
      >
        <i className="fa-solid fa-plus"></i>
        <span>{t('functionCreate.env.addVariable')}</span>
      </button>
      
      {/* Summary */}
      <div className="bg-stone-50 rounded-xl p-4 border border-stone-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-sm">
              <i className="fa-solid fa-circle-check text-green-500"></i>
              <span className="text-stone-600">
                <strong>{validEnvCount}</strong> variables
              </span>
            </div>
            {secretCount > 0 && (
              <div className="flex items-center gap-2 text-sm">
                <i className="fa-solid fa-lock text-amber-500"></i>
                <span className="text-stone-600">
                  <strong>{secretCount}</strong> secrets
                </span>
              </div>
            )}
          </div>
          
          {validEnvCount === 0 && (
            <span className="text-xs text-stone-400">
              {t('functionCreate.env.noVariables')}
            </span>
          )}
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
          <span>{t('common.prev')}: {t('functionCreate.steps.packages')}</span>
        </button>
        
        <button
          onClick={nextStep}
          className="flex items-center gap-2 px-6 py-2.5 rounded-lg font-medium
                     bg-amber-500 text-white hover:bg-amber-600 shadow-lg shadow-amber-500/25 transition-all"
        >
          <span>{t('common.next')}: {t('functionCreate.steps.review')}</span>
          <i className="fa-solid fa-arrow-right"></i>
        </button>
      </div>
    </div>
  )
}
