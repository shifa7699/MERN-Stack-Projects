import React from "react";
import { Link } from "react-router-dom";
import "./style.css";

function Home() {
  return (
    <div className="App">
      <header className="navbar">
        <h1 className="logo">Restaurant CMS</h1>
        <nav>
          <Link to="/">Home</Link>
          <Link to="/menu">Menu</Link>
          <a href="http://localhost:8080/login.html">Login</a>
        </nav>
      </header>

      <section id="home" className="hero">
        <div className="overlay"></div>
        <div className="hero-content">
          <h2 className="fade-in">Welcome to Our Restaurant</h2>
          <p className="fade-in delay1">Delicious food, warm hospitality.</p>
          <Link to="/menu">
            <button className="fade-in delay2">View Menu</button>
          </Link>
        </div>
      </section>
    </div>
  );
}

export default Home;
