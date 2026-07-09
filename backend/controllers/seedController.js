const User = require('../models/User');
const Doctor = require('../models/Doctor');
const TimeSlot = require('../models/TimeSlot');
const bcrypt = require('bcryptjs');

const ALLOWED_ADMIN_EMAILS = [
    'admin@caresync.com',
    'balaji.bt22@bitsathy.ac.in',
    'santhoshkumar.bt22@bitsathy.ac.in',
    'padmaja.bt22@bitsathy.ac.in',
    'bhuvaneshwar.cs22@bitsathy.ac.in'
];

const seedDatabase = async (req, res) => {
    try {
        console.log('[Seed API] Starting cloud database seeding...');
        console.log('[Seed API] MONGO_URI Hex:', Buffer.from(process.env.MONGO_URI || '').toString('hex'));
        const salt = await bcrypt.genSalt(10);
        const hashedBalajiPassword = await bcrypt.hash('balaji123', salt);
        const hashedDoctorPassword = await bcrypt.hash('doctor123', salt);
        const hashedAdminPassword = await bcrypt.hash('admin123', salt);

        // 1. Clear Existing Test Data
        console.log('[Seed API] Clearing old test accounts...');
        await User.deleteMany({ email: 'balaji@caresync.com' });
        await User.deleteMany({ email: 'admin@caresync.com' });
        
        // Clear doctors and slots
        const existingDocs = await User.find({ email: /doctor.*@caresync.com/ }).select('_id');
        const docUserIds = existingDocs.map(u => u._id);
        await Doctor.deleteMany({ userId: { $in: docUserIds } });
        await User.deleteMany({ email: /doctor.*@caresync.com/ });
        
        await Doctor.deleteMany({ userId: { $nin: docUserIds } });
        await User.deleteMany({ isDoctor: true });
        await TimeSlot.deleteMany({}); // Reset slots for fresh start

        // 2. Create Balaji Patient Account
        const balaji = await User.create({
            name: 'Balaji',
            email: 'balaji@caresync.com',
            password: hashedBalajiPassword,
            isDoctor: false,
            isAdmin: false,
            isVerified: true,
            status: 'Active'
        });
        console.log('[Seed API] Balaji Patient created');

        // 3. Create Admin Account
        const admin = await User.create({
            name: 'Super Admin',
            email: 'admin@caresync.com',
            password: hashedAdminPassword,
            isAdmin: true,
            isDoctor: false,
            isVerified: true,
            status: 'Active'
        });
        console.log('[Seed API] Admin created');

        // 4. Create 10 Doctors
        const specializations = [
            'Cardiologist', 'Dermatologist', 'Neurologist', 'Pediatrician', 'Psychiatrist',
            'Orthopedic Surgeon', 'Gastroenterologist', 'Ophthalmologist', 'ENT Specialist',
            'Gynecologist', 'General Physician', 'Dentist', 'Oncologist', 'Urologist', 'Endocrinologist'
        ];
        const qualifications = [
            'MBBS, MD', 'MBBS, MS', 'MBBS, DNB', 'BDS, MDS', 'MBBS, MD (Medicine)', 'MBBS, MS (Surgery)'
        ];
        const firstNames = [
            'Rajesh', 'Suresh', 'Amit', 'Priya', 'Anjali', 'Vikram', 'Sanjay', 'Sunita', 'Kiran', 'Deepak',
            'Rohan', 'Sneha', 'Rahul', 'Pooja', 'Arjun', 'Meera', 'Vijay', 'Anita', 'Aditya', 'Ishaan'
        ];
        const lastNames = [
            'Kumar', 'Sharma', 'Verma', 'Gupta', 'Singh', 'Patel', 'Reddy', 'Iyer', 'Mehta', 'Joshi'
        ];
        const clinicNames = [
            'City Care Clinic', 'Healwell Center', 'Metro Health', 'Sunrise Medical', 'Lifeline Hospital'
        ];
        const cities = ['Bangalore', 'Mumbai', 'Delhi', 'Chennai', 'Hyderabad'];

        const shuffledSpecs = [...specializations].sort(() => 0.5 - Math.random());
        const createdDoctors = [];

        for (let i = 1; i <= 10; i++) {
            const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
            const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
            const fullName = `${firstName} ${lastName}`;
            const email = i === 1 ? 'doctor@caresync.com' : `doctor${i}@caresync.com`;
            const phone = `${Math.floor(6000000000 + Math.random() * 4000000000)}`;

            const docUser = await User.create({
                name: fullName,
                email,
                password: hashedDoctorPassword,
                phone,
                isDoctor: true,
                isAdmin: false,
                isVerified: true,
                status: 'Active'
            });

            const specialization = shuffledSpecs[i - 1] || 'General Physician';
            const qualification = qualifications[Math.floor(Math.random() * qualifications.length)];
            const experience = Math.floor(3 + Math.random() * 25);
            const fee = Math.floor(300 + Math.random() * 700);
            const clinic = clinicNames[Math.floor(Math.random() * clinicNames.length)];
            const city = cities[Math.floor(Math.random() * cities.length)];

            const startHour = 9;
            const endHour = 17;

            const doctorProfile = await Doctor.create({
                userId: docUser._id,
                specialization,
                experience,
                qualification,
                clinicName: `${clinic} - ${city}`,
                clinicAddress: `${Math.floor(10 + Math.random() * 900)}, MG Road, ${city}`,
                consultationFee: Math.round(fee / 10) * 10,
                workingHours: {
                    start: `${startHour.toString().padStart(2, '0')}:00`,
                    end: `${endHour.toString().padStart(2, '0')}:00`
                },
                isVerified: true,
                isApproved: true,
                availabilityStatus: 'Available'
            });

            createdDoctors.push({ name: fullName, specialization, email });

            // 5. Seed Time Slots for Next 3 Days for each doctor
            const dates = [];
            for (let d = 0; d < 3; d++) {
                const date = new Date();
                date.setDate(date.getDate() + d);
                date.setUTCHours(0, 0, 0, 0);
                dates.push(date);
            }

            const standardSlots = [
                { start: '09:00', end: '09:30' },
                { start: '10:00', end: '10:30' },
                { start: '11:00', end: '11:30' },
                { start: '14:00', end: '14:30' },
                { start: '15:00', end: '15:30' },
                { start: '16:00', end: '16:30' }
            ];

            for (const date of dates) {
                const slotsToInsert = standardSlots.map(s => ({
                    doctorId: doctorProfile._id,
                    date: date,
                    startTime: s.start,
                    endTime: s.end,
                    isBooked: false
                }));
                await TimeSlot.insertMany(slotsToInsert);
            }
        }

        console.log('[Seed API] Cloud database seeded successfully');

        res.status(200).json({
            status: 'success',
            message: 'Database seeded successfully on Vercel Cloud!',
            credentials: {
                patient: { email: 'balaji@caresync.com', password: 'balaji123' },
                doctor: { email: 'doctor@caresync.com', password: 'doctor123' },
                admin: { email: 'admin@caresync.com', password: 'admin123' }
            },
            doctorsSeededCount: createdDoctors.length
        });
    } catch (error) {
        console.error('[Seed API Error]:', error);
        res.status(500).json({
            status: 'error',
            message: 'Failed to seed cloud database: ' + error.message
        });
    }
};

module.exports = { seedDatabase };
