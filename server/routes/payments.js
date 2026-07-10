const router = require('express').Router();
const Payment = require('../models/Payment');
const Appointment = require('../models/Appointment');
const auth = require('../middleware/auth');
const logger = require('../utils/logger');

// GET /api/payments — Get current patient's payment history
router.get('/', auth, async (req, res) => {
    try {
        const payments = await Payment.find({ patientId: req.user.id })
            .populate('doctorId', 'name specialization')
            .populate('appointmentId', 'date')
            .sort({ date: -1 });
        res.json(payments);
    } catch (err) {
        logger.error(`Error fetching payments: ${err.message}`);
        res.status(500).json({ message: err.message });
    }
});

// POST /api/payments/seed — Development only: generate dummy payments from past appointments
if (process.env.NODE_ENV !== 'production') {
    router.post('/seed', auth, async (req, res) => {
        try {
            const appointments = await Appointment.find({
                patientId: req.user.id,
                status: 'completed'
            });

            const newPayments = [];
            for (const apt of appointments) {
                const exists = await Payment.findOne({ appointmentId: apt._id });
                if (!exists) {
                    const payment = await Payment.create({
                        patientId: req.user.id,
                        doctorId: apt.doctorId,
                        appointmentId: apt._id,
                        amount: 500,
                        status: 'completed',
                        date: apt.date,
                        transactionId: 'TXN' + Math.floor(Math.random() * 1000000)
                    });
                    newPayments.push(payment);
                }
            }
            res.json({ message: `Generated ${newPayments.length} payments from history`, payments: newPayments });
        } catch (err) {
            logger.error(`Error seeding payments: ${err.message}`);
            res.status(500).json({ message: err.message });
        }
    });
}

module.exports = router;
