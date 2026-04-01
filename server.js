import express from 'express';
import { fileURLToPath } from 'url';
import path from 'path';
import * as dotenv from 'dotenv';
import router from './src/controllers/routes.js';
import { getCurrentPath } from './src/middleware/global.js';
import session from 'express-session';
import { setCurrentUser } from './src/middleware/auth.js';
import { init as initDb } from './src/middleware/db.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const NODE_ENV = process.env.NODE_ENV || 'production';
const PORT = process.env.PORT || 3000;


const app = express();

app.use(express.urlencoded({ extended: true }));

app.use(session({
    secret: process.env.SESSION_SECRET || 'defaultsecret',
    resave: false,
    saveUninitialized: false,
    cookie: { maxAge: 1000 * 60 * 60 * 24 } // 1 day
}));
app.use(express.static(path.join(__dirname, 'public')));
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'src/views'));

app.use(setCurrentUser);
app.use(getCurrentPath);

app.use('/', router);

// 404 handler for unmatched routes
app.use((req, res) => {
  return res.status(404).render('404');
});

// Global error handler (must have 4 parameters: err, req, res, next)
app.use((err, req, res, next) => {
  console.error('Error:', err);

  const status = err.status || 500;
  const message = NODE_ENV === 'production'
    ? 'An error occurred. Please try again later.'
    : (err.message || 'Unexpected server error');

  if (status === 404) {
    return res.status(404).render('404').catch(() => {
      res.status(404).send('404 - Page Not Found');
    });
  }

  return res.status(500).render('500', {
    showDetails: NODE_ENV !== 'production',
    details: message
  }).catch(() => {
    // If view rendering fails, send plain text
    res.status(500).send(`Error 500: ${message}`);
  });
});

const start = async () => {
    try {
        console.log('Initializing database...');
        await initDb();
        console.log('Database initialized');

        app.listen(PORT, () => {
            console.log(`Server is running on http://localhost:${PORT}`);
        });
    } catch (err) {
        console.error('Failed to start server', err);
        process.exit(1);
    }
};

start();