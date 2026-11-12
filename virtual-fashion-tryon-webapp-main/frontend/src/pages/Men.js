import { useNavigate } from "react-router-dom";
import suitsImg from "../assets/men_suits.png";
import shirtsImg from "../assets/men_casual_shirts.png";
import blazersImg from "../assets/men_blazers.png";
import jacketsImg from "../assets/men_jackets.png";
import tshirtsImg from "../assets/men_tshirts.png";
import jeansImg from "../assets/men_jeans.png";
import pantsImg from "../assets/men_pants.png";
import ethnicImg from "../assets/men_ethnic_wear.png";

// Categories with a `route` for those that have a designs gallery.
// `route: null` means "coming soon" — no navigation.
const categories = [
  { name: "Suits",        img: suitsImg,   route: null },
  { name: "Casual Shirts",img: shirtsImg,  route: null },
  { name: "Blazers",      img: blazersImg, route: null },
  { name: "Jackets",      img: jacketsImg, route: null },
  { name: "T-Shirts",     img: tshirtsImg, route: null },
  { name: "Jeans",        img: jeansImg,   route: null },
  { name: "Pants",        img: pantsImg,   route: null },
  { name: "Ethnic Wear",  img: ethnicImg,  route: null },
];

export default function Men() {
  const navigate = useNavigate();

  const handleClick = (cat) => {
    if (cat.route) {
      navigate(`/men/designs/${cat.route}`);
    }
  };

  return (
    <div className="men-page">
      <div className="men-header">
        <h1>Try On Men's Outfits</h1>
        <p>Select a category to explore outfits and see how<br />you look in various styles.</p>
      </div>

      <div className="men-grid">
        {categories.map((cat) => (
          <div
            key={cat.name}
            className={`men-card${cat.route ? "" : " men-card-disabled"}`}
            onClick={() => handleClick(cat)}
            title={cat.route ? `Browse ${cat.name}` : "Coming soon"}
          >
            <div className="men-card-img-wrapper">
              <img src={cat.img} alt={cat.name} />
            </div>
            <div className="men-card-label">
              <span>{cat.name}</span>
            </div>
            <div className="men-card-arrow">
              {cat.route ? "›" : <span className="men-card-soon">Soon</span>}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}