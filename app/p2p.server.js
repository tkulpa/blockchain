const Websocket = require('ws');

const PORT = process.env.P2P_PORT || 5001;
const peers = process.env.PEERS ? process.env.PEERS.split(',') : [];

class P2PServer {
    constructor(blockchain) {
        this.blockchain = blockchain;
        this.sockets = [];
    }

    listen() {
        const server = new Websocket.Server({ port: PORT });
        server.on('connection', socket => this.connectSocket(socket));
        this.connectToPeers();

        console.log(`Listening for peer-to-peer connections on: ${PORT}`);
    }

    connectToPeers() {
        peers.forEach(peer => {
            const socket = new Websocket(peer);

            socket.on('open', () => this.connectSocket(socket));
        });
    }

    connectSocket(socket) {
        this.sockets.push(socket);
        console.log('Socket connected');

        this.messageHandler(socket);

        this.sendChain(socket)
    }

    messageHandler(socket) {
        socket.on('message', message => {
            const data = JSON.parse(message);

            this.blockchain.replaceChain(data);
        });
    }

    sendChain(socket) {
        socket.send(JSON.stringify(this.blockchain.chain));
    }

    syncChains() {
        this.sockets.forEach(socket => this.sendChain(socket));
    }
}

module.exports = P2PServer;