import cdblLogo from "@/assets/cdbl-logo.png";
import { Mail, Phone, MapPin } from "lucide-react";

const Footer = () => {
  return (
    <footer id="contact" className="bg-foreground text-background py-12">
      <div className="container">
        <div className="grid md:grid-cols-4 gap-8 mb-8">
          <div className="md:col-span-2">
            <img 
              src={cdblLogo} 
              alt="CDBL Logo" 
              className="h-16 w-auto mb-4 brightness-0 invert"
            />
            <p className="text-sm opacity-80 mb-4">
              Central District Baseball League - Burlington, IL
            </p>
            <p className="text-sm opacity-80">
              For 38 years, CDBL has been dedicated to fostering the love of baseball in our community.
            </p>
          </div>

          <div>
            <h4 className="font-bold mb-4">Quick Links</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <a href="#about" className="opacity-80 hover:opacity-100 transition-opacity">
                  About CDBL
                </a>
              </li>
              <li>
                <a href="#registration" className="opacity-80 hover:opacity-100 transition-opacity">
                  Registration
                </a>
              </li>
              <li>
                <a href="#spirit-wear" className="opacity-80 hover:opacity-100 transition-opacity">
                  Spirit Wear
                </a>
              </li>
              <li>
                <a href="#umpires" className="opacity-80 hover:opacity-100 transition-opacity">
                  Youth Umpires
                </a>
              </li>
              <li>
                <a href="#sponsors" className="opacity-80 hover:opacity-100 transition-opacity">
                  Sponsors
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold mb-4">Connect With Us</h4>
            <ul className="space-y-3 text-sm">
              <li className="flex items-start gap-2">
                <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0" />
                <span className="opacity-80">Burlington, IL</span>
              </li>
              <li className="flex items-start gap-2">
                <Mail className="w-4 h-4 mt-0.5 flex-shrink-0" />
                <a href="mailto:info@cdbl.org" className="opacity-80 hover:opacity-100 transition-opacity">
                  info@cdbl.org
                </a>
              </li>
              <li className="flex items-start gap-2">
                <Phone className="w-4 h-4 mt-0.5 flex-shrink-0" />
                <span className="opacity-80">Contact via registration portal</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-white/10 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-sm opacity-80">
            <p>
              © {new Date().getFullYear()} Central District Baseball League. All rights reserved.
            </p>
            <div className="flex gap-6">
              <a 
                href="https://leagues.bluesombrero.com/Default.aspx?tabid=2121019" 
                target="_blank"
                rel="noopener noreferrer"
                className="hover:opacity-100 transition-opacity"
              >
                Sports Connect Portal
              </a>
              <a 
                href="https://strawberrycreekcreations.com/collections/cdbl_spiritwear" 
                target="_blank"
                rel="noopener noreferrer"
                className="hover:opacity-100 transition-opacity"
              >
                Spirit Wear Store
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
