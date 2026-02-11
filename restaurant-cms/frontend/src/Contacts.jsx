import React, { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faFacebook, faInstagram, faWhatsapp } from "@fortawesome/free-brands-svg-icons";
import "./style.css";

function Contacts() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: ''
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

  const handleSubmit = (e) => {
    e.preventDefault();
    // For now, just log the data. In a real app, you'd send this to a backend.
    console.log('Form submitted:', formData);
    alert('Thank you for your message! We will get back to you soon.');
    setFormData({ name: '', email: '', message: '' });
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
        body: `userid=${encodeURIComponent(username)}&password=${encodeURIComponent(password)}`,
      });

      if (response.redirected) {
        window.location.href = response.url;
      } else {
        const text = await response.text();
        setError('Invalid credentials! Check case');
      }
    } catch (err) {
      setError('Login failed. Please try again.');
    }
  };

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

      <section className="contacts-page">
        <div className="contacts-hero">
          <h1 className="contacts-title">Get In Touch</h1>
          <p className="contacts-subtitle">We'd love to hear from you. Reach out for reservations, inquiries, or just to say hello!</p>
        </div>

        <div className="contacts-main">
          <div className="contact-info-section">
            <h2>Contact Information</h2>
            <div className="contacts-container">
              <div className="contact-card">
                <h3><span className="card-icon">📍</span> Address</h3>
                <p>123 Royal Street<br />Elegant City, EC 12345</p>
              </div>
              <div className="contact-card">
                <h3><span className="card-icon">📞</span> Phone</h3>
                <p>+1 (555) 123-4567</p>
              </div>
              <div className="contact-card">
                <h3><span className="card-icon">✉️</span> Email</h3>
                <p>info@restaurantcms.com</p>
              </div>
              <div className="contact-card">
                <h3><span className="card-icon">🕒</span> Hours</h3>
                <p>Mon-Fri: 9AM - 10PM<br />Sat-Sun: 10AM - 11PM</p>
              </div>
            </div>
          </div>

          <div className="contact-form-section">
            <h2>Send us a Message</h2>
            <form className="contact-form" onSubmit={handleSubmit}>
              <div className="form-group">
                <label htmlFor="name">Full Name</label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Enter your name"
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="email">Email Address</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="Enter your email"
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="message">Message</label>
                <textarea
                  id="message"
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  placeholder="Tell us how we can help you..."
                  required
                ></textarea>
              </div>
              <button type="submit" className="submit-btn">Send Message</button>
            </form>
          </div>
        </div>

        <div className="social-media-section">
          <h3>Follow Us</h3>
          <div className="social-icons">
            <a href="https://www.facebook.com/yourrestaurant" target="_blank" rel="noopener noreferrer" className="social-link">
              <FontAwesomeIcon icon={faFacebook} />
            </a>
            <a href="https://www.instagram.com/yourrestaurant" target="_blank" rel="noopener noreferrer" className="social-link">
              <FontAwesomeIcon icon={faInstagram} />
            </a>
            <a href="https://wa.me/15551234567" target="_blank" rel="noopener noreferrer" className="social-link">
              <FontAwesomeIcon icon={faWhatsapp} />
            </a>
          </div>
        </div>
      </section>

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

export default Contacts;
