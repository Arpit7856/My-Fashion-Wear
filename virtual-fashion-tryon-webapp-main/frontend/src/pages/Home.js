import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

// 👉 apni images yahan import karo
import img1 from "../assets/hero.png";
import img2 from "../assets/home2.png";
import img3 from "../assets/home3.png";
import img4 from "../assets/home4.png";
import img5 from "../assets/img2.jpg";
import img6 from "../assets/img3.png";
import img7 from "../assets/img4.png";

export default function Home() {
  const navigate = useNavigate();
  const images = [img1, img3, img2,img4];
  const [current, setCurrent] = useState(0);

  // 🔥 auto slideshow
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrent((prev) => (prev + 1) % images.length);
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div>
      {/* HERO SECTION (SLIDESHOW) */}
      <section className="hero">
        <img src={images[current]} className="hero-img" alt="Virtual Fashion Try-On" />
      </section>

      {/* STEPS SECTION */}
      <section className="steps-section">
        <h2>Try Your Outfit in 3 Simple Steps</h2>
        <p style={{ color: "#666", marginBottom: "30px", marginTop: "10px" }}>
          No fitting rooms needed. Discover your perfect look entirely online.
        </p>

        <div className="steps">
          <div className="step-card">
            <div className="step-number">1</div>
            <img src={img5} alt="upload"/>
            <h3>Upload Your Photo</h3>
            <p className="step-desc">Take a quick selfie or upload a full-body photo to get started.</p>
          </div>

          <div className="step-card">
            <div className="step-number">2</div>
            <img
              src={img6}
              alt="outfit"
            />
            <h3>Select an Outfit</h3>
            <p className="step-desc">Browse our collection of shirts, jackets, kurtis, and more.</p>
          </div>

          <div className="step-card">
            <div className="step-number">3</div>
            <img
              src={img7}
              alt="result"
            />
            <h3>See The Result</h3>
            <p className="step-desc">Our AI magic shows you exactly how the outfit looks on your body.</p>
          </div>
        </div>

        <button className="cta-btn" onClick={() => navigate('/men')}>Explore Collection</button>
      </section>

      {/* ABOUT / PROJECT DESCRIPTION SECTION */}
      <section className="about-section">
        <div className="about-inner">
          <div className="about-badge">About the Project</div>
          <h2 className="about-title">AI-Powered Virtual Fashion Try-On Platform</h2>
          <div className="about-divider"></div>
          <p className="about-text">
            The central focus of this project is the development of an artificial intelligence–assisted virtual
            platform for clothing try-on, designed to transform the way consumers engage with fashion online.
            Our platform empowers users to visualise, with a high degree of accuracy, how a selected garment
            will appear when physically worn — <em>before</em> committing to a purchase.
          </p>
          <p className="about-text">
            By simply uploading a personal photograph alongside an image of the desired article of clothing,
            users can leverage our AI-driven inference engine to generate a realistic, context-aware composite
            that faithfully depicts the alignment, drape, and fit of the chosen outfit on their unique body
            silhouette. This eliminates the guesswork traditionally associated with online apparel shopping
            and provides an immersive, personalised retail experience from the comfort of any device.
          </p>
          <div className="about-highlights">
            <div className="about-highlight-card">
              <span className="about-highlight-icon">🤖</span>
              <h4>AI-Driven Fitting</h4>
              <p>Advanced deep-learning models analyse body posture and garment geometry to produce photorealistic try-on results.</p>
            </div>
            <div className="about-highlight-card">
              <span className="about-highlight-icon">🛡️</span>
              <h4>Privacy First</h4>
              <p>User images are processed securely and are never stored beyond the active session, ensuring complete data privacy.</p>
            </div>
            <div className="about-highlight-card">
              <span className="about-highlight-icon">⚡</span>
              <h4>Instant Results</h4>
              <p>Receive a realistic visualisation in seconds — no lengthy wait times, no fitting rooms, no returns.</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}