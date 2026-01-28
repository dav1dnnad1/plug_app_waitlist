"use client";

import React, { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { motion } from "framer-motion";
import { CheckCircle2, XCircle, Loader2 } from "lucide-react";

function ConfirmInner() {
  const searchParams = useSearchParams();
  const code = searchParams.get("code");

  const [status, setStatus] = useState<"loading" | "success" | "error">(
    "loading"
  );
  const [message, setMessage] = useState("");
  const [userPosition, setUserPosition] = useState<number | null>(null);

  useEffect(() => {
    if (!code) {
      setStatus("error");
      setMessage("Invalid confirmation link");
      return;
    }

    confirmEmail(code);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [code]);

  const confirmEmail = async (referralCode: string) => {
    try {
      // Find user by referral code
      const { data: user, error: fetchError } = await supabase
        .from("waitlist")
        .select("*")
        .eq("referral_code", referralCode)
        .single();

      if (fetchError || !user) {
        setStatus("error");
        setMessage("Invalid confirmation code");
        return;
      }

      if (user.confirmed) {
        setStatus("success");
        setMessage("Your email was already confirmed!");

        // Get position
        const { count } = await supabase
          .from("waitlist")
          .select("*", { count: "exact", head: true })
          .lte("created_at", user.created_at);

        setUserPosition(count || 0);
        return;
      }

      // Update user as confirmed
      const { error: updateError } = await supabase
        .from("waitlist")
        .update({
          confirmed: true,
          confirmed_at: new Date().toISOString(),
        })
        .eq("referral_code", referralCode);

      if (updateError) {
        setStatus("error");
        setMessage("Failed to confirm email");
        return;
      }

      // Get user position
      const { count } = await supabase
        .from("waitlist")
        .select("*", { count: "exact", head: true })
        .lte("created_at", user.created_at);

      setUserPosition(count || 0);
      setStatus("success");
      setMessage("Your email has been confirmed!");

      // Redirect to homepage after 3 seconds
      setTimeout(() => {
        window.location.href = "/";
      }, 3000);
    } catch (error) {
      console.error("Confirmation error:", error);
      setStatus("error");
      setMessage("Something went wrong. Please try again.");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center"
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
            <h1 className="text-2xl font-bold mb-2 lowercase">
              confirming your email...
            </h1>
            <p className="text-gray-600 lowercase">please wait</p>
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
            <h1 className="text-2xl font-bold mb-2 lowercase">
              email confirmed! 🎉
            </h1>
            <p className="text-gray-600 lowercase mb-4">{message}</p>

            {userPosition !== null && (
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-4">
                <p className="text-sm text-gray-600 lowercase">your position</p>
                <p className="text-3xl font-bold text-blue-600">
                  #{userPosition}
                </p>
              </div>
            )}

            <p className="text-sm text-gray-500 lowercase">
              redirecting you to the waitlist...
            </p>
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
            <h1 className="text-2xl font-bold mb-2 lowercase">
              confirmation failed
            </h1>
            <p className="text-gray-600 lowercase mb-6">{message}</p>
            <a
              href="/"
              className="inline-block bg-blue-600 text-white px-6 py-3 rounded-full font-semibold hover:bg-blue-700 transition-colors lowercase"
            >
              back to homepage
            </a>
          </>
        )}
      </motion.div>
    </div>
  );
}

export default function ConfirmPage() {
  return (
    <Suspense fallback={<div className="min-h-screen p-6">Loading...</div>}>
      <ConfirmInner />
    </Suspense>
  );
}
