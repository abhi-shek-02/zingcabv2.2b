import { MapPin, Clock, Plane, Car, Shield, Star, ArrowRight } from 'lucide-react';

const Services = () => {
  const services = [
    {
      icon: MapPin,
      title: 'One Way Trip',
      description: 'Perfect for single destination travel with no return journey required.',
      features: [
        'Pay only for distance traveled',
        'No return charges',
        'Flexible pickup times',
        'Direct route optimization'
      ],
      popular: true,
      tripType: 'oneway'
    },
    {
      icon: Car,
      title: 'Round Trip',
      description: 'Go and return with the same driver and vehicle at convenient rates.',
      features: [
        'Convenient round-trip booking',
        'Same driver for both legs',
        'Waiting charges minimal',
        'Flexible return timing'
      ],
      popular: false,
      tripType: 'roundtrip'
    },
    {
      icon: Clock,
      title: 'Local Rental',
      description: 'Hourly car rentals for local sightseeing, shopping, or business meetings.',
      features: [
        'Minimum 4 hours booking',
        'Includes driver and fuel',
        'Multiple stops allowed',
        'City-wise fixed rates'
      ],
      popular: false,
      tripType: 'local'
    },
    {
      icon: Plane,
      title: 'Airport Transfer',
      description: 'Reliable airport pickup and drop services with flight tracking.',
      features: [
        'Flight delay monitoring',
        'Meet & greet service',
        'Fixed pricing',
        '24/7 availability'
      ],
      popular: false,
      tripType: 'airport'
    }
  ];

  const carTypes = [
    {
      name: 'Hatchback',
      image: 'https://res.cloudinary.com/dglbplg86/image/upload/q_auto,f_auto,w_800/v1766212177/97ac1f24-d0f1-4893-9131-89ebbdc2fcad_eovwdw.jpg',
      seats: '4 Seater',
      luggage: '2 Bags',
      examples: 'Wagon R, Hyundai i20',
      features: ['AC', 'Music System', 'Clean Interior']
    },
    {
      name: 'Sedan',
      image: 'https://res.cloudinary.com/dglbplg86/image/upload/q_auto,f_auto,w_800/v1766212206/83f3e367-b0c4-4141-af31-3296c3b38a3e_tzpsil.jpg',
      seats: '4 Seater',
      luggage: '3 Bags',
      examples: 'Maruti Dzire, Honda Amaze',
      features: ['AC', 'Spacious', 'Comfortable']
    },
    {
      name: 'SUV',
      image: 'https://res.cloudinary.com/dglbplg86/image/upload/q_auto,f_auto,w_800/v1766212188/eb36357d-6c5c-4313-bb92-29ec9392c8b1_jhlyez.jpg',
      seats: '6-7 Seater',
      luggage: '5 Bags',
      examples: 'Ertiga, Tata Safari',
      features: ['AC', 'Large Groups', 'Extra Space']
    }
  ];

  const coverage = [
    'Kolkata', 'Durgapur', 'Siliguri', 'Asansol', 'Howrah', 'Burdwan', 'Malda', 'Jalpaiguri',
    'Kharagpur', 'Haldia', 'Bankura', 'Purulia', 'Cooch Behar', 'Darjeeling', 'Kalimpong',
    'Digha', 'Mandarmani', 'Shantiniketan', 'Murshidabad', 'Nabadwip'
  ];

  const handleBookService = (tripType: string) => {
    localStorage.setItem('selectedTripType', tripType);
    window.location.href = '/';
  };

  return (
    <div className="min-h-screen">
      {/* Hero Section - Netflix Style with Video Background */}
      <section className="relative h-screen min-h-[600px] lg:min-h-[600px] overflow-hidden -mt-16">
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
            <source src="https://res.cloudinary.com/dglbplg86/video/upload/q_auto,f_mp4/v1766082670/grok-video-f77141cf-e649-42ab-81c4-dbd4aa5b665b_abc4co.mp4" type="video/mp4" />
          </video>
        </div>
        
        {/* Gradient Overlay - Lighter for better video visibility */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/30 to-black/40"></div>
        <div className="absolute inset-0 bg-gradient-to-r from-black/30 via-transparent to-black/30"></div>
        
        {/* Blur Junction at Bottom - Smooth transition to next section */}
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-b from-transparent via-white/20 to-white/40 backdrop-blur-md z-20"></div>
        
        {/* Content - Direct on video without blur container */}
        <div className="relative z-10 h-full flex flex-col justify-center items-center px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto text-center">
            {/* Main Heading - Smaller */}
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold mb-4 lg:mb-6 leading-tight text-white drop-shadow-2xl">
              Our Services
            </h1>
            
            {/* Tagline - Smaller */}
            <p className="text-lg sm:text-xl lg:text-2xl font-light mb-6 lg:mb-8 text-white/95 drop-shadow-lg tracking-wide">
              Comprehensive intercity cab services designed for every travel need across West Bengal and beyond.
            </p>
            
            {/* Feature Pills - Netflix Style with Glassmorphism */}
            <div className="flex flex-wrap justify-center gap-3 lg:gap-4">
              <div className="flex items-center space-x-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full border border-white/20 shadow-lg">
                <Shield className="h-4 w-4 lg:h-5 lg:w-5 text-blue-400" aria-hidden="true" />
                <span className="text-sm lg:text-base font-medium text-white">Verified Drivers</span>
              </div>
              <div className="flex items-center space-x-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full border border-white/20 shadow-lg">
                <Car className="h-4 w-4 lg:h-5 lg:w-5 text-blue-400" aria-hidden="true" />
                <span className="text-sm lg:text-base font-medium text-white">Premium Vehicles</span>
              </div>
              <div className="flex items-center space-x-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full border border-white/20 shadow-lg">
                <Star className="h-4 w-4 lg:h-5 lg:w-5 text-yellow-400" aria-hidden="true" />
                <span className="text-sm lg:text-base font-medium text-white">24/7 Support</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Services Grid */}
      <section className="py-16 -mt-32 relative z-30 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">Choose Your Travel Style</h2>
            <p className="text-xl text-gray-600">Flexible options for every journey</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {services.map((service, index) => (
              <div key={index} className="relative bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden group">
                {service.popular && (
                  <div className="absolute top-4 right-4 bg-green-500 text-white px-3 py-1 rounded-full text-sm font-semibold">
                    Most Popular
                  </div>
                )}
                <div className="p-8">
                  <div className="flex items-center mb-6">
                    <div className="bg-blue-100 p-3 rounded-lg mr-4 group-hover:bg-blue-200 transition-colors">
                      <service.icon className="h-8 w-8 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold text-gray-900">{service.title}</h3>
                    </div>
                  </div>
                  <p className="text-gray-600 mb-6 leading-relaxed">{service.description}</p>
                  <ul className="space-y-3 mb-8">
                    {service.features.map((feature, i) => (
                      <li key={i} className="flex items-center text-gray-700">
                        <div className="w-2 h-2 bg-blue-600 rounded-full mr-3"></div>
                        {feature}
                      </li>
                    ))}
                  </ul>
                  <button 
                    onClick={() => handleBookService(service.tripType)}
                    className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-blue-700 transition-colors duration-200 flex items-center justify-center space-x-2"
                  >
                    <span>Book This Service</span>
                    <ArrowRight className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Car Types */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">Choose Your Vehicle</h2>
            <p className="text-xl text-gray-600">From solo travelers to large groups, we have the perfect car for you</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {carTypes.map((car, index) => (
              <div key={index} className="bg-white rounded-2xl shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden hover:-translate-y-1">
                {/* Image Section - Full width at top */}
                <div className="relative w-full h-48 sm:h-56 lg:h-64 overflow-hidden bg-gray-100">
                  <img 
                    src={car.image} 
                    alt={car.name}
                    className="w-full h-full object-cover"
                    loading="lazy"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                    }}
                  />
                </div>
                {/* Content Section */}
                <div className="p-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-2 text-center">{car.name}</h3>
                  <div className="space-y-2 mb-4">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Seating:</span>
                      <span className="font-medium">{car.seats}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Luggage:</span>
                      <span className="font-medium">{car.luggage}</span>
                    </div>
                  </div>
                  <p className="text-xs text-gray-500 mb-4">{car.examples}</p>
                  <div className="space-y-1">
                    {car.features.map((feature, i) => (
                      <div key={i} className="flex items-center text-xs text-gray-600">
                        <div className="w-1.5 h-1.5 bg-green-500 rounded-full mr-2"></div>
                        {feature}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Service Areas */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">Service Coverage</h2>
            <p className="text-xl text-gray-600">We cover major cities and towns across West Bengal</p>
          </div>
          <div className="bg-blue-50 rounded-2xl p-8">
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {coverage.map((city, index) => (
                <div key={index} className="bg-white rounded-lg p-3 text-center hover:shadow-md transition-shadow">
                  <span className="text-gray-800 font-medium">{city}</span>
                </div>
              ))}
            </div>
            <div className="text-center mt-8">
              <p className="text-gray-600 mb-4">Don't see your city?</p>
              <p className="text-blue-600 font-semibold">Stay tuned — we'll be there soon!</p>
            </div>
          </div>
        </div>
      </section>

      {/* Safety Features */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">Safety & Quality</h2>
            <p className="text-xl text-gray-600">Your safety is our top priority</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Shield className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Verified Drivers</h3>
              <p className="text-gray-600 leading-relaxed">
                All drivers undergo thorough background verification, training, and regular assessments.
              </p>
            </div>
            <div className="text-center">
              <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Car className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Well-Maintained Vehicles</h3>
              <p className="text-gray-600 leading-relaxed">
                Regular maintenance, cleanliness checks, and safety inspections ensure comfortable rides.
              </p>
            </div>
            <div className="text-center">
              <div className="bg-purple-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Star className="h-8 w-8 text-purple-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Quality Assurance</h3>
              <p className="text-gray-600 leading-relaxed">
                Continuous monitoring, customer feedback, and quality improvements for excellent service.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-r from-blue-600 to-blue-700 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl lg:text-4xl font-bold mb-4">Ready to Experience Premium Travel?</h2>
          <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
            Book your intercity cab now and enjoy comfortable, safe, and reliable travel
          </p>
          <a
            href="/"
            className="bg-white text-blue-600 px-8 py-4 rounded-lg font-semibold hover:bg-gray-100 transition-colors duration-200 inline-block"
          >
            Book Your Ride Now
          </a>
        </div>
      </section>
    </div>
  );
};

export default Services;