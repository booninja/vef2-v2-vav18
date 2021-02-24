import bcrypt from 'bcrypt';

export function catchErrors(fn) {
  return (req, res, next) => fn(req, res, next).catch(next);
}

export async function comparePasswords(password, hash) {
  console.log('password');
  try {
    return await bcrypt.compare(password, hash);
  } catch (e) {
    console.error('Gat ekki borið saman lykilorð', e);
  }

  return false;
}
