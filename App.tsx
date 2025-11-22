
import React, { useState } from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import Home from './pages/Home';
import Members from './pages/Members';
import ProfilePage from './pages/ProfilePage';
import Research from './pages/Research';
import { Demos } from './pages/Demos';
import Contact from './pages/Contact';
import NiiVuePage from './pages/demos/NiiVuePage';
import CPMPage from './pages/demos/CPMPage';
import NeuralSimPage from './pages/demos/NeuralSimPage';
import RocketPage from './pages/demos/RocketPage';
import FinancePage from './pages/demos/FinancePage';
import DataLabelingPage from './pages/demos/DataLabelingPage';
import { Language } from './types';

const App: React.FC = () => {
  const [lang, setLang] = useState<Language>('en');

  return (
    <Router>
      <Layout lang={lang} setLang={setLang}>
        <Routes>
          <Route path="/" element={<Home lang={lang} />} />
          
          {/* Members Routing */}
          <Route path="/members" element={<Members lang={lang} />} />
          <Route path="/members/:memberId" element={<ProfilePage lang={lang} />} />
          
          <Route path="/research" element={<Research lang={lang} />} />
          
          {/* Demos Routing */}
          <Route path="/demos" element={<Demos lang={lang} />} />
          <Route path="/demos/niivue" element={<NiiVuePage lang={lang} />} />
          <Route path="/demos/cpm" element={<CPMPage lang={lang} />} />
          <Route path="/demos/nn-sim" element={<NeuralSimPage lang={lang} />} />
          <Route path="/demos/rocket-sim" element={<RocketPage lang={lang} />} />
          <Route path="/demos/finance-ai" element={<FinancePage lang={lang} />} />
          <Route path="/demos/data-labeling" element={<DataLabelingPage lang={lang} />} />
          
          <Route path="/contact" element={<Contact lang={lang} />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Layout>
    </Router>
  );
};

export default App;
