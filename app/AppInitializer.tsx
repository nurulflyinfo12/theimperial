"use client";

import { useEffect, useRef } from "react";
import { useApplication } from "../redux/hook/useApplicationDetails";

export default function AppInitializer() {
  const { fetchApplication } = useApplication();
  const fetchedRef = useRef(false);

  useEffect(() => {
    if (fetchedRef.current) return;

    fetchedRef.current = true;
    // console.log("api call fatch")
    fetchApplication();
  }, [fetchApplication]);

  return null;
}