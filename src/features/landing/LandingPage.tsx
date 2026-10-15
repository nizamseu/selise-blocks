import { ArrowRight, Boxes, Globe, Palette, Store } from "lucide-react";
import { FREE_PLAN } from "../domain/plan";

export function LandingPage({ onNavigate }: { onNavigate: (path: string) => void }) {
  return (
    <div className="landing">
      <header className="landing-nav">
        <a className="landing-brand" href="/" onClick={(event) => { event.preventDefault(); onNavigate("/"); }}>
          <span className="brand-mark"><Store size={18} /></span>
          <span>Meridian</span>
        </a>
        <nav className="landing-links">
          <a href="#pricing" onClick={(event) => { event.preventDefault(); document.getElementById("pricing")?.scrollIntoView({ behavior: "smooth" }); }}>Pricing</a>
          <a href="#how" onClick={(event) => { event.preventDefault(); document.getElementById("how")?.scrollIntoView({ behavior: "smooth" }); }}>How it works</a>
          <button className="link-button" onClick={() => onNavigate("/login")}>Sign in</button>
          <button className="primary-button" onClick={() => onNavigate("/signup")}>Create a brand</button>
        </nav>
      </header>

      <section className="landing-hero">
        <div className="landing-hero-copy">
          <h1>Give every brand its own shopfront — without running a separate store.</h1>
          <p>
            Meridian hosts many brands under one platform. Each brand gets its own address,
            its own design and its own catalog, quietly kept in order by the people you invite.
          </p>
          <div className="landing-cta">
            <button className="primary-button landing-cta-primary" onClick={() => onNavigate("/signup")}>
              Create a brand <ArrowRight size={18} />
            </button>
            <button className="link-button" onClick={() => onNavigate("/login")}>Sign in</button>
          </div>
          <p className="landing-note">Free to start. No card, ever.</p>
        </div>
        <div className="landing-hero-visual" aria-hidden="true">
          <div className="shot-shot">
            <div className="shot-shot-bar"><span /><span /><span /></div>
            <div className="shop-shot">
              <div className="shop-shot-head">Loom &amp; Thread</div>
              <div className="shop-shot-tiles">
                <span /><span /><span />
                <span /><span /><span />
              </div>
            </div>
          </div>
          <div className="shot-theme">
            <div className="shot-theme-title"><Palette size={14} /> Theme editing</div>
            <div className="shot-swatches">
              <span style={{ background: "#b45309" }} />
              <span style={{ background: "#fffbf5" }} />
              <span style={{ background: "#3f2d1b" }} />
            </div>
            <div className="shot-rows"><span /><span /><span /></div>
          </div>
        </div>
      </section>

      <section className="landing-features" id="how">
        <article className="landing-feature">
          <Globe size={22} />
          <h3>An address of its own</h3>
          <p>Every brand answers on its own subdomain, and on a custom domain when the owner supplies one.</p>
        </article>
        <article className="landing-feature">
          <Palette size={22} />
          <h3>A design of its own</h3>
          <p>Pick a look, three colours, a heading size and corner roundness. Arrange each page from blocks.</p>
        </article>
        <article className="landing-feature">
          <Boxes size={22} />
          <h3>One catalog, kept in order</h3>
          <p>Products, variants, stock and categories — with change history and roles for your staff.</p>
        </article>
      </section>

      <section className="landing-pricing" id="pricing">
        <h2>One free plan, stated up front</h2>
        <div className="landing-plan">
          <div>
            <span className="landing-plan-name">{FREE_PLAN.name}</span>
            <span className="landing-plan-price">{FREE_PLAN.priceLabel}</span>
          </div>
          <ul>
            <li>1 brand</li>
            <li>100 products</li>
            <li>2 staff seats</li>
          </ul>
          <button className="primary-button" onClick={() => onNavigate("/signup")}>Create a brand</button>
        </div>
        <p className="landing-note">Checkout on every shopfront ends at order placed — no payment is taken on this platform.</p>
      </section>

      <footer className="landing-footer">
        <span>© {new Date().getFullYear()} Meridian</span>
        <button className="link-button" onClick={() => onNavigate("/about")}>About</button>
      </footer>
    </div>
  );
}
