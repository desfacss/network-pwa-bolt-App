import antdEnUS from 'antd/es/locale/en_US';
import antdFrFR from 'antd/es/locale/fr_FR';
import en from './locales/en_US.json'
import fr from './locales/fr_FR.json'
import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import { THEME_CONFIG } from 'configs/AppConfig';

export const resources = {
    en: {
        translation: en,
        antd: antdEnUS
    },
    fr: {
        translation: fr,
        antd: antdFrFR
    },
}

i18n.use(initReactI18next).init({
    resources,
    fallbackLng: THEME_CONFIG.locale,
    lng: THEME_CONFIG.locale,
    interpolation: {
        escapeValue: false 
    }
})

export default i18n;