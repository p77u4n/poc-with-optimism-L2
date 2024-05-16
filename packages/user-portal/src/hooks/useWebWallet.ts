import Web3 from "web3";
import { useSDK } from "@metamask/sdk-react-ui";
import { useEffect, useState } from "react";
import { abi } from "genomicdao-hardhat";
import { Task } from "../model/Task";

export const useWebWallet = () => {
  const { account, provider } = useSDK();
  const [web3, setWeb3] = useState<Web3>();

  useEffect(() => {
    if (provider) {
      setWeb3(new Web3(provider));
    }
  }, [provider]);

  useEffect(() => {
    if (web3) {
      web3.eth.getAccounts().then((acc) => console.log("account ", acc));
    }
  }, [web3]);

  const submitResult = async (task: Task) => {
    if (web3) {
      const myContract = new web3.eth.Contract(
        abi.Controller,
        process.env.REACT_APP_CONTROLLER_ADDRESS,
      );
      const taskResult = JSON.parse(task.result || "{}");
      if (task.session_id === undefined || !taskResult["risk_score_ind"]) {
        return;
      }
      await myContract.methods
        .confirm(
          task.doc_id,
          taskResult["hash"],
          taskResult["proof"],
          BigInt(task.session_id),
          BigInt(taskResult["risk_score_ind"]),
        )
        .send({ from: account })
        .then((tx) =>
          tx.status === BigInt(1)
            ? Promise.resolve(tx.events)
            : Promise.reject(new Error(tx.transactionHash)),
        );
    }
  };

  return { account, web3, submitResult };
};
