"use client";

import React from "react";
import { useAuth } from "@/context/AuthContext";

const page = () => {
  const { logout, token } = useAuth();

  return (
    <div>
      <button onClick={logout}>logout</button>
    </div>
  );
};

export default page;
