<<<<<<< HEAD
import 'dotenv/config';
import dotenv from 'dotenv';
import app from './app.js';


dotenv.config();

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Backend server running on http://localhost:${PORT}`);
});
=======
import 'dotenv/config';
import dotenv from 'dotenv';
import app from './app.js';


dotenv.config();

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Backend server running on http://localhost:${PORT}`);
});
>>>>>>> 16840363 (Payment Updated)
