const express = require('express');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

// Routes
const usersRoutes = require('./routes/users');
app.use('/api/users', usersRoutes);

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('[USER-SERVICE] Error:', err);
  res.status(500).json({ error: 'Internal Server Error' });
});

const PORT = process.env.PORT || 3003;
app.listen(PORT, () => {
  console.log(`[USER-SERVICE] running on port ${PORT}`);
});
