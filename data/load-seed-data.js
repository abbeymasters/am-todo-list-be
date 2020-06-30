const client = require('../lib/client');
const firstTodo = require('./firstTodo.js');

run();

async function run() {
    try {
        await client.connect();
        await client.query(`
      INSERT INTO users (email, hash)
      VALUES ($1, $2)
    `,
        ['test@testing.com', '12igjowg495']);

        await Promise.all(
            firstTodo.map(todo => {
                return client.query(`
                INSERT INTO todos (title, complete, user_id)
                VALUES ($1, $2, $3);
                `,
                [todo.title, todo.complete, todo.user_id]);
            })
        );
        console.log('seed data loaded into database');
    }
    catch(err) {
        console.log(err);
    }
    finally {
        client.end();
    }
}