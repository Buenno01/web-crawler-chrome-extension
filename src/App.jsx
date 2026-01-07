import { Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Settings from "./pages/Settings";
import Reports from "./pages/Reports";
import Layout from "./components/Layout";
import Storage from "./pages/Storage";
import SummaryReport from "./pages/Reports/SummaryReport";
import HeadingsReport from "./pages/Reports/HeadingsReport";
import LinksReport from "./pages/Reports/LinksReport";

function PlaceHolder ({ text }) {
  return (
    <div className="text-center text-foreground-secondary/60 py-8">
      <p>{ text }</p>
    </div>
  )
}

function App() {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<Home />} />
        <Route path="settings" element={<Settings />} />
        <Route path="reports" element={<Reports />}>
          <Route index path="*" element={ <SummaryReport /> } />
          <Route path="metadata" element={ <PlaceHolder text="Metadata report coming soon..." /> } />
          <Route path="seo" element={ <PlaceHolder text="SEO report coming soon..." /> } />
          <Route path="headings" element={ <HeadingsReport /> } />
          <Route path="links" element={ <LinksReport /> } />
          <Route path="css-selectors" element={ <PlaceHolder text="CSS selectors report coming soon..." /> } />
        </Route>
        <Route path="storage" element={<Storage />} />
      </Route>
    </Routes>
  );
}

export default App;
