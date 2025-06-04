
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Welcome from "./pages/Welcome";
import CategorySelection from "./pages/CategorySelection";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import ItemDetail from "./pages/ItemDetail";
import Brands from "./pages/Brands";
import BrandDetail from "./pages/BrandDetail";
import Favorites from "./pages/Favorites";
import NotFound from "./pages/NotFound";

const App = () => {
  return (
    <TooltipProvider delayDuration={0}>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/welcome" element={<Welcome />} />
          <Route path="/category-selection" element={<CategorySelection />} />
          <Route path="/register" element={<Register />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/item/:id" element={<ItemDetail />} />
          <Route path="/brands" element={<Brands />} />
          <Route path="/brands/:brandId" element={<BrandDetail />} />
          <Route path="/favorites" element={<Favorites />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  );
};

export default App;
