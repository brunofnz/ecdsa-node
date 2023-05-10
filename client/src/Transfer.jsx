import { useState } from "react";
import server from "./server";
import * as secp from"ethereum-cryptography/secp256k1";
import * as keccak from "ethereum-cryptography/keccak";
import * as utils from "ethereum-cryptography/utils";

function Transfer({ privateKey, setBalance }) {
  const [sendAmount, setSendAmount] = useState("");
  const [recipient, setRecipient] = useState("");

  const setValue = (setter) => (evt) => setter(evt.target.value);

  async function transfer(evt) {
    evt.preventDefault();
    const [signature, recoveryBit] = await secp.sign(hashMessage(recipient+parseInt(sendAmount)), privateKey, { recovered: true });
    
    const sign = signature.toString().split(",");

    try {
      const {
        data: { balance },
      } = await server.post(`send`, {
        sign: sign,
        recoveryBit: recoveryBit,
        amount: parseInt(sendAmount),
        recipient,
      });
      setBalance(balance);
    } catch (ex) {
      alert(ex.response.data.message);
    }
  }

  

  return (
    <form className="container transfer" onSubmit={transfer}>
      <h1>Send Transaction</h1>

      <label>
        Send Amount
        <input
          placeholder="1, 2, 3..."
          value={sendAmount}
          onChange={setValue(setSendAmount)}
        ></input>
      </label>

      <label>
        Recipient
        <input
          placeholder="Type an address, for example: 0x2"
          value={recipient}
          onChange={setValue(setRecipient)}
        ></input>
      </label>

      <input type="submit" className="button" value="Transfer" />
    </form>
  );
}

const hashMessage = (message) => {
  return keccak.keccak256(utils.utf8ToBytes(message))
}

export default Transfer;
