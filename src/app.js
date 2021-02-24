import express from 'express';
import dotenv from 'dotenv';

import session from 'express-session';
import { router as r } from './form.js';
import { router as admin } from './admin.js';
import { formatDate } from './formatDate.js';
import passport from './authentication.js';

dotenv.config();
const app = express();
const {
  PORT: port = 3000,
  SESSION_SECRET: sessionSecret,
} = process.env;

if (!sessionSecret) {
  console.error('Add SESSION_SECRET to .env');
  process.exit(1);
}

app.use(session({
  secret: sessionSecret,
  resave: false,
  saveUninitialized: false,
  maxAge: 30 * 24 * 60 * 1000, // 30 dagar
}));

const viewsPath = new URL('./views', import.meta.url).pathname;

app.use(passport.initialize());
app.use(passport.session());

app.set('./views', viewsPath);
app.set('view engine', 'ejs');
app.use(express.static('public'));
app.use(express.static('src'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/', r);
app.use('/admin', admin);

function isInvalid(field, errors) {
  return Boolean(errors.find((i) => i.param === field));
}

app.locals.isInvalid = isInvalid;
app.locals.formatDate = formatDate;

function notFoundHandler(error, req, res) {
  res.status(404).render('error', { title: '', titleMessage: '404 Not Found', message: error });
}

function errorHandler(err, req, res, next) { // eslint-disable-line
  // console.error(err);
  const title = ' ';
  const titleMessage = 'Gat ekki skráð!';
  const message = 'Varstu búinn að skrá þig áður?';
  res.status(500).render('error', { title, titleMessage: '', message: err });
}

app.use(notFoundHandler);
app.use(errorHandler);

app.listen(port, () => {
  console.info(`Server running at http://localhost:${port}/`);
});
