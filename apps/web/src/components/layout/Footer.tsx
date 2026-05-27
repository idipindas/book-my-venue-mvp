import { Link } from 'react-router-dom';
import { MapPin, Mail, Phone, Instagram, Twitter } from 'lucide-react';

export function Footer() {
  return (
    <footer className="bg-navy text-white/70">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-14">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <MapPin size={16} className="text-white" />
              </div>
              <span className="font-display text-xl font-semibold text-white">BookMyVenue</span>
            </div>
            <p className="text-sm leading-relaxed text-white/60 max-w-xs">
              Kerala's premier platform for discovering and booking unique event spaces — from
              backwater resorts to modern convention centres.
            </p>
            <div className="flex gap-3 mt-5">
              {[Instagram, Twitter].map((Icon, i) => (
                <a key={i} href="#" className="w-9 h-9 bg-white/10 rounded-lg flex items-center justify-center hover:bg-primary/40 transition-colors">
                  <Icon size={16} />
                </a>
              ))}
            </div>
          </div>

          {/* Quick links */}
          <div>
            <h4 className="text-sm font-semibold text-white mb-4 uppercase tracking-wider">Explore</h4>
            <ul className="space-y-2.5 text-sm">
              {[
                { to: '/venues', label: 'All Venues' },
                { to: '/venues?type=birthday_hall', label: 'Birthday Halls' },
                { to: '/venues?type=resort', label: 'Resorts' },
                { to: '/venues?type=auditorium', label: 'Auditoriums' },
                { to: '/venues?type=meetup', label: 'Meetup Spaces' },
                { to: '/auth/register?role=OWNER', label: 'List Your Venue' },
              ].map((link) => (
                <li key={link.to}>
                  <Link to={link.to} className="hover:text-white transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-sm font-semibold text-white mb-4 uppercase tracking-wider">Contact</h4>
            <ul className="space-y-3 text-sm">
              <li className="flex items-center gap-2">
                <Mail size={14} className="text-primary shrink-0" />
                hello@bookmyvenue.in
              </li>
              <li className="flex items-center gap-2">
                <Phone size={14} className="text-primary shrink-0" />
                +91 98765 43210
              </li>
              <li className="flex items-start gap-2">
                <MapPin size={14} className="text-primary shrink-0 mt-0.5" />
                Infopark, Kochi, Kerala — 682042
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-white/10 mt-10 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-white/40">
          <p>© {new Date().getFullYear()} BookMyVenue. A WeCode Community Project.</p>
          <div className="flex gap-4">
            <a href="#" className="hover:text-white transition-colors">Privacy</a>
            <a href="#" className="hover:text-white transition-colors">Terms</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
