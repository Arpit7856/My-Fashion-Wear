import { useParams, useNavigate } from "react-router-dom";

// ── Shirt designs
import shirt1 from "../assets/shirt_design_1.png";
import shirt2 from "../assets/shirt_design_2.png";
import shirt3 from "../assets/shirt_design_3.png";
import shirt4 from "../assets/shirt_design_4.png";
import shirt5 from "../assets/shirt_design_5.png";
import shirt6 from "../assets/shirt_design_6.png";

// ── Blazer designs (6)
import blazer1 from "../assets/blazer_design_1.png";
import blazer2 from "../assets/blazer_design_2.png";
import blazer3 from "../assets/blazer_design_3.png";
import blazer4 from "../assets/blazer_design_4.png";
import blazer5 from "../assets/blazer_design_5.jpg";
import blazer6 from "../assets/blazer_design_6.jpg";

// ── Jacket designs (6 different images)
import jacket1 from "../assets/jacket_design_1.jpg";
import jacket2 from "../assets/jacket_design_2.png";
import jacket3 from "../assets/jacket_design_3.jpg";
import jacket4 from "../assets/jacket_design_4.jpg";
import jacket5 from "../assets/jacket_design_5.jpg";
import jacket6 from "../assets/jacket_design_6.png";

// ── T-Shirt designs
import tshirt1 from "../assets/tshirt_design_1.png";
import tshirt2 from "../assets/tshirt_design_2.png";
import tshirt3 from "../assets/tshirt_design_3.png";
import tshirt4 from "../assets/tshirt_design_4.png";
import tshirt5 from "../assets/tshirt_design_5.png";
import tshirt6 from "../assets/tshirt_design_6.png";

// ── Women's Tops & Blouses (16 real garment photos)
import top1  from "../assets/pics/00006_00.jpg";
import top2  from "../assets/pics/00017_00.jpg";
import top3  from "../assets/pics/00034_00.jpg";
import top4  from "../assets/pics/00055_00.jpg";
import top5  from "../assets/pics/00069_00.jpg";
import top6  from "../assets/pics/00094_00.jpg";
import top7  from "../assets/pics/00110_00.jpg";
import top8  from "../assets/pics/00151_00.jpg";
import top9  from "../assets/pics/00205_00.jpg";
import top10 from "../assets/pics/00254_00.jpg";
import top11 from "../assets/pics/00287_00.jpg";
import top12 from "../assets/pics/00470_00.jpg";
import top13 from "../assets/pics/00460_00.jpg";
import top14 from "../assets/pics/00609_00.jpg";
import top15 from "../assets/pics/00705_00.jpg";
import top16 from "../assets/pics/00760_00.jpg";

// ── Women's Kurtis designs
import kurti1 from "../assets/Kurtis_1.jpg";
import kurti2 from "../assets/Kurtis_2.jpg";
import kurti3 from "../assets/Kurtis_3.jpg";
import kurti4 from "../assets/Kurtis_4.jpg";
import kurti5 from "../assets/Kurtis_5.jpg";
import kurti6 from "../assets/Kurtis_6.jpg";

// ── Women's Jackets & Coats designs
import wJacket1 from "../assets/Jackets_1.jpg";
import wJacket2 from "../assets/Jackets_2.jpg";
import wJacket3 from "../assets/Jackets_3.jpg";
import wJacket4 from "../assets/Jackets_4.jpg";
import wJacket5 from "../assets/Jackets_5.jpg";
import wJacket6 from "../assets/Jackets_6.jpg";

const designCatalog = {
  "casual-shirts": {
    label: "Casual Shirts",
    accent: "#3a7bd5",
    designs: [
      { id: "shirt-1", name: "Oxford Blue",  img: shirt1 },
      { id: "shirt-2", name: "White Linen",  img: shirt2 },
      { id: "shirt-3", name: "Navy Stripe",  img: shirt3 },
      { id: "shirt-4", name: "Olive Green",  img: shirt4 },
      { id: "shirt-5", name: "Red Flannel",  img: shirt5 },
      { id: "shirt-6", name: "Blush Pink",   img: shirt6 },
    ],
  },
  blazers: {
    label: "Blazers",
    accent: "#2c3e6b",
    designs: [
      { id: "blazer-1", name: "Navy Classic",    img: blazer1 },
      { id: "blazer-2", name: "Charcoal Grey",   img: blazer2 },
      { id: "blazer-3", name: "Brown Tweed",     img: blazer3 },
      { id: "blazer-4", name: "Black DB",        img: blazer4 },
      { id: "blazer-5", name: "Khaki Smart",     img: blazer5 },
      { id: "blazer-6", name: "Midnight Formal", img: blazer6 },
    ],
  },
  jackets: {
    label: "Jackets",
    accent: "#5a4227",
    designs: [
      { id: "jacket-1", name: "Black Biker",      img: jacket1 },
      { id: "jacket-2", name: "Tan Bomber",       img: jacket2 },
      { id: "jacket-3", name: "Coloured Rack",    img: jacket3 },
      { id: "jacket-4", name: "Leather Street",   img: jacket4 },
      { id: "jacket-5", name: "Denim Sherpa",     img: jacket5 },
      { id: "jacket-6", name: "Dark Denim",       img: jacket6 },
    ],
  },
  "t-shirts": {
    label: "T-Shirts",
    accent: "#e8344e",
    designs: [
      { id: "tshirt-1", name: "Classic White",     img: tshirt1 },
      { id: "tshirt-2", name: "Graphic Black",     img: tshirt2 },
      { id: "tshirt-3", name: "Royal Blue V-Neck", img: tshirt3 },
      { id: "tshirt-4", name: "Navy Polo",         img: tshirt4 },
      { id: "tshirt-5", name: "Army Oversized",    img: tshirt5 },
      { id: "tshirt-6", name: "Burgundy Crew",     img: tshirt6 },
    ],
  },
  "tops-blouses": {
    label: "Tops & Blouses",
    accent: "#ff6b81",
    designs: [
      { id: "top-1",  name: "Ivory Ruffle Blouse",      img: top1  },
      { id: "top-2",  name: "Pastel Floral Top",         img: top2  },
      { id: "top-3",  name: "Striped Cotton Tee",        img: top3  },
      { id: "top-4",  name: "Sage Green Crop Top",       img: top4  },
      { id: "top-5",  name: "Classic White Blouse",      img: top5  },
      { id: "top-6",  name: "Dusty Rose Blouse",         img: top6  },
      { id: "top-7",  name: "Cobalt Blue Camisole",      img: top7  },
      { id: "top-8",  name: "Warm Beige Button-Up",      img: top8  },
      { id: "top-9",  name: "Emerald Satin Top",         img: top9  },
      { id: "top-10", name: "Terracotta Wrap Top",       img: top10 },
      { id: "top-11", name: "Lavender Chiffon Blouse",   img: top11 },
      { id: "top-12", name: "Khaki Casual Top",          img: top12 },
      { id: "top-13", name: "Coral Tie-Front Top",       img: top13 },
      { id: "top-14", name: "Slate Blue Linen Top",      img: top14 },
      { id: "top-15", name: "Printed Boho Blouse",       img: top15 },
      { id: "top-16", name: "Noir Off-Shoulder Top",     img: top16 },
    ],
  },
  "kurtis": {
    label: "Kurtis",
    accent: "#ff9f43",
    designs: [
      { id: "kurti-1", name: "Peach Floral",      img: kurti1 },
      { id: "kurti-2", name: "Cyan Embroidered",  img: kurti2 },
      { id: "kurti-3", name: "Mint Green Kurti",  img: kurti3 },
      { id: "kurti-4", name: "Papaya Whip",       img: kurti4 },
      { id: "kurti-5", name: "Almond Elegant",    img: kurti5 },
      { id: "kurti-6", name: "Bisque Traditional",img: kurti6 },
    ],
  },
  "jackets-coats-womens": {
    label: "Jackets & Coats",
    accent: "#576574",
    designs: [
      { id: "w-jacket-1", name: "Light Grey Blazer", img: wJacket1 },
      { id: "w-jacket-2", name: "Silver Coat",       img: wJacket2 },
      { id: "w-jacket-3", name: "Dark Grey Trench",  img: wJacket3 },
      { id: "w-jacket-4", name: "Charcoal Moto",     img: wJacket4 },
      { id: "w-jacket-5", name: "Slate Blue Denim",  img: wJacket5 },
      { id: "w-jacket-6", name: "Navy Peacoat",      img: wJacket6 },
    ],
  },
};

export default function ClothingDesigns() {
  const { category } = useParams();
  const navigate = useNavigate();

  const catalog = designCatalog[category];

  if (!catalog) {
    return (
      <div className="designs-not-found">
        <h2>Category not found.</h2>
      </div>
    );
  }

  const handleSelect = (design) => {
    navigate("/upload", {
      state: {
        selectedOutfit: design.img,
        outfitName: design.name,
        category: catalog.label,
      },
    });
  };

  const isWomen = window.location.pathname.includes("women");
  const parentPath = isWomen ? "/women" : "/men";
  const parentLabel = isWomen ? "Women's" : "Men's";

  return (
    <div className="designs-page">
      {/* Breadcrumb */}
      <div className="designs-breadcrumb">
        <span onClick={() => navigate(parentPath)} className="designs-breadcrumb-link">
          {parentLabel}
        </span>
        <span className="designs-breadcrumb-sep">›</span>
        <span className="designs-breadcrumb-current">{catalog.label}</span>
      </div>

      {/* Header */}
      <div className="designs-header">
        <div
          className="designs-accent-line"
          style={{ background: catalog.accent }}
        />
        <h1>{catalog.label} — Pick Your Style</h1>
        <p>Click any design to try it on instantly.</p>
      </div>

      {/* Grid */}
      <div className="designs-grid">
        {catalog.designs.map((design) => (
          <div
            key={design.id}
            className="design-card"
            onClick={() => handleSelect(design)}
            title={`Try on ${design.name}`}
          >
            <div className="design-card-img-wrapper">
              <img src={design.img} alt={design.name} />
              <div className="design-card-overlay">
                <span>Try On →</span>
              </div>
            </div>
            <div className="design-card-footer">
              <span className="design-card-name">{design.name}</span>
              <span
                className="design-card-tag"
                style={{ background: catalog.accent + "22", color: catalog.accent }}
              >
                {catalog.label}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
