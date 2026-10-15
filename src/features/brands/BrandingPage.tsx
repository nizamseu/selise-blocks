import { useState } from "react";
import { Globe, Save } from "lucide-react";
import { useBrand } from "../domain/BrandProvider";
import { PAID_PLAN_EXTRAS } from "../domain/plan";
import { brandNameTaken, updateBrand } from "./brandsApi";
import { blocksClient } from "../../lib/blocks/client";
import { Alert } from "../../shared/ui/Alert";
import { FormField } from "../../shared/ui/FormField";
import { SelectField } from "../../shared/ui/Select";
import { StatusPill } from "../../shared/ui/StatusPill";

export function BrandingPage() {
  const { activeBrand, isOwner, brands, refetch } = useBrand();
  const [name, setName] = useState(activeBrand?.name ?? "");
  const [domain, setDomain] = useState(activeBrand?.customDomain ?? "");
  const [domainState, setDomainState] = useState(activeBrand?.domainState ?? "Waiting for DNS");
  const [message, setMessage] = useState<string | undefined>();
  const [error, setError] = useState<string | undefined>();

  if (!activeBrand) return null;
  const brand = activeBrand;

  if (!isOwner) {
    return (
      <section>
        <header className="page-header"><div><h2>Branding</h2><p>Only the brand owner can change the brand's details.</p></div></header>
        <Alert tone="warn">Only the brand owner can change the design.</Alert>
      </section>
    );
  }

  async function markConnected() {
    setDomainState("Connected");
    await updateBrand(brand.itemId, { domainState: "Connected" });
    await blocksClient.mail
      .send({
        bodyDataContext: { brandName: brand.name, domain: domain.trim() },
        subjectDataContext: { brandName: brand.name },
        to: [brand.ownerEmail ?? ""]
      })
      .catch(() => undefined);
    await refetch();
    setMessage("Domain connected. We've emailed the owner.");
  }

  async function save() {
    setError(undefined);
    setMessage(undefined);
    if (!name.trim()) {
      setError("Give your brand a name to save.");
      return;
    }
    if (name.trim() !== brand.name && await brandNameTaken(name.trim(), brand.itemId)) {
      setError("That brand name is taken. Try another.");
      return;
    }
    await updateBrand(brand.itemId, {
      customDomain: domain.trim() || undefined,
      domainState: domain.trim() ? domainState : undefined,
      name: name.trim()
    });
    await refetch();
    setMessage("Saved.");
  }

  async function checkDomain() {
    if (!domain.trim()) {
      setError("Enter a domain first.");
      return;
    }
    // The domain answers or it does not; until it does the state stays
    // "Waiting for DNS". We record the intent and let the platform flip it.
    setDomainState("Waiting for DNS");
    await updateBrand(brand.itemId, { customDomain: domain.trim(), domainState: "Waiting for DNS" });
    await refetch();
    setMessage("We'll watch for this domain. Its state shows Waiting for DNS until it answers.");
  }

  return (
    <section>
      <header className="page-header">
        <div><h2>Branding</h2><p>Your brand's name, its shopfront address and its own domain.</p></div>
        <div className="page-actions">
          <button className="primary-button" onClick={save}><Save size={16} /> Save</button>
        </div>
      </header>

      {error ? <Alert tone="error">{error}</Alert> : null}
      {message ? <Alert tone="info">{message}</Alert> : null}

      <div className="panel">
        <FormField label="Brand name" value={name} onChange={(event) => setName(event.target.value)} />
        <div className="form-field">
          <span>Shopfront address</span>
          <div className="address-row">
            <span className="address-preview">/{activeBrand.slug}</span>
            <span className="muted">Every brand answers on its own subdomain.</span>
          </div>
        </div>
      </div>

      <div className="panel">
        <div className="panel-title"><Globe size={16} /> Custom domain</div>
        <FormField
          label="Domain"
          value={domain}
          onChange={(event) => setDomain(event.target.value)}
          placeholder="brand-a.com"
        />
        <div className="address-row">
          <span className="muted">State</span>
          <StatusPill tone={domainState === "Connected" ? "good" : "warn"}>{domainState}</StatusPill>
        </div>
        <div className="modal-actions">
          <button className="icon-button" onClick={checkDomain}>Save domain</button>
          <button className="icon-button" onClick={markConnected}>Mark connected</button>
        </div>
      </div>

      <div className="panel">
        <div className="panel-title">Plan</div>
        <p className="muted">You're on the free plan. It covers {brands.length > 1 ? "one" : "one brand"}: {brands.length} of 1 brand in use.</p>
        <button
          className="icon-button"
          onClick={() => setError("The free plan covers one brand.")}
        >
          Create another brand
        </button>
        <div className="plan-extras">
          <strong>A paid plan would add</strong>
          <ul>{PAID_PLAN_EXTRAS.map((item) => <li key={item}>{item}</li>)}</ul>
          <p className="muted">No way to pay here yet — this is a preview of what a paid plan would include.</p>
        </div>
      </div>
    </section>
  );
}
