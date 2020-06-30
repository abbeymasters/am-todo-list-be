require('dotenv').config();
const cors = require('cors');
const express = require('express');
const morgan = require('morgan');
const client = require('./lib/client');

client.connect();

const app = express();
const PORT = process.env.PORT;

app.use(morgan('dev'));
app.use(cors());
app.use(express.static('public'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const createAuthRoutes = require('./lib/auth/create-auth-routes');
const authRoutes = createAuthRoutes({
    selectUser(email) {
        return client.query(`
    SELECT id, email, hash
    FROM users
    WHERE email = $1
    `,
        [email]
        ).then(result => result.rows[0]);
    },
    insertUser(user, hash) {
        return client.query(`
        INSERT into users (email, hash)
        VALUES ($1, $2)
        RETURNING id, email;
      `,
        [user.email, hash]
        ).then(result => result.rows[0]);
    }
});

app.use('/api/auth', authRoutes);

const ensureAuth = require('./lib/auth/ensure-auth');
app.use('/api', ensureAuth);

app.get('/api/todos', async (req, res) => {
    try {
        const result = await client.query(`
        SELECT * FROM todos
        WHERE user_id = $1
        ORDER BY id ASC;
      `, [req.userId]);
        res.json(result.rows);
    }
    catch (err) {
        console.log(err);
        res.status(500).json({
            error: err.mssage || err
        });
    }
});

app.post('/api/todos', async (req, res) => {
    const todo = req.body.title;
    try {
        const result = await client.query(`
        INSERT INTO todos
        (title, complete, user_id)
        VALUES ($1, false, $2)
        RETURNING *
        `, [todo, req.userId]);
        res.json(result.rows[0]);
    }
    catch (err) {
        console.log(err);
        res.status(500).json({
            error: err.message || err
        });
    }
});

app.put('/api/todos/:id', async (req, res) => {
    try {
        const result = await client.query(`
          UPDATE todos
          SET complete = $1
          WHERE id = $2
          AND user_id = $3;
        `, [req.body.complete, req.params.id, req.userId]);
        res.json(result.rows[0]);
    }
    catch (err) {
        console.log(err);
        res.status(500).json({
            error: err.message || err
        });
    }
});

app.listen(PORT, () => {
    console.log('server running on PORT', PORT);
});
