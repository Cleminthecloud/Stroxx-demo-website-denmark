'use client';
import { useEffect, useMemo, useRef, useState } from 'react';
import type { Map as LeafletMap, LayerGroup } from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Search, LocateFixed, MapPin, Clock, Phone, Mail, ArrowUpRight, X } from 'lucide-react';
import { stores, distanceKm, hoursLabel, Store, StoreRegion } from '@/lib/stores';

/** Modern STROXX store finder: live-filterable list synced with a dark
 *  interactive map (Leaflet + Carto dark tiles). Data: Webflow CMS snapshot. */

const REGIONS: ('Alle' | StoreRegion)[] = ['Alle', 'Sjælland', 'Fyn', 'Jylland'];
const DK_CENTER: [number, number] = [56.05, 10.6];

const norm = (s: string) =>
  s.toLowerCase().replace(/ø/g, 'o').replace(/å/g, 'a').replace(/æ/g, 'ae');

export default function StoreFinder() {
  const [q, setQ] = useState('');
  const [region, setRegion] = useState<'Alle' | StoreRegion>('Alle');
  const [festool, setFestool] = useState(false);
  const [sikring, setSikring] = useState(false);
  const [selected, setSelected] = useState<string | null>(null);
  const [pos, setPos] = useState<{ lat: number; lng: number } | null>(null);
  const [locating, setLocating] = useState(false);
  const [ready, setReady] = useState(false);

  const mapEl = useRef<HTMLDivElement>(null);
  const map = useRef<LeafletMap | null>(null);
  const markers = useRef<LayerGroup | null>(null);
  const userMarker = useRef<LayerGroup | null>(null);
  const L = useRef<typeof import('leaflet') | null>(null);
  const listEl = useRef<HTMLDivElement>(null);
  const cardEls = useRef<Record<string, HTMLDivElement | null>>({});

  const filtered = useMemo(() => {
    const nq = norm(q.trim());
    let list = stores.filter((s) => {
      if (region !== 'Alle' && s.region !== region) return false;
      if (festool && !s.festool) return false;
      if (sikring && !s.sikring) return false;
      if (!nq) return true;
      return norm(`${s.name} ${s.address} ${s.zipCity}`).includes(nq);
    });
    if (pos) {
      list = [...list].sort(
        (a, b) => distanceKm(pos.lat, pos.lng, a.lat, a.lng) - distanceKm(pos.lat, pos.lng, b.lat, b.lng)
      );
    }
    return list;
  }, [q, region, festool, sikring, pos]);

  /* ── map boot ── */
  useEffect(() => {
    let dead = false;
    (async () => {
      const leaflet = await import('leaflet');
      if (dead || !mapEl.current || map.current) return;
      L.current = leaflet;
      const m = leaflet.map(mapEl.current, {
        center: DK_CENTER,
        zoom: 7,
        zoomControl: false,
        attributionControl: true,
        scrollWheelZoom: true,
      });
      leaflet.control.zoom({ position: 'bottomright' }).addTo(m);
      leaflet
        .tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
          attribution: '&copy; OpenStreetMap &copy; CARTO',
          subdomains: 'abcd',
          maxZoom: 19,
        })
        .addTo(m);
      markers.current = leaflet.layerGroup().addTo(m);
      userMarker.current = leaflet.layerGroup().addTo(m);
      map.current = m;
      setReady(true); // triggers the first marker render
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
        const el = cardEls.current[s.id];
        el?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      });
      mk.addTo(markers.current!);
    });
  }, [filtered, selected, ready]);

  /* ── user position marker ── */
  useEffect(() => {
    const leaflet = L.current;
    if (!leaflet || !userMarker.current) return;
    userMarker.current.clearLayers();
    if (!pos) return;
    const icon = leaflet.divIcon({
      className: '',
      iconSize: [18, 18],
      iconAnchor: [9, 9],
      html: '<div class="sf-me"></div>',
    });
    leaflet.marker([pos.lat, pos.lng], { icon, title: 'Din placering' }).addTo(userMarker.current);
  }, [pos]);

  const focusStore = (s: Store) => {
    setSelected(s.id);
    map.current?.flyTo([s.lat, s.lng], 11, { duration: 0.9 });
  };

  const locate = () => {
    if (!navigator.geolocation) return;
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (p) => {
        const u = { lat: p.coords.latitude, lng: p.coords.longitude };
        setPos(u);
        setLocating(false);
        map.current?.flyTo([u.lat, u.lng], 9, { duration: 0.9 });
      },
      () => setLocating(false),
      { enableHighAccuracy: false, timeout: 8000 }
    );
  };

  const chip = (on: boolean) =>
    `px-3.5 py-1.5 rounded-full text-[12px] tracking-wide transition-all cursor-pointer border ${
      on
        ? 'bg-stroxx-blue text-white border-stroxx-blue shadow-[0_0_18px_rgba(0,130,202,0.35)]'
        : 'bg-white/[0.04] text-fog border-white/10 hover:text-white hover:border-white/25'
    }`;

  return (
    <div className="grid gap-6 lg:grid-cols-[440px,1fr] lg:items-start">
      {/* ── left: search + list ── */}
      <div>
        {/* search */}
        <div className="relative mb-4">
          <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-fog pointer-events-none" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Søg by, postnummer eller butik"
            aria-label="Søg butik"
            className="w-full rounded-full bg-white/[0.05] border border-white/10 pl-11 pr-11 py-3 text-[14px] text-white placeholder:text-fog/70 outline-none focus:border-stroxx-blue/60 focus:bg-white/[0.07] transition-colors"
          />
          {q && (
            <button onClick={() => setQ('')} aria-label="Ryd søgning"
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-fog hover:text-white transition-colors">
              <X size={15} />
            </button>
          )}
        </div>

        {/* filters */}
        <div className="flex flex-wrap items-center gap-2 mb-5">
          {REGIONS.map((r) => (
            <button key={r} onClick={() => setRegion(r)} className={chip(region === r)}>{r}</button>
          ))}
          <span className="mx-1 h-4 w-px bg-white/10 hidden sm:block" />
          <button onClick={() => setFestool(!festool)} className={chip(festool)}>Festool shop</button>
          <button onClick={() => setSikring(!sikring)} className={chip(sikring)}>Sikring</button>
          <button onClick={locate} disabled={locating}
            className={`${chip(!!pos)} inline-flex items-center gap-1.5 disabled:opacity-60`}>
            <LocateFixed size={13} className={locating ? 'animate-spin' : ''} />
            {pos ? 'Nærmeste først' : locating ? 'Finder dig…' : 'Nær mig'}
          </button>
        </div>

        <div className="text-[12px] text-fog mb-3">
          {filtered.length} {filtered.length === 1 ? 'butik' : 'butikker'}
          {region !== 'Alle' ? ` · ${region}` : ' i hele Danmark'}
        </div>

        {/* list */}
        <div
          ref={listEl}
          data-lenis-prevent
          className="space-y-3 lg:max-h-[calc(100svh-330px)] lg:min-h-[420px] lg:overflow-y-auto lg:pr-2 sf-scroll"
        >
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
            const km = pos ? distanceKm(pos.lat, pos.lng, s.lat, s.lng) : null;
            return (
              <div
                key={s.id}
                ref={(el) => { cardEls.current[s.id] = el; }}
                onClick={() => focusStore(s)}
                className={`glass rounded-xl p-5 cursor-pointer transition-all duration-300 border ${
                  active
                    ? 'border-stroxx-blue/60 shadow-[0_0_30px_rgba(0,130,202,0.22)] bg-white/[0.05]'
                    : 'border-transparent hover:border-white/15 hover:bg-white/[0.04]'
                }`}
              >
                <div className="flex items-start justify-between gap-3 mb-2.5">
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

                <div className="flex items-center gap-1.5 text-[12px] text-fog mb-3">
                  <Clock size={12} className="shrink-0" />
                  <span>{hoursLabel(s)}</span>
                </div>

                {(s.festool || s.sikring || s.aktive3) && (
                  <div className="flex flex-wrap gap-1.5 mb-3">
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

      {/* ── right: map ── */}
      <div className="lg:sticky lg:top-24">
        <div
          ref={mapEl}
          data-lenis-prevent
          aria-label="Kort over butikker"
          className="h-[46svh] lg:h-[calc(100svh-160px)] w-full rounded-2xl overflow-hidden border border-white/10 bg-[#101216] shadow-[0_30px_80px_rgba(0,0,0,0.5)]"
        />
      </div>
    </div>
  );
}
