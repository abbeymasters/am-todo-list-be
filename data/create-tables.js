const client = require('../lib/client');

run();

async function run() {
    try {
        await client.connect();
        await client.query(`
            CREATE TABLE users (
                id SERIAL PRIMARY KEY,
                email VARCHAR(256) NOT NULL,
                hash VARCHAR(512) NOT NULL
            );           
            CREATE TABLE todos (
                id SERIAL PRIMARY KEY NOT NULL,
                title VARCHAR(512) NOT NULL,
                complete BOOLEAN NOT NULL DEFAULT FALSE,
                user_id INTEGER NOT NULL REFERENCES users(id)
            );
        `);
        
        console.log('finished creating tables');
    }
    catch (err) {
        console.log(err);
    }
    finally {
        client.end();
    }
}
