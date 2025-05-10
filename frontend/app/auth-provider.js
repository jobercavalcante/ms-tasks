"use client";

import { useState, useEffect } from "react";
import dynamic from "next/dynamic";

// Carregamento dinâmico do componente de logout
const Navbar = dynamic(() => import("../components/navbar"), {
  ssr: false, // Isto impede a renderização do componente no servidor
});

export default function AuthStatusProvider() {
  const [isMounted, setIsMounted] = useState(false);

  // Garantir que a renderização só aconteça no cliente
  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return null;
  }

  return <Navbar />;
}
