import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Calendar, ArrowLeft, Award, Clock } from 'lucide-react';

export default function DoctorDetail() {
  const { slug } = useParams();
  const [doctor, setDoctor] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/doctors/${slug}`)
      .then(res => {
        if (!res.ok) throw new Error('Not found');
        return res.json();
      })
      .then(data => {
        setDoctor(data);
        setLoading(false);
      })
      .catch(() => {
        setLoading(false);
      });
  }, [slug]);

  if (loading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  if (!doctor) return <div className="min-h-screen flex items-center justify-center">Doctor not found</div>;

  return (
    <div className="bg-white min-h-screen py-20">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <Link to="/doctors" className="inline-flex items-center text-zinc-800 hover:text-zinc-900 font-medium mb-8">
          <ArrowLeft className="w-4 h-4 mr-2" /> Back to all doctors
        </Link>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          <div className="md:col-span-1">
            <div className="rounded-2xl overflow-hidden shadow-lg border border-zinc-100 aspect-w-3 aspect-h-4 bg-zinc-200">
              {doctor.image_url ? (
                <img src={doctor.image_url} alt={doctor.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-zinc-400">No Image</div>
              )}
            </div>
            
            <div className="mt-8 space-y-4">
              <div className="flex items-start">
                <Award className="w-5 h-5 text-zinc-800 mt-1 mr-3 flex-shrink-0" />
                <div>
                  <h4 className="font-semibold text-zinc-900">Qualifications</h4>
                  <p className="text-zinc-600">{doctor.qualifications}</p>
                </div>
              </div>
              <div className="flex items-start">
                <Clock className="w-5 h-5 text-zinc-800 mt-1 mr-3 flex-shrink-0" />
                <div>
                  <h4 className="font-semibold text-zinc-900">Experience</h4>
                  <p className="text-zinc-600">{doctor.experience_years} Years</p>
                </div>
              </div>
            </div>
          </div>
          
          <div className="md:col-span-2">
            <h1 className="text-4xl font-extrabold text-zinc-900 sm:text-5xl mb-2">{doctor.name}</h1>
            <p className="text-2xl text-zinc-800 font-medium mb-8">{doctor.specialty}</p>
            
            <div className="prose prose-lg prose-zinc max-w-none mb-12">
              <div dangerouslySetInnerHTML={{ __html: doctor.bio.replace(/\n/g, '<br/>') }} />
            </div>

            <div className="bg-zinc-50 rounded-2xl p-8 border border-zinc-100">
              <h3 className="text-2xl font-bold text-zinc-900 mb-4">Book an appointment with {doctor.name}</h3>
              <Link to={`/booking?doctor=${doctor.id}`} className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-bold rounded-full text-white bg-zinc-800 hover:bg-zinc-900 shadow-md transition-colors">
                <Calendar className="w-5 h-5 mr-2" /> Schedule Consultation
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
