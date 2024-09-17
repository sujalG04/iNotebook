const connectToMongo = require('./database');
const express = require('express');
const cors = require('cors');

connectToMongo();

const app = express();
app.use(cors());
const port = 5000
app.use(express.json())
// Available Routes
app.get('/', (req, res) => {
  res.send('hello iNotebook')
})
app.use('/api/auth', require('./routes/auth'))
app.use('/api/note', require('./routes/note'))

app.listen(port, () => {
  console.log(`iNotebook app listening at ${port}`)
})
