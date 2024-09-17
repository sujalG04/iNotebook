const mongoose = require('mongoose')
const mongoURL = 'mongodb://localhost:27017/inotebook';
const connectToMongo = ()=>{
    mongoose.connect(mongoURL);
    console.log('successfully connected to Database');
}

module.exports = connectToMongo;