import React, { useEffect, useState } from "react";
import "./App.css";
import { FileUpload } from "./components/FileUpload";
import TaskTable from "./components/TaskTable";
import { useGetMyDocId } from "./hooks/useGetMyDoc";
import { useUploadDoc } from "./hooks/useUploadDoc";
import { MetaMaskButton, useSDK } from "@metamask/sdk-react-ui";
import Web3 from "web3";
import { useWebWallet } from "./hooks/useWebWallet";
import { DocIdInput } from "./components/InputDocId";

function App() {
  const url = process.env.REACT_APP_API_ENDPOINT || "http://localhost:3003";
  const { uploadDoc, isLoading, docId, manuallySetDocId } = useUploadDoc(url);

  const { fetchDocIdSession, taskDoc } = useGetMyDocId(url);
  const { account, submitResult } = useWebWallet();
  useEffect(() => {
    let tm: NodeJS.Timeout;
    if (docId && taskDoc?.result !== "FINISHED") {
      tm = setTimeout(() => fetchDocIdSession(docId), 5000);
    }
    return () => {
      if (tm) {
        clearTimeout(tm);
      }
    };
  }, [docId, fetchDocIdSession]);
  console.log("taskOdc", taskDoc);
  return (
    <div className="App flex flex-col content-center justify-center flex-wrap pt-10">
      <MetaMaskButton theme={"light"} color="white"></MetaMaskButton>
      <div className="m-auto pb-10 pt-10">
        <FileUpload
          onFileSelect={(file) => uploadDoc(file, account)}
          loading={isLoading}
        />
      </div>
      <DocIdInput onChange={manuallySetDocId} />
      <TaskTable
        tasks={taskDoc ? [taskDoc] : []}
        actionDisbled={taskDoc?.status !== "FINISH"}
        onConfirm={() => {
          if (taskDoc) {
            submitResult(taskDoc);
          }
        }}
      />
    </div>
  );
}

export default App;
