'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Share2, Zap, CheckCircle2, TrendingUp, Star, ShieldCheck, 
  Link as LinkIcon, Award, Gift, Trophy, Instagram, Twitter,
  Sparkles, Home, Scissors, User, Building2, ChevronDown, Lightbulb
} from 'lucide-react';
import { supabase } from '@/lib/supabase';

const BLUE = '#2563EB';

function Confetti() {
  return (
    <div className="fixed inset-0 pointer-events-none z-50">
      {[...Array(100)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-3 h-3 rounded-full"
          initial={{
            left: `${Math.random() * 100}%`,
            top: '-10px',
            backgroundColor: ['#3B82F6', '#8B5CF6', '#EC4899', '#F59E0B', '#10B981'][Math.floor(Math.random() * 5)],
          }}
          animate={{
            y: '110vh',
            rotate: 360,
            opacity: [1, 1, 0],
          }}
          transition={{
            duration: 2 + Math.random() * 2,
            delay: Math.random() * 0.5,
            ease: 'easeOut',
          }}
        />
      ))}
    </div>
  );
}

function RecentSignup({ firstName, timeAgo }: { firstName: string; timeAgo: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      transition={{ type: 'spring', stiffness: 500, damping: 30 }}
      className="flex items-center gap-2 text-xs text-gray-600"
    >
      <motion.div 
        className="w-2 h-2 rounded-full bg-green-500"
        animate={{ scale: [1, 1.3, 1] }}
        transition={{ repeat: Infinity, duration: 2 }}
      />
      <span className="font-semibold">{firstName}</span> just joined <span className="text-gray-400">{timeAgo}</span>
    </motion.div>
  );
}

export default function PlugWaitlist() {
  // Form fields
  const [email, setEmail] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [userType, setUserType] = useState<'user' | 'provider' | ''>('');
  const [selectedServices, setSelectedServices] = useState<string[]>([]);
  const [providerType, setProviderType] = useState('');
  const [location, setLocation] = useState('');
  const [suggestion, setSuggestion] = useState('');
  
  // UI state
  const [submitting, setSubmitting] = useState(false);
  const [msg, setMsg] = useState('');
  const [showConfirm, setShowConfirm] = useState(false);
  const [confirmEmail, setConfirmEmail] = useState('');
  const [refLink, setRefLink] = useState('');
  const [copying, setCopying] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [emailError, setEmailError] = useState('');
  
  // Stats
  const [refs, setRefs] = useState(0);
  const [joined, setJoined] = useState(0);
  const [todayJoined, setTodayJoined] = useState(0);
  const [userPosition, setUserPosition] = useState<number | null>(null);
  
  // Leaderboard & Activity
  const [leaderboard, setLeaderboard] = useState<Array<{ firstName: string; lastName: string; refs: number; id: string }>>([]);
  const [recentSignups, setRecentSignups] = useState<Array<{ firstName: string; timeAgo: string; id: string }>>([]);
  
  const formRef = useRef<HTMLDivElement>(null);
  const pct = Math.min((refs / 10) * 100, 100);

  // Service categories - NO EMOJIS
  const userServices = [
    { id: 'hair', label: 'hair & beauty', icon: Sparkles },
    { id: 'fashion', label: 'fashion/tailoring', icon: Scissors },
    { id: 'cleaning', label: 'home cleaning', icon: Home }
  ];

  const providerServices = [
    { id: 'hairstyling', label: 'hair styling' },
    { id: 'barbering', label: 'barbering' },
    { id: 'tailoring', label: 'tailoring/fashion design' },
    { id: 'cleaning', label: 'home cleaning' }
  ];

  const locations = [
    'Victoria Island',
    'Lekki',
    'Ikoyi',
    'Ikeja',
    'Surulere',
    'Ajah',
    'Other Lagos',
    'Outside Lagos'
  ];

  const howItWorks = [
    { title: 'discover', desc: 'swipe through verified service providers near you' },
    { title: 'book instantly', desc: 'secure booking with escrow payment protection' },
    { title: 'rate and review', desc: 'build trust with the plug rating system' }
  ];

  const rewards = [
    { k: 0, icon: Gift, title: 'early access', sub: 'join before public launch' },
    { k: 3, icon: Award, title: 'booking credit', sub: 'unlock exclusive credit' },
    { k: 5, icon: Star, title: 'premium badge', sub: 'verified member status' },
    { k: 10, icon: TrendingUp, title: 'vip status', sub: 'priority support and perks' },
  ];

  // Real-time data from Supabase
  useEffect(() => {
    fetchStats();
    fetchLeaderboard();
    fetchRecentSignups();
    
    const statsInterval = setInterval(fetchStats, 10000);
    const leaderboardInterval = setInterval(fetchLeaderboard, 30000);
    const signupsInterval = setInterval(fetchRecentSignups, 15000);
    
    return () => {
      clearInterval(statsInterval);
      clearInterval(leaderboardInterval);
      clearInterval(signupsInterval);
    };
  }, []);

  // Check for referral code in URL
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const ref = params.get('ref');
    if (ref) {
      trackReferralVisit(ref);
      localStorage.setItem('referredBy', ref);
    }
  }, []);

  const fetchStats = async () => {
    try {
      const { count: totalCount } = await supabase
        .from('waitlist')
        .select('*', { count: 'exact', head: true });
      
      const today = new Date().toISOString().split('T')[0];
      const { count: todayCount } = await supabase
        .from('waitlist')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', `${today}T00:00:00`)
        .lte('created_at', `${today}T23:59:59`);
      
      setJoined(totalCount || 0);
      setTodayJoined(todayCount || 0);
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const fetchLeaderboard = async () => {
    try {
      const { data, error } = await supabase
        .from('waitlist')
        .select('id, first_name, last_name, referral_count')
        .order('referral_count', { ascending: false })
        .limit(5);
      
      if (data) {
        setLeaderboard(data.map(u => ({ 
          id: u.id,
          firstName: u.first_name, 
          lastName: u.last_name, 
          refs: u.referral_count 
        })));
      }
    } catch (error) {
      console.error('Error fetching leaderboard:', error);
    }
  };

  const fetchRecentSignups = async () => {
    try {
      const { data, error } = await supabase
        .from('waitlist')
        .select('id, first_name, created_at')
        .order('created_at', { ascending: false })
        .limit(5);
      
      if (data) {
        setRecentSignups(data.map(u => ({
          id: u.id,
          firstName: u.first_name,
          timeAgo: getTimeAgo(u.created_at)
        })));
      }
    } catch (error) {
      console.error('Error fetching recent signups:', error);
    }
  };

  const getTimeAgo = (timestamp: string): string => {
    const seconds = Math.floor((new Date().getTime() - new Date(timestamp).getTime()) / 1000);
    
    if (seconds < 60) return 'just now';
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    return `${Math.floor(seconds / 86400)}d ago`;
  };

  const trackReferralVisit = async (referralCode: string) => {
    try {
      await supabase
        .from('referral_visits')
        .insert([{
          referral_code: referralCode,
          visited_at: new Date().toISOString()
        }]);
    } catch (error) {
      console.error('Error tracking referral:', error);
    }
  };

  const validateEmail = (email: string): boolean => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!regex.test(email)) {
      setEmailError('please enter a valid email address');
      return false;
    }
    
    const disposableDomains = ['tempmail.com', 'guerrillamail.com', '10minutemail.com', 'throwaway.email'];
    const domain = email.split('@')[1]?.toLowerCase();
    if (domain && disposableDomains.includes(domain)) {
      setEmailError('disposable email addresses are not allowed');
      return false;
    }
    
    setEmailError('');
    return true;
  };

  const checkDuplicate = async (email: string): Promise<boolean> => {
    try {
      const { data, error } = await supabase
        .from('waitlist')
        .select('email')
        .eq('email', email.toLowerCase())
        .single();
      
      return !!data;
    } catch (error) {
      return false;
    }
  };

  const handleServiceToggle = (serviceId: string) => {
    setSelectedServices(prev =>
      prev.includes(serviceId)
        ? prev.filter(id => id !== serviceId)
        : [...prev, serviceId]
    );
  };

  const validateForm = (): string | null => {
    if (!firstName.trim()) return 'please enter your first name';
    if (!lastName.trim()) return 'please enter your last name';
    if (!email.trim()) return 'please enter your email';
    if (!validateEmail(email)) return emailError;
    if (!userType) return 'please select if you\'re a user or provider';
    if (selectedServices.length === 0) return 'please select at least one service';
    if (userType === 'provider' && !providerType) return 'please select your provider type';
    if (!location) return 'please select your location';
    return null;
  };

  const scrollToForm = () => {
    formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  };

  const generateReferralCode = () => {
    return `${firstName.substring(0, 3).toUpperCase()}${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const validationError = validateForm();
    if (validationError) {
      setMsg(validationError);
      return;
    }
    
    setSubmitting(true);
    setMsg('');

    try {
      const isDuplicate = await checkDuplicate(email);
      if (isDuplicate) {
        setMsg('this email is already on the waitlist!');
        setSubmitting(false);
        return;
      }

      const referredBy = localStorage.getItem('referredBy');
      const referralCode = generateReferralCode();
      
      // Insert into waitlist table
      const { data, error } = await supabase
        .from('waitlist')
        .insert([{
          email: email.toLowerCase(),
          first_name: firstName.trim(),
          last_name: lastName.trim(),
          referral_code: referralCode,
          referred_by: referredBy || null,
          referral_count: 0,
          email_confirmed: false
        }])
        .select()
        .single();
      
      if (error) {
        console.error('Supabase error:', error);
        throw error;
      }
      
      // Store additional data in analytics_events
      await supabase
        .from('analytics_events')
        .insert([{
          event_type: 'signup',
          user_email: email.toLowerCase(),
          ref_code: referralCode,
          metadata: {
            user_type: userType,
            services: selectedServices,
            provider_type: providerType,
            location: location,
            suggestion: suggestion || null
          }
        }]);
      
      // Update referrer's count
            if (referredBy) {
              const { error: referralError } = await supabase.rpc(
                "increment_referral_count",
                { ref_code: referredBy }
              );

              if (referralError) {
                console.error("Referral increment failed:", referralError);
              }
            }
      
      // Send confirmation email via API route
      try {
        await fetch('/api/send-confirmation', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: email,
            firstName: firstName,
            lastName: lastName,
            referralCode: referralCode,
            userType: userType,
            services: selectedServices
          })
        });
      } catch (emailError) {
        console.log('Email sending skipped or failed:', emailError);
        // Continue anyway - email is optional for now
      }
      
      // Get user position
      const { count } = await supabase
        .from('waitlist')
        .select('*', { count: 'exact', head: true })
        .lte('created_at', data.created_at);
      
      setUserPosition(count || 0);
      
      const link = `${window.location.origin}?ref=${referralCode}`;
      
      setRefLink(link);
      setConfirmEmail(email);
      setShowConfirm(true);
      setShowConfetti(true);
      setMsg('you are on the list! check your email to confirm.');
      
      localStorage.removeItem('referredBy');
      
      setTimeout(() => setShowConfetti(false), 4000);
      
      // Reset form
      setEmail('');
      setFirstName('');
      setLastName('');
      setUserType('');
      setSelectedServices([]);
      setProviderType('');
      setLocation('');
      setSuggestion('');
      
      fetchStats();
      fetchLeaderboard();
      fetchRecentSignups();
    } catch (error) {
      console.error('Error:', error);
      setMsg('something went wrong. please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const copy = async () => {
    setCopying(true);
    try {
      await navigator.clipboard.writeText(refLink);
      setMsg('referral link copied! share it to earn rewards');
      
      if (navigator.vibrate) {
        navigator.vibrate(50);
      }
    } catch (err) {
      setMsg('failed to copy link');
    } finally {
      setTimeout(() => setCopying(false), 1000);
    }
  };

  const shareToWhatsApp = () => {
    const text = `Join me on PLUG - discover trusted services! Use my link: ${refLink}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`);
  };

  const shareToTwitter = () => {
    const text = `Just joined the PLUG waitlist! Discover local services the modern way`;
    window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(refLink)}`);
  };

  const shareToInstagram = () => {
    copy();
    setMsg('link copied! paste it in your instagram bio or story');
  };

  const resendConfirmation = async () => {
    setMsg('sending confirmation email...');
    
    try {
      await fetch('/api/resend-confirmation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: confirmEmail })
      });
      
      setMsg('confirmation email resent! check your inbox.');
    } catch (error) {
      setMsg('failed to resend. please try again.');
    }
  };

  const closeConfirm = () => {
    setShowConfirm(false);
  };

  return (
    <section className="min-h-screen py-12 px-4 md:px-8 bg-slate-50 font-system">
      {showConfetti && <Confetti />}
      
      <div className="max-w-6xl w-full mx-auto">
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.6, 0.05, 0.01, 0.9] }}
          className="flex items-center justify-between"
        >
          <motion.a 
            href="#"
            whileHover={{ scale: 1.05 }}
            transition={{ type: 'spring', stiffness: 400, damping: 10 }}
            className="text-2xl font-semibold tracking-tight lowercase"
          >
            plug<span style={{ color: BLUE }}>.</span>
          </motion.a>

          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
            className="flex items-center gap-3"
          >
            <motion.span 
              className="text-xs text-gray-600 lowercase hidden sm:block"
              whileHover={{ scale: 1.05 }}
              transition={{ type: 'spring', stiffness: 400 }}
            >
              <span className="font-semibold">{todayJoined}</span> joined today
            </motion.span>
            <motion.span 
              className="text-xs text-gray-600 lowercase"
              whileHover={{ scale: 1.05 }}
              transition={{ type: 'spring', stiffness: 400 }}
            >
              <span className="font-semibold">{joined}</span> total
            </motion.span>
          </motion.div>
        </motion.div>

        {/* Recent Signups */}
        <AnimatePresence mode="wait">
          {recentSignups.length > 0 && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className="mt-4 glass-card p-3"
            >
              <AnimatePresence mode="wait">
                {recentSignups[0] && (
                  <RecentSignup key={recentSignups[0].id} {...recentSignups[0]} />
                )}
              </AnimatePresence>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Hero */}
        <div className="text-center mt-10">
          <motion.p
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-xs text-gray-500 lowercase tracking-wide"
          >
            available soon
          </motion.p>

          <motion.h1
            initial={{ y: 18, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.7, ease: [0.6, 0.05, 0.01, 0.9] }}
            className="mt-3 text-5xl md:text-6xl font-semibold tracking-tight lowercase"
          >
            get early access to{' '}
            <span className="inline-flex items-baseline">
              <span className="font-semibold tracking-tight">plug</span>
              <motion.span 
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ repeat: Infinity, duration: 2, ease: 'easeInOut' }}
                style={{ color: BLUE }}
              >
                .
              </motion.span>
            </span>
          </motion.h1>

          <motion.p
            initial={{ y: 10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.12, duration: 0.6 }}
            className="mt-5 text-lg text-gray-600 max-w-2xl mx-auto lowercase"
          >
            discover trusted local professionals. join the waitlist and unlock perks by referring friends.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3, type: 'spring', stiffness: 200 }}
            className="mt-6 inline-block"
          >
            <motion.div 
              className="glass-card p-4 border-2 border-yellow-400/30 bg-gradient-to-r from-yellow-50/50 to-orange-50/50"
              whileHover={{ scale: 1.05, y: -2 }}
              transition={{ type: 'spring', stiffness: 400 }}
            >
              <div className="flex items-center gap-3">
                <motion.div
                  animate={{ rotate: [0, 10, -10, 0] }}
                  transition={{ repeat: Infinity, duration: 2, ease: 'easeInOut' }}
                >
                  <Trophy className="w-6 h-6 text-yellow-600" />
                </motion.div>
                <div className="text-left">
                  <p className="text-sm font-bold text-gray-900 lowercase">£1,500 grand prize</p>
                  <p className="text-xs text-gray-600 lowercase">top referrer wins at launch</p>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </div>

        {/* How It Works */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.14, duration: 0.6 }}
          className="mt-10"
        >
          <motion.div 
            className="glass-card p-6 md:p-8"
            whileHover={{ y: -2 }}
            transition={{ type: 'spring', stiffness: 300 }}
          >
            <div className="flex items-center justify-between">
              <p className="text-sm text-gray-700 lowercase">how plug works</p>
              <span className="text-xs text-gray-500 lowercase">3 steps</span>
            </div>

            <div className="mt-5 grid grid-cols-1 md:grid-cols-3 gap-4">
              {howItWorks.map((s, idx) => (
                <motion.div
                  key={s.title}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 + idx * 0.1, type: 'spring', stiffness: 200 }}
                  whileHover={{ scale: 1.05, y: -5 }}
                  className="glass-card p-5 cursor-pointer"
                >
                  <p className="text-sm font-semibold tracking-tight lowercase">{s.title}</p>
                  <p className="mt-3 text-sm text-gray-600 lowercase">{s.desc}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </motion.div>

        {/* Signup Form */}
        <motion.div
          ref={formRef}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.18, duration: 0.6 }}
          className="mt-10 max-w-2xl mx-auto scroll-mt-24"
        >
          <motion.div 
            className="glass-card p-6 md:p-8"
            whileHover={{ y: -2 }}
            transition={{ type: 'spring', stiffness: 300 }}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-500 lowercase">launching february 2026</span>
              <span className="text-xs text-gray-500 lowercase">{Math.min(refs, 10)}/10</span>
            </div>

            <div className="mt-3 h-2 rounded-full bg-gray-100 overflow-hidden">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: `${pct}%` }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                className="h-full" 
                style={{ background: BLUE }} 
              />
            </div>

            {userPosition && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ type: 'spring', stiffness: 200 }}
                className="mt-3 text-center"
              >
                <p className="text-sm font-semibold lowercase" style={{ color: BLUE }}>
                  you are number {userPosition} on the waitlist
                </p>
              </motion.div>
            )}

            <form onSubmit={submit} className="mt-5 space-y-3">
              {/* Email */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
              >
                <input
                  className="input-field lowercase w-full"
                  placeholder="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (emailError) validateEmail(e.target.value);
                  }}
                  required
                  type="email"
                />
                {emailError && (
                  <motion.p
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-xs text-red-600 mt-1 lowercase"
                  >
                    {emailError}
                  </motion.p>
                )}
              </motion.div>

              {/* First & Last Name */}
              <motion.div 
                className="grid grid-cols-2 gap-3"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.35 }}
              >
                <input
                  className="input-field lowercase"
                  placeholder="first name"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  required
                />
                <input
                  className="input-field lowercase"
                  placeholder="last name"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  required
                />
              </motion.div>

              {/* User Type Selection */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 }}
              >
                <label className="block text-xs text-gray-500 lowercase mb-2">i'm interested as a</label>
                <div className="grid grid-cols-2 gap-3">
                  <motion.button
                    type="button"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setUserType('user')}
                    className={`p-3 rounded-xl border transition-all ${
                      userType === 'user'
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-blue-300'
                    }`}
                  >
                    <User className="w-5 h-5 mx-auto mb-1 text-blue-600" />
                    <div className="text-xs font-medium lowercase">service user</div>
                  </motion.button>
                  <motion.button
                    type="button"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setUserType('provider')}
                    className={`p-3 rounded-xl border transition-all ${
                      userType === 'provider'
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-blue-300'
                    }`}
                  >
                    <Building2 className="w-5 h-5 mx-auto mb-1 text-blue-600" />
                    <div className="text-xs font-medium lowercase">service provider</div>
                  </motion.button>
                </div>
              </motion.div>

              {/* Service Selection - NO EMOJIS */}
              {userType && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                >
                  <label className="block text-xs text-gray-500 lowercase mb-2">
                    {userType === 'provider' ? 'which services do you provide' : 'which services interest you'}
                  </label>
                  <div className="space-y-2">
                    {(userType === 'provider' ? providerServices : userServices).map((service) => {
                      const Icon = 'icon' in service ? service.icon : null;
                      return (
                        <motion.button
                          key={service.id}
                          type="button"
                          whileHover={{ scale: 1.01 }}
                          whileTap={{ scale: 0.99 }}
                          onClick={() => handleServiceToggle(service.id)}
                          className={`w-full p-3 rounded-xl border transition-all text-left flex items-center gap-2 ${
                            selectedServices.includes(service.id)
                              ? 'border-blue-500 bg-blue-50'
                              : 'border-gray-200 hover:border-blue-300'
                          }`}
                        >
                          {Icon && <Icon className="w-4 h-4 text-blue-600" />}
                          <span className="text-xs font-medium lowercase flex-1">{service.label}</span>
                          {selectedServices.includes(service.id) && (
                            <CheckCircle2 className="w-4 h-4 text-blue-600" />
                          )}
                        </motion.button>
                      );
                    })}
                  </div>
                </motion.div>
              )}

              {/* Provider Type */}
              {userType === 'provider' && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                >
                  <label className="block text-xs text-gray-500 lowercase mb-2">are you</label>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { value: 'individual', label: 'individual' },
                      { value: 'shop', label: 'salon/shop' },
                      { value: 'company', label: 'company' }
                    ].map((type) => (
                      <motion.button
                        key={type.value}
                        type="button"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => setProviderType(type.value)}
                        className={`p-2 rounded-xl border transition-all text-xs ${
                          providerType === type.value
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-gray-200 hover:border-blue-300'
                        }`}
                      >
                        {type.label}
                      </motion.button>
                    ))}
                  </div>
                </motion.div>
              )}

              {/* Location */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.45 }}
              >
                <label className="block text-xs text-gray-500 lowercase mb-2">location</label>
                <div className="relative">
                  <select
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className="input-field lowercase w-full appearance-none"
                    required
                  >
                    <option value="">select your location</option>
                    {locations.map((loc) => (
                      <option key={loc} value={loc}>{loc.toLowerCase()}</option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                </div>
              </motion.div>

              {/* Suggestions/Ideas Section */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 }}
              >
                <label className="block text-xs text-gray-500 lowercase mb-2 flex items-center gap-1">
                  <Lightbulb className="w-3 h-3" />
                  suggestions or ideas (optional)
                </label>
                <textarea
                  className="input-field lowercase w-full min-h-[80px] rounded-2xl resize-none"
                  placeholder="share any features you'd like to see or ideas you have..."
                  value={suggestion}
                  onChange={(e) => setSuggestion(e.target.value)}
                  maxLength={500}
                />
                <p className="text-xs text-gray-400 mt-1 lowercase text-right">
                  {suggestion.length}/500
                </p>
              </motion.div>

              {/* Submit Button */}
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                disabled={submitting || !!emailError}
                className="lowercase w-full rounded-full px-6 py-3 text-sm font-semibold tracking-tight disabled:opacity-60 transition-all"
                style={{ background: BLUE, color: 'white' }}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.55, type: 'spring', stiffness: 200 }}
              >
                {submitting ? 'joining...' : 'join waitlist'}
              </motion.button>
            </form>

            <motion.div 
              className="mt-4 text-center"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
            >
              <p className="text-xs text-gray-500 lowercase flex items-center justify-center gap-2">
                <ShieldCheck className="w-4 h-4" />
                no spam. early updates only.
              </p>
            </motion.div>

            <AnimatePresence>
              {msg && (
                <motion.p
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 6 }}
                  transition={{ type: 'spring', stiffness: 200 }}
                  className="mt-4 text-sm text-gray-600 lowercase text-center"
                >
                  {msg}
                </motion.p>
              )}
            </AnimatePresence>

            {/* Confirmation Modal */}
            <AnimatePresence>
              {showConfirm && (
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  transition={{ type: 'spring', stiffness: 200 }}
                  className="mt-6 glass-card p-5 border-2 border-green-400/30"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-3">
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: 'spring', stiffness: 500, delay: 0.2 }}
                      >
                        <CheckCircle2 className="w-5 h-5 mt-0.5" style={{ color: BLUE }} />
                      </motion.div>
                      <div>
                        <p className="text-sm font-semibold tracking-tight lowercase">
                          confirmation sent
                        </p>
                        <p className="mt-1 text-sm text-gray-600 lowercase">
                          check <span className="font-semibold">{confirmEmail}</span> to confirm your spot.
                        </p>
                      </div>
                    </div>

                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      type="button"
                      onClick={closeConfirm}
                      className="text-xs font-semibold tracking-tight hover:opacity-80 transition-opacity"
                      style={{ color: BLUE }}
                    >
                      close
                    </motion.button>
                  </div>

                  <div className="mt-4 flex flex-col sm:flex-row gap-2">
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      type="button"
                      onClick={resendConfirmation}
                      className="rounded-full px-5 py-2 text-sm font-semibold tracking-tight border bg-white/60 lowercase"
                      style={{ borderColor: 'rgba(37,99,235,0.25)', color: BLUE }}
                    >
                      resend confirmation
                    </motion.button>

                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      type="button"
                      onClick={copy}
                      className="rounded-full px-5 py-2 text-sm font-semibold tracking-tight border bg-white/60 inline-flex items-center justify-center gap-2 lowercase"
                      style={{ borderColor: 'rgba(37,99,235,0.25)', color: BLUE }}
                    >
                      <LinkIcon className="w-4 h-4" />
                      {copying ? 'copying...' : 'copy referral link'}
                    </motion.button>
                  </div>

                  {refLink && (
                    <motion.div 
                      className="mt-4 flex gap-2"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.2 }}
                    >
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        type="button"
                        onClick={shareToWhatsApp}
                        className="flex-1 rounded-full px-4 py-2 text-sm font-semibold border bg-green-50 text-green-700 hover:bg-green-100 transition-colors inline-flex items-center justify-center gap-2 lowercase"
                      >
                        <Share2 className="w-4 h-4" />
                        whatsapp
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        type="button"
                        onClick={shareToTwitter}
                        className="flex-1 rounded-full px-4 py-2 text-sm font-semibold border bg-sky-50 text-sky-700 hover:bg-sky-100 transition-colors inline-flex items-center justify-center gap-2 lowercase"
                      >
                        <Twitter className="w-4 h-4" />
                        twitter
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        type="button"
                        onClick={shareToInstagram}
                        className="flex-1 rounded-full px-4 py-2 text-sm font-semibold border bg-pink-50 text-pink-700 hover:bg-pink-100 transition-colors inline-flex items-center justify-center gap-2 lowercase"
                      >
                        <Instagram className="w-4 h-4" />
                        instagram
                      </motion.button>
                    </motion.div>
                  )}

                  <p className="mt-3 text-xs text-gray-500 lowercase">
                    did not see it? check spam or promotions, or try resend.
                  </p>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Stats */}
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, type: 'spring', stiffness: 200 }}
              className="mt-7 grid grid-cols-2 gap-3"
            >
              <motion.div 
                whileHover={{ scale: 1.05, y: -5 }}
                transition={{ type: 'spring', stiffness: 400 }}
                className="glass-card p-4 text-center cursor-pointer"
              >
                <motion.div 
                  key={joined}
                  initial={{ scale: 1.2, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="text-2xl font-semibold"
                >
                  {joined}
                </motion.div>
                <div className="text-xs text-gray-500 lowercase">people joined</div>
              </motion.div>
              <motion.div 
                whileHover={{ scale: 1.05, y: -5 }}
                transition={{ type: 'spring', stiffness: 400 }}
                className="glass-card p-4 text-center cursor-pointer"
              >
                <div className="text-2xl font-semibold">{refs}</div>
                <div className="text-xs text-gray-500 lowercase">your referrals</div>
              </motion.div>
            </motion.div>
          </motion.div>
        </motion.div>

        {/* Leaderboard */}
        {leaderboard.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.6 }}
            className="mt-10 max-w-2xl mx-auto"
          >
            <motion.div 
              className="glass-card p-6"
              whileHover={{ y: -2 }}
              transition={{ type: 'spring', stiffness: 300 }}
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Trophy className="w-5 h-5 text-yellow-600" />
                  <p className="text-sm font-bold lowercase">top referrers</p>
                </div>
                <p className="text-xs text-gray-500 lowercase">live leaderboard</p>
              </div>

              <div className="space-y-2">
                {leaderboard.map((user, idx) => (
                  <motion.div
                    key={user.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.6 + idx * 0.1, type: 'spring', stiffness: 200 }}
                    whileHover={{ scale: 1.02, x: 5 }}
                    className="flex items-center justify-between p-3 glass-card"
                  >
                    <div className="flex items-center gap-3">
                      <motion.div 
                        className="w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm"
                        whileHover={{ rotate: 360 }}
                        transition={{ duration: 0.5 }}
                        style={{ 
                          background: idx === 0 ? 'linear-gradient(135deg, #FFD700, #FFA500)' : 
                                     idx === 1 ? 'linear-gradient(135deg, #C0C0C0, #808080)' :
                                     idx === 2 ? 'linear-gradient(135deg, #CD7F32, #8B4513)' :
                                     'rgba(37,99,235,0.10)',
                          color: idx < 3 ? 'white' : BLUE
                        }}
                      >
                        {idx + 1}
                      </motion.div>
                      <p className="text-sm font-semibold lowercase">{user.firstName} {user.lastName}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <motion.span 
                        className="text-sm font-bold"
                        key={user.refs}
                        initial={{ scale: 1.3, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                      >
                        {user.refs}
                      </motion.span>
                      <span className="text-xs text-gray-500 lowercase">refs</span>
                    </div>
                  </motion.div>
                ))}
              </div>

              <motion.div 
                className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-xl"
                whileHover={{ scale: 1.02 }}
                transition={{ type: 'spring', stiffness: 400 }}
              >
                <p className="text-xs text-gray-700 lowercase">
                  <span className="font-semibold">number 1 wins £1,500</span> at launch keep referring to climb the ranks.
                </p>
              </motion.div>
            </motion.div>
          </motion.div>
        )}

        {/* Rewards */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.6 }}
          className="mt-10 grid grid-cols-1 lg:grid-cols-12 gap-6"
        >
          <div className="lg:col-span-7">
            <motion.div 
              className="glass-card p-6 md:p-8"
              whileHover={{ y: -2 }}
              transition={{ type: 'spring', stiffness: 300 }}
            >
              <div className="flex items-center justify-between">
                <p className="text-sm text-gray-700 lowercase">rewards</p>
                <span className="text-xs text-gray-500 lowercase">perks you unlock</span>
              </div>

              <div className="mt-5 space-y-3">
                {rewards.map((r, idx) => {
                  const Icon = r.icon;
                  const active = refs >= r.k;

                  return (
                    <motion.div
                      key={`${r.k}-${r.title}`}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.5 + idx * 0.1, type: 'spring', stiffness: 200 }}
                      whileHover={{ scale: 1.02, x: 5 }}
                      className="glass-card p-4 flex items-center justify-between cursor-pointer"
                      style={active ? { border: `2px solid rgba(37,99,235,0.3)`, background: 'rgba(37,99,235,0.05)' } : undefined}
                    >
                      <div className="flex items-center gap-3">
                        <motion.div
                          animate={active ? { scale: [1, 1.2, 1] } : {}}
                          transition={{ repeat: active ? Infinity : 0, duration: 2 }}
                          className="w-10 h-10 rounded-full flex items-center justify-center"
                          style={{ background: active ? 'rgba(37,99,235,0.15)' : 'rgba(37,99,235,0.10)' }}
                        >
                          <Icon className="w-4 h-4" style={{ color: active ? BLUE : '#4B5563' }} />
                        </motion.div>

                        <div>
                          <p className={`text-sm ${active ? 'text-black font-semibold' : 'text-gray-700'} lowercase`}>
                            {r.title}
                          </p>
                          <p className="text-xs text-gray-500 lowercase">
                            {r.k === 0 ? r.sub : `${r.k} referrals - ${r.sub}`}
                          </p>
                        </div>
                      </div>

                      <motion.span
                        animate={active ? { scale: [1, 1.1, 1] } : {}}
                        transition={{ repeat: active ? Infinity : 0, duration: 2 }}
                        className="text-xs px-3 py-1 rounded-full border lowercase font-semibold"
                        style={{
                          borderColor: active ? 'rgba(37,99,235,0.35)' : 'rgba(0,0,0,0.08)',
                          color: active ? BLUE : '#6B7280',
                          background: active ? 'rgba(37,99,235,0.06)' : 'transparent',
                        }}
                      >
                        {active ? 'unlocked' : r.k === 0 ? 'included' : 'locked'}
                      </motion.span>
                    </motion.div>
                  );
                })}
              </div>

              <motion.div 
                className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-xl"
                whileHover={{ scale: 1.02 }}
                transition={{ type: 'spring', stiffness: 400 }}
              >
                <p className="text-xs text-gray-600 lowercase">
                  <span className="font-semibold">pro tip:</span> share your link in group chats, social media, and communities. each referral counts
                </p>
              </motion.div>
            </motion.div>
          </div>

          <div className="lg:col-span-5">
            <motion.div 
              className="glass-card p-6 md:p-7 h-full"
              whileHover={{ y: -2 }}
              transition={{ type: 'spring', stiffness: 300 }}
            >
              <p className="text-sm text-gray-700 lowercase font-semibold mb-4">what you get</p>
              <ul className="space-y-3 text-sm text-gray-600 lowercase">
                <motion.li 
                  whileHover={{ x: 5 }}
                  transition={{ type: 'spring', stiffness: 400 }}
                  className="flex items-start gap-2"
                >
                  <CheckCircle2 className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                  <span>early access before public launch</span>
                </motion.li>
                <motion.li 
                  whileHover={{ x: 5 }}
                  transition={{ type: 'spring', stiffness: 400 }}
                  className="flex items-start gap-2"
                >
                  <CheckCircle2 className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                  <span>priority onboarding for top referrers</span>
                </motion.li>
                <motion.li 
                  whileHover={{ x: 5 }}
                  transition={{ type: 'spring', stiffness: 400 }}
                  className="flex items-start gap-2"
                >
                  <CheckCircle2 className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                  <span>launch-only perks and invites</span>
                </motion.li>
                <motion.li 
                  whileHover={{ x: 5 }}
                  transition={{ type: 'spring', stiffness: 400 }}
                  className="flex items-start gap-2"
                >
                  <CheckCircle2 className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                  <span>exclusive community access</span>
                </motion.li>
              </ul>

              <motion.div 
                whileHover={{ scale: 1.05 }}
                transition={{ type: 'spring', stiffness: 400 }}
                className="mt-6 rounded-2xl border-2 border-green-400/30 bg-gradient-to-br from-green-50 to-emerald-50 p-4 cursor-pointer"
              >
                <p className="text-xs text-gray-500 lowercase">your waitlist perk</p>
                <p className="mt-1 text-sm text-gray-800 lowercase">
                  <span className="font-semibold tracking-tight text-green-700">10% off</span> your first{' '}
                  <span className="font-semibold tracking-tight text-green-700">5</span> bookings after launch.
                </p>
              </motion.div>
            </motion.div>
          </div>
        </motion.div>

        {/* Footer */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8, duration: 0.6 }}
          className="mt-10 text-center text-xs text-gray-500 lowercase"
        >
          {new Date().getFullYear()} plug. all rights reserved.
        </motion.div>
      </div>

      <style jsx global>{`
        * {
          font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Display', 'SF Pro Text', 'Helvetica Neue', 'Helvetica', 'Arial', sans-serif;
        }

        .font-system {
          font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Display', 'SF Pro Text', 'Helvetica Neue', 'Helvetica', 'Arial', sans-serif;
        }

        .glass-card {
          background: rgba(255, 255, 255, 0.7);
          backdrop-filter: blur(10px);
          -webkit-backdrop-filter: blur(10px);
          border: 1px solid rgba(0, 0, 0, 0.05);
          border-radius: 1rem;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .input-field {
          width: 100%;
          padding: 0.75rem 1rem;
          border-radius: 9999px;
          border: 1px solid rgba(0, 0, 0, 0.08);
          background: rgba(255, 255, 255, 0.7);
          font-size: 0.875rem;
          transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .input-field:focus {
          outline: none;
          border-color: rgba(37, 99, 235, 0.35);
          background: white;
          transform: translateY(-1px);
        }
      `}</style>
    </section>
  );
}