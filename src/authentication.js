import { Strategy } from 'passport-local';
import passport from 'passport';
import { comparePasswords } from './utils.js';
import { findByUsername, findById } from './db.js';

async function strat(username, password, done) {
  try {
    const user = await findByUsername(username);
    console.info('!user', user);
    if (!user) {
      return done(null, false);
    }
    // Verður annað hvort notanda hlutur ef lykilorð rétt, eða false
    const result = await comparePasswords(password, user.password);
    console.info('password compare results: ', result);
    return done(null, result ? user : false);
  } catch (err) {
    console.error(err);
    return done(err);
  }
}

passport.use(new Strategy(strat));

passport.serializeUser((user, done) => {
  console.info('serialize user: ', user);
  done(null, user.id);
});

// Sækir notanda út frá id
passport.deserializeUser(async (id, done) => {
  try {
    const user = await findById(id);
    done(null, user);
  } catch (err) {
    done(err);
  }
});

export function ensureLoggedIn(req, res, next) {
  console.info('is authenticated? ', req.isAuthenticated());
  if (req.isAuthenticated()) {
    return next();
  }

  return res.redirect('/admin/login');
}

export default passport;
