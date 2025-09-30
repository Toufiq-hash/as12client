import { RouterProvider } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { AuthProvider } from "./context/AuthContext"; 
import router from "./routes/Routes";

const App = () => {
  return (
    <AuthProvider>
      <div className="min-h-screen bg-base-100 dark:bg-base-100-dark">
        <RouterProvider router={router} />
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 5000,
            style: {
              background: "var(--toast-bg, #f4f4f5)", 
              color: "var(--fallback-bc, oklch(var(--bc)/1))", 
              border: "1px solid var(--fallback-b2, oklch(var(--b2)/0.2))", 
              borderRadius: "12px", 
              padding: "12px 16px", 
              boxShadow: "0 6px 12px rgba(0, 0, 0, 0.15), 0 2px 4px rgba(0, 0, 0, 0.1)", 
              fontSize: "16px", 
              fontWeight: "500",
              maxWidth: "400px", 
              minWidth: "200px", 
            },
            success: {
              style: {
                background: "var(--toast-bg, #f0fdf4)", 
                border: "1px solid var(--fallback-su, oklch(var(--su)/0.3))", 
              },
              iconTheme: {
                primary: "var(--fallback-su, oklch(var(--su)/1))", 
                secondary: "var(--toast-bg, #f0fdf4)", 
              },
            },
            error: {
              style: {
                background: "var(--toast-bg, #fef2f2)", 
                border: "1px solid var(--fallback-er, oklch(var(--er)/0.3))", 
              },
              iconTheme: {
                primary: "var(--fallback-er, oklch(var(--er)/1))", 
                secondary: "var(--toast-bg, #fef2f2)", 
              },
            },
            
          }}
        />
      </div>
    </AuthProvider>
  );
};

export default App;
