const express = require("express");
const app = express();
const cors = require("cors");
const port = 3042;
const secp = require("ethereum-cryptography/secp256k1");
const utils = require("ethereum-cryptography/utils");
const { keccak256 } = require("ethereum-cryptography/keccak");

app.use(cors());
app.use(express.json());

const balances = {
  "c0d0152c4663870f463837658d924d677f20907e": 100,
  "ca727a0fee24376e51e159762cb0fdc12c3331bc": 50,
  "87dc185ac9aa4f750e955e481376231497779f60": 75,
};

/*
privateKey: 82cc7175a12c3d246733af2005d5edb37d190ccab05d7ad825aa17229c2c92b5
publicKey: 04982974f56bd0ccf8bab7de4e55d6d28760c8fd02f074028d33f52ff3ea18283b19b0bacb0e75203f494051fd51fddefd4e7253a754adefa8b9d9ac0a7a39aab1
address: c0d0152c4663870f463837658d924d677f20907e

privateKey: 73aea1ab819d85bf89042dd416a6e79f5403f66ddaa5e40ca7ca405f41ccab38
publicKey: 04e562a3a52c58209bcb084758a443669b63530ec514df9830c240dc646e6143b78882e3aaf12a850755c2e46aece6fb85ff3c9c3a8fc734f2dfbec42557a2053b
address: ca727a0fee24376e51e159762cb0fdc12c3331bc

privateKey: 0327647ac620c0a89f4d934356e1e54075599599dccb22f0573997406ca16a88
publicKey: 04ade992f004c5c0fba1efddcb54333328aa089efbc9732b85b7b1f2f081da372544bd5abc6a659b04c1e3f989ec9ec879eafcfa33cea02f3ee7246e455b65fd29
address: 87dc185ac9aa4f750e955e481376231497779f60
*/

app.get("/balance/:address", (req, res) => {
  const { address } = req.params;
  const balance = balances[address] || 0;
  res.send({ balance });
});

app.post("/send", (req, res) => {
  // TODO: get a signature from de client-side application
  // TODO: recover the public address from the signature

  const { sign, recoveryBit, recipient, amount } = req.body;

  const signature = new Uint8Array(sign);

  console.log(signature);

  const hashMessage = (message) => {
    return keccak256(utils.utf8ToBytes(message))
  }

  publicKey = secp.recoverPublicKey( hashMessage(recipient+parseInt(amount)), signature, recoveryBit);

  const sender = utils.toHex(keccak256(publicKey.slice(1)).slice(-20));

  setInitialBalance(sender);
  setInitialBalance(recipient);

  if (balances[sender] < amount) {
    res.status(400).send({ message: "Not enough funds!" });
  } else {
    balances[sender] -= amount;
    balances[recipient] += amount;
    res.send({ balance: balances[sender] });
  }
});

app.listen(port, () => {
  console.log(`Listening on port ${port}!`);
});

function setInitialBalance(address) {
  if (!balances[address]) {
    balances[address] = 0;
  }
}
