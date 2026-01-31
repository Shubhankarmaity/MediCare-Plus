const router = require('express').Router();
const Hospital = require('../models/Hospital');

router.get('/hospitals', async (req, res) => {
    try {
        console.log('API Seeding Request Received');
        const count = await Hospital.countDocuments();
        if (count > 0) {
            console.log(`Database already has ${count} hospitals.`);
            return res.status(200).json({ message: `Database already has ${count} hospitals. No action taken.` });
        }

        const hospitals = [
            {
                name: "City General Hospital",
                address: "123 Healthcare Blvd, Downtown",
                city: "New York",
                phone: "+1 (555) 123-4567",
                email: "contact@citygeneral.com",
                facilities: ["Cardiology", "Neurology", "Orthopedics", "Emergency"],
                totalBeds: 500,
                availableBeds: 120,
                icuAvailable: true,
                emergencyServices: true,
                rating: 4.8,
                description: "A premier healthcare facility offering world-class medical services with state-of-the-art technology."
            },
            {
                name: "Sunrise Community Medical Center",
                address: "456 Wellness Way, Westside",
                city: "Los Angeles",
                phone: "+1 (555) 987-6543",
                email: "info@sunrisemedical.org",
                facilities: ["Pediatrics", "Gynecology", "General Surgery", "Radiology"],
                totalBeds: 300,
                availableBeds: 45,
                icuAvailable: true,
                emergencyServices: true,
                rating: 4.5,
                description: "Dedicated to providing compassionate care to our community with a focus on family health."
            },
            {
                name: "Metropolitan Specialty Clinc",
                address: "789 Specialist Ave, Uptown",
                city: "Chicago",
                phone: "+1 (555) 246-8135",
                email: "support@metrospecialty.com",
                facilities: ["Oncology", "Dermatology", "ENT", "Psychiatry"],
                totalBeds: 200,
                availableBeds: 80,
                icuAvailable: false,
                emergencyServices: false,
                rating: 4.7,
                description: "Specialized care for complex medical conditions, led by top experts in their fields."
            },
            {
                name: "Green Valley Rehabilitation Center",
                address: "101 Recovery Road, Suburbs",
                city: "Houston",
                phone: "+1 (555) 135-7924",
                email: "rehab@greenvalley.com",
                facilities: ["Physiotherapy", "Rehabilitation", "Sports Medicine"],
                totalBeds: 150,
                availableBeds: 100,
                icuAvailable: false,
                emergencyServices: true,
                rating: 4.6,
                description: "Helping patients recover and regain independence through comprehensive rehabilitation programs."
            }
        ];

        const result = await Hospital.insertMany(hospitals);
        console.log(`Successfully added ${result.length} hospitals via API!`);
        res.status(201).json({ message: `Successfully added ${result.length} hospitals!` });
    } catch (error) {
        console.error('Seeding error:', error);
        res.status(500).json({ message: 'Error seeding database', error: error.message });
    }
});

module.exports = router;
