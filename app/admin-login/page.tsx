"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../../context/AuthContext";
import { tenantApi } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import Alert from "@mui/material/Alert";
import Snackbar from "@mui/material/Snackbar";
import IconButton from "@mui/material/IconButton";
import CloseIcon from "@mui/icons-material/Close";
import Image from "next/image";
import ReCAPTCHA from "react-google-recaptcha";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState<"error" | "success">(
    "error"
  );
  const [isLogo, setLogo] = useState<{
    logo_url: string;
    primary_color: string;
    secondary_color: string;
    font_family: string;
  } | null>(null);
  const router = useRouter();
  const { setToken } = useAuth();
  const { toast } = useToast();
  const recaptchaRef = useRef<ReCAPTCHA>(null);
  const [captchaToken, setCaptchaToken] = useState<string | null>(null);
  const [isCaptchaLoaded, setIsCaptchaLoaded] = useState(false);

  const onCaptchaChange = (token: string | null) => {
    setCaptchaToken(token);
  };

  const showToast = (
    message: string,
    severity: "error" | "success" = "error"
  ) => {
    setSnackbarMessage(message);
    setSnackbarSeverity(severity);
    setOpenSnackbar(true);
  };

  const handleCloseSnackbar = (
    event?: React.SyntheticEvent | Event,
    reason?: string
  ) => {
    if (reason === "clickaway") {
      return;
    }
    setOpenSnackbar(false);
  };

  useEffect(() => {
    // Check if user is already authenticated
    const checkAuth = () => {
      const storedToken = localStorage.getItem("access_token");
      if (storedToken) {
        router.replace("/admin");
      }
    };

    // Show redirect reason if any
    if (typeof window !== "undefined") {
      const reason = localStorage.getItem("auth_redirect_reason");
      if (reason) {
        toast({
          title: "Please sign in",
          description: reason,
        });
        localStorage.removeItem("auth_redirect_reason");
      }
      checkAuth();
    }
  }, [router, toast]);

  const validate = () => {
    let valid = true;
    const errors = [];

    if (!email.trim()) {
      errors.push("Email is required");
      valid = false;
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      errors.push("Please enter a valid email address");
      valid = false;
    }

    if (!password.trim()) {
      errors.push("Password is required");
      valid = false;
    } else if (password.length < 6) {
      errors.push("Password must be at least 6 characters");
      valid = false;
    }

    if (!captchaToken) {
      errors.push("Please complete the reCAPTCHA verification");
      valid = false;
    }

    if (!valid) {
      showToast(errors.join(", "), "error");
    }

    return valid;
  };

  useEffect(() => {
    const fetchLogo = async () => {
      try {
        const logo = await fetch(
          "https://api.testjkl.in/api/common/tenant/branding"
        );
        const result = await logo.json();
        setLogo(result?.data);
      } catch (error) {
        console.error("Error fetching logo:", error);
      }
    };

    fetchLogo();
  }, []);

  // Function to set cookie properly
  const setAuthCookie = (token: string) => {
    const expires = new Date();
    expires.setTime(expires.getTime() + 24 * 60 * 60 * 1000); // 24 hours

    document.cookie = `access_token=${token}; path=/; expires=${expires.toUTCString()}; SameSite=Strict${
      window.location.protocol === "https:" ? "; Secure" : ""
    }`;
  };

  const resetCaptcha = () => {
    if (recaptchaRef.current) {
      recaptchaRef.current.reset();
      setCaptchaToken(null);
    }
  };

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // Reset captcha state before validation
    if (!captchaToken) {
      showToast("Please complete the reCAPTCHA verification", "error");
      return;
    }

    if (!validate()) return;

    setLoading(true);

    try {
      const response = await tenantApi.login({
        email,
        password,
        recaptcha_token: captchaToken, // This should now always have a value
      });

      // Adjust token extraction based on your API response shape
      const token = response.access_token ?? response.data?.access_token;

      if (!token) {
        throw new Error(response.message || "Invalid email or password");
      }

      console.log("Login successful, setting tokens...");

      // 1. Save token in context and localStorage via setToken
      setToken(token);

      // 2. Set token as cookie for middleware authentication
      setAuthCookie(token);

      showToast("Login successful!", "success");

      // Wait a moment for state to update, then redirect
      setTimeout(() => {
        const urlParams = new URLSearchParams(window.location.search);
        const redirectPath = urlParams.get("redirect") || "/admin";
        console.log("Redirecting to:", redirectPath);
        router.push(redirectPath);
      }, 1000);
    } catch (err: any) {
      console.error("Login error:", err);
      // Reset captcha on error
      resetCaptcha();
      showToast(err.message || "Login failed. Please try again.", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="">
        {isLogo?.logo_url && (
          <div className="flex justify-center mb-4 mt-20">
            <Image
              src={isLogo.logo_url}
              alt="Tenant Logo"
              width={400}
              height={260}
              priority
            />
          </div>
        )}
      </div>
      <div className="max-w-md mx-auto mt-20 p-6 border rounded-xl shadow-lg">
        <h2 className="text-2xl font-semibold mb-4 text-center">
          Tenant Login
        </h2>
        <form onSubmit={handleLogin} className="space-y-4" noValidate>
          <div>
            <input
              type="email"
              placeholder="Email"
              className="w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
              required
            />
          </div>

          <div>
            <input
              type="password"
              placeholder="Password"
              className="w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
              required
            />
          </div>

          <div className="flex justify-center">
            <ReCAPTCHA
              ref={recaptchaRef}
              sitekey={
                process.env.NEXT_PUBLIC_RECAPTCHA_CLIENT_KEY ||
                process.env.RECAPTCHA_SERVER_KEY ||
                ""
              }
              onChange={onCaptchaChange}
              onExpired={() => {
                setCaptchaToken(null);
                showToast("reCAPTCHA expired. Please verify again.", "error");
              }}
              onErrored={() => {
                showToast("reCAPTCHA error. Please try again.", "error");
              }}
            />
          </div>

          <button
            type="submit"
            disabled={loading || !captchaToken}
            className={`w-full text-white py-2 rounded transition ${
              loading || !captchaToken
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-blue-600 hover:bg-blue-700"
            }`}
          >
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>
      </div>

      <Snackbar
        open={openSnackbar}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: "top", horizontal: "right" }}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity={snackbarSeverity}
          sx={{ width: "100%" }}
          action={
            <IconButton
              size="small"
              aria-label="close"
              color="inherit"
              onClick={handleCloseSnackbar}
            >
              <CloseIcon fontSize="small" />
            </IconButton>
          }
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </>
  );
}
