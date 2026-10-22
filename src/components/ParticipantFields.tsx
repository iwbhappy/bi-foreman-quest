import { ru } from '../i18n/ru';
import type { Participant } from '../lib/types';

export function ParticipantFields({ participant }: { participant?: Participant }) {
  return (
    <>
      <label className="field">
        <span>{ru.name}</span>
        <input
          name="name"
          aria-label={ru.name}
          autoComplete="given-name"
          maxLength={100}
          placeholder={ru.namePlaceholder}
          defaultValue={participant?.name}
        />
      </label>
      <label className="field">
        <span>{ru.position}</span>
        <select name="position" aria-label={ru.position} required defaultValue={participant?.position ?? ''}>
          <option value="" disabled>
            {ru.choose}
          </option>
          {ru.positions.map((value) => (
            <option key={value}>{value}</option>
          ))}
        </select>
      </label>
      <label className="field">
        <span>{ru.experience}</span>
        <select name="experience" aria-label={ru.experience} required defaultValue={participant?.experience ?? ''}>
          <option value="" disabled>
            {ru.choose}
          </option>
          {ru.experiences.map((value) => (
            <option key={value}>{value}</option>
          ))}
        </select>
      </label>
    </>
  );
}
