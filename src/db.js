import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const {
  DATABASE_URL: connectionString,
} = process.env;

if (!connectionString) {
  console.error('Vantar DATABASE_URL');
  process.exit(1);
}

const pool = new pg.Pool({ connectionString });

pool.on('error', (err) => {
  console.error('Unexpected error on idle client', err);
  process.exit(-1);
});



export async function query(q, v = []){ 
  const client = await pool.connect();

  try {
    const result = await client.query(q, v);
    // console.log('rows :>> ', result.rows);
    return result.rows;
  } catch (e) {
    console.error('Error selecting', e);
  } finally {
    console.log('final')
    client.release();
  }
}

export async function insert(data) {
  const q = `
INSERT INTO signatures
(name, nationalId, comment)
VALUES
($1, $2, $3)`;
  const values = [data.name, data.nationalId, data.comment ];

  return query(q, values);
}

export async function select() {
  const result = await query('SELECT * FROM signatures ORDER BY id');

  return result;
}

export async function update(id) {
  const q = `
UPDATE applications
SET processed = true, updated = current_timestamp
WHERE id = $1`;

  return query(q, [id]);
}

export async function deleteRow(id) {
  const q = 'DELETE FROM signatures WHERE id = $1';

  return query(q, [id]);
}

