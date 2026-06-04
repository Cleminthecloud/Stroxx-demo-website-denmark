'use client';
import { useEffect, useMemo, useRef, useState } from 'react';
import type { Map as LeafletMap, LayerGroup } from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Search, LocateFixed, MapPin, Clock, Phone, Mail, ArrowUpRight, X } from 'lucide-react';
import { stores, distanceKm, hoursLabel, Store, StoreRegion } from '@/lib/stores';

/** Full-screen, app-like store finder: the map fills the viewport and the
 *  search/list floats over it as a dark glass panel (left card on desktop,
 *  bottom sheet on mobile). Data: Webflow CMS snapshot in lib/stores. */

const REGIONS: ('Alle' | StoreRegion)[] = ['Alle', 'Sjælland', 'Fyn', 'Jylland'];
const PANEL_W = 464; // desktop panel + margin, used to offset map focus
const SHEET_H = 240; // collapsed mobile sheet height, used to offset map focus

const norm = (s: string) =>
  s.toLowerCase().replace(/ø/g, 'o').replace(/å/g, 'a').replace(/æ/g, 'ae');

const isLg = () => typeof window !== 'undefined' && window.matchMedia('(min-width: 1024px)').matches;

export default function StoreFinder() {
  const [q, setQ] = useState('');
  const [region, setRegion] = useState<'Alle' | StoreRegion>('Alle');
  const [festool, setFestool] = useState(false);
  const [sikring, setSikring] = useState(false);
  const [selected, setSelected] = useState<string | null>(null);
  const [pos, setPos] = useState<{ lat: number; lng: number } | null>(null);
  // a postcode/place the user searched for that isn't a store city, geocoded
  // via DAWA so the finder always has an answer ("nearest to 6100 Haderslev")
  const [searchPos, setSearchPos] = useState<{ lat: number; lng: number; label: string } | null>(null);
  const [locating, setLocating] = useState(false);
  const [expanded, setExpanded] = useState(false); // mobile bottom sheet
  const [ready, setReady] = useState(false);

  const mapEl = useRef<HTMLDivElement>(null);
  const map = useRef<LeafletMap | null>(null);
  const markers = useRef<LayerGroup | null>(null);
  const userMarker = useRef<LayerGroup | null>(null);
  const L = useRef<typeof import('leaflet') | null>(null);
  const cardEls = useRef<Record<string, HTMLDivElement | null>>({});

  const origin = searchPos ?? pos;

  const filtered = useMemo(() => {
    const nq = norm(q.trim());
    const base = stores.filter((s) => {
      if (region !== 'Alle' && s.region !== region) return false;
      if (festool && !s.festool) return false;
      if (sikring && !s.sikring) return false;
      return true;
    });
    const direct = nq
      ? base.filter((s) => norm(`${s.name} ${s.address} ${s.zipCity}`).includes(nq))
      : base;
    // no text match, but the query resolved to a place → show all, nearest first
    let list = direct.length === 0 && searchPos ? base : direct;
    const o = searchPos ?? pos;
    if (o) {
      list = [...list].sort(
        (a, b) => distanceKm(o.lat, o.lng, a.lat, a.lng) - distanceKm(o.lat, o.lng, b.lat, b.lng)
      );
    }
    return list;
  }, [q, region, festool, sikring, pos, searchPos]);

  /* ── geocode unmatched queries via DAWA (official DK postcode API, free) ── */
  useEffect(() => {
    const nq = q.trim();
    if (!nq || nq.length < 3) { setSearchPos(null); return; }
    const hasDirect = stores.some((s) => norm(`${s.name} ${s.address} ${s.zipCity}`).includes(norm(nq)));
    if (hasDirect) { setSearchPos(null); return; }
    const t = setTimeout(async () => {
      try {
        const r = await fetch(`https://api.dataforsyningen.dk/postnumre?q=${encodeURIComponent(nq)}&per_side=1`);
        const j = await r.json();
        const hit = Array.isArray(j) ? j[0] : null;
        if (hit?.visueltcenter) {
          const [lng, lat] = hit.visueltcenter as [number, number];
          setSearchPos({ lat, lng, label: `${hit.nr} ${hit.navn}` });
        } else setSearchPos(null);
      } catch { setSearchPos(null); }
    }, 350);
    return () => clearTimeout(t);
  }, [q]);

  /* ── map boot ── */
  useEffect(() => {
    let dead = false;
    (async () => {
      const leaflet = await import('leaflet');
      if (dead || !mapEl.current || map.current) return;
      L.current = leaflet;
      const lg = isLg();
      const m = leaflet.map(mapEl.current, {
        center: [56.05, 10.6],
        zoom: 7,
        zoomControl: false,
        attributionControl: true,
        scrollWheelZoom: true,
      });
      if (lg) leaflet.control.zoom({ position: 'bottomright' }).addTo(m);
      else m.attributionControl.setPosition('topright');
      leaflet
        .tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
          attribution: '&copy; OpenStreetMap &copy; CARTO',
          subdomains: 'abcd',
          maxZoom: 19,
        })
        .addTo(m);
      // frame all of Denmark next to the floating panel
      const b = leaflet.latLngBounds(stores.map((s) => [s.lat, s.lng] as [number, number]));
      m.fitBounds(b, {
        paddingTopLeft: lg ? [PANEL_W + 30, 110] : [34, 100],
        paddingBottomRight: lg ? [60, 60] : [34, SHEET_H + 30],
      });
      markers.current = leaflet.layerGroup().addTo(m);
      userMarker.current = leaflet.layerGroup().addTo(m);
      map.current = m;
      setReady(true);
    })();
    return () => {
      dead = true;
      map.current?.remove();
      map.current = null;
    };
  }, []);

  /* ── markers follow filter + selection ── */
  useEffect(() => {
    const leaflet = L.current;
    if (!leaflet || !map.current || !markers.current) return;
    markers.current.clearLayers();
    filtered.forEach((s) => {
      const active = s.id === selected;
      const icon = leaflet.divIcon({
        className: '',
        iconSize: [26, 26],
        iconAnchor: [13, 13],
        html: `<div class="sf-pin${active ? ' sf-pin--active' : ''}"><span></span></div>`,
      });
      const mk = leaflet.marker([s.lat, s.lng], { icon, title: s.name });
      mk.on('click', () => {
        setSelected(s.id);
        if (!isLg()) setExpanded(true);
        const el = cardEls.current[s.id];
        el?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      });
      mk.addTo(markers.current!);
    });
  }, [filtered, selected, ready]);

  /* ── origin markers: user position and/or searched place ── */
  useEffect(() => {
    const leaflet = L.current;
    if (!leaflet || !userMarker.current) return;
    userMarker.current.clearLayers();
    const mk = (lat: number, lng: number, title: string) =>
      leaflet.marker([lat, lng], {
        icon: leaflet.divIcon({ className: '', iconSize: [18, 18], iconAnchor: [9, 9], html: '<div class="sf-me"></div>' }),
        title,
      }).addTo(userMarker.current!);
    if (pos) mk(pos.lat, pos.lng, 'Din placering');
    if (searchPos) mk(searchPos.lat, searchPos.lng, searchPos.label);
  }, [pos, searchPos, ready]);

  /** Fly to a store, offsetting the centre so it lands in the visible area
   *  next to the panel (desktop) or above the sheet (mobile). */
  const flyToStore = (lat: number, lng: number, z = 11) => {
    const m = map.current;
    const leaflet = L.current;
    if (!m || !leaflet) return;
    // shift the centre so the store lands in the visible area: right of the
    // panel on desktop, above the collapsed sheet on mobile
    const pt = m.project([lat, lng], z);
    const centerPt = isLg()
      ? pt.subtract(leaflet.point(PANEL_W / 2, 0))
      : pt.add(leaflet.point(0, SHEET_H / 2));
    m.flyTo(m.unproject(centerPt, z), z, { duration: 0.9 });
  };

  /* a searched place flies the map there so the answer is visible */
  useEffect(() => {
    if (searchPos) flyToStore(searchPos.lat, searchPos.lng, 9);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchPos]);

  const focusStore = (s: Store) => {
    setSelected(s.id);
    if (!isLg()) setExpanded(false); // drop the sheet so the map is visible
    flyToStore(s.lat, s.lng);
  };

  const locate = () => {
    if (!navigator.geolocation) return;
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (p) => {
        const u = { lat: p.coords.latitude, lng: p.coords.longitude };
        setPos(u);
        setLocating(false);
        flyToStore(u.lat, u.lng, 9);
      },
      () => setLocating(false),
      { enableHighAccuracy: false, timeout: 8000 }
    );
  };

  const chip = (on: boolean) =>
    `shrink-0 px-3.5 py-1.5 rounded-full text-[12px] tracking-wide transition-all cursor-pointer border ${
      on
        ? 'bg-stroxx-blue text-white border-stroxx-blue shadow-[0_0_18px_rgba(0,130,202,0.35)]'
        : 'bg-white/[0.04] text-fog border-white/10 hover:text-white hover:border-white/25'
    }`;

  return (
    <div className="relative h-[100svh] w-full overflow-hidden bg-ink">
      {/* full-bleed map */}
      <div ref={mapEl} data-lenis-prevent aria-label="Kort over butikker" className="absolute inset-0 isolate" />

      {/* scrim so the fixed nav stays legible over map tiles */}
      <div className="pointer-events-none absolute inset-x-0 top-0 h-28 z-[5]" style={{
        background: 'linear-gradient(180deg, rgba(11,12,14,0.88) 0%, rgba(11,12,14,0) 100%)' }} />

      {/* floating glass panel: left card on lg+, bottom sheet below */}
      <div
        className={`absolute z-[10] inset-x-0 bottom-0 lg:inset-x-auto lg:left-6 lg:top-24 lg:bottom-6 lg:w-[440px] glass-panel rounded-t-2xl lg:rounded-2xl border border-white/10 flex flex-col overflow-hidden transition-[max-height] duration-500 ease-[cubic-bezier(.16,1,.3,1)] ${
          expanded ? 'max-h-[74svh]' : 'max-h-[240px]'
        } lg:max-h-none`}
        style={{ boxShadow: '0 -20px 60px rgba(0,0,0,0.45), inset 0 1px 0 rgba(255,255,255,0.08)' }}
      >
        {/* mobile grab handle */}
        <button
          onClick={() => setExpanded((e) => !e)}
          aria-label={expanded ? 'Skjul liste' : 'Vis liste'}
          className="lg:hidden shrink-0 w-full pt-2.5 pb-1.5 grid place-items-center cursor-pointer"
        >
          <span className="h-1 w-10 rounded-full bg-white/25" />
        </button>

        <div className="px-5 lg:px-6 lg:pt-6 pb-3 shrink-0">
          <div className="hidden lg:block eyebrow mb-2">Butikker · Danmark</div>
          <h1 className="hidden lg:block h-display text-white text-[1.9rem] leading-tight mb-5">
            Tag værktøjet i hånden, før du køber det.
          </h1>

          {/* search */}
          <div className="relative mb-3">
            <Search size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-fog pointer-events-none" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              onFocus={() => { if (!isLg()) setExpanded(true); }}
              placeholder="Søg by, postnummer eller butik"
              aria-label="Søg butik"
              className="w-full rounded-full bg-white/[0.05] border border-white/10 pl-10 pr-10 py-2.5 text-[13px] text-white placeholder:text-fog/70 outline-none focus:border-stroxx-blue/60 focus:bg-white/[0.07] transition-colors"
            />
            {q && (
              <button onClick={() => setQ('')} aria-label="Ryd søgning"
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-fog hover:text-white transition-colors">
                <X size={14} />
              </button>
            )}
          </div>

          {/* filters */}
          <div data-lenis-prevent className="flex items-center gap-2 overflow-x-auto sf-scroll pb-1 mb-1.5">
            {REGIONS.map((r) => (
              <button key={r} onClick={() => setRegion(r)} className={chip(region === r)}>{r}</button>
            ))}
            <button onClick={() => setFestool(!festool)} className={chip(festool)}>Festool</button>
            <button onClick={() => setSikring(!sikring)} className={chip(sikring)}>Sikring</button>
            <button onClick={locate} disabled={locating}
              className={`${chip(!!pos)} inline-flex items-center gap-1.5 disabled:opacity-60`}>
              <LocateFixed size={12} className={locating ? 'animate-spin' : ''} />
              {pos ? 'Nærmeste først' : locating ? 'Finder dig…' : 'Nær mig'}
            </button>
          </div>

          <div className="text-[11px] text-fog">
            {searchPos
              ? <>Ingen butik i <span className="text-white">{searchPos.label}</span>, nærmeste vises først</>
              : <>{filtered.length} {filtered.length === 1 ? 'butik' : 'butikker'}{region !== 'Alle' ? ` · ${region}` : ' i hele Danmark'}</>}
          </div>
        </div>

        {/* list */}
        <div data-lenis-prevent className="flex-1 min-h-0 overflow-y-auto sf-scroll px-4 lg:px-5 pb-5 space-y-3">
          {filtered.length === 0 && (
            <div className="glass rounded-xl p-8 text-center">
              <p className="text-white mb-2">Ingen butikker matcher.</p>
              <button
                onClick={() => { setQ(''); setRegion('Alle'); setFestool(false); setSikring(false); }}
                className="text-stroxx-blue text-sm hover:underline cursor-pointer">
                Nulstil filtre
              </button>
            </div>
          )}

          {filtered.map((s) => {
            const active = s.id === selected;
            const km = origin ? distanceKm(origin.lat, origin.lng, s.lat, s.lng) : null;
            return (
              <div
                key={s.id}
                ref={(el) => { cardEls.current[s.id] = el; }}
                onClick={() => focusStore(s)}
                className={`rounded-xl p-4 lg:p-5 cursor-pointer transition-all duration-300 border bg-white/[0.03] ${
                  active
                    ? 'border-stroxx-blue/60 shadow-[0_0_30px_rgba(0,130,202,0.22)] bg-white/[0.06]'
                    : 'border-white/[0.06] hover:border-white/20 hover:bg-white/[0.05]'
                }`}
              >
                <div className="flex items-start justify-between gap-3 mb-2">
                  <div>
                    <div className="text-white font-medium leading-snug">{s.name}</div>
                    <div className="text-fog text-[13px] mt-0.5">
                      {s.address}, {s.zipCity}
                      {km !== null && (
                        <span className="text-stroxx-blue ml-2 font-medium">{km < 10 ? km.toFixed(1) : Math.round(km)} km</span>
                      )}
                    </div>
                  </div>
                  <a
                    href={s.maps} target="_blank" rel="noopener noreferrer"
                    onClick={(e) => e.stopPropagation()}
                    aria-label={`Rutevejledning til ${s.name}`}
                    className="shrink-0 grid h-9 w-9 place-items-center rounded-full bg-white/[0.06] border border-white/10 text-fog hover:text-white hover:border-stroxx-blue/60 transition-colors"
                  >
                    <MapPin size={15} />
                  </a>
                </div>

                <div className="flex items-center gap-1.5 text-[12px] text-fog mb-2.5">
                  <Clock size={12} className="shrink-0" />
                  <span>{hoursLabel(s)}</span>
                </div>

                {(s.festool || s.sikring || s.aktive3) && (
                  <div className="flex flex-wrap gap-1.5 mb-2.5">
                    {s.festool && <span className="text-[10px] tracking-wide uppercase px-2 py-0.5 rounded-sm bg-white/[0.07] border border-white/10 text-fog">Festool shop i shop</span>}
                    {s.sikring && <span className="text-[10px] tracking-wide uppercase px-2 py-0.5 rounded-sm bg-white/[0.07] border border-white/10 text-fog">Sikring</span>}
                    {s.aktive3 && <span className="text-[10px] tracking-wide uppercase px-2 py-0.5 rounded-sm bg-white/[0.07] border border-white/10 text-fog">3Aktive</span>}
                  </div>
                )}

                {/* manager: expands on selection */}
                <div className={`grid transition-all duration-400 ${active ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}`}>
                  <div className="overflow-hidden">
                    <div className="flex items-center gap-3 pt-3 border-t border-white/[0.07]">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={s.manager.photo} alt={s.manager.name} loading="lazy"
                        className="h-11 w-11 rounded-full object-cover border border-white/15" />
                      <div className="min-w-0">
                        <div className="text-[13px] text-white leading-tight">{s.manager.name}</div>
                        <div className="text-[11px] text-fog">Butikschef</div>
                      </div>
                      <div className="ml-auto flex items-center gap-2">
                        <a href={`tel:${s.manager.phone}`} onClick={(e) => e.stopPropagation()} aria-label={`Ring til ${s.manager.name}`}
                          className="grid h-8 w-8 place-items-center rounded-full bg-white/[0.06] border border-white/10 text-fog hover:text-white hover:border-stroxx-blue/60 transition-colors">
                          <Phone size={13} />
                        </a>
                        <a href={`mailto:${s.manager.email}`} onClick={(e) => e.stopPropagation()} aria-label={`Skriv til ${s.manager.name}`}
                          className="grid h-8 w-8 place-items-center rounded-full bg-white/[0.06] border border-white/10 text-fog hover:text-white hover:border-stroxx-blue/60 transition-colors">
                          <Mail size={13} />
                        </a>
                        <a href={s.maps} target="_blank" rel="noopener noreferrer" onClick={(e) => e.stopPropagation()}
                          className="inline-flex items-center gap-1 text-[12px] text-stroxx-blue hover:underline pl-1">
                          Rute <ArrowUpRight size={12} />
                        </a>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
