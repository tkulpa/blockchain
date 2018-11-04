const express = require('express');
const bodyParser = require('body-parser');
const Blockchain = require('../blockchain');
const P2PServer = require('./p2p.server');

const PORT = process.env.HTTP_PORT || 3001;

const app = express();
const blockchain = new Blockchain();
const p2pServer = new P2PServer(blockchain);

app.use(bodyParser.json());

app.get('/blocks', (req, res) => {
    res.json(blockchain.chain);
});

app.post('/mine', (req, res) => {
    const block = blockchain.addBlock(req.body.data);
    console.log(`New block added: ${block.toString()}`);

    p2pServer.syncChains();

    res.redirect('/blocks');
});

app.listen(PORT, () => console.log(`Listening on port ${PORT}`));
p2pServer.listen();