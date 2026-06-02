import { useEffect, useRef } from 'react';

export default function GoogleTranslate() {
  const initialized = useRef(false);

  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;

    const id = 'google_translate_element';
    if (!document.getElementById(id)) {
      const div = document.createElement('div');
      div.id = id;
      div.style.display = 'none';
      document.body.appendChild(div);
    }

    (window as any).googleTranslateElementInit = () => {
      new (window as any).google.translate.TranslateElement(
        { pageLanguage: 'en', includedLanguages: 'en,es,fr,de,pt,ja,ko,zh-CN,hi,ar,ru,it,nl', layout: (window as any).google.translate.TranslateElement.InlineLayout.SIMPLE, autoDisplay: false },
        'google_translate_element'
      );
    };

    if (!document.querySelector('script[src*="translate.google.com/translate_a/element.js"]')) {
      const script = document.createElement('script');
      script.src = 'https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit';
      script.async = true;
      document.head.appendChild(script);
    } else if ((window as any).google?.translate?.TranslateElement) {
      (window as any).googleTranslateElementInit();
    }
  }, []);

  return (
    <div className="flex items-center gap-1.5 text-sm">
      <svg className="w-4 h-4 text-gray-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 21l5.25-11.25L21 21m-9-3h7.5M3 5.621a48.474 48.474 0 016-.371m0 0c1.12 0 2.233.038 3.334.114M9 5.25V3m3.334 2.364C11.176 10.658 7.69 15.08 3 17.502m9.334-12.138c.896.061 1.78.147 2.653.255" />
      </svg>
      <div id="google_translate_widget" className="translate-widget" />
      <style>{`
        .translate-widget .goog-te-gadget { font-size: 0; line-height: 0; }
        .translate-widget .goog-te-gadget .goog-te-combo { 
          font-size: 13px; padding: 4px 8px; border-radius: 10px; border: 1px solid #e8e8ef;
          background: white; color: #4a4a62; cursor: pointer; outline: none;
          font-family: 'Inter', sans-serif; max-width: 130px;
        }
        .translate-widget .goog-te-gadget .goog-te-combo:hover { border-color: #6C4CF1; }
        .goog-te-banner-frame.skiptranslate { display: none !important; }
        body { top: 0 !important; }
      `}</style>
    </div>
  );
}
