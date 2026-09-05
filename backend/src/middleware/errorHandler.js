<<<<<<< HEAD
export const notFound = (req, res, next) => {
  res.status(404).json({ message: `Route not found: ${req.method} ${req.originalUrl}` });
};

// eslint-disable-next-line no-unused-vars
export const errorHandler = (err, req, res, next) => {
  console.error(err);

  // Postgres unique violation (e.g. duplicate email)
  if (err.code === '23505') {
    return res.status(409).json({ message: 'An account with this email already exists.' });
  }

  const status = err.status || 500;
  const message = err.expose ? err.message : status === 500 ? 'Internal server error.' : err.message;
  res.status(status).json({ message });
};
=======
export const notFound = (req, res, next) => {
  res.status(404).json({ message: `Route not found: ${req.method} ${req.originalUrl}` });
};

// eslint-disable-next-line no-unused-vars
export const errorHandler = (err, req, res, next) => {
  console.error(err);

  // Postgres unique violation (e.g. duplicate email)
  if (err.code === '23505') {
    return res.status(409).json({ message: 'An account with this email already exists.' });
  }

  const status = err.status || 500;
  const message = err.expose ? err.message : status === 500 ? 'Internal server error.' : err.message;
  res.status(status).json({ message });
};
>>>>>>> 16840363 (Payment Updated)
