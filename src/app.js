import express from 'express';
import dotenv from 'dotenv';
import { router as r } from './form.js';
import {formatDate} from './formatDate.js';
dotenv.config();

const app = express();

const viewsPath = new URL('./views', import.meta.url).pathname;

app.set('./views', viewsPath);
app.set('view engine', 'ejs');
app.use(express.static('public'));
app.use(express.static('src'));
app.use(express.urlencoded({ extended: true }));
app.use('/', r);

function isInvalid(field, errors) {
  return Boolean(errors.find(i => i.param === field));
}

app.locals.isInvalid = isInvalid;
app.locals.formatDate = formatDate
const {
  PORT: port = 3000,
} = process.env;

// TODO setja upp rest af virkni!

// Verðum að setja bara *port* svo virki á heroku
app.listen(port, () => {
  console.info(`Server running at http://localhost:${port}/`);
});
