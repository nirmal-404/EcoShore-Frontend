import React from 'react';
import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { ArrowRight, Waves, Shield, BarChart3, Users } from 'lucide-react';

export default function Home() {
  const { user } = useSelector((state) => state.auth);
  const [stopScroll, setStopScroll] = React.useState(false);

  const howItWorksData = [
    {
      title: 'Community Driven',
      description:
        'Volunteers and organizers working together to restore beach ecosystems.',
      icon: Users,
    },
    {
      title: 'Verified Impact',
      description:
        'Official beach agents verify waste collection data for accurate reporting.',
      icon: Shield,
    },
    {
      title: 'Waste Analytics',
      description:
        'Real-time insights into plastic pollution trends and event effectiveness.',
      icon: BarChart3,
    },
    {
      title: 'Sustainable Goals',
      description: 'Aligning with UN SDG 14 to preserve Life Below Water.',
      icon: Waves,
    },
  ];

  const cardData = [
    {
      title: 'Join Coastal Cleanup Missions',
      image:
        'https://images.unsplash.com/photo-1473116763249-2faaef81ccda?w=1200&auto=format&fit=crop&q=60',
    },
    {
      title: 'Protect Marine Life Together',
      image:
        'https://images.unsplash.com/photo-1527489377706-5bf97e608852?w=1200&auto=format&fit=crop&q=60',
    },
    {
      title: 'Measure Waste Impact with Data',
      image:
        'https://images.unsplash.com/photo-1484291470158-b8f8d608850d?w=1200&auto=format&fit=crop&q=60',
    },
    {
      title: 'Lead Community Ocean Action',
      image:
        'https://images.unsplash.com/photo-1519904981063-b0cf448d479e?w=1200&auto=format&fit=crop&q=60',
    },
  ];

  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-sky-50 via-background to-cyan-50 py-16 sm:py-20 lg:py-24 dark:from-[#062241] dark:via-[#0a1a3f] dark:to-[#06304f]">
        <style>{`
          @keyframes ecoMarqueeScroll {
            0% {
              transform: translateX(0%);
            }

            100% {
              transform: translateX(-50%);
            }
          }
        `}</style>

        <div className="pointer-events-none absolute inset-0 z-0">
          <div className="absolute -top-24 left-0 h-80 w-80 rounded-full bg-cyan-400/20 blur-3xl dark:bg-cyan-400/15" />
          <div className="absolute bottom-0 right-0 h-72 w-72 rounded-full bg-emerald-400/15 blur-3xl dark:bg-emerald-400/10" />
        </div>

        <div className="container relative z-10 mx-auto px-6 text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-cyan-500/30 bg-cyan-500/10 px-4 py-2 text-cyan-700 dark:text-cyan-300">
            <Waves className="h-4 w-4" />
            <span className="text-sm font-semibold">
              EcoShore: Protecting Our Oceans
            </span>
          </div>

          <h1 className="mt-8 text-4xl font-extrabold tracking-tight text-slate-900 sm:text-5xl lg:text-7xl dark:text-white">
            Clean Beaches for <br />
            <span className="text-cyan-400 italic">Life Below Water</span>
          </h1>

          <p className="mx-auto mt-6 max-w-3xl text-base text-slate-600 sm:text-lg dark:text-slate-300">
            Join the movement to preserve our coastlines. Organize events, track
            waste analytics, and make a measurable impact on plastic pollution.
          </p>

          <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
            {!user ? (
              <Link
                to="/register"
                className="inline-flex items-center rounded-full bg-cyan-500 px-8 py-3 font-semibold text-slate-950 shadow-lg shadow-cyan-500/30 transition-all hover:bg-cyan-400"
              >
                Get Started
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            ) : (
              <Link
                to={
                  user.role === 'admin'
                    ? '/admin'
                    : user.role === 'organizer'
                      ? '/organizer'
                      : user.role === 'agent'
                        ? '/agent'
                        : user.role === 'collector'
                          ? '/collector'
                          : '/volunteer'
                }
                className="inline-flex items-center rounded-full bg-cyan-500 px-8 py-3 font-semibold text-slate-950 shadow-lg shadow-cyan-500/30 transition-all hover:bg-cyan-400"
              >
                Go to Dashboard
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            )}

            <Link
              to="/events"
              className="inline-flex items-center rounded-full border border-border bg-white/90 px-8 py-3 font-semibold text-foreground backdrop-blur-sm transition-all hover:bg-white dark:border-white/30 dark:bg-white/10 dark:text-white dark:hover:bg-white/20"
            >
              Explore Events
            </Link>
          </div>
        </div>

        <div
          className="relative z-10 mx-auto mt-14 w-full max-w-6xl overflow-hidden px-4 sm:px-6"
          onMouseEnter={() => setStopScroll(true)}
          onMouseLeave={() => setStopScroll(false)}
        >
          <div className="pointer-events-none absolute left-0 top-0 z-10 h-full w-14 bg-gradient-to-r from-background to-transparent sm:w-28 dark:from-[#0a1f43]" />

          <div
            className="flex w-max"
            style={{
              animationName: 'ecoMarqueeScroll',
              animationTimingFunction: 'linear',
              animationIterationCount: 'infinite',
              animationDuration: `${cardData.length * 2800}ms`,
              animationPlayState: stopScroll ? 'paused' : 'running',
            }}
          >
            {[...cardData, ...cardData].map((card, index) => (
              <article
                key={`${card.title}-${index}`}
                className="group relative mx-3 h-[19rem] w-52 shrink-0 overflow-hidden rounded-2xl border border-border/70 bg-card/80 transition-all duration-300 hover:scale-[0.97] dark:border-white/15 dark:bg-white/5 sm:w-56"
              >
                <img
                  src={card.image}
                  alt={card.title}
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                />

                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/85 via-slate-900/15 to-transparent" />

                <div className="absolute inset-0 flex items-end p-4">
                  <p className="text-left text-sm font-semibold leading-snug text-white sm:text-base">
                    {card.title}
                  </p>
                </div>
              </article>
            ))}
          </div>

          <div className="pointer-events-none absolute right-0 top-0 z-10 h-full w-14 bg-gradient-to-l from-background to-transparent sm:w-28 dark:from-[#0a1f43]" />
        </div>
      </section>

      {/* Features Section */}
      <section className="bg-background py-20 sm:py-24">
        <style>{`
          @import url('https://fonts.googleapis.com/css2?family=Poppins:ital,wght@0,100;0,200;0,300;0,400;0,500;0,600;0,700;0,800;0,900;1,100;1,200;1,300;1,400;1,500;1,600;1,700;1,800;1,900&display=swap');

          .home-how-it-works,
          .home-how-it-works * {
            font-family: 'Poppins', sans-serif;
          }
        `}</style>

        <div className="container mx-auto px-6">
          <div className="home-how-it-works flex flex-col items-center justify-center gap-10 md:flex-row max-md:px-0">
            <div className="relative shrink-0 overflow-hidden rounded-2xl shadow-2xl shadow-primary/35">
              <img
                className="w-full max-w-md rounded-2xl object-cover"
                src="https://images.unsplash.com/photo-1519046904884-53103b34b206?q=80&w=900&h=900&auto=format&fit=crop"
                alt="EcoShore impact preview"
              />

              <div className="absolute left-1/2 top-1/2 flex size-16 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border-2 border-white backdrop-blur gap-1">
                <svg
                  width="15"
                  height="18"
                  viewBox="0 0 15 18"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M1.027 3.371c0-1.374 1.512-2.213 2.678-1.484l9.11 5.693a1.75 1.75 0 0 1 0 2.969l-9.11 5.693c-1.166.729-2.678-.11-2.678-1.484z"
                    fill="#fff"
                    stroke="#fff"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
            </div>

            <div className="max-w-lg text-sm text-slate-600 dark:text-slate-300">
              <h2 className="text-xl font-semibold uppercase text-slate-700 dark:text-slate-100">
                How it Works
              </h2>

              <div className="h-[3px] w-24 rounded-full bg-gradient-to-r from-primary to-primary/25" />

              <p className="mt-8 leading-relaxed">
                EcoShore helps communities build cleaner coastlines through
                collaboration, verification, and measurable impact.
              </p>

              <div className="mt-5 space-y-3">
                {howItWorksData.map((item) => (
                  <div
                    key={item.title}
                    className="rounded-xl border border-border/70 bg-card/75 p-3.5 backdrop-blur-sm dark:bg-card/35"
                  >
                    <div className="flex items-start gap-3">
                      <div className="rounded-lg bg-primary/10 p-2 text-primary">
                        <item.icon className="h-4 w-4" />
                      </div>

                      <div>
                        <h3 className="text-sm font-semibold text-foreground">
                          {item.title}
                        </h3>
                        <p className="mt-1 text-sm text-muted-foreground">
                          {item.description}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <Link
                to="/events"
                className="mt-8 flex w-max items-center gap-2 rounded-full bg-gradient-to-r from-primary to-secondary px-8 py-3 text-white transition hover:-translate-y-0.5"
              >
                <span>Read more</span>
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
