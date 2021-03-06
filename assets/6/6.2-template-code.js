'use strict'
const PeerInfo = require('peer-info')

const util = require('util');

const { createLibp2p } = require('libp2p')

const TCP = require('libp2p-tcp')
const WS = require('libp2p-websockets')
const WStar = require('libp2p-webrtc-star')
const Wrtc = require('wrtc')

const multiaddr = require('multiaddr')

const Mplex = require('pull-mplex')
const Secio = require('libp2p-secio')

const Bootstrap = require('libp2p-bootstrap')
const MDNS = require('libp2p-mdns')
const KadDHT = require('libp2p-kad-dht')

// TODO: change this include pubsub chat class as Pubsubchat
const Chat = require('./5.0-finished-code.js')

const WebrtcStar = new WStar({ wrtc: Wrtc })

const isBootstrap = process.argv[2] == '--bootstrap' 

const info = {
  "id": "QmWjz6xb8v9K4KnYEwP5Yk75k5mMBCehzWFLCvvQpYxF3d",
  "privKey": "CAASpwkwggSjAgEAAoIBAQDKNKwPX4DJhYdGreAVaJy+efhIfbyczR0Mfyi/JfzszY9INH83Veo2s/yOKv+YOP4y7OWpkXL5G6K8fLgxwq5gtTc78W07uz5ZUrxfOT0R4QJuiiQHjQSxYKw08yLIP9JaR2ztL46DOO/Nvzl9gCWHGsAb+w+RLWa0R0SRyvaDiw8aZW9G70yYTGF/SPkEoYN26sioVDwppmKxZ9mTuKsujG0AGAMVPnmjhDI5WmBD3gnOiqCECqlgxl29Qlc1fCIbojcUVE9eWFWassFLicGdo/iMacsVvoTav9JvHZsMvg1HXeK0khQWluCUfdcR6coijDMDWBa77dTI6+b2ybZXAgMBAAECggEALk4hmOOl+oA5mlX3Gu/59SS5VuB0cPQH0vTLv/pTEWeBiGd9Oo7SM/TDwUrXfWSP0dmuPkawrZtGiSOGit6qUDsviuqeuS8H+CyaNrRE5/M/O1EnLxN8H6KjzPxg2rrC0SnKKAbb+/Dt+Y/w+mx+K5JUrBOyXOyouGAZs8lm6nhlL4nelNh2hez0Rp9RFlCokk8aldHCJVUbUP3AwOtVqYJNttSofq4jvnXvUX8Kgb9WjGaZANoQNH+zn6rM2OvmDcxQvnxbKtAgBEu7O60kAdGtpw+JGvj1E5f+iuNlK+GYvYbpDhSt1bRfTMsHxRFxJ2V7vDSDqTLdxUfahI+WAQKBgQD6PUBSYOY151h3iBHqqJJ4sYQ/rUbs3/9QDZRKsxj/gC0vZFQHTVfLHiY2qUikjoMnTy+t1L/ot919ZM5XqOwjZ3oodtjRa3orWKUwGQElORxZQPCPz268GIU+DKSyE5ieBqGMdB3uOZ7oHKODc1a9HiDApux8C3Vwde0oMZcp3wKBgQDO3Feipt7dZ8AoZ1MJE/pRrhJBZDBhc9TpmQccRfG1JpgocA7GgRnzFQgM5yi6DrSIx3SCqPZm5K5VKqEW9PEsHbyNEPo8U0oOnhmVcBIrJe8Rf+wg5R3WvIwlh454ROchNl7iuJPgXTQzZjWtaKbeMm4fXTweRr0Mk9q5GaFyiQKBgC6tuE7llmvdsMnzTuxH77Kl4naCWyWajySes9fPWs1mWodpnqcSDVttT1GI+G0BzINLqSgy9G1zxtQ6NqdxckMUbVwY907xToPBcGbtcyI/agNYMseQuSZLKKevchVpxGFN+Vqa2m5yvyqrFPFTVY3HjfKB8MEe3hRRWyDRR1JfAoGAJV/4UYH26GfzdxlcDlrWsmVSFRCGEUV9ZYtplnkot8M2YLAGa2UuDBZzsukdGajIg6IN8gGXK3YL7YVbP6uX25Gv3IkBvV6LFeMI2lA6aCNdc3r6beMXphHA/JLmceJ5JC4PrMUOqs4MPXEtJ5yt8Z2I+g+9afb790bLkQAJhIkCgYEAzyYCF47U+csbRzGb/lszRwg1QvGtTvzQWuNAcAKclCuN7xplJJ+DUyvVA00WCz/z8MMa/PK8nB0KoUDfuFvo8bbNEAPcGK0l/He7+hF4wdm4S8fX22up5GgJUdV/dv8KZdE2U7yIU/i8BKw6Z3vJB7RB900yfjt56VlgsKspAB0=",
  "pubKey": "CAASpgIwggEiMA0GCSqGSIb3DQEBAQUAA4IBDwAwggEKAoIBAQDKNKwPX4DJhYdGreAVaJy+efhIfbyczR0Mfyi/JfzszY9INH83Veo2s/yOKv+YOP4y7OWpkXL5G6K8fLgxwq5gtTc78W07uz5ZUrxfOT0R4QJuiiQHjQSxYKw08yLIP9JaR2ztL46DOO/Nvzl9gCWHGsAb+w+RLWa0R0SRyvaDiw8aZW9G70yYTGF/SPkEoYN26sioVDwppmKxZ9mTuKsujG0AGAMVPnmjhDI5WmBD3gnOiqCECqlgxl29Qlc1fCIbojcUVE9eWFWassFLicGdo/iMacsVvoTav9JvHZsMvg1HXeK0khQWluCUfdcR6coijDMDWBa77dTI6+b2ybZXAgMBAAE="
}

let options = {
    modules: {
        transport: [ TCP, WS, WebrtcStar ],
        connEncryption: [ Secio ],
        streamMuxer: [ Mplex ],
        peerDiscovery: [ Bootstrap, MDNS ],
        dht: KadDHT
    },
    config: {
        peerDiscovery: {
            bootstrap: {
                list: [
                    '/ip4/127.0.0.1/tcp/63785/ipfs/QmWjz6xb8v9K4KnYEwP5Yk75k5mMBCehzWFLCvvQpYxF3d'
                 ]
            },
            dht: {
                enabled: true,
                randomwalk: {
                    enabled: true
                }
            }
        },
        // TODO: modify the config to add exprimental pubsub support
    }
}

// TODO: remove this function as the publish automatically sends message to all nodes subsrcibed to it
async function sendMessageToAll(message, libp2p) {
    message = message.slice(0, -1)
    let peers = libp2p.peerBook.getAllArray()
    peers.forEach(async (peerInfo) => {
        if(!peerInfo.isConnected() || !peerInfo.protocols.has(Chat.PROTOCOL)) return
        libp2p.dialProtocol(peerInfo, Chat.PROTOCOL, (err, stream) => {
            if (err) return console.error('Could not negotiate chat protocol stream with peer', err)
            Chat.send(message, stream)
        })
    })
}


async function main() {
    let peerInfo = await util.promisify(PeerInfo.create)(info);
    if(isBootstrap) options.peerInfo = peerInfo;
    // Create a libp2p instance
    let libp2p = await util.promisify(createLibp2p)(options)

    libp2p.on('start', () => {
        console.info(`Libp2p Started`)
        libp2p.peerInfo.multiaddrs.forEach(ma => console.log(ma.toString()))
    });

    libp2p.on('peer:connect', (peerInfo) => {
        console.info(`Connected to ${peerInfo.id.toB58String()}!`)
    })

    // TODO: create a pubsub chat object and pass libp2p and default topic

    if(isBootstrap) {
        libp2p.peerInfo.multiaddrs.add('/ip4/0.0.0.0/tcp/63785')
        libp2p.peerInfo.multiaddrs.add('/ip4/0.0.0.0/tcp/63786/ws')
    } else {
        libp2p.peerInfo.multiaddrs.add('/ip4/0.0.0.0/tcp/0')
        libp2p.peerInfo.multiaddrs.add('/ip4/0.0.0.0/tcp/0/ws')
    }

    // Handle Message Recieved
    // TODO: remove the handler as we have handler in the pubsub class 
    libp2p.handle(Chat.PROTOCOL, Chat.handler)
    // Send Message on User Input
    // TODO: modify below to call pubsubChat.sendMessage(message) and bind the object
    process.stdin.on('data', message => sendMessageToAll(String(message), libp2p))

    await libp2p.start()
}

main()