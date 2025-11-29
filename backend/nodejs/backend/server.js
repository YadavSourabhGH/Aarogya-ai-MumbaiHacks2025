const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/db');

dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging middleware
app.use((req, res, next) => {
    console.log(`📥 ${req.method} ${req.path} - Body:`, req.body);
    next();
});

// Connect to Database
connectDB();

const authRoutes = require('./routes/authRoutes');
const abhaRoutes = require('./routes/abhaRoutes');
const uploadRoutes = require('./routes/uploadRoutes');
const aiRoutes = require('./routes/aiRoutes');
const doctorRoutes = require('./routes/doctorRoutes');
const hospitalRoutes = require('./routes/hospitalRoutes');
const patientRoutes = require('./routes/patientRoutes');
const consentRoutes = require('./routes/consentRoutes');
const profileRoutes = require('./routes/profileRoutes');

// Routes
app.use('/auth', authRoutes);
app.use('/abha', abhaRoutes);
app.use('/records', uploadRoutes);
app.use('/ai', aiRoutes);
app.use('/profile', profileRoutes);
app.use('/doctor', doctorRoutes);
app.use('/hospital', hospitalRoutes);
app.use('/patient', patientRoutes);
app.use('/consent', consentRoutes);





app.get('/', (req, res) => {
    res.send('AarogyaAi Backend is running');
});

const federatedController = require('./controllers/federatedController');

// Federated Learning Routes
app.get('/federated/state', federatedController.getGlobalState);
app.post('/federated/register', federatedController.registerNode);
app.post('/federated/start-round', federatedController.startRound);
app.post('/federated/submit-update', federatedController.submitUpdate);
app.post('/federated/reset', federatedController.resetSimulation);

const PORT = process.env.PORT || 4000;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
