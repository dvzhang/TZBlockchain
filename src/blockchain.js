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
// FirstBlock
const initBlock = {
    index: 0,
    data: 'Hello woniu-chain!',
    prevHash: '0',
    timestamp: 1667847820620,
    nonce: 312,
    hash: '0099943b70f941a9a75b3b28cd839f4755e85be8b80fa6ec428bc53ec0c8df34'
}
class Blockchain {
    constructor() {
        this.blockchain = [initBlock]
        this.data = []
        this.difficulty = 2
        // const hash = this.computeHash(0, '0', new Date().getTime(), 'Hello FZ-chain', 1)
        const hash = this.computeHash(0, '0', 1667847820620, 'Hello FZ-chain', 1)
        console.log(hash)
    }

    // get the newest block
    getLastBlock() {
        return this.blockchain[this.blockchain.length - 1]
    }

    mine() {
        const newBlock = this.generateNewBlock()
        // check whether this block is correct
        if (this.isValidaBlock(newBlock) && this.isValidChain(this.blockchain)) {
            this.blockchain.push(newBlock)
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

let bc = new Blockchain()
bc.mine()
bc.blockchain[1].nonce = 22
bc.mine()
bc.mine()
bc.mine()
bc.mine()

console.log(bc)