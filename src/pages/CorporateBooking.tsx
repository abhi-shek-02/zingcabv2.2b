import React, { useState } from 'react';
import { Building2, User, Mail, Phone, MessageSquare, Send, CheckCircle, AlertCircle, Users, Car, MapPin } from 'lucide-react';

const CorporateBooking = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    companyName: '',
    companyAddress: '',
    numberOfEmployees: '',
    vehiclesNeeded: '',
    serviceType: 'regular',
    message: ''
  });

  const [formStatus, setFormStatus] = useState({
    isSubmitted: false,
    isLoading: false,
    error: ''
  });

  const [errors, setErrors] = useState({
    name: '',
    email: '',
    phone: '',
    message: ''
  });

  const validate = () => {
    let tempErrors = { name: '', email: '', phone: '', message: '' };
    let isValid = true;

    if (!formData.name.trim()) {
      tempErrors.name = 'Contact person name is required.';
      isValid = false;
    }

    if (!formData.email.trim()) {
      tempErrors.email = 'Email is required.';
      isValid = false;
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      tempErrors.email = 'Email is not valid.';
      isValid = false;
    }

    if (!formData.phone.trim()) {
      tempErrors.phone = 'Phone number is required.';
      isValid = false;
    } else if (!/^[6-9]\d{9}$/.test(formData.phone)) {
      tempErrors.phone = 'Please enter a valid 10-digit Indian mobile number.';
      isValid = false;
    }
    
    if (!formData.message.trim()) {
      tempErrors.message = 'Message is required.';
      isValid = false;
    }

    setErrors(tempErrors);
    return isValid;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    // Clear error when user starts typing
    if (errors[name as keyof typeof errors]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) {
      return;
    }
    
    setFormStatus({ isSubmitted: false, isLoading: true, error: '' });
    
    try {
      // Build comprehensive message with all additional details
      let fullMessage = formData.message;
      
      // Append additional corporate details to message
      const additionalDetails: string[] = [];
      
      if (formData.companyName.trim()) {
        additionalDetails.push(`Company Name: ${formData.companyName}`);
      }
      if (formData.companyAddress.trim()) {
        additionalDetails.push(`Company Address: ${formData.companyAddress}`);
      }
      if (formData.numberOfEmployees.trim()) {
        additionalDetails.push(`Number of Employees: ${formData.numberOfEmployees}`);
      }
      if (formData.vehiclesNeeded.trim()) {
        additionalDetails.push(`Vehicles Needed: ${formData.vehiclesNeeded}`);
      }
      if (formData.serviceType && formData.serviceType !== 'regular') {
        additionalDetails.push(`Service Type: ${formData.serviceType}`);
      }
      
      if (additionalDetails.length > 0) {
        fullMessage = `${formData.message}\n\n--- Corporate Details ---\n${additionalDetails.join('\n')}`;
      }

      // Use contact API with corporate booking subject
      const payload = {
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        message: fullMessage,
        subject: 'corporate_booking'
      };

      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/contact`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });
      
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Something went wrong');
      }
      
      setFormStatus({ isSubmitted: true, isLoading: false, error: '' });
      setFormData({
        name: '',
        email: '',
        phone: '',
        companyName: '',
        companyAddress: '',
        numberOfEmployees: '',
        vehiclesNeeded: '',
        serviceType: 'regular',
        message: ''
      });
      setTimeout(() => setFormStatus(prev => ({ ...prev, isSubmitted: false })), 5000);
    } catch (error: any) {
      console.error('Error submitting corporate booking:', error);
      setFormStatus({ isSubmitted: false, isLoading: false, error: error.message || 'Failed to submit request. Please try again.' });
    }
  };

  return (
    <div className="min-h-screen">
      {/* Hero Section - Netflix Style with Video Background */}
      <section className="relative h-screen min-h-[600px] lg:min-h-[700px] overflow-hidden -mt-16">
        {/* Video Background */}
        <div className="absolute inset-0 w-full h-full">
          <video
            autoPlay
            loop
            muted
            playsInline
            preload="auto"
            className="w-full h-full object-cover"
            poster="https://res.cloudinary.com/dglbplg86/image/upload/q_auto,f_auto,w_1920/v1765993153/9cff4c7c-7718-4563-8623-d72697c0a0a9_kmylxl.jpg"
          >
            <source src="https://res.cloudinary.com/dglbplg86/video/upload/q_auto,f_mp4/v1766213823/grok-video-73fcc41a-7dd4-4d11-bb86-c27992139a95_miue1o.mp4" type="video/mp4" />
          </video>
        </div>
        
        {/* Gradient Overlay - Netflix Style */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-black/60 to-black/80"></div>
        <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-transparent to-black/70"></div>
        
        {/* Content */}
        <div className="relative z-10 h-full flex flex-col justify-center items-center px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto text-center">
            {/* Icon */}
            <div className="inline-flex items-center justify-center w-20 h-20 bg-white/10 backdrop-blur-sm rounded-full mb-6 border border-white/20">
              <Building2 className="h-10 w-10 text-white" />
            </div>
            
            {/* Main Heading - Large & Bold */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-extrabold mb-4 lg:mb-6 leading-tight text-white drop-shadow-2xl">
              Corporate Booking Solutions
            </h1>
            
            {/* Tagline - Elegant Subtitle */}
            <p className="text-lg sm:text-xl lg:text-2xl xl:text-3xl font-light mb-8 lg:mb-12 text-white/95 drop-shadow-lg tracking-wide max-w-4xl mx-auto">
              Tailored transportation services for businesses. Get customized solutions for employee transport, events, and corporate travel needs.
            </p>
            
            {/* Feature Pills - Netflix Style */}
            <div className="flex flex-wrap justify-center gap-3 lg:gap-4">
              <div className="flex items-center space-x-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full border border-white/20 shadow-lg">
                <Building2 className="h-4 w-4 lg:h-5 lg:w-5 text-blue-400" aria-hidden="true" />
                <span className="text-sm lg:text-base font-medium text-white">Customized Solutions</span>
              </div>
              <div className="flex items-center space-x-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full border border-white/20 shadow-lg">
                <Car className="h-4 w-4 lg:h-5 lg:w-5 text-blue-400" aria-hidden="true" />
                <span className="text-sm lg:text-base font-medium text-white">Fleet Management</span>
              </div>
              <div className="flex items-center space-x-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full border border-white/20 shadow-lg">
                <Users className="h-4 w-4 lg:h-5 lg:w-5 text-blue-400" aria-hidden="true" />
                <span className="text-sm lg:text-base font-medium text-white">24/7 Support</span>
              </div>
            </div>
          </div>
        </div>
        
        {/* Bottom Fade Gradient */}
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-gray-50 to-transparent pointer-events-none"></div>
      </section>

      {/* Corporate Booking Form */}
      <section className="py-16 lg:py-24 bg-gray-50 relative -mt-32 z-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-2xl shadow-xl p-6 lg:p-8">
            {formStatus.isSubmitted ? (
              <div className="text-center py-12">
                <CheckCircle className="h-20 w-20 text-green-500 mx-auto mb-4" />
                <h3 className="text-2xl font-semibold text-green-800 mb-2">Request Submitted!</h3>
                <p className="text-green-600 mb-4">Our corporate team will contact you within 24 hours.</p>
                <p className="text-sm text-gray-500">We'll prepare a customized quote based on your requirements.</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                {formStatus.error && (
                  <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg flex items-center space-x-2" role="alert">
                    <AlertCircle className="h-5 w-5 flex-shrink-0" />
                    <p>{formStatus.error}</p>
                  </div>
                )}

                {/* Required Fields Section */}
                <div className="border-b border-gray-200 pb-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Contact Information *</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                        <User className="inline h-4 w-4 mr-1 text-gray-500" />
                        Contact Person Name *
                      </label>
                      <input
                        type="text"
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        className={`w-full px-4 py-3 border ${errors.name ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                        placeholder="Your full name"
                      />
                      {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
                    </div>

                    <div>
                      <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                        <Mail className="inline h-4 w-4 mr-1 text-gray-500" />
                        Email Address *
                      </label>
                      <input
                        type="email"
                        id="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        className={`w-full px-4 py-3 border ${errors.email ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                        placeholder="corporate@company.com"
                      />
                      {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
                    </div>
                  </div>

                  <div className="mt-6">
                    <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                      <Phone className="inline h-4 w-4 mr-1 text-gray-500" />
                      Phone Number *
                    </label>
                    <input
                      type="tel"
                      id="phone"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      maxLength={10}
                      className={`w-full px-4 py-3 border ${errors.phone ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                      placeholder="9876543210"
                    />
                    {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone}</p>}
                  </div>
                </div>

                {/* Optional Corporate Details Section */}
                <div className="border-b border-gray-200 pb-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Corporate Details (Optional)</h3>
                  <p className="text-sm text-gray-500 mb-4">These details will be included in your message to help us prepare a better quote.</p>
                  
                  <div className="space-y-6">
                    <div>
                      <label htmlFor="companyName" className="block text-sm font-medium text-gray-700 mb-2">
                        <Building2 className="inline h-4 w-4 mr-1 text-gray-500" />
                        Company Name
                      </label>
                      <input
                        type="text"
                        id="companyName"
                        name="companyName"
                        value={formData.companyName}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Your company name"
                      />
                    </div>

                    <div>
                      <label htmlFor="companyAddress" className="block text-sm font-medium text-gray-700 mb-2">
                        <MapPin className="inline h-4 w-4 mr-1 text-gray-500" />
                        Company Address
                      </label>
                      <input
                        type="text"
                        id="companyAddress"
                        name="companyAddress"
                        value={formData.companyAddress}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Street, City, State, Pincode"
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label htmlFor="numberOfEmployees" className="block text-sm font-medium text-gray-700 mb-2">
                          <Users className="inline h-4 w-4 mr-1 text-gray-500" />
                          Number of Employees
                        </label>
                        <input
                          type="number"
                          id="numberOfEmployees"
                          name="numberOfEmployees"
                          value={formData.numberOfEmployees}
                          onChange={handleInputChange}
                          min="1"
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="e.g., 50"
                        />
                      </div>

                      <div>
                        <label htmlFor="vehiclesNeeded" className="block text-sm font-medium text-gray-700 mb-2">
                          <Car className="inline h-4 w-4 mr-1 text-gray-500" />
                          Vehicles Needed
                        </label>
                        <input
                          type="number"
                          id="vehiclesNeeded"
                          name="vehiclesNeeded"
                          value={formData.vehiclesNeeded}
                          onChange={handleInputChange}
                          min="1"
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="e.g., 5"
                        />
                      </div>
                    </div>

                    <div>
                      <label htmlFor="serviceType" className="block text-sm font-medium text-gray-700 mb-2">
                        <Car className="inline h-4 w-4 mr-1 text-gray-500" />
                        Service Type
                      </label>
                      <select
                        id="serviceType"
                        name="serviceType"
                        value={formData.serviceType}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="regular">Regular Employee Transportation</option>
                        <option value="event">Event Transportation</option>
                        <option value="airport">Airport Shuttle Service</option>
                        <option value="custom">Custom Solution</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Message */}
                <div>
                  <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">
                    <MessageSquare className="inline h-4 w-4 mr-1 text-gray-500" />
                    Your Requirements *
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    value={formData.message}
                    onChange={handleInputChange}
                    rows={6}
                    className={`w-full px-4 py-3 border ${errors.message ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                    placeholder="Please provide details about your transportation needs, preferred timings, routes, special requirements, etc."
                  ></textarea>
                  {errors.message && <p className="text-red-500 text-xs mt-1">{errors.message}</p>}
                  <p className="text-xs text-gray-500 mt-2">
                    Note: Any corporate details you provide above will be automatically included with your message.
                  </p>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={formStatus.isLoading}
                  className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold py-4 px-8 rounded-lg shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center space-x-2"
                >
                  {formStatus.isLoading ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                      <span>Submitting...</span>
                    </>
                  ) : (
                    <>
                      <Send className="h-5 w-5" />
                      <span>Submit Corporate Booking Request</span>
                    </>
                  )}
                </button>

                <p className="text-xs text-gray-500 text-center mt-4">
                  * Required fields. Our corporate team will contact you within 24 hours with a customized quote.
                </p>
              </form>
            )}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">Why Choose Our Corporate Services?</h2>
            <p className="text-xl text-gray-600">Comprehensive transportation solutions for your business</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center p-6 bg-blue-50 rounded-lg">
              <Building2 className="h-12 w-12 text-blue-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Customized Solutions</h3>
              <p className="text-gray-600">Tailored transportation plans that fit your business needs and schedule.</p>
            </div>
            <div className="text-center p-6 bg-green-50 rounded-lg">
              <Car className="h-12 w-12 text-green-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Fleet Management</h3>
              <p className="text-gray-600">Dedicated vehicles and drivers for consistent, reliable service.</p>
            </div>
            <div className="text-center p-6 bg-purple-50 rounded-lg">
              <Users className="h-12 w-12 text-purple-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">24/7 Support</h3>
              <p className="text-gray-600">Round-the-clock assistance for all your corporate transportation needs.</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default CorporateBooking;


