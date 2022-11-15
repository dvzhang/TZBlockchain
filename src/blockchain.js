// 1.迷你区块链
// 2.区块链的生成，新增，校验
// 3.交易
// 4.非对称加密
// 5.挖矿
// 6.p2p
// 数据结构
// [
//     {
//         index: 索引
//         timestamp: 时间戳
//         data: 区块的具体信息
//         hash：当前的hash
//         prevhash：上一个的hash
//         nonce：随机数
//     }
// ]

const { time } = require('console')
const cryto = require('crypto')
const dgram = require('dgram')
const { read } = require('fs')
const { type } = require('os')
const { listenerCount } = require('process')
const rsa = require('./rsa')

// FirstBlock
const initBlock = {
    index: 0,
    data: 'Hello TZChain!',
    prevHash: '0',
    timestamp: 1667847820620,
    nonce: 312,
    hash: '669a6860808540e07672594490c3e9b922fc9d9ae65605494a29891878e2d1be'
}
class Blockchain {
    constructor() {
        this.blockchain = [initBlock]
        this.data = []
        this.difficulty = 2
        // const hash = this.computeHash(0, '0', new Date().getTime(), 'Hello FZ-chain', 1)
        const hash = this.computeHash(0, '0', 1667847820620, 'Hello TZChain!', 312)
        this.peers = []
        this.seed = {port:8001, address:'localhost'}
        this.udp = dgram.createSocket('udp4')
        this.init()
        console.log(hash)
    }

    init(){
        this.bindP2p()
        this.bindExit()
    }
    bindP2p(){
        // get info from web
        this.udp.on('message', (data, remote) => {
            const {address, port} = remote
            const action = JSON.parse(data)
            // ds of data = {
            //     type: "What's matter?"
            //     data: 
            // }
            if (action.type){
                this.dispatch(action, {address, port})
            }
        })
        this.udp.on('listening', ()=>{
            const address = this.udp.address()
            console.log("[info]: end listening, port: " + address.port)
        })
        // 区分种子节点和普通节点
        console.log(process.argv)
        const port = Number(process.argv[2]) || 0
        this.startNode(port)
    }

    startNode(port){
        this.udp.bind(port)
        // if not seed Node, need to send message to seed node that we are comeing
        if (port !== 8001){
            this.send({
                type: "newpeer"
            }, this.seed.port, this.seed.address)
        }
    }

    send(message, port, address) {
        this.udp.send(JSON.stringify(message), port, address)
    }


    dispatch(action, remote){
        // get message from net
        console.log('get message', action)
        switch(action.type){
            case 'newpeer': 
                // 1. get its ip and port
                // 2. tell it our node list
                // 3. tell all node this newpeer
                // 4. tell newpeer our chain
                
                console.log('Nice to e-meet you!', remote)
                break
            default:
                console.log('I do not know what you mean', remote)
        }
    }

    bindExit(){
        process.on('exit', ()=>{
            console.log('[info]: Bye, see you next time ~')
        })
    }

    // get the newest block
    getLastBlock() {
        return this.blockchain[this.blockchain.length - 1]
    }

    transfers(from, to, amount){
        // check whether the account have enough money
        if (from !== '0'){
            const blance = this.blance(from)
            if (blance < amount){
                console.log('not enough blance', from, blance, amount)
                return
            }
        }

        //transfer
        const trasnObj = {from, to, amount}
        // signature
        const sig = rsa.sign(trasnObj)
        console.log(sig)
        const sigTrans = {from, to, amount, sig}
        this.data.push(sigTrans)
        return sigTrans
    }

    blance(address){
        
        // View an account's balance
        let blance = 0
        this.blockchain.forEach(block=>{
            // pass the init block
            if (!Array.isArray(block.data)){
                return 
            }
            // count the balance
            block.data.forEach(trans=>{
                if (address == trans.from){
                    blance -= trans.amount
                }
                if (address == trans.to){
                    blance += trans.amount
                }
            })
        })
        console.log(blance)
        return blance
    }

    isValidTransfer(trans) {
        // the address is pub key
        return rsa.verify(trans, trans.from)
    }

    // package a transfer
    mine(address) {
        // check if the trans is valid
        // // throw error if there is some transs is not valid
        // if (!this.data.every(v=>this.isValidTransfer(v))){
        //     console.log('trans not valid')
        //     return
        // }
        
        // filter if there is some transs is not valid
        // console.log(this.data)
        this.data = this.data.filter(v => this.isValidTransfer(v))

        // reward to the miner
        this.transfers("0", address, 100)        

        const newBlock = this.generateNewBlock()
        // check whether this block is correct
        if (this.isValidaBlock(newBlock) && this.isValidChain(this.blockchain)) {
            this.blockchain.push(newBlock)
            this.data = []
            return newBlock
        } else {
            console.log("Error, invalid Block")
        }
    }

    generateNewBlock() {
        // 1. generate new block, add to chain
        // 2. calculate hash, until we get the correct hash 
        let nonce = 0
        const index = this.blockchain.length
        const data = this.data
        const prevHash = this.getLastBlock().hash
        let timestamp = new Date().getTime()
        let hash = this.computeHash(index, prevHash, timestamp, data, nonce)
        // if (timestamp == prevHash.timestamp){
        //     console.log(prevHash)
        // }

        while (hash.slice(0, this.difficulty) !== "0".repeat(this.difficulty)) {
            nonce += 1
            hash = this.computeHash(index, prevHash, timestamp, data, nonce)
        }
        return {
            index,
            data,
            prevHash,
            timestamp,
            nonce,
            hash
        }
    }

    computeHash(index, prevhash, timestamp, data, nonce) {
        return cryto.createHash("sha256")
            .update(index + prevhash + timestamp + data + nonce)
            .digest('hex')
    }

    calculateHashForBlock (block) {
        const { index, prevHash, timestamp, data, nonce } = block
        return this.computeHash(
          index,
          prevHash,
          timestamp,
          data,
          nonce
        )
      }

    isValidaBlock(newBlock, lastBlock = this.getLastBlock()) {
        // 1. check index
        if (newBlock.index !== lastBlock.index + 1) {
            console.log("index")

            return false
        }
        // 2. check time
        if (newBlock.timestamp < lastBlock.timestamp) {
            console.log(newBlock.timestamp, lastBlock.timestamp)
            console.log(this.blockchain)
            console.log(newBlock)

            console.log("time")
            return false
        }
        // 3. check previous hash
        if (newBlock.prevHash !== lastBlock.hash) {
            console.log(newBlock.prevHash, lastBlock.hash)
            return false
        }
        // 4. check hash difficulty
        if (newBlock.hash.slice(0, this.difficulty) !== "0".repeat(this.difficulty)) {
            console.log("diff")

            return false
        }
        // 5. check hash
        if (newBlock.hash !== this.calculateHashForBlock(newBlock)){
            return false
        }
        return true
    }

    isValidChain(chain = this.blockchain) {
        // check all block, except init  block
        for (let i = chain.length - 1; i >= 1; i = i - 1) {
            if (!this.isValidaBlock(chain[i], chain[i - 1])) {
                return false
            }
        }

        if (JSON.stringify(chain[0]) !== JSON.stringify(initBlock)) {
            return false
        }
        return true
    }

}

// let bc = new Blockchain()
// bc.mine()
// bc.blockchain[1].nonce = 22
// bc.mine()
// bc.mine()
// bc.mine()
// bc.mine()

// console.log(bc)
// new Blockchain()
module.exports = Blockchain