const vorpal = require('vorpal')();
const Blockchain = require('./blockchain');
const blockchain = new Blockchain();
const Table = require('cli-table')
const rsa = require('./rsa')


// [{name:TZ, age:18}]
function formatLog(data) {
  if (!Array.isArray(data)) {
    data = [data]
  }
  const first = data[0]
  const head = Object.keys(first)
  var table = new Table({
    head: head
    , colWidths: [7, 20, 10, 15, 7, 15]
    // , colWidths: new Array(head.length).fill(20)
  });
  const res = data.map(v => {
    return head.map(h => JSON.stringify(v[h], null, 2))
  })

  table.push(...res);
  console.log(table.toString());
}


vorpal
  .command('hello', 'say "Hi" to TZChain')
  .action(function (args, callback) {
    console.log("hello blockchain")
    callback();
  });

// vorpal
//   .command('trans <from> <to> <amount>', "transfer")
//   .action(function (args, callback){
//   let trans = blockchain.transfers(args.from, args.to, args.amount)
//   if (trans){
//     formatLog(trans)
//   }
//   // if not callback, it will exit directly
//   callback();
// });


vorpal
  .command('trans <to> <amount>', "transfer")
  .action(function (args, callback){
    // use pub key be the from address
  let trans = blockchain.transfers(rsa.keys.pub, args.to, args.amount)
  if (trans){
    formatLog(trans)
  }
  // if not callback, it will exit directly
  callback();
});

vorpal
  .command('detail <index>', 'View the detail of our chain')
  .action(function (args, callback) {
    const block = blockchain.blockchain[args.index]
    this.log(JSON.stringify(block, null, 2))    
    callback();
  });

vorpal
  .command('blance <address>', 'View the balance of an account')
  .action(function (args, callback) {
    const blance = blockchain.blance(args.address)
    if (blance){
      formatLog({blance, address:args.address})      
    }
    callback();

  });

// vorpal
//   .command('mine <address>', 'mine a block')
//   .action(function (args, callback) {
//     const newBlock = blockchain.mine(args.address)
//     if (newBlock) {
//       formatLog(newBlock)
//     }
//     callback();
//   });

vorpal
  .command('mine', 'mine a block')
  .action(function (args, callback) {
    const newBlock = blockchain.mine(rsa.keys.pub)
    if (newBlock) {
      formatLog(newBlock)
    }
    callback();
  });

vorpal
  .command('chain', 'View our chain')
  .action(function (args, callback) {
    formatLog(blockchain.blockchain)
    callback();
  });

vorpal
  .command('pub', 'View our address')
  .action(function (args, callback) {
    console.log(rsa.keys.pub)
    callback();
  });


console.log("welcome to TZChain")
vorpal.exec('help')
vorpal.delimiter('TZChain ==>')
  .show();




// // instantiate
// var table = new Table({
//     head: ['TH 1 label', 'TH 2 label']
// , colWidths: [10, 20]
// });

// // table is an Array, so you can `push`, `unshift`, `splice` and friends
// table.push(
//     ['First value', 'Second value']
// , ['First value', 'Second value']
// );

// console.log(table.toString());