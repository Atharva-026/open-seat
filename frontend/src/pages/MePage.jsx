import { useOutletContext } from 'react-router-dom';
import { useMemory } from '../hooks/useMemory.js';
import SkillGraph from '../features/profile/SkillGraph.jsx';
import SkillList from '../features/profile/SkillList.jsx';
import MemoryPanel from '../features/profile/MemoryPanel.jsx';

export default function MePage() {
  const { profile } = useOutletContext();
  const { memory, save, forget, forgetAll } = useMemory();

  return (
    <div className="page">
      <header className="page-head"><h1>{profile.name}</h1></header>
      <div className="me-grid">
        <section className="card"><SkillGraph profile={profile} /></section>
        <section className="card"><SkillList skills={profile.skills} /></section>
      </div>
      <MemoryPanel memory={memory} onSave={save} onForget={forget} onForgetAll={forgetAll} />
    </div>
  );
}