import express from 'express'
import 'dotenv/config'
import cors from 'cors'
import connectDB from './configs/db.js';
import adminRouter from './routes/adminRoutes.js';
import blogRouter from './routes/blogRoutes.js';
import subscriberRouter from './routes/subscriberRoutes.js';
import swaggerUi from 'swagger-ui-express';
import swaggerSpecs from './configs/swagger.js';

const app = express();

await connectDB()

// Middlewares
app.use(cors({
    origin: [
        'https://quickblog-frontend-3klplshp7-plitzees-projects.vercel.app',
        'https://quickblog-frontend-3n2wx8nvi-plitzees-projects.vercel.app',
        'https://quickblog-frontend-2h1ixuxa7-plitzees-projects.vercel.app',
        'https://quickblog-frontend-bp8vokh76-plitzees-projects.vercel.app',
        /^https:\/\/quickblog-frontend-.*\.vercel\.app$/,
        'http://localhost:5173'
    ],
    credentials: true
}))
app.use(express.json())

// Routes
app.get('/', (req, res)=> res.send("API is Working"))
app.use('/api/admin', adminRouter)
app.use('/api/blog', blogRouter)
app.use('/api/subscriber', subscriberRouter)
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpecs));

const PORT = process.env.PORT || 3000;

app.listen(PORT, ()=>{
    console.log('Server is running on port ' + PORT)
})