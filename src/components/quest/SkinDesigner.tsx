import { HELMETS, SKIN_OPTIONS } from '../../data/skins';
import { ru } from '../../i18n/ru';
import { randomSkin } from '../../lib/skin';
import type { HeroSkin } from '../../lib/types';
import { Icon } from '../Icon';
export function SkinDesigner({ skin, onChange }: { skin: HeroSkin; onChange: (skin: HeroSkin) => void }) {
  return <div className="skin-designer">
    <fieldset className="skin-group skin-helmet"><legend>{ru.quest.helmet}</legend><div>
      {SKIN_OPTIONS.helmet.map((value) => <label key={value} className={skin.helmet === value ? 'active' : ''}>
        <input type="radio" name="helmet" aria-label={ru.redesign.helmets[value]} checked={skin.helmet === value}
          onChange={() => onChange({ ...skin, helmet: value })} />
        <span className="skin-swatch" style={{ backgroundColor: HELMETS[value] }}>
          {skin.helmet === value && <Icon name="check" />}</span>
      </label>)}</div><p className="skin-selected">{ru.redesign.helmets[skin.helmet]}</p></fieldset>
    <fieldset className="skin-group skin-theme"><legend>{ru.skin.theme}</legend><div>
      {SKIN_OPTIONS.theme.map((value) => <label key={value} className={skin.theme === value ? 'active' : ''}>
        <input type="radio" name="theme" aria-label={ru.skin.themes[value]} checked={skin.theme === value}
          onChange={() => onChange({ ...skin, theme: value })} />
        <span className={'skin-theme-preview preview-' + value} /><span>{ru.skin.themes[value]}</span>
      </label>)}</div></fieldset>
    <button className="btn btn-secondary skin-random" type="button" onClick={() => onChange(randomSkin())}>
      <Icon name="random" />{ru.redesign.random}</button>
  </div>;
}

