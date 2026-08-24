/* Live guide figures are calculated from active, public GermanyRent pins. */
(function () {
  const SUPABASE_URL = 'https://meaiajvcjadzvcxwhtfx.supabase.co';
  const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1lYWlhanZjamFkenZjeHdodGZ4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODU0OTgzNzEsImV4cCI6MjEwMTA3NDM3MX0.82g7IvvMZWQJ3EOMn_fKPFOCGqQuYjbgKfOgNc6HePw';
  const guide = document.documentElement.dataset.guide || 'guide_hub';
  const german = document.documentElement.lang === 'de';
  const copy = german ? {
    title: 'Live GermanyRent Übersicht',
    subtitle: 'Aktuelle, von Mieterinnen und Mietern gemeldete Mietpins',
    pins: 'Mietpins', medianWarm: 'Median Warmmiete', medianDeposit: 'Median Kaution', totalWarm: 'Warmmiete auf der Karte',
    rooms: 'Typische Warmmiete nach Zimmern', districts: 'Am stärksten vertretene Bezirke',
    coverage: 'Angaben vorhanden', unavailable: 'Der Live-Schnappschuss ist gerade nicht verfügbar.',
    coldCoverage: 'Mietpins mit Kaltmiete', rentSinceCoverage: 'Mietpins mit Mietbeginn', depositCoverage: 'Mietpins mit Kautionsangabe',
    rentPins: 'Mietpins', median: 'Median', room: 'Zimmer'
  } : {
    title: 'Live GermanyRent snapshot',
    subtitle: 'Current community-reported active rent pins',
    pins: 'Rent Pins', medianWarm: 'Median warm rent', medianDeposit: 'Median deposit', totalWarm: 'Warm rent on the map',
    rooms: 'Typical warm rent by room', districts: 'Most represented districts', coverage: 'reports available',
    unavailable: 'The live snapshot is unavailable right now.', coldCoverage: 'Rent Pins with cold rent', rentSinceCoverage: 'Rent Pins with Rent since',
    depositCoverage: 'Rent Pins with deposit', rentPins: 'Rent Pins', median: 'median', room: 'Room'
  };

  function validNumbers(rows, key) {
    return rows.map(row => Number(row[key])).filter(value => Number.isFinite(value) && value > 0);
  }

  function median(values) {
    if (!values.length) return null;
    const sorted = values.slice().sort((a, b) => a - b);
    const middle = Math.floor(sorted.length / 2);
    return sorted.length % 2 ? sorted[middle] : (sorted[middle - 1] + sorted[middle]) / 2;
  }

  function money(value) {
    if (!Number.isFinite(value)) return '–';
    return new Intl.NumberFormat(german ? 'de-DE' : 'en-DE', {
      style: 'currency', currency: 'EUR', maximumFractionDigits: 0
    }).format(value);
  }

  function count(value) {
    return new Intl.NumberFormat(german ? 'de-DE' : 'en-DE').format(value);
  }

  function stat(label, value, detail) {
    return `<div class="live-stat"><strong>${value}</strong><span>${label}</span>${detail ? `<small>${detail}</small>` : ''}</div>`;
  }

  function detailFor(rows) {
    if (guide === 'typical_rent_by_room' || guide === 'compare_rent_offer') {
      const roomRows = [1, 2, 3, 4].map(room => {
        const matches = rows.filter(row => Number(row.room) === room && Number(row.warm) > 0);
        if (!matches.length) return '';
        const roomLabel = room === 1 ? `${room} ${copy.room}` : `${room} ${copy.room}${german ? '' : 's'}`;
        return `<li><span>${roomLabel}</span><b>${money(median(validNumbers(matches, 'warm')))} <em>${copy.median}</em></b><small>${count(matches.length)} ${copy.rentPins}</small></li>`;
      }).join('');
      return roomRows ? `<section class="live-detail"><h3>🏠 ${copy.rooms}</h3><ul class="live-list">${roomRows}</ul></section>` : '';
    }

    if (guide === 'rent_by_district') {
      const byDistrict = rows.reduce((groups, row) => {
        const district = row.district || '';
        if (!district) return groups;
        (groups[district] ||= []).push(row);
        return groups;
      }, {});
      const districts = Object.entries(byDistrict).sort((a, b) => b[1].length - a[1].length).slice(0, 3).map(([district, values]) => {
        return `<li><span>${district}</span><b>${money(median(validNumbers(values, 'warm')))} <em>${copy.median}</em></b><small>${count(values.length)} ${copy.rentPins}</small></li>`;
      }).join('');
      return districts ? `<section class="live-detail"><h3>📍 ${copy.districts}</h3><ul class="live-list">${districts}</ul></section>` : '';
    }

    if (guide === 'cheapest_rent_now') {
      const byDistrict = rows.reduce((groups, row) => {
        const district = row.district || '';
        if (!district || !Number(row.warm)) return groups;
        (groups[district] ||= []).push(row);
        return groups;
      }, {});
      const districts = Object.entries(byDistrict).filter(([, values]) => values.length >= 5).sort((a, b) => {
        const difference = median(validNumbers(a[1], 'warm')) - median(validNumbers(b[1], 'warm'));
        return difference || b[1].length - a[1].length;
      }).slice(0, 3).map(([district, values]) => {
        return `<li><span>${district}</span><b>${money(median(validNumbers(values, 'warm')))} <em>${copy.median}</em></b><small>${count(values.length)} ${copy.rentPins}</small></li>`;
      }).join('');
      const title = german ? 'Niedrigste Median-Warmmieten im aktuellen Sample' : 'Lowest median warm rents in the current sample';
      const note = german ? 'Nur Bezirke mit mindestens fünf aktiven Mietpins. Dies ist kein Ranking aller Berliner Angebote.' : 'Districts need at least five active Rent Pins. This is not a ranking of every Berlin listing.';
      return districts ? `<section class="live-detail"><h3>🧭 ${title}</h3><ul class="live-list">${districts}</ul><p class="live-coverage">${note}</p></section>` : '';
    }

    if (guide === 'furnished_vs_unfurnished') {
      const options = [[true, german ? 'Möbliert' : 'Furnished'], [false, german ? 'Unmöbliert' : 'Unfurnished']];
      const rowsByType = options.map(([isFurnished, label]) => {
        const matches = rows.filter(row => row.furnished === isFurnished && Number(row.warm) > 0);
        return matches.length ? `<li><span>${label}</span><b>${money(median(validNumbers(matches, 'warm')))} <em>${copy.median}</em></b><small>${count(matches.length)} ${copy.rentPins}</small></li>` : '';
      }).join('');
      const title = german ? 'Typische Warmmiete nach Möblierung' : 'Typical warm rent by furnishing';
      return rowsByType ? `<section class="live-detail"><h3>🛋️ ${title}</h3><ul class="live-list">${rowsByType}</ul></section>` : '';
    }

    if (guide === 'whole_flat_vs_shared_room') {
      const options = [['Whole flat (Private)', german ? 'Ganze Wohnung' : 'Whole flat'], ['Shared / Room', german ? 'WG oder Zimmer' : 'Shared or room']];
      const rowsByType = options.map(([privacy, label]) => {
        const matches = rows.filter(row => row.privacy === privacy && Number(row.warm) > 0);
        return matches.length ? `<li><span>${label}</span><b>${money(median(validNumbers(matches, 'warm')))} <em>${copy.median}</em></b><small>${count(matches.length)} ${copy.rentPins}</small></li>` : '';
      }).join('');
      const title = german ? 'Typische Warmmiete nach Wohnform' : 'Typical warm rent by home type';
      return rowsByType ? `<section class="live-detail"><h3>🔑 ${title}</h3><ul class="live-list">${rowsByType}</ul></section>` : '';
    }

    const field = (guide === 'typical_deposit' || guide === 'move_in_costs') ? 'deposit' : (guide === 'rent_since' || guide === 'mietspiegel_vs_real_rents' || guide === 'reading_germanyrent_data' || guide === 'mietspiegel_2026_update') ? 'rent_since' : 'cold';
    const label = (guide === 'typical_deposit' || guide === 'move_in_costs') ? copy.depositCoverage : (guide === 'rent_since' || guide === 'mietspiegel_vs_real_rents' || guide === 'reading_germanyrent_data' || guide === 'mietspiegel_2026_update') ? copy.rentSinceCoverage : copy.coldCoverage;
    const available = rows.filter(row => row[field] !== null && row[field] !== undefined && row[field] !== '').length;
    return `<p class="live-coverage">${label}: <strong>${count(available)} of ${count(rows.length)}</strong></p>`;
  }

  function render(rows) {
    const warm = validNumbers(rows, 'warm');
    const deposits = validNumbers(rows, 'deposit');
    const totalWarm = warm.reduce((sum, value) => sum + value, 0);
    document.querySelectorAll('[data-live-snapshot]').forEach(host => {
      host.innerHTML = `<div class="live-snapshot-heading"><div><div class="eyebrow">${copy.title}</div><p>${copy.subtitle}</p></div></div><div class="live-stats-grid">${stat(copy.pins, count(rows.length))}${stat(copy.medianWarm, money(median(warm)))}${stat(copy.medianDeposit, money(median(deposits)), `${count(deposits.length)} ${copy.coverage}`)}${stat(copy.totalWarm, money(totalWarm))}</div>${detailFor(rows)}`;
    });
  }

  function showUnavailable() {
    document.querySelectorAll('[data-live-snapshot]').forEach(host => {
      host.innerHTML = `<p class="live-loading">${copy.unavailable}</p>`;
    });
  }

  async function load() {
    if (!window.supabase) {
      showUnavailable();
      return;
    }
    const client = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    const { data, error } = await client.from('rents').select('warm,cold,deposit,room,district,rent_since,furnished,privacy,area').eq('is_location_valid', true);
    if (error || !data || !data.length) {
      showUnavailable();
      return;
    }
    render(data);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', load);
  else load();
})();
