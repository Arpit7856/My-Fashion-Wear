import { useNavigate } from "react-router-dom";
import dressesImg from "../assets/women_dresses.png";
import topsImg from "../assets/women_tops.png";
import sareesImg from "../assets/women_sarees.png";
import kutrisImg from "../assets/women_kurtis.png";
import jeansImg from "../assets/women_jeans.png";
import skirtsImg from "../assets/women_skirts.png";
import jacketsImg from "../assets/women_jackets.png";
import ethnicImg from "../assets/women_ethnic.png";

const categories = [
  { name: "Dresses",          img: dressesImg,   route: null },
  { name: "Tops & Blouses",   img: topsImg,      route: "tops-blouses" },
  { name: "Sarees",           img: sareesImg,    route: null },
  { name: "Kurtis",           img: kutrisImg,    route: null },
  { name: "Jeans & Trousers", img: jeansImg,     route: null },
  { name: "Skirts",           img: skirtsImg,    route: null },
  { name: "Jackets & Coats",  img: jacketsImg,   route: null },
  { name: "Ethnic Wear",      img: ethnicImg,    route: null },
];

export default function Women() {
  const navigate = useNavigate();

  const handleClick = (cat) => {
    if (cat.route) {
      navigate(`/women/designs/${cat.route}`);
    }
  };

  return (
    <div className="men-page">
      <div className="men-header">
        <h1>Try On Women's Outfits</h1>
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
