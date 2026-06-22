const postgres = require('postgres');
require('dotenv').config({path: '../../.env'});
const sql = postgres(process.env.DATABASE_URL);

async function run() {
  try {
    await sql`ALTER TABLE contracts RENAME COLUMN setup_preis_netto TO setup_preis_brutto;`;
    await sql`ALTER TABLE contracts RENAME COLUMN laufend_preis_netto TO laufend_preis_brutto;`;
    console.log('Renamed columns successfully!');
  } catch (err) {
    console.error('Error:', err.message);
  } finally {
    await sql.end();
  }
}
run();
