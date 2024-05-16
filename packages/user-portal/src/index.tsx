import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import App from "./App";
import reportWebVitals from "./reportWebVitals";
import { MetaMaskUIProvider } from "@metamask/sdk-react-ui";

const root = ReactDOM.createRoot(
  document.getElementById("root") as HTMLElement,
);
root.render(
  <React.StrictMode>
    <MetaMaskUIProvider
      debug={false}
      sdkOptions={{
        dappMetadata: {
          name: "Genetica Analysis",
          url: window.location.href,
        },
        // infuraAPIKey: process.env.INFURA_API_KEY,
        // Other options.
      }}
    >
      <App />
    </MetaMaskUIProvider>
  </React.StrictMode>,
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
