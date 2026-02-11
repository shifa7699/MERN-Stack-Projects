import React, { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import "./style.css";

function Menu() {
  const [menuItems, setMenuItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [selectedLoginType, setSelectedLoginType] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [showLoginDropdown, setShowLoginDropdown] = useState(false);
  const dropdownRef = useRef(null);

  const categories = ["Drinks", "Desserts", "Kid's Menu", "Indian", "Chinese", "Continental", "Festival Specials"];

  useEffect(() => {
    fetch("http://localhost:8080/api/menu")
      .then((response) => response.json())
      .then((data) => {
        console.log("Fetched menu data:", data);
        console.log("Veg items:", data.filter(item => item.category === "veg"));
        console.log("Non-veg items:", data.filter(item => item.category === "non-veg"));
        setMenuItems(data);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching menu:", error);
        setLoading(false);
      });
  }, []);

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

      const data = await response.json();
      if (data.success) {
        window.location.href = data.redirect;
      } else {
        setError(data.error || 'Invalid credentials! Check case');
      }
    } catch (err) {
      setError('Login failed. Please try again.');
    }
  };

  const getItemsByCategory = (category) => {
    return menuItems.filter(item => item.category === category);
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

      <section className="menu-page">
        <h1 className="menu-title">Our Menu</h1>
        {loading ? (
          <p className="loading-text">Loading menu...</p>
        ) : menuItems.length === 0 ? (
          <p className="loading-text">No menu items found. Please add some dishes from the admin dashboard.</p>
        ) : (
          <div className="category-cards">
            {categories.map((category) => {
              const items = getItemsByCategory(category);
              return (
                <div key={category} className={`category-card ${category === "Drinks" ? "drinks-card" : ""}`}>
                  <h2>{category}</h2>
                  {items.length > 0 ? (
                    <div className="menu-grid">
                      {items.map((item) => (
                        <div key={item._id} className="menu-card">
                          <img
                            src={`http://localhost:8080${item.image}`}
                            alt={item.name}
                            className="menu-img"
                          />
                          <h4>{item.name}</h4>
                          <p>₹{item.price}</p>
                        </div>
                      ))}
                    </div>
                  ) : null}
                </div>
              );
            })}
          </div>
        )}
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

export default Menu;
