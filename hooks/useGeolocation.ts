"use client";

import { GPS_OPTIONS } from "@/lib/constants";
import { useCallback, useEffect, useState } from "react";

type GeoState =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "ok"; lat: number; lng: number }
  | { status: "denied" | "timeout" | "unsupported" | "error" };

export function useGeolocation() {
  const [state, setState] = useState<GeoState>({ status: "idle" });

  const request = useCallback(() => {
    if (typeof navigator === "undefined" || !navigator.geolocation) {
      setState({ status: "unsupported" });
      return;
    }
    setState({ status: "loading" });
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setState({
          status: "ok",
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
        });
      },
      (err) => {
        if (err.code === err.PERMISSION_DENIED) setState({ status: "denied" });
        else if (err.code === err.TIMEOUT) setState({ status: "timeout" });
        else setState({ status: "error" });
      },
      GPS_OPTIONS
    );
  }, []);

  useEffect(() => {
    request();
  }, [request]);

  return { ...state, request };
}
