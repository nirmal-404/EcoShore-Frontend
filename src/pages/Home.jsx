import React from 'react';
import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { ArrowRight, Waves, Shield, BarChart3, Users } from 'lucide-react';

export default function Home() {
  const { user } = useSelector((state) => state.auth);

  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="relative h-[80vh] flex items-center justify-center overflow-hidden bg-gradient-to-br from-primary/10 via-primary/5 to-background">
        <div className="absolute inset-0 z-0">
          <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/10 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-secondary/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }} />
        </div>

        <div className="container relative z-10 mx-auto px-6 text-center">
          <div className="inline-flex items-center px-4 py-2 rounded-full bg-primary/10 text-primary mb-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <Waves className="w-4 h-4 mr-2" />
            <span className="text-sm font-medium">EcoShore: Protecting Our Oceans</span>
          </div>

          <h1 className="text-5xl md:text-7xl font-bold text-foreground mb-6 tracking-tight animate-in fade-in slide-in-from-bottom-6 duration-1000">
            Clean Beaches for <br />
            <span className="text-primary italic">Life Below Water</span>
          </h1>

          <p className="max-w-2xl mx-auto text-xl text-muted-foreground mb-10 animate-in fade-in slide-in-from-bottom-8 duration-1000 transition-all">
            Join the movement to preserve our coastlines. Organize events, track waste analytics,
            and make a measurable impact on plastic pollution.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center animate-in fade-in slide-in-from-bottom-10 duration-1000">
            {!user ? (
              <Link to="/register" className="px-8 py-4 bg-primary text-primary-foreground rounded-full font-semibold hover:bg-primary/90 transition-all transform hover:scale-105 shadow-lg shadow-primary/20 flex items-center">
                Get Started
                <ArrowRight className="ml-2 w-5 h-5" />
              </Link>
            ) : (
              <Link to={user.role === 'admin' ? '/admin' : user.role === 'organizer' ? '/organizer' : '/volunteer'} className="px-8 py-4 bg-primary text-primary-foreground rounded-full font-semibold hover:bg-primary/90 transition-all transform hover:scale-105 shadow-lg shadow-primary/20 flex items-center">
                Go to Dashboard
                <ArrowRight className="ml-2 w-5 h-5" />
              </Link>
            )}
            <Link to="/events" className="px-8 py-4 bg-white border border-border text-foreground rounded-full font-semibold hover:bg-secondary/5 transition-all">
              Explore Events
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 bg-background">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">How it Works</h2>
            <div className="w-12 h-1.5 bg-primary mx-auto rounded-full" />
          </div>

          <div className="grid md:grid-cols-4 gap-8">
            <FeatureCard
              icon={<Users className="w-6 h-6 text-primary" />}
              title="Community Driven"
              description="Volunteers and organizers working together to restore beach ecosystems."
            />
            <FeatureCard
              icon={<Shield className="w-6 h-6 text-primary" />}
              title="Verified Impact"
              description="Official beach agents verify waste collection data for accurate reporting."
            />
            <FeatureCard
              icon={<BarChart3 className="w-6 h-6 text-primary" />}
              title="Waste Analytics"
              description="Real-time insights into plastic pollution trends and event effectiveness."
            />
            <FeatureCard
              icon={<Waves className="w-6 h-6 text-primary" />}
              title="Sustainable Goals"
              description="Aligning with UN SDG 14 to preserve Life Below Water."
            />
          </div>
        </div>
      </section>
    </div>
  );
}

function FeatureCard({ icon, title, description }) {
  return (
    <div className="p-8 rounded-2xl bg-card border border-border hover:border-primary/30 transition-all hover:shadow-xl group">
      <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-6 group-hover:bg-primary group-hover:text-white transition-colors">
        {icon}
      </div>
      <h3 className="text-xl font-bold mb-3">{title}</h3>
      <p className="text-muted-foreground leading-relaxed">{description}</p>
    </div>
  );
}
