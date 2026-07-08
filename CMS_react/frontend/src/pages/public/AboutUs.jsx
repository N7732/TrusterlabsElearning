import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { Mail, Phone, MapPin, Loader2 } from 'lucide-react';
import { apiClient, getImageUrl } from '../../api/apiClient';
import image1 from '../../assets/image1.jpg';
import image2 from '../../assets/image2.jpeg'; 
import image3 from '../../assets/image3.png';

const AboutUs = () => {
  const { hash } = useLocation();
  const [partners, setPartners] = useState([]);
  const [staffMembers, setStaffMembers] = useState([]);
  const [formData, setFormData] = useState({ firstName: '', lastName: '', email: '', message: '' });
  const [formStatus, setFormStatus] = useState({ loading: false, success: false, error: '' });

  useEffect(() => {
    fetchPartners();
    fetchStaff();
  }, []);

  const fetchStaff = async () => {
    try {
      const res = await apiClient.get('/settings/staff-members/');
      if (res && res.results) {
        setStaffMembers(res.results.filter(s => s.is_active));
      } else if (Array.isArray(res)) {
        setStaffMembers(res.filter(s => s.is_active));
      }
    } catch (err) {
      console.error('Failed to fetch staff members:', err);
    }
  };

  const fetchPartners = async () => {
    try {
      const data = await apiClient.get('/settings/partners/');
      setPartners(data.filter(p => p.is_active));
    } catch (err) {
      console.error('Failed to fetch partners:', err);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleContactSubmit = async (e) => {
    e.preventDefault();
    setFormStatus({ loading: true, success: false, error: '' });
    
    if (!formData.firstName || !formData.lastName || !formData.email || !formData.message) {
      setFormStatus({ loading: false, success: false, error: 'Please fill out all fields.' });
      return;
    }

    try {
      await apiClient.post('/settings/contact-messages/', {
        name: `${formData.firstName} ${formData.lastName}`,
        email: formData.email,
        subject: `New Inquiry from ${formData.firstName}`,
        message: formData.message
      });
      setFormStatus({ loading: false, success: true, error: '' });
      setFormData({ firstName: '', lastName: '', email: '', message: '' });
    } catch (err) {
      setFormStatus({ loading: false, success: false, error: 'Failed to send message. Please try again later.' });
    }
  };

  useEffect(() => {
    // A small timeout ensures that the DOM is fully rendered before scrolling
    setTimeout(() => {
      if (hash) {
        const element = document.getElementById(hash.replace('#', ''));
        if (element) {
          // Adjust for fixed navbar height if needed
          const yOffset = -80; // 64px for nav + some padding
          const y = element.getBoundingClientRect().top + window.scrollY + yOffset;
          window.scrollTo({ top: y, behavior: 'smooth' });
        }
      } else {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    }, 100);
  }, [hash]);

  return (
    <div className="bg-[#030712] text-gray-300 font-['Work_Sans',sans-serif] min-h-screen pb-20">
      
      {/* 1. Our Story Section */}
      <section id="our-story" className="pt-32 pb-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto relative border-b border-white/10">
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-cyber opacity-30 pointer-events-none z-0"></div>
        <div className="relative z-10">
          <div className="flex items-center gap-4 mb-8">
            <div className="h-[2px] w-12 bg-[#D4AF37]"></div>
            <h2 className="text-[#D4AF37] font-bold tracking-widest uppercase text-sm">Our Story</h2>
          </div>
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h1 className="text-4xl md:text-5xl font-extrabold text-white mb-6 leading-tight">
                Forging Africa's <br/> Digital Resilience
              </h1>
              <p className="text-lg leading-relaxed mb-6 text-gray-400">
                Founded with a vision to protect the continent's rapidly expanding digital frontier, TrusterLabs began as a collective of passionate cybersecurity experts. We recognized a critical gap in enterprise-grade security tailored for the African landscape.
              </p>
              <p className="text-lg leading-relaxed text-gray-400">
                Today, we stand at the forefront of cyber defense, delivering world-class training, strategic consultancy, and cutting-edge research to empower governments, enterprises, and communities across Africa.
              </p>
            </div>
            <div className="relative">
              <div className="absolute inset-0 bg-[#D4AF37] translate-x-4 translate-y-4 rounded-lg opacity-20"></div>
              <img src={image1} alt="Our Story" className="relative z-10 w-full h-[400px] object-cover rounded-lg shadow-2xl border border-white/10" />
            </div>
          </div>
        </div>
      </section>

      {/* 2. Staff Section */}
      <section id="staff" className="pt-24 pb-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto border-b border-white/10">
        <div className="flex items-center gap-4 mb-12 justify-center">
          <div className="h-[2px] w-12 bg-[#D4AF37]"></div>
          <h2 className="text-[#D4AF37] font-bold tracking-widest uppercase text-sm">Leadership & Experts</h2>
          <div className="h-[2px] w-12 bg-[#D4AF37]"></div>
        </div>
        <div className="text-center mb-16 max-w-3xl mx-auto">
          <h3 className="text-3xl md:text-4xl font-bold text-white mb-6">The Minds Behind TrusterLabs</h3>
          <p className="text-gray-400">Our team consists of industry veterans, certified penetration testers, and strategic consultants with decades of combined experience in securing global digital infrastructures.</p>
        </div>
        
        {/* Staff Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {staffMembers.length > 0 ? (
            staffMembers.map((member) => (
              <div key={member.id} className="bg-[#111827] border border-white/5 rounded-xl overflow-hidden group hover:border-[#D4AF37]/50 transition-colors duration-300">
                <div className="h-64 bg-slate-800 relative overflow-hidden">
                  <img 
                    src={member.photo ? getImageUrl(member.photo) : image2} 
                    alt={member.name} 
                    className="w-full h-full object-cover grayscale opacity-70 group-hover:grayscale-0 group-hover:scale-105 transition-all duration-500" 
                  />
                </div>
                <div className="p-6">
                  <h4 className="text-white font-bold text-xl mb-1">{member.name}</h4>
                  <p className="text-[#D4AF37] text-sm mb-4">{member.position}</p>
                  <p className="text-gray-400 text-sm line-clamp-3">{member.bio}</p>
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-full text-center text-gray-500 py-8">
              No active staff members found.
            </div>
          )}
        </div>
      </section>

      {/* 3. Partners Section */}
      <section id="partners" className="pt-24 pb-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto border-b border-white/10">
        <div className="flex items-center gap-4 mb-12">
          <div className="h-[2px] w-12 bg-[#D4AF37]"></div>
          <h2 className="text-[#D4AF37] font-bold tracking-widest uppercase text-sm">Our Network</h2>
        </div>
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div className="order-2 md:order-1 grid grid-cols-2 gap-6">
             {partners.length > 0 ? (
               partners.map((partner) => (
                 <a 
                   key={partner.id} 
                   href={partner.website_url || '#'} 
                   target="_blank" 
                   rel="noopener noreferrer"
                   className="bg-[#111827] border border-white/10 rounded-lg p-6 flex flex-col items-center justify-center hover:bg-white/5 transition-colors aspect-square"
                 >
                    {partner.logo ? (
                      <img src={getImageUrl(partner.logo)} alt={partner.name} className="max-h-full max-w-full object-contain mb-2" />
                    ) : (
                      <span className="text-gray-500 font-bold uppercase tracking-wider text-center">{partner.name}</span>
                    )}
                 </a>
               ))
             ) : (
               <div className="col-span-2 text-center text-gray-500 py-10">
                 Partner network loading...
               </div>
             )}
          </div>
          <div className="order-1 md:order-2">
            <h3 className="text-3xl md:text-4xl font-bold text-white mb-6">Trusted by Global Leaders</h3>
            <p className="text-gray-400 text-lg mb-6">
              Collaboration is key to securing the digital landscape. We partner with industry-leading technology providers, academic institutions, and global security alliances to bring unparalleled solutions to our clients.
            </p>
            <p className="text-gray-400 text-lg">
              Through these strategic partnerships, we ensure our curriculum and security methodologies are always aligned with international standards.
            </p>
          </div>
        </div>
      </section>

      {/* 4. Contact Us Section */}
      <section id="contact-us" className="pt-24 pb-10 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="flex items-center gap-4 mb-12 justify-center">
          <div className="h-[2px] w-12 bg-[#D4AF37]"></div>
          <h2 className="text-[#D4AF37] font-bold tracking-widest uppercase text-sm">Get in Touch</h2>
          <div className="h-[2px] w-12 bg-[#D4AF37]"></div>
        </div>
        
        <div className="bg-[#111827] border border-white/10 rounded-2xl p-8 md:p-12 shadow-[0_0_40px_rgba(0,0,0,0.5)]">
          <div className="grid md:grid-cols-5 gap-12">
            <div className="md:col-span-2">
              <h3 className="text-3xl font-bold text-white mb-6">Let's Secure Your Future</h3>
              <p className="text-gray-400 mb-8">Whether you're looking for enterprise security solutions, expert consulting, or world-class training, our team is ready to assist you.</p>
              
              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-full bg-[#D4AF37]/10 flex items-center justify-center shrink-0">
                    <MapPin className="text-[#D4AF37]" size={20} />
                  </div>
                  <div>
                    <h4 className="text-white font-bold mb-1">Headquarters</h4>
                    <p className="text-gray-400 text-sm">Kigali, Rwanda<br/>Cybersecurity Hub, Silicon Avenue</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-full bg-[#D4AF37]/10 flex items-center justify-center shrink-0">
                    <Phone className="text-[#D4AF37]" size={20} />
                  </div>
                  <div>
                    <h4 className="text-white font-bold mb-1">Phone</h4>
                    <p className="text-gray-400 text-sm">+250791756434</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-full bg-[#D4AF37]/10 flex items-center justify-center shrink-0">
                    <Mail className="text-[#D4AF37]" size={20} />
                  </div>
                  <div>
                    <h4 className="text-white font-bold mb-1">Email</h4>
                    <p className="text-gray-400 text-sm">trusteraccademic@gmail.com</p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="md:col-span-3">
              <form className="space-y-6" onSubmit={handleContactSubmit}>
                {formStatus.success && (
                  <div className="bg-emerald-500/10 border border-emerald-500/50 text-emerald-400 p-4 rounded-lg">
                    Message sent successfully! We will get back to you soon.
                  </div>
                )}
                {formStatus.error && (
                  <div className="bg-red-500/10 border border-red-500/50 text-red-400 p-4 rounded-lg">
                    {formStatus.error}
                  </div>
                )}
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-2">First Name</label>
                    <input type="text" name="firstName" value={formData.firstName} onChange={handleInputChange} className="w-full bg-[#030712] border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-[#D4AF37] transition-colors" placeholder="John" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-2">Last Name</label>
                    <input type="text" name="lastName" value={formData.lastName} onChange={handleInputChange} className="w-full bg-[#030712] border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-[#D4AF37] transition-colors" placeholder="Doe" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">Email Address</label>
                  <input type="email" name="email" value={formData.email} onChange={handleInputChange} className="w-full bg-[#030712] border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-[#D4AF37] transition-colors" placeholder="john@example.com" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">Message</label>
                  <textarea name="message" value={formData.message} onChange={handleInputChange} rows="4" className="w-full bg-[#030712] border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-[#D4AF37] transition-colors resize-none" placeholder="How can we help you?"></textarea>
                </div>
                <button type="submit" disabled={formStatus.loading} className="bg-[#D4AF37] hover:bg-[#c29e2f] disabled:opacity-50 flex items-center justify-center gap-2 text-black font-bold py-3 px-8 rounded-lg transition-colors w-full sm:w-auto">
                  {formStatus.loading && <Loader2 className="animate-spin" size={18} />}
                  {formStatus.loading ? 'Sending...' : 'Send Message'}
                </button>
              </form>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
};

export default AboutUs;
