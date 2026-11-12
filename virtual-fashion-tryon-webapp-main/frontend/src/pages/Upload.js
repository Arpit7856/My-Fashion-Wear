import { useRef, useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";

const API_BASE = "http://localhost:8000/api";

// ─── Auth helper ──────────────────────────────────────────────────────────────
function getAccessToken() {
  return localStorage.getItem("access_token");
}

export default function Upload() {
  const navigate      = useNavigate();
  const photoInputRef  = useRef(null);
  const outfitInputRef = useRef(null);

  const [photoFile,    setPhotoFile]    = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);

  const [outfitFile,    setOutfitFile]    = useState(null);
  const [outfitPreview, setOutfitPreview] = useState(null);
  const [clearedOutfit, setClearedOutfit] = useState(false);

  // Try-on state
  const [loading,    setLoading]    = useState(false);
  const [resultUrl,  setResultUrl]  = useState(null);
  const [error,      setError]      = useState("");

  const location         = useLocation();
  const preSelectedOutfit = location.state?.selectedOutfit || null;
  const preSelectedName   = location.state?.outfitName     || null;
  const preSelectedCat    = location.state?.category       || null;

  const displayedOutfit = outfitPreview || (clearedOutfit ? null : preSelectedOutfit);

  // Redirect unauthenticated users
  useEffect(() => {
    if (!getAccessToken()) {
      navigate("/login");
    }
  }, [navigate]);

  // ── File handlers ──────────────────────────────────────────────────────────
  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setPhotoFile(file);
      setPhotoPreview(URL.createObjectURL(file));
    }
  };

  const handleOutfitChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setOutfitFile(file);
      setOutfitPreview(URL.createObjectURL(file));
      setClearedOutfit(false);
    }
  };

  const clearPhoto = () => {
    setPhotoFile(null);
    setPhotoPreview(null);
    if (photoInputRef.current) photoInputRef.current.value = "";
  };

  const clearOutfit = () => {
    setOutfitFile(null);
    setOutfitPreview(null);
    setClearedOutfit(true);
    if (outfitInputRef.current) outfitInputRef.current.value = "";
  };

  // ── Generate / Try-On ─────────────────────────────────────────────────────
  const handleGenerate = async () => {
    setError("");
    setResultUrl(null);

    if (!photoFile) {
      setError("Please upload your photo first.");
      return;
    }
    if (!outfitFile && !preSelectedOutfit) {
      setError("Please select or upload an outfit.");
      return;
    }

    const token = getAccessToken();
    if (!token) {
      navigate("/login");
      return;
    }

    setLoading(true);

    try {
      const formData = new FormData();
      formData.append("person_image", photoFile);

      // If user uploaded outfit file directly, use that
      if (outfitFile) {
        formData.append("cloth_image", outfitFile);
      } else {
        // Pre-selected from gallery: fetch the image as a blob
        const blobRes = await fetch(preSelectedOutfit);
        const blob    = await blobRes.blob();
        formData.append(
          "cloth_image",
          blob,
          preSelectedName ? `${preSelectedName.replace(/\s+/g, '_')}.jpg` : "outfit.jpg"
        );
      }

      const res = await fetch(`${API_BASE}/tryon/`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      const data = await res.json();

      if (res.status === 401) {
        localStorage.removeItem("access_token");
        navigate("/login");
        return;
      }

      if (!res.ok) {
        const msg = data.error || "Try-on failed. Please try again.";
        const detail = data.detail ? `\n${data.detail}` : "";
        setError(msg + detail);
        return;
      }

      setResultUrl(data.image_url);
    } catch (err) {
      setError("Network error. Please make sure the server is running.");
    } finally {
      setLoading(false);
    }
  };

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="upload-page">
      {/* Pre-selected outfit banner */}
      {preSelectedName && (
        <div className="upload-selected-banner">
          <span className="upload-selected-dot" />
          <span>
            Selected: <strong>{preSelectedName}</strong>
            {preSelectedCat && ` — ${preSelectedCat}`}
          </span>
        </div>
      )}

      <div className="upload-cards">

        {/* CARD 1 — Upload Your Photo */}
        <div className="upload-card">
          <div className="upload-step-badge">1</div>
          <h2 className="upload-card-title">Upload Your Photo</h2>

          <div className={`upload-photo-box${photoPreview ? " upload-photo-box--filled" : ""}`}>
            {photoPreview ? (
              <>
                <img src={photoPreview} alt="Your photo" className="upload-preview-img" />
                <button className="upload-remove-btn" onClick={clearPhoto} title="Remove photo">
                  ✕
                </button>
              </>
            ) : (
              <div className="upload-silhouette">
                <svg viewBox="0 0 80 90" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <ellipse cx="40" cy="28" rx="18" ry="20" fill="#c8c8c8" />
                  <path d="M5 90 C5 60 75 60 75 90" fill="#c8c8c8" />
                </svg>
              </div>
            )}
          </div>

          <input
            type="file"
            accept="image/jpeg,image/png"
            ref={photoInputRef}
            style={{ display: "none" }}
            onChange={handlePhotoChange}
          />
          <button className="upload-select-btn" onClick={() => photoInputRef.current.click()}>
            Select Photo
          </button>
          <button className="upload-link-btn" onClick={() => photoInputRef.current.click()}>
            Upload from Computer
          </button>
        </div>

        {/* CARD 2 — Select or Upload Outfit */}
        <div className="upload-card">
          <div className="upload-step-badge">2</div>
          <h2 className="upload-card-title">Select or Upload Outfit</h2>

          <div className="upload-outfit-row">
            {/* Selected outfit box */}
            <div className="upload-outfit-box">
              <div className={`upload-outfit-img-wrapper${displayedOutfit ? " upload-outfit-img-wrapper--filled" : ""}`}>
                {displayedOutfit ? (
                  <>
                    <img
                      src={displayedOutfit}
                      alt={preSelectedName || "Selected outfit"}
                      className="upload-preview-img"
                    />
                    <button
                      className="upload-remove-btn upload-remove-btn--outfit"
                      onClick={clearOutfit}
                      title="Remove outfit"
                    >
                      ✕
                    </button>
                  </>
                ) : (
                  <div className="upload-no-outfit-placeholder">
                    <svg viewBox="0 0 60 60" fill="none">
                      <rect width="60" height="60" rx="10" fill="#ececec"/>
                      <path d="M18 42 L30 18 L42 42 Z" fill="#ccc"/>
                    </svg>
                  </div>
                )}
              </div>
              {preSelectedName && !outfitPreview && (
                <span className="upload-outfit-label">{preSelectedName}</span>
              )}
              <button className="upload-outfit-btn" onClick={() => navigate("/women/designs/tops-blouses")}>Select Outfit</button>
            </div>

            {/* Upload outfit box */}
            <div className="upload-outfit-box">
              <div className="upload-outfit-img-wrapper upload-cloud-box">
                <svg viewBox="0 0 80 70" fill="none" xmlns="http://www.w3.org/2000/svg" className="upload-cloud-icon">
                  <rect x="8" y="10" width="64" height="52" rx="10" fill="#dce9fa" />
                  <ellipse cx="40" cy="28" rx="13" ry="13" fill="#3a7bd5" />
                  <ellipse cx="40" cy="24" rx="7" ry="7" fill="white" />
                  <rect x="37" y="24" width="6" height="10" rx="2" fill="white" />
                  <path d="M28 32 L40 44 L52 32" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" fill="none" />
                  <text x="24" y="58" fontSize="12" fill="#3a7bd5" fontWeight="bold">+ + +</text>
                </svg>
              </div>
              <input
                type="file"
                accept="image/jpeg,image/png"
                ref={outfitInputRef}
                style={{ display: "none" }}
                onChange={handleOutfitChange}
              />
              <button
                className="upload-outfit-btn"
                onClick={() => outfitInputRef.current.click()}
              >
                Upload Outfit
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Error message */}
      {error && (
        <p style={{
          color: "#ff6b6b",
          textAlign: "center",
          margin: "16px 0",
          fontSize: "14px",
          background: "rgba(255,107,107,0.08)",
          borderRadius: "8px",
          padding: "10px 20px",
        }}>
          ⚠ {error}
        </p>
      )}

      {/* Generate Button */}
      <button
        className="upload-generate-btn"
        onClick={handleGenerate}
        disabled={loading}
        style={{ opacity: loading ? 0.7 : 1 }}
      >
        {loading ? "Generating… (this may take a minute)" : "Generate Image"}
      </button>

      {/* Result */}
      {resultUrl && (
        <div style={{ textAlign: "center", marginTop: "32px" }}>
          <h3 style={{ marginBottom: "16px" }}>✨ Your Virtual Try-On Result</h3>
          <img
            src={resultUrl}
            alt="Try-on result"
            style={{
              maxWidth: "480px",
              width: "100%",
              borderRadius: "16px",
              boxShadow: "0 8px 40px rgba(0,0,0,0.18)",
            }}
          />
          <br />
        </div>
      )}
    </div>
  );
}