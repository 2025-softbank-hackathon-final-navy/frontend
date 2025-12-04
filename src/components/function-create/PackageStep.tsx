import { useTranslation } from 'react-i18next'
import { useFunctionCreateStore, RUNTIME_CONFIG } from '../../stores/functionCreateStore'

// 인기 패키지 추천 목록
const POPULAR_PACKAGES: Record<string, { name: string; description: string }[]> = {
  'nodejs-18': [
    { name: 'express', description: 'Fast web framework' },
    { name: 'axios', description: 'HTTP client' },
    { name: 'lodash', description: 'Utility library' },
    { name: 'uuid', description: 'UUID generator' },
    { name: 'dayjs', description: 'Date library' },
    { name: 'zod', description: 'Schema validation' },
  ],
  'python-3.11': [
    { name: 'requests', description: 'HTTP library' },
    { name: 'numpy', description: 'Numerical computing' },
    { name: 'pandas', description: 'Data analysis' },
    { name: 'boto3', description: 'AWS SDK' },
    { name: 'pydantic', description: 'Data validation' },
    { name: 'httpx', description: 'Async HTTP client' },
  ],
  'go-1.22': [
    { name: 'github.com/gin-gonic/gin', description: 'Web framework' },
    { name: 'github.com/go-redis/redis/v8', description: 'Redis client' },
    { name: 'github.com/aws/aws-sdk-go-v2', description: 'AWS SDK' },
    { name: 'github.com/google/uuid', description: 'UUID library' },
    { name: 'github.com/spf13/viper', description: 'Configuration' },
    { name: 'go.uber.org/zap', description: 'Logging' },
  ],
}

export function PackageStep() {
  const { t } = useTranslation()
  const { 
    runtime,
    packages, 
    setPackages,
    prevStep,
    nextStep 
  } = useFunctionCreateStore()

  const config = RUNTIME_CONFIG[runtime]
  const popularPackages = POPULAR_PACKAGES[runtime] || []
  
  // 현재 입력된 패키지 개수
  const packageCount = packages
    .split('\n')
    .filter(p => p.trim().length > 0)
    .length
  
  // 패키지 추가 핸들러
  const handleAddPackage = (packageName: string) => {
    const currentPackages = packages.trim()
    if (currentPackages) {
      // 이미 있는지 확인
      const existing = currentPackages.split('\n').some(p => 
        p.trim().toLowerCase().startsWith(packageName.toLowerCase().split('@')[0])
      )
      if (!existing) {
        setPackages(currentPackages + '\n' + packageName)
      }
    } else {
      setPackages(packageName)
    }
  }
  
  // 패키지가 이미 추가되었는지 확인
  const isPackageAdded = (packageName: string) => {
    return packages
      .split('\n')
      .some(p => p.trim().toLowerCase().startsWith(packageName.toLowerCase().split('/')[0]))
  }
  
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold text-stone-800 flex items-center gap-2">
          <i className="fa-solid fa-cube text-amber-500"></i>
          {t('functionCreate.packages.title')}
        </h2>
        <p className="text-stone-500 text-sm mt-1">
          {t('functionCreate.packages.subtitle')}
        </p>
      </div>
      
      {/* Runtime Info */}
      <div className="bg-stone-50 rounded-xl p-4 border border-stone-200 flex items-center gap-4">
        <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center">
          <i className={`${config.icon} text-amber-600 text-xl`}></i>
        </div>
        <div className="flex-1">
          <div className="text-sm text-stone-500">{t('functionCreate.packages.packageFile')}</div>
          <div className="font-semibold text-stone-800 font-mono">{config.packageFile}</div>
        </div>
        <div className="text-right">
          <div className="text-sm text-stone-500">{t('functionCreate.packages.addedPackages')}</div>
          <div className="font-semibold text-stone-800">{packageCount}</div>
        </div>
      </div>
      
      {/* Package Input */}
      <div>
        <label className="block text-sm font-medium text-stone-700 mb-2">
          <i className="fa-solid fa-list text-amber-500 mr-1.5"></i>
          {t('functionCreate.packages.packageList')}
        </label>
        <div className="bg-[#1e1e1e] rounded-xl overflow-hidden border border-stone-800">
          {/* Header */}
          <div className="bg-[#252526] px-4 py-2 border-b border-[#333] flex items-center justify-between">
            <span className="text-xs text-stone-400 font-mono">{config.packageFile}</span>
            <span className="text-xs text-stone-500">
              {t('functionCreate.packages.onePerLine')}
            </span>
          </div>
          {/* Textarea */}
          <textarea
            value={packages}
            onChange={(e) => setPackages(e.target.value)}
            className="w-full h-[200px] bg-transparent text-stone-200 font-mono text-sm p-4 
                       focus:outline-none resize-none"
            placeholder={config.packagePlaceholder}
            spellCheck={false}
          />
        </div>
        <p className="text-xs text-stone-400 mt-2">
          <i className="fa-solid fa-circle-info mr-1"></i>
          {runtime === 'python-3.11' && 'Version: requests==2.31.0 or numpy>=1.24.0'}
          {runtime === 'nodejs-18' && 'Version: express@4.18.2 or lodash@latest'}
          {runtime === 'go-1.22' && 'Full module path: github.com/gin-gonic/gin'}
        </p>
      </div>
      
      {/* Popular Packages */}
      <div>
        <label className="block text-sm font-medium text-stone-700 mb-3">
          <i className="fa-solid fa-fire text-orange-500 mr-1.5"></i>
          {t('functionCreate.packages.popularPackages')}
        </label>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
          {popularPackages.map((pkg) => {
            const isAdded = isPackageAdded(pkg.name)
            return (
              <button
                key={pkg.name}
                onClick={() => !isAdded && handleAddPackage(pkg.name)}
                disabled={isAdded}
                className={`
                  p-3 rounded-lg border text-left transition-all
                  ${isAdded 
                    ? 'bg-green-50 border-green-200 cursor-default' 
                    : 'bg-white border-stone-200 hover:border-amber-500 hover:shadow-md cursor-pointer'
                  }
                `}
              >
                <div className="flex items-center justify-between">
                  <span className={`font-mono text-sm ${isAdded ? 'text-green-700' : 'text-stone-800'}`}>
                    {pkg.name.split('/').pop()}
                  </span>
                  {isAdded ? (
                    <i className="fa-solid fa-check text-green-500 text-xs"></i>
                  ) : (
                    <i className="fa-solid fa-plus text-stone-400 text-xs"></i>
                  )}
                </div>
                <div className="text-xs text-stone-500 mt-1">{pkg.description}</div>
              </button>
            )
          })}
        </div>
      </div>
      
      {/* Info Card */}
      <div className="bg-blue-50 rounded-xl p-4 border border-blue-100">
        <h4 className="font-medium text-blue-800 mb-2 flex items-center gap-2">
          <i className="fa-solid fa-lightbulb text-blue-500"></i>
          {t('functionCreate.packages.installGuide')}
        </h4>
        <ul className="text-sm text-blue-700 space-y-1">
          <li className="flex items-start gap-2">
            <i className="fa-solid fa-check text-blue-500 mt-1 text-xs"></i>
            <span>{t('functionCreate.packages.guideItems.autoInstall')}</span>
          </li>
          <li className="flex items-start gap-2">
            <i className="fa-solid fa-check text-blue-500 mt-1 text-xs"></i>
            <span>{t('functionCreate.packages.guideItems.coldStart')}</span>
          </li>
          <li className="flex items-start gap-2">
            <i className="fa-solid fa-check text-blue-500 mt-1 text-xs"></i>
            <span>{t('functionCreate.packages.guideItems.version')}</span>
          </li>
        </ul>
      </div>
      
      {/* Navigation */}
      <div className="flex justify-between pt-4 border-t border-stone-200">
        <button
          onClick={prevStep}
          className="flex items-center gap-2 px-6 py-2.5 rounded-lg font-medium
                     text-stone-600 hover:bg-stone-100 transition-colors"
        >
          <i className="fa-solid fa-arrow-left"></i>
          <span>{t('common.prev')}: {t('functionCreate.steps.resources')}</span>
        </button>
        
        <button
          onClick={nextStep}
          className="flex items-center gap-2 px-6 py-2.5 rounded-lg font-medium
                     bg-amber-500 text-white hover:bg-amber-600 shadow-lg shadow-amber-500/25 transition-all"
        >
          <span>{t('common.next')}: {t('functionCreate.steps.env')}</span>
          <i className="fa-solid fa-arrow-right"></i>
        </button>
      </div>
    </div>
  )
}
