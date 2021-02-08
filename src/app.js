import express from 'express';
import dotenv from 'dotenv';
import { router as r } from './form.js';

const app = express();
dotenv.config();

const viewsPath = new URL('./views', import.meta.url).pathname;

app.set('./views', viewsPath);
app.set('view engine', 'ejs');
app.use(express.static('public'));
app.use(express.static('src'));
app.use('/', r);


const {
  PORT: port = 3000,
} = process.env;

// TODO setja upp rest af virkni!

// Verðum að setja bara *port* svo virki á heroku
app.listen(port, () => {
  console.info(`Server running at http://localhost:${port}/`);
});
