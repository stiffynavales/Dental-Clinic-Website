import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ChevronRight } from 'lucide-react';

export default function Doctors() {
  const [doctors, setDoctors] = useState<any[]>([]);

  useEffect(() => {
    fetch('/api/doctors').then(res => res.json()).then(setDoctors);
  }, []);

  return (
    <div className="bg-zinc-50 min-h-screen py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h1 className="text-4xl font-extrabold text-zinc-900 sm:text-5xl mb-6">Meet Our Specialists</h1>
          <p className="text-xl text-zinc-600">
            Our team of experienced and compassionate dental professionals is dedicated to your oral health.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {doctors.map((doctor, idx) => (
            <motion.div 
              key={doctor.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: idx * 0.1 }}
              className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow border border-zinc-100 flex flex-col h-full"
            >
              <div className="aspect-w-3 aspect-h-2 w-full h-64 bg-zinc-200">
                {doctor.image_url ? (
                  <img src={doctor.image_url} alt={doctor.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-zinc-400">No Image</div>
                )}
              </div>
              <div className="p-8 flex flex-col flex-grow">
                <h3 className="text-2xl font-bold text-zinc-900 mb-2">{doctor.name}</h3>
                <p className="text-zinc-800 font-medium mb-4">{doctor.specialty}</p>
                <p className="text-zinc-600 mb-8 flex-grow line-clamp-3">{doctor.bio}</p>
                <Link 
                  to={`/doctors/${doctor.slug}`} 
                  className="inline-flex items-center text-zinc-800 font-semibold hover:text-zinc-900 mt-auto"
                >
                  View Profile <ChevronRight className="w-4 h-4 ml-1" />
                </Link>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
