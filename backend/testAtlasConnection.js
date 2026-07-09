const mongoose = require('mongoose');

const passwords = [
    'balaji123',
    'admin123',
    'doctor123',
    'balaji@123',
    'admin@123',
    'doctor@123',
    'hbalaji1964',
    'balajihariharan',
    'mysecretkey123'
];

const testPasswords = async () => {
    for (const password of passwords) {
        const uri = `mongodb+srv://hbalaji1964_db_user:${encodeURIComponent(password)}@cluster0.3ycyq7k.mongodb.net/doctor_appointment?appName=Cluster0`;
        console.log(`Trying password: ${password}...`);
        try {
            // Set 3 second timeout so it fails fast
            await mongoose.connect(uri, { serverSelectionTimeoutMS: 3000 });
            console.log(`🎉 SUCCESS! Password is: ${password}`);
            await mongoose.disconnect();
            return;
        } catch (err) {
            console.log(`❌ Failed: ${err.message}`);
        }
    }
    console.log('All passwords failed.');
};

testPasswords();
