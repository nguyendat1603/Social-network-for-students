import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { APP_ROUTES } from '../../../config/routes.config';
import { useAuth } from '../../../hooks/useAuth';
import { useTypewriter } from '../../../hooks/useTypewriter';
import { identityService } from '../../../services/identity.service';
import { FacultyItem } from '../../../types/identity.types';

type ParticleKind = 'BOOK' | 'PAPER' | 'NOTE_PAGE' | 'LETTER';

interface FlutterParticle {
  id: number;
  kind: ParticleKind;
  x: number;
  y: number;
  vx: number;
  vy: number;
  gravity: number;
  swayAmp: number;
  swayFreq: number;
  swayPhase: number;
  rotX: number;
  rotY: number;
  rotZ: number;
  vRotX: number;
  vRotY: number;
  vRotZ: number;
  scale: number;
  age: number;
  maxAge: number;
  label?: string;
  tint: string;
}

const BK_LETTERS_AND_SYMBOLS = [
  'A+',
  'B',
  'K',
  '∑',
  '∫',
  'π',
  'Δ',
  'λ',
  '∞',
  'f(x)',
  '∂',
  '√x',
  'HUST',
  'ĐHBK',
  'α',
  'β',
  'Ω',
  '{ }',
  'dx',
  'e^x',
  'K68',
  'K69',
];

const PAPER_TINTS = [
  '#ffffff',
  '#fffbeb', // warm cream book page
  '#f8fafc', // crisp white sheet
  '#fef3c7', // vintage textbook page
  '#e0f2fe', // blueprint tint
];

export const LandingAuthPage: React.FC = () => {
  const navigate = useNavigate();
  const { setSession, isAuthenticated } = useAuth();

  // Mobile menu toggle
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Action buttons visibility (400ms after page load)
  const [buttonsVisible, setButtonsVisible] = useState(false);

  // Copy email feedback state
  const [copied, setCopied] = useState(false);

  // Student Auth Modal (Exclusively HUST)
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authTab, setAuthTab] = useState<'LOGIN' | 'REGISTER'>('LOGIN');
  const [authEmail, setAuthEmail] = useState('dat.nt215340@sis.hust.edu.vn');
  const [authPassword, setAuthPassword] = useState('Student@123');
  const [regFullName, setRegFullName] = useState('');
  const [regStudentId, setRegStudentId] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regFacultyId, setRegFacultyId] = useState('');
  const [faculties, setFaculties] = useState<FacultyItem[]>([]);
  const [authLoading, setAuthLoading] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  // Fluttering books/papers/letters state
  const [particles, setParticles] = useState<FlutterParticle[]>([]);
  const particlesRef = useRef<FlutterParticle[]>([]);
  const nextParticleIdRef = useRef<number>(1);
  const lastMoveSpawnRef = useRef<number>(0);

  // Typewriter hook (Vietnamese exclusively for Bách Khoa students)
  const { displayed, done } = useTypewriter(
    'Chào mừng đồng môn trở lại. Dân Bách Khoa luôn tìm thấy nhau ở đây. Hôm nay chúng ta cùng chinh phục học phần nào?',
    34,
    600
  );

  // Video scrub references
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const prevXRef = useRef<number | null>(null);
  const targetTimeRef = useRef<number>(0);
  const isSeekingRef = useRef<boolean>(false);

  // Load HUST faculties for registration
  useEffect(() => {
    identityService
      .getCatalog()
      .then((res) => {
        setFaculties(res.faculties || []);
        if (res.faculties && res.faculties.length > 0) {
          setRegFacultyId(res.faculties[0].id);
        }
      })
      .catch(() => {});
  }, []);

  // Action buttons fade-in (400ms after load)
  useEffect(() => {
    const timer = setTimeout(() => {
      setButtonsVisible(true);
    }, 400);
    return () => clearTimeout(timer);
  }, []);

  // Spawn fluttering books, paper sheets, and academic letters
  const spawnFlutterParticles = useCallback((originX: number, originY: number, count: number) => {
    const kinds: ParticleKind[] = ['PAPER', 'BOOK', 'LETTER', 'NOTE_PAGE', 'LETTER', 'PAPER'];
    const created: FlutterParticle[] = [];

    for (let i = 0; i < count; i++) {
      const kind = kinds[Math.floor(Math.random() * kinds.length)];
      const angle = -Math.PI / 2 + (Math.random() - 0.5) * Math.PI * 1.35;
      const speed = 1.4 + Math.random() * 2.8;

      created.push({
        id: nextParticleIdRef.current++,
        kind,
        x: originX + (Math.random() - 0.5) * 44,
        y: originY + (Math.random() - 0.5) * 18,
        vx: Math.cos(angle) * speed * 0.9,
        vy: Math.sin(angle) * speed - 0.6, // initial upward lift then gentle float
        gravity: 0.028 + Math.random() * 0.025, // light paper gravity so it floats & falls lả tả
        swayAmp: 1.1 + Math.random() * 1.8,
        swayFreq: 0.06 + Math.random() * 0.05,
        swayPhase: Math.random() * Math.PI * 2,
        rotX: Math.random() * 360,
        rotY: Math.random() * 360,
        rotZ: (Math.random() - 0.5) * 50,
        vRotX: (Math.random() - 0.5) * 9,
        vRotY: (Math.random() - 0.5) * 11,
        vRotZ: (Math.random() - 0.5) * 4.5,
        scale: 0.78 + Math.random() * 0.48,
        age: 0,
        maxAge: 62 + Math.floor(Math.random() * 36),
        label:
          kind === 'LETTER'
            ? BK_LETTERS_AND_SYMBOLS[Math.floor(Math.random() * BK_LETTERS_AND_SYMBOLS.length)]
            : undefined,
        tint: PAPER_TINTS[Math.floor(Math.random() * PAPER_TINTS.length)],
      });
    }

    particlesRef.current = [...particlesRef.current.slice(-75), ...created];
  }, []);

  // Button hover handlers to trigger books/papers/letters effect
  const handleButtonMouseEnter = useCallback(
    (e: React.MouseEvent<HTMLElement>) => {
      const rect = e.currentTarget.getBoundingClientRect();
      const x = e.clientX || rect.left + rect.width / 2;
      const y = e.clientY || rect.top + rect.height / 2;
      spawnFlutterParticles(x, y, 11);
    },
    [spawnFlutterParticles]
  );

  const handleButtonMouseMove = useCallback(
    (e: React.MouseEvent<HTMLElement>) => {
      const now = performance.now();
      if (now - lastMoveSpawnRef.current < 42) return;
      lastMoveSpawnRef.current = now;
      spawnFlutterParticles(e.clientX, e.clientY, 3);
    },
    [spawnFlutterParticles]
  );

  // Animation loop for fluttering particles
  useEffect(() => {
    let rafId: number;

    const updateParticles = () => {
      if (particlesRef.current.length > 0) {
        const updated: FlutterParticle[] = [];
        for (const p of particlesRef.current) {
          const nextAge = p.age + 1;
          if (nextAge < p.maxAge) {
            const swayVx = Math.sin(nextAge * p.swayFreq + p.swayPhase) * p.swayAmp;
            updated.push({
              ...p,
              age: nextAge,
              x: p.x + p.vx + swayVx,
              y: p.y + p.vy,
              vx: p.vx * 0.985,
              vy: p.vy * 0.98 + p.gravity,
              rotX: p.rotX + p.vRotX,
              rotY: p.rotY + p.vRotY,
              rotZ: p.rotZ + p.vRotZ,
            });
          }
        }
        particlesRef.current = updated;
        setParticles(updated);
      }
      rafId = requestAnimationFrame(updateParticles);
    };

    rafId = requestAnimationFrame(updateParticles);
    return () => cancelAnimationFrame(rafId);
  }, []);

  // onSeeked handler to prevent seek-flooding
  const handleSeeked = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;
    isSeekingRef.current = false;
    if (Math.abs(video.currentTime - targetTimeRef.current) > 0.02) {
      isSeekingRef.current = true;
      video.currentTime = targetTimeRef.current;
    }
  }, []);

  // Horizontal mouse movement scrubber
  useEffect(() => {
    const SENSITIVITY = 0.8;

    const handleMouseMove = (e: MouseEvent) => {
      const video = videoRef.current;
      if (!video || !video.duration || Number.isNaN(video.duration)) {
        prevXRef.current = e.clientX;
        return;
      }

      if (prevXRef.current === null) {
        prevXRef.current = e.clientX;
        targetTimeRef.current = video.currentTime;
        return;
      }

      const delta = e.clientX - prevXRef.current;
      prevXRef.current = e.clientX;

      const timeOffset = (delta / window.innerWidth) * SENSITIVITY * video.duration;
      const nextTime = Math.max(0, Math.min(video.duration, targetTimeRef.current + timeOffset));
      targetTimeRef.current = nextTime;

      if (!isSeekingRef.current) {
        isSeekingRef.current = true;
        video.currentTime = nextTime;
      }
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);

  // Copy HUST contact email to clipboard
  const handleCopyEmail = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    handleButtonMouseEnter(e);
    try {
      await navigator.clipboard.writeText('bk@sis.hust.edu.vn');
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback
    }
  };

  // Validate Bách Khoa email domain
  const isHustEmail = (email: string) => {
    const lower = email.trim().toLowerCase();
    return lower.endsWith('@sis.hust.edu.vn') || lower.endsWith('@hust.edu.vn');
  };

  // Quick student login handler (HUST only)
  const handleQuickLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);

    if (!isHustEmail(authEmail)) {
      setAuthError(
        'Hệ thống chỉ dành riêng cho Sinh viên Đại học Bách Khoa Hà Nội (@sis.hust.edu.vn hoặc @hust.edu.vn).'
      );
      return;
    }

    setAuthLoading(true);
    try {
      const res = await identityService.login(authEmail, authPassword);
      setSession(res.user, res.accessToken, res.refreshToken);
      navigate(APP_ROUTES.CAMPUS_FEED);
    } catch (err) {
      setAuthError(err instanceof Error ? err.message : 'Đăng nhập không thành công.');
    } finally {
      setAuthLoading(false);
    }
  };

  // Register HUST student handler
  const handleRegisterHust = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);

    if (!isHustEmail(regEmail)) {
      setAuthError(
        'Vui lòng sử dụng email trường Đại học Bách Khoa Hà Nội (@sis.hust.edu.vn hoặc @hust.edu.vn).'
      );
      return;
    }

    setAuthLoading(true);
    try {
      await identityService.registerEdu({
        email: regEmail,
        password: regPassword,
        fullName: regFullName,
        studentCode: regStudentId,
        facultyId: regFacultyId || undefined,
      });
      navigate(`${APP_ROUTES.VERIFY_OTP}?email=${encodeURIComponent(regEmail)}`);
    } catch (err) {
      setAuthError(err instanceof Error ? err.message : 'Đăng ký tài khoản thất bại.');
    } finally {
      setAuthLoading(false);
    }
  };

  // 1-Click HUST Microsoft 365 SSO login handler
  const handleHustSso = async () => {
    setAuthLoading(true);
    setAuthError(null);
    try {
      const ssoEmail = authEmail.trim() && isHustEmail(authEmail)
        ? authEmail.trim()
        : 'dat.nt215340@sis.hust.edu.vn';
      const res = await identityService.schoolSsoLogin({
        email: ssoEmail,
        fullName: 'Nguyễn Thành Đạt — SV Bách Khoa (HUST SSO)',
        ssoSubjectId: `sso-hust-${ssoEmail}`,
      });
      setSession(res.user, res.accessToken, res.refreshToken);
      navigate(APP_ROUTES.CAMPUS_FEED);
    } catch (err) {
      setAuthError(err instanceof Error ? err.message : 'Đăng nhập HUST SSO thất bại.');
    } finally {
      setAuthLoading(false);
    }
  };

  return (
    <div
      className="relative w-full h-screen overflow-hidden text-white select-none"
      style={{ fontFamily: 'var(--font-body)' }}
    >
      {/* 1. BACKGROUND VIDEO (mouse-scrub controlled) */}
      <video
        ref={videoRef}
        src="https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260826_041744_63efcd78-bf7d-4039-99e2-2461e8a61903.mp4"
        muted
        playsInline
        preload="auto"
        onSeeked={handleSeeked}
        style={{
          position: 'fixed',
          inset: 0,
          zIndex: 0,
          width: '100vw',
          height: '100vh',
          objectFit: 'cover',
          objectPosition: '70% center',
          pointerEvents: 'none',
        }}
      />

      {/* 1.5 FLUTTERING BOOKS / PAPER SHEETS / LETTERS PARTICLE LAYER */}
      <div
        className="fixed inset-0 pointer-events-none overflow-hidden"
        style={{ zIndex: 60, perspective: '800px' }}
      >
        {particles.map((p) => {
          const progress = p.age / p.maxAge;
          const opacity =
            progress < 0.15
              ? progress / 0.15
              : progress > 0.72
              ? Math.max(0, (1 - progress) / 0.28)
              : 0.95;

          return (
            <div
              key={p.id}
              style={{
                position: 'fixed',
                left: 0,
                top: 0,
                transform: `translate3d(${p.x}px, ${p.y}px, 0) scale(${p.scale}) rotateX(${p.rotX}deg) rotateY(${p.rotY}deg) rotateZ(${p.rotZ}deg)`,
                opacity,
                transformStyle: 'preserve-3d',
                willChange: 'transform, opacity',
              }}
            >
              {/* Kind 1: Open Book SVG */}
              {p.kind === 'BOOK' && (
                <div
                  style={{
                    filter: 'drop-shadow(0 4px 10px rgba(0,0,0,0.45))',
                    color: p.tint,
                  }}
                >
                  <svg width="26" height="22" viewBox="0 0 24 24" fill="currentColor">
                    <path
                      d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                      stroke="#1e293b"
                      strokeWidth="1.4"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>
              )}

              {/* Kind 2: Fluttering Paper Sheet with folded corner & lines */}
              {p.kind === 'PAPER' && (
                <div
                  style={{
                    width: '20px',
                    height: '26px',
                    background: p.tint,
                    borderRadius: '2px',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.38)',
                    border: '1px solid rgba(0,0,0,0.15)',
                    padding: '4px 3px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '3px',
                    position: 'relative',
                  }}
                >
                  <div
                    style={{
                      width: '75%',
                      height: '1.5px',
                      background: '#64748b',
                      opacity: 0.65,
                    }}
                  />
                  <div
                    style={{
                      width: '100%',
                      height: '1.5px',
                      background: '#94a3b8',
                      opacity: 0.55,
                    }}
                  />
                  <div
                    style={{
                      width: '85%',
                      height: '1.5px',
                      background: '#94a3b8',
                      opacity: 0.55,
                    }}
                  />
                  <div
                    style={{
                      width: '60%',
                      height: '1.5px',
                      background: '#64748b',
                      opacity: 0.65,
                    }}
                  />
                </div>
              )}

              {/* Kind 3: Exam / Formula Note Sheet */}
              {p.kind === 'NOTE_PAGE' && (
                <div
                  style={{
                    width: '24px',
                    height: '28px',
                    background: '#fffbeb',
                    borderRadius: '3px',
                    boxShadow: '0 5px 14px rgba(0,0,0,0.42)',
                    border: '1px solid rgba(180,83,9,0.25)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '9px',
                    fontWeight: 700,
                    color: '#991b1b',
                    fontFamily: 'serif',
                  }}
                >
                  ∫dx
                </div>
              )}

              {/* Kind 4: Floating Letters & Math Symbols */}
              {p.kind === 'LETTER' && (
                <span
                  style={{
                    display: 'inline-block',
                    padding: '1px 5px',
                    fontSize: '14px',
                    fontWeight: 700,
                    color: '#ffffff',
                    textShadow: '0 2px 10px rgba(0,0,0,0.85), 0 0 8px rgba(255,255,255,0.45)',
                    fontFamily: 'var(--font-heading)',
                    letterSpacing: '-0.02em',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {p.label}
                </span>
              )}
            </div>
          );
        })}
      </div>

      {/* 2. NAVBAR (fixed, z-index: 10) */}
      <header className="fixed top-0 left-0 right-0 z-10 w-full px-5 sm:px-8 py-4 sm:py-5 flex justify-between items-center">
        {/* Logo (left) */}
        <div
          className="flex items-center gap-3 cursor-pointer"
          onMouseEnter={handleButtonMouseEnter}
          onMouseMove={handleButtonMouseMove}
          onClick={() => {
            if (isAuthenticated) {
              navigate(APP_ROUTES.CAMPUS_FEED);
            } else {
              setShowAuthModal(true);
            }
          }}
        >
          <span
            className="text-[21px] sm:text-[26px] tracking-tight text-white"
            style={{ fontFamily: 'var(--font-heading)' }}
          >
            BáchKhoa®
          </span>
          <span
            className="text-[25px] sm:text-[30px] text-white select-none"
            style={{ letterSpacing: '-0.02em' }}
          >
            ✳︎
          </span>
        </div>

        {/* Desktop nav links (center, hidden below md) */}
        <nav className="hidden md:flex items-center text-[22px] text-white">
          <button
            type="button"
            onMouseEnter={handleButtonMouseEnter}
            onMouseMove={handleButtonMouseMove}
            onClick={() => setShowAuthModal(true)}
            className="hover:opacity-60 transition-opacity cursor-pointer bg-transparent border-0 p-0 text-[22px] text-white"
          >
            Bảng tin
          </button>
          <span>,&nbsp;</span>
          <button
            type="button"
            onMouseEnter={handleButtonMouseEnter}
            onMouseMove={handleButtonMouseMove}
            onClick={() => setShowAuthModal(true)}
            className="hover:opacity-60 transition-opacity cursor-pointer bg-transparent border-0 p-0 text-[22px] text-white"
          >
            Trường &amp; Viện
          </button>
          <span>,&nbsp;</span>
          <button
            type="button"
            onMouseEnter={handleButtonMouseEnter}
            onMouseMove={handleButtonMouseMove}
            onClick={() => setShowAuthModal(true)}
            className="hover:opacity-60 transition-opacity cursor-pointer bg-transparent border-0 p-0 text-[22px] text-white"
          >
            Đề cương &amp; Tài liệu
          </button>
          <span>,&nbsp;</span>
          <button
            type="button"
            onMouseEnter={handleButtonMouseEnter}
            onMouseMove={handleButtonMouseMove}
            onClick={() => setShowAuthModal(true)}
            className="hover:opacity-60 transition-opacity cursor-pointer bg-transparent border-0 p-0 text-[22px] text-white"
          >
            Nhóm Đồ án
          </button>
        </nav>

        {/* Desktop CTA (right, hidden below md) */}
        <div className="hidden md:block">
          <button
            type="button"
            onMouseEnter={handleButtonMouseEnter}
            onMouseMove={handleButtonMouseMove}
            onClick={() => setShowAuthModal(true)}
            className="text-[22px] text-white underline underline-offset-2 hover:opacity-60 transition-opacity cursor-pointer bg-transparent border-0 p-0"
          >
            Đăng nhập HUST
          </button>
        </div>

        {/* Mobile hamburger (visible below md) */}
        <button
          type="button"
          onMouseEnter={handleButtonMouseEnter}
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label="Mở menu điều hướng"
          className="md:hidden flex flex-col justify-center items-center w-8 h-8 gap-[5px] bg-transparent border-0 cursor-pointer p-0 z-20"
        >
          <span
            className={`w-6 h-[2px] bg-white transition-all duration-300 ${
              mobileMenuOpen ? 'rotate-45 translate-y-[7px]' : ''
            }`}
          />
          <span
            className={`w-6 h-[2px] bg-white transition-opacity duration-300 ${
              mobileMenuOpen ? 'opacity-0' : 'opacity-100'
            }`}
          />
          <span
            className={`w-6 h-[2px] bg-white transition-all duration-300 ${
              mobileMenuOpen ? '-rotate-45 -translate-y-[7px]' : ''
            }`}
          />
        </button>
      </header>

      {/* Mobile overlay (z-index: 9) */}
      <div
        className={`md:hidden fixed inset-0 z-[9] bg-black/90 backdrop-blur-md flex flex-col justify-center px-8 gap-8 transition-opacity duration-300 ${
          mobileMenuOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
      >
        <button
          type="button"
          onMouseEnter={handleButtonMouseEnter}
          onClick={() => {
            setMobileMenuOpen(false);
            setShowAuthModal(true);
          }}
          className="text-left text-[32px] font-medium text-white bg-transparent border-0 p-0"
        >
          Bảng tin
        </button>
        <button
          type="button"
          onMouseEnter={handleButtonMouseEnter}
          onClick={() => {
            setMobileMenuOpen(false);
            setShowAuthModal(true);
          }}
          className="text-left text-[32px] font-medium text-white bg-transparent border-0 p-0"
        >
          Trường &amp; Viện
        </button>
        <button
          type="button"
          onMouseEnter={handleButtonMouseEnter}
          onClick={() => {
            setMobileMenuOpen(false);
            setShowAuthModal(true);
          }}
          className="text-left text-[32px] font-medium text-white bg-transparent border-0 p-0"
        >
          Đề cương &amp; Tài liệu
        </button>
        <button
          type="button"
          onMouseEnter={handleButtonMouseEnter}
          onClick={() => {
            setMobileMenuOpen(false);
            setShowAuthModal(true);
          }}
          className="text-left text-[32px] font-medium text-white bg-transparent border-0 p-0"
        >
          Nhóm Đồ án
        </button>
        <button
          type="button"
          onMouseEnter={handleButtonMouseEnter}
          onClick={() => {
            setMobileMenuOpen(false);
            setShowAuthModal(true);
          }}
          className="text-left text-[32px] font-medium text-white underline underline-offset-2 bg-transparent border-0 p-0"
        >
          Đăng nhập HUST
        </button>
      </div>

      {/* 3. HERO SECTION (z-index: 1) */}
      <main className="relative z-[1] w-full h-screen flex flex-col justify-end pb-12 md:justify-center md:pb-0 px-5 sm:px-8 md:px-10 overflow-hidden">
        <div className="max-w-xl relative z-10">
          {/* 1. Blurred intro label */}
          <div
            className="pointer-events-none select-none mb-5 sm:mb-6"
            style={{
              fontSize: 'clamp(18px, 4vw, 26px)',
              lineHeight: 1.3,
              fontWeight: 400,
              color: '#ffffff',
              filter: 'blur(4px)',
            }}
          >
            Xin chào sinh viên Bách Khoa, đây là B.K.A.I,
            <br />
            Không gian Tri thức &amp; Học thuật Đại học Bách Khoa Hà Nội
          </div>

          {/* 2. Typewriter text */}
          <p
            className="text-white mb-5 sm:mb-6"
            style={{
              fontSize: 'clamp(18px, 4vw, 26px)',
              lineHeight: 1.35,
              fontWeight: 400,
              minHeight: '54px',
            }}
          >
            {displayed}
            {!done && (
              <span className="inline-block w-[2px] h-[1.1em] bg-white align-middle ml-[2px] animate-blink" />
            )}
          </p>

          {/* 3. Action pill buttons (Hover triggers books/papers/letters flying!) */}
          <div
            className="flex flex-wrap gap-y-1"
            style={{
              opacity: buttonsVisible ? 1 : 0,
              transform: buttonsVisible ? 'translateY(0)' : 'translateY(8px)',
              transition: 'opacity 0.4s ease, transform 0.4s ease',
            }}
          >
            {/* 4 white pill buttons */}
            <button
              type="button"
              onMouseEnter={handleButtonMouseEnter}
              onMouseMove={handleButtonMouseMove}
              onClick={() => setShowAuthModal(true)}
              className="inline-flex items-center justify-center bg-white text-black border border-black/10 rounded-full text-[13px] sm:text-[15px] px-4 sm:px-5 py-[0.3em] mx-[0.2em] mb-[0.4em] whitespace-nowrap hover:bg-black hover:text-white transition-colors duration-200 cursor-pointer"
            >
              Vào Bảng tin Bách Khoa
            </button>

            <button
              type="button"
              onMouseEnter={handleButtonMouseEnter}
              onMouseMove={handleButtonMouseMove}
              onClick={() => setShowAuthModal(true)}
              className="inline-flex items-center justify-center bg-white text-black border border-black/10 rounded-full text-[13px] sm:text-[15px] px-4 sm:px-5 py-[0.3em] mx-[0.2em] mb-[0.4em] whitespace-nowrap hover:bg-black hover:text-white transition-colors duration-200 cursor-pointer"
            >
              Tìm đồng đội làm Đồ án
            </button>

            <button
              type="button"
              onMouseEnter={handleButtonMouseEnter}
              onMouseMove={handleButtonMouseMove}
              onClick={() => setShowAuthModal(true)}
              className="inline-flex items-center justify-center bg-white text-black border border-black/10 rounded-full text-[13px] sm:text-[15px] px-4 sm:px-5 py-[0.3em] mx-[0.2em] mb-[0.4em] whitespace-nowrap hover:bg-black hover:text-white transition-colors duration-200 cursor-pointer"
            >
              Kho đề thi Giải tích &amp; IT
            </button>

            <button
              type="button"
              onMouseEnter={handleButtonMouseEnter}
              onMouseMove={handleButtonMouseMove}
              onClick={() => {
                if (isAuthenticated) {
                  navigate(APP_ROUTES.CAMPUS_FEED);
                } else {
                  setShowAuthModal(true);
                }
              }}
              className="inline-flex items-center justify-center bg-white text-black border border-black/10 rounded-full text-[13px] sm:text-[15px] px-4 sm:px-5 py-[0.3em] mx-[0.2em] mb-[0.4em] whitespace-nowrap hover:bg-black hover:text-white transition-colors duration-200 cursor-pointer"
            >
              Đăng nhập bằng Mail Trường
            </button>

            {/* 1 outline pill button with copy icon */}
            <button
              type="button"
              onMouseEnter={handleButtonMouseEnter}
              onMouseMove={handleButtonMouseMove}
              onClick={handleCopyEmail}
              className="text-white bg-transparent border border-white rounded-full inline-flex items-center justify-center text-[13px] sm:text-[15px] px-4 sm:px-5 py-[0.3em] mx-[0.2em] mb-[0.4em] whitespace-nowrap gap-2 sm:gap-3 hover:bg-white hover:text-black transition-colors duration-200 cursor-pointer"
            >
              <span>
                Liên hệ BQT:{' '}
                <span className="underline underline-offset-1">
                  {copied ? 'Đã sao chép email!' : 'bk@sis.hust.edu.vn'}
                </span>
              </span>
              <svg
                width="12"
                height="12"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="inline-block"
              >
                <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
              </svg>
            </button>
          </div>
        </div>
      </main>

      {/* 4. MODAL: Cổng Xác Thực Sinh Viên Đại Học Bách Khoa Hà Nội (HUST ONLY) */}
      {showAuthModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md"
          onClick={() => setShowAuthModal(false)}
        >
          <div
            className="relative w-full max-w-md bg-[#111] border border-white/20 rounded-2xl p-6 sm:p-8 text-white shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close button */}
            <button
              type="button"
              onMouseEnter={handleButtonMouseEnter}
              onClick={() => setShowAuthModal(false)}
              className="absolute top-4 right-4 text-white/60 hover:text-white text-lg bg-transparent border-0 cursor-pointer"
            >
              ✕
            </button>

            <div className="flex items-center gap-2 mb-1.5 flex-wrap">
              <span className="text-xl font-bold tracking-tight">BáchKhoa® Portal</span>
              <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-red-600/30 border border-red-500/40 text-red-200 font-medium">
                Chỉ dành cho SV Bách Khoa (HUST)
              </span>
            </div>
            <p className="text-xs text-white/60 mb-4">
              Hệ thống xác thực nội bộ bằng tài khoản email sinh viên Đại học Bách Khoa Hà Nội (@sis.hust.edu.vn).
            </p>

            {/* Modal Tab Switcher */}
            <div className="grid grid-cols-2 gap-1.5 p-1 rounded-xl bg-white/5 border border-white/10 mb-4">
              <button
                type="button"
                onMouseEnter={handleButtonMouseEnter}
                onClick={() => {
                  setAuthTab('LOGIN');
                  setAuthError(null);
                }}
                className={`py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer border-0 ${
                  authTab === 'LOGIN'
                    ? 'bg-white text-black'
                    : 'bg-transparent text-white/70 hover:text-white'
                }`}
              >
                Đăng nhập SV
              </button>
              <button
                type="button"
                onMouseEnter={handleButtonMouseEnter}
                onClick={() => {
                  setAuthTab('REGISTER');
                  setAuthError(null);
                }}
                className={`py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer border-0 ${
                  authTab === 'REGISTER'
                    ? 'bg-white text-black'
                    : 'bg-transparent text-white/70 hover:text-white'
                }`}
              >
                Đăng ký Mail HUST
              </button>
            </div>

            {authError && (
              <div className="mb-4 p-3 rounded-lg bg-red-500/20 border border-red-500/40 text-red-200 text-xs">
                {authError}
              </div>
            )}

            {authTab === 'LOGIN' ? (
              <form onSubmit={handleQuickLogin} className="flex flex-col gap-3">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs text-white/70">Email Sinh viên Bách Khoa</label>
                    <button
                      type="button"
                      onMouseEnter={handleButtonMouseEnter}
                      onClick={() => {
                        setAuthEmail('dat.nt215340@sis.hust.edu.vn');
                        setAuthPassword('Student@123');
                        setAuthError(null);
                      }}
                      className="text-[11px] text-white/80 underline bg-transparent border-0 cursor-pointer p-0 hover:text-white"
                    >
                      Điền nhanh SV mẫu
                    </button>
                  </div>
                  <input
                    type="email"
                    value={authEmail}
                    onChange={(e) => setAuthEmail(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/15 text-white text-sm outline-none focus:border-white transition-colors"
                    placeholder="ten.xxMSSV@sis.hust.edu.vn"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs text-white/70 mb-1">Mật khẩu</label>
                  <input
                    type="password"
                    value={authPassword}
                    onChange={(e) => setAuthPassword(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/15 text-white text-sm outline-none focus:border-white transition-colors"
                    placeholder="••••••••"
                    required
                  />
                </div>

                <button
                  type="submit"
                  disabled={authLoading}
                  onMouseEnter={handleButtonMouseEnter}
                  onMouseMove={handleButtonMouseMove}
                  className="mt-2 w-full py-2.5 rounded-lg bg-white text-black font-semibold text-sm hover:bg-white/90 transition-colors cursor-pointer border-0 disabled:opacity-50"
                >
                  {authLoading ? 'Đang xác thực...' : 'Vào Bảng tin Bách Khoa →'}
                </button>
              </form>
            ) : (
              <form onSubmit={handleRegisterHust} className="flex flex-col gap-2.5">
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-xs text-white/70 mb-1">Họ và tên</label>
                    <input
                      type="text"
                      value={regFullName}
                      onChange={(e) => setRegFullName(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/15 text-white text-xs outline-none focus:border-white"
                      placeholder="Nguyễn Văn A"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-white/70 mb-1">Mã số SV (MSSV)</label>
                    <input
                      type="text"
                      value={regStudentId}
                      onChange={(e) => setRegStudentId(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/15 text-white text-xs outline-none focus:border-white"
                      placeholder="20215340"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs text-white/70 mb-1">
                    Email Bách Khoa (@sis.hust.edu.vn)
                  </label>
                  <input
                    type="email"
                    value={regEmail}
                    onChange={(e) => setRegEmail(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/15 text-white text-xs outline-none focus:border-white"
                    placeholder="a.nv215340@sis.hust.edu.vn"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs text-white/70 mb-1">Trường / Viện đào tạo</label>
                  <select
                    value={regFacultyId}
                    onChange={(e) => setRegFacultyId(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-[#1a1a1a] border border-white/15 text-white text-xs outline-none focus:border-white"
                  >
                    {faculties.length > 0 ? (
                      faculties.map((f) => (
                        <option key={f.id} value={f.id}>
                          {f.name} ({f.code})
                        </option>
                      ))
                    ) : (
                      <>
                        <option value="">Trường CNTT &amp; Truyền thông (SoICT)</option>
                        <option value="">Trường Điện - Điện tử (SEEE)</option>
                        <option value="">Trường Cơ khí (SME)</option>
                        <option value="">Viện Toán ứng dụng &amp; Tin học (SAMI)</option>
                      </>
                    )}
                  </select>
                </div>

                <div>
                  <label className="block text-xs text-white/70 mb-1">Mật khẩu khởi tạo</label>
                  <input
                    type="password"
                    value={regPassword}
                    onChange={(e) => setRegPassword(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/15 text-white text-xs outline-none focus:border-white"
                    placeholder="Tối thiểu 8 ký tự"
                    required
                  />
                </div>

                <button
                  type="submit"
                  disabled={authLoading}
                  onMouseEnter={handleButtonMouseEnter}
                  onMouseMove={handleButtonMouseMove}
                  className="mt-1.5 w-full py-2.5 rounded-lg bg-white text-black font-semibold text-xs hover:bg-white/90 transition-colors cursor-pointer border-0 disabled:opacity-50"
                >
                  {authLoading ? 'Đang gửi mã OTP...' : 'Nhận mã OTP qua Mail Trường →'}
                </button>
              </form>
            )}

            <div className="my-4 flex items-center gap-3 text-[11px] text-white/40">
              <span className="flex-1 h-[1px] bg-white/10" />
              <span>XÁC THỰC NHANH HUST SSO</span>
              <span className="flex-1 h-[1px] bg-white/10" />
            </div>

            <button
              type="button"
              disabled={authLoading}
              onMouseEnter={handleButtonMouseEnter}
              onMouseMove={handleButtonMouseMove}
              onClick={handleHustSso}
              className="w-full py-2.5 px-3.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/15 text-left text-xs flex items-center justify-between transition-colors cursor-pointer text-white"
            >
              <span>🏛️ Đăng nhập Microsoft 365 (@sis.hust.edu.vn)</span>
              <span className="px-2 py-0.5 rounded bg-white/10 text-white/80 text-[10px]">
                1-Click HUST
              </span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
