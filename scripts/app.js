const express = require('express');
const Web3 = require('web3').Web3;
const mongoose = require('mongoose');
const Presale = require('../Models/PresaleSchema.js'); // Adjust the path to your model
const cors = require('cors');

const app = express();
const PORT = 3000;
app.use(cors({
  origin: '*'
}));

// Connect to MongoDB

const mongoUrl = "mongodb+srv://kiranjhaspearmint:C3QsAF5t1y21OX7n@cluster0.hmitvuc.mongodb.net/?retryWrites=true&w=majority";
mongoose.connect(mongoUrl, { useNewUrlParser: true, useUnifiedTopology: true });
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));

app.get('/', async (req, res) => {
  res.json({ message: 'Welcome to the Presale API!' });
});

app.get('/api/update', async (req, res) => {
  try {
    const RPC_URL = 'https://bsc-dataseed.binance.org'; // Adjust the RPC URL
    const SALE_ABI = require('../ABI/Presale_Private_Contract_ABI.json'); // Adjust the path to your ABI file
    const sale_address = '0x655dEA3a6EC20624088e0a2D4607729814AB22f6'; // Adjust the contract address 
    //  0x03bbed798937Fc75CA0c96f4FbCf7F701aa7De9b
    //  0x655dEA3a6EC20624088e0a2D4607729814AB22f6
    let _web3 = new Web3(RPC_URL);
    let _privateSaleContract = new _web3.eth.Contract(SALE_ABI, sale_address);
    let _arraylength = await _privateSaleContract.methods.getPresaleCount().call();
    let _arrayLength = Number(_arraylength);
    console.log("_arrayLength ----> ",_arrayLength);

    let _upcomingArray = [];
    let _liveArray = [];
    let _successArray = [];
    let _failArray = [];

     
    const preSaleCalls = []
    for (let i = 0; i < _arrayLength; i++) {
        preSaleCalls.push(_privateSaleContract.methods.getPresale(i).call());    
    }
    
    const totalPresaleData = await Promise.all(preSaleCalls);
    console.log("totalPresaleData", totalPresaleData.length);

    for (let i = 0; i < totalPresaleData.length; i++) {

        console.log(">>>>>>>>------------<<<<<<<<<");

        const _presale = totalPresaleData[i];
        // console.log("presaleINfo", i, _presale);
        const preSaleStatus = Number(_presale.status);
        const preSaleStartTime = Number(_presale.startTime);

        console.log("status", preSaleStatus);
        console.log("time", preSaleStartTime);

      if (preSaleStatus == 1 && preSaleStartTime > parseInt(Date.now()/1000)) {
        _upcomingArray.push(i);
      } else if (preSaleStatus == 1 && preSaleStartTime < parseInt(Date.now()/1000)) {
        _liveArray.push(i);
      } else if ([2, 4, 5, 6].includes(preSaleStatus)) {
        _successArray.push(i);
      } else if (preSaleStatus == 3 && _presale.raisedAmount > 0) {
        _failArray.push(i);
      }

     
    //   if (i == (totalPresaleData.length - 1)) {
    //     if (_upcomingArray.length > 0) {
    //       const upcoming = await WIO_Wizard.updateMany({ key: "_upcoming" }, { value: _upcomingArray.reverse().join(",") });
    //       console.log("upcoming data ",upcoming);
    //     }

    //     if (_liveArray.length > 0) {
    //       const live = await WIO_Wizard.updateMany({ key: "_live" }, { value: _liveArray.reverse().join(",") });
    //       console.log("live data ",live);
    //     }

    //     if (_successArray.length > 0) {
    //       const success = await WIO_Wizard.updateMany({ key: "_success" }, { value: _successArray.reverse().join(",") });
    //       console.log("succrss  data ",success);
    //     }

    //     if (_failArray.length > 0) {
    //       await WIO_Wizard.updateMany({ key: "_fail" }, { value: _failArray.reverse().join(",") });
    //     }

    //     res.json({ message: 'Data updated successfully.' });
    //   }

    // return res.json({succ: true})
    }

    console.log("_upcomingArray", _upcomingArray);
    console.log("_liveArray", _liveArray);
    console.log("_successArray", _successArray);
    console.log("_failArray", _failArray);
    // const presaleData = new PresaleModel({ preSaleType:"upComingSales", _upcomingArray });
    //       await presaleData.save();
    //       console.log("data saved");

    const upComingSales = await Presale.findOne({preSaleType: "upComingSales"});
    if (upComingSales) {
        const oldSale = upComingSales.preSales;
        const mergeSales = new Set([...oldSale, ..._upcomingArray])
        console.log("mergeSales", mergeSales);
        upComingSales.preSales = Array.from(mergeSales)
        await upComingSales.save()
    }
    else {
        const preSaleData = {
            preSaleType: "upComingSales",
            preSales: _upcomingArray
        }
        await Presale.create(preSaleData)
    }

    const liveSales = await Presale.findOne({preSaleType: "liveSales"});
    if (liveSales) {
        const oldSale = liveSales.preSales;
        const mergeSales = new Set([...oldSale, ..._liveArray])
        console.log("mergeSales", mergeSales);
        liveSales.preSales = Array.from(mergeSales)
        await liveSales.save()
    }
    else {
        const preSaleData = {
            preSaleType: "liveSales",
            preSales: _liveArray
        }
        await Presale.create(preSaleData)
    }

    const successSales = await Presale.findOne({preSaleType: "successSales"});
    if (successSales) {
        const oldSale = successSales.preSales;
        const mergeSales = new Set([...oldSale, ..._successArray])
        console.log("mergeSales", mergeSales);
        successSales.preSales = Array.from(mergeSales)
        await successSales.save()
    }
    else {
        const preSaleData = {
            preSaleType: "successSales",
            preSales: _successArray
        }
        await Presale.create(preSaleData)
    }

    const failSales = await Presale.findOne({preSaleType: "failSales"});
    if (failSales) {
        const oldSale = failSales.preSales;
        const mergeSales = new Set([...oldSale, ..._failArray])
        console.log("mergeSales", mergeSales);
        failSales.preSales = Array.from(mergeSales)
        await failSales.save()
    }
    else {
        const preSaleData = {
            preSaleType: "failSales",
            preSales: _failArray
        }
        await Presale.create(preSaleData)
    }

    return res.json({message: "Uptodate"});

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/api/upcomingSales', async(req,res) => {

  const upComingSales = await Presale.findOne({preSaleType: "upComingSales"});
  if (upComingSales) {
    console.log("length - ",upComingSales.preSales.length);
      return res.json({presale: upComingSales.preSales});
  } else {
      return res.json({message: "NOT FOUND"});
  }

})

app.get('/api/liveSales', async(req,res) => {

  const liveSales = await Presale.findOne({preSaleType: "liveSales"});
    if (liveSales) {
      console.log("length - ",liveSales.preSales.length);
        return res.json({presale: liveSales.preSales});
    } else {
        return res.json({message: "NOT FOUND"});
    }

})

app.get('/api/successSales', async(req,res) => {

  const successSales = await Presale.findOne({preSaleType: "successSales"});
    if (successSales) {
      console.log("length - ",successSales.preSales.length);
        return res.json({presale: successSales.preSales});
    } else {
        return res.json({message: "NOT FOUND"});
    }

})

app.get('/api/failSales', async(req,res) => {

  const failSales = await Presale.findOne({preSaleType: "failSales"});
    if (failSales) {
      console.log("length - ",failSales.preSales.length);
        return res.json({presale: failSales.preSales});
    } else {
        return res.json({message: "NOT FOUND"});
    }

})

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
