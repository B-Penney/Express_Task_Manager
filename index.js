const express = require('express');
const app = express();
const PORT = 3000;
const { Pool } = require('pg');

app.use(express.json());

// PostgreSQL Connection
const pool = new Pool({
    user: 'postgres',
    host: 'localhost',
    database: 'ExpressTaskManager',
    password: 'password',
    port: 5432,
});

// Create a table function
async function createTable() {
    try {
        await pool.query(
            `CREATE TABLE IF NOT EXISTS tasks (
            id SERIAL PRIMARY KEY,
            description TEXT NOT NULL,
            status TEXT NOT NULL
            );`
        );
        console.log("Task table has been created successfully");
    } catch (error) {
        console.error("Invalid table:", error);
    }
}
createTable();

// GET /tasks - Get all tasks
app.get('/', (req, res) => {
    res.redirect('/tasks');
});

app.get('/tasks', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM tasks');
        res.json(result.rows);
    } catch (error) {
        console.log(error);
        res.status(500).send('Server Error, Please Try Again');
    }
});

// POST /tasks - Add a new task
app.post('/tasks', async (req, res) => {
    const { description, status } = req.body;

    if (!description || !status) {
        return res.status(400).json({ error: 'Please fill all required fields' });
    }

    try {
        await pool.query(
            'INSERT INTO tasks (description, status) VALUES ($1, $2) RETURNING *',
            [description, status]
        );
        res.status(201).json({ message: 'Task has been added' });
    } catch (error) {
        console.log(error);
        res.status(500).send('Server Error, Please Try Again');
    }
});

// PUT /tasks/:id - Update a task's status
app.put('/tasks/:id', async (req, res) => {
    const taskId = parseInt(req.params.id, 10);
    const { status } = req.body;

    try {
        const result = await pool.query(
            'UPDATE tasks SET status = $1 WHERE id = $2 RETURNING *',
            [status, taskId]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Task does not exist' });
        }

        res.json({ message: 'Task has been updated' });
    } catch (error) {
        console.log(error);
        res.status(500).send('Server Error, Please Try Again');
    }
});

// DELETE /tasks/:id - Delete a task
app.delete('/tasks/:id', async (req, res) => {
    const taskId = parseInt(req.params.id, 10);

    try {
        const result = await pool.query(
            'DELETE FROM tasks WHERE id = $1 RETURNING *',
            [taskId]
        );
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Task does not exist' });
        }
        res.json({ message: 'Task has been deleted successfully' });
    } catch (error) {
        console.log(error);
        res.status(500).send('Server Error, Please Try Again');
    }
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
