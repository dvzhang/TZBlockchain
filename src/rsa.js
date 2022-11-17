const fs = require('fs')
const { callbackify } = require('util')
const EC = require('elliptic').ec

// 1. generate public, private key
const ec = new EC('secp256k1')
// Generate keys
let keypair = ec.genKeyPair()
keys = generateKeys()

function generateKeys () {
  const fileName = './wallet.json'
  try {
    const res = fs.readFileSync(fileName)
    if (res.prv && res.pub && getPub(res.prv) === res.pub) {
      keypair = ec.keyFromPrivate(res.prv)
      return res
    } else {
      throw new Error()
    }
  } catch (error) {
    // the content of the file is not correct
    // generate a new file
    const res = {
      prv: keypair.getPrivate('hex').toString(),
      pub: keypair.getPublic('hex').toString()
    }
    fs.writeFileSync(fileName, JSON.stringify(res))
    return res
  }
}

function sign ({ from, to, amount, timestamp }) {
  const bufferMsg = Buffer.from(`${from}-${to}-${amount}-${timestamp}`)
  const signature = Buffer.from(keypair.sign(bufferMsg).toDER()).toString('hex')
  return signature
}

function getPub (prv) {
  // calculate public key by private key
  return ec.keyFromPrivate(prv).getPublic('hex').toString()
}

function verify ({ from, to, amount, timestamp, signature }, pub) {
  // console.log(from, to, amount, signature, pub)
  console.log({ from, to, amount, signature })
  console.log(pub)

  const keypairTemp = ec.keyFromPublic(pub, 'hex')
  const bufferMsg = Buffer.from(`${from}-${to}-${amount}-${timestamp}`)

  return keypairTemp.verify(bufferMsg, signature)
}

module.exports = { sign, verify, keys }

// const trans = {from:'a', to:'b', amount:100}
// const signature = sign(trans)
// trans.signature = signature
// console.log(signature)
// const isVerify = verify(trans, keys.pub)
// console.log(isVerify)

// 2. use public key be the address
