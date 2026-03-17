import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Calendar, User, Phone, Mail, FileText, CheckCircle2 } from 'lucide-react';

export default function Booking() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [services, setServices] = useState<any[]>([]);
  const [doctors, setDoctors] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const initialServiceId = searchParams.get('service') || '';
  const initialDoctorId = searchParams.get('doctor') || '';

  const [formData, setFormData] = useState({
    patient_name: '',
    email: '',
    phone: '',
    date: '',
    time: '',
    service_id: initialServiceId,
    doctor_id: initialDoctorId,
    notes: ''
  });

  useEffect(() => {
    fetch('/api/services').then(res => res.json()).then(setServices);
    fetch('/api/doctors').then(res => res.json()).then(setDoctors);
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const accessKey = import.meta.env.VITE_WEB3FORMS_ACCESS_KEY;
    if (!accessKey || accessKey === 'YOUR_WEB3FORMS_ACCESS_KEY') {
      alert('Please configure your Web3Forms Access Key in the AI Studio Settings (gear icon) -> Secrets as VITE_WEB3FORMS_ACCESS_KEY.');
      return;
    }

    setLoading(true);
    try {
      const selectedService = services.find(s => String(s.id) === String(formData.service_id))?.title || 'Not specified';
      const selectedDoctor = doctors.find(d => String(d.id) === String(formData.doctor_id))?.name || 'Any available doctor';

      const submissionData = {
        access_key: accessKey,
        subject: `New Appointment Request from ${formData.patient_name}`,
        from_name: formData.patient_name,
        patient_name: formData.patient_name,
        email: formData.email,
        phone: formData.phone,
        date: formData.date,
        time: formData.time,
        service: selectedService,
        doctor: selectedDoctor,
        notes: formData.notes
      };

      const res = await fetch('https://api.web3forms.com/submit', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(submissionData)
      });
      
      const data = await res.json();
      
      if (res.ok && data.success) {
        // Also save to local database for admin dashboard
        try {
          await fetch('/api/bookings', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(formData)
          });
        } catch (dbError) {
          console.error('Failed to save to local database:', dbError);
          // We still show success to the user since the email was sent
        }
        
        setSuccess(true);
      } else {
        console.error('Web3Forms Error:', data);
        alert(`Failed to book appointment: ${data.message || 'Please try again.'}`);
      }
    } catch (error) {
      console.error('Submission Error:', error);
      alert('An error occurred while submitting the form. Please check your connection and try again.');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-zinc-50 flex items-center justify-center py-20 px-4">
        <div className="max-w-md w-full bg-white rounded-3xl shadow-xl p-10 text-center">
          <div className="w-20 h-20 bg-zinc-200 text-zinc-800 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 className="w-10 h-10" />
          </div>
          <h2 className="text-3xl font-bold text-zinc-900 mb-4">Booking Confirmed!</h2>
          <p className="text-zinc-600 mb-8">
            Thank you, {formData.patient_name}. Your appointment request has been received. We will contact you shortly to confirm the details.
          </p>
          <button onClick={() => navigate('/')} className="w-full bg-zinc-800 text-white font-bold py-3 px-4 rounded-full hover:bg-zinc-900 transition-colors">
            Return to Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-50 py-20 px-4">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-extrabold text-zinc-900 sm:text-5xl mb-4">Book an Appointment</h1>
          <p className="text-xl text-zinc-600">Schedule your visit with our dental professionals.</p>
        </div>

        <div className="bg-white rounded-3xl shadow-xl overflow-hidden">
          <form onSubmit={handleSubmit} className="p-8 sm:p-12">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Personal Info */}
              <div className="space-y-6">
                <h3 className="text-xl font-bold text-zinc-900 border-b pb-2">Personal Information</h3>
                
                <div>
                  <label className="block text-sm font-medium text-zinc-700 mb-2">Full Name *</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <User className="h-5 w-5 text-zinc-400" />
                    </div>
                    <input type="text" name="patient_name" required value={formData.patient_name} onChange={handleChange} className="pl-10 block w-full border-zinc-300 rounded-lg focus:ring-zinc-600 focus:border-zinc-600 sm:text-sm border py-3 px-4" placeholder="John Doe" />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-zinc-700 mb-2">Email Address *</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Mail className="h-5 w-5 text-zinc-400" />
                    </div>
                    <input type="email" name="email" required value={formData.email} onChange={handleChange} className="pl-10 block w-full border-zinc-300 rounded-lg focus:ring-zinc-600 focus:border-zinc-600 sm:text-sm border py-3 px-4" placeholder="john@example.com" />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-zinc-700 mb-2">Phone Number *</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Phone className="h-5 w-5 text-zinc-400" />
                    </div>
                    <input type="tel" name="phone" required value={formData.phone} onChange={handleChange} className="pl-10 block w-full border-zinc-300 rounded-lg focus:ring-zinc-600 focus:border-zinc-600 sm:text-sm border py-3 px-4" placeholder="(555) 123-4567" />
                  </div>
                </div>
              </div>

              {/* Appointment Details */}
              <div className="space-y-6">
                <h3 className="text-xl font-bold text-zinc-900 border-b pb-2">Appointment Details</h3>
                
                <div>
                  <label className="block text-sm font-medium text-zinc-700 mb-2">Service</label>
                  <select name="service_id" value={formData.service_id} onChange={handleChange} className="block w-full border-zinc-300 rounded-lg focus:ring-zinc-600 focus:border-zinc-600 sm:text-sm border py-3 px-4 bg-white">
                    <option value="">Select a service (Optional)</option>
                    {services.map(s => <option key={s.id} value={s.id}>{s.title}</option>)}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-zinc-700 mb-2">Preferred Doctor</label>
                  <select name="doctor_id" value={formData.doctor_id} onChange={handleChange} className="block w-full border-zinc-300 rounded-lg focus:ring-zinc-600 focus:border-zinc-600 sm:text-sm border py-3 px-4 bg-white">
                    <option value="">Any available doctor</option>
                    {doctors.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-zinc-700 mb-2">Preferred Date *</label>
                    <input type="date" name="date" required value={formData.date} onChange={handleChange} className="block w-full border-zinc-300 rounded-lg focus:ring-zinc-600 focus:border-zinc-600 sm:text-sm border py-3 px-4" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-zinc-700 mb-2">Preferred Time *</label>
                    <input type="time" name="time" required value={formData.time} onChange={handleChange} className="block w-full border-zinc-300 rounded-lg focus:ring-zinc-600 focus:border-zinc-600 sm:text-sm border py-3 px-4" />
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-8">
              <label className="block text-sm font-medium text-zinc-700 mb-2">Additional Notes or Concerns</label>
              <div className="relative">
                <div className="absolute top-3 left-3 pointer-events-none">
                  <FileText className="h-5 w-5 text-zinc-400" />
                </div>
                <textarea name="notes" rows={4} value={formData.notes} onChange={handleChange} className="pl-10 block w-full border-zinc-300 rounded-lg focus:ring-zinc-600 focus:border-zinc-600 sm:text-sm border py-3 px-4" placeholder="Please describe any specific symptoms or requests..."></textarea>
              </div>
            </div>

            <div className="mt-10">
              <button type="submit" disabled={loading} className="w-full flex justify-center py-4 px-8 border border-transparent rounded-full shadow-sm text-lg font-bold text-white bg-zinc-800 hover:bg-zinc-900 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-zinc-600 transition-colors disabled:opacity-50">
                {loading ? 'Submitting...' : 'Confirm Booking Request'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
