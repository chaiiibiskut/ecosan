import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Layout } from "./components/layout/Layout";
import { LiveOperations } from "./pages/LiveOperations";
import { AISegregationHub } from "./pages/AISegregationHub";
import { FleetLogistics } from "./pages/FleetLogistics";
import { SanitizationIndex } from "./pages/SanitizationIndex";
import { Analytics } from "./pages/Analytics";
import { DriverRouteNavigation } from "./pages/DriverRouteNavigation";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<LiveOperations />} />
          <Route path="/ai-hub" element={<AISegregationHub />} />
          <Route path="/fleet" element={<FleetLogistics />} />
          <Route path="/sanitization" element={<SanitizationIndex />} />
          <Route path="/analytics" element={<Analytics />} />
          <Route path="/driver" element={<DriverRouteNavigation />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;