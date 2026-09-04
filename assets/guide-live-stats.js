/* Live guide figures are calculated from active, public GermanyRent pins. */
(function () {
  const SUPABASE_URL = 'https://meaiajvcjadzvcxwhtfx.supabase.co';
  const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1lYWlhanZjamFkenZjeHdodGZ4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODU0OTgzNzEsImV4cCI6MjEwMTA3NDM3MX0.82g7IvvMZWQJ3EOMn_fKPFOCGqQuYjbgKfOgNc6HePw';
  const guide = document.documentElement.dataset.guide || 'guide_hub';
  const german = document.documentElement.lang === 'de';
  const copy = german ? {
    hubTitle: 'Live GermanyRent Übersicht', hubSubtitle: 'Aktuelle, von Mieterinnen und Mietern gemeldete Mietpins',
    guideTitle: 'Live-Daten zu diesem Thema', guideSubtitle: 'Aktive, passende GermanyRent Mietpins',
    pins: 'Mietpins', medianWarm: 'Median Warmmiete', medianCold: 'Median Kaltmiete', medianDeposit: 'Median Kaution', totalWarm: 'Warmmiete auf der Karte',
    coverage: 'Angaben vorhanden', rentPins: 'Mietpins', median: 'Median', room: 'Zimmer',
    rooms: 'Typische Warmmiete nach Zimmern', districts: 'Am stärksten vertretene Bezirke',
    cheapest: 'Niedrigste Median-Warmmieten im aktuellen Sample', furnished: 'Typische Warmmiete nach Möblierung', homeType: 'Typische Warmmiete nach Wohnform',
    warmCold: 'Warmmiete und Kaltmiete in gemeldeten Pins', depositMove: 'Kaution und typische Einzugskosten', rentAge: 'Warmmiete nach Mietbeginn', dataCoverage: 'Wie vollständig sind die aktiven Daten?',
    coldCoverage: 'Mietpins mit Kaltmiete', rentSinceCoverage: 'Mietpins mit Mietbeginn', depositCoverage: 'Mietpins mit Kautionsangabe', areaCoverage: 'Mietpins mit Wohnfläche',
    difference: 'Median Differenz', upfront: 'Median erster Monat', recent: 'Bis 12 Monate', midTerm: '1 bis 5 Jahre', longTerm: 'Über 5 Jahre',
    noteCheapest: 'Nur Bezirke mit mindestens fünf aktiven Mietpins. Dies ist kein Ranking aller Berliner Angebote.',
    unavailable: 'Die Live-Daten sind gerade nicht verfügbar.'
  } : {
    hubTitle: 'Live GermanyRent snapshot', hubSubtitle: 'Current community-reported active Rent Pins',
    guideTitle: 'Live data for this guide', guideSubtitle: 'Relevant active GermanyRent Rent Pins',
    pins: 'Rent Pins', medianWarm: 'Median warm rent', medianCold: 'Median cold rent', medianDeposit: 'Median deposit', totalWarm: 'Warm rent on the map',
    coverage: 'reports available', rentPins: 'Rent Pins', median: 'median', room: 'Room',
    rooms: 'Typical warm rent by room', districts: 'Most represented districts',
    cheapest: 'Lowest median warm rents in the current sample', furnished: 'Typical warm rent by furnishing', homeType: 'Typical warm rent by home type',
    warmCold: 'Warm and cold rent in reported pins', depositMove: 'Deposit and typical move-in amount', rentAge: 'Warm rent by Rent since', dataCoverage: 'How complete is the active data?',
    coldCoverage: 'Rent Pins with cold rent', rentSinceCoverage: 'Rent Pins with Rent since', depositCoverage: 'Rent Pins with deposit', areaCoverage: 'Rent Pins with apartment size',
    difference: 'Median difference', upfront: 'Median first month', recent: 'Up to 12 months', midTerm: '1 to 5 years', longTerm: 'Over 5 years',
    noteCheapest: 'Districts need at least five active Rent Pins. This is not a ranking of every Berlin listing.',
    unavailable: 'The live data is unavailable right now.'
  };

  function validNumbers(rows, key) { return rows.map(row => Number(row[key])).filter(value => Number.isFinite(value) && value > 0); }
  function median(values) {
    if (!values.length) return null;
    const sorted = values.slice().sort((a, b) => a - b);
    const middle = Math.floor(sorted.length / 2);
    return sorted.length % 2 ? sorted[middle] : (sorted[middle - 1] + sorted[middle]) / 2;
  }
  function money(value) {
    if (!Number.isFinite(value)) return '–';
    return new Intl.NumberFormat(german ? 'de-DE' : 'en-DE', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(value);
  }
  function count(value) { return new Intl.NumberFormat(german ? 'de-DE' : 'en-DE').format(value); }
  function stat(label, value, detail) { return `<div class="live-stat"><strong>${value}</strong><span>${label}</span>${detail ? `<small>${detail}</small>` : ''}</div>`; }
  function section(title, body, note = '') { return `<section class="live-detail"><h3>${title}</h3>${body}${note ? `<p class="live-coverage">${note}</p>` : ''}</section>`; }
  function list(items) { return `<ul class="live-list">${items.join('')}</ul>`; }
  function moneyList(rows, field, label) {
    return rows.map(([name, values]) => `<li><span>${name}</span><b>${money(median(validNumbers(values, field)))} <em>${copy.median}</em></b><small>${count(values.length)} ${copy.rentPins}</small></li>`).join('');
  }
  function coverage(rows, key) { return rows.filter(row => row[key] !== null && row[key] !== undefined && row[key] !== '').length; }
  function monthsSince(value) {
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return null;
    const today = new Date();
    return Math.max(0, (today.getFullYear() - date.getFullYear()) * 12 + today.getMonth() - date.getMonth());
  }

  function guideDetail(rows) {
    if (guide === 'typical_rent_by_room' || guide === 'compare_rent_offer') {
      const items = [1, 2, 3, 4].map(room => {
        const matches = rows.filter(row => Number(row.room) === room && Number(row.warm) > 0);
        if (!matches.length) return '';
        const label = room === 1 ? `${room} ${copy.room}` : `${room} ${copy.room}${german ? '' : 's'}`;
        return `<li><span>${label}</span><b>${money(median(validNumbers(matches, 'warm')))} <em>${copy.median}</em></b><small>${count(matches.length)} ${copy.rentPins}</small></li>`;
      }).filter(Boolean);
      return items.length ? section(`🏠 ${copy.rooms}`, list(items)) : '';
    }

    if (guide === 'rent_by_district' || guide === 'cheapest_rent_now') {
      const byDistrict = rows.reduce((groups, row) => {
        if (!row.district || !Number(row.warm)) return groups;
        (groups[row.district] ||= []).push(row);
        return groups;
      }, {});
      let entries = Object.entries(byDistrict);
      const isCheapest = guide === 'cheapest_rent_now';
      if (isCheapest) entries = entries.filter(([, values]) => values.length >= 5).sort((a, b) => median(validNumbers(a[1], 'warm')) - median(validNumbers(b[1], 'warm'))).slice(0, 5);
      else entries = entries.sort((a, b) => b[1].length - a[1].length);
      const coverageLabel = values => values.length >= 20
        ? (german ? 'stärkere Datenbasis' : 'stronger coverage')
        : values.length >= 5
          ? (german ? 'wachsende Datenbasis' : 'growing coverage')
          : (german ? 'begrenzte Datenbasis' : 'limited data');
      const items = entries.map(([name, values]) => `<li><span>${name}</span><b>${money(median(validNumbers(values, 'warm')))} <em>${copy.median}</em></b><small>${count(values.length)} ${copy.rentPins} · ${coverageLabel(values)}</small></li>`).join('');
      if (!items) return '';
      if (isCheapest) return section(`📍 ${copy.cheapest}`, list([items]), copy.noteCheapest);
      const jumps = entries.map(([name], index) => `<a href="#district-${index}">${name}</a>`).join('');
      const cards = entries.map(([name, values], index) => `<article class="district-data-card" id="district-${index}"><h4>${name}</h4><p><strong>${count(values.length)}</strong> ${copy.rentPins}</p><p><strong>${money(median(validNumbers(values, 'warm')))}</strong> ${copy.medianWarm.toLowerCase()}</p><small>${coverageLabel(values)}</small></article>`).join('');
      return `<section class="live-detail district-data"><h3>📍 ${copy.districts}</h3><nav class="district-jump-links" aria-label="${german ? 'Bezirke' : 'Districts'}">${jumps}</nav><div class="district-data-grid">${cards}</div></section>`;
    }

    if (guide === 'furnished_vs_unfurnished') {
      const options = [[true, german ? 'Möbliert' : 'Furnished'], [false, german ? 'Unmöbliert' : 'Unfurnished']];
      const items = options.map(([value, label]) => {
        const matches = rows.filter(row => row.furnished === value && Number(row.warm) > 0);
        return matches.length ? `<li><span>${label}</span><b>${money(median(validNumbers(matches, 'warm')))} <em>${copy.median}</em></b><small>${count(matches.length)} ${copy.rentPins}</small></li>` : '';
      }).filter(Boolean);
      return items.length ? section(`🛋️ ${copy.furnished}`, list(items)) : '';
    }

    if (guide === 'whole_flat_vs_shared_room') {
      const options = [['Whole flat (Private)', german ? 'Ganze Wohnung' : 'Whole flat'], ['Shared / Room', german ? 'WG oder Zimmer' : 'Shared or room']];
      const items = options.map(([value, label]) => {
        const matches = rows.filter(row => row.privacy === value && Number(row.warm) > 0);
        return matches.length ? `<li><span>${label}</span><b>${money(median(validNumbers(matches, 'warm')))} <em>${copy.median}</em></b><small>${count(matches.length)} ${copy.rentPins}</small></li>` : '';
      }).filter(Boolean);
      return items.length ? section(`🔑 ${copy.homeType}`, list(items)) : '';
    }

    if (guide === 'warm_rent_vs_cold_rent') {
      const matches = rows.filter(row => Number(row.warm) > 0 && Number(row.cold) > 0);
      if (!matches.length) return '';
      const gaps = matches.map(row => Number(row.warm) - Number(row.cold)).filter(value => value >= 0);
      return section(`🔥 ${copy.warmCold}`, `<div class="live-stats-grid live-stats-grid-three">${stat(copy.medianWarm, money(median(validNumbers(matches, 'warm'))))}${stat(copy.medianCold, money(median(validNumbers(matches, 'cold'))))}${stat(copy.difference, money(median(gaps)), `${count(matches.length)} ${copy.rentPins}`)}</div>`);
    }

    if (guide === 'mietspiegel_2026_update' || guide === 'mietspiegel_vs_real_rents') {
      const districtCount = new Set(rows.map(row => row.district).filter(Boolean)).size;
      const title = guide === 'mietspiegel_2026_update'
        ? (german ? 'GermanyRent im aktuellen Kontext' : 'Current GermanyRent context')
        : (german ? 'GermanyRent im Vergleich' : 'GermanyRent at a glance');
      return section(`📊 ${title}`, `<div class="live-stats-grid live-stats-grid-three">${stat(copy.pins, count(rows.length))}${stat(copy.medianWarm, money(median(validNumbers(rows, 'warm'))))}${stat(german ? 'Bezirke mit Meldungen' : 'Districts with reports', count(districtCount))}</div>`);
    }

    if (guide === 'typical_deposit' || guide === 'move_in_costs') {
      const matches = rows.filter(row => Number(row.warm) > 0 && Number(row.deposit) > 0);
      if (!matches.length) return '';
      const firstMonth = matches.map(row => Number(row.warm) + Number(row.deposit));
      return section(`🏦 ${copy.depositMove}`, `<div class="live-stats-grid live-stats-grid-three">${stat(copy.medianDeposit, money(median(validNumbers(matches, 'deposit'))))}${stat(copy.upfront, money(median(firstMonth)), `${german ? 'Warmmiete plus Kaution' : 'warm rent plus deposit'}`)}${stat(copy.depositCoverage, `${count(matches.length)} / ${count(rows.length)}`)}</div>`);
    }

    if (guide === 'rent_since') {
      const groups = [[copy.recent, []], [copy.midTerm, []], [copy.longTerm, []]];
      rows.forEach(row => {
        const months = monthsSince(row.rent_since);
        if (months === null || !Number(row.warm)) return;
        groups[months <= 12 ? 0 : months <= 60 ? 1 : 2][1].push(row);
      });
      const items = moneyList(groups.filter(([, values]) => values.length), 'warm');
      return items ? section(`📅 ${copy.rentAge}`, list([items])) : '';
    }

    if (guide === 'reading_germanyrent_data' || guide === 'how_germanyrent_data_works') {
      return section(`🧭 ${copy.dataCoverage}`, `<div class="live-stats-grid">${stat(copy.coldCoverage, `${count(coverage(rows, 'cold'))} / ${count(rows.length)}`)}${stat(copy.depositCoverage, `${count(coverage(rows, 'deposit'))} / ${count(rows.length)}`)}${stat(copy.rentSinceCoverage, `${count(coverage(rows, 'rent_since'))} / ${count(rows.length)}`)}${stat(copy.areaCoverage, `${count(coverage(rows, 'area'))} / ${count(rows.length)}`)}</div>`);
    }

    return '';
  }

  function render(rows) {
    const warm = validNumbers(rows, 'warm');
    const deposits = validNumbers(rows, 'deposit');
    const totalWarm = warm.reduce((sum, value) => sum + value, 0);
    document.querySelectorAll('[data-live-snapshot]').forEach(host => {
      if (guide === 'guide_hub') {
        host.innerHTML = `<div class="live-snapshot-heading"><div><div class="eyebrow">${copy.hubTitle}</div><p>${copy.hubSubtitle}</p></div></div><div class="live-stats-grid">${stat(copy.pins, count(rows.length))}${stat(copy.medianWarm, money(median(warm)))}${stat(copy.medianDeposit, money(median(deposits)), `${count(deposits.length)} ${copy.coverage}`)}${stat(copy.totalWarm, money(totalWarm))}</div><p class="live-coverage">${copy.coldCoverage}: <strong>${count(coverage(rows, 'cold'))} of ${count(rows.length)}</strong></p>`;
        return;
      }
      const detail = guideDetail(rows);
      if (!detail) { host.remove(); return; }
      host.innerHTML = `<div class="live-snapshot-heading"><div><div class="eyebrow">${copy.guideTitle}</div><p>${copy.guideSubtitle}</p></div></div>${detail}`;
    });
  }

  function showUnavailable() { document.querySelectorAll('[data-live-snapshot]').forEach(host => { host.innerHTML = `<p class="live-loading">${copy.unavailable}</p>`; }); }
  async function load() {
    if (!window.supabase) return showUnavailable();
    const client = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    const { data, error } = await client.from('rents').select('warm,cold,deposit,room,district,rent_since,furnished,privacy,area').eq('is_location_valid', true);
    if (error || !data || !data.length) return showUnavailable();
    render(data);
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', load);
  else load();
})();
