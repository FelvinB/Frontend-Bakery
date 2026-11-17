import "@/styles/global.css";

import { createRoot } from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router";
import AppLayout from "@/layouts/AppLayout";
import Dashboard from "@/pages/dashboard";
import CustomersPage from "@/pages/customers";
import ProductsPage from "@/pages/products";
import SalesPage from "@/pages/sales";
import InventoryPage from "@/pages/inventory";
import MarketingPage from "@/pages/marketing";
import DescriptivePage from "@/pages/analytics/descriptive";
import PredictivePage from "@/pages/analytics/predictive";
import PrescriptivePage from "@/pages/analytics/prescriptive";

createRoot(document.getElementById("root")!).render(
  <BrowserRouter>
    <Routes>
      <Route element={<AppLayout />}>
        <Route path="/" element={<Dashboard />} />
        <Route path="/customers" element={<CustomersPage />} />
        <Route path="/products" element={<ProductsPage />} />
        <Route path="/sales" element={<SalesPage />} />
        <Route path="/inventory" element={<InventoryPage />} />
        <Route path="/marketing" element={<MarketingPage />} />
        <Route path="/analytics/descriptive" element={<DescriptivePage />} />
        <Route path="/analytics/predictive" element={<PredictivePage />} />
        <Route path="/analytics/prescriptive" element={<PrescriptivePage />} />
      </Route>
    </Routes>
  </BrowserRouter>
);
