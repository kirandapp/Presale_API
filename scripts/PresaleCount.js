const Web3 = require('web3').Web3;
const contractABI = require('../ABI/Presale_Private_Contract_ABI.json'); 
const contractAddress = `0x655dEA3a6EC20624088e0a2D4607729814AB22f6`;
const providerUrl = `https://bsc-dataseed.binance.org`;
const privateKey = `0x668af6677a1198e3c6f9d7ba24385d17e78e8f32a1faa116f6f61df19e3f4067`;

const web3 = new Web3('https://bsc-dataseed.binance.org');
const contract = new web3.eth.Contract(contractABI, contractAddress);
web3.eth.accounts.wallet.add(privateKey);
const account = web3.eth.accounts.privateKeyToAccount(privateKey);
web3.eth.defaultAccount = account.address;

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

async function callContractFunction() {
  try {
    const result = await contract.methods.getPresaleCount().call();
    console.log('\nFunction called successfully:', Number(result));
    const saleOfId = await contract.methods.getPresale(1).call();
    console.log(convertBigIntToString(saleOfId));
  } catch (error) {
    console.error('Error calling function:', error);
  }
}

callContractFunction();