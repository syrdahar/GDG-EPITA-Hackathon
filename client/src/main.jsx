import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import "./index.css";
import Home from "./pages/Home.jsx";
import TeacherStudio from "./pages/TeacherStudio.jsx";
import GamePlayer from "./pages/GamePlayer.jsx";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/studio/:id" element={<TeacherStudio />} />
        <Route path="/play/:id" element={<GamePlayer />} />
      </Routes>
    </BrowserRouter>
  </React.StrictMode>
);
