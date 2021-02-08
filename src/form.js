import express from 'express';

export const router = express.Router();

router.get('/', (req, res) => {
    res.render('index');
})

router.get('/get', (req, res) => {
    res.send(`GET gögn: ${req.query.data}`);
  });