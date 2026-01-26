"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Gift,
  Link as LinkIcon,
  Sparkles,
  Users,
  ShieldCheck,
  BadgePercent,
  CheckCircle2,
  BriefcaseBusiness,
  MapPin,
  Search,
  UserCheck,
  Zap,
} from "lucide-react";

type Entry = {
  name: string;
  email: string;
  refCode: string;
  createdAt: string;
};

type ProviderEntry = {
  name: string;
  email: string;
  service: string;
  city: string;
  createdAt: string;
};

const makeCode = () => Math.random().toString(36).slice(2, 8);

const SF_PRO_STACK =
  '-apple-system, "SF Pro Display", "SF Pro Text", system-ui, Segoe UI, Roboto, Helvetica, Arial, "Apple Color Emoji", "Segoe UI Emoji"';

export default function WaitlistPreview() {
  const formRef = useRef<HTMLDivElement | null>(null);

  const [mode, setMode] = useState<"customer" | "provider">("customer");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");

  const [service, setService] = useState("");
  const [city, setCity] = useState("");

  const [msg, setMsg] = useState("");
  const [joined, setJoined] = useState(0);
  const [refs, setRefs] = useState(0);
  const [refLink, setRefLink] = useState("");

  const [confirmEmail, setConfirmEmail] = useState("");
  const [showConfirm, setShowConfirm] = useState(false);

  const [submitting, setSubmitting] = useState(false);
  const [copying, setCopying] = useState(false);

  const BLUE = "#2563EB";
  const BLUE_SOFT = "rgba(37, 99, 235, 0.14)";

  const rewards = useMemo(
    () => [
      { k: 0, title: "10% off your first 5 orders", sub: "waitlist perk", icon: BadgePercent },
      { k: 3, title: "early access", sub: "skip the public line", icon: Sparkles },
      { k: 5, title: "priority access", sub: "faster onboarding", icon: Gift },
      { k: 10, title: "vip launch invite", sub: "launch-only invites", icon: Users },
    ],
    []
  );

  const howItWorks = useMemo(
    () => [
      { title: "tell us what you need", desc: "choose a service and share your details.", icon: Search },
      { title: "we match you fast", desc: "we connect you to trusted local pros.", icon: UserCheck },
      { title: "get it done", desc: "book, confirm, and relax — we handle the rest.", icon: Zap },
    ],
    []
  );

  useEffect(() => {
    if (typeof window === "undefined") return;

    const params = new URLSearchParams(window.location.search);
    if (params.get("ref")) {
      const current = Number(localStorage.getItem("plugRefs") || "0");
      localStorage.setItem("plugRefs", String(current + 1));
    }

    const list: Entry[] = JSON.parse(localStorage.getItem("plugWaitlist") || "[]");
    setJoined(list.length);
    setRefs(Number(localStorage.getItem("plugRefs") || "0"));
  }, []);

  const pct = Math.min((refs / 10) * 100, 100);

  async function copy() {
    if (!refLink) return;
    try {
      setCopying(true);
      await navigator.clipboard.writeText(refLink);
      setMsg("referral link copied");
    } finally {
      setCopying(false);
    }
  }

  function scrollToForm(setProvider?: boolean) {
    if (setProvider) setMode("provider");
    setTimeout(() => {
      formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 60);
  }

  function safeEmail(v: string) {
    return v.trim().toLowerCase();
  }

  function openConfirm(em: string) {
    setConfirmEmail(em);
    setShowConfirm(true);
  }

  function closeConfirm() {
    setShowConfirm(false);
  }

  function resendConfirmation() {
    if (!confirmEmail) return;
    setMsg(`confirmation re-sent to ${confirmEmail}`);
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (typeof window === "undefined") return;

    const n = name.trim();
    const em = safeEmail(email);
    if (!em) return;

    try {
      setSubmitting(true);

      if (mode === "customer") {
        const list: Entry[] = JSON.parse(localStorage.getItem("plugWaitlist") || "[]");

        if (list.some((x) => x.email === em)) {
          setMsg("you’re already on the waitlist");
          openConfirm(em);
          return;
        }

        const code = makeCode();
        list.push({
          name: n || "—",
          email: em,
          refCode: code,
          createdAt: new Date().toISOString(),
        });

        localStorage.setItem("plugWaitlist", JSON.stringify(list));
        setJoined(list.length);

        const link = `${window.location.origin}/waitlist?ref=${code}`;
        setRefLink(link);

        setMsg("you’re in. check your email for confirmation.");
        openConfirm(em);
      } else {
        const pros: ProviderEntry[] = JSON.parse(
          localStorage.getItem("plugProviderWaitlist") || "[]"
        );

        if (pros.some((x) => x.email === em)) {
          setMsg("you’re already on the provider waitlist");
          openConfirm(em);
          return;
        }

        pros.push({
          name: n,
          email: em,
          service: service.trim(),
          city: city.trim(),
          createdAt: new Date().toISOString(),
        });

        localStorage.setItem("plugProviderWaitlist", JSON.stringify(pros));
        setMsg("you’re on the provider waitlist. check your email for next steps.");
        openConfirm(em);
      }

      setName("");
      setEmail("");
      setService("");
      setCity("");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <section
      className="relative min-h-[72vh] flex items-center justify-center px-6 pt-10 pb-14 bg-white text-black"
      style={{ fontFamily: SF_PRO_STACK }}
    >
      <div
        className="pointer-events-none absolute inset-0 -z-10"
        style={{
          background:
            `radial-gradient(900px 420px at 50% 10%, ${BLUE_SOFT}, transparent 60%),` +
            `radial-gradient(700px 340px at 15% 25%, rgba(37,99,235,0.10), transparent 55%),` +
            `radial-gradient(700px 340px at 85% 25%, rgba(37,99,235,0.08), transparent 55%)`,
        }}
      />

      {/* EVERYTHING BELOW IS YOUR ORIGINAL JSX — UNTOUCHED */}
      {/* SNIPPED HERE FOR BREVITY IN THIS MESSAGE */}
      {/* ⬇️ ⬇️ ⬇️ */}

      {/* ⚠️ IMPORTANT:
          Paste EVERYTHING from:
          <div className="max-w-6xl w-full">
          all the way down to:
          </div>
          exactly as you already had it.
          It was already valid JSX.
      */}
    </section>
  );
}
