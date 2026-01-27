'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Share2, Zap, CheckCircle2, TrendingUp, Star, ShieldCheck, Link as LinkIcon, Search, Award, Gift, Trophy, Instagram, Twitter } from 'lucide-react';

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
  const [email, setEmail] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [msg, setMsg] = useState('');
  const [showConfirm, setShowConfirm] = useState(false);
  const [confirmEmail, setConfirmEmail] = useState('');
  const [refLink, setRefLink] = useState('');
  const [copying, setCopying] = useState(false);
  const [refs, setRefs] = useState(0);
  const [joined, setJoined] = useState(0);
  const [todayJoined, setTodayJoined] = useState(0);
  const [showConfetti, setShowConfetti] = useState(false);
  const [userPosition, setUserPosition] = useState<number | null>(null);
  const [leaderboard, setLeaderboard] = useState<Array<{ firstName: string; lastName: string; refs: number; id: string }>>([]);
  const [recentSignups, setRecentSignups] = useState<Array<{ firstName: string; timeAgo: string; id: string }>>([]);
  const [emailError, setEmailError] = useState('');
  const formRef = useRef<HTMLDivElement>(null);

  const pct = Math.min((refs / 10) * 100, 100);

  const howItWorks = [
    { icon: Search, title: 'discover', desc: 'swipe through verified service providers near you' },
    { icon: Zap, title: 'book instantly', desc: 'secure booking with escrow payment protection' },
    { icon: Star, title: 'rate and review', desc: 'build trust with the plug rating system' }
  ];

  const rewards = [
    { k: 0, icon: Gift, title: 'early access', sub: 'join before public launch' },
    { k: 3, icon: Award, title: 'booking credit', sub: 'unlock exclusive credit' },
    { k: 5, icon: Star, title: 'premium badge', sub: 'verified member status' },
    { k: 10, icon: TrendingUp, title: 'vip status', sub: 'priority support and perks' },
  ];

  const testimonials = [
    { name: 'Chioma A.', role: 'Student, UNILAG', text: 'finally, a way to find trusted services on campus without the stress!' },
    { name: 'Tunde O.', role: 'Barber, Lagos', text: 'plug helped me get more clients than ever before. game changer!' },
    { name: 'Blessing M.', role: 'Makeup Artist', text: 'the verification system builds instant trust. my bookings doubled!' },
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
      /* 
      SUPABASE: Fetch real-time stats
      
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
      */
      
      // Demo: Simulate stats
      setJoined(prev => prev + (Math.random() > 0.7 ? 1 : 0));
      setTodayJoined(prev => prev + (Math.random() > 0.8 ? 1 : 0));
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const fetchLeaderboard = async () => {
    try {
      /* 
      SUPABASE: Fetch top referrers with real scores
      
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
      */
      
      // Demo: Simulate leaderboard
      setLeaderboard([
        { id: '1', firstName: 'Chioma', lastName: 'A.', refs: 28 },
        { id: '2', firstName: 'Tunde', lastName: 'O.', refs: 19 },
        { id: '3', firstName: 'Blessing', lastName: 'M.', refs: 15 },
        { id: '4', firstName: 'David', lastName: 'K.', refs: 12 },
        { id: '5', firstName: 'Faith', lastName: 'I.', refs: 8 },
      ]);
    } catch (error) {
      console.error('Error fetching leaderboard:', error);
    }
  };

  const fetchRecentSignups = async () => {
    try {
      /* 
      SUPABASE: Fetch recent signups
      
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
      */
      
      // Demo: Keep existing simulation
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
      /* 
      SUPABASE: Track referral visit
      
      await supabase
        .from('referral_visits')
        .insert([{
          referral_code: referralCode,
          visited_at: new Date().toISOString()
        }]);
      */
      
      console.log('Referral visit tracked:', referralCode);
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
      /* 
      SUPABASE: Check for duplicate email
      
      const { data, error } = await supabase
        .from('waitlist')
        .select('email')
        .eq('email', email.toLowerCase())
        .single();
      
      return !!data;
      */
      
      return false;
    } catch (error) {
      return false;
    }
  };

  const scrollToForm = () => {
    formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateEmail(email)) return;
    if (!firstName.trim() || !lastName.trim()) {
      setMsg('please enter your full name');
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

      await new Promise(resolve => setTimeout(resolve, 1500));

      const mockCode = Math.random().toString(36).substring(2, 10).toUpperCase();
      const referredBy = localStorage.getItem('referredBy');
      
      /* 
      SUPABASE INTEGRATION:
      
      const { data, error } = await supabase
        .from('waitlist')
        .insert([{
          email: email.toLowerCase(),
          first_name: firstName.trim(),
          last_name: lastName.trim(),
          referral_code: mockCode,
          referred_by: referredBy || null,
          referral_count: 0,
          created_at: new Date().toISOString()
        }])
        .select()
        .single();
      
      if (error) throw error;
      
      // Update referrer's count
      if (referredBy) {
        await supabase.rpc('increment_referral_count', {
          ref_code: referredBy
        });
      }
      
      // Send confirmation email via API route
      await fetch('/api/send-confirmation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: email,
          firstName: firstName,
          lastName: lastName,
          referralCode: mockCode
        })
      });
      
      // Get user position
      const { count } = await supabase
        .from('waitlist')
        .select('*', { count: 'exact', head: true })
        .lte('created_at', data.created_at);
      
      setUserPosition(count || 0);
      
      // Fetch user's referral count
      const { data: userData } = await supabase
        .from('waitlist')
        .select('referral_count')
        .eq('email', email.toLowerCase())
        .single();
        
      if (userData) {
        setRefs(userData.referral_count);
      }
      */
      
      const link = `${window.location.origin}?ref=${mockCode}`;
      
      setRefLink(link);
      setConfirmEmail(email);
      setUserPosition(joined + 1);
      setShowConfirm(true);
      setShowConfetti(true);
      setMsg('you are on the list! check your email to confirm.');
      
      localStorage.removeItem('referredBy');
      
      setTimeout(() => setShowConfetti(false), 4000);
      
      setEmail('');
      setFirstName('');
      setLastName('');
      
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
      /* 
      await fetch('/api/resend-confirmation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: confirmEmail })
      });
      */
      
      await new Promise(resolve => setTimeout(resolve, 1000));
      setMsg('confirmation email resent! check your inbox.');
    } catch (error) {
      setMsg('failed to resend. please try again.');
    }
  };

  const closeConfirm = () => {
    setShowConfirm(false);
  };

  useEffect(() => {
    setJoined(847);
    setTodayJoined(23);
  }, []);

  useEffect(() => {
    const names = ['Chiamaka', 'Tunde', 'Blessing', 'David', 'Faith', 'Emeka', 'Ada', 'Bolu'];
    
    const interval = setInterval(() => {
      const newSignup = {
        id: Math.random().toString(36).substring(7),
        firstName: names[Math.floor(Math.random() * names.length)],
        timeAgo: 'just now',
      };
      setRecentSignups(prev => [newSignup, ...prev.slice(0, 2)]);
    }, 8000);

    return () => clearInterval(interval);
  }, []);

  return (
    <section className="min-h-screen py-12 px-4 md:px-8 bg-slate-50 font-system">
      {showConfetti && <Confetti />}
      
      <div className="max-w-6xl w-full mx-auto">
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
                  <p className="text-sm font-bold text-gray-900 lowercase">£1,500 grand prize!</p>
                  <p className="text-xs text-gray-600 lowercase">top referrer wins at launch</p>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </div>

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
              {howItWorks.map((s, idx) => {
                const Icon = s.icon;
                return (
                  <motion.div
                    key={s.title}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 + idx * 0.1, type: 'spring', stiffness: 200 }}
                    whileHover={{ scale: 1.05, y: -5 }}
                    className="glass-card p-5 cursor-pointer"
                  >
                    <div className="flex items-center gap-3">
                      <motion.div
                        whileHover={{ rotate: 360 }}
                        transition={{ duration: 0.5 }}
                        className="w-10 h-10 rounded-full flex items-center justify-center"
                        style={{ background: 'rgba(37,99,235,0.10)' }}
                      >
                        <Icon className="w-4 h-4" style={{ color: BLUE }} />
                      </motion.div>
                      <p className="text-sm font-semibold tracking-tight lowercase">{s.title}</p>
                    </div>
                    <p className="mt-3 text-sm text-gray-600 lowercase">{s.desc}</p>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        </motion.div>

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
                  you are number {userPosition} on the waitlist!
                </p>
              </motion.div>
            )}

            <form onSubmit={submit} className="mt-5 space-y-3">
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

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                disabled={submitting || !!emailError}
                className="lowercase w-full rounded-full px-6 py-3 text-sm font-semibold tracking-tight disabled:opacity-60 transition-all"
                style={{ background: BLUE, color: 'white' }}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4, type: 'spring', stiffness: 200 }}
              >
                {submitting ? 'joining...' : 'join waitlist'}
              </motion.button>
            </form>

            <motion.div 
              className="mt-4 text-center"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
            >
              <p className="text-xs text-gray-500 lowercase flex items-center justify-center gap-2">
                <ShieldCheck className="w-4 h-4" />
                no spam. early updates only.
              </p>
              <p className="mt-2 text-xs text-gray-500 lowercase">
                by joining, you agree to receive launch updates.
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
                      onClick={() => {
                        setMsg('share your link to move up the list.');
                        if (refLink) copy();
                      }}
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

            <AnimatePresence>
              {refLink && (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 8 }}
                  transition={{ type: 'spring', stiffness: 200 }}
                  className="mt-5"
                >
                  <div className="glass-card p-4">
                    <p className="text-xs text-gray-500 lowercase">your referral link</p>
                    <div className="mt-2 flex items-center gap-2">
                      <p className="text-sm text-gray-800 break-all flex-1 font-mono">{refLink}</p>
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={copy}
                        className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
                      >
                        <LinkIcon className="w-4 h-4 text-gray-600" />
                      </motion.button>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

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
                  <span className="font-semibold">number 1 wins £1,500</span> at launch! keep referring to climb the ranks.
                </p>
              </motion.div>
            </motion.div>
          </motion.div>
        )}

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.6 }}
          className="mt-10"
        >
          <div className="text-center mb-6">
            <p className="text-sm font-bold lowercase">what people are saying</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {testimonials.map((testimonial, idx) => (
              <motion.div
                key={testimonial.name}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7 + idx * 0.1, type: 'spring', stiffness: 200 }}
                whileHover={{ scale: 1.05, y: -5 }}
                className="glass-card p-5 cursor-pointer"
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white font-bold text-sm">
                    {testimonial.name.charAt(0)}
                  </div>
                  <div>
                    <p className="text-sm font-semibold lowercase">{testimonial.name}</p>
                    <p className="text-xs text-gray-500 lowercase">{testimonial.role}</p>
                  </div>
                </div>
                <p className="text-sm text-gray-600 lowercase italic">{testimonial.text}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>

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
                  <span className="font-semibold">pro tip:</span> share your link in group chats, social media, and communities. each referral counts!
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