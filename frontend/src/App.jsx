import React, { useEffect } from "react";
import { Route, Routes, useLocation } from "react-router-dom";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import FloatingCallButton from "./components/FloatingCallButton";
import ProtectedRoute from "./components/ProtectedRoute";
import AdminLayout from "./layouts/AdminLayout";
import Home from "./pages/Home";
import About from "./pages/About";
import Services from "./pages/Services";
import Blog from "./pages/Blog";
import BlogDetails from "./pages/BlogDetails";
import Contact from "./pages/Contact";
import AdminLogin from "./pages/AdminLogin";
import Dashboard from "./admin/Dashboard";
import BlogsAdmin from "./admin/BlogsAdmin";
import ProjectsAdmin from "./admin/ProjectsAdmin";
import ServicesAdmin from "./admin/ServicesAdmin";
import LeadsAdmin from "./admin/LeadsAdmin";
import SettingsAdmin from "./admin/SettingsAdmin";
import WorkflowAdmin from "./admin/WorkflowAdmin";
import TrustedAdmin from "./admin/TrustedAdmin";
import ItemsAdmin from "./admin/ItemsAdmin";
import ClientsAdmin from "./admin/ClientsAdmin";
import DocumentsAdmin from "./admin/DocumentsAdmin";
import DocumentEditor from "./admin/DocumentEditor";
import AgreementsAdmin from "./admin/AgreementsAdmin";
import AgreementEditor from "./admin/AgreementEditor";
import AgreementPreview from "./admin/AgreementPreview";
import AgreementTemplateAdmin from "./admin/AgreementTemplateAdmin";

const ScrollToTop = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    const lenis = window.__lenis;
    if (lenis?.scrollTo) {
      lenis.scrollTo(0, { immediate: true });
      return;
    }

    window.scrollTo({ top: 0, left: 0, behavior: "auto" });
  }, [pathname]);

  return null;
};

const PublicLayout = ({ children }) => (
  <>
    <Navbar />
    {children}
    <FloatingCallButton />
    <Footer />
  </>
);

const App = () => (
  <>
    <ScrollToTop />
    <Routes>
      <Route path="/" element={<PublicLayout><Home /></PublicLayout>} />
      <Route path="/about" element={<PublicLayout><About /></PublicLayout>} />
      <Route path="/services" element={<PublicLayout><Services /></PublicLayout>} />
      <Route path="/blog" element={<PublicLayout><Blog /></PublicLayout>} />
      <Route path="/blog/:id" element={<PublicLayout><BlogDetails /></PublicLayout>} />
      <Route path="/contact" element={<PublicLayout><Contact /></PublicLayout>} />
      <Route path="/admin/login" element={<AdminLogin />} />
      <Route path="/secure-admin-portal-9483" element={<AdminLogin />} />
      <Route element={<ProtectedRoute />}>
        <Route path="/secure-admin-dashboard" element={<AdminLayout />}>
          <Route index element={<Dashboard />} />
          <Route path="blogs" element={<BlogsAdmin />} />
          <Route path="projects" element={<ProjectsAdmin />} />
          <Route path="services" element={<ServicesAdmin />} />
          <Route path="leads" element={<LeadsAdmin />} />
          <Route path="settings" element={<SettingsAdmin />} />
          <Route path="workflow" element={<WorkflowAdmin />} />
          <Route path="trusted" element={<TrustedAdmin />} />
          <Route path="items" element={<ItemsAdmin />} />
          <Route path="clients" element={<ClientsAdmin />} />
          <Route path="agreements" element={<AgreementsAdmin />} />
          <Route path="agreements/template" element={<AgreementTemplateAdmin />} />
          <Route path="agreements/create" element={<AgreementEditor />} />
          <Route path="agreements/:id/edit" element={<AgreementEditor />} />
          <Route path="agreements/:id/preview" element={<AgreementPreview />} />
          <Route path="estimates" element={<DocumentsAdmin type="estimate" />} />
          <Route path="quotations" element={<DocumentsAdmin type="quotation" />} />
          <Route path="invoices" element={<DocumentsAdmin type="invoice" />} />
          <Route path="documents/create/:type" element={<DocumentEditor />} />
          <Route path="documents/:id" element={<DocumentEditor />} />
        </Route>
      </Route>
      <Route path="*" element={<PublicLayout><Home /></PublicLayout>} />
    </Routes>
  </>
);

export default App;
