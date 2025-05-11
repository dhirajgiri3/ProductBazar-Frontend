import { AuthProvider } from "../../../Contexts/Auth/AuthContext.js";

export const metadata = {
  title: "Login - Navkar Selection",
  description: "Login to your Navkar Selection account.",
};

export default function LoginLayout({ children }) {
  return (
    <div>
      <AuthProvider>{children}</AuthProvider>
    </div>
  );
}
