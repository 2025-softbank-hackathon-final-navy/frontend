import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import LanguageDetector from 'i18next-browser-languagedetector'

// 언어 리소스 import
import ko from '../locales/ko/translation.json'
import en from '../locales/en/translation.json'
import ja from '../locales/ja/translation.json'

const resources = {
  ko: { translation: ko },
  en: { translation: en },
  ja: { translation: ja },
}

i18n
  .use(LanguageDetector) // 브라우저 언어 자동 감지
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'ko', // 기본 언어: 한국어
    supportedLngs: ['ko', 'en', 'ja'],
    
    interpolation: {
      escapeValue: false, // React already safes from xss
    },
    
    detection: {
      order: ['localStorage', 'navigator', 'htmlTag'],
      caches: ['localStorage'],
    },
  })

export default i18n

// 언어 변경 함수
export const changeLanguage = (lng: 'ko' | 'en' | 'ja') => {
  i18n.changeLanguage(lng)
}

// 현재 언어 가져오기
export const getCurrentLanguage = () => i18n.language

// 지원 언어 목록
export const SUPPORTED_LANGUAGES = [
  { code: 'ko', label: '한국어', flag: '🇰🇷' },
  { code: 'en', label: 'English', flag: '🇺🇸' },
  { code: 'ja', label: '日本語', flag: '🇯🇵' },
] as const

