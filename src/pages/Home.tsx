import React from 'react';
import { Link } from 'react-router-dom';
import CountUp from 'react-countup';
import { useInView } from 'react-intersection-observer';
import { 
  Shield, 
  Clock, 
  Star, 
  Users, 
  CheckCircle, 
  Phone,
  MessageCircle,
  MapPin,
  Car,
  Plane
} from 'lucide-react';
import BookingForm from '../components/BookingForm';

const Stat = ({ number, label, icon: Icon }: { number: string; label: string; icon: React.ElementType }) => {
  const { ref, inView } = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });

  const parsedNumber = parseFloat(number.replace(/,/g, ''));

  return (
    <div ref={ref} className="bg-blue-700 p-6 rounded-2xl text-center shadow-lg transform hover:scale-105 transition-transform duration-300">
      <div className="text-blue-200 mb-2">
        <Icon className="h-10 w-10 mx-auto" aria-hidden="true" />
      </div>
      <div className="text-4xl lg:text-5xl font-bold mb-2">
        {inView ? <CountUp end={parsedNumber} duration={2.5} separator="," decimals={number.includes('.') ? 1 : 0} /> : '0'}
        {number.includes('+') && '+'}
        {number.includes('/5') && '/5'}
      </div>
      <div className="text-blue-200 text-lg">{label}</div>
    </div>
  );
};

const Home = () => {
  const testimonials = [
    {
      name: 'Rajesh Kumar',
      location: 'Kolkata',
      rating: 5,
      comment: 'Excellent service! Driver was punctual and the car was clean. Will definitely use again.',
      route: 'Kolkata to Durgapur'
    },
    {
      name: 'Priya Sharma',
      location: 'Siliguri',
      rating: 5,
      comment: 'Safe and comfortable journey. Fair pricing and professional driver.',
      route: 'Siliguri to Kolkata'
    },
    {
      name: 'Amit Das',
      location: 'Digha',
      rating: 5,
      comment: 'Best cab service in Bengal! Highly recommended for intercity travel.',
      route: 'Kolkata to Digha'
    }
  ];

  const stats = [
    { number: '2,500+', label: 'Happy Customers', icon: Users },
    { number: '50+', label: 'Destinations in West Bengal', icon: MapPin },
    { number: '75+', label: 'Verified Drivers', icon: Shield },
    { number: '4.8/5', label: 'Customer Rating', icon: Star }
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section - Netflix Style with Video Background */}
      <section className="relative h-screen min-h-[600px] lg:min-h-[700px] overflow-hidden">
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
            <source src="https://res.cloudinary.com/dglbplg86/video/upload/q_auto,f_mp4/v1765993699/grok-video-c83ecdd9-3e76-49b5-9e40-e4812b469ae5_vpjgcp.mp4" type="video/mp4" />
          </video>
        </div>
        
        {/* Gradient Overlay - Netflix Style */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-black/60 to-black/80"></div>
        <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-transparent to-black/70"></div>
        
        {/* Content */}
        <div className="relative z-10 h-full flex flex-col justify-center items-center px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto text-center">
            {/* Main Heading - Large & Bold */}
            <h1 className="text-5xl sm:text-6xl lg:text-7xl xl:text-8xl font-extrabold mb-4 lg:mb-6 leading-tight text-white drop-shadow-2xl animate-fade-in">
              ZingCab
            </h1>
            
            {/* Tagline - Elegant Subtitle */}
            <p className="text-xl sm:text-2xl lg:text-3xl xl:text-4xl font-light mb-8 lg:mb-12 text-white/95 drop-shadow-lg tracking-wide">
              Safe. Reliable. On Time.
            </p>
            
            {/* Feature Pills - Netflix Style */}
            <div className="flex flex-wrap justify-center gap-3 lg:gap-4 mb-8 lg:mb-12">
              <div className="flex items-center space-x-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full border border-white/20">
                <CheckCircle className="h-4 w-4 lg:h-5 lg:w-5 text-green-400" aria-hidden="true" />
                <span className="text-sm lg:text-base font-medium text-white">Verified Drivers</span>
              </div>
              <div className="flex items-center space-x-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full border border-white/20">
                <CheckCircle className="h-4 w-4 lg:h-5 lg:w-5 text-green-400" aria-hidden="true" />
                <span className="text-sm lg:text-base font-medium text-white">24/7 Support</span>
                </div>
              <div className="flex items-center space-x-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full border border-white/20">
                <CheckCircle className="h-4 w-4 lg:h-5 lg:w-5 text-green-400" aria-hidden="true" />
                <span className="text-sm lg:text-base font-medium text-white">Fair Pricing</span>
              </div>
            </div>
            
            {/* CTA Buttons - Netflix Style */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <a
                href="https://wa.me/917003371343"
                className="bg-green-600 hover:bg-green-700 text-white px-8 py-4 rounded-lg font-semibold text-lg transition-all duration-300 transform hover:scale-105 shadow-2xl flex items-center space-x-2 min-w-[200px] justify-center"
              >
                <MessageCircle className="h-5 w-5" aria-hidden="true" />
                <span>Book via WhatsApp</span>
              </a>
              <a
                href="tel:9903042200"
                className="bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white px-8 py-4 rounded-lg font-semibold text-lg transition-all duration-300 transform hover:scale-105 border border-white/30 shadow-2xl flex items-center space-x-2 min-w-[200px] justify-center"
              >
                <Phone className="h-5 w-5" aria-hidden="true" />
                <span>Call Now</span>
              </a>
            </div>
          </div>
        </div>
        
        {/* Bottom Fade Gradient */}
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-white to-transparent pointer-events-none"></div>
      </section>

      {/* Booking Form Section - Overlapping Hero */}
      <section className="relative -mt-32 lg:-mt-40 pb-16 z-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <BookingForm />
        </div>
      </section>

      {/* Why Choose Us Section */}
      <section className="py-16 bg-white">
        <div className="mx-auto w-full max-w-[1440px]">
          {/* Header */}
          <div className="mx-4 lg:mx-12 xl:mx-20 2xl:mx-0 mb-6 lg:mb-10">
            <span className="text-base md:text-2xl font-extrabold text-gray-900">WHY CHOOSE US?</span>
            <div className="mt-2 h-1 bg-gradient-to-r from-blue-500 via-blue-600 to-purple-600 relative" style={{ height: '4px' }}>
              <span className="absolute right-0 top-1/2 -translate-y-1/2 bg-white p-1.5 rounded-full shadow-sm">
                <Shield className="h-3 w-3 text-blue-600" />
              </span>
            </div>
          </div>

          {/* Cards Grid - 2x2 Layout */}
          <div className="mx-4 lg:mx-12 xl:mx-[112px] 2xl:mx-0">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 max-w-5xl mx-auto">
              {/* Safety First Card */}
              <div className="bg-white rounded-lg shadow-sm overflow-hidden max-w-md mx-auto lg:max-w-full">
                {/* Image - Always on Top */}
                <div className="relative w-full h-52 lg:h-64 overflow-hidden bg-gradient-to-br from-blue-500 to-blue-700">
                  <img 
                    src="https://res.cloudinary.com/dglbplg86/image/upload/q_auto,f_auto,w_1200/v1765993153/9cff4c7c-7718-4563-8623-d72697c0a0a9_kmylxl.jpg" 
                    alt="Safety First"
                    className="w-full h-full object-cover"
                    loading="lazy"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                    }}
                  />
                  <div className="absolute inset-0 flex items-center justify-center opacity-0">
                    <Shield className="h-12 w-12 text-white opacity-80" />
                  </div>
                </div>
                {/* Content */}
                <div className="p-3 lg:p-4">
                    <h2 className="text-sm lg:text-lg font-bold mb-1.5 text-gray-900">Safety First</h2>
                    <p className="text-xs lg:text-sm text-gray-600 mb-2 lg:mb-4 leading-relaxed">
                      We prioritize safety without compromise, consistently applying industry best practices on every trip, across all our routes.
                    </p>
                    <div className="flex gap-4">
                      <div className="flex flex-col gap-2">
                        <div className="flex items-center gap-2">
                          <div className="relative h-4 w-4 lg:h-8 lg:w-8">
                            <Shield className="h-full w-full text-blue-600" />
                          </div>
                          <p className="text-xs lg:text-sm text-gray-900 font-normal">Verified Drivers</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="relative h-4 w-4 lg:h-8 lg:w-8">
                            <CheckCircle className="h-full w-full text-blue-600" />
                          </div>
                          <p className="text-xs lg:text-sm text-gray-900 font-normal">Regular Vehicle Checks</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="relative h-4 w-4 lg:h-8 lg:w-8">
                            <Shield className="h-full w-full text-blue-600" />
                          </div>
                          <p className="text-xs lg:text-sm text-gray-900 font-normal">GPS Tracking</p>
                        </div>
                      </div>
                      <div className="flex flex-col gap-2">
                        <div className="flex items-center gap-2">
                          <div className="relative h-4 w-4 lg:h-8 lg:w-8">
                            <CheckCircle className="h-full w-full text-blue-600" />
                          </div>
                          <p className="text-xs lg:text-sm text-gray-900 font-normal">First Aid Kits</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="relative h-4 w-4 lg:h-8 lg:w-8">
                            <Shield className="h-full w-full text-blue-600" />
                          </div>
                          <p className="text-xs lg:text-sm text-gray-900 font-normal">Emergency Support</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="relative h-4 w-4 lg:h-8 lg:w-8">
                            <CheckCircle className="h-full w-full text-blue-600" />
                          </div>
                          <p className="text-xs lg:text-sm text-gray-900 font-normal">24/7 Monitoring</p>
                        </div>
                      </div>
                    </div>
                  </div>
              </div>

              {/* Punctual Card */}
              <div className="bg-white rounded-lg shadow-sm overflow-hidden max-w-md mx-auto lg:max-w-full">
                {/* Image - Always on Top */}
                <div className="relative w-full h-52 lg:h-64 overflow-hidden bg-gradient-to-br from-green-500 to-green-700">
                  <img 
                    src="https://res.cloudinary.com/dglbplg86/image/upload/q_auto,f_auto,w_1200/v1765994941/cf2e8d0e-67d2-49e8-af4f-0f9032f5c09f_sutor4.jpg" 
                    alt="Expert Drivers"
                    className="w-full h-full object-cover"
                    loading="lazy"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                    }}
                  />
                  <div className="absolute inset-0 flex items-center justify-center opacity-0">
                    <Clock className="h-12 w-12 text-white opacity-80" />
                  </div>
                </div>
                {/* Content */}
                <div className="p-3 lg:p-4">
                    <h2 className="text-sm lg:text-lg font-bold mb-1.5 text-gray-900">Expert Drivers</h2>
                    <p className="text-xs lg:text-sm text-gray-600 mb-2 lg:mb-4 leading-relaxed">
                      Our professional drivers are experienced, courteous, and committed to providing you with a safe and comfortable journey every time.
                    </p>
                    <div className="flex gap-4">
                      <div className="flex flex-col gap-2">
                        <div className="flex items-center gap-2">
                          <div className="relative h-4 w-4 lg:h-8 lg:w-8">
                            <CheckCircle className="h-full w-full text-green-600" />
                          </div>
                          <p className="text-xs lg:text-sm text-gray-900 font-normal">Licensed & Verified</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="relative h-4 w-4 lg:h-8 lg:w-8">
                            <CheckCircle className="h-full w-full text-green-600" />
                          </div>
                          <p className="text-xs lg:text-sm text-gray-900 font-normal">Well Trained</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="relative h-4 w-4 lg:h-8 lg:w-8">
                            <CheckCircle className="h-full w-full text-green-600" />
                          </div>
                          <p className="text-xs lg:text-sm text-gray-900 font-normal">Local Knowledge</p>
                        </div>
                      </div>
                      <div className="flex flex-col gap-2">
                        <div className="flex items-center gap-2">
                          <div className="relative h-4 w-4 lg:h-8 lg:w-8">
                            <CheckCircle className="h-full w-full text-green-600" />
                          </div>
                          <p className="text-xs lg:text-sm text-gray-900 font-normal">Polite & Courteous</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="relative h-4 w-4 lg:h-8 lg:w-8">
                            <CheckCircle className="h-full w-full text-green-600" />
                          </div>
                          <p className="text-xs lg:text-sm text-gray-900 font-normal">Years of Experience</p>
                        </div>
                      </div>
                    </div>
                  </div>
              </div>

              {/* Trusted Service Card */}
              <div className="bg-white rounded-lg shadow-sm overflow-hidden max-w-md mx-auto lg:max-w-full">
                {/* Image - Always on Top */}
                <div className="relative w-full h-52 lg:h-64 overflow-hidden bg-gradient-to-br from-emerald-500 to-emerald-700">
                  <img 
                    src="https://res.cloudinary.com/dglbplg86/image/upload/q_auto,f_auto,w_1200/v1765995764/bc6ff0ae-f742-4d47-9e73-59d91f6b04a0_ajixgm.jpg" 
                    alt="Trusted Service"
                    className="w-full h-full object-cover"
                    loading="lazy"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                    }}
                  />
                  <div className="absolute inset-0 flex items-center justify-center opacity-0">
                    <Star className="h-12 w-12 text-white opacity-80" />
                  </div>
                </div>
                {/* Content */}
                <div className="p-3 lg:p-4">
                    <h2 className="text-sm lg:text-lg font-bold mb-1.5 text-gray-900">Trusted Service</h2>
                    <p className="text-xs lg:text-sm text-gray-600 mb-2 lg:mb-4 leading-relaxed">
                      Years of experience serving thousands of satisfied customers across West Bengal. Your trust is our foundation, and we're committed to maintaining the highest standards of service excellence.
                    </p>
                    <div className="flex gap-4">
                      <div className="flex flex-col gap-2">
                        <div className="flex items-center gap-2">
                          <div className="relative h-4 w-4 lg:h-8 lg:w-8">
                            <CheckCircle className="h-full w-full text-emerald-600" />
                          </div>
                          <p className="text-xs lg:text-sm text-gray-900 font-normal">Proven Track Record</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="relative h-4 w-4 lg:h-8 lg:w-8">
                            <CheckCircle className="h-full w-full text-emerald-600" />
                          </div>
                          <p className="text-xs lg:text-sm text-gray-900 font-normal">Thousands of Happy Customers</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="relative h-4 w-4 lg:h-8 lg:w-8">
                            <CheckCircle className="h-full w-full text-emerald-600" />
                          </div>
                          <p className="text-xs lg:text-sm text-gray-900 font-normal">Years of Experience</p>
                        </div>
                      </div>
                      <div className="flex flex-col gap-2">
                        <div className="flex items-center gap-2">
                          <div className="relative h-4 w-4 lg:h-8 lg:w-8">
                            <CheckCircle className="h-full w-full text-emerald-600" />
                          </div>
                          <p className="text-xs lg:text-sm text-gray-900 font-normal">Reliable & Consistent</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="relative h-4 w-4 lg:h-8 lg:w-8">
                            <CheckCircle className="h-full w-full text-emerald-600" />
                          </div>
                          <p className="text-xs lg:text-sm text-gray-900 font-normal">High Customer Ratings</p>
                        </div>
                      </div>
                    </div>
                  </div>
              </div>

              {/* Customer First Card */}
              <div className="bg-white rounded-lg shadow-sm overflow-hidden max-w-md mx-auto lg:max-w-full">
                {/* Image - Always on Top */}
                <div className="relative w-full h-52 lg:h-64 overflow-hidden bg-gradient-to-br from-purple-500 to-purple-700">
                  <img 
                    src="https://res.cloudinary.com/dglbplg86/image/upload/q_auto,f_auto,w_1200/v1765996201/8d56e49b-081a-412a-b9da-02f3053979d8_q8lgkf.jpg" 
                    alt="Customer First"
                    className="w-full h-full object-cover"
                    loading="lazy"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                    }}
                  />
                  <div className="absolute inset-0 flex items-center justify-center opacity-0">
                    <Car className="h-12 w-12 text-white opacity-80" />
                  </div>
                </div>
                {/* Content */}
                <div className="p-3 lg:p-4">
                    <h2 className="text-sm lg:text-lg font-bold mb-1.5 text-gray-900">Customer First</h2>
                    <p className="text-xs lg:text-sm text-gray-600 mb-2 lg:mb-4 leading-relaxed">
                      Your satisfaction is our priority. We listen, adapt, and go the extra mile to ensure every journey with us exceeds your expectations. Your comfort and convenience matter most.
                    </p>
                    <div className="flex gap-4">
                      <div className="flex flex-col gap-2">
                        <div className="flex items-center gap-2">
                          <div className="relative h-4 w-4 lg:h-8 lg:w-8">
                            <CheckCircle className="h-full w-full text-purple-600" />
                          </div>
                          <p className="text-xs lg:text-sm text-gray-900 font-normal">24/7 Customer Support</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="relative h-4 w-4 lg:h-8 lg:w-8">
                            <CheckCircle className="h-full w-full text-purple-600" />
                          </div>
                          <p className="text-xs lg:text-sm text-gray-900 font-normal">Quick Response Time</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="relative h-4 w-4 lg:h-8 lg:w-8">
                            <CheckCircle className="h-full w-full text-purple-600" />
                          </div>
                          <p className="text-xs lg:text-sm text-gray-900 font-normal">Personalized Service</p>
                        </div>
                      </div>
                      <div className="flex flex-col gap-2">
                        <div className="flex items-center gap-2">
                          <div className="relative h-4 w-4 lg:h-8 lg:w-8">
                            <CheckCircle className="h-full w-full text-purple-600" />
                          </div>
                          <p className="text-xs lg:text-sm text-gray-900 font-normal">Flexible Booking</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="relative h-4 w-4 lg:h-8 lg:w-8">
                            <CheckCircle className="h-full w-full text-purple-600" />
                          </div>
                          <p className="text-xs lg:text-sm text-gray-900 font-normal">Satisfaction Guaranteed</p>
                        </div>
                      </div>
                    </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-blue-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <Stat key={index} number={stat.number} label={stat.label} icon={stat.icon} />
            ))}
          </div>
        </div>
      </section>

      {/* Services Preview */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
              Our Services
            </h2>
            <p className="text-xl text-gray-600">
              Flexible travel solutions for every need
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="bg-white p-8 rounded-2xl shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-1 border">
              <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mb-6">
                <MapPin className="h-8 w-8 text-green-600" aria-hidden="true" />
              </div>
              <h3 className="text-2xl font-semibold text-gray-900 mb-4">One Way Trip</h3>
              <p className="text-gray-600 mb-6 leading-relaxed">
                Perfect for single destination travel. No return charges, pay only for distance traveled.
              </p>
              <Link 
                to="/services" 
                className="text-blue-600 font-semibold hover:text-blue-700 transition-colors"
                aria-label="Learn more about One Way Trip service"
              >
                Learn More →
              </Link>
            </div>
            <div className="bg-white p-8 rounded-2xl shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-1 border">
              <div className="bg-purple-100 w-16 h-16 rounded-full flex items-center justify-center mb-6">
                <Car className="h-8 w-8 text-purple-600" aria-hidden="true" />
              </div>
              <h3 className="text-2xl font-semibold text-gray-900 mb-4">Round Trip</h3>
              <p className="text-gray-600 mb-6 leading-relaxed">
                Go and return with the same car. Enjoy convenient round-trip booking with flexible timing.
              </p>
              <Link 
                to="/services" 
                className="text-blue-600 font-semibold hover:text-blue-700 transition-colors"
                aria-label="Learn more about Round Trip service"
              >
                Learn More →
              </Link>
            </div>
            <div className="bg-white p-8 rounded-2xl shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-1 border">
              <div className="bg-orange-100 w-16 h-16 rounded-full flex items-center justify-center mb-6">
                <Clock className="h-8 w-8 text-orange-600" aria-hidden="true" />
              </div>
              <h3 className="text-2xl font-semibold text-gray-900 mb-4">Local Rental</h3>
              <p className="text-gray-600 mb-6 leading-relaxed">
                Hourly rentals for local sightseeing, shopping, or business meetings within the city.
              </p>
              <Link 
                to="/services" 
                className="text-blue-600 font-semibold hover:text-blue-700 transition-colors"
                aria-label="Learn more about Local Rental service"
              >
                Learn More →
              </Link>
            </div>
            <div className="bg-white p-8 rounded-2xl shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-1 border">
              <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mb-6">
                <Plane className="h-8 w-8 text-blue-600" aria-hidden="true" />
              </div>
              <h3 className="text-2xl font-semibold text-gray-900 mb-4">Airport Transfer</h3>
              <p className="text-gray-600 mb-6 leading-relaxed">
                Reliable airport pickup and drop services with flight tracking and meet & greet.
              </p>
              <Link 
                to="/services" 
                className="text-blue-600 font-semibold hover:text-blue-700 transition-colors"
                aria-label="Learn more about Airport Transfer service"
              >
                Learn More →
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
              What Our Customers Say
            </h2>
            <p className="text-xl text-gray-600">
              Real experiences from real travelers
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <div key={index} className="bg-white p-8 rounded-2xl shadow-sm hover:shadow-lg transition-all duration-300">
                <div className="flex items-center mb-4">
                  <span className="sr-only">{testimonial.rating} out of 5 stars</span>
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="h-5 w-5 text-yellow-400 fill-current" aria-hidden="true" />
                  ))}
                </div>
                <p className="text-gray-600 mb-6 leading-relaxed italic">
                  "{testimonial.comment}"
                </p>
                <div>
                  <div className="font-semibold text-gray-900">{testimonial.name}</div>
                  <div className="text-sm text-gray-500">{testimonial.location}</div>
                  <div className="text-sm text-blue-600 mt-1">{testimonial.route}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-r from-blue-600 to-blue-700 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl lg:text-4xl font-bold mb-4">
            Ready to Travel?
          </h2>
          <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
            Book your intercity cab now and experience comfortable, reliable travel across West Bengal
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <a
              href="https://wa.me/917003371343"
              aria-label="Book via WhatsApp"
              className="bg-green-700 text-white px-8 py-4 rounded-lg font-semibold hover:bg-green-800 transition-colors duration-200 flex items-center space-x-2"
            >
              <MessageCircle className="h-5 w-5" aria-hidden="true" />
              <span>WhatsApp Booking</span>
            </a>
            <a
              href="tel:9903042200"
              aria-label="Call ZingCab at 9903042200"
              className="bg-white text-blue-600 px-8 py-4 rounded-lg font-semibold hover:bg-gray-100 transition-colors duration-200 flex items-center space-x-2"
            >
              <Phone className="h-5 w-5" aria-hidden="true" />
              <span>Call Now</span>
            </a>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;