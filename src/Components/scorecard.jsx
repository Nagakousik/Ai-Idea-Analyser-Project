import './scorecard.css';

const ScoreCard = ({ scores, finalScore, previousScores, showDelta = false }) => {
  const getScoreColor = (score) => {
    if (score <= 4) return 'var(--error)';
    if (score <= 7) return 'var(--warning)';
    return 'var(--success)';
  };

  const getScoreClass = (score) => {
    if (score <= 4) return 'score-low';
    if (score <= 7) return 'score-medium';
    return 'score-high';
  };

  const getDelta = (current, previous) => {
    if (!showDelta || previous === undefined) return null;
    const delta = current - previous;
    if (delta === 0) return null;
    return { value: delta, isPositive: delta > 0 };
  };

  const renderProgressBar = (score) => {
    const percentage = (score / 10) * 100;
    return (
      <div className="score-progress-bar">
        <div
          className={`score-progress-fill ${getScoreClass(score)}`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    );
  };

  // Tooltip content for each criterion
  const getTooltipText = (key) => {
    const tooltips = {
      problemValidity: 'Does this problem actually exist? Has someone lost money, time, or felt frustration because of it?',
      marketDemand: 'Would people actively seek this out? Would they pay or tell friends about it?',
      uniqueness: 'Is this different from existing solutions? Does it have a unique angle or advantage?',
      feasibility: 'Can a student with AI tools build a working demo in 2 days?'
    };
    return tooltips[key] || 'Rate from 1 (poor) to 10 (excellent)';
  };

  const items = [
    { key: 'problemValidity', label: 'Problem Validity' },
    { key: 'marketDemand', label: 'Market Demand' },
    { key: 'uniqueness', label: 'Uniqueness' },
    { key: 'feasibility', label: 'Feasibility' }
  ];

  return (
    <div className="scorecard-container">
      {items.map((item) => {
        const currentScore = scores[item.key];
        const previousScore = previousScores?.[item.key];
        const delta = getDelta(currentScore, previousScore);
        
        return (
          <div key={item.key} className="scorecard-row">
            <div className="scorecard-label">
              {item.label}
              <span 
                className="tooltip-icon" 
                data-tooltip={getTooltipText(item.key)}
                onMouseEnter={(e) => {
                  const tooltip = e.currentTarget;
                  tooltip.setAttribute('data-show', 'true');
                }}
                onMouseLeave={(e) => {
                  const tooltip = e.currentTarget;
                  tooltip.setAttribute('data-show', 'false');
                }}
              >
                ⓘ
                <span className="tooltip-text">{getTooltipText(item.key)}</span>
              </span>
            </div>
            <div className="scorecard-value-wrapper">
              <div className={`scorecard-value ${getScoreClass(currentScore)}`}>
                {currentScore}/10
              </div>
              {delta && (
                <span className={`score-delta ${delta.isPositive ? 'positive' : 'negative'}`}>
                  {delta.isPositive ? '▲' : '▼'} {Math.abs(delta)}
                </span>
              )}
            </div>
            {renderProgressBar(currentScore)}
          </div>
        );
      })}
      
      <div className="scorecard-final">
        <div className="scorecard-final-label">Final Score</div>
        <div className={`scorecard-final-value ${getScoreClass(finalScore)}`}>
          {finalScore}/10
        </div>
      </div>
    </div>
  );
};

export default ScoreCard;