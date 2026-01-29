"use client";

import React, { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { CheckCircle2, XCircle, Loader2 } from "lucide-react";

function ConfirmInner() {
  const searchParams = useSearchParams();
  const code = searchParams.get("code");

  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [message, setMessage] = useState("");
  const [userPosition, setUserPosition] = useState<number | null>(null);

  useEffect(() => {
    if (!code) {
      setStatus("error");
      setMessage("invalid confirmation link");
      return;
    }

    // Validate code format (8 uppercase alphanumeric)
    if (!/^[A-Z0-9]{8}$/.test(code)) {
      setStatus("error");
      setMessage("invalid confirmation code format");
      return;
    }

    confirmEmail(code);
  }, [code]);

  const confirmEmail = async (referralCode: string) => {
    try {
      // Call secure API route instead of direct Supabase call
      const response = await fetch('/api/confirm-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: referralCode })
      });

      const data = await response.json();

      if (!response.ok) {
        setStatus("error");
        setMessage(data.error || "confirmation failed");
        return;
      }

      setUserPosition(data.position);
      setStatus("success");
      setMessage(data.alreadyConfirmed 
        ? "your email was already confirmed" 
        : "your email has been confirmed");

      // Redirect after 3 seconds
      setTimeout(() => {
        window.location.href = "/";
      }, 3000);
    } catch (error) {
      console.error("Confirmation error:", error);
      setStatus("error");
      setMessage("something went wrong please try again");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-white p-4 apple-font">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="max-w-md w-full glass-card p-8 text-center"
      >
        {status === "loading" && (
          <>
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              className="w-16 h-16 mx-auto mb-4"
            >
              <Loader2 className="w-16 h-16 text-blue-600" />
            </motion.div>
            <h1 className="text-2xl font-bold mb-2">confirming your email</h1>
            <p className="text-gray-600">please wait</p>
          </>
        )}

        {status === "success" && (
          <>
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 200 }}
              className="w-16 h-16 mx-auto mb-4 bg-green-100 rounded-full flex items-center justify-center"
            >
              <CheckCircle2 className="w-10 h-10 text-green-600" />
            </motion.div>
            <h1 className="text-2xl font-bold mb-2">email confirmed 🎉</h1>
            <p className="text-gray-600 mb-4">{message}</p>

            {userPosition !== null && (
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-4">
                <p className="text-sm text-gray-600">your position</p>
                <p className="text-3xl font-bold text-blue-600">#{userPosition}</p>
              </div>
            )}

            <p className="text-sm text-gray-500">redirecting you to the waitlist</p>
          </>
        )}

        {status === "error" && (
          <>
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 200 }}
              className="w-16 h-16 mx-auto mb-4 bg-red-100 rounded-full flex items-center justify-center"
            >
              <XCircle className="w-10 h-10 text-red-600" />
            </motion.div>
            <h1 className="text-2xl font-bold mb-2">confirmation failed</h1>
            <p className="text-gray-600 mb-6">{message}</p>
            <a
              href="/"
              className="inline-block bg-blue-600 text-white px-6 py-3 rounded-full font-semibold hover:bg-blue-700 transition-colors"
            >
              back to homepage
            </a>
          </>
        )}
      </motion.div>

      <style jsx global>{`
        .apple-font {
          font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Display', 'SF Pro Text', sans-serif;
          -webkit-font-smoothing: antialiased;
        }
        .glass-card {
          background: rgba(255, 255, 255, 0.9);
          backdrop-filter: blur(10px);
          border: 1px solid rgba(0, 0, 0, 0.05);
          border-radius: 1rem;
          box-shadow: 0 10px 40px rgba(0, 0, 0, 0.1);
        }
      `}</style>
    </div>
  );
}

export default function ConfirmPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">loading...</div>}>
      <ConfirmInner />
    </Suspense>
  );
}