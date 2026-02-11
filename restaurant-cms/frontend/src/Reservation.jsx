import React, { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import "./style.css";

function Reservation() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    date: "",
    time: "",
    guests: "",
    specialRequests: ""
  });
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [selectedLoginType, setSelectedLoginType] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [showLoginDropdown, setShowLoginDropdown] = useState(false);
  const dropdownRef = useRef(null);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch("http://localhost:8080/submit-reservation", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });
      if (response.ok) {
        alert("Reservation submitted successfully!");
        // Reset form
        setFormData({
          name: "",
          email: "",
          phone: "",
          date: "",
          time: "",
          guests: "",
          specialRequests: ""
        });
      } else {
        alert("Failed to submit reservation. Please try again.");
      }
    } catch (error) {
      console.error("Error submitting reservation:", error);
      alert("Error submitting reservation. Please try again.");
    }
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowLoginDropdown(false);
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, []);

  const handleLoginClick = (type) => {
    setSelectedLoginType(type);
    setShowLoginModal(true);
    setError('');
  };

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('http://localhost:8080/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: `userid=${encodeURIComponent(username)}&password=${encodeURIComponent(password)}&role=${encodeURIComponent(selectedLoginType.toLowerCase())}`,
      });

      const result = await response.json();
      if (result.success) {
        // Use window.location.href for full page redirect to backend
        window.location.href = result.redirect;
      } else {
        setError(result.error);
      }
    } catch (err) {
      setError('Login failed. Please try again.');
    }  };

  return (
    <div className="App">
      <header className="navbar">
        <h1 className="logo">
          <img src="/restaurant (1).png" alt="Restaurant Icon" className="restaurant-icon" />
          Spice Garden
        </h1>
        <nav>
          <Link to="/">Home</Link>
          <Link to="/menu">Menu</Link>
          <Link to="/contacts">Contacts</Link>
          <div className="login-dropdown" ref={dropdownRef}>
            <button onClick={() => setShowLoginDropdown(!showLoginDropdown)} className="login-btn">Login</button>
            {showLoginDropdown && (
              <div className="dropdown-menu" onClick={(e) => e.stopPropagation()}>
                <button onClick={() => { handleLoginClick('User'); setShowLoginDropdown(false); }}>User Login</button>
                <button onClick={() => { handleLoginClick('Staff'); setShowLoginDropdown(false); }}>Staff Login</button>
                <button onClick={() => { handleLoginClick('Admin'); setShowLoginDropdown(false); }}>Admin Login</button>
              </div>
            )}
          </div>
        </nav>
      </header>

      <section className="reservation-page">
        <div className="reservation-container">
          <h2>Book a Table</h2>
          <form onSubmit={handleSubmit} className="reservation-form">
            <div className="form-group">
              <label htmlFor="name">Full Name</label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="email">Email</label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="phone">Phone Number</label>
              <input
                type="tel"
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="date">Date</label>
              <input
                type="date"
                id="date"
                name="date"
                value={formData.date}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="time">Time</label>
              <input
                type="time"
                id="time"
                name="time"
                value={formData.time}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="guests">Number of Guests</label>
              <select
                id="guests"
                name="guests"
                value={formData.guests}
                onChange={handleChange}
                required
              >
                <option value="">Select number of guests</option>
                <option value="1">1</option>
                <option value="2">2</option>
                <option value="3">3</option>
                <option value="4">4</option>
                <option value="5">5</option>
                <option value="6">6</option>
                <option value="7">7</option>
                <option value="8">8+</option>
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="specialRequests">Special Requests (Optional)</label>
              <textarea
                id="specialRequests"
                name="specialRequests"
                value={formData.specialRequests}
                onChange={handleChange}
                rows="4"
                placeholder="Any special requests or dietary requirements..."
              ></textarea>
            </div>

            <button type="submit" className="submit-btn">Submit Reservation</button>
          </form>
        </div>
      </section>

      <footer className="footer">
        <p>&copy; 2024 Restaurant CMS. All rights reserved.</p>
      </footer>

      {showLoginModal && (
        <div className="login-modal-overlay" onClick={() => setShowLoginModal(false)}>
          <div className="login-modal" onClick={(e) => e.stopPropagation()}>
            <h2>{selectedLoginType} Login</h2>
            <form onSubmit={handleLoginSubmit}>
              <div className="form-group">
                <label>Username:</label>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                />
              </div>
              <div className="form-group">
                <label>Password:</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
              {error && <p className="error-msg">{error}</p>}
              <button type="submit" className="login-submit-btn">Login</button>
            </form>
            <button className="close-modal" onClick={() => setShowLoginModal(false)}>×</button>
          </div>
        </div>
      )}
    </div>
  );
}

export default Reservation;
