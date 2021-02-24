/* eslint-disable import/no-extraneous-dependencies */
/* eslint-disable no-underscore-dangle */
import express from 'express';
import { catchErrors } from './utils.js';
import { select, deleteRow } from './db.js';
import passport, { ensureLoggedIn } from './authentication.js';

export const router = express.Router();

async function admin(req, res) {
  if (req.isAuthenticated()) {
    return res.redirect('/admin/login');
  }

  let { page = 1 } = req.query;
  page = Number(page);

  const PAGE_SIZE = 50;
  const offset = (page - 1) * PAGE_SIZE;
  const rows = await select(offset, PAGE_SIZE);

  const result = {
    _links: {
      self: {
        href: `/admin/?page=${page}`,
      },
    },
    items: rows,
  };

  if (offset > 0) {
    result._links.prev = {
      href: `/admin/?page=${page - 1}`,
    };
  }

  if (rows.length <= PAGE_SIZE) {
    result._links.next = {
      href: `/admin/?page=${page + 1}`,
    };
  }

  const data = {
    result: rows,
    paging: result._links,
    page,
    title: 'Undirskriftarlisti - umsjón',
    name: '',
    comment: '',
    nationalId: '',
    anonymous: false,
    errors: [],
  };

  return res.render('admin', data);
}

async function login(req, res) {
  if (req.isAuthenticated()) {
    return res.redirect('/admin');
  }

  let message = '';

  if (req.session.messages && req.session.messages.length > 0) {
    message = req.session.messages.join(', ');
    console.info('login session message: ', req.session.messages);
    req.session.messages = [];
  }
  console.info(message);

  return res.render('login', { title: 'Innskráning', message });
}

/**
 * Route til að eyða umsókn, tekur við `id` í `body` og eyðir.
 * Aðeins aðgengilegt fyrir admin.
 *
 * @param {object} req Request hlutur
 * @param {object} res Response hlutur
 */
async function deleteSignature(req, res) {
  const { id } = req.body;

  await deleteRow([id]);

  return res.redirect('/admin');
}

router.get('/', ensureLoggedIn, catchErrors(admin));
router.get('/login', catchErrors(login));
router.post('/delete', catchErrors(deleteSignature));
router.get('/:data', catchErrors(admin));

router.get('/logout', (req, res) => {
  req.logout();
  res.redirect('/');
});

router.post(
  '/login',
  passport.authenticate('local', {
    failureMessage: 'Notandi eða lykilorð vitlaust.',
    failureRedirect: '/admin/login',
  }),

  (req, res) => {
    res.redirect('/admin');
  },
);
