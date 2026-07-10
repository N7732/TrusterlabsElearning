import React from 'react';
import { X, CreditCard, ShieldCheck } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { getImageUrl } from '../../api/apiClient';
import Button from '../common/Button';

const PaymentDrawer = ({ isOpen, onClose, course }) => {
  const navigate = useNavigate();
  return (
    <div className={`fixed inset-0 z-50 flex justify-end p-4 sm:p-6 transition-all duration-300 ${isOpen ? 'opacity-100 visible' : 'opacity-0 invisible pointer-events-none'}`}>
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal Block */}
      <div className={`relative w-full max-w-md bg-white rounded-3xl shadow-2xl flex flex-col overflow-hidden h-fit my-auto transform transition-transform duration-300 ${isOpen ? 'translate-x-0' : 'translate-x-[120%]'}`}>
        <div className="flex items-center justify-between p-5 border-b border-slate-100">
          <h2 className="text-xl font-bold text-slate-900">Start 1-Week Free Trial</h2>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
            <X size={20} className="text-slate-500" />
          </button>
        </div>
        
        {course && (
          <div className="p-5 flex-grow">
            {/* Course Summary */}
            <div className="flex gap-3 mb-4 items-center">
              <img src={getImageUrl(course.thumbnail)} onError={(e) => { e.target.onerror = null; e.target.src = "https://images.unsplash.com/photo-1573164713988-8665fc963095?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80" }} alt={course.title} className="w-16 h-16 object-cover rounded-lg shadow-sm" />
              <div>
                <h3 className="font-bold text-slate-900 line-clamp-2 text-sm leading-tight">{course.title}</h3>
                <div className="mt-1 font-black text-blue-700 text-sm">
                  ${course.price}
                </div>
              </div>
            </div>
            
            {/* Payment Info */}
            <div className="bg-slate-50 rounded-xl p-4 border border-slate-100 mb-4">
              <div className="flex items-center gap-2 mb-3">
                <CreditCard size={16} className="text-blue-700" />
                <h4 className="font-bold text-slate-900 text-sm">Payment Details</h4>
              </div>
              <p className="text-[13px] text-slate-600 font-medium leading-tight mb-3">
                Enter your card to start your free week. <span className="font-bold text-slate-900">You will NOT be charged today.</span>
              </p>
              
              <div className="space-y-2.5">
                <input type="text" placeholder="Card Number" className="w-full px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500" />
                <div className="flex gap-2.5">
                  <input type="text" placeholder="MM/YY" className="w-1/2 px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500" />
                  <input type="text" placeholder="CVC" className="w-1/2 px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500" />
                </div>
              </div>
            </div>
            
            {/* Guarantee */}
            <div className="flex items-start gap-2 bg-blue-50 text-blue-800 p-3 rounded-xl border border-blue-100">
              <ShieldCheck size={16} className="shrink-0 mt-0.5" />
              <p className="text-[12px] font-medium leading-tight">
                After 1 week, you will be charged <span className="font-bold">${course.price}</span>. Cancel anytime before the trial ends.
              </p>
            </div>
          </div>
        )}
        
        <div className="p-5 border-t border-slate-100 bg-slate-50">
          <Button 
            variant="primary" 
            className="w-full h-11 text-base font-bold shadow hover:shadow-md bg-blue-600 hover:bg-blue-700 border-transparent rounded-xl"
            onClick={() => {
              if (course) navigate(`/course/${course.id}?trial=true`);
            }}
          >
            Start Free Week
          </Button>
        </div>
      </div>
    </div>
  );
};

export default PaymentDrawer;
