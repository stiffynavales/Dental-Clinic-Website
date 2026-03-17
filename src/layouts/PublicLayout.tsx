import { Outlet, Link } from 'react-router-dom';
import { Phone, MapPin, Clock, Facebook, Instagram, Twitter } from 'lucide-react';
import { useEffect, useState } from 'react';

export default function PublicLayout() {
  const [settings, setSettings] = useState<any>({});

  useEffect(() => {
    fetch('/api/settings')
      .then(res => res.json())
      .then(data => setSettings(data));
  }, []);

  return (
    <div className="min-h-screen flex flex-col font-sans text-zinc-900 bg-white">
      {/* Top Bar */}
      <div className="bg-zinc-900 text-white py-2 text-sm hidden md:block">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-between items-center">
          <div className="flex space-x-6">
            <div className="flex items-center"><Phone className="w-4 h-4 mr-2" /> {settings.contactPhone || '(555) 123-4567'}</div>
            <div className="flex items-center"><MapPin className="w-4 h-4 mr-2" /> {settings.address || '123 Smile Ave, NY'}</div>
            <div className="flex items-center"><Clock className="w-4 h-4 mr-2" /> Mon-Fri: 8am - 6pm</div>
          </div>
          <div className="flex space-x-4">
            <a href="#" className="hover:text-zinc-300"><Facebook className="w-4 h-4" /></a>
            <a href="#" className="hover:text-zinc-300"><Instagram className="w-4 h-4" /></a>
            <a href="#" className="hover:text-zinc-300"><Twitter className="w-4 h-4" /></a>
          </div>
        </div>
      </div>

      {/* Main Navigation */}
      <header className="bg-[#cbcbcb] shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-20 items-center">
            <Link to="/" className="flex items-center">
              <img src="/logo.png" alt="Urban Dontics Logo" className="h-16 w-auto object-contain" />
            </Link>
            <nav className="hidden md:flex space-x-8">
              <Link to="/" className="text-zinc-600 hover:text-zinc-800 font-medium">Home</Link>
              <Link to="/services" className="text-zinc-600 hover:text-zinc-800 font-medium">Services</Link>
              <Link to="/doctors" className="text-zinc-600 hover:text-zinc-800 font-medium">Our Doctors</Link>
            </nav>
            <div className="hidden md:flex items-center space-x-4">
              <Link to="/booking" className="bg-zinc-800 text-white px-6 py-2.5 rounded-full font-medium hover:bg-zinc-900 transition-colors">
                Book Appointment
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-grow">
        <Outlet context={{ settings }} />
      </main>

      {/* Footer */}
      <footer className="bg-zinc-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <h3 className="text-2xl font-bold text-white mb-4">{settings.siteName || 'Urban Dontics'}</h3>
            <p className="text-zinc-400 mb-4">Providing world-class dental care with a gentle touch.</p>
          </div>
          <div>
            <h4 className="text-lg font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-2 text-zinc-400">
              <li><Link to="/" className="hover:text-white">Home</Link></li>
              <li><Link to="/services" className="hover:text-white">Services</Link></li>
              <li><Link to="/doctors" className="hover:text-white">Doctors</Link></li>
              <li><Link to="/booking" className="hover:text-white">Book Appointment</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="text-lg font-semibold mb-4">Contact Us</h4>
            <ul className="space-y-2 text-zinc-400">
              <li>{settings.address}</li>
              <li>{settings.contactPhone}</li>
              <li>{settings.contactEmail}</li>
            </ul>
          </div>
          <div>
            <h4 className="text-lg font-semibold mb-4">Emergency</h4>
            <p className="text-zinc-400 mb-2">For dental emergencies outside of normal hours, please call:</p>
            <p className="text-xl font-bold text-zinc-300">{settings.contactPhone}</p>
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-12 pt-8 border-t border-zinc-800 text-center text-zinc-500 text-sm">
          &copy; {new Date().getFullYear()} {settings.siteName || 'Urban Dontics'}. All rights reserved.
        </div>
      </footer>
    </div>
  );
}
