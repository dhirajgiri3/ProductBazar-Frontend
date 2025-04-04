import StyledComponentsRegistry from "../../../../Lib/registry";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { AuthProvider } from "../../../../Contexts/Auth/AuthContext";

export const metadata = {
  title: "Verify Email - Navkar Selection",
  description: "Verify your email address at Navkar Selection.",
};

export default function VerifyEmailLayout({ children }) {
  return (
    <StyledComponentsRegistry>
      <div>
        <AuthProvider>
          {children}
          <ToastContainer // Move ToastContainer here and remove from the VerifyEmailPage
            position="top-right"
            autoClose={3000}
            hideProgressBar={false}
            newestOnTop={true}
            closeOnClick
            rtl={false}
            pauseOnFocusLoss
            draggable
            pauseOnHover
            theme="light"
          />
        </AuthProvider>
      </div>
    </StyledComponentsRegistry>
  );
}
