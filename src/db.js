import dotenv from 'dotenv';
import pg from 'pg';

dotenv.config();

const {
  DATABASE_URL: connectionString,
  NODE_ENV: nodeEnv = 'development',
} = process.env;

if (!connectionString) {
  console.error('Vantar DATABASE_URL');
  process.exit(1);
}

const ssl = nodeEnv !== 'development' ? { rejectUnauthorized: false } : false;

const pool = new pg.Pool({ connectionString, ssl });

pool.on('error', (err) => {
  console.error('Unexpected error on idle client', err);
  process.exit(-1);
});

export async function query(q, v = []) {
  const client = await pool.connect();

  try {
    const result = await client.query(q, v);
    return result.rows;
  } catch (e) {
    throw new Error(e);
  } finally {
    client.release();
  }
}

export async function insert(data) {
  const q = `
INSERT INTO signatures
(name, nationalId, comment, anonymous)
VALUES
($1, $2, $3, $4)`;
  const values = [data.name, data.nationalId, data.comment, data.anonymous];

  return query(q, values);
}

export async function select(offset = 0, limit = 50) {
  try {
    const q = 'SELECT * FROM signatures ORDER BY signed DESC, id OFFSET $1 LIMIT $2 ';
    const result = await query(q, [offset, limit]);

    return result;
  } catch (e) {
    console.error('Error selecting', e);
  }
  return null;
}

export async function selectAll() {
  try {
    const q = 'SELECT COUNT(*) FROM signatures';
    const result = await query(q);

    return result;
  } catch (e) {
    console.error('Error selecting', e);
  }
  return null;
}

export async function deleteRow(id) {
  const q = 'DELETE FROM signatures WHERE id = $1';

  return query(q, id);
}

// Users
export async function findById(id) {
  const q = 'SELECT * FROM users WHERE id = $1';

  try {
    const result = await query(q, [id]);

    if (result.length === 1) {
      return result[0];
    }
  } catch (e) {
    console.error('Gat ekki fundið notanda eftir id');
  }

  return null;
}

export async function findByUsername(username) {
  const q = 'SELECT * FROM users WHERE username = $1';

  try {
    const result = await query(q, [username]);
    return result[0];
  } catch (e) {
    console.error('Gat ekki fundið notanda eftir notendnafni');
    return null;
  }
}
