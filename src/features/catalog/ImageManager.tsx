import { useRef, useState } from "react";
import { ImagePlus, Trash2, Upload } from "lucide-react";
import { uploadImage } from "./uploadImage";

export function ImageManager({ images, onChange }: { images: string[]; onChange: (images: string[]) => void }) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | undefined>();
  const [manual, setManual] = useState("");

  async function handleFiles(files: FileList | null) {
    if (!files || files.length === 0) return;
    setBusy(true);
    setError(undefined);
    try {
      const uploaded: string[] = [];
      for (const file of Array.from(files)) {
        uploaded.push(await uploadImage(file));
      }
      onChange([...images, ...uploaded]);
    } catch {
      setError("That image could not be uploaded. You can paste an image address instead.");
    } finally {
      setBusy(false);
    }
  }

  function remove(index: number) {
    onChange(images.filter((_, position) => position !== index));
  }

  function addManual() {
    if (!manual.trim()) return;
    onChange([...images, manual.trim()]);
    setManual("");
  }

  return (
    <div className="image-manager">
      <div className="image-grid">
        {images.map((image, index) => (
          <figure key={`${image}-${index}`} className="image-tile">
            <img src={image} alt="" />
            {index === 0 ? <figcaption>Tile image</figcaption> : null}
            <button type="button" className="image-remove" onClick={() => remove(index)} title="Remove"><Trash2 size={14} /></button>
          </figure>
        ))}
        <button type="button" className="image-add" onClick={() => inputRef.current?.click()} disabled={busy}>
          {busy ? <Upload size={18} /> : <ImagePlus size={18} />}
          <span>{busy ? "Uploading…" : "Add image"}</span>
        </button>
      </div>
      <input ref={inputRef} type="file" accept="image/*" multiple hidden onChange={(event) => handleFiles(event.target.files)} />
      <div className="image-manual">
        <input
          placeholder="Or paste an image address"
          value={manual}
          onChange={(event) => setManual(event.target.value)}
        />
        <button type="button" className="icon-button" onClick={addManual}>Add</button>
      </div>
      {error ? <p className="field-error">{error}</p> : null}
    </div>
  );
}
