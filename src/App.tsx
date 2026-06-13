import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { MainLayout } from '@/components/Layout/MainLayout';
import { StandardListPage } from '@/pages/StandardList';
import { StandardDetailPage } from '@/pages/StandardDetail';
import { MappingPage } from '@/pages/Mapping';
import { AuditPage } from '@/pages/Audit';
import { ReferencePage } from '@/pages/Reference';

export default function App() {
  return (
    <Router>
      <Routes>
        <Route element={<MainLayout />}>
          <Route path="/" element={<StandardListPage />} />
          <Route path="/standard/:id" element={<StandardDetailPage />} />
          <Route path="/standard/new" element={<StandardDetailPage />} />
          <Route path="/mapping" element={<MappingPage />} />
          <Route path="/audit" element={<AuditPage />} />
          <Route path="/reference" element={<ReferencePage />} />
        </Route>
      </Routes>
    </Router>
  );
}
