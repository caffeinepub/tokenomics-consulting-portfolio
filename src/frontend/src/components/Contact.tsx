import React from 'react';
import { Mail, Send } from 'lucide-react';
import { SiX } from 'react-icons/si';

export default function Contact() {
  return (
    <section id="contact" className="py-24 bg-navy-950 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[600px] rounded-full bg-teal-500/5 blur-3xl" />
        <div className="absolute bottom-0 right-0 w-[400px] h-[400px] rounded-full bg-gold-400/5 blur-3xl" />
      </div>

      <div className="container mx-auto px-6 relative z-10">
        {/* Section header */}
        <div className="text-center mb-16">
          <span className="inline-block px-4 py-1.5 rounded-full bg-teal-500/10 border border-teal-500/20 text-teal-400 text-sm font-medium mb-4">
            Get In Touch
          </span>
          <h2 className="text-4xl md:text-5xl font-display font-bold text-white mb-4">
            Let's Build Together
          </h2>
          <p className="text-lg text-white/60 max-w-2xl mx-auto">
            Ready to design your token economy? Reach out to discuss your project and how we can create a sustainable tokenomics model.
          </p>
        </div>

        {/* Contact cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
          {/* Email */}
          <a
            href="mailto:alphareporters.co@gmail.com"
            className="group flex flex-col items-center gap-4 p-8 rounded-2xl bg-white/5 border border-white/10 hover:border-teal-500/40 hover:bg-teal-500/5 transition-all duration-300"
          >
            <div className="w-14 h-14 rounded-xl bg-teal-500/10 border border-teal-500/20 flex items-center justify-center group-hover:bg-teal-500/20 transition-colors">
              <Mail className="w-6 h-6 text-teal-400" />
            </div>
            <div className="text-center">
              <p className="text-white/50 text-xs uppercase tracking-widest mb-1">Email</p>
              <p className="text-white font-medium text-sm break-all">alphareporters.co@gmail.com</p>
            </div>
          </a>

          {/* X / Twitter */}
          <a
            href="https://x.com/Icpspace"
            target="_blank"
            rel="noopener noreferrer"
            className="group flex flex-col items-center gap-4 p-8 rounded-2xl bg-white/5 border border-white/10 hover:border-gold-400/40 hover:bg-gold-400/5 transition-all duration-300"
          >
            <div className="w-14 h-14 rounded-xl bg-gold-400/10 border border-gold-400/20 flex items-center justify-center group-hover:bg-gold-400/20 transition-colors">
              <SiX className="w-6 h-6 text-gold-400" />
            </div>
            <div className="text-center">
              <p className="text-white/50 text-xs uppercase tracking-widest mb-1">X / Twitter</p>
              <p className="text-white font-medium">@Icpspace</p>
            </div>
          </a>

          {/* Telegram */}
          <a
            href="https://t.me/Icpspaces"
            target="_blank"
            rel="noopener noreferrer"
            className="group flex flex-col items-center gap-4 p-8 rounded-2xl bg-white/5 border border-white/10 hover:border-teal-500/40 hover:bg-teal-500/5 transition-all duration-300"
          >
            <div className="w-14 h-14 rounded-xl bg-teal-500/10 border border-teal-500/20 flex items-center justify-center group-hover:bg-teal-500/20 transition-colors">
              <Send className="w-6 h-6 text-teal-400" />
            </div>
            <div className="text-center">
              <p className="text-white/50 text-xs uppercase tracking-widest mb-1">Telegram</p>
              <p className="text-white font-medium">Icpspaces</p>
            </div>
          </a>
        </div>

        {/* CTA */}
        <div className="mt-16 text-center">
          <p className="text-white/40 text-sm">
            Prefer a direct conversation? All channels are monitored daily.
          </p>
        </div>
      </div>
    </section>
  );
}
