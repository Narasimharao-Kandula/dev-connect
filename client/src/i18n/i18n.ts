import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import en from './en.json';
import es from './es.json';
import fr from './fr.json';
import de from './de.json';

const savedLang = typeof window !== 'undefined' ? localStorage.getItem('i18nextLng') : null;

i18n.use(initReactI18next).init({
  resources: { en: { translation: en }, es: { translation: es }, fr: { translation: fr }, de: { translation: de } },
  lng: savedLang || 'en',
  fallbackLng: 'en',
  interpolation: { escapeValue: false },
  detection: { order: ['localStorage'], caches: ['localStorage'] },
});

export default i18n;
