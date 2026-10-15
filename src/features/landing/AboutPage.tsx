import { Store } from "lucide-react";
import { FREE_PLAN } from "../domain/plan";

export function AboutPage({ onNavigate }: { onNavigate: (path: string) => void }) {
  return (
    <div className="landing">
      <header className="landing-nav">
        <a className="landing-brand" href="/" onClick={(event) => { event.preventDefault(); onNavigate("/"); }}>
          <span className="brand-mark"><Store size={18} /></span>
          <span>Meridian</span>
        </a>
        <nav className="landing-links">
          <button className="link-button" onClick={() => onNavigate("/")}>Home</button>
          <button className="primary-button" onClick={() => onNavigate("/signup")}>Create a brand</button>
        </nav>
      </header>
      <section className="landing-hero landing-hero-single">
        <div className="landing-hero-copy">
          <h1>One platform, many shopfronts.</h1>
          <p>
            Meridian is built for teams who host more than one brand. Instead of running a separate
            store per brand, each brand lives under one roof with its own address, design and catalog —
            while a platform operator keeps an eye on which brands are live.
          </p>
          <p>
            Shoppers browse one brand at a time and never see another brand's products. Staff only ever
            see the brand they have been given access to. The free plan covers {FREE_PLAN.brands} brand,
            {" "}{FREE_PLAN.products} products and {FREE_PLAN.staffSeats} staff seats.
          </p>
          <div className="landing-cta">
            <button className="primary-button landing-cta-primary" onClick={() => onNavigate("/signup")}>Create a brand</button>
          </div>
        </div>
      </section>
    </div>
  );
}
