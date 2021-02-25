import express from 'express';
import { catchErrors } from './utils.js';
import { select, deleteRow, selectAll } from './db.js';
import passport, { ensureLoggedIn } from './authentication.js';

export const router = express.Router();

async function admin(req, res) {
  let { page = 1 } = req.query;
  page = Number(page);

  const PAGE_SIZE = 50;
  const offset = (page - 1) * PAGE_SIZE;
  const rows = await select(offset, PAGE_SIZE);
  const count = await selectAll();
  console.log(count)
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
    title: 'Undirskriftarlisti - umsjón1',
    name: '',
    comment: '',
    nationalId: '',
    anonymous: false,
    count: count[0].count,
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

router.use((req, res, next) => {
  // Látum `users` alltaf vera til fyrir view
  res.locals.user = req.isAuthenticated() ? req.user : null;
  next();
});

router.get('/', ensureLoggedIn, catchErrors(admin));
router.get('/login', catchErrors(login));
router.post('/delete', ensureLoggedIn, catchErrors(deleteSignature));
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
