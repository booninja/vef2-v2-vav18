import faker from 'faker';
import { query } from './db.js';

// Faker
async function insert(data) {
  const q = `
INSERT INTO signatures
(name, nationalId, comment, anonymous, signed)
VALUES
($1, $2, $3, $4, $5)`;
  return query(q, data);
}

export function fakeSignatures() {
  const randName = faker.name.findName();
  const randSent = faker.lorem.sentence();
  let datenew = new Date();
  let dateold = new Date(datenew -12096e5);
  let randDate = new Date(faker.date.between(dateold, datenew));
  const randKennitala = Math.random().toString().slice(2, 12);
  const randAnon = Math.random() <= 0.5;

  const data = [randName, randKennitala, randDate, randSent, randAnon];
  // console.info(data);
  return data;
}

fakeSignatures();
