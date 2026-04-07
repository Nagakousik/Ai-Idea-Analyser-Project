import { useState, useEffect } from 'react';
import './diffviewer.css';

const DiffViewer = ({ original, rewritten }) => {
  const [diffParts, setDiffParts] = useState([]);

  useEffect(() => {
    // Simple but robust diff: show added and removed words
    const origWords = original.toLowerCase().split(/\s+/);
    const rewrittenWords = rewritten.toLowerCase().split(/\s+/);
    
    const added = rewrittenWords.filter(word => !origWords.includes(word));
    const removed = origWords.filter(word => !rewrittenWords.includes(word));
    
    // Build highlighted text for rewritten version
    let highlighted = rewritten;
    added.forEach(word => {
      const regex = new RegExp(`\\b(${word})\\b`, 'gi');
      highlighted = highlighted.replace(regex, `<mark class="diff-highlight-added">$1</mark>`);
    });
    
    setDiffParts({
      addedWords: [...new Set(added)],
      removedWords: [...new Set(removed)],
      highlightedText: highlighted
    });
  }, [original, rewritten]);

  return (
    <div className="diff-container">
      <div className="diff-header">
        <span>📝 What Changed</span>
        <span className="diff-badge">AI Improvements</span>
      </div>
      <div className="diff-content">
        <div className="diff-section original-section">
          <div className="diff-label">Original</div>
          <div className="diff-text">{original}</div>
          {diffParts.removedWords?.length > 0 && (
            <div className="diff-removed-tag">
              Removed: {diffParts.removedWords.slice(0, 5).join(', ')}
              {diffParts.removedWords.length > 5 && ` +${diffParts.removedWords.length - 5} more`}
            </div>
          )}
        </div>
        
        <div className="diff-arrow">↓</div>
        
        <div className="diff-section rewritten-section">
          <div className="diff-label">Forged</div>
          <div 
            className="diff-text"
            dangerouslySetInnerHTML={{ __html: diffParts.highlightedText || rewritten }}
          />
          {diffParts.addedWords?.length > 0 && (
            <div className="diff-added-tag">
              ✨ Added: {diffParts.addedWords.slice(0, 5).join(', ')}
              {diffParts.addedWords.length > 5 && ` +${diffParts.addedWords.length - 5} more`}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DiffViewer;