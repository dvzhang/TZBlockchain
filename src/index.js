const vorpal = require('vorpal')();
const Blockchain = require('./blockchain');
const blockchain = new Blockchain();
const Table = require('cli-table')

// [{name:TZ, age:18}]
function formatLog(data){
    if (!Array.isArray(data)){
        data = [data]
    }
    const first = data[0]
    const head = Object.keys(first)
    var table = new Table({
        head: head
    , colWidths: [7, 20, 10, 15, 7, 15]
    // , colWidths: new Array(head.length).fill(20)
    });
    const res = data.map(v=>{
        return head.map(h=>v[h])
    })

    table.push(...res);
    console.log(table.toString());
}


vorpal
  .command('hello', 'say "Hi" to TZChain')
  .action(function(args, callback) {
    console.log("hello blockchain")
    callback();
  });

vorpal
  .command('mine', 'mine a block')
  .action(function(args, callback) {
    const newBlock = blockchain.mine()
    if (newBlock){
        formatLog(newBlock)
    }
    callback();
  });

vorpal
  .command('chain', 'see our chain')
  .action(function(args, callback) {
    formatLog(blockchain.blockchain)
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