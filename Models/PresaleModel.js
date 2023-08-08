// models/PresaleModel.js

const mongoose = require('mongoose');

const presaleSchema = new mongoose.Schema({
  id: {
    type: Number,
    required: true,
  },
  data: {
    type: Object,
    required: true,
  },
});

const PresaleModel = mongoose.model('Presale', presaleSchema);

module.exports = PresaleModel;
