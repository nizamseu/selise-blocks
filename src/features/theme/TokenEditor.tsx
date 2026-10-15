import type { CornerRoundness, HeadingSize, StartingLook, ThemeConfig } from "../domain/types";
import { STARTING_LOOKS } from "./theme";

const HEADING_OPTIONS: HeadingSize[] = ["Compact", "Regular", "Large"];
const ROUNDNESS_OPTIONS: CornerRoundness[] = ["Square", "Soft", "Round"];

export function TokenEditor({ config, onChange }: { config: ThemeConfig; onChange: (config: ThemeConfig) => void }) {
  function pickLook(look: StartingLook) {
    const preset = STARTING_LOOKS.find((entry) => entry.value === look);
    if (!preset) return;
    onChange({ ...config, accent: preset.accent, startingLook: look, surface: preset.surface, text: preset.text });
  }

  return (
    <div className="token-editor">
      <div className="token-group">
        <span className="token-label">Starting look</span>
        <div className="look-grid compact">
          {STARTING_LOOKS.map((look) => (
            <button
              key={look.value}
              className={`look-card ${config.startingLook === look.value ? "selected" : ""}`}
              onClick={() => pickLook(look.value)}
            >
              <span className="look-swatches">
                <span style={{ background: look.accent }} />
                <span style={{ background: look.surface }} />
                <span style={{ background: look.text }} />
              </span>
              <strong>{look.value}</strong>
            </button>
          ))}
        </div>
      </div>

      <div className="token-group">
        <span className="token-label">Colours</span>
        <ColorRow label="Accent" value={config.accent} onChange={(accent) => onChange({ ...config, accent })} />
        <ColorRow label="Surface" value={config.surface} onChange={(surface) => onChange({ ...config, surface })} />
        <ColorRow label="Text" value={config.text} onChange={(text) => onChange({ ...config, text })} />
      </div>

      <div className="token-group">
        <span className="token-label">Heading size</span>
        <div className="chip-row">
          {HEADING_OPTIONS.map((option) => (
            <button
              key={option}
              className={`chip-button ${config.headingSize === option ? "selected" : ""}`}
              onClick={() => onChange({ ...config, headingSize: option })}
            >
              {option}
            </button>
          ))}
        </div>
      </div>

      <div className="token-group">
        <span className="token-label">Corner roundness</span>
        <div className="chip-row">
          {ROUNDNESS_OPTIONS.map((option) => (
            <button
              key={option}
              className={`chip-button ${config.cornerRoundness === option ? "selected" : ""}`}
              onClick={() => onChange({ ...config, cornerRoundness: option })}
            >
              {option}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

function ColorRow({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) {
  return (
    <label className="color-row">
      <span>{label}</span>
      <input type="color" value={value} onChange={(event) => onChange(event.target.value)} />
      <input type="text" value={value} onChange={(event) => onChange(event.target.value)} />
    </label>
  );
}
