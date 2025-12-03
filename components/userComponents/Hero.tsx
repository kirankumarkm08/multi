"use client";

import { Button } from "@/components/ui/button";
import Link from "next/link";
import Alert from "@mui/material/Alert";
import { useState } from "react";

export default function HeroSection() {
  const [showAlert, setShowAlert] = useState(true);

  return (
    <section className="relative bg-gradient-to-r from-indigo-600 to-indigo-800 text-white">
      <div className="container mx-auto px-6 lg:px-12 py-20 flex flex-col items-center text-center">
        
        {/* Alert Message */}
        {/* {showAlert && (
          <Alert 
            severity="info" 
            onClose={() => setShowAlert(false)}
            sx={{ 
              mb: 3, 
              width: '100%', 
              maxWidth: '600px',
              backgroundColor: 'rgba(255, 255, 255, 0.95)'
            }}
          >
            Welcome to our Multi-Tenant Platform! Manage multiple clients seamlessly from a single dashboard.
          </Alert>
        )} */}
        
        {/* Heading */}
        <h1 className="text-4xl lg:text-6xl font-extrabold leading-tight">
          Multi-Tenant <span className="text-yellow-300">Platform</span>
        </h1>

        {/* Description */}
        <p className="mt-6 text-lg lg:text-xl max-w-2xl">
          A secure and scalable SaaS solution with tenant-based architecture. 
          Manage multiple clients from a single platform.
        </p>

        {/* Button */}
        <div className="mt-8">
          <Link href="/admin-login">
            <Button className="bg-yellow-400 text-black hover:bg-yellow-300 text-lg px-6 py-3 rounded-xl shadow-lg">
              Go to Admin Login
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}
