import React, { useEffect, useState, useMemo } from 'react'
import Spline from '@splinetool/react-spline'

const API_BASE = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000'

function Hero() {
  return (
    <section className="relative h-[70vh] w-full overflow-hidden">
      <Spline scene="https://prod.spline.design/1VHYoewWfi45VYZ5/scene.splinecode" style={{ width: '100%', height: '100%' }} />
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="max-w-3xl px-6 text-center text-white">
          <h1 className="text-4xl md:text-6xl font-semibold tracking-tight">Find Your Next Luxury Home</h1>
          <p className="mt-4 text-lg md:text-xl text-white/85">Explore curated properties across the city with live map previews and immersive visuals.</p>
        </div>
      </div>
    </section>
  )
}

function SearchBar({ onSearch }) {
  const [q, setQ] = useState('')
  const [min, setMin] = useState('')
  const [max, setMax] = useState('')
  const [beds, setBeds] = useState('')

  return (
    <div className="mx-auto -mt-14 z-10 relative w-full max-w-5xl">
      <div className="rounded-2xl border border-white/10 bg-white/80 backdrop-blur-xl shadow-xl p-4 md:p-6">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
          <input value={q} onChange={(e)=>setQ(e.target.value)} placeholder="Search address, area, keywords" className="md:col-span-2 w-full rounded-xl border border-gray-200 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-black/20" />
          <input value={min} onChange={(e)=>setMin(e.target.value)} type="number" placeholder="Min Price" className="w-full rounded-xl border border-gray-200 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-black/20" />
          <input value={max} onChange={(e)=>setMax(e.target.value)} type="number" placeholder="Max Price" className="w-full rounded-xl border border-gray-200 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-black/20" />
          <input value={beds} onChange={(e)=>setBeds(e.target.value)} type="number" placeholder="Bedrooms" className="w-full rounded-xl border border-gray-200 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-black/20" />
        </div>
        <div className="mt-4 flex justify-end">
          <button onClick={()=>onSearch({q, min_price: min || undefined, max_price: max || undefined, bedrooms: beds || undefined})} className="rounded-xl bg-black text-white px-6 py-3 font-medium hover:bg-black/90 transition">Search</button>
        </div>
      </div>
    </div>
  )
}

function PropertyCard({ p }) {
  return (
    <div className="rounded-2xl border border-gray-200 overflow-hidden bg-white shadow-sm hover:shadow-md transition">
      {p.images?.[0] ? (
        <img src={p.images[0]} alt={p.title} className="h-44 w-full object-cover" />
      ) : (
        <div className="h-44 bg-gray-100 w-full flex items-center justify-center text-gray-400">No image</div>
      )}
      <div className="p-4">
        <h3 className="text-lg font-semibold line-clamp-1">{p.title}</h3>
        <p className="text-sm text-gray-500 line-clamp-2">{p.address}</p>
        <div className="mt-2 flex items-center justify-between">
          <span className="text-xl font-semibold">${Number(p.price).toLocaleString()}</span>
          <span className="text-sm text-gray-600">{p.bedrooms} bd • {p.bathrooms} ba • {p.area} m²</span>
        </div>
      </div>
    </div>
  )
}

function Map({ markers }) {
  // Simple Leaflet embed via CDN in index.html; rely on global L
  const [map, setMap] = useState(null)
  useEffect(()=>{
    if (!window.L) return
    if (map) return
    const m = window.L.map('map', { zoomControl: true }).setView([40.7128, -74.0060], 12)
    window.L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors'
    }).addTo(m)
    setMap(m)
  }, [])

  useEffect(()=>{
    if (!map || !window.L) return
    // clear existing markers by resetting layer
    const layer = window.L.layerGroup().addTo(map)
    markers.forEach(p => {
      const marker = window.L.marker([p.lat, p.lng]).addTo(layer)
      marker.bindPopup(`<strong>${p.title}</strong><br/>$${Number(p.price).toLocaleString()}<br/>${p.address}`)
    })
    if (markers.length) {
      const b = window.L.latLngBounds(markers.map(p=>[p.lat, p.lng]))
      map.fitBounds(b, { padding: [40, 40] })
    }
    return () => {
      map.removeLayer(layer)
    }
  }, [markers, map])

  return <div id="map" className="h-[420px] w-full rounded-2xl overflow-hidden border border-gray-200" />
}

export default function App(){
  const [loading, setLoading] = useState(false)
  const [items, setItems] = useState([])

  const fetchProps = async (params={}) => {
    setLoading(true)
    const qs = new URLSearchParams()
    Object.entries(params).forEach(([k,v])=>{ if (v !== undefined && v !== '') qs.set(k, v) })
    const res = await fetch(`${API_BASE}/properties?${qs.toString()}`)
    const data = await res.json()
    setItems(data)
    setLoading(false)
  }

  useEffect(()=>{ fetchProps() }, [])

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50 text-gray-900">
      <Hero />
      <div className="relative z-10 px-6 md:px-10 -mt-10">
        <SearchBar onSearch={fetchProps} />
      </div>

      <div className="mx-auto max-w-6xl px-6 md:px-10 py-10 space-y-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 order-2 lg:order-1">
            <h2 className="text-xl font-semibold mb-3">Properties</h2>
            {loading ? (
              <div className="p-10 text-center text-gray-500">Loading properties...</div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                {items.map(p => <PropertyCard key={p.id} p={p} />)}
              </div>
            )}
          </div>
          <div className="order-1 lg:order-2">
            <h2 className="text-xl font-semibold mb-3">Map</h2>
            <Map markers={items} />
          </div>
        </div>
      </div>

      <footer className="py-10 text-center text-sm text-gray-500">© {new Date().getFullYear()} Skyline Estates</footer>
    </div>
  )
}
