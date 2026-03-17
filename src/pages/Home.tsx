import { useEffect, useState } from 'react';
import { Link, useOutletContext } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CheckCircle2, Star, ChevronRight, Calendar, Users, Award, ShieldCheck } from 'lucide-react';

export default function Home() {
  const { settings } = useOutletContext<any>();
  const [services, setServices] = useState<any[]>([]);
  const [doctors, setDoctors] = useState<any[]>([]);
  const [testimonials, setTestimonials] = useState<any[]>([]);

  useEffect(() => {
    fetch('/api/services').then(res => res.json()).then(setServices);
    fetch('/api/doctors').then(res => res.json()).then(setDoctors);
    fetch('/api/testimonials').then(res => res.json()).then(setTestimonials);
  }, []);

  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-zinc-100 py-20 lg:py-32 overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img 
            src="https://images.unsplash.com/photo-1606811841689-23dfddce3e95?auto=format&fit=crop&q=80&w=2000" 
            alt="Dental Clinic" 
            className="w-full h-full object-cover opacity-10"
            referrerPolicy="no-referrer"
          />
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="max-w-2xl">
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="text-5xl lg:text-6xl font-extrabold text-zinc-900 tracking-tight mb-6"
            >
              {settings.heroHeadline || 'Modern Dentistry for a Better Smile'}
            </motion.h1>
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="text-xl text-zinc-600 mb-10 leading-relaxed"
            >
              {settings.heroSubheadline || 'Experience pain-free, professional dental care in a relaxing environment.'}
            </motion.p>
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="flex flex-wrap gap-4"
            >
              <Link to="/booking" className="bg-zinc-800 text-white px-8 py-4 rounded-full font-semibold text-lg hover:bg-zinc-900 transition-colors shadow-lg hover:shadow-xl flex items-center">
                Book Appointment <ChevronRight className="ml-2 w-5 h-5" />
              </Link>
              <Link to="/services" className="bg-white text-zinc-900 border-2 border-zinc-200 px-8 py-4 rounded-full font-semibold text-lg hover:bg-zinc-100 transition-colors">
                View Services
              </Link>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Trust Indicators */}
      <section className="py-12 bg-white border-b border-zinc-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 text-center">
            <div className="flex flex-col items-center">
              <div className="w-12 h-12 bg-zinc-200 text-zinc-800 rounded-full flex items-center justify-center mb-4">
                <Users className="w-6 h-6" />
              </div>
              <h3 className="text-3xl font-bold text-zinc-900">10k+</h3>
              <p className="text-zinc-500 font-medium mt-1">Happy Patients</p>
            </div>
            <div className="flex flex-col items-center">
              <div className="w-12 h-12 bg-zinc-200 text-zinc-800 rounded-full flex items-center justify-center mb-4">
                <Award className="w-6 h-6" />
              </div>
              <h3 className="text-3xl font-bold text-zinc-900">15+</h3>
              <p className="text-zinc-500 font-medium mt-1">Years Experience</p>
            </div>
            <div className="flex flex-col items-center">
              <div className="w-12 h-12 bg-zinc-200 text-zinc-800 rounded-full flex items-center justify-center mb-4">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h3 className="text-3xl font-bold text-zinc-900">100%</h3>
              <p className="text-zinc-500 font-medium mt-1">Certified Experts</p>
            </div>
            <div className="flex flex-col items-center">
              <div className="w-12 h-12 bg-zinc-200 text-zinc-800 rounded-full flex items-center justify-center mb-4">
                <Star className="w-6 h-6" />
              </div>
              <h3 className="text-3xl font-bold text-zinc-900">4.9/5</h3>
              <p className="text-zinc-500 font-medium mt-1">Patient Rating</p>
            </div>
          </div>
        </div>
      </section>

      {/* Services Overview */}
      <section className="py-24 bg-zinc-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-zinc-800 font-semibold tracking-wide uppercase text-sm mb-3">Our Expertise</h2>
            <h3 className="text-4xl font-bold text-zinc-900 mb-6">Comprehensive Dental Services</h3>
            <p className="text-lg text-zinc-600">We offer a wide range of dental treatments to ensure your smile stays healthy and beautiful for a lifetime.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {services.slice(0, 6).map((service, idx) => (
              <motion.div 
                key={service.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: idx * 0.1 }}
                className="bg-white rounded-2xl p-8 shadow-sm hover:shadow-md transition-shadow border border-zinc-100"
              >
                <div className="w-14 h-14 bg-zinc-100 text-zinc-800 rounded-xl flex items-center justify-center mb-6">
                  {/* Icon placeholder */}
                  <CheckCircle2 className="w-7 h-7" />
                </div>
                <h4 className="text-xl font-bold text-zinc-900 mb-3">{service.title}</h4>
                <p className="text-zinc-600 mb-6 line-clamp-3">{service.description}</p>
                <Link to={`/services/${service.slug}`} className="text-zinc-800 font-semibold flex items-center hover:text-zinc-900">
                  Learn more <ChevronRight className="w-4 h-4 ml-1" />
                </Link>
              </motion.div>
            ))}
          </div>
          <div className="mt-12 text-center">
            <Link to="/services" className="inline-flex items-center justify-center px-6 py-3 border border-zinc-300 shadow-sm text-base font-medium rounded-full text-zinc-700 bg-white hover:bg-zinc-50 transition-colors">
              View All Services
            </Link>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-zinc-900 py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-extrabold text-white sm:text-4xl mb-6">
            Ready to improve your smile?
          </h2>
          <p className="text-xl text-zinc-200 mb-10">
            Schedule your consultation today and take the first step towards optimal oral health.
          </p>
          <Link to="/booking" className="inline-flex items-center justify-center px-8 py-4 border border-transparent text-lg font-bold rounded-full text-zinc-900 bg-white hover:bg-zinc-100 shadow-lg transition-colors">
            <Calendar className="w-5 h-5 mr-2" /> Schedule Your Visit
          </Link>
        </div>
      </section>
    </div>
  );
}
