import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";

import { AuthProvider } from "@/context/AuthContext";
import { CartProvider } from "@/context/CartContext";
import MainLayout from "@/components/layout/MainLayout";
import ProtectedRoute from "@/components/ProtectedRoute";

import HomePage from "./pages/HomePage";
import CatalogPage from "./pages/CatalogPage";
import ProductDetailPage from "./pages/ProductDetailPage";
import CartPage from "./pages/CartPage";
import CheckoutPage from "./pages/CheckoutPage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import OrdersPage from "./pages/OrdersPage";
import SecondHandPage from "./pages/SecondHandPage";
import SellerDashboardPage from "./pages/SellerDashboardPage";
import PublishItemPage from "./pages/PublishItemPage";
import AdminPage from "./pages/AdminPage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <CartProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <MainLayout>
              <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/catalogo" element={<CatalogPage />} />
                <Route path="/producto/:id" element={<ProductDetailPage />} />
                <Route path="/carrito" element={<CartPage />} />
                <Route path="/segunda-mano" element={<SecondHandPage />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/registro" element={<RegisterPage />} />

                <Route path="/checkout" element={
                  <ProtectedRoute><CheckoutPage /></ProtectedRoute>
                } />
                <Route path="/mis-pedidos" element={
                  <ProtectedRoute><OrdersPage /></ProtectedRoute>
                } />
                <Route path="/vendedor" element={
                  <ProtectedRoute roles={["seller", "admin"]}><SellerDashboardPage /></ProtectedRoute>
                } />
                <Route path="/vendedor/publicar" element={
                  <ProtectedRoute roles={["seller", "admin", "user"]}><PublishItemPage /></ProtectedRoute>
                } />
                <Route path="/admin" element={
                  <ProtectedRoute roles={["admin"]}><AdminPage /></ProtectedRoute>
                } />

                <Route path="*" element={<NotFound />} />
              </Routes>
            </MainLayout>
          </BrowserRouter>
        </TooltipProvider>
      </CartProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
