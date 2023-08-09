const mongoose = require('mongoose');

const presaleschema = new mongoose.Schema({
   preSaleType: {type: String},
   preSales: [{type: Number}]
});
const Presale = mongoose.model('Presale', presaleschema);
module.exports = Presale;