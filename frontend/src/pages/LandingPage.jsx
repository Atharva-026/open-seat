import { useCallback, useState } from 'react';
import { useSmoothScroll } from '../features/landing/useSmoothScroll.js';
import GraphField from '../features/landing/GraphField.jsx';
import Loader from '../features/landing/Loader.jsx';
import TopBar from '../features/landing/TopBar.jsx';
import Hero from '../features/landing/Hero.jsx';
import Manifesto from '../features/landing/Manifesto.jsx';
import HowItWorks from '../features/landing/HowItWorks.jsx';
import Trace from '../features/landing/Trace.jsx';
import Finale from '../features/landing/Finale.jsx';
import '../features/landing/landing.css';

export default function LandingPage() {
  const [introDone, setIntroDone] = useState(false);
  const finishIntro = useCallback(() => setIntroDone(true), []);
  useSmoothScroll();

  return (
    <>
      <Loader onDone={finishIntro} />
      <GraphField />
      <div className="landing-root">
        <TopBar />
        <main>
          <Hero ready={introDone} />
          <Manifesto />
          <HowItWorks />
          <Trace />
          <Finale />
        </main>
      </div>
    </>
  );
}