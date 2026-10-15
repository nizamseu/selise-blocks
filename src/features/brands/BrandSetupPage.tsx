import { useState } from "react";
import { Sparkles, Store } from "lucide-react";
import { useCurrentUser } from "../profile/useCurrentUser";
import { useBrand } from "../domain/BrandProvider";
import { STARTING_LOOKS } from "../theme/theme";
import { FREE_PLAN, PAID_PLAN_EXTRAS } from "../domain/plan";
import { brandNameTaken, createBrand } from "./brandsApi";
import { Alert } from "../../shared/ui/Alert";
import { FormField } from "../../shared/ui/FormField";
import { LoadingScreen } from "../../shared/ui/LoadingScreen";

const TAKEN_MESSAGE = "That brand name is taken. Try another.";

export function BrandSetupPage({ onNavigate }: { onNavigate: (path: string) => void }) {
  const me = useCurrentUser();
  const { refetch, brands } = useBrand();
  const [name, setName] = useState("");
  const [look, setLook] = useState("Editorial");
  const [error, setError] = useState<string | undefined>();
  const [pending, setPending] = useState(false);

  const owner = me.data?.data;

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError(undefined);
    const trimmed = name.trim();
    if (!trimmed) {
      setError("Give your brand a name to continue.");
      return;
    }
    if (!owner) {
      setError("Your account is still loading. Try again in a moment.");
      return;
    }
    setPending(true);
    try {
      if (await brandNameTaken(trimmed)) {
        setError(TAKEN_MESSAGE);
        setPending(false);
        return;
      }
      await createBrand({ name: trimmed, owner, startingLook: look });
      await refetch();
      onNavigate("/app");
    } catch (caught) {
      setError((caught as Error).message || "The brand could not be created. Try again.");
      setPending(false);
    }
  }

  if (me.isLoading) return <LoadingScreen />;

  if (brands.length >= FREE_PLAN.brands) {
    return (
      <section className="setup-page">
        <div className="setup-card">
          <div className="setup-head">
            <span className="brand-mark"><Store size={18} /></span>
            <h2>The free plan covers one brand.</h2>
            <p>You already run {brands.length} brand{brands.length === 1 ? "" : "s"} on the free plan.</p>
          </div>
          <div className="plan-extras">
            <strong>A paid plan would add</strong>
            <ul>{PAID_PLAN_EXTRAS.map((item) => <li key={item}>{item}</li>)}</ul>
            <p className="muted">No way to pay here yet — this is a preview of what a paid plan would include.</p>
          </div>
          <button className="icon-button" onClick={() => onNavigate("/app")}>Back to dashboard</button>
        </div>
      </section>
    );
  }

  return (
    <section className="setup-page">
      <div className="setup-card">
        <div className="setup-head">
          <span className="brand-mark"><Store size={18} /></span>
          <h2>Name your brand</h2>
          <p>Name your brand and pick a starting look — you can change both later.</p>
        </div>
        {error ? <Alert tone="error">{error}</Alert> : null}
        <form onSubmit={handleSubmit} className="auth-form">
          <FormField
            label="Brand name"
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder="Loom & Thread"
          />
          <div className="look-picker">
            <span className="form-field-label">Starting look</span>
            <div className="look-grid">
              {STARTING_LOOKS.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  className={`look-card ${look === option.value ? "selected" : ""}`}
                  onClick={() => setLook(option.value)}
                >
                  <span className="look-swatches">
                    <span style={{ background: option.accent }} />
                    <span style={{ background: option.surface }} />
                    <span style={{ background: option.text }} />
                  </span>
                  <strong>{option.value}</strong>
                </button>
              ))}
            </div>
          </div>
          <button className="primary-button auth-submit" type="submit" disabled={pending}>
            <Sparkles size={18} /> {pending ? "Creating your brand..." : "Create brand"}
          </button>
        </form>
      </div>
    </section>
  );
}
