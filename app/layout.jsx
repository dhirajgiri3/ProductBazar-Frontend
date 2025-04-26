import { Inter } from "next/font/google";
import "./globals.css";
import StyledComponentsRegistry from "../Lib/registry";
import GlobalStyle from "../public/Assets/Style/GlobalStyle.jsx";
import Footer from "../Components/Footer/Footer";
import { AuthProvider } from "../Contexts/Auth/AuthContext";
import { Toaster } from "react-hot-toast";
import { ToastProvider } from "../Contexts/Toast/ToastContext";
import { CategoryProvider } from "../Contexts/Category/CategoryContext";
import { ProductProvider } from "../Contexts/Product/ProductContext";
import { ProjectProvider } from "../Contexts/Project/ProjectContext";
import { RecommendationProvider } from "../Contexts/Recommendation/RecommendationContext";
import { SocketProvider } from "../Contexts/Socket/SocketContext";
import { ViewProvider } from "../Contexts/View/ViewContext";
import Header from "../Components/Header/Header";
import runAllCleanup from "../Utils/cleanupUtils";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "Product Bazar - Product Marketplace for Startups",
  description:
    "Product Bazar is a product marketplace for startups. We help startups find product-market fit by providing them with the tools and resources they need to succeed.",
  keywords:
    "product marketplace, product-market fit, startup, tools, resources, success",
};

export default function RootLayout({ children }) {
  // Run cleanup on application startup
  if (typeof window !== 'undefined') {
    runAllCleanup();
  }

  return (
    <html lang="en">
      <body className={inter.className}>
        <ToastProvider>
          <StyledComponentsRegistry>
            <AuthProvider>
              <ProductProvider>
                <ProjectProvider>
                  <CategoryProvider>
                    <RecommendationProvider>
                      <SocketProvider>
                        <ViewProvider>
                          <GlobalStyle />
                          <Header />
                          {children}
                          <Toaster />
                          <Footer />
                        </ViewProvider>
                      </SocketProvider>
                    </RecommendationProvider>
                  </CategoryProvider>
                </ProjectProvider>
              </ProductProvider>
            </AuthProvider>
          </StyledComponentsRegistry>
        </ToastProvider>
      </body>
    </html>
  );
}
