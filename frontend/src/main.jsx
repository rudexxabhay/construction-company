import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App";
import ScrollMotionProvider from "./components/ScrollMotionProvider";
import "./index.css";

const storedTheme = localStorage.getItem("theme");
if (storedTheme === "dark") document.documentElement.classList.add("dark");

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <ScrollMotionProvider>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </ScrollMotionProvider>
  </React.StrictMode>
);
