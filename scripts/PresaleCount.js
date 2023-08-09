const express = require('express');
const Web3 = require('web3').Web3;
const contractABI = require('../ABI/Presale_Private_Contract_ABI.json'); 
const mongoose = require('mongoose');
const PresaleModel = require('../Models/PresaleModel.js');

const app = express();

const providerUrl = 'https://bsc-dataseed.binance.org';
const web3 = new Web3(providerUrl);
const contractAddress = '0x655dEA3a6EC20624088e0a2D4607729814AB22f6'; // Replace with your contract address
const contract = new web3.eth.Contract(contractABI, contractAddress);

const mongoUrl = 'mongodb+srv://kiranjhaspearmint:C3QsAF5t1y21OX7n@cluster0.hmitvuc.mongodb.net/?retryWrites=true&w=majority'; // Replace with your MongoDB URL
mongoose.connect(mongoUrl, { useNewUrlParser: true, useUnifiedTopology: true });
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));

function convertBigIntToString(obj) {
    if (typeof obj === 'object' && obj !== null) {
      if (Array.isArray(obj)) {
        return obj.map(convertBigIntToString);
      } else {
        const newObj = {};
        for (const key in obj) {
          newObj[key] = convertBigIntToString(obj[key]);
        }
        return newObj;
      }
    } else if (typeof obj === 'bigint') {
      return obj.toString();
    } else {
      return obj;
    }
}

app.get('/', async (req, res) => {
  res.json({ message: 'Welcome to the Presale API!' });
});
app.get('/getPresaleCount', async (req, res) => {
    try {
        const count = await contract.methods.getPresaleCount().call();
        res.json({ count: Number(count) });
    } catch (error) {
        res.status(500).json({ error: 'Error calling function' });
    }
});

app.get('/getPresale/:id', async (req, res) => {
    const id = req.params.id;
    try {
      const count = await contract.methods.getPresaleCount().call();
      const presaleCount = Number(count);
      if (id >= presaleCount) {
        return res.status(400).json({ error: 'Invalid ID. The provided ID is greater than or equal to the presale count.' });
      }
      // Check if the ID already exists in the database
      const existingData = await PresaleModel.findOne({ id });
      if (existingData) {
        return res.json({ success: false, message: 'Presale data already exists in the database.', data: existingData.data });
      }
      const result = await contract.methods.getPresale(id).call();
      const convertedResult = convertBigIntToString(result); 

      // Save the data in MongoDB
      const presaleData = new PresaleModel({ id, data: convertedResult });
      await presaleData.save();
      console.log("data saved");

      res.json({ success: true, message: 'Presale data saved successfully.', data: convertedResult });
    } catch (error) {
      res.status(500).json({ error: 'Error calling function' });
    }
  });
// Start the server
const port = 3000; 
app.listen(port, () => {
  console.log(`Server started on http://localhost:${port}`);
});