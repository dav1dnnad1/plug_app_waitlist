'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Share2, CheckCircle2, TrendingUp, Star, ShieldCheck,
  Link as LinkIcon, Award, Gift, Instagram, Twitter,
  Sparkles, Home, Scissors, User, Building2, ChevronDown,
  Lightbulb, ArrowRight, Trophy
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import Script from 'next/script';

const BLUE = '#007bff';
const RECAPTCHA_SITE_KEY = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY || '6LeIxAcTAAAAAJcZVRqyHh71UMIEGNQ_MXjiZKhI';

declare global { interface Window { grecaptcha: any; } }

const genCode = (firstName: string): string => {
  const prefix = firstName.substring(0, 3).toUpperCase();
  const arr = new Uint8Array(6);
  crypto.getRandomValues(arr);
  const suffix = Array.from(arr)
    .map(b => b.toString(36).toUpperCase())
    .join('')
    .substring(0, 8);
  return `${prefix}${suffix}`;
};

function Confetti() {
  return (
    <div className="fixed inset-0 pointer-events-none z-50">
      {[...Array(100)].map((_, i) => (
        <motion.div key={i} className="absolute w-3 h-3 rounded-full"
          initial={{
            left: `${Math.random() * 100}%`,
            top: '-10px',
            backgroundColor: ['#3B82F6','#8B5CF6','#EC4899','#F59E0B','#10B981'][Math.floor(Math.random()*5)],
          }}
          animate={{ y: '110vh', rotate: 360, opacity: [1,1,0] }}
          transition={{ duration: 2+Math.random()*2, delay: Math.random()*0.5, ease: 'easeOut' }}
        />
      ))}
    </div>
  );
}

export default function PlugWaitlist() {
  const [email, setEmail]                       = useState('');
  const [firstName, setFirstName]               = useState('');
  const [lastName, setLastName]                 = useState('');
  const [userType, setUserType]                 = useState<'user'|'provider'|''>('');
  const [selectedServices, setSelectedServices] = useState<string[]>([]);
  const [providerType, setProviderType]         = useState('');
  const [location, setLocation]                 = useState('');
  const [suggestion, setSuggestion]             = useState('');
  const [honeypot, setHoneypot]                 = useState('');
  const [captchaToken, setCaptchaToken]         = useState<string|null>(null);
  const [captchaLoaded, setCaptchaLoaded]       = useState(false);
  const [signupAttempts, setSignupAttempts]     = useState(0);
  const MAX_ATTEMPTS = 5;
  const [submitting, setSubmitting]             = useState(false);
  const [msg, setMsg]                           = useState('');
  const [showConfirm, setShowConfirm]           = useState(false);
  const [confirmEmail, setConfirmEmail]         = useState('');
  const [refLink, setRefLink]                   = useState('');
  const [copying, setCopying]                   = useState(false);
  const [showConfetti, setShowConfetti]         = useState(false);
  const [emailError, setEmailError]             = useState('');
  const [refs, setRefs]                         = useState(0);
  const [userPosition, setUserPosition]         = useState<number|null>(null);

  const captchaRef = useRef<HTMLDivElement>(null);

  const userServices = [
    { id:'hair',     label:'hair & beauty',     icon: Sparkles },
    { id:'fashion',  label:'fashion/tailoring', icon: Scissors },
    { id:'cleaning', label:'home cleaning',     icon: Home     },
  ];
  const providerServices = [
    { id:'hairstyling', label:'hair styling' },
    { id:'barbering',   label:'barbering' },
    { id:'tailoring',   label:'tailoring/fashion design' },
    { id:'cleaning',    label:'home cleaning' },
  ];
  const locations = [
    'Agege','Ajeromi-Ifelodun','Alimosho','Amuwo-Odofin','Apapa','Badagry','Epe',
    'Eti-Osa','Ibeju-Lekki','Ifako-Ijaiye','Ikeja','Ikorodu','Kosofe','Lagos Island',
    'Lagos Mainland','Mushin','Ojo','Oshodi-Isolo','Shomolu','Surulere','Ajah',
    'Anthony','Egbeda','Festac','Gbagada','Ikotun','Ikoyi','Isolo','Lekki',
    'Maryland','Ogba','Victoria Island','Yaba','Other Lagos','Outside Lagos',
  ].sort();

  const howItWorks = [
    { title:'discover',        desc:'swipe through verified service providers near you' },
    { title:'book instantly',  desc:'secure booking with escrow payment protection' },
    { title:'rate and review', desc:'build trust with the plug rating system' },
  ];

  const rewards = [
    { k:0,  icon:Gift,       title:'early access',   sub:'join before public launch' },
    { k:3,  icon:Award,      title:'booking credit', sub:'unlock exclusive credit' },
    { k:5,  icon:Star,       title:'premium badge',  sub:'verified member status' },
    { k:10, icon:TrendingUp, title:'vip status',     sub:'priority support and perks' },
  ];

  /* captcha */
  useEffect(() => {
    const load = () => {
      if (window.grecaptcha && captchaRef.current && !captchaLoaded) {
        window.grecaptcha.ready(() => {
          window.grecaptcha.render(captchaRef.current, {
            sitekey: RECAPTCHA_SITE_KEY,
            callback:          (t: string) => setCaptchaToken(t),
            'expired-callback': ()          => setCaptchaToken(null),
          });
          setCaptchaLoaded(true);
        });
      }
    };
    const t = setInterval(() => { if (window.grecaptcha && !captchaLoaded) { load(); clearInterval(t); } }, 100);
    return () => clearInterval(t);
  }, [captchaLoaded]);

  /* referral tracking — fixed: no async useEffect */
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const ref = params.get('ref');
    if (ref) {
      localStorage.setItem('referredBy', ref);
      const track = async () => {
        try {
          await supabase.from('referral_visits').insert([{ referral_code: ref, visited_at: new Date().toISOString() }]);
        } catch {}
      };
      track();
    }
  }, []);

  /* validation */
  const validateEmail = (v: string) => {
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)) {
      setEmailError('please enter a valid email address'); return false;
    }
    const bad = ['tempmail.com','guerrillamail.com','10minutemail.com','throwaway.email'];
    if (bad.includes(v.split('@')[1]?.toLowerCase())) {
      setEmailError('disposable email addresses are not allowed'); return false;
    }
    setEmailError(''); return true;
  };

  const checkDuplicate = async (v: string) => {
    try {
      const { data } = await supabase.from('waitlist').select('email').eq('email', v.toLowerCase()).maybeSingle();
      return !!data;
    } catch { return false; }
  };

  const handleServiceToggle = (id: string) =>
    setSelectedServices(p => p.includes(id) ? p.filter(s => s !== id) : [...p, id]);

  const validateForm = () => {
    if (honeypot)                              return 'suspicious activity detected';
    if (signupAttempts >= MAX_ATTEMPTS)        return 'too many attempts — please try again later';
    if (firstName.trim().length > 50)          return 'first name too long';
    if (lastName.trim().length > 50)           return 'last name too long';
    if (email.length > 254)                    return 'email too long';
    if (suggestion.length > 500)               return 'suggestion too long';
    if (!captchaToken)                         return 'please complete the captcha verification';
    if (!firstName.trim())                     return 'please enter your first name';
    if (!lastName.trim())                      return 'please enter your last name';
    if (!email.trim())                         return 'please enter your email';
    if (!validateEmail(email))                 return emailError;
    if (!userType)                             return "please select if you're a user or provider";
    if (!selectedServices.length)              return 'please select at least one service';
    if (userType === 'provider' && !providerType) return 'please select your provider type';
    if (!location)                             return 'please select your location';
    return null;
  };

  const resetCaptcha = () => { if (window.grecaptcha) { window.grecaptcha.reset(); setCaptchaToken(null); } };

  /* submit */
  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const err = validateForm();
    if (err) { setMsg(err); setSignupAttempts(p => p+1); resetCaptcha(); return; }
    setSubmitting(true); setMsg('');
    try {
      if (await checkDuplicate(email)) {
        setMsg('this email is already on the waitlist');
        setSubmitting(false); setSignupAttempts(p => p+1); resetCaptcha(); return;
      }
      const referredBy    = localStorage.getItem('referredBy');
      const referralCode  = genCode(firstName);

      const { data, error } = await supabase.from('waitlist').insert([{
        email:          email.toLowerCase(),
        first_name:     firstName.trim().substring(0, 50),
        last_name:      lastName.trim().substring(0, 50),
        referral_code:  referralCode,
        referred_by:    referredBy || null,
        referral_count: 0,
        email_confirmed:false,
      }]).select().single();
      if (error) throw error;

      await supabase.from('analytics_events').insert([{
        event_type: 'signup', ref_code: referralCode,
        metadata: {
          user_type: userType, services: selectedServices,
          provider_type: providerType, location,
          suggestion: suggestion ? suggestion.substring(0, 500) : null,
          captcha_verified: true,
        },
      }]);

      if (referredBy) {
        const { data: refRow } = await supabase.from('waitlist').select('id').eq('referral_code', referredBy).maybeSingle();
        if (refRow) {
          try {
            await supabase.rpc('increment_referral_count', { ref_code: referredBy });
          } catch (e) { console.error(e); }
        }
      }

      try {
        await fetch('/api/send-confirmation', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, firstName, lastName, referralCode, userType, services: selectedServices }),
        });
      } catch {}

      const { count } = await supabase.from('waitlist').select('*', { count: 'exact', head: true }).lte('created_at', data.created_at);
      setUserPosition(count || 0);

      const link = `${window.location.origin}?ref=${referralCode}`;
      setRefLink(link); setConfirmEmail(email); setShowConfirm(true); setShowConfetti(true);
      setMsg('you are on the list — check your email to confirm');
      localStorage.removeItem('referredBy');
      setTimeout(() => setShowConfetti(false), 4000);

      setEmail(''); setFirstName(''); setLastName(''); setUserType('');
      setSelectedServices([]); setProviderType(''); setLocation(''); setSuggestion('');
      setSignupAttempts(0); resetCaptcha();
    } catch {
      setMsg('something went wrong — please try again');
      setSignupAttempts(p => p+1); resetCaptcha();
    } finally { setSubmitting(false); }
  };

  const copy = async () => {
    setCopying(true);
    try { await navigator.clipboard.writeText(refLink); setMsg('referral link copied — share it to earn rewards'); if (navigator.vibrate) navigator.vibrate(50); }
    catch { setMsg('failed to copy link'); }
    finally { setTimeout(() => setCopying(false), 1000); }
  };
  const shareToWhatsApp  = () => window.open(`https://wa.me/?text=${encodeURIComponent(`Join me on PLUG — discover trusted services. Use my link: ${refLink}`)}`);
  const shareToTwitter   = () => window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent('Just joined the PLUG waitlist — discover local services the modern way')}&url=${encodeURIComponent(refLink)}`);
  const shareToInstagram = () => { copy(); setMsg('link copied — paste it in your instagram bio or story'); };
  const resendConfirmation = async () => {
    setMsg('sending confirmation email…');
    try {
      await fetch('/api/resend-confirmation', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email: confirmEmail }) });
      setMsg('confirmation email resent — check your inbox');
    } catch { setMsg('failed to resend — please try again'); }
  };

  return (
    <>
      <Script src="https://www.google.com/recaptcha/api.js" strategy="lazyOnload" />
      <div className="pw-root">
        {showConfetti && <Confetti />}

        {/* ── NAV ── */}
        <div className="pw-nav-outer">
          <nav className="pw-nav">
            <motion.a href="#" whileHover={{ scale: 1.04 }} transition={{ type: 'spring', stiffness: 400 }} className="pw-logo">
              pl<span className="pw-dot">u</span>g<span className="pw-dot">.</span>
            </motion.a>
            <motion.a href="#signup" whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} className="pw-btn-accent-sm">
              join waitlist
            </motion.a>
          </nav>
        </div>

        {/* ── HERO ── */}
        <section className="pw-hero">
          <div className="pw-container pw-hero-inner">
            <motion.div className="pw-hero-copy"
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, ease: [0.6, 0.05, 0.01, 0.9] }}>
              <motion.span className="pw-badge" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }}>
                available soon
              </motion.span>
              <motion.h1 className="pw-hero-title"
                initial={{ y: 18, opacity: 0 }} animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.7, delay: 0.12 }}>
                find · connect ·{' '}
                <motion.span className="pw-accent"
                  animate={{ scale: [1, 1.06, 1] }}
                  transition={{ repeat: Infinity, duration: 2.5, ease: 'easeInOut' }}>
                  plug
                </motion.span>
              </motion.h1>
              <motion.p className="pw-hero-sub"
                initial={{ y: 10, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.18 }}>
                discover trusted local professionals message, book and pay with confidence. services at your fingertips.
              </motion.p>
              <motion.div className="pw-hero-actions" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.28 }}>
                <motion.a href="#signup" whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} className="pw-btn-accent">
                  get early access <ArrowRight className="inline w-4 h-4 ml-1" />
                </motion.a>
                <motion.a href="#how" whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} className="pw-btn-ghost">
                  how it works
                </motion.a>
              </motion.div>
            </motion.div>

            {/* hero image */}
            <motion.div className="pw-hero-img-wrap"
              initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.7, delay: 0.22 }}>
              <div className="pw-hero-img-box">
                <img
                  src="/images/230shots_so.png"
                  alt="plug app preview"
                  className="pw-hero-img"
                />
              </div>
            </motion.div>
          </div>
        </section>

        {/* ── SIGNUP FORM ── */}
        <section id="signup" className="pw-section pw-section-tint">
          <div className="pw-container">
            <div className="pw-form-layout">

              {/* left: benefits */}
              <motion.div className="pw-form-left"
                initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }} transition={{ duration: 0.6 }}>
                <h2 className="pw-section-title mb-2">join the <span className="pw-accent">waitlist</span></h2>
                <p className="pw-form-sub">be among the first to access plug when we launch</p>

                <ul className="pw-benefits-list">
                  {[
                    'early access before public launch',
                    'priority onboarding for top referrers',
                    'launch-only perks and invites',
                    'exclusive community access',
                  ].map((item, i) => (
                    <motion.li key={i}
                      initial={{ opacity: 0, x: -10 }} whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }} transition={{ delay: i * 0.07 }}
                      whileHover={{ x: 5 }} className="pw-benefit-item">
                      <CheckCircle2 className="w-4 h-4 flex-shrink-0" style={{ color: BLUE }} />
                      <span className="text-sm text-gray-600 lowercase">{item}</span>
                    </motion.li>
                  ))}
                </ul>

                <motion.div whileHover={{ scale: 1.02 }} className="pw-perk-card mt-8">
                  <p className="text-xs text-gray-500 lowercase">your waitlist perk</p>
                  <p className="mt-1 text-sm text-gray-800 lowercase">
                    <span className="font-semibold text-green-700">10% off</span> your first{' '}
                    <span className="font-semibold text-green-700">5</span> bookings after launch
                  </p>
                </motion.div>

                <div className="pw-ref-stat mt-6">
                  <span className="pw-ref-num">{refs}</span>
                  <span className="pw-ref-label">your referrals</span>
                </div>
              </motion.div>

              {/* right: form card */}
              <motion.div className="pw-form-card"
                initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }} transition={{ duration: 0.6, delay: 0.1 }}>

                {userPosition && (
                  <motion.p initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
                    className="text-sm font-semibold lowercase text-center mb-4" style={{ color: BLUE }}>
                    you are number {userPosition} on the waitlist
                  </motion.p>
                )}

                <form onSubmit={submit} className="pw-form-fields">
                  <input type="text" name="website" value={honeypot} onChange={e => setHoneypot(e.target.value)}
                    style={{ position: 'absolute', left: '-9999px' }} tabIndex={-1} autoComplete="off" />

                  <input className="pw-input" placeholder="email" value={email} type="email" maxLength={254} required
                    onChange={e => { setEmail(e.target.value); if (emailError) validateEmail(e.target.value); }} />
                  {emailError && (
                    <motion.p initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }}
                      className="pw-field-error">{emailError}</motion.p>
                  )}

                  <div className="pw-grid-2">
                    <input className="pw-input" placeholder="first name" value={firstName} maxLength={50} required onChange={e => setFirstName(e.target.value)} />
                    <input className="pw-input" placeholder="last name"  value={lastName}  maxLength={50} required onChange={e => setLastName(e.target.value)} />
                  </div>

                  <div>
                    <label className="pw-label">i'm interested as a</label>
                    <div className="pw-grid-2">
                      {([
                        { val: 'user'     as const, label: 'service user',     Icon: User      },
                        { val: 'provider' as const, label: 'service provider', Icon: Building2 },
                      ]).map(({ val, label, Icon }) => (
                        <motion.button key={val} type="button" whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                          onClick={() => setUserType(val)}
                          className={`pw-type-btn ${userType === val ? 'pw-type-btn--on' : ''}`}>
                          <Icon className="w-5 h-5 mx-auto mb-1" style={{ color: BLUE }} />
                          <span className="text-xs font-medium lowercase">{label}</span>
                        </motion.button>
                      ))}
                    </div>
                  </div>

                  {userType && (
                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}>
                      <label className="pw-label">
                        {userType === 'provider' ? 'which services do you provide' : 'which services interest you'}
                      </label>
                      <div className="pw-stack">
                        {(userType === 'provider' ? providerServices : userServices).map(s => (
                          <motion.button key={s.id} type="button" whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}
                            onClick={() => handleServiceToggle(s.id)}
                            className={`pw-service-btn ${selectedServices.includes(s.id) ? 'pw-service-btn--on' : ''}`}>
                            <span className="text-xs font-medium lowercase flex-1">{s.label}</span>
                            {selectedServices.includes(s.id) && <CheckCircle2 className="w-4 h-4" style={{ color: BLUE }} />}
                          </motion.button>
                        ))}
                      </div>
                    </motion.div>
                  )}

                  {userType === 'provider' && (
                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}>
                      <label className="pw-label">are you</label>
                      <div className="pw-grid-3">
                        {[
                          { value: 'individual', label: 'individual' },
                          { value: 'shop',       label: 'salon/shop' },
                          { value: 'company',    label: 'company'    },
                        ].map(t => (
                          <motion.button key={t.value} type="button" whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                            onClick={() => setProviderType(t.value)}
                            className={`pw-type-btn text-xs py-2 ${providerType === t.value ? 'pw-type-btn--on' : ''}`}>
                            {t.label}
                          </motion.button>
                        ))}
                      </div>
                    </motion.div>
                  )}

                  <div>
                    <label className="pw-label">location</label>
                    <div className="relative">
                      <select value={location} onChange={e => setLocation(e.target.value)}
                        className="pw-input appearance-none w-full" required>
                        <option value="">select your location</option>
                        {locations.map(loc => <option key={loc} value={loc}>{loc.toLowerCase()}</option>)}
                      </select>
                      <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                    </div>
                  </div>

                  <div>
                    <label className="pw-label flex items-center gap-1">
                      <Lightbulb className="w-3 h-3" /> suggestions or ideas
                      <span className="text-gray-400">(optional)</span>
                    </label>
                    <textarea className="pw-input resize-none rounded-2xl min-h-[80px]"
                      placeholder="share any features you'd like to see or ideas you have"
                      value={suggestion} onChange={e => setSuggestion(e.target.value)} maxLength={500} />
                    <p className="text-xs text-gray-400 text-right -mt-1 lowercase">{suggestion.length}/500</p>
                  </div>

                  <div className="flex justify-center"><div ref={captchaRef} /></div>

                  <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                    disabled={submitting || !!emailError} type="submit"
                    className="pw-btn-accent w-full justify-center">
                    {submitting ? 'joining…' : 'join waitlist'}
                  </motion.button>
                </form>

                <p className="mt-4 text-xs text-gray-400 lowercase flex items-center justify-center gap-2">
                  <ShieldCheck className="w-4 h-4" /> no spam · early updates only
                </p>

                <AnimatePresence>
                  {msg && (
                    <motion.p initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                      className="mt-3 text-sm text-gray-500 lowercase text-center">{msg}</motion.p>
                  )}
                </AnimatePresence>

                <AnimatePresence>
                  {showConfirm && (
                    <motion.div initial={{ opacity: 0, y: 10, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0 }} transition={{ type: 'spring', stiffness: 200 }} className="mt-5 pw-confirm-card">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex items-start gap-3">
                          <CheckCircle2 className="w-5 h-5 mt-0.5 flex-shrink-0" style={{ color: BLUE }} />
                          <div>
                            <p className="text-sm font-semibold lowercase">confirmation sent</p>
                            <p className="mt-1 text-sm text-gray-600 lowercase">check <strong>{confirmEmail}</strong> to confirm your spot</p>
                          </div>
                        </div>
                        <button type="button" onClick={() => setShowConfirm(false)}
                          className="text-xs font-semibold hover:opacity-70 transition-opacity flex-shrink-0" style={{ color: BLUE }}>
                          close
                        </button>
                      </div>
                      <div className="mt-4 flex flex-col sm:flex-row gap-2">
                        <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} type="button"
                          onClick={resendConfirmation} className="pw-btn-outline flex-1">resend confirmation</motion.button>
                        <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} type="button"
                          onClick={copy} className="pw-btn-outline flex-1 gap-2">
                          <LinkIcon className="w-4 h-4" /> {copying ? 'copying…' : 'copy referral link'}
                        </motion.button>
                      </div>
                      {refLink && (
                        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
                          className="mt-3 flex gap-2">
                          <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} type="button"
                            onClick={shareToWhatsApp}
                            className="flex-1 rounded-full px-3 py-2 text-xs font-semibold border border-green-200 bg-green-50 text-green-700 hover:bg-green-100 transition-colors flex items-center justify-center gap-1 lowercase">
                            <Share2 className="w-3 h-3" /> whatsapp
                          </motion.button>
                          <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} type="button"
                            onClick={shareToTwitter}
                            className="flex-1 rounded-full px-3 py-2 text-xs font-semibold border border-sky-200 bg-sky-50 text-sky-700 hover:bg-sky-100 transition-colors flex items-center justify-center gap-1 lowercase">
                            <Twitter className="w-3 h-3" /> twitter
                          </motion.button>
                          <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} type="button"
                            onClick={shareToInstagram}
                            className="flex-1 rounded-full px-3 py-2 text-xs font-semibold border border-pink-200 bg-pink-50 text-pink-700 hover:bg-pink-100 transition-colors flex items-center justify-center gap-1 lowercase">
                            <Instagram className="w-3 h-3" /> instagram
                          </motion.button>
                        </motion.div>
                      )}
                      <p className="mt-3 text-xs text-gray-400 lowercase">didn't see it? check spam or promotions, or try resend</p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            </div>
          </div>
        </section>

        {/* ── HOW IT WORKS ── */}
        <section id="how" className="pw-section pw-section-tint">
          <div className="pw-container">
            <motion.div initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
              className="pw-section-header">
              <h2 className="pw-section-title">how <span className="pw-accent">plug</span> works</h2>
              <span className="pw-section-sub">3 steps</span>
            </motion.div>
            <div className="pw-steps-grid">
              {howItWorks.map((s, i) => (
                <motion.div key={s.title}
                  initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }} transition={{ delay: i * 0.1, type: 'spring', stiffness: 200 }}
                  whileHover={{ scale: 1.03, y: -5 }} className="pw-step-card">
                  <div className="pw-step-num">{String(i+1).padStart(2,'0')}</div>
                  <h3 className="pw-step-title">{s.title}</h3>
                  <p className="pw-step-desc">{s.desc}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* ── REWARDS ── */}
        <section className="pw-section pw-section-white">
          <div className="pw-container">
            <motion.div initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
              className="pw-section-header">
              <h2 className="pw-section-title">earn <span className="pw-accent">rewards</span></h2>
              <span className="pw-section-sub">unlock perks as you refer</span>
            </motion.div>

            {/*
              Layout: image LEFT · 2x2 reward grid RIGHT
              Same structure as before, celebration image replaces placeholder
            */}
            <div className="pw-rewards-layout">

              {/* celebration image — replace src when you have your image */}
              <motion.div initial={{ opacity: 0, x: -24 }} whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }} transition={{ duration: 0.65 }}>
                <div className="pw-rewards-img-box">
                  <img
                    src="/images/pexels-gibson-g-wairagu-69813440-10079053-removebg-preview.png"
                    alt="celebrate your rewards"
                    className="pw-rewards-img"
                  />
                </div>
              </motion.div>

              {/* 2x2 reward cards */}
              <div className="pw-rewards-grid">
                {rewards.map((r, i) => {
                  const Icon   = r.icon;
                  const active = refs >= r.k;
                  return (
                    <motion.div key={r.title}
                      initial={{ opacity: 0, y: 18 }} whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }} transition={{ delay: i * 0.08, type: 'spring', stiffness: 200 }}
                      whileHover={{ scale: 1.03, y: -4 }}
                      className={`pw-reward-card ${active ? 'pw-reward-card--on' : ''}`}>
                      <motion.div animate={active ? { scale: [1,1.15,1] } : {}}
                        transition={{ repeat: active ? Infinity : 0, duration: 2 }}
                        className="pw-reward-icon"
                        style={{ background: active ? 'rgba(0,123,255,.1)' : 'rgba(0,0,0,.04)' }}>
                        <Icon className="w-5 h-5" style={{ color: active ? BLUE : '#6B7280' }} />
                      </motion.div>
                      <div className="pw-step-title">{r.title}</div>
                      <div className="pw-step-desc">{r.k === 0 ? r.sub : `${r.k} referrals · ${r.sub}`}</div>
                      <span className={`pw-reward-badge ${active ? 'pw-reward-badge--on' : ''}`}>
                        {active ? 'unlocked' : r.k === 0 ? 'included' : 'locked'}
                      </span>
                    </motion.div>
                  );
                })}
              </div>
            </div>

            {/* cash prize card — sits below, spans full width of the grid area */}
            <motion.div initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }} transition={{ delay: 0.25, type: 'spring', stiffness: 200 }}
              whileHover={{ scale: 1.01, y: -3 }}
              className="pw-prize-card mt-4">
              <div className="pw-prize-icon-wrap">
                <Trophy className="w-5 h-5" style={{ color: BLUE }} />
              </div>
              <div className="pw-prize-body">
                <div className="pw-prize-header">
                  <span className="pw-step-title">referral competition</span>
                  <span className="pw-prize-amount">£1,500</span>
                </div>
                <p className="pw-step-desc">
                  the person with the most referrals at launch wins £1,500 cash — paid directly to them. share your link to enter.
                </p>
              </div>
              <span className="pw-reward-badge">active</span>
            </motion.div>

            <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}
              className="pw-tip-box mt-4">
              <p className="text-xs text-gray-600 lowercase">
                <span className="font-semibold">pro tip</span> — share your link in group chats, social media and communities. each referral counts toward your next unlock.
              </p>
            </motion.div>
          </div>
        </section>

        {/* ── FOOTER ── */}
        <footer className="pw-footer">
          <a href="#" className="pw-logo">pl<span className="pw-dot">u</span>g<span className="pw-dot">.</span></a>
          <p className="text-xs text-gray-400 lowercase mt-2">{new Date().getFullYear()} plug · all rights reserved</p>
        </footer>

        {/* ════════════════════════ STYLES ════════════════════════ */}
        <style jsx global>{`
          @import url('https://fonts.googleapis.com/css2?family=Clash+Display:wght@600;700&family=General+Sans:wght@300;400;500;600&display=swap');

          * { box-sizing: border-box; }

          .pw-root {
            min-height: 100vh; background: #fff; color: #0b0b0b;
            font-family: 'General Sans', system-ui, -apple-system, 'Segoe UI', Roboto, 'Helvetica Neue', Arial;
            -webkit-font-smoothing: antialiased;
          }
          .pw-section-white { background: #fff; }
          .pw-section-tint  { background: #F7F9FC; }

          .pw-dot    { color: #007bff; }
          .pw-accent { color: #007bff; }

          .pw-logo {
            font-family: 'Clash Display', 'General Sans', sans-serif;
            font-size: 1.5rem; font-weight: 700;
            letter-spacing: -0.02em; line-height: 0.92;
            text-decoration: none; color: #0b0b0b; text-transform: lowercase;
          }

          .pw-nav-outer {
            position: sticky; top: 0; z-index: 50;
            background: rgba(255,255,255,.95);
            backdrop-filter: blur(12px); -webkit-backdrop-filter: blur(12px);
            border-bottom: 1px solid rgba(229,231,235,.5);
            box-shadow: 0 1px 3px rgba(0,0,0,.04);
          }
          .pw-nav {
            display: flex; align-items: center; justify-content: space-between;
            max-width: 72rem; margin: 0 auto; padding: 1rem 1.5rem;
          }

          .pw-container { max-width: 72rem; margin: 0 auto; padding: 0 1.5rem; }

          .pw-btn-accent {
            display: inline-flex; align-items: center; justify-content: center;
            background: #007bff; color: #fff;
            font-family: 'General Sans', sans-serif;
            font-size: .875rem; font-weight: 600;
            padding: .75rem 1.5rem; border-radius: 9999px;
            text-decoration: none; border: none; cursor: pointer;
            transition: all .18s ease; text-transform: lowercase;
          }
          .pw-btn-accent:hover    { transform: translateY(-2px); opacity: .92; }
          .pw-btn-accent:disabled { opacity: .55; cursor: not-allowed; transform: none; }

          .pw-btn-accent-sm {
            display: inline-flex; align-items: center;
            background: #007bff; color: #fff;
            font-family: 'General Sans', sans-serif;
            font-size: .8rem; font-weight: 600;
            padding: .5rem 1.25rem; border-radius: 9999px;
            text-decoration: none; transition: all .18s ease; text-transform: lowercase;
          }
          .pw-btn-accent-sm:hover { transform: translateY(-2px); opacity: .92; }

          .pw-btn-ghost {
            display: inline-flex; align-items: center;
            background: transparent; color: #374151;
            font-family: 'General Sans', sans-serif;
            font-size: .875rem; font-weight: 500;
            padding: .625rem 1.5rem; border-radius: 9999px;
            border: 1px solid #D1D5DB;
            text-decoration: none; cursor: pointer;
            transition: border-color .15s, color .15s; text-transform: lowercase;
          }
          .pw-btn-ghost:hover { border-color: #007bff; color: #007bff; }

          .pw-btn-outline {
            display: inline-flex; align-items: center; justify-content: center;
            background: #fff; color: #007bff;
            font-family: 'General Sans', sans-serif;
            font-size: .75rem; font-weight: 500;
            padding: .5rem 1rem; border-radius: 9999px;
            border: 1px solid rgba(0,123,255,.3);
            cursor: pointer; transition: all .18s ease; text-transform: lowercase;
          }
          .pw-btn-outline:hover { opacity: .85; }

          /* hero */
          .pw-hero { padding: 4rem 0 5rem; background: #fff; }
          .pw-hero-inner { display: grid; grid-template-columns: 1fr; gap: 3rem; align-items: center; }
          @media(min-width:1024px){ .pw-hero-inner { grid-template-columns: 1fr 1fr; } }

          .pw-badge {
            display: inline-block; font-size: .7rem; font-weight: 500;
            color: #6B7280; text-transform: lowercase; letter-spacing: .06em; margin-bottom: 1rem;
            background: #E2E8F0; padding: .2rem .65rem; border-radius: 9999px;
          }
          .pw-hero-title {
            font-family: 'Clash Display', 'General Sans', sans-serif;
            font-size: clamp(2.75rem, 5.5vw, 4.5rem); font-weight: 700;
            letter-spacing: -0.02em; line-height: 0.92;
            text-transform: lowercase; margin-bottom: 1.25rem;
          }
          .pw-hero-sub {
            font-size: 1rem; color: #4B5563; max-width: 28rem;
            line-height: 1.7; text-transform: lowercase; margin-bottom: 2rem;
          }
          .pw-hero-actions { display: flex; gap: .75rem; flex-wrap: wrap; }

          .pw-hero-img-wrap { display: flex; align-items: center; justify-content: center; }
          .pw-hero-img-box {
            width: 100%; max-width: 420px;
            background: transparent;
            border: none;
            box-shadow: none;
            overflow: visible;
          }
          .pw-hero-img { width: 100%; height: auto; display: block; border-radius: 0; background: transparent; }

          /* sections */
          .pw-section { padding: 5rem 0; }
          .pw-section-header {
            display: flex; align-items: baseline; justify-content: space-between; margin-bottom: 2.5rem;
          }
          .pw-section-title {
            font-family: 'Clash Display', 'General Sans', sans-serif;
            font-size: clamp(1.5rem, 3vw, 2rem); font-weight: 700;
            letter-spacing: -0.02em; text-transform: lowercase;
          }
          .pw-section-sub { font-size: .75rem; color: #9CA3AF; text-transform: lowercase; }

          /* how it works */
          .pw-steps-grid { display: grid; grid-template-columns: 1fr; gap: 1rem; }
          @media(min-width:768px){ .pw-steps-grid { grid-template-columns: repeat(3, 1fr); } }

          .pw-step-card {
            background: #fff; border: 1px solid #E2E8F0;
            border-radius: 1rem; padding: 1.5rem;
            transition: all .25s cubic-bezier(.4,0,.2,1);
          }
          .pw-step-num   { font-size: .62rem; font-weight: 700; color: #007bff; letter-spacing: .1em; margin-bottom: .9rem; opacity: .6; }
          .pw-step-title { font-size: .88rem; font-weight: 600; letter-spacing: -.01em; text-transform: lowercase; margin-bottom: .45rem; }
          .pw-step-desc  { font-size: .78rem; color: #6B7280; text-transform: lowercase; line-height: 1.55; }

          /* rewards */
          .pw-rewards-layout {
            display: grid; grid-template-columns: 1fr; gap: 2rem; align-items: start;
          }
          @media(min-width:1024px){ .pw-rewards-layout { grid-template-columns: 1fr 1.5fr; align-items: stretch; } }

          .pw-rewards-img-box {
            width: 100%; min-height: 300px;
            background: transparent; border: none;
            display: flex; align-items: center; justify-content: center;
            overflow: visible;
          }
          @media(min-width:1024px){ .pw-rewards-img-box { height: 100%; min-height: 0; } }
          .pw-rewards-img { width: 100%; height: 100%; object-fit: contain; display: block; background: transparent; }

          .pw-rewards-grid { display: grid; grid-template-columns: 1fr 1fr; gap: .85rem; }

          .pw-reward-card {
            background: #fff; border: 1px solid #E2E8F0;
            border-radius: 1rem; padding: 1.25rem;
            display: flex; flex-direction: column; gap: .6rem;
            transition: all .25s cubic-bezier(.4,0,.2,1);
          }
          .pw-reward-card--on { border-color: rgba(0,123,255,.3); background: #f0f7ff; }

          .pw-reward-icon {
            width: 2.4rem; height: 2.4rem; border-radius: 9999px;
            display: flex; align-items: center; justify-content: center;
          }
          .pw-reward-badge {
            font-size: .62rem; font-weight: 600; padding: .18rem .55rem;
            border-radius: 9999px; border: 1px solid #E2E8F0;
            color: #9CA3AF; text-transform: lowercase; width: fit-content;
          }
          .pw-reward-badge--on { border-color: rgba(0,123,255,.3); color: #007bff; background: #e6f2ff; }

          /* cash prize card — spans right column width (same as rewards grid), sits on its own row */
          .pw-prize-card {
            background: #fff; border: 1px solid #E2E8F0;
            border-radius: 1rem; padding: 1.25rem;
            display: flex; align-items: flex-start; gap: 1rem;
            transition: all .25s cubic-bezier(.4,0,.2,1);
          }
          @media(min-width:1024px) {
            /* indent prize card to align with the rewards grid (right column) */
            .pw-prize-card {
              margin-left: calc((100% + 2rem) * (1 / 2.5));
            }
          }
          .pw-prize-icon-wrap {
            width: 2.4rem; height: 2.4rem; border-radius: 9999px; flex-shrink: 0;
            background: rgba(0,123,255,.1);
            display: flex; align-items: center; justify-content: center;
          }
          .pw-prize-body { flex: 1; display: flex; flex-direction: column; gap: .45rem; }
          .pw-prize-header {
            display: flex; align-items: baseline; justify-content: space-between; gap: .5rem;
          }
          .pw-prize-amount {
            font-family: 'Clash Display', sans-serif;
            font-size: 1.1rem; font-weight: 700;
            letter-spacing: -0.02em; color: #007bff;
          }

          /* tip */
          .pw-tip-box { padding: .875rem 1rem; background: #F7F9FC; border: 1px solid #E2E8F0; border-radius: .75rem; }
          @media(min-width:1024px) {
            .pw-tip-box {
              margin-left: calc((100% + 2rem) * (1 / 2.5));
            }
          }

          /* form */
          .pw-form-layout { display: grid; grid-template-columns: 1fr; gap: 3rem; align-items: start; }
          @media(min-width:1024px){ .pw-form-layout { grid-template-columns: 1fr 1.35fr; } }

          .pw-form-sub { font-size: .875rem; color: #6B7280; text-transform: lowercase; margin-bottom: 2rem; }

          .pw-form-card {
            background: #fff; border: 1px solid #E2E8F0;
            border-radius: 1.25rem; padding: 2rem;
          }
          .pw-form-fields { display: flex; flex-direction: column; gap: .75rem; }

          .pw-input {
            width: 100%; padding: .72rem 1rem;
            border-radius: 9999px; border: 1px solid #E2E8F0;
            background: #F8FAFC; font-size: .875rem;
            transition: all .2s; text-transform: lowercase; color: #111; outline: none;
          }
          .pw-input::placeholder { text-transform: lowercase; color: #9CA3AF; }
          .pw-input:focus { border-color: #007bff; background: #fff; box-shadow: 0 0 0 3px rgba(0,123,255,.12); }

          .pw-label {
            display: block; font-size: .7rem; color: #9CA3AF;
            text-transform: lowercase; margin-bottom: .4rem; letter-spacing: .01em;
          }
          .pw-field-error { font-size: .7rem; color: #EF4444; text-transform: lowercase; margin-top: -.25rem; }

          .pw-grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: .65rem; }
          .pw-grid-3 { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: .5rem; }
          .pw-stack  { display: flex; flex-direction: column; gap: .5rem; }

          .pw-type-btn {
            padding: .72rem; border-radius: .875rem;
            border: 1px solid #E2E8F0; background: #F8FAFC;
            cursor: pointer; transition: all .15s; text-align: center;
          }
          .pw-type-btn:hover { border-color: rgba(0,123,255,.35); }
          .pw-type-btn--on   { border-color: #007bff !important; background: #e6f2ff !important; }

          .pw-service-btn {
            width: 100%; padding: .72rem 1rem; border-radius: .875rem;
            border: 1px solid #E2E8F0; background: #fff;
            cursor: pointer; transition: all .15s;
            display: flex; align-items: center; gap: .5rem; text-align: left;
          }
          .pw-service-btn:hover { border-color: rgba(0,123,255,.35); }
          .pw-service-btn--on   { border-color: #007bff !important; background: #e6f2ff !important; }

          .pw-benefits-list { display: flex; flex-direction: column; gap: .9rem; }
          .pw-benefit-item  { display: flex; align-items: flex-start; gap: .6rem; }

          .pw-perk-card {
            border-radius: .875rem; border: 1px solid #E2E8F0;
            background: #F7F9FC; padding: 1rem;
          }

          .pw-ref-stat {
            display: flex; flex-direction: column; align-items: center;
            text-align: center; width: 100%;
          }
          .pw-ref-num   { font-size: 3.5rem; font-weight: 600; line-height: 1; color: #111; letter-spacing: -.04em; }
          .pw-ref-label { font-size: .8rem; color: #9CA3AF; text-transform: lowercase; margin-top: .3rem; letter-spacing: .02em; }

          .pw-confirm-card {
            background: #F0FDF4; border: 1px solid #BBF7D0;
            border-radius: 1rem; padding: 1.25rem;
          }

          .pw-footer {
            text-align: center; padding: 3rem 1.5rem;
            border-top: 1px solid #E2E8F0; background: #fff;
          }
        `}</style>
      </div>
    </>
  );
}