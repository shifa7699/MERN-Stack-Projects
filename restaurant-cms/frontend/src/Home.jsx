import React, { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import "./style.css";

function Home() {
  const [menuItems, setMenuItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [selectedLoginType, setSelectedLoginType] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [showLoginDropdown, setShowLoginDropdown] = useState(false);
  const dropdownRef = useRef(null);
  const specialtyRefs = useRef([]);

  const specialties = [
    {
      title: "Fresh Ingredients",
      description: "We source the freshest ingredients daily from local farmers and markets to ensure every dish bursts with natural flavor and nutrition.",
      image: "/fresh-ingredients.jpg"
    },
    {
      title: "Authentic Recipes",
      description: "Our chefs follow traditional recipes passed down through generations, combined with innovative techniques to create unforgettable culinary experiences.",
      image: "/authentic-recipes.jpg"
    },
    {
      title: "Warm Hospitality",
      description: "From the moment you walk through our doors, our dedicated staff ensures you feel welcomed and cared for throughout your dining experience.",
      image: "/warm-hospitality.jpg"
    },
    {
      title: "Signature Spices",
      description: "Our signature spice blends are carefully crafted to bring out the perfect balance of flavors in every dish, creating a unique taste journey.",
      image: "/signature-spices.jpg"
    }
  ];

  useEffect(() => {
    fetch("http://localhost:8080/api/menu")
      .then((response) => response.json())
      .then((data) => {
        setMenuItems(data.slice(0, 6)); // Show only first 6 items
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

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
          }
        });
      },
      { threshold: 0.1 }
    );

    specialtyRefs.current.forEach((ref) => {
      if (ref) observer.observe(ref);
    });

    return () => {
      specialtyRefs.current.forEach((ref) => {
        if (ref) observer.unobserve(ref);
      });
    };
  }, []);

  const handleLoginClick = (type) => {
    setSelectedLoginType(type);
    setShowLoginModal(true);
    setError('');
  };

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    const role = selectedLoginType.toLowerCase();
    try {
      const response = await fetch('http://localhost:8080/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: `userid=${encodeURIComponent(username)}&password=${encodeURIComponent(password)}&role=${encodeURIComponent(role)}`,
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
          <a href="#about">About</a>
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

      <section id="home" className="hero">
        <video className="hero-video" autoPlay muted loop playsInline>
          <source src="/mixkit-a-bunch-of-strawberries-falling-through-water-15973-hd-ready.mp4" type="video/mp4" />
          Your browser does not support the video tag.
        </video>
        <div className="overlay"></div>
        <div className="hero-content">
          <h2 className="fade-in">Welcome to Our Restaurant</h2>
          <p className="fade-in delay1">Delicious food, warm hospitality.</p>
          <Link to="/reservation">
            <button className="fade-in delay2">Book Table</button>
          </Link>
        </div>
      </section>

      <section id="about" className="about-section">
        <div className="about-content">
          <h2>About Spice Garden</h2>
          <p>
            Welcome to Spice Garden, where culinary excellence meets warm hospitality. Our restaurant has been serving
            authentic flavors and creating memorable dining experiences for over a decade. We pride ourselves on using
            the freshest ingredients, traditional cooking techniques, and innovative presentations to bring you dishes
            that tantalize your taste buds and warm your heart.
          </p>
          <p>
            Whether you're joining us for a romantic dinner, a family celebration, or a casual meal with friends,
            our dedicated team is committed to making every visit special. From our signature spice blends to our
            carefully curated wine selection, every detail is designed to enhance your dining experience.
          </p>
        </div>
      </section>

      <section className="specialties-section">
        <div className="specialties-container">
          <h2>Why Choose Spice Garden</h2>
          {specialties.map((specialty, index) => (
            <div
              key={index}
              ref={(el) => (specialtyRefs.current[index] = el)}
              className={`specialty-block ${index % 2 === 0 ? 'left-image' : 'right-image'}`}
            >
              <div className="specialty-image">
                <img src={specialty.image} alt={specialty.title} />
              </div>
              <div className="specialty-content">
                <h3>{specialty.title}</h3>
                <p>{specialty.description}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="reviews-section">
        <h2>What Our Customers Say</h2>
        <div className="reviews-container">
          <div className="reviews-slider">
            <div className="review-card">
              <div className="review-stars">★★★★★</div>
              <p>"Absolutely amazing food and service! The spices are perfectly balanced, and the atmosphere is perfect for a date night."</p>
              <h4>- Sarah Johnson</h4>
            </div>
            <div className="review-card">
              <div className="review-stars">★★★★★</div>
              <p>"Best restaurant in town! The flavors are authentic and the staff is incredibly friendly. Highly recommend the butter chicken."</p>
              <h4>- Michael Chen</h4>
            </div>
            <div className="review-card">
              <div className="review-stars">★★★★☆</div>
              <p>"Great experience overall. The food was delicious, though the wait time was a bit long during peak hours."</p>
              <h4>- Emily Rodriguez</h4>
            </div>
            <div className="review-card">
              <div className="review-stars">★★★★★</div>
              <p>"Spice Garden never disappoints! The naan is heavenly, and the desserts are to die for. Will definitely be back."</p>
              <h4>- David Kumar</h4>
            </div>
            <div className="review-card">
              <div className="review-stars">★★★★★</div>
              <p>"Exceptional dining experience! The presentation of dishes is as impressive as the taste. Five stars!"</p>
              <h4>- Lisa Thompson</h4>
            </div>
            <div className="review-card">
              <div className="review-stars">★★★★☆</div>
              <p>"Loved the ambiance and the food quality. A bit pricey, but worth every penny for the experience."</p>
              <h4>- Robert Patel</h4>
            </div>
            <div className="review-card">
              <div className="review-stars">★★★★★</div>
              <p>"Absolutely amazing food and service! The spices are perfectly balanced, and the atmosphere is perfect for a date night."</p>
              <h4>- Sarah Johnson</h4>
            </div>
            <div className="review-card">
              <div className="review-stars">★★★★★</div>
              <p>"Best restaurant in town! The flavors are authentic and the staff is incredibly friendly. Highly recommend the butter chicken."</p>
              <h4>- Michael Chen</h4>
            </div>
            <div className="review-card">
              <div className="review-stars">★★★★☆</div>
              <p>"Great experience overall. The food was delicious, though the wait time was a bit long during peak hours."</p>
              <h4>- Emily Rodriguez</h4>
            </div>
            <div className="review-card">
              <div className="review-stars">★★★★★</div>
              <p>"Spice Garden never disappoints! The naan is heavenly, and the desserts are to die for. Will definitely be back."</p>
              <h4>- David Kumar</h4>
            </div>
            <div className="review-card">
              <div className="review-stars">★★★★★</div>
              <p>"Exceptional dining experience! The presentation of dishes is as impressive as the taste. Five stars!"</p>
              <h4>- Lisa Thompson</h4>
            </div>
            <div className="review-card">
              <div className="review-stars">★★★★☆</div>
              <p>"Loved the ambiance and the food quality. A bit pricey, but worth every penny for the experience."</p>
              <h4>- Robert Patel</h4>
            </div>
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

      <footer className="footer">
        <p>&copy; 2024 Restaurant CMS. All rights reserved.</p>
      </footer>
    </div>
  );
}

export default Home;
