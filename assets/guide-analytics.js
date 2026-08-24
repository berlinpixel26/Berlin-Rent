(() => {
  const SUPABASE_URL = 'https://meaiajvcjadzvcxwhtfx.supabase.co';
  const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1lYWlhanZjamFkenZjeHdodGZ4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODU0OTgzNzEsImV4cCI6MjEwMTA3NDM3MX0.82g7IvvMZWQJ3EOMn_fKPFOCGqQuYjbgKfOgNc6HePw';
  const page = document.documentElement.dataset.guide || 'guide_hub';
  const language = document.documentElement.lang || 'en';
  let sbClient;

  const guideOrder = language === 'de' ? {
    warm_rent_vs_cold_rent: ['../typische-miete-nach-zimmern-berlin/', 'Nächster Ratgeber: Typische Miete nach Zimmern →'],
    typical_rent_by_room: ['../miete-nach-bezirk-berlin/', 'Nächster Ratgeber: Miete nach Bezirk →'],
    rent_by_district: ['../typische-kaution-berlin/', 'Nächster Ratgeber: Typische Kaution →'],
    typical_deposit: ['../warum-mietbeginn-zaehlt/', 'Nächster Ratgeber: Warum Mietbeginn zählt →'],
    rent_since: ['../', 'Alle Ratgeber →']
  } : {
    warm_rent_vs_cold_rent: ['../typical-rent-by-room-berlin/', 'Next: Typical rent by room →'],
    typical_rent_by_room: ['../berlin-rent-by-district/', 'Next: Berlin rent by district →'],
    rent_by_district: ['../typical-deposit-berlin/', 'Next: Typical deposit in Berlin →'],
    typical_deposit: ['../how-rent-since-affects-berlin-rent/', 'Next: Why Rent since matters →'],
    rent_since: ['../', 'All guides →']
  };

  function visitorId() {
    let id = localStorage.getItem('visitorId');
    if (!id) {
      id = `visitor_${Date.now()}_${Math.random().toString(36).slice(2, 11)}`;
      localStorage.setItem('visitorId', id);
    }
    return id;
  }

  function visitorSource() {
    let source = localStorage.getItem('visitorSource');
    if (!source) {
      const params = new URLSearchParams(window.location.search);
      if (params.get('utm_source')) {
        source = `${params.get('utm_source')}/${params.get('utm_medium') || 'referral'}`;
      } else if (document.referrer) {
        try {
          const host = new URL(document.referrer).hostname.replace(/^www\./, '');
          source = host && host !== window.location.hostname ? host : 'direct';
        } catch (_) { source = 'direct'; }
      } else { source = 'direct'; }
      localStorage.setItem('visitorSource', source);
    }
    return source;
  }

  async function initSupabase() {
    if (sbClient || !window.supabase) return sbClient;
    sbClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    return sbClient;
  }

  async function track(eventName, metadata = {}) {
    const payload = { page, language, ...metadata };
    try { if (typeof window.gtag === 'function') window.gtag('event', eventName, payload); } catch (_) {}
    try {
      const client = await initSupabase();
      if (!client) return;
      await client.from('user_events').insert({
        visitor_id: visitorId(), event_name: eventName, metadata: payload, referrer_source: visitorSource()
      });
    } catch (_) {}
  }

  async function recordPageVisit() {
    try {
      const client = await initSupabase();
      if (!client) return;
      await client.from('page_visits').insert({
        visitor_id: visitorId(), path: window.location.pathname || '/',
        referrer: document.referrer || null, user_agent: navigator.userAgent
      });
    } catch (_) {}
  }

  function addGuideContext() {
    const article = document.querySelector('.guide-article');
    const hero = document.querySelector('.guide-hero');
    const snapshot = document.createElement('section');
    snapshot.className = 'live-snapshot';
    snapshot.setAttribute('data-live-snapshot', '');
    snapshot.setAttribute('aria-live', 'polite');
    snapshot.innerHTML = `<p class="live-loading">${language === 'de' ? 'Live GermanyRent Übersicht wird geladen...' : 'Loading live GermanyRent snapshot...'}</p>`;

    if (article) {
      const pageNavigation = document.createElement('nav');
      pageNavigation.className = 'article-pagination';
      const next = guideOrder[page];
      const backLabel = language === 'de' ? '← Zurück zu den Ratgebern' : '← Back to guides';
      pageNavigation.innerHTML = `<a href="../" data-guide-action="guide_back_to_hub_clicked">${backLabel}</a><a class="next-guide" href="${next ? next[0] : '../'}" data-guide-action="guide_next_clicked" data-guide-target="${next ? next[0] : 'guide_hub'}">${next ? next[1] : (language === 'de' ? 'Alle Ratgeber →' : 'All guides →')}</a>`;
      article.parentNode.insertBefore(pageNavigation, article);
      const lede = article.querySelector('.lede');
      if (lede) lede.insertAdjacentElement('afterend', snapshot);
      else article.insertBefore(snapshot, article.firstChild);
    } else if (hero) {
      hero.insertAdjacentElement('afterend', snapshot);
    } else {
      return;
    }

    const stylesheet = document.querySelector('link[href$="guides.css"]');
    if (!stylesheet) return;
    const script = document.createElement('script');
    script.src = new URL('guide-live-stats.js', stylesheet.href).toString();
    script.defer = true;
    document.head.appendChild(script);
  }

  window.addEventListener('DOMContentLoaded', () => {
    addGuideContext();
    recordPageVisit();
    track('guide_viewed');
    document.querySelectorAll('[data-guide-action]').forEach(el => {
      if (el.dataset.guideAction === 'guide_share_rent_clicked' && el.href) {
        const target = new URL(el.href, window.location.href);
        target.hash = '';
        target.searchParams.set('contribute', '1');
        el.href = target.toString();
      }
      el.addEventListener('click', () => track(el.dataset.guideAction, { target: el.dataset.guideTarget || null }));
    });
  });
})();
