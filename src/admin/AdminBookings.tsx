import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { format } from 'date-fns';
import { Calendar as CalendarIcon, Clock, X, CheckCircle2 } from 'lucide-react';

export default function AdminBookings() {
  const { token } = useAuth();
  const [bookings, setBookings] = useState<any[]>([]);
  const [rescheduleModalOpen, setRescheduleModalOpen] = useState(false);
  const [successModalOpen, setSuccessModalOpen] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState<any>(null);
  const [newDate, setNewDate] = useState('');
  const [newHour, setNewHour] = useState('10');
  const [newMinute, setNewMinute] = useState('00');
  const [newAmPm, setNewAmPm] = useState('AM');
  const [rescheduleReason, setRescheduleReason] = useState('');

  const fetchBookings = () => {
    fetch('/api/admin/bookings', { headers: { Authorization: `Bearer ${token}` } })
      .then(res => res.json())
      .then(setBookings);
  };

  useEffect(() => {
    fetchBookings();
  }, [token]);

  const handleStatusChange = async (id: number, status: string) => {
    await fetch(`/api/admin/bookings/${id}/status`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ status })
    });
    fetchBookings();
  };

  const openRescheduleModal = (booking: any) => {
    setSelectedBooking(booking);
    setNewDate(booking.date);
    
    if (booking.time) {
      const [h, m] = booking.time.split(':');
      let hourNum = parseInt(h, 10);
      const ampm = hourNum >= 12 ? 'PM' : 'AM';
      hourNum = hourNum % 12;
      if (hourNum === 0) hourNum = 12;
      
      setNewHour(hourNum.toString().padStart(2, '0'));
      setNewMinute(m || '00');
      setNewAmPm(ampm);
    } else {
      setNewHour('10');
      setNewMinute('00');
      setNewAmPm('AM');
    }
    
    setRescheduleReason(booking.reschedule_reason || '');
    setRescheduleModalOpen(true);
  };

  const handleReschedule = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBooking) return;

    let h = parseInt(newHour, 10);
    if (newAmPm === 'PM' && h < 12) h += 12;
    if (newAmPm === 'AM' && h === 12) h = 0;
    const formattedTime = `${h.toString().padStart(2, '0')}:${newMinute}`;

    await fetch(`/api/admin/bookings/${selectedBooking.id}/reschedule`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ date: newDate, time: formattedTime, reason: rescheduleReason })
    });
    
    setRescheduleModalOpen(false);
    setSelectedBooking(null);
    fetchBookings();
    setSuccessModalOpen(true);
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-zinc-800">Manage Bookings</h2>
      </div>

      <div className="bg-white shadow rounded-lg overflow-hidden border border-zinc-200">
        <table className="min-w-full divide-y divide-zinc-200">
          <thead className="bg-zinc-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-zinc-500 uppercase tracking-wider">Patient</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-zinc-500 uppercase tracking-wider">Contact</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-zinc-500 uppercase tracking-wider">Date & Time</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-zinc-500 uppercase tracking-wider">Service / Doctor</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-zinc-500 uppercase tracking-wider">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-zinc-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-zinc-200">
            {bookings.map((booking) => (
              <tr key={booking.id}>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-zinc-900">{booking.patient_name}</div>
                  <div className="text-sm text-zinc-500 truncate max-w-xs" title={booking.notes}>{booking.notes}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-zinc-900">{booking.email}</div>
                  <div className="text-sm text-zinc-500">{booking.phone}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-zinc-900">{booking.date}</div>
                  <div className="text-sm text-zinc-500">{booking.time}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-zinc-900">{booking.service_title || 'Any Service'}</div>
                  <div className="text-sm text-zinc-500">{booking.doctor_name || 'Any Doctor'}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                    ${booking.status === 'confirmed' ? 'bg-green-100 text-green-800' : 
                      booking.status === 'cancelled' ? 'bg-red-100 text-red-800' : 
                      'bg-amber-100 text-amber-800'}`}>
                    {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium flex flex-col space-y-2">
                  <select 
                    value={booking.status} 
                    onChange={(e) => handleStatusChange(booking.id, e.target.value)}
                    className="block w-full pl-3 pr-10 py-1.5 text-sm border-zinc-300 focus:outline-none focus:ring-zinc-600 focus:border-zinc-600 rounded-md border"
                  >
                    <option value="pending">Pending</option>
                    <option value="confirmed">Confirmed</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                  <button 
                    onClick={() => openRescheduleModal(booking)}
                    className="text-blue-600 hover:text-blue-900 text-left text-xs font-medium"
                  >
                    Reschedule
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {rescheduleModalOpen && selectedBooking && (
        <div className="fixed inset-0 z-[100] overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 bg-zinc-500 bg-opacity-75 transition-opacity" aria-hidden="true" onClick={() => setRescheduleModalOpen(false)}></div>
            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
            <div className="relative z-10 inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-xl sm:w-full">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="sm:flex sm:items-start">
                  <div className="mt-3 text-center sm:mt-0 sm:text-left w-full">
                    <div className="flex justify-between items-center mb-6">
                      <h3 className="text-lg leading-6 font-medium text-zinc-900" id="modal-title">
                        Reschedule Appointment
                      </h3>
                      <button onClick={() => setRescheduleModalOpen(false)} className="text-zinc-400 hover:text-zinc-500">
                        <X className="h-5 w-5" />
                      </button>
                    </div>
                    <div className="mt-2">
                      <p className="text-sm text-zinc-500 mb-6">
                        Rescheduling appointment for <span className="font-semibold text-zinc-700">{selectedBooking.patient_name}</span>.
                      </p>
                      <form onSubmit={handleReschedule} className="space-y-6">
                        
                        <div className="flex flex-col sm:flex-row gap-4 items-center">
                          {/* Date Field */}
                          <div className="flex-1 w-full">
                            <div className="flex items-center border border-[#cbd5e1] rounded-md overflow-hidden bg-white focus-within:ring-1 focus-within:ring-zinc-500 focus-within:border-zinc-500">
                              <input
                                type="date"
                                required
                                value={newDate}
                                onChange={(e) => setNewDate(e.target.value)}
                                className="px-3 py-2 w-full border-none focus:ring-0 text-sm text-[#334155] outline-none [&::-webkit-calendar-picker-indicator]:hidden"
                              />
                              <div className="px-3 py-2 border-l border-[#cbd5e1] flex items-center justify-center bg-zinc-50">
                                <CalendarIcon className="w-4 h-4 text-[#334155]" />
                              </div>
                            </div>
                          </div>

                          {/* Time Field */}
                          <div className="flex items-center gap-2">
                            <div className="border border-[#cbd5e1] rounded-md overflow-hidden bg-white focus-within:ring-1 focus-within:ring-zinc-500 focus-within:border-zinc-500">
                              <select 
                                value={newHour} 
                                onChange={(e) => setNewHour(e.target.value)}
                                className="px-3 py-2 border-none focus:ring-0 text-sm text-[#334155] outline-none appearance-none bg-transparent pr-8"
                                style={{ backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`, backgroundPosition: 'right 0.5rem center', backgroundRepeat: 'no-repeat', backgroundSize: '1.5em 1.5em' }}
                              >
                                {Array.from({length: 12}, (_, i) => {
                                  const val = (i + 1).toString().padStart(2, '0');
                                  return <option key={val} value={val}>{val}</option>
                                })}
                              </select>
                            </div>
                            <span className="text-[#334155] font-medium">:</span>
                            <div className="border border-[#cbd5e1] rounded-md overflow-hidden bg-white focus-within:ring-1 focus-within:ring-zinc-500 focus-within:border-zinc-500">
                              <select 
                                value={newMinute} 
                                onChange={(e) => setNewMinute(e.target.value)}
                                className="px-3 py-2 border-none focus:ring-0 text-sm text-[#334155] outline-none appearance-none bg-transparent pr-8"
                                style={{ backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`, backgroundPosition: 'right 0.5rem center', backgroundRepeat: 'no-repeat', backgroundSize: '1.5em 1.5em' }}
                              >
                                {['00', '15', '30', '45'].map(val => (
                                  <option key={val} value={val}>{val}</option>
                                ))}
                              </select>
                            </div>
                            <div className="border border-[#cbd5e1] rounded-md overflow-hidden bg-white ml-1 focus-within:ring-1 focus-within:ring-zinc-500 focus-within:border-zinc-500">
                              <select 
                                value={newAmPm} 
                                onChange={(e) => setNewAmPm(e.target.value)}
                                className="px-3 py-2 border-none focus:ring-0 text-sm text-[#334155] outline-none appearance-none bg-transparent pr-8"
                                style={{ backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`, backgroundPosition: 'right 0.5rem center', backgroundRepeat: 'no-repeat', backgroundSize: '1.5em 1.5em' }}
                              >
                                <option value="AM">AM</option>
                                <option value="PM">PM</option>
                              </select>
                            </div>
                          </div>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-zinc-700 mb-1">Reason for Rescheduling</label>
                          <textarea
                            required
                            value={rescheduleReason}
                            onChange={(e) => setRescheduleReason(e.target.value)}
                            rows={3}
                            className="w-full border border-zinc-300 rounded-md shadow-sm focus:ring-zinc-500 focus:border-zinc-500 sm:text-sm py-2 px-3 outline-none"
                            placeholder="Please provide a reason..."
                          />
                        </div>

                        <div className="mt-5 sm:mt-6 sm:flex sm:flex-row-reverse border-t border-zinc-100 pt-4">
                          <button
                            type="submit"
                            className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-zinc-900 text-base font-medium text-white hover:bg-zinc-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-zinc-500 sm:ml-3 sm:w-auto sm:text-sm"
                          >
                            Save Changes
                          </button>
                          <button
                            type="button"
                            onClick={() => setRescheduleModalOpen(false)}
                            className="mt-3 w-full inline-flex justify-center rounded-md border border-zinc-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-zinc-700 hover:bg-zinc-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-zinc-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                          >
                            Cancel
                          </button>
                        </div>
                      </form>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      {successModalOpen && (
        <div className="fixed inset-0 z-[100] overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 bg-zinc-500 bg-opacity-75 transition-opacity" aria-hidden="true" onClick={() => setSuccessModalOpen(false)}></div>
            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
            <div className="relative z-10 inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-sm sm:w-full">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="sm:flex sm:items-start">
                  <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-green-100 sm:mx-0 sm:h-10 sm:w-10">
                    <CheckCircle2 className="h-6 w-6 text-green-600" aria-hidden="true" />
                  </div>
                  <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                    <h3 className="text-lg leading-6 font-medium text-zinc-900" id="modal-title">
                      Reschedule Confirmed
                    </h3>
                    <div className="mt-2">
                      <p className="text-sm text-zinc-500">
                        The appointment has been successfully rescheduled.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-zinc-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                <button
                  type="button"
                  className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-zinc-900 text-base font-medium text-white hover:bg-zinc-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-zinc-500 sm:ml-3 sm:w-auto sm:text-sm"
                  onClick={() => setSuccessModalOpen(false)}
                >
                  OK
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
