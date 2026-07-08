import React, { useState } from 'react';
import { CheckCircle, Shield, Award, Users, ArrowRight, X, Loader } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Button from '../../components/common/Button';
import { apiClient } from '../../api/apiClient';

const Membership = () => {
  const navigate = useNavigate();
  const [showModal, setShowModal] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  
  const [formData, setFormData] = useState({
    Fullname: '',
    email: '',
    phone_number: '',
    Where_heard_about_us: '',
  });

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleJoinClick = (plan) => {
    setSelectedPlan(plan);
    setSuccess(false);
    setErrorMsg('');
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');

    try {
      const payload = {
        ...formData,
        description: `Plan: ${selectedPlan?.name}`,
        duration_days: 365, // Default 1 year
      };
      
      const res = await apiClient.post('/api/membership/memberships/', payload);
      setSuccess(true);
    } catch (err) {
      console.error("Membership registration error", err);
      setErrorMsg(err.response?.data?.email?.[0] || err.response?.data?.detail || "An error occurred during registration. Please try again.");
    } finally {
      setLoading(false);
    }
  };
  const plans = [
    {
      name: 'Student Explorer',
      price: 'Free',
      description: 'Perfect for university students looking to explore the cybersecurity field.',
      features: [
        'Access to basic webinars',
        'Monthly newsletter',
        'Community forum access',
        'Discount on entry-level courses'
      ],
      icon: <Users className="text-gray-400" size={32} />
    },
    {
      name: 'Professional',
      price: '$49/mo',
      description: 'Designed for working professionals wanting to stay ahead of threats.',
      features: [
        'All Student Explorer features',
        'Access to advanced research articles',
        'Exclusive technical webinars',
        'Priority enrollment for bootcamps',
        '1-on-1 mentorship sessions (1/mo)'
      ],
      icon: <Award className="text-[#D4AF37]" size={32} />,
      popular: true
    },
    {
      name: 'Enterprise Partner',
      price: 'Custom',
      description: 'Comprehensive access for organizations building internal cyber resilience.',
      features: [
        'Unlimited team access to research',
        'Dedicated account manager',
        'Custom corporate training discounts',
        'Annual security posture review',
        'VIP access to global summits'
      ],
      icon: <Shield className="text-blue-500" size={32} />
    }
  ];

  return (
    <div className="bg-[#030712] min-h-[calc(100vh-64px)] font-['Work_Sans',sans-serif] pb-20">
      
      {/* Header */}
      <section className="pt-24 pb-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto border-b border-white/10 relative text-center">
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-cyber opacity-30 pointer-events-none z-0"></div>
        <div className="relative z-10 max-w-3xl mx-auto">
          <div className="flex items-center gap-4 justify-center mb-6">
            <div className="h-[2px] w-8 bg-[#D4AF37]"></div>
            <h2 className="text-[#D4AF37] font-bold tracking-widest uppercase text-sm">Join the Elite</h2>
            <div className="h-[2px] w-8 bg-[#D4AF37]"></div>
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold text-white mb-6 leading-tight">
            TrusterLabs Membership
          </h1>
          <p className="text-lg text-gray-400">
            Become a part of Africa's most exclusive cybersecurity network. Gain unrestricted access to cutting-edge research, specialized training discounts, and a community of top-tier professionals.
          </p>
        </div>
      </section>

      {/* Pricing Cards */}
      <section className="pt-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="grid md:grid-cols-3 gap-8">
          {plans.map((plan, index) => (
            <div 
              key={index} 
              className={`relative bg-[#111827] rounded-2xl p-8 border ${plan.popular ? 'border-[#D4AF37] shadow-[0_0_30px_rgba(212,175,55,0.15)] transform md:-translate-y-4' : 'border-white/10 hover:border-white/30 transition-colors'}`}
            >
              {plan.popular && (
                <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-[#D4AF37] text-black text-xs font-bold uppercase tracking-wider py-1 px-4 rounded-full">
                  Most Popular
                </div>
              )}
              <div className="mb-6">{plan.icon}</div>
              <h3 className="text-2xl font-bold text-white mb-2">{plan.name}</h3>
              <p className="text-gray-400 text-sm mb-6 h-10">{plan.description}</p>
              <div className="text-3xl font-bold text-white mb-8">{plan.price}</div>
              
              <ul className="space-y-4 mb-8">
                {plan.features.map((feature, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <CheckCircle size={18} className="text-[#D4AF37] shrink-0 mt-0.5" />
                    <span className="text-sm text-gray-300">{feature}</span>
                  </li>
                ))}
              </ul>

              <button 
                onClick={() => handleJoinClick(plan)}
                className={`w-full py-3 rounded-lg font-bold transition-colors ${plan.popular ? 'bg-[#D4AF37] hover:bg-[#c29e2f] text-black' : 'bg-transparent border border-white/20 text-white hover:bg-white/5'}`}>
                {plan.price === 'Custom' ? 'Contact Sales' : 'Join Now'}
              </button>
            </div>
          ))}
        </div>
        
        {/* Additional CTA */}
        <div className="mt-20 flex flex-col md:flex-row items-center justify-between bg-[#111827] border border-white/10 rounded-xl p-8 lg:p-12">
          <div className="md:w-2/3 mb-6 md:mb-0 text-center md:text-left">
            <h3 className="text-2xl font-bold text-white mb-2">Already a Member?</h3>
            <p className="text-gray-400">Log in to your account to access the research portal, register for upcoming webinars, and manage your subscription preferences.</p>
          </div>
          <div className="md:w-1/3 flex justify-center md:justify-end">
             <Button 
               variant="outline" 
               onClick={() => navigate('/member-portal')}
               className="border-[#D4AF37] text-white hover:bg-white/5 flex items-center gap-2"
             >
               Access Portal <ArrowRight size={16} className="text-[#D4AF37]" />
             </Button>
          </div>
        </div>
      </section>

      {/* Registration Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-[#111827] border border-white/10 rounded-2xl w-full max-w-md overflow-hidden relative shadow-2xl">
            {/* Modal Header */}
            <div className="p-6 border-b border-white/10 flex justify-between items-center">
              <h3 className="text-xl font-bold text-white">Join {selectedPlan?.name}</h3>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-white transition-colors">
                <X size={24} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6">
              {success ? (
                <div className="text-center py-8">
                  <div className="mx-auto w-16 h-16 bg-[#D4AF37]/20 rounded-full flex items-center justify-center mb-4">
                    <CheckCircle className="text-[#D4AF37]" size={32} />
                  </div>
                  <h4 className="text-2xl font-bold text-white mb-2">Registration Successful!</h4>
                  <p className="text-gray-400 mb-6">
                    Welcome to TrusterLabs! We have received your membership request and sent a confirmation to your email.
                  </p>
                  <Button onClick={() => setShowModal(false)} className="w-full bg-[#D4AF37] text-black hover:bg-[#c29e2f]">
                    Close
                  </Button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  {errorMsg && (
                    <div className="bg-red-500/10 border border-red-500/50 text-red-400 p-3 rounded-lg text-sm">
                      {errorMsg}
                    </div>
                  )}
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">Full Name</label>
                    <input 
                      type="text" 
                      name="Fullname"
                      required
                      value={formData.Fullname}
                      onChange={handleInputChange}
                      className="w-full bg-black/30 border border-white/10 rounded-lg p-3 text-white focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37] outline-none"
                      placeholder="John Doe"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">Email Address</label>
                    <input 
                      type="email" 
                      name="email"
                      required
                      value={formData.email}
                      onChange={handleInputChange}
                      className="w-full bg-black/30 border border-white/10 rounded-lg p-3 text-white focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37] outline-none"
                      placeholder="john@example.com"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">Phone Number (Optional)</label>
                    <input 
                      type="text" 
                      name="phone_number"
                      value={formData.phone_number}
                      onChange={handleInputChange}
                      className="w-full bg-black/30 border border-white/10 rounded-lg p-3 text-white focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37] outline-none"
                      placeholder="+1 234 567 8900"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">Where did you hear about us?</label>
                    <select 
                      name="Where_heard_about_us"
                      value={formData.Where_heard_about_us}
                      onChange={handleInputChange}
                      className="w-full bg-black/30 border border-white/10 rounded-lg p-3 text-white focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37] outline-none"
                    >
                      <option value="">Select an option</option>
                      <option value="Social Media">Social Media</option>
                      <option value="Search Engine">Search Engine</option>
                      <option value="Friend/Colleague">Friend/Colleague</option>
                      <option value="Event/Conference">Event/Conference</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>

                  <Button 
                    type="submit" 
                    disabled={loading}
                    className="w-full mt-4 bg-[#D4AF37] text-black hover:bg-[#c29e2f] flex justify-center items-center"
                  >
                    {loading ? <Loader className="animate-spin mr-2" size={20} /> : null}
                    {loading ? 'Processing...' : 'Complete Registration'}
                  </Button>
                </form>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Membership;
