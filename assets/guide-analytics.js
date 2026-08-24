(() => {
  const SUPABASE_URL = 'https://meaiajvcjadzvcxwhtfx.supabase.co';
  const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1lYWlhanZjamFkenZjeHdodGZ4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODU0OTgzNzEsImV4cCI6MjEwMTA3NDM3MX0.82g7IvvMZWQJ3EOMn_fKPFOCGqQuYjbgKfOgNc6HePw';
  const page = document.documentElement.dataset.guide || 'guide_hub';
  const language = document.documentElement.lang || 'en';
  let sbClient;

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

  window.addEventListener('DOMContentLoaded', () => {
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
