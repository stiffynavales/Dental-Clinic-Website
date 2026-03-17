import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CheckCircle2, ChevronRight } from 'lucide-react';

export default function Services() {
  const [services, setServices] = useState<any[]>([]);

  useEffect(() => {
    fetch('/api/services').then(res => res.json()).then(setServices);
  }, []);

  return (
    <div className="bg-zinc-50 min-h-screen py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h1 className="text-4xl font-extrabold text-zinc-900 sm:text-5xl mb-6">Our Dental Services</h1>
          <p className="text-xl text-zinc-600">
            From routine checkups to advanced cosmetic procedures, we offer comprehensive dental care for the whole family.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {services.map((service, idx) => (
            <motion.div 
              key={service.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: idx * 0.1 }}
              className="bg-white rounded-2xl p-8 shadow-sm hover:shadow-md transition-shadow border border-zinc-100 flex flex-col h-full"
            >
              <div className="w-14 h-14 bg-zinc-100 text-zinc-800 rounded-xl flex items-center justify-center mb-6">
                <CheckCircle2 className="w-7 h-7" />
              </div>
              <h3 className="text-2xl font-bold text-zinc-900 mb-4">{service.title}</h3>
              <p className="text-zinc-600 mb-8 flex-grow">{service.description}</p>
              <Link 
                to={`/services/${service.slug}`} 
                className="inline-flex items-center text-zinc-800 font-semibold hover:text-zinc-900 mt-auto"
              >
                Learn more about {service.title} <ChevronRight className="w-4 h-4 ml-1" />
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
