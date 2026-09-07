import { useState, useRef, useEffect } from "react";
import "./App.css";

const examples = [
  "Congratulations! You won ₹50,000. Click here to claim your prize now.",
  "Your bank account will be blocked today. Verify your details immediately.",
  "Hi, are we still meeting for lunch tomorrow?",
];

function App() {
  const [history, setHistory] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(false);

  const [message, setMessage] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const resultRef = useRef(null);

  // OCR / screenshot upload state
  const [ocrLoading, setOcrLoading] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    loadHistory();
  }, []);

  const wordCount = message.trim() ? message.trim().split(/\s+/).length : 0;

  const linkCount = (message.match(/https?:\/\/[^\s]+|www\.[^\s]+/gi) || [])
    .length;

  const messageStatus =
    message.length === 0
      ? "Waiting for message"
      : message.trim().length < 10
        ? "Message is too short"
        : "Ready to analyze";

  // Dashboard analytics are calculated from the history already returned
  // by the existing /history endpoint. No backend changes are required.
  const dashboardStats = {
    total: history.length,
    high: history.filter((item) => item.risk_level === "HIGH").length,
    medium: history.filter((item) => item.risk_level === "MEDIUM").length,
    low: history.filter((item) => item.risk_level === "LOW").length,
  };

  const averageRisk =
    history.length > 0
      ? Math.round(
          history.reduce(
            (sum, item) => sum + Number(item.risk_score || 0),
            0,
          ) / history.length,
        )
      : 0;

  const categoryCounts = history.reduce((counts, item) => {
    const category = item.category || "General";
    counts[category] = (counts[category] || 0) + 1;
    return counts;
  }, {});

  const topCategories = Object.entries(categoryCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 4);

  const handleScreenshotUpload = async (event) => {
    const file = event.target.files?.[0];

    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setError("Please upload a valid image file.");
      return;
    }

    setError("");
    setOcrLoading(true);
    setSelectedImage(URL.createObjectURL(file));

    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("http://127.0.0.1:8000/ocr", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("OCR request failed");
      }

      const data = await response.json();

      if (data.error) {
        throw new Error(data.error);
      }

      if (!data.text?.trim()) {
        setError("No readable text was detected in the screenshot.");
        return;
      }

      setMessage(data.text.trim());
      setResult(null);
    } catch (error) {
      console.error(error);

      setError(
        "Unable to extract text from the screenshot. Please try another image.",
      );
    } finally {
      setOcrLoading(false);
    }
  };

  const analyzeMessage = async () => {
    if (!message.trim()) {
      setError("Please enter a message to analyze.");
      return;
    }

    if (message.trim().length < 10) {
      setError("Please enter a longer message to analyze.");
      return;
    }

    setError("");
    setLoading(true);
    setResult(null);

    try {
      const response = await fetch("http://127.0.0.1:8000/analyze", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: message,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to analyze message");
      }

      const data = await response.json();
      setResult(data);
      loadHistory();

      setTimeout(() => {
        resultRef.current?.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
      }, 150);
    } catch (error) {
      console.error(error);

      setError(
        "Unable to connect to the Scamvex backend. Make sure the backend is running.",
      );
    } finally {
      setLoading(false);
    }
  };

  const loadHistory = async () => {
  setHistoryLoading(true);

  try {
    const response = await fetch("http://127.0.0.1:8000/history");

    if (!response.ok) {
      throw new Error("Failed to load history");
    }

    const data = await response.json();

    setHistory(data.history || []);
  } catch (error) {
    console.error(error);
    setError("Unable to load analysis history.");
  } finally {
    setHistoryLoading(false);
  }
};

const openHistoryItem = (item) => {
  setMessage(item.message || "");
  setResult(item);
  setError("");

  setTimeout(() => {
    resultRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  }, 100);
};

  const handleExample = (example) => {
    setMessage(example);
    setResult(null);
    setError("");
  };

  const clearMessage = () => {
    setMessage("");
    setResult(null);
    setError("");
    setSelectedImage(null);

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const getRiskClass = (riskLevel) => {
    if (riskLevel === "HIGH") return "high";
    if (riskLevel === "MEDIUM") return "medium";
    return "low";
  };

  const getRiskIcon = (riskLevel) => {
    if (riskLevel === "HIGH") return "🚨";
    if (riskLevel === "MEDIUM") return "⚠️";
    return "✓";
  };

  return (
    <div className="app">
      <header className="navbar">
        <div className="brand">
          <div className="brand-icon">S</div>
          <span>Scamvex</span>
        </div>

        <div className="status">
          <span className="status-dot"></span>
          AI Protection Active
        </div>
      </header>

      <main className="main">
        <section className="hero">
          <div className="hero-badge">
            <span>✦</span> AI-POWERED SECURITY
          </div>

          <h1>
            Detect scams.
            <br />
            <span>Stay protected.</span>
          </h1>

          <p>
            Analyze suspicious messages with AI-powered scam detection and
            identify potential threats before you act.
          </p>
        </section>

        <section className="analyzer-card">
          <div className="section-heading">
            <div>
              <h2>Analyze a message</h2>
              <p>Paste an SMS, email, or suspicious message below.</p>
            </div>

            <div className="secure-label">🔒 Private analysis</div>
          </div>

          <div className="textarea-wrapper">
            <textarea
              value={message}
              onChange={(e) => {
                setMessage(e.target.value);
                setError("");
              }}
              placeholder="Paste your suspicious message here..."
              maxLength={5000}
            />

            {message && (
              <button
                className="clear-button"
                onClick={clearMessage}
                type="button"
                aria-label="Clear message"
              >
                ×
              </button>
            )}

            <div className="input-footer">
              <div className="message-stats">
                <span>
                  <b>{wordCount}</b> words
                </span>

                <span className="stat-divider">•</span>

                <span>
                  <b>{linkCount}</b> links
                </span>
              </div>

              <div className="character-count">{message.length}/5000</div>
            </div>
          </div>

          <div className="screenshot-upload">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleScreenshotUpload}
              hidden
            />

            <button
              className="upload-button"
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={ocrLoading}
            >
              {ocrLoading ? (
                <>
                  <span className="spinner"></span>
                  Extracting text...
                </>
              ) : (
                <>
                  📸 Upload Screenshot
                  <span>OCR</span>
                </>
              )}
            </button>

            <p>Upload a screenshot of an SMS, email, or suspicious message.</p>
          </div>

          {selectedImage && (
            <div className="image-preview">
              <img src={selectedImage} alt="Uploaded screenshot preview" />

              <button
                type="button"
                onClick={() => {
                  setSelectedImage(null);

                  if (fileInputRef.current) {
                    fileInputRef.current.value = "";
                  }
                }}
                aria-label="Remove screenshot"
              >
                ×
              </button>
            </div>
          )}

          <div
            className={`input-status ${
              message.trim().length >= 10 ? "ready" : ""
            }`}
          >
            <span className="input-status-dot"></span>

            <span>{messageStatus}</span>

            {message.trim().length >= 10 && (
              <span className="status-hint">
                Scamvex will analyze this message using the AI model.
              </span>
            )}
          </div>

          {error && <div className="error-message">⚠ {error}</div>}

          <button
            className={`analyze-button ${loading ? "analyzing" : ""}`}
            onClick={analyzeMessage}
            disabled={loading || message.trim().length < 10}
          >
            {loading ? (
              <>
                <span className="spinner"></span>
                Analyzing message...
              </>
            ) : (
              <>
                Analyze Message
                <span className="arrow">→</span>
              </>
            )}
          </button>

          <div className="examples">
            <span>Try an example:</span>

            {examples.map((example, index) => (
              <button
                key={index}
                className="example-button"
                onClick={() => handleExample(example)}
                type="button"
              >
                Example {index + 1}
              </button>
            ))}
          </div>
        </section>

        {result && (
          <section className="result-section result-animate" ref={resultRef}>
            <div className="result-heading">
              <div>
                <span className="eyebrow">ANALYSIS COMPLETE</span>
                <h2>Analysis Result</h2>
              </div>

              <div className="result-actions">
                <button
                  className="new-analysis-button"
                  onClick={clearMessage}
                  type="button"
                >
                  + New Analysis
                </button>

                <span className="result-check">✓</span>
              </div>
            </div>

            <div className={`risk-card ${getRiskClass(result.risk_level)}`}>
              <div className="risk-main">
                <div className="risk-icon">
                  {getRiskIcon(result.risk_level)}
                </div>

                <div className="risk-info">
                  <span className="risk-label">THREAT LEVEL</span>

                  <h3>{result.risk_level} RISK</h3>

                  <p>
                    This message has been classified as{" "}
                    <strong>{result.prediction}</strong>.
                  </p>
                </div>
              </div>

              <div className="risk-score">
                <div
                  className={`score-ring ${getRiskClass(result.risk_level)}`}
                  style={{
                    "--score": `${Math.min(result.risk_score, 100)}%`,
                  }}
                >
                  <div className="score-inner">
                    <strong>{result.risk_score}</strong>
                    <span>%</span>
                  </div>
                </div>

                <span className="score-caption">Risk Score</span>
              </div>
            </div>

            <div className="risk-meter stagger-1">
              <div className="meter-header">
                <span>Risk assessment</span>
                <span>{result.risk_score}%</span>
              </div>

              <div className="meter-track">
                <div
                  className={`meter-fill ${getRiskClass(result.risk_level)}`}
                  style={{
                    width: `${Math.min(result.risk_score, 100)}%`,
                  }}
                ></div>
              </div>

              <div className="meter-labels">
                <span>Safe</span>
                <span>Suspicious</span>
                <span>High Risk</span>
              </div>
            </div>

            <div className="result-grid stagger-2">
              <div className="info-card">
                <span className="card-icon">🎯</span>

                <div>
                  <span className="card-label">PREDICTION</span>

                  <strong>{result.prediction}</strong>
                </div>
              </div>

              <div className="info-card">
                <span className="card-icon">📈</span>

                <div>
                  <span className="card-label">SCAM PROBABILITY</span>

                  <strong>{result.scam_probability}%</strong>
                </div>
              </div>

              <div className="info-card">
                <span className="card-icon">🏷️</span>

                <div>
                  <span className="card-label">CATEGORY</span>

                  <strong>{result.category}</strong>
                </div>
              </div>
            </div>

            <div className="why-card stagger-3">
              <div className="why-header">
                <span className="why-icon">🧠</span>

                <div>
                  <h3>Why was this flagged?</h3>

                  <p>
                    Scamvex identified patterns commonly associated with
                    suspicious messages.
                  </p>
                </div>
              </div>

              <div className="why-points">
                {result.red_flags.length > 0 ? (
                  <>
                    {result.red_flags.some((flag) =>
                      flag.toLowerCase().includes("urgent"),
                    ) && (
                      <div className="why-point">
                        <span>✓</span>

                        <div>
                          <strong>Urgency & pressure</strong>

                          <p>
                            The message attempts to encourage immediate action.
                          </p>
                        </div>
                      </div>
                    )}

                    {result.red_flags.some((flag) =>
                      flag.toLowerCase().includes("personal"),
                    ) && (
                      <div className="why-point">
                        <span>✓</span>

                        <div>
                          <strong>Sensitive information</strong>

                          <p>
                            The message appears to request personal or
                            account-related information.
                          </p>
                        </div>
                      </div>
                    )}

                    {result.red_flags.some((flag) =>
                      flag.toLowerCase().includes("account"),
                    ) && (
                      <div className="why-point">
                        <span>✓</span>

                        <div>
                          <strong>Account threat</strong>

                          <p>
                            The message uses language that may create fear about
                            account access.
                          </p>
                        </div>
                      </div>
                    )}

                    {result.red_flags.some((flag) =>
                      flag.toLowerCase().includes("bank"),
                    ) && (
                      <div className="why-point">
                        <span>✓</span>

                        <div>
                          <strong>Financial context</strong>

                          <p>
                            Banking-related content can be a common indicator in
                            phishing scams.
                          </p>
                        </div>
                      </div>
                    )}
                  </>
                ) : (
                  <div className="why-point">
                    <span>✓</span>

                    <div>
                      <strong>No major warning patterns</strong>

                      <p>
                        Scamvex did not detect significant suspicious
                        indicators.
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="analysis-panel stagger-4">
              <div className="panel-header">
                <div>
                  <span className="panel-icon">🚩</span>

                  <div>
                    <h3>Red flags detected</h3>

                    <p>Potential warning signs found in this message.</p>
                  </div>
                </div>

                <span className="flag-count">{result.red_flags.length}</span>
              </div>

              {result.red_flags.length > 0 ? (
                <div className="flag-list">
                  {result.red_flags.map((flag, index) => (
                    <div className="flag-item" key={index}>
                      <span>!</span>

                      <p>{flag}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="safe-message">
                  ✓ No major red flags were detected.
                </div>
              )}
            </div>

            <div className="recommendation-card stagger-5">
              <div className="recommendation-icon">🛡️</div>

              <div>
                <span className="card-label">SAFETY RECOMMENDATION</span>

                <h3>Stay cautious</h3>

                <p>{result.recommendation}</p>
              </div>
            </div>
          </section>
        )}

        <section className="dashboard-section">
          <div className="dashboard-heading">
            <div>
              <span className="eyebrow">SECURITY OVERVIEW</span>
              <h2>Scamvex Dashboard</h2>
              <p>A quick view of your recent message analysis activity.</p>
            </div>

            <div className="dashboard-live">
              <span className="dashboard-live-dot"></span>
              Live data
            </div>
          </div>

          <div className="dashboard-stats">
            <div className="dashboard-stat">
              <div className="dashboard-stat-icon">🔍</div>
              <div>
                <span>Total analyses</span>
                <strong>{dashboardStats.total}</strong>
              </div>
            </div>

            <div className="dashboard-stat high">
              <div className="dashboard-stat-icon">🚨</div>
              <div>
                <span>High risk</span>
                <strong>{dashboardStats.high}</strong>
              </div>
            </div>

            <div className="dashboard-stat medium">
              <div className="dashboard-stat-icon">⚠️</div>
              <div>
                <span>Medium risk</span>
                <strong>{dashboardStats.medium}</strong>
              </div>
            </div>

            <div className="dashboard-stat low">
              <div className="dashboard-stat-icon">✓</div>
              <div>
                <span>Low risk</span>
                <strong>{dashboardStats.low}</strong>
              </div>
            </div>
          </div>

          <div className="dashboard-lower">
            <div className="dashboard-average">
              <div className="dashboard-card-heading">
                <div>
                  <span className="card-label">AVERAGE RISK</span>
                  <h3>{averageRisk}%</h3>
                </div>
                <span className="dashboard-average-icon">📊</span>
              </div>

              <div className="dashboard-average-track">
                <div
                  className={`dashboard-average-fill ${
                    averageRisk >= 70
                      ? "high"
                      : averageRisk >= 40
                        ? "medium"
                        : "low"
                  }`}
                  style={{ width: `${Math.min(averageRisk, 100)}%` }}
                ></div>
              </div>

              <p>
                {history.length === 0
                  ? "Analyze a message to start building your security overview."
                  : "Average risk score across your saved analyses."}
              </p>
            </div>

            <div className="dashboard-categories">
              <div className="dashboard-card-heading">
                <div>
                  <span className="card-label">TOP CATEGORIES</span>
                  <h3>Detected message types</h3>
                </div>
                <span className="dashboard-average-icon">🏷️</span>
              </div>

              {topCategories.length > 0 ? (
                <div className="category-list">
                  {topCategories.map(([category, count]) => (
                    <div className="category-row" key={category}>
                      <div className="category-name">
                        <span>{category}</span>
                        <strong>{count}</strong>
                      </div>
                      <div className="category-track">
                        <div
                          className="category-fill"
                          style={{
                            width: `${Math.max(
                              12,
                              (count / dashboardStats.total) * 100,
                            )}%`,
                          }}
                        ></div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="dashboard-no-data">
                  <span>📭</span>
                  No category data yet.
                </div>
              )}
            </div>
          </div>
        </section>

        <section className="history-section">
          <div className="history-heading">
            <div>
              <span className="eyebrow">SAVED ANALYSES</span>
              <h2>Analysis History</h2>
              <p>Your recent Scamvex analyses.</p>
            </div>

            <button
              className="history-refresh"
              type="button"
              onClick={loadHistory}
              disabled={historyLoading}
            >
              {historyLoading ? "Loading..." : "↻ Refresh"}
            </button>
          </div>

          {history.length === 0 ? (
            <div className="history-empty">
              <span>📜</span>
              <strong>No analyses yet</strong>
              <p>Your analyzed messages will appear here.</p>
            </div>
          ) : (
            <div className="history-list">
              {history.slice(0, 10).map((item, index) => (
                <button
                  className="history-item"
                  key={`${item.created_at || "analysis"}-${index}`}
                  type="button"
                  onClick={() => openHistoryItem(item)}
                >
                  <div className="history-item-main">
                    <div
                      className={`history-risk ${getRiskClass(
                        item.risk_level,
                      )}`}
                    >
                      {item.risk_level || "UNKNOWN"}
                    </div>

                    <div className="history-message">
                      <strong>{item.category || "General"}</strong>
                      <p>
                        {(item.message || "").length > 90
                          ? `${item.message.slice(0, 90)}...`
                          : item.message}
                      </p>
                    </div>
                  </div>

                  <div className="history-score">
                    <strong>{item.risk_score ?? 0}%</strong>
                    <span>Risk</span>
                  </div>
                </button>
              ))}
            </div>
          )}
        </section>

        {!result && !loading && (
          <section className="trust-section">
            <div>
              <span className="trust-icon">🧠</span>

              <strong>AI-powered analysis</strong>

              <p>Machine learning evaluates suspicious patterns.</p>
            </div>

            <div>
              <span className="trust-icon">🚩</span>

              <strong>Red flag detection</strong>

              <p>Identify common scam warning signals.</p>
            </div>

            <div>
              <span className="trust-icon">🛡️</span>

              <strong>Safety first</strong>

              <p>Get practical guidance before taking action.</p>
            </div>
          </section>
        )}
      </main>

      <footer>
        <span>Scamvex</span>
        <span>AI-powered scam detection</span>
      </footer>
    </div>
  );
}

export default App;
