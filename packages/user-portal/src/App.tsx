import React, { useEffect } from "react";
import logo from "./logo.svg";
import "./App.css";
import { useGetMyCommands } from "./hooks/useGetMyCommands";
import TaskTable from "./components/TaskTable";

function App() {
  const { fetchMyCommands, myCommands } = useGetMyCommands(
    process.env.REACT_APP_API_ENDPOINT || "http://localhost:3003",
    "bf7ab410-03ad-11ef-a277-c31c49e4e709",
  );
  useEffect(() => {
    const tm = setTimeout(fetchMyCommands, 5000);
    return () => {
      clearTimeout(tm);
    };
  }, [fetchMyCommands]);
  return (
    <div className="App flex flex-col content-center justify-center flex-wrap">
      <div className="m-auto pb-10 pt-10"></div>
      <button onClick={fetchMyCommands}>Get My Commands</button>
      <TaskTable tasks={myCommands} />
    </div>
  );
}

export default App;
