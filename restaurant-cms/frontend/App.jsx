import React from "react";
import "./style.css";

function App() {
  return (
    <div className="App">
      <header className="navbar">
        <h1 className="logo">Restaurant CMS</h1>
        <nav>
          <a href="/">Home</a>
          <a href="http://localhost:8080/login.html">Login</a>
        </nav>
      </header>

      <section id="home" className="hero">
        <div className="overlay"></div>
        <div className="hero-content">
          <h2 className="fade-in">Welcome to Our Restaurant</h2>
          <p className="fade-in delay1">Delicious food, warm hospitality.</p>
          <a href="http://localhost:8080/login.html">
            <button className="fade-in delay2">Login</button>
          </a>
        </div>
      </section>
    </div>
  );
}

export default App;
