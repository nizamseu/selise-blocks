import { ArrowDown, ArrowUp, Eye, EyeOff, Trash2 } from "lucide-react";
import type { BlockKind, PageType, ThemeBlock, ThemeConfig } from "../domain/types";
import { LAYOUT_PRESETS, block as makeBlock } from "./theme";

const BLOCK_KINDS: BlockKind[] = ["Banner", "Product grid", "Category strip", "Text"];
const PRODUCT_KINDS: BlockKind[] = ["Price", "Variant picker", "Add to cart", "Description"];

export function BlockEditor({
  config,
  page,
  onChange
}: {
  config: ThemeConfig;
  page: PageType;
  onChange: (config: ThemeConfig) => void;
}) {
  const blocks = config.layouts[page];
  const available = page === "Product" ? PRODUCT_KINDS : BLOCK_KINDS;

  function setBlocks(next: ThemeBlock[]) {
    onChange({ ...config, layouts: { ...config.layouts, [page]: next } });
  }

  function update(index: number, patch: Partial<ThemeBlock>) {
    setBlocks(blocks.map((entry, position) => (position === index ? { ...entry, ...patch } : entry)));
  }

  function move(index: number, direction: -1 | 1) {
    const target = index + direction;
    if (target < 0 || target >= blocks.length) return;
    const next = [...blocks];
    [next[index], next[target]] = [next[target]!, next[index]!];
    setBlocks(next);
  }

  const presets = LAYOUT_PRESETS.filter((preset) => preset.page === page);

  return (
    <div className="block-editor">
      <div className="preset-row">
        <span className="token-label">Start from a preset</span>
        <div className="chip-row">
          {presets.map((preset) => (
            <button key={preset.name} className="chip-button" title={preset.description} onClick={() => setBlocks(preset.blocks())}>
              {preset.name}
            </button>
          ))}
        </div>
      </div>

      <ul className="block-list">
        {blocks.map((entry, index) => (
          <li key={entry.id} className={`block-item ${entry.shown ? "" : "hidden"}`}>
            <div className="block-item-head">
              <strong>{entry.kind}</strong>
              <div className="row-actions">
                <button className="icon-button" title={entry.shown ? "Hide" : "Show"} onClick={() => update(index, { shown: !entry.shown })}>
                  {entry.shown ? <Eye size={16} /> : <EyeOff size={16} />}
                </button>
                <button className="icon-button" title="Move up" disabled={index === 0} onClick={() => move(index, -1)}><ArrowUp size={16} /></button>
                <button className="icon-button" title="Move down" disabled={index === blocks.length - 1} onClick={() => move(index, 1)}><ArrowDown size={16} /></button>
                <button className="icon-button" title="Remove" onClick={() => setBlocks(blocks.filter((_, position) => position !== index))}><Trash2 size={16} /></button>
              </div>
            </div>
            {entry.kind === "Banner" || entry.kind === "Text" || entry.kind === "Product grid" ? (
              <input
                className="block-input"
                placeholder="Heading"
                value={entry.heading ?? ""}
                onChange={(event) => update(index, { heading: event.target.value })}
              />
            ) : null}
            {entry.kind === "Product grid" ? (
              <div className="block-numbers">
                <label>How many <input type="number" min="1" max="50" value={entry.count ?? 8} onChange={(event) => update(index, { count: Number(event.target.value) })} /></label>
                <label>Columns
                  <select value={entry.columns ?? 3} onChange={(event) => update(index, { columns: Number(event.target.value) as 2 | 3 | 4 })}>
                    <option value={2}>2</option><option value={3}>3</option><option value={4}>4</option>
                  </select>
                </label>
              </div>
            ) : null}
          </li>
        ))}
      </ul>

      <div className="chip-row">
        {available.map((kind) => (
          <button key={kind} className="chip-button" onClick={() => setBlocks([...blocks, makeBlock(kind)])}>
            + {kind}
          </button>
        ))}
      </div>
    </div>
  );
}
