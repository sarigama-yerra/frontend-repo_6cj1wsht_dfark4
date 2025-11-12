import React, { useEffect, useMemo, useState } from 'react'
import Spline from '@splinetool/react-spline'
import { MapPin, BedDouble, Bath, Square, Phone, Mail, ArrowRight, Search } from 'lucide-react'
import './index.css'

const BACKEND = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000'

function Hero() {
  return (
    <section className="relative h-[70vh] w-full overflow-hidden">
      <div className="absolute inset-0">
        <Spline scene="https://prod.spline.design/1VHYoewWfi45VYZ5/scene.splinecode" />
      </div>
      <div className="relative z-10 h-full flex items-center">
        <div className="container mx-auto px-6">
          <div className="backdrop-blur-sm bg-white/20 rounded-2xl p-8 max-w-2xl shadow-2xl border border-white/30">
            <h1 className="text-4xl md:text-6xl font-bold text-white drop-shadow">Elevate Your Living</h1>
            <p className="text-white/90 mt-4 text-lg">Discover luxury properties in prime urban locations. Modern design, breathtaking views, and seamless experiences.</p>
            <div className="mt-6 bg-white/90 rounded-xl p-3 flex items-center gap-3 shadow-lg">
              <Search className="text-gray-600" size={20} />
              <input placeholder="Search city, address, or listing ID" className="flex-1 bg-transparent outline-none text-gray-800 placeholder:text-gray-500" />
              <button className="bg-gray-900 text-white px-4 py-2 rounded-lg flex items-center gap-2">
                Explore
                <ArrowRight size={18} />
              </button>
            </div>
          </div>
        </div>
      </div>
      <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/10 to-transparent" />
    </section>
  )
}

function PropertyCard({ p }) {
  return (
    <div className="bg-white rounded-2xl shadow hover:shadow-xl transition-shadow overflow-hidden border border-gray-100">
      {p.images?.[0] ? (
        <img src={p.images[0]} alt={p.title} className="h-48 w-full object-cover" />
      ) : (
        <div className="h-48 w-full bg-gradient-to-br from-gray-200 to-gray-100 flex items-center justify-center text-gray-500">No Image</div>
      )}
      <div className="p-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900">{p.title}</h3>
          <span className="text-gray-900 font-bold">${Intl.NumberFormat().format(p.price || 0)}</span>
        </div>
        <p className="text-gray-500 text-sm mt-1">{p.address || p.city}
          {p.city && p.state ? `, ${p.state}` : ''}
        </p>
        <div className="flex items-center gap-4 text-gray-600 text-sm mt-3">
          {p.bedrooms != null && (
            <span className="flex items-center gap-1"><BedDouble size={16} /> {p.bedrooms} bd</span>
          )}
          {p.bathrooms != null && (
            <span className="flex items-center gap-1"><Bath size={16} /> {p.bathrooms} ba</span>
          )}
          {p.area_sqft != null && (
            <span className="flex items-center gap-1"><Square size={16} /> {p.area_sqft} sqft</span>
          )}
        </div>
      </div>
    </div>
  )
}

function MapView({ items }) {
  const [map, setMap] = useState(null)
  const [leafletLoaded, setLeafletLoaded] = useState(false)

  useEffect(() => {
    // Dynamically import Leaflet only on client
    Promise.all([
      import('leaflet'),
      import('leaflet/dist/leaflet.css')
    ]).then(([L]) => {
      setLeafletLoaded(true)
      const mapInstance = L.default.map('map', {
        center: [40.7128, -74.0060],
        zoom: 12,
      })
      L.default.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '&copy; OpenStreetMap contributors'
      }).addTo(mapInstance)

      // Add markers
      items.filter(p => p.latitude && p.longitude).forEach(p => {
        const marker = L.default.marker([p.latitude, p.longitude]).addTo(mapInstance)
        marker.bindPopup(`<strong>${p.title}</strong><br/>${p.city || ''}`)
      })

      setMap(mapInstance)
    }).catch(() => {})

    return () => {
      if (map) map.remove()
    }
  }, [items])

  return (
    <div id="map" className="w-full h-[480px] rounded-2xl overflow-hidden border border-gray-200" />
  )
}

function Listings() {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    fetch(`${BACKEND}/api/properties`)
      .then(r => r.json())
      .then(d => setItems(d.items || []))
      .catch(e => setError('Failed to load listings'))
      .finally(() => setLoading(false))
  }, [])

  return (
    <section className="container mx-auto px-6 py-12">
      <div className="flex items-end justify-between mb-6">
        <div>
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900">Featured Listings</h2>
          <p className="text-gray-600">Curated homes with exceptional design and location.</p>
        </div>
        <button className="text-gray-700 hover:text-gray-900">View all</button>
      </div>
      {loading ? (
        <p className="text-gray-500">Loading...</p>
      ) : error ? (
        <p className="text-red-600">{error}</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {items.map(p => <PropertyCard key={p.id} p={p} />)}
        </div>
      )}
      <div className="mt-10">
        <MapView items={items} />
      </div>
    </section>
  )
}

function Contact() {
  return (
    <section className="bg-gray-50 border-t border-gray-100">
      <div className="container mx-auto px-6 py-16 grid md:grid-cols-2 gap-10">
        <div>
          <h3 className="text-2xl font-bold text-gray-900">Work with our property advisors</h3>
          <p className="text-gray-600 mt-2">We connect discerning buyers and sellers with exceptional real estate opportunities.</p>
          <div className="mt-6 space-y-3 text-gray-700">
            <p className="flex items-center gap-3"><Phone size={18}/> +1 (555) 234-9876</p>
            <p className="flex items-center gap-3"><Mail size={18}/> hello@elevatehomes.com</p>
          </div>
        </div>
        <form className="bg-white rounded-2xl p-6 shadow space-y-4">
          <div>
            <label className="text-sm text-gray-600">Name</label>
            <input className="w-full border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-gray-900/20" placeholder="Your name" />
          </div>
          <div>
            <label className="text-sm text-gray-600">Email</label>
            <input type="email" className="w-full border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-gray-900/20" placeholder="you@example.com" />
          </div>
          <div>
            <label className="text-sm text-gray-600">Message</label>
            <textarea className="w-full border border-gray-200 rounded-lg px-3 py-2 h-28 focus:outline-none focus:ring-2 focus:ring-gray-900/20" placeholder="Tell us what you're looking for"></textarea>
          </div>
          <button className="bg-gray-900 text-white px-4 py-2 rounded-lg">Send</button>
        </form>
      </div>
    </section>
  )
}

export default function App() {
  return (
    <div className="min-h-screen bg-white">
      <Hero />
      <Listings />
      <Contact />
    </div>
  )
}
