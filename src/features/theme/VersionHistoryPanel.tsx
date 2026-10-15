import { X } from "lucide-react";
import type { ThemeVersion } from "../domain/types";
import { formatDateTime } from "../domain/plan";

export function VersionHistoryPanel({
  versions,
  onRestore,
  onClose
}: {
  versions: ThemeVersion[];
  onRestore: (versionId: string) => void;
  onClose: () => void;
}) {
  return (
    <div className="history-panel">
      <div className="history-panel-head">
        <h3>Version history</h3>
        <button className="icon-button" onClick={onClose} aria-label="Close"><X size={18} /></button>
      </div>
      {versions.length === 0 ? (
        <p className="muted">No versions yet. Publish to keep one.</p>
      ) : (
        <ul className="version-list">
          {versions.map((version) => (
            <li key={version.itemId}>
              <div>
                <strong>{formatDateTime(version.publishedOn)}</strong>
                <span className="muted">{version.summary}</span>
                {version.publishedBy ? <small className="muted">by {version.publishedBy}</small> : null}
              </div>
              <button className="icon-button" onClick={() => onRestore(version.itemId)}>Restore</button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
