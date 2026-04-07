import { useState } from 'react';
import './Result.css';

const Result = ({ originalIdea, rewrittenIdea, scores, finalScore, onReset, onGoHome, onBackToForge }) => {
  const [copied, setCopied] = useState(false);

  const getScoreColor = (score) => {
    if (score <= 4) return '#e74c3c';
    if (score <= 7) return '#f39c12';
    return '#27ae60';
  };

  const renderProgressBarSmall = (score) => {
    const percentage = (score / 10) * 100;
    return (
      <div className="result-progress-small">
        <div
          className="result-progress-fill-small"
          style={{
            width: `${percentage}%`,
            backgroundColor: getScoreColor(score)
          }}
        />
      </div>
    );
  };

  const handleCopyIdea = (idea) => {
    navigator.clipboard.writeText(idea);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleReset = () => {
    onReset();
  };

  return (
    <div className="result-container">
      <div className="result-card">
        {/* Header */}
        <div className="result-header">
          <h1 className="result-title">IdeaForge</h1>
          <p className="result-tagline">From raw idea → forged masterpiece</p>
        </div>

        {/* Comparison Section */}
        <div className="result-comparison">
          {/* Original Idea Card */}
          <div className="result-card-original">
            <div className="result-card-header">
              <span className="result-card-badge original">Original</span>
              <button
                className="result-copy-btn"
                onClick={() => handleCopyIdea(originalIdea)}
                title="Copy original idea"
              >
                📋
              </button>
            </div>
            <div className="result-card-score">
              Final Score: {finalScore}/10
            </div>
            <div className="result-card-text">{originalIdea}</div>
            
            {/* Individual Scores */}
            <div className="result-scores-compact">
              <div className="compact-score">
                <span>Problem:</span>
                <strong style={{ color: getScoreColor(scores.problemValidity) }}>
                  {scores.problemValidity}/10
                </strong>
                {renderProgressBarSmall(scores.problemValidity)}
              </div>
              <div className="compact-score">
                <span>Market:</span>
                <strong style={{ color: getScoreColor(scores.marketDemand) }}>
                  {scores.marketDemand}/10
                </strong>
                {renderProgressBarSmall(scores.marketDemand)}
              </div>
              <div className="compact-score">
                <span>Unique:</span>
                <strong style={{ color: getScoreColor(scores.uniqueness) }}>
                  {scores.uniqueness}/10
                </strong>
                {renderProgressBarSmall(scores.uniqueness)}
              </div>
              <div className="compact-score">
                <span>Buildable:</span>
                <strong style={{ color: getScoreColor(scores.feasibility) }}>
                  {scores.feasibility}/10
                </strong>
                {renderProgressBarSmall(scores.feasibility)}
              </div>
            </div>
          </div>

          {/* Arrow */}
          <div className="result-arrow">→</div>

          {/* Rewritten Idea Card */}
          <div className="result-card-rewritten">
            <div className="result-card-header">
              <span className="result-card-badge rewritten">Forged (10/10)</span>
              <button
                className="result-copy-btn"
                onClick={() => handleCopyIdea(rewrittenIdea)}
                title="Copy forged idea"
              >
                📋
              </button>
            </div>
            <div className="result-card-score">
              Final Score: 10/10 ✓
            </div>
            <div className="result-card-text">{rewrittenIdea}</div>
            
            {/* Perfect Scores Badge */}
            <div className="result-perfect-badge">
              <span>✓</span> Problem | Market | Uniqueness | Feasibility — All 10/10
              <br />
              <span className="result-perfect-note">
                No idea is truly 10/10 in real life – use this as your best current version, then refine it through better communication and real feedback.
              </span>
            </div>
          </div>
        </div>

        {/* Improvement Summary */}
        <div className="result-summary">
          <h3 className="summary-title">What changed?</h3>
          <ul className="summary-list">
            <li>
              <span className="summary-icon">📌</span>
              <strong>Problem Validity:</strong> Forged idea targets a real, painful problem people actually face
            </li>
            <li>
              <span className="summary-icon">💰</span>
              <strong>Market Demand:</strong> Added clear value proposition that drives usage or payment
            </li>
            <li>
              <span className="summary-icon">✨</span>
              <strong>Uniqueness:</strong> Differentiated from existing solutions with a specific twist
            </li>
            <li>
              <span className="summary-icon">🛠️</span>
              <strong>Feasibility:</strong> Scoped to be buildable by a student in 2 days
            </li>
          </ul>
        </div>

        {/* Action Buttons */}
        <div className="result-actions">
          <button className="result-button reset" onClick={handleReset}>
            ← Evaluate Another Idea
          </button>
          <button
            className="result-button copy-all"
            onClick={() => handleCopyIdea(rewrittenIdea)}
          >
            {copied ? '✓ Copied!' : '📋 Copy Forged Idea'}
          </button>
          {onBackToForge && (
            <button type="button" className="result-button back" onClick={onBackToForge}>
              ← Back to Forge
            </button>
          )}
          {onGoHome && (
            <button type="button" className="result-button home" onClick={onGoHome}>
              Home
            </button>
          )}
        </div>

        {/* Footer Note */}
        <div className="result-footer">
          <p>Use this forged idea as your starting point. Build it. Ship it. Win.</p>
        </div>
      </div>
    </div>
  );
};

export default Result;