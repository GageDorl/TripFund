import express from 'express';
import { fileURLToPath } from 'url';
import path from 'path';
import * as dotenv from 'dotenv';
import router from './src/controllers/routes.js';
import { getCurrentPath } from './src/middleware/global.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const NODE_ENV = process.env.NODE_ENV || 'production';
const PORT = process.env.PORT || 3000;

const app = express();

app.use(express.static(path.join(__dirname, 'public')));
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'src/views'));

app.use(getCurrentPath);

app.use('/', router);

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});