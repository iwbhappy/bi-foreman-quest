import { useRef, useState, type ChangeEvent } from 'react';
import { ru } from '../../i18n/ru';
import { parseResultJSON } from '../../lib/importResult';
import { saveResult } from '../../lib/storage';

export function ImportResult({ onImported }: { onImported: () => void }) {
  const input = useRef<HTMLInputElement>(null);
  const [message, setMessage] = useState('');
  const [error, setError] = useState(false);
  const [busy, setBusy] = useState(false);
  const read = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setBusy(true);
    try {
      const parsed = parseResultJSON(await file.text());
      setError(!parsed.ok);
      if (parsed.ok) {
        saveResult(parsed.record);
        onImported();
        setMessage(ru.dashboard.imported);
      } else setMessage(ru.dashboard.importErrors[parsed.error]);
    } catch {
      setError(true);
      setMessage(ru.dashboard.importErrors.read);
    } finally {
      setBusy(false);
      if (input.current) input.current.value = '';
    }
  };
  return (
    <div className="import-result">
      <input
        ref={input}
        type="file"
        accept=".json,application/json"
        onChange={read}
        hidden
        aria-label={ru.dashboard.import}
      />
      <button className="btn btn-secondary" disabled={busy} onClick={() => input.current?.click()}>
        {busy ? ru.dashboard.importing : ru.dashboard.import}
      </button>
      {message && (
        <p role={error ? 'alert' : 'status'} className={error ? 'import-error' : 'import-success'}>
          {message}
        </p>
      )}
    </div>
  );
}
