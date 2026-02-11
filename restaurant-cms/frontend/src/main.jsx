import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import App from "./App";
import Home from "./Home";
import Menu from "./Menu";
import Contacts from "./Contacts";
import Reservation from "./Reservation";

ReactDOM.createRoot(document.getElementById("root")).render(
  <BrowserRouter>
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/menu" element={<Menu />} />
      <Route path="/contacts" element={<Contacts />} />
      <Route path="/reservation" element={<Reservation />} />
    </Routes>
  </BrowserRouter>
);
