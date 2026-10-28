import { useState, type ReactNode } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ErrorBoundary } from '@/components/error-boundary';
import { Toaster } from '@/components/ui/toaster';
import { TooltipProvider } from '@/components/ui/tooltip';
import NotFound from '@/pages/not-found';
import { ContactForm } from '@/components/contact-form';
import { PortfolioGallery } from '@/components/portfolio-gallery';
import { BUSINESS, gallery, services } from '@/data/portfolio';
import { ArrowDown, ArrowUpRight, MapPin, Menu, X } from 'lucide-react';
import {
  Route,
  Switch,
  useLocation,
  Router as WouterRouter,
} from 'wouter';

const queryClient = new QueryClient();

const heroPhoto = gallery.find((p) => p.sourceFile.startsWith('0_'))!;
const aboutPhoto = gallery.find((p) => p.sourceFile.startsWith('9_'))!;

const links = [['Work', '#work'], ['Services', '#services'], ['About', '#about'], ['Contact', '#contact']];

function Home() {
  const [menuOpen, setMenuOpen] = useState(false);
  return (
    <main className="site-shell">
      <header className="site-header" data-testid="site-header">
        <a href="#top" className="brand-lockup" aria-label="Transcendent Gallery home" data-testid="brand-home">
          <img src={BUSINESS.logo} alt="Transcendent Gallery logo" width={554} height={400} className="brand-logo" />
        </a>
        <nav className={`main-nav ${menuOpen ? 'is-open' : ''}`} aria-label="Main navigation">
          {links.map(([label, href]) => <a key={label} href={href} onClick={() => setMenuOpen(false)}>{label}</a>)}
          <a href="#contact" className="nav-cta" onClick={() => setMenuOpen(false)}>Let’s talk <ArrowUpRight size={14} /></a>
        </nav>
        <button className="menu-toggle" type="button" aria-label={menuOpen ? 'Close menu' : 'Open menu'} aria-expanded={menuOpen} onClick={() => setMenuOpen(!menuOpen)} data-testid="mobile-menu-toggle">
          {menuOpen ? <X size={21} /> : <Menu size={21} />}
        </button>
      </header>
      <section className="hero" id="top" aria-labelledby="hero-title">
        <div className="hero-copy">
          <p className="eyebrow hero-kicker reveal">A people-first photography studio</p>
          <h1 id="hero-title" className="font-display reveal reveal-delay-1">For the moments<br />that <em>stay</em> with you.</h1>
          <p className="hero-intro reveal reveal-delay-2">Portraits, family celebrations and everyday Nigerian stories — photographed with pride, warmth and a lot of patience.</p>
          <div className="hero-actions reveal reveal-delay-2">
            <a href="#work" className="button-dark" data-testid="hero-view-work">Explore the work <ArrowDown size={15} /></a>
            <span className="hero-note">Studio · Family · Kids · Events</span>
          </div>
        </div>
        <div className="hero-image-wrap">
          <img src={heroPhoto.image} srcSet={heroPhoto.srcSet} sizes="(max-width: 700px) 92vw, 50vw" width={heroPhoto.width} height={heroPhoto.height} alt={heroPhoto.alt} className="hero-image" loading="eager" fetchPriority="high" />
          <div className="hero-photo-label"><span>01</span><span>Studio session · Real client</span></div>
          <div className="hero-stamp" aria-hidden="true"><span>SEEN<br />WITH<br />FEELING</span></div>
        </div>
        <div className="hero-bottomline"><span>PHOTOGRAPHY WITH FEELING</span><span>{BUSINESS.address}</span><span>SCROLL TO DISCOVER</span></div>
      </section>
      <section className="intro-section" aria-label="Introduction">
        <p className="eyebrow">A note from behind the lens</p>
        <p className="intro-statement font-display">Life doesn’t ask us to pose.<br /><em>Neither do we.</em></p>
        <div className="intro-foot"><span className="intro-rule" /><p>Transcendent Gallery is a people-first photography studio at {BUSINESS.address} We’re here for the real smiles, the quiet glances, and all the beautiful things happening between them.</p><a href="#about" aria-label="Learn about the photographer" className="round-arrow"><ArrowDown size={18} /></a></div>
      </section>
      <section className="work-section section-pad" id="work">
        <div className="section-heading">
          <div><p className="eyebrow">Selected photographs</p><h2 className="font-display">A life, <em>in frames.</em></h2></div>
          <p className="section-aside">Photographs from the studio’s own collection. Tap any frame for a larger view.</p>
        </div>
        <PortfolioGallery />
      </section>
      <section className="services-section section-pad" id="services">
        <div className="services-heading"><p className="eyebrow">What we make together</p><h2 className="font-display">Good photographs<br />begin with <em>good company.</em></h2><p>Come as you are. We’ll take it from there.</p></div>
        <div className="services-list">{services.map((service) => <article className="service-row" key={service.number} data-testid={`service-${service.number}`}><span className="service-number">{service.number}</span><div className="service-main"><h3 className="font-display">{service.title}</h3><p>{service.text}</p></div><div className="service-details">{service.details}</div><a href="#contact" className="service-link" aria-label={`Ask about ${service.title}`}><ArrowUpRight size={18} /></a></article>)}</div>
        <div className="service-bottom"><span>Not sure where your idea fits? Tell us about it.</span><a href="#contact">We’re all ears <ArrowUpRight size={15} /></a></div>
      </section>
      <section className="about-section" id="about">
        <div className="about-image"><img src={aboutPhoto.image} srcSet={aboutPhoto.srcSet} sizes="(max-width: 700px) 100vw, 50vw" width={aboutPhoto.width} height={aboutPhoto.height} alt={aboutPhoto.alt} loading="lazy" /><span className="about-photo-note">A FAMILY SESSION · ILESHA</span></div>
        <div className="about-copy"><p className="eyebrow">The person behind the pictures</p><h2 className="font-display">Hello, I’m<br /><em>your photographer.</em></h2><p className="about-lead">I believe the best photographs don’t ask you to be anyone other than yourself.</p><p>From our first conversation to the final frame, I’ll bring a calm presence, a careful eye and a genuine curiosity about what makes your story yours. Based at {BUSINESS.address.replace(/\.$/, '')}, Transcendent Gallery photographs the people and celebrations of Osun and beyond.</p><a href="#contact" className="text-link">A little more about working together <ArrowUpRight size={16} /></a><div className="signature font-display">With warmth, <em>TG</em></div></div>
      </section>
      <section className="contact-section" id="contact">
        <div className="contact-intro"><p className="eyebrow">The beginning of something</p><h2 className="font-display">Tell me what<br />you’re <em>dreaming up.</em></h2><p>Have a date in mind, an idea taking shape, or just a question? I’d love to hear about it.</p><div className="contact-details"><span className="eyebrow">Find us in</span><p className="address-line" data-testid="text-address-contact"><MapPin size={16} aria-hidden="true" />{BUSINESS.address}</p></div></div>
        <ContactForm />
      </section>
      <footer className="site-footer">
        <a href="#top" className="footer-brand" aria-label="Transcendent Gallery, back to top"><img src={BUSINESS.logo} alt="Transcendent Gallery logo" width={554} height={400} /></a>
        <div className="footer-location"><span className="eyebrow">Made with feeling</span><p data-testid="text-address-footer">{BUSINESS.address}</p></div>
        <div className="footer-links"><span className="eyebrow">Explore</span><a href="#work">Selected work <ArrowUpRight size={13} /></a><a href="#services">Photography services <ArrowUpRight size={13} /></a></div>
        <div className="footer-bottom"><span>© {new Date().getFullYear()} Transcendent Gallery</span><span>PHOTOGRAPHED WITH CARE IN NIGERIA</span><a href="#top">Back to top</a></div>
      </footer>
    </main>
  );
}

function Router() {
  return (
    // Keep a shared shell (sidebar, navbar) outside the boundary so it
    // survives a page crash.
    <RoutedErrorBoundary>
      <Switch>
        <Route path="/" component={Home} />
        <Route component={NotFound} />
      </Switch>
    </RoutedErrorBoundary>
  );
}

function RoutedErrorBoundary({ children }: { children: ReactNode }) {
  const [location] = useLocation();
  return <ErrorBoundary resetKey={location}>{children}</ErrorBoundary>;
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, '')}>
          <Router />
        </WouterRouter>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
