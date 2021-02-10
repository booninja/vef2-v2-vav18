import express from 'express';
import xss from 'xss';
import { body, validationResult } from 'express-validator';
import { insert, select } from './db.js';

export const router = express.Router();

router.use(express.urlencoded({ extended: true }));

const nationalIdPattern = '^[0-9]{6}-?[0-9]{4}$';

function catchErrors(fn) {
  return (req, res, next) => fn(req, res, next).catch(next);
}

async function index(req, res)  {
  const result = await select();
  console.log('result: >>', result);
  const name = '', comment='', nationalId = '';
  res.render('index', { result, name, comment, nationalId} );
}


router.post(
    '/',
  
    // Þetta er bara validation, ekki sanitization
    body('name')
      .isLength({ min: 1 })
      .withMessage('Nafn má ekki vera tómt'),
    body('nationalId')
      .isLength({ min: 1 })
      .withMessage('Kennitala má ekki vera tóm'),
    body('comment')
      .isLength({ min: 1 })
      .withMessage('Netfang má ekki vera tómt'),
    body('nationalId')
      .matches(new RegExp(nationalIdPattern))
      .withMessage('Kennitala verður að vera á formi 000000-0000 eða 0000000000'),
  
    (req, res, next) => {
      const {
        name = '',
        comment = '',
        nationalId = '',
      } = req.body;
  
      const errors = validationResult(req);
  
      if (!errors.isEmpty()) {
        const errorMessages = errors.array().map(i => i.msg);
        return catchErrors(index);
      }
  
      return next();
    },
    /* Nú sanitizeum við gögnin, þessar aðgerðir munu breyta gildum í body.req */
    // Fjarlægja whitespace frá byrjun og enda
    // „Escape“ á gögn, breytir stöfum sem hafa merkingu í t.d. HTML í entity
    // t.d. < í &lt;
    body('name').trim().escape(),
    body('email').normalizeEmail(),
  
    // Fjarlægjum - úr kennitölu, þó svo við leyfum í innslátt þá viljum við geyma
    // á normalizeruðu formi (þ.e.a.s. allar geymdar sem 10 tölustafir)
    // Hér gætum við viljað breyta kennitölu í heiltölu (int) en... það myndi
    // skemma gögnin okkar, því kennitölur geta byrjað á 0
    body('nationalId').blacklist('-'),
  
     async (req, res) => {
  
      const {
        name,
        comment,
        nationalId,
      } = req.body;
      await insert({ name, comment, nationalId });
      return catchErrors(index);
    },
  );

router.get('/', catchErrors(index));