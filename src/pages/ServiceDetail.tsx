import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Calendar, ArrowLeft } from 'lucide-react';

export default function ServiceDetail() {
  const { slug } = useParams();
  const [service, setService] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/services/${slug}`)
      .then(res => {
        if (!res.ok) throw new Error('Not found');
        return res.json();
      })
      .then(data => {
        setService(data);
        setLoading(false);
      })
      .catch(() => {
        setLoading(false);
      });
  }, [slug]);

  if (loading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  if (!service) return <div className="min-h-screen flex items-center justify-center">Service not found</div>;

  return (
    <div className="bg-white min-h-screen py-20">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <Link to="/services" className="inline-flex items-center text-zinc-800 hover:text-zinc-900 font-medium mb-8">
          <ArrowLeft className="w-4 h-4 mr-2" /> Back to all services
        </Link>
        <h1 className="text-4xl font-extrabold text-zinc-900 sm:text-5xl mb-6">{service.title}</h1>
        <p className="text-xl text-zinc-600 mb-12">{service.description}</p>
        
        <div className="prose prose-lg prose-zinc max-w-none mb-16">
          {/* In a real app, this would render markdown or HTML safely */}
          <div dangerouslySetInnerHTML={{ __html: service.content.replace(/\n/g, '<br/>') }} />
        </div>

        <div className="bg-zinc-100 rounded-3xl p-8 sm:p-12 text-center">
          <h2 className="text-3xl font-bold text-zinc-900 mb-4">Ready to schedule your {service.title.toLowerCase()}?</h2>
          <p className="text-lg text-zinc-600 mb-8">Our team is here to answer any questions and get you started.</p>
          <Link to={`/booking?service=${service.id}`} className="inline-flex items-center justify-center px-8 py-4 border border-transparent text-lg font-bold rounded-full text-white bg-zinc-800 hover:bg-zinc-900 shadow-md transition-colors">
            <Calendar className="w-5 h-5 mr-2" /> Book Appointment
          </Link>
        </div>
      </div>
    </div>
  );
}
