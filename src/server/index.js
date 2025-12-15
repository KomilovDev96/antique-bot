const express = require('express');
const adminRoutes = require('./routes/admin.routes');
const postRoutes = require('./routes/posts.routes');

const setupServer = (app) => {
  app.use(express.json());

  app.use('/admin', adminRoutes);
  app.use('/posts', postRoutes);

  app.get('/', (req, res) => {
    res.send('API is running...');
  });

  // Basic error handling
  app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Something broke!');
  });
};

module.exports = setupServer;




