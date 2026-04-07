import { useState } from 'react';
import IdeaForge from './Components/ideaforge';
import Result from './Result/Result';
import Landing from './Pages/Landing';
import About from './Pages/About';
import './App.css';

function App() {
  const [screen, setScreen] = useState('landing');
  const [resultData, setResultData] = useState(null);
  const [lastForgeData, setLastForgeData] = useState(null);

  const handleComplete = (data) => {
    setResultData(data);
    setLastForgeData(data);
  };

  const handleReset = () => {
    setResultData(null);
  };

  const goHome = () => {
    setScreen('landing');
    setResultData(null);
    setLastForgeData(null);
  };

  const backToForge = () => {
    setResultData(null);
    setScreen('forge');
  };

  if (screen === 'landing') {
    return (
      <Landing onStart={() => setScreen('forge')} onAbout={() => setScreen('about')} />
    );
  }

  if (screen === 'about') {
    return <About onBack={() => setScreen('landing')} onStart={() => setScreen('forge')} />;
  }

  return (
    <div className="app app--forge">
      <header className="app-shell-header">
        <button type="button" className="app-shell-home" onClick={goHome}>
          ← Home
        </button>
      </header>
      <main className="app-shell-main">
        {!resultData ? (
          <IdeaForge onComplete={handleComplete} initialData={lastForgeData} />
        ) : (
          <Result
            originalIdea={resultData.originalIdea}
            rewrittenIdea={resultData.rewrittenIdea}
            scores={resultData.scores}
            finalScore={resultData.finalScore}
            onReset={handleReset}
            onGoHome={goHome}
            onBackToForge={backToForge}
          />
        )}
      </main>
    </div>
  );
}

export default App;
