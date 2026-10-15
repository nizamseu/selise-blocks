import { Plus, Trash2 } from "lucide-react";
import type { VariantDraft } from "./catalogApi";
import { emptyVariant } from "./catalogApi";

export function VariantEditor({
  variants,
  onChange
}: {
  variants: VariantDraft[];
  onChange: (variants: VariantDraft[]) => void;
}) {
  function update(index: number, patch: Partial<VariantDraft>) {
    onChange(variants.map((variant, position) => (position === index ? { ...variant, ...patch } : variant)));
  }

  function updateOption(index: number, optionIndex: number, field: "label" | "value", value: string) {
    const variant = variants[index];
    if (!variant) return;
    const options = variant.options.map((option, position) =>
      position === optionIndex ? { ...option, [field]: value } : option
    );
    update(index, { options });
  }

  return (
    <div className="variant-editor">
      {variants.map((variant, index) => (
        <div className="variant-card" key={index}>
          <div className="variant-head">
            <strong>Variant {index + 1}</strong>
            {variants.length > 1 ? (
              <button type="button" className="icon-button" title="Remove variant" onClick={() => onChange(variants.filter((_, position) => position !== index))}>
                <Trash2 size={16} />
              </button>
            ) : null}
          </div>
          <div className="variant-options">
            {variant.options.map((option, optionIndex) => (
              <div className="option-pair" key={optionIndex}>
                <input
                  placeholder="Option"
                  value={option.label}
                  onChange={(event) => updateOption(index, optionIndex, "label", event.target.value)}
                />
                <input
                  placeholder="Value"
                  value={option.value}
                  onChange={(event) => updateOption(index, optionIndex, "value", event.target.value)}
                />
                {variant.options.length > 1 ? (
                  <button
                    type="button"
                    className="icon-button"
                    title="Remove option"
                    onClick={() => update(index, { options: variant.options.filter((_, position) => position !== optionIndex) })}
                  >
                    <Trash2 size={14} />
                  </button>
                ) : null}
              </div>
            ))}
            <button
              type="button"
              className="link-button"
              onClick={() => update(index, { options: [...variant.options, { label: "", value: "" }] })}
            >
              <Plus size={14} /> Add option
            </button>
          </div>
          <div className="variant-numbers">
            <label className="form-field">
              <span>Price</span>
              <input
                type="number"
                min="0"
                step="0.01"
                value={variant.price}
                onChange={(event) => update(index, { price: event.target.value })}
                placeholder="49"
              />
            </label>
            <label className="form-field">
              <span>Stock</span>
              <input
                type="number"
                min="0"
                step="1"
                value={variant.stock}
                onChange={(event) => update(index, { stock: event.target.value })}
                placeholder="12"
              />
            </label>
          </div>
        </div>
      ))}
      <button type="button" className="icon-button" onClick={() => onChange([...variants, emptyVariant()])}>
        <Plus size={16} /> Add variant
      </button>
    </div>
  );
}
