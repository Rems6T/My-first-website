import React, { useMemo, useState } from "react";

const BASE_BUDGET = 150;
const MAX_D6_NORMAL = 10;
const MAX_D6_ABSOLUTE = 15;

const fixedBonusOptions = [
  { label: "+0", value: 0, cost: 0 },
  { label: "+3", value: 3, cost: 5 },
  { label: "+6", value: 6, cost: 10 },
  { label: "+9", value: 9, cost: 15 },
  { label: "+12", value: 12, cost: 20 },
];

const rangeOptionsDistance = [
  { value: "courte", label: "Courte", cost: 0 },
  { value: "moyenne", label: "Moyenne", cost: 5 },
  { value: "longue", label: "Longue", cost: 10 },
];

const rangeOptionsContact = [
  { value: "contact", label: "Contact", cost: 0 },
  { value: "courte", label: "Courte", cost: 10 },
];

const handlingOptions = [
  { value: "une-main", label: "Une main", bonus: 0 },
  { value: "deux-mains", label: "Deux mains", bonus: 20 },
  { value: "deux-mains-lourd", label: "Deux mains + lourd", bonus: 30 },
];

const EFFECTS = [
  { name: "Anti-Anathème", cost: 20, tags: ["universel"] },
  { name: "Anti-véhicule", cost: 20, tags: ["universel"] },
  { name: "Artillerie", cost: 10, tags: ["universel"] },
  { name: "Assassin 2", cost: 5, family: "assassin", tags: ["universel"] },
  { name: "Assassin 4", cost: 10, family: "assassin", tags: ["universel"] },
  { name: "Assistance à l'attaque", cost: 10, tags: ["universel"] },
  { name: "Barrage 2", cost: 5, family: "barrage", tags: ["universel"] },
  { name: "Barrage 4", cost: 10, family: "barrage", tags: ["universel"] },
  { name: "Barrage 6", cost: 15, family: "barrage", tags: ["universel"] },
  { name: "Barrage 8", cost: 20, family: "barrage", tags: ["universel"] },
  { name: "Cadence 2", cost: 10, family: "cadence", tags: ["universel"] },
  { name: "Cadence 3", cost: 20, family: "cadence", tags: ["universel"] },
  { name: "Choc 2", cost: 10, family: "choc", tags: ["universel"] },
  { name: "Choc 4", cost: 15, family: "choc", tags: ["universel"] },
  { name: "Choc 6", cost: 20, family: "choc", tags: ["universel"] },
  { name: "Défense 2", cost: 10, family: "defense", tags: ["universel"] },
  { name: "Défense 3", cost: 15, family: "defense", tags: ["universel"] },
  { name: "Défense 4", cost: 20, family: "defense", tags: ["universel"] },
  { name: "Dispersion 3", cost: 10, family: "dispersion", tags: ["distance"] },
  { name: "Dispersion 6", cost: 20, family: "dispersion", tags: ["distance"] },
  { name: "Dégâts continus 3", cost: 5, family: "degats-continus", tags: ["universel"] },
  { name: "Dégâts continus 6", cost: 15, family: "degats-continus", tags: ["universel"] },
  { name: "Démoralisant", cost: 15, tags: ["universel"] },
  { name: "Désignation", cost: 5, tags: ["universel"] },
  { name: "Destructeur", cost: 10, tags: ["universel"] },
  { name: "En chaîne", cost: 15, tags: ["universel"] },
  { name: "Espérance", cost: 15, tags: ["universel"] },
  { name: "Fureur", cost: 20, tags: ["universel"] },
  { name: "Ignore armure", cost: 20, tags: ["universel"] },
  { name: "Ignore CdF", cost: 20, tags: ["universel"] },
  { name: "Jumelé (akimbo)", cost: 10, tags: ["distance"] },
  { name: "Jumelé (ambidextrie)", cost: 10, tags: ["universel"] },
  { name: "Lesté", cost: 10, tags: ["contact"] },
  { name: "Lumière 2", cost: 5, family: "lumiere", tags: ["universel"] },
  { name: "Lumière 4", cost: 15, family: "lumiere", tags: ["universel"] },
  { name: "Lumière 6", cost: 20, family: "lumiere", tags: ["universel"] },
  { name: "Meurtrier", cost: 10, tags: ["universel"] },
  { name: "Oblitération", cost: 15, tags: ["universel"] },
  { name: "Orfèvrerie", cost: 10, tags: ["contact"] },
  { name: "Pénétrant 5", cost: 5, family: "penetrant", tags: ["universel"] },
  { name: "Pénétrant 10", cost: 10, family: "penetrant", tags: ["universel"] },
  { name: "Perce armure 20", cost: 5, family: "perce-armure", tags: ["universel"] },
  { name: "Perce armure 40", cost: 10, family: "perce-armure", tags: ["universel"] },
  { name: "Perce armure 60", cost: 15, family: "perce-armure", tags: ["universel"] },
  { name: "Précision", cost: 10, tags: ["distance"] },
  { name: "Réaction 2", cost: 10, family: "reaction", tags: ["universel"] },
  { name: "Réaction 3", cost: 15, family: "reaction", tags: ["universel"] },
  { name: "Réaction 4", cost: 20, family: "reaction", tags: ["universel"] },
  { name: "Silencieux", cost: 10, tags: ["distance"] },
  { name: "Soumission", cost: 15, tags: ["universel"] },
  { name: "Tir en rafale", cost: 15, tags: ["distance"] },
  { name: "Tir en sécurité", cost: 10, tags: ["distance"] },
  { name: "Ultraviolence", cost: 10, tags: ["universel"] },
];

function costForD6(totalD6) {
  if (totalD6 <= 2) return 0;
  if (totalD6 <= MAX_D6_NORMAL) return (totalD6 - 2) * 5;
  if (totalD6 <= MAX_D6_ABSOLUTE) {
    return (MAX_D6_NORMAL - 2) * 5 + (totalD6 - MAX_D6_NORMAL) * 10;
  }
  return (MAX_D6_NORMAL - 2) * 5 + (MAX_D6_ABSOLUTE - MAX_D6_NORMAL) * 10;
}

export default function App() {
  const [weaponName, setWeaponName] = useState("Arme de prestige");
  const [weaponType, setWeaponType] = useState("contact");
  const [damageD6, setDamageD6] = useState(2);
  const [violenceD6, setViolenceD6] = useState(2);
  const [fixedDamageBonus, setFixedDamageBonus] = useState(0);
  const [range, setRange] = useState("contact");
  const [handling, setHandling] = useState("une-main");
  const [selectedEffects, setSelectedEffects] = useState([]);
  const [search, setSearch] = useState("");
  const [tenebricide, setTenebricide] = useState(false);

  const filteredEffects = useMemo(() => {
    return EFFECTS.filter((effect) => {
      const compatible =
        effect.tags.includes("universel") || effect.tags.includes(weaponType);
      const matchesSearch = effect.name
        .toLowerCase()
        .includes(search.toLowerCase());
      return compatible && matchesSearch;
    });
  }, [search, weaponType]);

  const selectedFamilies = useMemo(() => {
    const map = new Map();
    selectedEffects.forEach((name) => {
      const effect = EFFECTS.find((e) => e.name === name);
      if (effect?.family) map.set(effect.family, effect.name);
    });
    return map;
  }, [selectedEffects]);

  const totals = useMemo(() => {
    const currentRanges =
      weaponType === "contact"
        ? rangeOptionsContact
        : rangeOptionsDistance;

    const damageCost = costForD6(damageD6);
    const violenceCost = costForD6(violenceD6);
    const bonusCost =
      fixedBonusOptions.find((o) => o.value === fixedDamageBonus)?.cost ?? 0;
    const rangeCost =
      currentRanges.find((o) => o.value === range)?.cost ?? 0;
    const handlingBonus =
      handlingOptions.find((o) => o.value === handling)?.bonus ?? 0;
    const effectsCost = selectedEffects.reduce((sum, name) => {
      const effect = EFFECTS.find((e) => e.name === name);
      return sum + (effect?.cost ?? 0);
    }, 0);

    const tenebricideBonus = tenebricide ? 20 : 0;

    const spent =
      damageCost +
      violenceCost +
      bonusCost +
      rangeCost +
      effectsCost;

    return {
      damageCost,
      violenceCost,
      bonusCost,
      rangeCost,
      effectsCost,
      spent,

      handlingBonus,
      tenebricideBonus,

      budgetTotal: BASE_BUDGET + handlingBonus + tenebricideBonus,
      remaining: BASE_BUDGET + handlingBonus + tenebricideBonus - spent,
    };

  }, [
    damageD6,
    violenceD6,
    fixedDamageBonus,
    range,
    handling,
    selectedEffects,
    weaponType,
    tenebricide,
  ]);

  const warnings = useMemo(() => {
    const items = [];

    if (damageD6 > 15) items.push("Les dégâts dépassent 15D6.");
    if (violenceD6 > 15) items.push("La violence dépasse 15D6.");

    if (weaponType === "contact" && range !== "contact" && range !== "courte") {
      items.push("Une arme de contact ne peut pas dépasser la portée courte.");
    }

    if (weaponType === "distance" && range === "contact") {
      items.push("Une arme à distance doit avoir au minimum une portée courte.");
    }

    if (totals.remaining < 0) {
      items.push(`Le budget de ${totals.budgetTotal} PG est dépassé.`);
    }

    return items;
  }, [damageD6, violenceD6, weaponType, range, totals.remaining, totals.budgetTotal]);

  function toggleEffect(effectName) {
    const effect = EFFECTS.find((e) => e.name === effectName);
    if (!effect) return;

    setSelectedEffects((current) => {
      const exists = current.includes(effectName);
      if (exists) {
        return current.filter((name) => name !== effectName);
      }

      let next = [...current];
      if (effect.family) {
        next = next.filter((name) => {
          const e = EFFECTS.find((x) => x.name === name);
          return e?.family !== effect.family;
        });
      }
      next.push(effectName);
      return next;
    });
  }

  function resetForm() {
    setWeaponName("Arme de prestige");
    setWeaponType("contact");
    setDamageD6(2);
    setViolenceD6(2);
    setFixedDamageBonus(0);
    setRange("contact");
    setHandling("une-main");
    setSelectedEffects([]);
    setSearch("");
    setTenebricide(false);
  }
  const availableRanges =
    weaponType === "contact"
      ? rangeOptionsContact
      : rangeOptionsDistance;

  return (
    <div className="page">
      <div className="container">
        <h1>Calculateur d'arme de prestige</h1>
        <p className="sub">
          Budget de base : {BASE_BUDGET} PG
        </p>

        <div className="grid">
          <div className="card">
            <h2>Configuration</h2>

            <label className="label">Nom de l'arme</label>
            <input
              className="input"
              value={weaponName}
              onChange={(e) => setWeaponName(e.target.value)}
            />

            <label className="label">Type</label>
            <select
              className="input"
              value={weaponType}
              onChange={(e) => {
                const value = e.target.value;
                setWeaponType(value);
                setRange(value === "contact" ? "contact" : "courte");
              }}
            >
              <option value="contact">Arme de contact</option>
              <option value="distance">Arme à distance</option>
            </select >

            <label className="label">Dégâts (D6)</label>
            <input
              className="input"
              type="number"
              min="2"
              max="15"
              value={damageD6}
              onChange={(e) => setDamageD6(Number(e.target.value))}
            />

            <label className="label">Violence (D6)</label>
            <input
              className="input"
              type="number"
              min="2"
              max="15"
              value={violenceD6}
              onChange={(e) => setViolenceD6(Number(e.target.value))}
            />

            <label className="label">Bonus fixe de dégâts</label>
            <select
              className="input"
              value={fixedDamageBonus}
              onChange={(e) => setFixedDamageBonus(Number(e.target.value))}
            >
              {fixedBonusOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label} ({option.cost} PG)
                </option>
              ))}
            </select>

            <label className="label">Portée</label>
            <select
              className="input"
              value={range}
              onChange={(e) => setRange(e.target.value)}
            >
              {availableRanges.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label} ({option.cost} PG)
                </option>
              ))}
            </select>

            <label className="label">Maniement</label>
            <select
              className="input"
              value={handling}
              onChange={(e) => setHandling(e.target.value)}
            >
              {handlingOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label} {option.bonus > 0 ? `(+${option.bonus} PG bonus)` : ""}
                </option>
              ))}
            </select>

            <label className="label">Bonus spécial</label>
            <label className="effectItem">
              <input
                type="checkbox"
                checked={tenebricide}
                onChange={(e) => setTenebricide(e.target.checked)}
              />
              <span>Ténébricide (+20 PG à dépenser)</span>
            </label>

          </div >

          <div className="card">
            <h2>Résumé</h2>
            <p><strong>Nom :</strong> {weaponName}</p>
            <p><strong>Type :</strong> {weaponType}</p>
            <p><strong>Dégâts :</strong> {damageD6}D6 {fixedDamageBonus ? `+${fixedDamageBonus}` : ""}</p>
            <p><strong>Violence :</strong> {violenceD6}D6</p>
            <p><strong>Portée :</strong> {range}</p>
            <p>
              <strong>Maniement :</strong>{" "}
              {handlingOptions.find((o) => o.value === handling)?.label}
              {" "}(+{totals.handlingBonus} PG)
            </p>
            <p><strong>Effets :</strong> {selectedEffects.length ? selectedEffects.join(", ") : "Aucun"}</p>

            <hr />

            <p><strong>Dégâts :</strong> {totals.damageCost} PG</p>
            <p><strong>Violence :</strong> {totals.violenceCost} PG</p>
            <p><strong>Bonus fixe :</strong> {totals.bonusCost} PG</p>
            <p><strong>Portée :</strong> {totals.rangeCost} PG</p>
            <p><strong>Bonus maniement :</strong> +{totals.handlingBonus} PG</p>
            <p><strong>Ténébricide :</strong> {tenebricide ? "+20 PG" : "Non"}</p>
            <p><strong>Budget total :</strong> {totals.budgetTotal} PG</p>
            <p><strong>Total dépensé :</strong> {totals.spent} PG</p>
            <p>
              <strong>Restant :</strong>{" "}
              <span style={{ color: totals.remaining < 0 ? "red" : "green" }}>
                {totals.remaining} PG
              </span>
            </p>

            <button className="button" onClick={resetForm}>
              Réinitialiser
            </button>

            {
              warnings.length > 0 && (
                <div className="warningBox">
                  <strong>Vérifications :</strong>
                  <ul>
                    {warnings.map((warning) => (
                      <li key={warning}>{warning}</li>
                    ))}
                  </ul>
                </div >
              )
            }
          </div >
        </div >

        <div className="card">
          <h2>Effets spéciaux</h2>

          <input
            className="input"
            placeholder="Rechercher un effet..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />

          <div className="effectsGrid">
            {filteredEffects.map((effect) => {
              const checked = selectedEffects.includes(effect.name);
              const familySelection = effect.family
                ? selectedFamilies.get(effect.family)
                : null;

              return (
                <label key={effect.name} className="effectItem">
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={() => toggleEffect(effect.name)}
                  />
                  <span>
                    {effect.name} ({effect.cost} PG)
                    {familySelection &&
                      familySelection !== effect.name &&
                      effect.family
                      ? ` — remplacera ${familySelection}`
                      : ""}
                  </span>
                </label>
              );
            })}
          </div >
        </div >
      </div >
    </div >
  );
}
