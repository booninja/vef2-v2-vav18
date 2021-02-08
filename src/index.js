import pg from 'pg';

// const { Client } = require('pg');

const connectionString = 'postgres://booninja:12345@localhost/v2';

const client = new pg.Pool({ connectionString });
client.connect();

client.on('error', (err) => {
  console.error('Unexpected error on idle client', err);
  process.exit(-1);
});

client.query('SELECT * FROM test;', (err, res) => {
  if (err) {
    console.error(err);
  } else {
    console.log(res.rows);
  }

  client.end();
});