import React, { useState, useEffect, useRef } from 'react';
import { useDebounce } from 'use-debounce';
import { MapPin, Calendar, Car, ArrowRight, Clock, Phone, MessageCircle, AlertCircle, CheckCircle, Info, X } from 'lucide-react';
import Modal from './Modal';
import { getDistanceInKm } from '../lib/olamaps';

interface FareData {
  estimated_fare: number;
  km_limit: string;
  breakdown: any;
  message: string;
}

interface AllCarFares {
  [key: string]: FareData;
}

const OLA_API_KEY = import.meta.env.VITE_OLAMAPS_API_KEY;

const BookingForm = () => {
  const initialFormData = {
    phone: '',
    fromCity: '',
    toCity: '',
    date: '',
    returnDate: '',
    carType: '',
    tripType: 'oneway',
    pickupTime: '09:00',
    rentalDuration: '4hr/40km'
  };

  const [formData, setFormData] = useState(initialFormData);
  const [debouncedFromCity] = useDebounce(formData.fromCity, 500);
  const [debouncedToCity] = useDebounce(formData.toCity, 500);
  const [fromSuggestions, setFromSuggestions] = useState<any[]>([]);
  const [toSuggestions, setToSuggestions] = useState<any[]>([]);
  const [fromCoords, setFromCoords] = useState<{lat: number, lng: number} | null>(null);
  const [toCoords, setToCoords] = useState<{lat: number, lng: number} | null>(null);
  const isSuggestionClicked = useRef(false);
  const [errors, setErrors] = useState<any>({});
  const [fareData, setFareData] = useState<{
    selected_car: FareData | null;
    all_car_fares: AllCarFares | null;
  }>({ selected_car: null, all_car_fares: null });

  const [bookingResponseData, setBookingResponseData] = useState<any>(null);

  const [apiStatus, setApiStatus] = useState({
    isLoading: false,
    isBooking: false,
    error: '',
  });

  const [modal, setModal] = useState({
    isOpen: false,
    type: 'info' as 'success' | 'error' | 'warning' | 'info',
    title: '',
    message: ''
  });

  const [tripType, setTripType] = useState('one-way');
  const [pickupLocation, setPickupLocation] = useState('');
  const [debouncedPickupLocation] = useDebounce(pickupLocation, 300);
  const [dropoffLocation, setDropoffLocation] = useState('');
  const [debouncedDropoffLocation] = useDebounce(dropoffLocation, 300);
  const [pickupCoords, setPickupCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [dropoffCoords, setDropoffCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [distance, setDistance] = useState<string | null>(null);
  const [pickupDate, setPickupDate] = useState('');
  const [pickupTime, setPickupTime] = useState('');
  const [pickupSuggestions, setPickupSuggestions] = useState<any[]>([]);
  const [dropoffSuggestions, setDropoffSuggestions] = useState<any[]>([]);
  const [isPickupLoading, setIsPickupLoading] = useState(false);
  const [isDropoffLoading, setIsDropoffLoading] = useState(false);
  const isTypingPickup = useRef(false);
  const isTypingDropoff = useRef(false);
  const [pickupPlaceId, setPickupPlaceId] = useState('');
  const [dropPlaceId, setDropPlaceId] = useState('');
  const [carTypeChangedByCard, setCarTypeChangedByCard] = useState(false);

  const resetForm = () => {
    setFormData(initialFormData);
    setErrors({});
    setFareData({ selected_car: null, all_car_fares: null });
    setBookingResponseData(null);
  };

  const carTypes = [
    { id: 'hatchback', name: 'Hatchback', seats: '4 Seater', example: 'Wagon R' },
    { id: 'sedan', name: 'Sedan', seats: '4 Seater', example: 'Maruti Dzire' },
    { id: 'suv', name: 'SUV', seats: '6-7 Seater', example: 'Ertiga' },
    { id: 'crysta', name: 'Crysta', seats: '7 Seater', example: 'Toyota Innova Crysta' },
    { id: 'scorpio', name: 'Scorpio', seats: '7 Seater', example: 'Mahindra Scorpio' }
  ];

  const popularRoutes = [
    { from: 'Kolkata', to: 'Digha', distance: 185 },
    { from: 'Kolkata', to: 'Mandarmani', distance: 180 },
    { from: 'Kolkata', to: 'Kharagpur', distance: 120 },
    { from: 'Kolkata', to: 'Durgapur', distance: 165 }
  ];

  const tripTypes = [
    { id: 'oneway', name: 'One Way', description: 'Single destination' },
    { id: 'roundtrip', name: 'Round Trip', description: 'Go and return' },
    { id: 'rental', name: 'Local Rental', description: 'Hourly rental' },
    { id: 'airport', name: 'Airport Transfer', description: 'Airport pickup/drop' }
  ];

  const rentalDurations = [
    '4hr/40km', '6hr/60km', '8hr/80km', '10hr/100km', '12hr/120km'
  ];

  useEffect(() => {
    const selectedTripType = localStorage.getItem('selectedTripType');
    if (selectedTripType) {
      setFormData(prev => ({ ...prev, tripType: selectedTripType }));
      localStorage.removeItem('selectedTripType');
    }

    const selectedRoute = localStorage.getItem('selectedRoute');
    if (selectedRoute) {
      const route = JSON.parse(selectedRoute);
      setFormData(prev => ({ 
        ...prev, 
        fromCity: route.fromCity, 
        toCity: route.toCity,
        carType: 'sedan'
      }));
      localStorage.removeItem('selectedRoute');
    }
  }, []);

  useEffect(() => {
    if (isSuggestionClicked.current) {
      isSuggestionClicked.current = false;
      return;
    }
    const fetchSuggestions = async () => {
      try {
        const apiKey = import.meta.env.VITE_OLAMAPS_API_KEY;
        if (!apiKey) {
          console.error("Olamaps API key is missing.");
          setFromSuggestions([]);
          return;
        }
        const response = await fetch(`https://api.olamaps.io/places/v1/autocomplete?input=${debouncedFromCity}&api_key=${apiKey}`);
        if (!response.ok) throw new Error('Network response was not ok');
        const data = await response.json();
        setFromSuggestions(data.predictions || []);
      } catch (error) {
        console.error("Failed to fetch autocomplete suggestions:", error);
        setFromSuggestions([]);
      }
    };

    if (debouncedFromCity.length > 2) {
      fetchSuggestions();
    } else {
      setFromSuggestions([]);
    }
  }, [debouncedFromCity]);

  useEffect(() => {
    if (isSuggestionClicked.current) {
      isSuggestionClicked.current = false;
      return;
    }
    const fetchSuggestions = async () => {
      try {
        const apiKey = import.meta.env.VITE_OLAMAPS_API_KEY;
        if (!apiKey) {
          console.error("Olamaps API key is missing.");
          setToSuggestions([]);
          return;
        }
        const response = await fetch(`https://api.olamaps.io/places/v1/autocomplete?input=${debouncedToCity}&api_key=${apiKey}`);
        if (!response.ok) throw new Error('Network response was not ok');
        const data = await response.json();
        setToSuggestions(data.predictions || []);
      } catch (error) {
        console.error("Failed to fetch autocomplete suggestions:", error);
        setToSuggestions([]);
      }
    };
    
    if (debouncedToCity.length > 2) {
      fetchSuggestions();
    } else {
      setToSuggestions([]);
    }
  }, [debouncedToCity]);

  const getPlaceDetails = async (placeId: string, setter: React.Dispatch<React.SetStateAction<{lat: number, lng: number} | null>>) => {
    try {
      const apiKey = import.meta.env.VITE_OLAMAPS_API_KEY;
      const response = await fetch(`https://api.olamaps.io/places/v1/details?place_id=${placeId}&api_key=${apiKey}`);
      if (!response.ok) throw new Error('Failed to fetch place details');
      const data = await response.json();
      if (data.result?.geometry?.location) {
        setter(data.result.geometry.location);
      }
    } catch (error) {
      console.error(error);
      setter(null);
    }
  };

  const showModal = (type: 'success' | 'error' | 'warning' | 'info', title: string, message: string) => {
    setModal({ isOpen: true, type, title, message });
  };

  const closeModal = () => {
    setModal(prev => ({ ...prev, isOpen: false }));
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setFareData({ selected_car: null, all_car_fares: null });
    setBookingResponseData(null);
    if (name === 'fromCity' && value === '') setFromCoords(null);
    if (name === 'toCity' && value === '') setToCoords(null);
  };

  const handleSuggestionClick = (field: 'fromCity' | 'toCity', suggestion: any) => {
    isSuggestionClicked.current = true;
    if (field === 'fromCity') {
      setFormData(prev => ({ ...prev, fromCity: suggestion.description }));
      setPickupPlaceId(suggestion.place_id);
      setFromSuggestions([]);
      getPlaceDetails(suggestion.place_id, setPickupCoords);
    } else {
      setFormData(prev => ({ ...prev, toCity: suggestion.description }));
      setDropPlaceId(suggestion.place_id);
      setToSuggestions([]);
      getPlaceDetails(suggestion.place_id, setDropoffCoords);
    }
  };

  const validateForm = (isBooking = false) => {
    const tempErrors: any = {};
    if (!/^[6-9]\d{9}$/.test(formData.phone)) {
      tempErrors.phone = 'Please enter a valid 10-digit Indian mobile number.';
    }
    if (!formData.fromCity) {
      tempErrors.fromCity = 'Pickup location is required.';
    }
    if (formData.tripType !== 'rental' && !formData.toCity) {
      tempErrors.toCity = 'Drop location is required.';
    }
    if (!formData.date) {
      tempErrors.date = 'Pickup date is required.';
    }
    if (formData.tripType === 'roundtrip' && !formData.returnDate) {
      tempErrors.returnDate = 'Return date is required for round trips.';
    }
    if (!formData.carType) {
      tempErrors.carType = 'Please select a car type.';
    }

    setErrors(tempErrors);
    return Object.keys(tempErrors).length === 0;
  };

  const formatTime12Hour = (time24: string) => {
    if (!time24) return '';
    const [hours, minutes] = time24.split(':');
    const h = parseInt(hours, 10);
    const ampm = h >= 12 ? 'PM' : 'AM';
    const h12 = h % 12 || 12;
    return `${String(h12).padStart(2, '0')}:${minutes} ${ampm}`;
  };

  const getDistance = async () => {
    if (!fromCoords || !toCoords) {
      showModal('error', 'Missing Coordinates', 'Could not determine coordinates for the selected locations.');
      return null;
    }
    try {
      const apiKey = import.meta.env.VITE_OLAMAPS_API_KEY;
      const origin = `${fromCoords.lat},${fromCoords.lng}`;
      const destination = `${toCoords.lat},${toCoords.lng}`;
      const response = await fetch(`https://api.olamaps.io/routing/v1/distanceMatrix/basic?origins=${origin}&destinations=${destination}&api_key=${apiKey}`);
      if (!response.ok) throw new Error('Failed to fetch distance');
      const data = await response.json();
      // Distance is in meters, convert to KM
      const distanceInKm = Math.round(data.elements[0].distance.value / 1000);
      return distanceInKm;
    } catch (error) {
      console.error(error);
      showModal('error', 'Distance Error', 'Failed to calculate the distance between the locations.');
      return null;
    }
  }

  const calculateFare = async () => {
    if (!validateForm()) return;
    setApiStatus({ isLoading: true, isBooking: false, error: '' });
    
    let distance = 150; // Default distance
    if (formData.tripType !== 'rental') {
      const calculatedDistance = await getDistance();
      if (calculatedDistance === null) {
        setApiStatus({ isLoading: false, isBooking: false, error: 'Could not calculate distance.' });
        return; // Stop if distance calculation fails
      }
      distance = calculatedDistance;
    }

    try {
      const formattedTime = `${formData.date}T${formData.pickupTime}:00`;
      let kmLimit = null;
      if (formData.tripType === 'rental') {
        // Extract km from rental_booking_type (e.g., '4hr/40km' => 40)
        const match = formData.rentalDuration.match(/(\d+)km/);
        kmLimit = match ? Number(match[1]) : 40;
      } else {
        kmLimit = Number(distance);
      }
      
      // Prepare payload with coordinates for geolocation-based pricing
      const payload: any = {
        service_type: formData.tripType,
        pick_up_location: formData.fromCity,
        drop_location: formData.toCity,
        pick_up_time: formattedTime,
        km_limit: kmLimit,
        car_type: formData.carType,
        journey_date: formData.date,
        mobile_number: formData.phone,
        booking_source: 'website',
      };

      // Add coordinates if available for geolocation-based pricing
      if (pickupCoords) {
        payload.pickup_lat = pickupCoords.lat;
        payload.pickup_lng = pickupCoords.lng;
      }
      
      if (dropoffCoords) {
        payload.drop_lat = dropoffCoords.lat;
        payload.drop_lng = dropoffCoords.lng;
      }

      if (formData.tripType === 'roundtrip') {
        payload.return_date = formData.returnDate;
      }
      if (formData.tripType === 'rental') {
        payload.rental_booking_type = formData.rentalDuration;
      }
      
      console.log('Fare calculation payload with coordinates:', payload);
      
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/fare/estimate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();
      if (!response.ok || !data.success) {
        throw new Error(data.message || 'Failed to calculate fare.');
      }

      setFareData(data.data);
    } catch (error: any) {
      setApiStatus(prev => ({ ...prev, error: error.message }));
    } finally {
      setApiStatus(prev => ({ ...prev, isLoading: false }));
    }
  };

  const handleBooking = async () => {
    if (!validateForm(true)) {
      showModal('warning', 'Incomplete Form', 'Please fill all required fields before booking.');
      return;
    }
    
    if (!fareData.selected_car) {
      showModal('info', 'Calculate Fare First', 'Please calculate the fare before booking.');
      return;
    }

    setApiStatus({ isLoading: false, isBooking: true, error: '' });
    
    try {
      const bookingPayload: any = {
        mobile_number: formData.phone,
        service_type: formData.tripType,
        pick_up_location: formData.fromCity,
        drop_location: formData.tripType === 'rental' ? null : formData.toCity,
        journey_date: formData.date,
        return_date: formData.returnDate || null,
        pick_up_time: formatTime12Hour(formData.pickupTime),
        car_type: formData.carType,
        estimated_fare: fareData.selected_car.estimated_fare,
        km_limit: fareData.selected_car.km_limit,
        booking_source: 'website'
      };

      // Add coordinates for geolocation-based pricing
      if (pickupCoords) {
        bookingPayload.pickup_lat = pickupCoords.lat;
        bookingPayload.pickup_lng = pickupCoords.lng;
      }
      
      if (dropoffCoords) {
        bookingPayload.drop_lat = dropoffCoords.lat;
        bookingPayload.drop_lng = dropoffCoords.lng;
      }

      if (formData.tripType === 'rental') {
        bookingPayload.rental_booking_type = formData.rentalDuration;
      }

      console.log('Booking payload with coordinates:', bookingPayload);

      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/booking`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(bookingPayload)
      });
      
      const data = await response.json();
      if (!response.ok || !data.success) {
        throw new Error(data.message || 'Failed to create booking.');
      }
      
      setBookingResponseData(data.data);
      
    } catch (error: any) {
      setApiStatus(prev => ({ ...prev, error: error.message }));
      showModal('error', 'Booking Failed', error.message);
    } finally {
      setApiStatus(prev => ({ ...prev, isBooking: false }));
    }
  };

  const handleRouteSelect = (route: any) => {
    setFormData(prev => ({
      ...prev,
      fromCity: route.from,
      toCity: route.to
    }));
  };

  const handleTripTypeChange = (tripType: string) => {
    console.log('Trip type changed to:', tripType);
    setFormData(prev => ({ ...prev, tripType, carType: '', returnDate: '' }));
    setFareData({ selected_car: null, all_car_fares: null });
    setErrors({});
  };

  const getTodayDate = () => {
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const dd = String(today.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  };

  const fetchSuggestions = async (
    input: string, 
    setSuggestions: React.Dispatch<React.SetStateAction<any[]>>, 
    setIsLoading: React.Dispatch<React.SetStateAction<boolean>>
  ) => {
    if (input.length < 2) {
      setSuggestions([]);
      return;
    }
    setIsLoading(true);
    try {
      const response = await fetch(`https://api.olakrutrim.com/v1/places/autocomplete`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${import.meta.env.VITE_OLAMAPS_API_KEY}`
        },
        body: JSON.stringify({ input })
      });
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      const data = await response.json();
      setSuggestions(data.predictions || []);
    } catch (error) {
      console.error("Failed to fetch suggestions:", error);
      setSuggestions([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isTypingPickup.current) {
      fetchSuggestions(debouncedPickupLocation, setPickupSuggestions, setIsPickupLoading);
    }
  }, [debouncedPickupLocation]);

  useEffect(() => {
    if (isTypingDropoff.current) {
      fetchSuggestions(debouncedDropoffLocation, setDropoffSuggestions, setIsDropoffLoading);
    }
  }, [debouncedDropoffLocation]);

  const fetchCoordinates = async (placeId: string, setCoords: (coords: { lat: number; lng: number } | null) => void) => {
    try {
      const response = await fetch(`https://api.olakrutrim.com/v1/places/${placeId}`, {
        headers: {
          'Authorization': `Bearer ${import.meta.env.VITE_OLAMAPS_API_KEY}`
        }
      });
      if (!response.ok) {
        throw new Error('Failed to fetch place details');
      }
      const data = await response.json();
      if (data.result && data.result.geometry && data.result.geometry.location) {
        setCoords(data.result.geometry.location);
      }
    } catch (error) {
      console.error(error);
    }
  };

  const fetchDistance = async (origin: { lat: number; lng: number }, destination: { lat: number; lng: number }) => {
    try {
      const response = await fetch(`https://api.olakrutrim.com/v1/distance-matrix`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${import.meta.env.VITE_OLAMAPS_API_KEY}`
        },
        body: JSON.stringify({
          origins: [origin],
          destinations: [destination],
          mode: 'driving'
        })
      });
      if (!response.ok) {
        throw new Error('Failed to fetch distance');
      }
      const data = await response.json();
      if (data.matrix && data.matrix[0] && data.matrix[0].distance) {
        const distanceInKm = (data.matrix[0].distance / 1000).toFixed(2);
        setDistance(distanceInKm);
      }
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    if (pickupCoords && dropoffCoords) {
      getDistanceInKm(pickupCoords, dropoffCoords, OLA_API_KEY).then(setDistance);
    }
  }, [pickupCoords, dropoffCoords]);

  const handleSelectPickup = (place: any) => {
    isTypingPickup.current = false;
    setPickupLocation(place.description);
    setPickupPlaceId(place.place_id);
    setPickupSuggestions([]);
    fetchCoordinates(place.place_id, setPickupCoords);
  };

  const handleSelectDropoff = (place: any) => {
    isTypingDropoff.current = false;
    setDropoffLocation(place.description);
    setDropPlaceId(place.place_id);
    setDropoffSuggestions([]);
    fetchCoordinates(place.place_id, setDropoffCoords);
  };

  const getFareEstimate = async () => {
    console.log('Estimate button clicked');
    // Only require relevant fields for rental
    if (formData.tripType === 'rental') {
      if (!formData.fromCity || !formData.date) {
        showModal('warning', 'Incomplete Form', 'Please fill all required fields (Pickup, Date) before calculating fare.');
        return;
      }
    } else {
      if (!formData.fromCity || !formData.toCity || !formData.date || !formData.pickupTime) {
        showModal('warning', 'Incomplete Form', 'Please fill all required fields (Pickup, Dropoff, Date, Time) before calculating fare.');
        return;
      }
    }

    if (formData.tripType !== 'rental' && !distance) {
      showModal('warning', 'Distance Error', 'Could not calculate distance. Please select valid locations.');
      return;
    }

    setApiStatus({ isLoading: true, isBooking: false, error: '' });
    
    try {
      const formattedTime = `${formData.date}T${formData.pickupTime}:00`;
      let kmLimit = null;
      if (formData.tripType === 'rental') {
        // Extract km from rental_booking_type (e.g., '4hr/40km' => 40)
        const match = formData.rentalDuration.match(/(\d+)km/);
        kmLimit = match ? Number(match[1]) : 40;
      } else {
        kmLimit = Number(distance);
      }
      
      // Prepare payload with coordinates for geolocation-based pricing
      const payload: any = {
        service_type: formData.tripType,
        pick_up_location: formData.fromCity,
        drop_location: formData.toCity,
        pick_up_time: formattedTime,
        km_limit: kmLimit,
        car_type: formData.carType,
        journey_date: formData.date,
        mobile_number: formData.phone,
        booking_source: 'website',
      };

      // Add coordinates if available for geolocation-based pricing
      if (pickupCoords) {
        payload.pickup_lat = pickupCoords.lat;
        payload.pickup_lng = pickupCoords.lng;
      }
      
      if (dropoffCoords) {
        payload.drop_lat = dropoffCoords.lat;
        payload.drop_lng = dropoffCoords.lng;
      }

      if (formData.tripType === 'roundtrip') {
        payload.return_date = formData.returnDate;
      }
      if (formData.tripType === 'rental') {
        payload.rental_booking_type = formData.rentalDuration;
      }
      
      console.log('Fare estimation payload with coordinates:', payload);
      
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/fare/estimate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();
      if (!response.ok || !data.success) {
        throw new Error(data.message || 'Failed to calculate fare.');
      }

      setFareData(data.data);
    } catch (error: any) {
      setApiStatus(prev => ({ ...prev, error: error.message }));
    } finally {
      setApiStatus(prev => ({ ...prev, isLoading: false }));
    }
  };

  const handleCarCardSelect = (carId: string) => {
    setFormData(prev => {
      if (prev.carType !== carId) {
        setCarTypeChangedByCard(true);
        return { ...prev, carType: carId };
      }
      return prev;
    });
  };

  useEffect(() => {
    if (carTypeChangedByCard) {
      getFareEstimate();
      setCarTypeChangedByCard(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formData.carType]);

  return (
    <div className="bg-white rounded-2xl shadow-xl p-6 lg:p-8 max-w-4xl mx-auto" id="booking-form">
       {bookingResponseData && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-xl max-w-lg w-full mx-4 transform transition-all relative">
                <button 
                  onClick={resetForm} 
                  className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
                  aria-label="Close"
                >
                  <X className="h-6 w-6" />
                </button>
                <div className="p-6 pt-12 text-center">
                    <CheckCircle className="h-16 w-16 mb-4 text-green-500 mx-auto" />
                    <h2 className="text-2xl font-bold mb-2">Booking Confirmed!</h2>
                    <p className="text-gray-600 mb-4">Our team will contact you shortly.</p>

                    <div className="text-left bg-gray-50 p-4 rounded-lg space-y-2 mb-6">
                        <p><strong>Booking ID:</strong> <span className="font-mono text-blue-600">{bookingResponseData.booking_id}</span></p>
                        <p><strong>Estimated Fare:</strong> ₹{bookingResponseData.estimated_fare}</p>
                        <p><strong>Pickup Date:</strong> {new Date(bookingResponseData.pickup_date).toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                        <p><strong>Pickup Time:</strong> {bookingResponseData.pickup_time}</p>
                        <p><strong>Service:</strong> {bookingResponseData.service_type} ({bookingResponseData.car_type})</p>
                    </div>
                </div>
            </div>
        </div>
      )}
      <Modal {...modal} onClose={closeModal} />
      
      <div className="mb-6 text-center">
         <h2 className="text-2xl font-bold text-gray-900 mb-2">Book Your Ride</h2>
         <p className="text-gray-600">Driven by Trust, Comfort in Every Mile, Through the Heart of Bengal</p>
      </div>

      <div className="mb-6 text-center">
         <div className="flex flex-col sm:flex-row gap-3 justify-center">
           <a
             href="https://wa.me/917003371343"
             target="_blank" rel="noopener noreferrer"
             className="inline-flex items-center justify-center space-x-2 bg-green-500 text-white px-6 py-3 rounded-lg font-semibold hover:bg-green-600 transition-colors duration-200"
           >
             <MessageCircle className="h-5 w-5" />
             <span>Quick WhatsApp Booking</span>
           </a>
           <a
             href="tel:9903042200"
             className="inline-flex items-center justify-center space-x-2 bg-blue-500 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-600 transition-colors duration-200"
           >
             <Phone className="h-5 w-5" />
             <span>Quick Phone Booking</span>
           </a>
         </div>
      </div>

      {/* Trip Type Selection */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
        {tripTypes.map(type => (
          <div
            key={type.id}
            className={`p-3 border-2 rounded-lg cursor-pointer transition-all ${
              formData.tripType === type.id
                ? 'border-blue-500 bg-blue-50'
                : 'border-gray-200 hover:border-blue-300'
            }`}
            onClick={() => handleTripTypeChange(type.id)}
          >
            <div className="text-center">
              <h4 className="font-semibold text-gray-900 text-sm mb-1">{type.name}</h4>
              <p className="text-xs text-gray-600">{type.description}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Form Fields */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {/* Phone Number */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
          <div className="relative">
            <Phone className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleInputChange}
              placeholder="9876543210"
              maxLength={10}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone}</p>}
        </div>

        {/* From City / Pickup Location */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {formData.tripType === 'rental' ? 'Pickup Location' : 'From City'}
          </label>
          <div className="relative">
            <MapPin className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
            <input
              type="text"
              name="fromCity"
              value={formData.fromCity}
              onChange={handleInputChange}
              placeholder="Kolkata"
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
             {fromSuggestions.length > 0 && (
              <ul className="absolute z-10 w-full bg-white border border-gray-300 rounded-md mt-1 max-h-60 overflow-auto shadow-lg">
                {fromSuggestions.map((suggestion, index) => (
                  <li
                    key={index}
                    onClick={() => handleSuggestionClick('fromCity', suggestion)}
                    className="px-4 py-2 cursor-pointer hover:bg-gray-100"
                  >
                    {suggestion.description}
                  </li>
                ))}
              </ul>
            )}
          </div>
          {errors.fromCity && <p className="text-red-500 text-xs mt-1">{errors.fromCity}</p>}
        </div>
        
        {/* To City (hidden for local rental) */}
        {formData.tripType !== 'rental' && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">To City</label>
            <div className="relative">
              <MapPin className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
              <input
                type="text"
                name="toCity"
                value={formData.toCity}
                onChange={handleInputChange}
                placeholder="Durgapur"
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              {toSuggestions.length > 0 && (
                <ul className="absolute z-10 w-full bg-white border border-gray-300 rounded-md mt-1 max-h-60 overflow-auto shadow-lg">
                  {toSuggestions.map((suggestion, index) => (
                    <li
                      key={index}
                      onClick={() => handleSuggestionClick('toCity', suggestion)}
                      className="px-4 py-2 cursor-pointer hover:bg-gray-100"
                    >
                      {suggestion.description}
                    </li>
                  ))}
                </ul>
              )}
            </div>
            {errors.toCity && <p className="text-red-500 text-xs mt-1">{errors.toCity}</p>}
          </div>
        )}

        {/* Distance Disabled Input (now in grid, no col-span/flex) */}
        {distance && formData.tripType !== 'rental' && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Distance (km)</label>
            <input
              type="text"
              value={`${distance} km`}
              disabled
              className="w-full px-4 py-3 border border-blue-300 rounded-lg bg-blue-50 text-blue-900 font-semibold text-center focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
          </div>
        )}

        {/* Date */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {formData.tripType === 'rental' ? 'Pickup Date' : 'Travel Date'}
          </label>
          <div className="relative">
            <Calendar className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
            <input
              type="date"
              name="date"
              value={formData.date}
              onChange={handleInputChange}
              min={getTodayDate()}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          {errors.date && <p className="text-red-500 text-xs mt-1">{errors.date}</p>}
        </div>

        {/* Return Date (only for round trip) */}
        {formData.tripType === 'roundtrip' && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Return Date</label>
            <div className="relative">
              <Calendar className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
              <input
                type="date"
                name="returnDate"
                value={formData.returnDate}
                onChange={handleInputChange}
                min={formData.date || getTodayDate()}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            {errors.returnDate && <p className="text-red-500 text-xs mt-1">{errors.returnDate}</p>}
          </div>
        )}

        {/* Pickup Time */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Pickup Time</label>
          <div className="relative">
            <Clock className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
            <input
              type="time"
              name="pickupTime"
              value={formData.pickupTime}
              onChange={handleInputChange}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Rental Duration (only for local rental) */}
        {formData.tripType === 'rental' && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Duration</label>
            <div className="relative">
              <Clock className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
              <select
                name="rentalDuration"
                value={formData.rentalDuration}
                onChange={handleInputChange}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none"
              >
                {rentalDurations.map(duration => <option key={duration} value={duration}>{duration}</option>)}
              </select>
            </div>
          </div>
        )}

        {/* Car Type */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Select a Car</label>
          <div className="relative">
            <Car className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
            <select
              name="carType"
              value={formData.carType}
              onChange={handleInputChange}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none"
            >
              <option value="" disabled>Choose a car</option>
              {carTypes.map(car => <option key={car.id} value={car.id}>{car.name}</option>)}
            </select>
          </div>
          {errors.carType && <p className="text-red-500 text-xs mt-1">{errors.carType}</p>}
        </div>
      </div>
      
      {/* Popular Routes */}
      {formData.tripType !== 'rental' && (
        <div className="mb-6">
          <h4 className="text-sm font-semibold text-gray-600 mb-2">Popular Routes:</h4>
          <div className="flex flex-wrap gap-2">
            {popularRoutes.map(route => (
              <button
                key={`${route.from}-${route.to}`}
                onClick={() => handleRouteSelect(route)}
                className="text-xs bg-gray-100 text-gray-700 px-3 py-1 rounded-full hover:bg-gray-200 flex items-center"
              >
                <MapPin className="inline h-3 w-3 mr-1" />
                {route.from} <ArrowRight className="inline h-3 w-3 mx-1" /> {route.to}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Fare Estimate and Other Cars - moved above action buttons */}
      {fareData.selected_car && (
        <div className="mb-6 p-6 bg-blue-50 border border-blue-200 rounded-2xl">
          <h3 className="text-xl font-bold text-center text-gray-900 mb-4">Fare Estimate</h3>
          <div className="text-center mb-6">
            <p className="text-4xl font-extrabold text-blue-600">
              ₹{fareData.selected_car.estimated_fare.toLocaleString('en-IN')}
            </p>
            <p className="text-sm text-gray-600 mt-1">for {formData.carType} (up to {fareData.selected_car.km_limit})</p>
          </div>
        </div>
      )}
      {fareData.all_car_fares && (
        <div className="mb-4">
          <h3 className="text-lg font-semibold text-center text-gray-800 mb-4">Other Available Cars</h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {Object.entries(fareData.all_car_fares).map(([car, fare]) => {
              const carInfo = carTypes.find(c => c.id === car);
              if (!carInfo) return null;
              return (
                <div
                  key={car}
                  className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${formData.carType === car ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-blue-300'}`}
                  onClick={() => handleCarCardSelect(car)}
                >
                  <h4 className="font-bold text-gray-900 text-sm">{carInfo.name}</h4>
                  <p className="text-xs text-gray-600">{carInfo.seats}, {carInfo.example}</p>
                  <p className="text-lg font-bold text-gray-800 mt-2">₹{fare.estimated_fare.toLocaleString('en-IN')}</p>
                  <p className="text-xs text-gray-500">Up to {fare.km_limit}</p>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <button
          onClick={getFareEstimate}
          disabled={apiStatus.isLoading}
          className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-bold py-3 px-8 rounded-lg shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {apiStatus.isLoading && !apiStatus.isBooking ? 'Calculating...' : 'Check Fare Instantly'}
        </button>
        
        <button
          onClick={handleBooking}
          disabled={!fareData.selected_car || apiStatus.isBooking}
          className="bg-gradient-to-r from-green-500 to-emerald-600 text-white font-bold py-3 px-8 rounded-lg shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {apiStatus.isBooking ? 'Booking...' : 'Book Instantly'}
        </button>
      </div>

      {apiStatus.error && (
        <div className="mb-6 text-center text-red-600 bg-red-100 p-3 rounded-lg">
          <AlertCircle className="inline h-5 w-5 mr-2" />
          {apiStatus.error}
        </div>
      )}

    </div>
  );
};

export default BookingForm;