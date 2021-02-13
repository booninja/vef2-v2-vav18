import express from 'express';
import dotenv from 'dotenv';
import { router as r } from './form.js';
import { formatDate } from './formatDate.js';

dotenv.config();

const app = express();

const viewsPath = new URL('./views', import.meta.url).pathname;

app.set('./views', viewsPath);
app.set('view engine', 'ejs');
app.use(express.static('public'));
app.use(express.static('src'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/', r);

function isInvalid(field, errors) {
  return Boolean(errors.find((i) => i.param === field));
}

app.locals.isInvalid = isInvalid;
app.locals.formatDate = formatDate;

function notFoundHandler(req, res) {
  res.status(404).render('error', { title: 'Error', message: '404 Not Found' });
}

function errorHandler(err, req, res, next) { // eslint-disable-line
  console.error(err);
  const title = ' ';
  const titleMessage = 'Gat ekki skráð!';
  const message = 'Varstu búinn að skrá þig áður?'
  res.status(500).render('error', { title, titleMessage, message });
}

app.use(notFoundHandler);
app.use(errorHandler);

const {
  PORT: port = 3000,
} = process.env;

// TODO setja upp rest af virkni!

// Verðum að setja bara *port* svo virki á heroku
app.listen(port, () => {
  console.info(`Server running at http://localhost:${port}/`);
});
