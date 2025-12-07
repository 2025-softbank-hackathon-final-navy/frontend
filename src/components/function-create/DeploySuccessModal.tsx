import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'

interface DeploySuccessModalProps {
  functionId: string
  functionName: string
  invokeUrl: string
  onClose: () => void
}

export function DeploySuccessModal({
  functionId,
  functionName,
  invokeUrl,
  onClose,
}: DeploySuccessModalProps) {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(invokeUrl)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (error) {
      console.error('Failed to copy:', error)
    }
  }

  const handleViewDetail = () => {
    onClose()
    navigate(`/functions/${functionId}`)
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full mx-4 overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-green-500 to-emerald-500 p-6 text-white">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center">
              <i className="fa-solid fa-check text-3xl"></i>
            </div>
            <div>
              <h3 className="text-2xl font-bold">{t('functionCreate.deploySuccess.title')}</h3>
              <p className="text-green-50 text-sm mt-1">
                {t('functionCreate.deploySuccess.subtitle', { name: functionName })}
              </p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          {/* Invoke URL */}
          <div>
            <label className="block text-sm font-semibold text-stone-700 mb-2">
              <i className="fa-solid fa-link mr-2 text-amber-500"></i>
              {t('functionCreate.deploySuccess.invokeUrl')}
            </label>
            <div className="flex items-center gap-2">
              <div className="flex-1 bg-stone-50 border border-stone-200 rounded-lg p-3 font-mono text-sm break-all text-stone-700">
                {invokeUrl}
              </div>
              <button
                onClick={handleCopy}
                className={`
                  px-4 py-3 rounded-lg font-medium transition-all whitespace-nowrap
                  ${copied
                    ? 'bg-green-100 text-green-700 border border-green-300'
                    : 'bg-amber-500 text-white hover:bg-amber-600'
                  }
                `}
              >
                {copied ? (
                  <>
                    <i className="fa-solid fa-check mr-2"></i>
                    {t('functionCreate.deploySuccess.copied')}
                  </>
                ) : (
                  <>
                    <i className="fa-solid fa-copy mr-2"></i>
                    {t('functionCreate.deploySuccess.copy')}
                  </>
                )}
              </button>
            </div>
            <p className="text-xs text-stone-500 mt-2">
              {t('functionCreate.deploySuccess.invokeUrlDesc')}
            </p>
          </div>

          {/* Info Box */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <i className="fa-solid fa-lightbulb text-blue-500 mt-0.5"></i>
              <div className="text-sm text-blue-800">
                <p className="font-semibold mb-1">{t('functionCreate.deploySuccess.nextSteps')}</p>
                <ul className="list-disc list-inside space-y-1 text-blue-700">
                  <li>{t('functionCreate.deploySuccess.nextStep1')}</li>
                  <li>{t('functionCreate.deploySuccess.nextStep2')}</li>
                  <li>{t('functionCreate.deploySuccess.nextStep3')}</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex gap-3 p-4 bg-stone-50 border-t border-stone-200">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2.5 text-sm font-medium text-stone-600 bg-white border border-stone-300 rounded-lg hover:bg-stone-50 transition-colors"
          >
            {t('common.close')}
          </button>
          <button
            onClick={handleViewDetail}
            className="flex-1 px-4 py-2.5 text-sm font-medium text-white bg-amber-500 rounded-lg hover:bg-amber-600 transition-colors flex items-center justify-center gap-2"
          >
            <i className="fa-solid fa-eye"></i>
            {t('functionCreate.deploySuccess.viewDetail')}
          </button>
        </div>
      </div>
    </div>
  )
}

