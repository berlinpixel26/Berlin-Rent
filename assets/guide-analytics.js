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
    rent_since: ['../mietangebot-berlin-vergleichen/', 'Nächster Ratgeber: Mietangebot vergleichen →'],
    compare_rent_offer: ['../mietspiegel-vs-echte-mieten-berlin/', 'Nächster Ratgeber: Mietspiegel und echte Mieten →'],
    mietspiegel_vs_real_rents: ['../moebliert-vs-unmoebliert-berlin/', 'Nächster Ratgeber: Möbliert oder unmöbliert →'],
    furnished_vs_unfurnished: ['../ganze-wohnung-vs-wg-zimmer-berlin/', 'Nächster Ratgeber: Ganze Wohnung oder WG-Zimmer →'],
    whole_flat_vs_shared_room: ['../einzugskosten-berlin/', 'Nächster Ratgeber: Einzugskosten →'],
    move_in_costs: ['../germanyrent-daten-richtig-lesen/', 'Nächster Ratgeber: GermanyRent Daten richtig lesen →'],
    reading_germanyrent_data: ['../wie-germanyrent-daten-funktionieren/', 'Nächster Ratgeber: So funktionieren GermanyRent Daten →'],
    how_germanyrent_data_works: ['../guenstig-mieten-berlin/', 'Nächster Ratgeber: Günstig mieten in Berlin →'],
    cheapest_rent_now: ['../berliner-mietspiegel-2026-was-sich-geaendert-hat/', 'Nächster Ratgeber: Mietspiegel 2026 →'],
    mietspiegel_2026_update: ['../', 'Alle Ratgeber →']
  } : {
    warm_rent_vs_cold_rent: ['../typical-rent-by-room-berlin/', 'Next: Typical rent by room →'],
    typical_rent_by_room: ['../berlin-rent-by-district/', 'Next: Berlin rent by district →'],
    rent_by_district: ['../typical-deposit-berlin/', 'Next: Typical deposit in Berlin →'],
    typical_deposit: ['../how-rent-since-affects-berlin-rent/', 'Next: Why Rent since matters →'],
    rent_since: ['../compare-berlin-rent-offer/', 'Next: Compare a Berlin rent offer →'],
    compare_rent_offer: ['../mietspiegel-vs-real-rents-berlin/', 'Next: Mietspiegel vs real rents →'],
    mietspiegel_vs_real_rents: ['../furnished-vs-unfurnished-rent-berlin/', 'Next: Furnished vs unfurnished rent →'],
    furnished_vs_unfurnished: ['../whole-flat-vs-shared-room-berlin/', 'Next: Whole flat vs shared room →'],
    whole_flat_vs_shared_room: ['../berlin-move-in-costs/', 'Next: Berlin move-in costs →'],
    move_in_costs: ['../how-to-read-germanyrent-data/', 'Next: How to read GermanyRent data →'],
    reading_germanyrent_data: ['../how-germanyrent-data-works/', 'Next: How GermanyRent data works →'],
    how_germanyrent_data_works: ['../cheapest-rent-in-berlin-now/', 'Next: Cheapest places to rent in Berlin →'],
    cheapest_rent_now: ['../berlin-rent-index-2026-key-takeaways/', 'Next: Berlin Rent Index 2026 key takeaways →'],
    mietspiegel_2026_update: ['../', 'Alle Ratgeber →']
  };

  const categories = language === 'de' ? {
    understand_rent: ['Miete verstehen', 'Mietbegriffe, Mietbeginn und offizieller Kontext.'],
    compare_homes: ['Wohnungen vergleichen', 'Vergleiche ähnliche Wohnungen mit dem passenden Kontext.'],
    choose_area: ['Gebiete auswählen', 'Nutze Mietdaten als Startpunkt für deine Wohnungssuche.'],
    plan_move: ['Einzug planen', 'Plane Kaution und die Kosten rund um den Umzug.'],
    use_germanyrent: ['GermanyRent nutzen', 'Verstehe die Daten und nutze sie verantwortungsvoll.']
  } : {
    understand_rent: ['Understand rent', 'Rent terms, Rent since, and official context.'],
    compare_homes: ['Compare homes', 'Compare similar homes with the right context.'],
    choose_area: ['Choose an area', 'Use rent data as a starting point for your search.'],
    plan_move: ['Plan your move', 'Plan deposit and costs around the move.'],
    use_germanyrent: ['Using GermanyRent', 'Understand the data and use it responsibly.']
  };

  const categoryByGuide = {
    warm_rent_vs_cold_rent: 'understand_rent', rent_since: 'understand_rent',
    mietspiegel_vs_real_rents: 'understand_rent', mietspiegel_2026_update: 'understand_rent',
    typical_rent_by_room: 'compare_homes', compare_rent_offer: 'compare_homes',
    furnished_vs_unfurnished: 'compare_homes', whole_flat_vs_shared_room: 'compare_homes',
    rent_by_district: 'choose_area', cheapest_rent_now: 'choose_area',
    typical_deposit: 'plan_move', move_in_costs: 'plan_move', reading_germanyrent_data: 'use_germanyrent',
    how_germanyrent_data_works: 'use_germanyrent'
  };

  const relatedGuides = language === 'de' ? {
    warm_rent_vs_cold_rent: [['../typische-miete-nach-zimmern-berlin/', 'Typische Miete nach Zimmern'], ['../mietangebot-berlin-vergleichen/', 'Ein Mietangebot vergleichen'], ['../wie-germanyrent-daten-funktionieren/', 'So funktionieren GermanyRent Daten']],
    typical_rent_by_room: [['../mietangebot-berlin-vergleichen/', 'Ein Mietangebot vergleichen'], ['../moebliert-vs-unmoebliert-berlin/', 'Möbliert oder unmöbliert'], ['../miete-nach-bezirk-berlin/', 'Miete nach Bezirk']],
    rent_by_district: [['../guenstig-mieten-berlin/', 'Günstig mieten in Berlin'], ['../typische-miete-nach-zimmern-berlin/', 'Typische Miete nach Zimmern'], ['../wie-germanyrent-daten-funktionieren/', 'So funktionieren GermanyRent Daten']],
    typical_deposit: [['../einzugskosten-berlin/', 'Einzugskosten in Berlin'], ['../mietangebot-berlin-vergleichen/', 'Ein Mietangebot vergleichen'], ['../wie-germanyrent-daten-funktionieren/', 'So funktionieren GermanyRent Daten']],
    rent_since: [['../typische-miete-nach-zimmern-berlin/', 'Typische Miete nach Zimmern'], ['../mietangebot-berlin-vergleichen/', 'Ein Mietangebot vergleichen'], ['../wie-germanyrent-daten-funktionieren/', 'So funktionieren GermanyRent Daten']],
    compare_rent_offer: [['../typische-miete-nach-zimmern-berlin/', 'Typische Miete nach Zimmern'], ['../warum-mietbeginn-zaehlt/', 'Warum Mietbeginn zählt'], ['../miete-nach-bezirk-berlin/', 'Miete nach Bezirk']],
    mietspiegel_vs_real_rents: [['../berliner-mietspiegel-2026-was-sich-geaendert-hat/', 'Berliner Mietspiegel 2026'], ['../germanyrent-daten-richtig-lesen/', 'GermanyRent Daten richtig lesen'], ['../wie-germanyrent-daten-funktionieren/', 'So funktionieren GermanyRent Daten']],
    furnished_vs_unfurnished: [['../ganze-wohnung-vs-wg-zimmer-berlin/', 'Ganze Wohnung oder WG-Zimmer'], ['../mietangebot-berlin-vergleichen/', 'Ein Mietangebot vergleichen'], ['../einzugskosten-berlin/', 'Einzugskosten in Berlin']],
    whole_flat_vs_shared_room: [['../moebliert-vs-unmoebliert-berlin/', 'Möbliert oder unmöbliert'], ['../typische-miete-nach-zimmern-berlin/', 'Typische Miete nach Zimmern'], ['../einzugskosten-berlin/', 'Einzugskosten in Berlin']],
    move_in_costs: [['../typische-kaution-berlin/', 'Typische Kaution in Berlin'], ['../mietangebot-berlin-vergleichen/', 'Ein Mietangebot vergleichen'], ['../wie-germanyrent-daten-funktionieren/', 'So funktionieren GermanyRent Daten']],
    reading_germanyrent_data: [['../wie-germanyrent-daten-funktionieren/', 'So funktionieren GermanyRent Daten'], ['../warum-mietbeginn-zaehlt/', 'Warum Mietbeginn zählt'], ['../miete-nach-bezirk-berlin/', 'Miete nach Bezirk']],
    how_germanyrent_data_works: [['../germanyrent-daten-richtig-lesen/', 'GermanyRent Daten richtig lesen'], ['../mietspiegel-vs-echte-mieten-berlin/', 'Mietspiegel und echte Mieten'], ['../warum-mietbeginn-zaehlt/', 'Warum Mietbeginn zählt']],
    cheapest_rent_now: [['../miete-nach-bezirk-berlin/', 'Miete nach Bezirk'], ['../typische-miete-nach-zimmern-berlin/', 'Typische Miete nach Zimmern'], ['../mietangebot-berlin-vergleichen/', 'Ein Mietangebot vergleichen']],
    mietspiegel_2026_update: [['../mietspiegel-vs-echte-mieten-berlin/', 'Mietspiegel und echte Mieten'], ['../wie-germanyrent-daten-funktionieren/', 'So funktionieren GermanyRent Daten'], ['../germanyrent-daten-richtig-lesen/', 'GermanyRent Daten richtig lesen']]
  } : {
    warm_rent_vs_cold_rent: [['../typical-rent-by-room-berlin/', 'Typical rent by room'], ['../compare-berlin-rent-offer/', 'Compare a Berlin rent offer'], ['../how-germanyrent-data-works/', 'How GermanyRent data works']],
    typical_rent_by_room: [['../compare-berlin-rent-offer/', 'Compare a Berlin rent offer'], ['../furnished-vs-unfurnished-rent-berlin/', 'Furnished vs unfurnished'], ['../berlin-rent-by-district/', 'Berlin rent by district']],
    rent_by_district: [['../cheapest-rent-in-berlin-now/', 'Cheapest places to rent in Berlin'], ['../typical-rent-by-room-berlin/', 'Typical rent by room'], ['../how-germanyrent-data-works/', 'How GermanyRent data works']],
    typical_deposit: [['../berlin-move-in-costs/', 'Berlin move-in costs'], ['../compare-berlin-rent-offer/', 'Compare a Berlin rent offer'], ['../how-germanyrent-data-works/', 'How GermanyRent data works']],
    rent_since: [['../typical-rent-by-room-berlin/', 'Typical rent by room'], ['../compare-berlin-rent-offer/', 'Compare a Berlin rent offer'], ['../how-germanyrent-data-works/', 'How GermanyRent data works']],
    compare_rent_offer: [['../typical-rent-by-room-berlin/', 'Typical rent by room'], ['../how-rent-since-affects-berlin-rent/', 'Why Rent since matters'], ['../berlin-rent-by-district/', 'Berlin rent by district']],
    mietspiegel_vs_real_rents: [['../berlin-rent-index-2026-key-takeaways/', 'Berlin Rent Index 2026'], ['../how-to-read-germanyrent-data/', 'How to read GermanyRent data'], ['../how-germanyrent-data-works/', 'How GermanyRent data works']],
    furnished_vs_unfurnished: [['../whole-flat-vs-shared-room-berlin/', 'Whole flat vs shared room'], ['../compare-berlin-rent-offer/', 'Compare a Berlin rent offer'], ['../berlin-move-in-costs/', 'Berlin move-in costs']],
    whole_flat_vs_shared_room: [['../furnished-vs-unfurnished-rent-berlin/', 'Furnished vs unfurnished'], ['../typical-rent-by-room-berlin/', 'Typical rent by room'], ['../berlin-move-in-costs/', 'Berlin move-in costs']],
    move_in_costs: [['../typical-deposit-berlin/', 'Typical deposit in Berlin'], ['../compare-berlin-rent-offer/', 'Compare a Berlin rent offer'], ['../how-germanyrent-data-works/', 'How GermanyRent data works']],
    reading_germanyrent_data: [['../how-germanyrent-data-works/', 'How GermanyRent data works'], ['../how-rent-since-affects-berlin-rent/', 'Why Rent since matters'], ['../berlin-rent-by-district/', 'Berlin rent by district']],
    how_germanyrent_data_works: [['../how-to-read-germanyrent-data/', 'How to read GermanyRent data'], ['../mietspiegel-vs-real-rents-berlin/', 'Mietspiegel vs real rents'], ['../how-rent-since-affects-berlin-rent/', 'Why Rent since matters']],
    cheapest_rent_now: [['../berlin-rent-by-district/', 'Berlin rent by district'], ['../typical-rent-by-room-berlin/', 'Typical rent by room'], ['../compare-berlin-rent-offer/', 'Compare a Berlin rent offer']],
    mietspiegel_2026_update: [['../mietspiegel-vs-real-rents-berlin/', 'Mietspiegel vs real rents'], ['../how-germanyrent-data-works/', 'How GermanyRent data works'], ['../how-to-read-germanyrent-data/', 'How to read GermanyRent data']]
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

  function addRelatedGuides(article) {
    const related = relatedGuides[page];
    if (!article || !related || document.querySelector('.related-guides')) return;
    const heading = language === 'de' ? '📚 Weiter lesen' : '📚 Continue learning';
    const description = language === 'de' ? 'Nützliche nächste Themen für einen besseren Mietvergleich.' : 'Useful next topics for a clearer rent comparison.';
    const section = document.createElement('section');
    section.className = 'related-guides';
    section.setAttribute('aria-label', language === 'de' ? 'Verwandte Ratgeber' : 'Related guides');
    section.innerHTML = `<h2>${heading}</h2><p>${description}</p><div class="related-guide-grid">${related.map(([href, title]) => `<a href="${href}" data-guide-action="guide_related_opened" data-guide-target="${title}">${title}<span aria-hidden="true">→</span></a>`).join('')}</div>`;
    article.insertAdjacentElement('afterend', section);
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
      const category = categories[categoryByGuide[page]];
      const eyebrow = article.querySelector('.eyebrow');
      if (category && eyebrow) eyebrow.textContent = category[0];
      const pageNavigation = document.createElement('nav');
      pageNavigation.className = 'article-pagination';
      const next = guideOrder[page];
      const backLabel = language === 'de' ? '← Zurück zu den Ratgebern' : '← Back to guides';
      pageNavigation.innerHTML = `<a href="../" data-guide-action="guide_back_to_hub_clicked">${backLabel}</a><a class="next-guide" href="${next ? next[0] : '../'}" data-guide-action="guide_next_clicked" data-guide-target="${next ? next[0] : 'guide_hub'}">${next ? next[1] : (language === 'de' ? 'Alle Ratgeber →' : 'All guides →')}</a>`;
      article.parentNode.insertBefore(pageNavigation, article);
      const lede = article.querySelector('.lede');
      if (lede) lede.insertAdjacentElement('afterend', snapshot);
      else article.insertBefore(snapshot, article.firstChild);
      addRelatedGuides(article);
    } else if (hero) {
      const categoryNav = document.querySelector('.guide-category-nav');
      if (categoryNav) categoryNav.insertAdjacentElement('afterend', snapshot);
      else hero.insertAdjacentElement('afterend', snapshot);
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

  function setupGuideHubFilters() {
    if (page !== 'guide_hub') return;
    const grid = document.querySelector('.guide-grid');
    if (!grid) return;
    const cards = Array.from(grid.querySelectorAll('.guide-card'));
    if (!cards.some(card => card.dataset.guideTarget === 'how_germanyrent_data_works')) {
      const methodology = document.createElement('a');
      methodology.className = 'guide-card';
      methodology.href = language === 'de' ? 'wie-germanyrent-daten-funktionieren/' : 'how-germanyrent-data-works/';
      methodology.dataset.guideAction = 'guide_opened';
      methodology.dataset.guideTarget = 'how_germanyrent_data_works';
      methodology.innerHTML = language === 'de'
        ? '<div class="eyebrow">GermanyRent nutzen</div><h2>So funktionieren GermanyRent Daten</h2><p>Sieh, wie Pins, Standorte, Meldungen und Live-Statistiken funktionieren.</p>'
        : '<div class="eyebrow">Using GermanyRent</div><h2>How GermanyRent data works</h2><p>See how pins, locations, reports, and live statistics work.</p>';
      grid.appendChild(methodology);
      cards.push(methodology);
    }
    if (!cards.length) return;
    const allLabel = language === 'de' ? 'Alle Ratgeber' : 'All guides';
    const nav = document.createElement('nav');
    nav.className = 'guide-category-nav';
    nav.setAttribute('aria-label', language === 'de' ? 'Ratgeber Kategorien' : 'Guide categories');
    nav.innerHTML = `<button class="guide-category-filter active" type="button" data-guide-filter="all">${allLabel}</button>${Object.entries(categories).map(([key, [title]]) => `<button class="guide-category-filter" type="button" data-guide-filter="${key}">${title}</button>`).join('')}`;
    grid.parentNode.insertBefore(nav, grid);

    cards.forEach(card => {
      const category = categoryByGuide[card.dataset.guideTarget];
      const eyebrow = card.querySelector('.eyebrow');
      if (category && eyebrow) eyebrow.textContent = categories[category][0];
    });

    nav.addEventListener('click', event => {
      const button = event.target.closest('[data-guide-filter]');
      if (!button) return;
      const selected = button.dataset.guideFilter;
      nav.querySelectorAll('[data-guide-filter]').forEach(item => item.classList.toggle('active', item === button));
      cards.forEach(card => { card.hidden = selected !== 'all' && categoryByGuide[card.dataset.guideTarget] !== selected; });
      track('guide_category_selected', { category: selected });
    });
  }

  window.addEventListener('DOMContentLoaded', () => {
    setupGuideHubFilters();
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
