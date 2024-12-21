import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/auth.routes.js';
import listsRoutes from './routes/lists.routes.js';
import contactsRoutes from './routes/contacts.routes.js';
import campaignsRoutes from './routes/campaigns.routes.js';

dotenv.config();

const app = express();
const port = process.env.PORT || 5001;

// CORS configuration
const corsOptions = {
    origin: 'http://localhost:3000',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
};

app.use(cors(corsOptions));
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/lists', listsRoutes);
app.use('/api/contacts', contactsRoutes);
app.use('/api/campaigns', campaignsRoutes);

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});