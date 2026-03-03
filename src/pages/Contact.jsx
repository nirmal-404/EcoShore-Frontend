import React from 'react';
import { Send, Mail, Phone, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function ContactPage() {
  return (
    <div className="container mx-auto px-6 py-20 max-w-4xl">
      <div className="text-center mb-16">
        <h1 className="text-4xl font-bold mb-4">Get in Touch</h1>
        <p className="text-muted-foreground text-lg">
          Have questions about an event or want to partner with us? We'd love to
          hear from you.
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-8 mb-16">
        <ContactInfo
          icon={<Mail />}
          title="Email Us"
          detail="hello@ecoshore.org"
        />
        <ContactInfo
          icon={<Phone />}
          title="Call Us"
          detail="+1 (555) OCEAN-EC"
        />
        <ContactInfo
          icon={<MapPin />}
          title="Visit Us"
          detail="Coastal Hub, Marina Bay"
        />
      </div>

      <div className="bg-card border border-border rounded-3xl p-8 md:p-12 shadow-sm">
        <form className="space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-semibold">Full Name</label>
              <input
                className="w-full p-3 rounded-xl border bg-background focus:ring-2 focus:ring-primary/10 outline-none"
                placeholder="Your name"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-semibold">Email Address</label>
              <input
                className="w-full p-3 rounded-xl border bg-background focus:ring-2 focus:ring-primary/10 outline-none"
                placeholder="email@example.com"
              />
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-semibold">Subject</label>
            <input
              className="w-full p-3 rounded-xl border bg-background focus:ring-2 focus:ring-primary/10 outline-none"
              placeholder="How can we help?"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-semibold">Message</label>
            <textarea
              className="w-full p-3 rounded-xl border bg-background focus:ring-2 focus:ring-primary/10 outline-none"
              rows={5}
              placeholder="Tell us more..."
            />
          </div>
          <Button className="w-full h-12 rounded-xl text-lg font-bold shadow-lg shadow-primary/20">
            <Send className="w-5 h-5 mr-2" />
            Send Message
          </Button>
        </form>
      </div>
    </div>
  );
}

function ContactInfo({ icon, title, detail }) {
  return (
    <div className="text-center p-6 rounded-2xl bg-secondary/10 flex flex-col items-center">
      <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center text-primary mb-4 shadow-sm">
        {icon}
      </div>
      <h3 className="font-bold mb-1">{title}</h3>
      <p className="text-sm text-muted-foreground">{detail}</p>
    </div>
  );
}
