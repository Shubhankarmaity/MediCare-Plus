const mongoose = require('mongoose');
const Hospital = require('./models/Hospital');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

const hospitals = [
    {
        name: "City General Hospital",
        address: "123 Healthcare Blvd",
        city: "New York",
        phone: "555-0123",
        email: "contact@citygeneral.com",
        image: "https://images.unsplash.com/photo-1587351021759-3e566b9af922?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
        facilities: ["Emergency", "ICU", "Pediatrics", "Cardiology", "Radiology"],
        totalBeds: 500,
        availableBeds: 45,
        icuAvailable: true,
        emergencyServices: true,
        rating: 4.8,
        description: "A premier healthcare facility offering world-class medical services with state-of-the-art technology."
    },
    {
        name: "Sunrise Community Medical Center",
        address: "456 Wellness Way",
        city: "Los Angeles",
        phone: "555-0456",
        email: "info@sunrisemedical.com",
        image: "https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
        facilities: ["General Surgery", "Orthopedics", "Physical Therapy", "Pharmacy"],
        totalBeds: 300,
        availableBeds: 12,
        icuAvailable: false,
        emergencyServices: true,
        rating: 4.2,
        description: "Dedicated to providing compassionate care to our community with a focus on holistic wellness."
    },
    {
        name: "St. Mary's Memorial Hospital",
        address: "789 Faith Street",
        city: "Chicago",
        phone: "555-0789",
        email: "support@stmarys.org",
        image: "https://images.unsplash.com/photo-1512678080530-7760d81faba6?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
        facilities: ["Emergency", "ICU", "Neurology", "Oncology", "Maternity"],
        totalBeds: 750,
        availableBeds: 120,
        icuAvailable: true,
        emergencyServices: true,
        rating: 4.9,
        description: "Leading the way in medical research and advanced patient care for over a century."
    },
    {
        name: "Green Valley Clinic",
        address: "321 Nature Rd",
        city: "San Francisco",
        phone: "555-0321",
        email: "appointments@greenvalley.com",
        image: "https://images.unsplash.com/photo-1632833239869-a37e3a5806d2?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
        facilities: ["Outpatient Care", "Dental", "Dermatology"],
        totalBeds: 50,
        availableBeds: 5,
        icuAvailable: false,
        emergencyServices: false,
        rating: 4.5,
        description: "Your neighborhood clinic for routine checkups and specialized outpatient services."
    }
];

const seedHospitals = async () => {
    try {
        const MONGODB_URI = process.env.MONGODB_URI;
        await mongoose.connect(MONGODB_URI);
        console.log('Connected to MongoDB');

        await Hospital.deleteMany({});
        console.log('Cleared existing hospitals');

        await Hospital.insertMany(hospitals);
        console.log('Seeded hospitals');

        mongoose.connection.close();
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

seedHospitals();
