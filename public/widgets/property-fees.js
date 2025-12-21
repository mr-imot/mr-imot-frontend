/**
 * MrImot Property Fees Calculator Widget
 * Embeddable calculator for Bulgarian real estate transfer fees
 * 
 * Usage:
 * <div id="mrimot-calculator"></div>
 * <script src="https://mrimot.com/widgets/property-fees.js" data-theme="light" data-lang="bg"></script>
 */

(function() {
  'use strict';

  // Configuration
  const CONFIG = {
    // Domain allowlist (empty = allow all, or specify allowed domains)
    ALLOWED_DOMAINS: [], // Example: ['example.com', 'partner.com']
    
    // Tracking endpoint (optional)
    TRACKING_ENDPOINT: 'https://mrimot.com/api/widget/track',
    
    // Brand info
    BRAND_URL: 'https://mrimot.com',
    BRAND_NAME: 'mrimot.com',
    
    // Exchange rate: 1 BGN = 0.5114 EUR (as of 21.12.2025)
    BGN_TO_EUR: 0.5114
  };

  // Domain validation
  function validateDomain() {
    if (CONFIG.ALLOWED_DOMAINS.length === 0) {
      return true; // Allow all if list is empty
    }
    
    const hostname = window.location.hostname;
    const allowed = CONFIG.ALLOWED_DOMAINS.some(domain => {
      return hostname === domain || hostname.endsWith('.' + domain);
    });
    
    if (!allowed) {
      console.warn('Widget: Domain not in allowlist');
      return false;
    }
    
    return true;
  }

  // Check if running in development/localhost
  function isDevelopment() {
    const hostname = window.location.hostname;
    return hostname === 'localhost' || 
           hostname === '127.0.0.1' || 
           hostname.startsWith('192.168.') ||
           hostname.startsWith('10.') ||
           hostname.endsWith('.local');
  }

  // Tracking function (with UTM parameters)
  function trackEvent(eventType, data) {
    try {
      // Skip tracking in development/localhost to avoid CORS errors
      if (isDevelopment()) {
        return;
      }

      const script = getScriptTag();
      const utmSource = script?.getAttribute('data-utm-source') || 'widget';
      const utmMedium = script?.getAttribute('data-utm-medium') || 'embed';
      const utmCampaign = script?.getAttribute('data-utm-campaign') || 'calculator';
      
      const trackingData = {
        event: eventType,
        domain: window.location.hostname,
        path: window.location.pathname,
        referrer: document.referrer,
        utm_source: utmSource,
        utm_medium: utmMedium,
        utm_campaign: utmCampaign,
        timestamp: new Date().toISOString(),
        ...data
      };

      // Send to tracking endpoint if configured
      if (CONFIG.TRACKING_ENDPOINT) {
        // Use sendBeacon for better reliability (doesn't throw CORS errors in console)
        if (navigator.sendBeacon) {
          try {
            const blob = new Blob([JSON.stringify(trackingData)], { type: 'application/json' });
            navigator.sendBeacon(CONFIG.TRACKING_ENDPOINT, blob);
          } catch (e) {
            // Silent fail - sendBeacon doesn't throw but catch just in case
          }
        } else {
          // Fallback to fetch with proper error handling
          fetch(CONFIG.TRACKING_ENDPOINT, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(trackingData),
            keepalive: true,
            mode: 'no-cors' // Prevents CORS errors in console (but also prevents reading response)
          }).catch(function() {
            // Silent fail - errors are already suppressed by no-cors mode
          });
        }
      }
    } catch (e) {
      // Silent fail - prevent any errors from bubbling up
    }
  }

  // Get script tag helper (needed for tracking)
  function getScriptTag() {
    const scripts = document.getElementsByTagName('script');
    for (let i = 0; i < scripts.length; i++) {
      if (scripts[i].src && scripts[i].src.includes('property-fees')) {
        return scripts[i];
      }
    }
    return null;
  }

  // Notary fee calculation function (lightly obfuscated)
  function _0x1a2b(m) {
    if (m < 0) throw new Error('Invalid');
    let f;
    if (m <= 100) f = 30;
    else if (m <= 1000) f = 30 + 0.015 * (m - 100);
    else if (m <= 10000) f = 43.50 + 0.013 * (m - 1000);
    else if (m <= 50000) f = 160.50 + 0.008 * (m - 10000);
    else if (m <= 100000) f = 480.50 + 0.005 * (m - 50000);
    else if (m <= 500000) f = 730.50 + 0.002 * (m - 100000);
    else {
      f = 1530.50 + 0.001 * (m - 500000);
      if (f > 6000) f = 6000;
    }
    return Math.round(f * 100) / 100;
  }

  // Alias for cleaner code
  const calculateNotaryFeeWithoutVAT = _0x1a2b;

  // Localization
  const translations = {
    bg: {
      title: 'Калкулатор такси при покупка на имот',
      materialInterest: 'Материален интерес (EUR)',
      municipality: 'Община',
      calculate: 'Пресметни',
      clear: 'Изчисти',
      results: 'Резултати',
      notaryFee: 'Нотариална такса',
      notaryFeeVAT: 'ДДС нотариални такси (20%)',
      localTax: 'Общински данък',
      registrationFee: 'Такса вписване',
      total: 'Общо',
      footer: 'Калкулатор такси при покупка на имот – предоставен от',
      placeholder: 'Въведете сума',
      error: 'Моля, въведете валидна сума'
    },
    en: {
      title: 'Property Purchase Fees Calculator',
      materialInterest: 'Material Interest (EUR)',
      municipality: 'Municipality',
      calculate: 'Calculate',
      clear: 'Clear',
      results: 'Results',
      notaryFee: 'Notary Fee',
      notaryFeeVAT: 'VAT on Notary Fee (20%)',
      localTax: 'Local Tax',
      registrationFee: 'Registration Fee',
      total: 'Total',
      footer: 'Property purchase fees calculator – provided by',
      placeholder: 'Enter amount',
      error: 'Please enter a valid amount'
    }
  };

  // Municipality tax rates (complete list from official data)
  const municipalityRates = {
    'Айтос': 2.3,
    'Аксаково': 3.0,
    'Алфатар': 2.5,
    'Антон': 3.0,
    'Антоново': 2.0,
    'Априлци': 2.6,
    'Ардино': 3.0,
    'Асеновград': 2.5,
    'Балчик': 3.0,
    'Баните': 3.0,
    'Банско': 3.0,
    'Батак': 3.0,
    'Белене': 3.0,
    'Белица': 2.0,
    'Белово': 2.2,
    'Белоградчик': 3.0,
    'Белослав': 3.0,
    'Берковица': 2.5,
    'Благоевград': 2.9,
    'Бобовдол': 2.6,
    'Бобошево': 2.0,
    'Божурище': 3.0,
    'Бойница': 2.6,
    'Бойчиновци': 2.5,
    'Болярово': 3.0,
    'Борино': 2.2,
    'Борован': 2.3,
    'Борово': 2.6,
    'Ботевград': 3.0,
    'Братя Даскалови': 2.0,
    'Брацигово': 2.0,
    'Брегово': 3.0,
    'Брезик': 2.5,
    'Брезово': 3.0,
    'Брусарци': 2.5,
    'Бургас': 3.0,
    'Бяла Варна': 3.0,
    'Бяла Русе': 3.0,
    'Бяла Слатина': 3.0,
    'Варна': 3.0,
    'Велики Преслав': 3.0,
    'Велико Търново': 3.0,
    'Велинград': 3.0,
    'Венец': 3.0,
    'Ветово': 2.6,
    'Ветрино': 3.0,
    'Видин': 3.0,
    'Враца': 2.5,
    'Вълчедръм': 2.6,
    'Вълчи Дол': 3.0,
    'Върбица': 3.0,
    'Вършец': 2.5,
    'Габрово': 2.5,
    'Генерал Тошево': 3.0,
    'Георги Дамяново': 2.5,
    'Главиница': 3.0,
    'Годеч': 3.0,
    'Горна Малина': 3.0,
    'Горна Оряховица': 3.0,
    'Гоце Делчев': 2.0,
    'Грамада': 3.0,
    'Гулянци': 3.0,
    'Гурково': 2.0,
    'Гълъбово': 2.5,
    'Гърмен': 2.5,
    'Две Могили': 2.6,
    'Девин': 2.6,
    'Девня': 3.0,
    'Джебел': 2.5,
    'Димитровград': 3.0,
    'Димово': 2.8,
    'Добрич': 2.6,
    'Добричка': 3.0,
    'Долна Баня': 3.0,
    'Долна Митрополия': 2.9,
    'Долни Дъбник': 2.0,
    'Долни Чифлик': 2.5,
    'Доспат': 2.5,
    'Драгоман': 3.0,
    'Дряново': 3.0,
    'Дулово': 3.0,
    'Дупница': 2.5,
    'Дългопол': 3.0,
    'Елена': 2.5,
    'Елин Пелин': 3.0,
    'Елхово': 3.0,
    'Етрополе': 3.0,
    'Завет': 2.6,
    'Земен': 2.2,
    'Златарица': 3.0,
    'Златица': 3.0,
    'Златоград': 3.0,
    'Ивайловград': 2.5,
    'Иваново': 2.6,
    'Искър': 2.5,
    'Исперих': 3.0,
    'Ихтиман': 3.0,
    'Каварна': 3.0,
    'Казанлък': 3.0,
    'Кайнарджа': 2.5,
    'Калояново': 1.5,
    'Камено': 3.0,
    'Каолиново': 3.0,
    'Карлово': 3.0,
    'Карнобат': 2.6,
    'Каспичан': 2.5,
    'Кирково': 3.0,
    'Кнежа': 3.0,
    'Ковачевци': 3.0,
    'Козлодуй': 3.0,
    'Копривщица': 3.0,
    'Костенец': 2.5,
    'Костинброд': 3.0,
    'Котел': 2.6,
    'Кочериново': 3.0,
    'Кресна': 3.0,
    'Криводол': 3.0,
    'Кричим': 3.0,
    'Крумовград': 2.5,
    'Крушари': 3.0,
    'Кубрат': 2.5,
    'Куклен': 3.0,
    'Кула': 2.0,
    'Кърджали': 3.0,
    'Кюстендил': 2.9,
    'Левски': 3.0,
    'Лесичово': 3.0,
    'Летница': 2.5,
    'Ловеч': 2.0,
    'Лозница': 2.6,
    'Лом': 2.8,
    'Луковит': 3.0,
    'Лъки': 2.5,
    'Любимец': 3.0,
    'Лясковец': 2.8,
    'Мадан': 3.0,
    'Маджарово': 3.0,
    'Макреш': 3.0,
    'Малко Търново': 3.0,
    'Марица': 2.5,
    'Медковец': 2.0,
    'Мездра': 3.0,
    'Мизия': 2.0,
    'Минерални Бани': 2.5,
    'Мирково': 2.0,
    'Момчилград': 3.0,
    'Монтана': 3.0,
    'Мъглиж': 2.5,
    'Невестино': 3.0,
    'Неделино': 2.0,
    'Несебър': 3.0,
    'Никола Козлево': 2.6,
    'Николаево': 2.5,
    'Никопол': 3.0,
    'Нова Загора': 3.0,
    'Нови Пазар': 3.0,
    'Ново Село': 2.5,
    'Омуртаг': 3.0,
    'Опака': 2.2,
    'Опан': 3.0,
    'Оряхово': 3.0,
    'Павел Баня': 3.0,
    'Павликени': 3.0,
    'Пазарджик': 3.0,
    'Панагюрище': 2.6,
    'Перник': 3.0,
    'Перущица': 2.5,
    'Петрич': 2.5,
    'Пещера': 2.8,
    'Пирдоп': 1.0,
    'Плевен': 2.85,
    'Пловдив': 3.0,
    'Полски Тръмбеш': 3.0,
    'Поморие': 3.0,
    'Попово': 2.8,
    'Пордим': 2.9,
    'Правец': 3.0,
    'Приморско': 3.0,
    'Провадия': 2.5,
    'Първомай': 3.0,
    'Раднево': 2.5,
    'Радомир': 2.5,
    'Разград': 3.0,
    'Разлог': 2.2,
    'Ракитово': 2.5,
    'Раковски': 2.6,
    'Рила': 3.0,
    'Родопи': 3.0,
    'Роман': 3.0,
    'Рудозем': 3.0,
    'Руен': 2.6,
    'Ружинци': 2.6,
    'Русе': 3.0,
    'Садово': 3.0,
    'Самоков': 3.0,
    'Самуил': 2.0,
    'Сандански': 3.0,
    'Сапарева Баня': 2.6,
    'Сатовча': 2.0,
    'Свиленград': 3.0,
    'Свищов': 3.0,
    'Своге': 3.0,
    'Севлиево': 3.0,
    'Септември': 2.6,
    'Силистра': 3.0,
    'Симеоновград': 2.4,
    'Симитли': 2.0,
    'Ситово': 2.0,
    'Сливен': 2.8,
    'Сливница': 2.6,
    'Сливо Поле': 2.5,
    'Смолян': 2.8,
    'Смядово': 3.0,
    'Созопол': 3.0,
    'Сопот': 3.0,
    'Средец': 3.0,
    'Стамболийски': 3.0,
    'Стамболово': 3.0,
    'Стара Загора': 3.0,
    'София': 3.0,
    'Стражица': 3.0,
    'Стралджа': 3.0,
    'Стрелча': 3.0,
    'Струмяни': 2.1,
    'Суворово': 3.0,
    'Сунгурларе': 3.0,
    'Сухиндол': 2.6,
    'Съединение': 3.0,
    'Сърница': 2.5,
    'Твърдица': 2.0,
    'Тервел': 3.0,
    'Тетевен': 3.0,
    'Тополовград': 3.0,
    'Трекляно': 2.5,
    'Троян': 3.0,
    'Трън': 2.5,
    'Трявна': 3.0,
    'Тунджа': 2.5,
    'Тутракан': 3.0,
    'Търговище': 3.0,
    'Угърчин': 2.0,
    'Хаджидимово': 2.0,
    'Хайредин': 2.6,
    'Харманли': 2.5,
    'Хасково': 3.0,
    'Хисаря': 2.9,
    'Хитрино': 2.0,
    'Цар Калоян': 2.2,
    'Царево': 3.0,
    'Ценово': 3.0,
    'Чавар': 1.6,
    'Челопеч': 2.0,
    'Чепеларе': 3.0,
    'Червен Бряг': 3.0,
    'Черноочене': 1.8,
    'Чипровци': 2.5,
    'Чирпан': 3.0,
    'Чупрене': 2.5,
    'Шабла': 3.0,
    'Шумен': 2.6,
    'Ябланица': 2.5,
    'Якимово': 2.6,
    'Якоруда': 2.0,
    'Ямбол': 3.0
  };


  // Get configuration from script tag
  function getConfig() {
    const script = getScriptTag();
    return {
      theme: script?.getAttribute('data-theme') || 'light',
      lang: script?.getAttribute('data-lang') || 'bg',
      targetId: script?.getAttribute('data-target') || 'mrimot-calculator'
    };
  }

  // CSS styles
  function getStyles(theme) {
    const isDark = theme === 'dark';
    const bgColor = isDark ? '#1a1a1a' : '#ffffff';
    const textColor = isDark ? '#e0e0e0' : '#333333';
    const borderColor = isDark ? '#444444' : '#e0e0e0';
    const primaryColor = '#2563eb';
    const primaryHover = '#1d4ed8';
    const secondaryColor = isDark ? '#2a2a2a' : '#f5f5f5';

    return `
      <style>
        :host {
          display: block;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
          font-size: 14px;
          line-height: 1.5;
          color: ${textColor};
          background: ${bgColor};
          border: 1px solid ${borderColor};
          border-radius: 8px;
          padding: 20px;
          max-width: 600px;
          margin: 0 auto;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        }

        .calculator-title {
          font-size: 20px;
          font-weight: 600;
          margin-bottom: 20px;
          color: ${textColor};
        }

        .calculator-form {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .form-group {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .form-label {
          font-weight: 500;
          font-size: 14px;
          color: ${textColor};
        }

        .form-input,
        .form-select {
          padding: 10px 12px;
          border: 1px solid ${borderColor};
          border-radius: 6px;
          font-size: 14px;
          background: ${isDark ? '#2a2a2a' : '#ffffff'};
          color: ${textColor};
          transition: border-color 0.2s;
        }

        .form-input:focus,
        .form-select:focus {
          outline: none;
          border-color: ${primaryColor};
          box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1);
        }

        .form-actions {
          display: flex;
          gap: 10px;
          margin-top: 8px;
        }

        .btn {
          padding: 10px 20px;
          border: none;
          border-radius: 6px;
          font-size: 14px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s;
          flex: 1;
        }

        .btn-primary {
          background: ${primaryColor};
          color: white;
        }

        .btn-primary:hover {
          background: ${primaryHover};
        }

        .btn-secondary {
          background: ${secondaryColor};
          color: ${textColor};
          border: 1px solid ${borderColor};
        }

        .btn-secondary:hover {
          background: ${isDark ? '#333333' : '#e8e8e8'};
        }

        .results {
          margin-top: 24px;
          padding-top: 24px;
          border-top: 1px solid ${borderColor};
        }

        .results-title {
          font-size: 18px;
          font-weight: 600;
          margin-bottom: 16px;
          color: ${textColor};
        }

        .result-item {
          display: flex;
          justify-content: space-between;
          padding: 10px 0;
          border-bottom: 1px solid ${borderColor};
        }

        .result-item:last-child {
          border-bottom: none;
        }

        .result-label {
          color: ${isDark ? '#b0b0b0' : '#666666'};
        }

        .result-value {
          font-weight: 600;
          color: ${textColor};
        }

        .result-total {
          margin-top: 12px;
          padding-top: 12px;
          border-top: 2px solid ${primaryColor};
        }

        .result-total .result-label {
          font-size: 16px;
          font-weight: 600;
          color: ${textColor};
        }

        .result-total .result-value {
          font-size: 18px;
          color: ${primaryColor};
        }

        .error-message {
          color: #dc2626;
          font-size: 13px;
          margin-top: 4px;
        }

        .footer {
          margin-top: 24px;
          padding-top: 16px;
          border-top: 1px solid ${borderColor};
          text-align: center;
          font-size: 12px;
          color: ${isDark ? '#888888' : '#666666'};
          position: relative;
          user-select: none;
        }

        .footer a {
          color: ${primaryColor};
          text-decoration: none;
          font-weight: 500;
          pointer-events: auto;
        }

        .footer a:hover {
          text-decoration: underline;
        }

        /* Prevent footer removal */
        .footer::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          z-index: 1;
          pointer-events: none;
        }

        .footer-text {
          position: relative;
          z-index: 2;
        }

        @media (max-width: 640px) {
          :host {
            padding: 16px;
          }

          .calculator-title {
            font-size: 18px;
          }

          .form-actions {
            flex-direction: column;
          }
        }
      </style>
    `;
  }

  // Generate HTML
  function getHTML(t) {
    const municipalities = Object.keys(municipalityRates).sort();
    const municipalityOptions = municipalities.map(m => 
      `<option value="${m}">${m}</option>`
    ).join('');

    return `
      <div class="calculator-title">${t.title}</div>
      <form class="calculator-form" id="calc-form">
        <div class="form-group">
          <label class="form-label" for="material-interest">${t.materialInterest}</label>
          <input 
            type="number" 
            id="material-interest" 
            class="form-input" 
            placeholder="${t.placeholder}"
            min="0"
            step="0.01"
            required
          />
          <div class="error-message" id="error-message" style="display: none;"></div>
        </div>
        <div class="form-group">
          <label class="form-label" for="municipality">${t.municipality}</label>
          <select id="municipality" class="form-select">
            ${municipalityOptions}
          </select>
        </div>
        <div class="form-actions">
          <button type="submit" class="btn btn-primary">${t.calculate}</button>
          <button type="button" class="btn btn-secondary" id="clear-btn">${t.clear}</button>
        </div>
      </form>
      <div class="results" id="results" style="display: none;">
        <div class="results-title">${t.results}</div>
        <div class="result-item">
          <span class="result-label">${t.notaryFee}</span>
          <span class="result-value" id="notary-fee">-</span>
        </div>
        <div class="result-item">
          <span class="result-label">${t.notaryFeeVAT}</span>
          <span class="result-value" id="notary-fee-vat">-</span>
        </div>
        <div class="result-item">
          <span class="result-label">${t.localTax}</span>
          <span class="result-value" id="local-tax">-</span>
        </div>
        <div class="result-item">
          <span class="result-label">${t.registrationFee}</span>
          <span class="result-value" id="registration-fee">-</span>
        </div>
        <div class="result-item result-total">
          <span class="result-label">${t.total}</span>
          <span class="result-value" id="total-fee">-</span>
        </div>
      </div>
      <div class="footer">
        <div class="footer-text">
          ${t.footer} <a href="${CONFIG.BRAND_URL}?utm_source=widget&utm_medium=embed&utm_campaign=calculator" target="_blank" rel="dofollow">${CONFIG.BRAND_NAME}</a>
        </div>
      </div>
    `;
  }

  // Format currency in EUR
  function formatCurrency(amount) {
    return new Intl.NumberFormat('bg-BG', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount);
  }
  
  // Convert EUR to BGN for calculations
  function eurToBgn(eur) {
    return eur / CONFIG.BGN_TO_EUR;
  }
  
  // Convert BGN to EUR for display
  function bgnToEur(bgn) {
    return bgn * CONFIG.BGN_TO_EUR;
  }

  // Calculate all fees
  // Input materialInterest is in EUR, we convert to BGN for calculations, then back to EUR for display
  function calculateFees(materialInterestEUR, municipality) {
    // Convert EUR input to BGN for calculations (all official rates are in BGN)
    const materialInterestBGN = eurToBgn(materialInterestEUR);
    
    // Calculate fees in BGN
    const notaryFeeBGN = calculateNotaryFeeWithoutVAT(materialInterestBGN);
    const notaryFeeVATBGN = notaryFeeBGN * 0.20;
    const localTaxRate = municipalityRates[municipality] || 3.0;
    const localTaxBGN = materialInterestBGN * (localTaxRate / 100);
    const registrationFeeBGN = Math.max(materialInterestBGN * 0.001, 10);
    
    // Convert all fees back to EUR for display
    const notaryFee = bgnToEur(notaryFeeBGN);
    const notaryFeeVAT = bgnToEur(notaryFeeVATBGN);
    const localTax = bgnToEur(localTaxBGN);
    const registrationFee = bgnToEur(registrationFeeBGN);
    const total = notaryFee + notaryFeeVAT + localTax + registrationFee;

    return {
      notaryFee,
      notaryFeeVAT,
      localTax,
      registrationFee,
      total
    };
  }

  // Initialize widget with retry mechanism
  function initWidget(retryCount = 0) {
    const MAX_RETRIES = 10;
    const RETRY_DELAY = 200; // 200ms between retries
    
    // Domain validation
    if (!validateDomain()) {
      const target = document.getElementById(getConfig().targetId);
      if (target) {
        target.innerHTML = '<p style="color: #dc2626; padding: 20px; text-align: center;">Калкулаторът не е достъпен за този домейн.</p>';
      }
      trackEvent('domain_blocked', { domain: window.location.hostname });
      return;
    }

    const config = getConfig();
    const t = translations[config.lang] || translations.bg;
    
    // Find target element
    let target = document.getElementById(config.targetId);
    
    // If target not found, retry (for React/SSR scenarios)
    if (!target) {
      if (retryCount < MAX_RETRIES) {
        setTimeout(function() {
          initWidget(retryCount + 1);
        }, RETRY_DELAY);
        return;
      }
      // If still not found after retries, create fallback (shouldn't happen in normal use)
      console.warn('Widget: Target element not found, creating fallback');
      target = document.createElement('div');
      target.id = config.targetId;
      document.body.appendChild(target);
    }

    // Check if Shadow DOM already exists (prevent double initialization)
    if (target.shadowRoot) {
      // Widget already initialized, skip
      return;
    }

    // Create shadow DOM
    const shadow = target.attachShadow({ mode: 'open' });
    
    // Inject styles and HTML
    shadow.innerHTML = getStyles(config.theme) + getHTML(t);

    // Get elements
    const form = shadow.getElementById('calc-form');
    const clearBtn = shadow.getElementById('clear-btn');
    const results = shadow.getElementById('results');
    const errorMsg = shadow.getElementById('error-message');
    const materialInterestInput = shadow.getElementById('material-interest');
    const municipalitySelect = shadow.getElementById('municipality');

    // Track widget load
    trackEvent('widget_loaded', {
      theme: config.theme,
      lang: config.lang,
      domain: window.location.hostname
    });

    // Form submit handler
    form.addEventListener('submit', function(e) {
      e.preventDefault();
      
      const materialInterest = parseFloat(materialInterestInput.value);
      
      if (isNaN(materialInterest) || materialInterest < 0) {
        errorMsg.textContent = t.error;
        errorMsg.style.display = 'block';
        results.style.display = 'none';
        trackEvent('calculation_error', { error: 'invalid_input' });
        return;
      }

      errorMsg.style.display = 'none';
      
      const municipality = municipalitySelect.value;
      const fees = calculateFees(materialInterest, municipality);

      // Update results
      shadow.getElementById('notary-fee').textContent = formatCurrency(fees.notaryFee);
      shadow.getElementById('notary-fee-vat').textContent = formatCurrency(fees.notaryFeeVAT);
      shadow.getElementById('local-tax').textContent = formatCurrency(fees.localTax);
      shadow.getElementById('registration-fee').textContent = formatCurrency(fees.registrationFee);
      shadow.getElementById('total-fee').textContent = formatCurrency(fees.total);

      results.style.display = 'block';

      // Track calculation
      trackEvent('calculation_completed', {
        materialInterest,
        municipality,
        totalFee: fees.total
      });
    });

    // Clear button handler
    clearBtn.addEventListener('click', function() {
      form.reset();
      results.style.display = 'none';
      errorMsg.style.display = 'none';
      materialInterestInput.focus();
      trackEvent('calculation_cleared', {});
    });

    // Prevent footer removal attempts
    const footer = shadow.querySelector('.footer');
    if (footer) {
      const observer = new MutationObserver(function(mutations) {
        mutations.forEach(function(mutation) {
          if (mutation.removedNodes.length > 0) {
            mutation.removedNodes.forEach(function(node) {
              if (node === footer || (node.nodeType === 1 && node.contains && node.contains(footer))) {
                const resultsDiv = shadow.getElementById('results');
                if (resultsDiv && resultsDiv.nextSibling !== footer) {
                  resultsDiv.parentNode.appendChild(footer);
                }
                trackEvent('footer_removal_attempt', {});
              }
            });
          }
        });
      });

      observer.observe(shadow, {
        childList: true,
        subtree: true
      });
    }
  }

  // Initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initWidget);
  } else {
    initWidget();
  }
})();

