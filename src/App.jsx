import React, { useMemo, useState, useEffect } from "react";
import effectsCatalog from "./data/effects.json";

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

const CALCULATOR_EFFECTS = [
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
  { name: "Jumelé (akimbo)", cost: 10, family: "jumele", tags: ["distance"] },
  { name: "Jumelé (ambidextrie)", cost: 10, family: "jumele", tags: ["universel"] },
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

function clampNumber(value, min, max, fallback = min) {
  const num = Number(value);
  if (Number.isNaN(num)) return fallback;
  return Math.min(max, Math.max(min, Math.trunc(num)));
}

function summarizeEffect(text, maxLength = 140) {
  if (!text) return "";

  const cleaned = text.replace(/\s+/g, " ").trim();

  if (cleaned.length <= maxLength) return cleaned;

  const cut = cleaned.slice(0, maxLength);
  const lastSpace = cut.lastIndexOf(" ");

  return `${cut.slice(0, lastSpace > 0 ? lastSpace : maxLength)}…`;
}

export default function App() {
  const [currentPage, setCurrentPage] = useState("calculateur");

  const [weaponName, setWeaponName] = useState("Arme de prestige");
  const [weaponType, setWeaponType] = useState("contact");
  const [damageD6, setDamageD6] = useState(2);
  const [violenceD6, setViolenceD6] = useState(2);
  const [fixedDamageBonus, setFixedDamageBonus] = useState(0);
  const [range, setRange] = useState("contact");
  const [handling, setHandling] = useState("une-main");
  const [tenebricide, setTenebricide] = useState(false);
  const [selectedEffects, setSelectedEffects] = useState([]);
  const [calculatorSearch, setCalculatorSearch] = useState("");

  const [effectsSearch, setEffectsSearch] = useState("");
  const [effectsBookFilter, setEffectsBookFilter] = useState("Tous");

  const [expandedEffects, setExpandedEffects] = useState({});

  useEffect(() => {
    if (handling === "deux-mains" || handling === "deux-mains-lourd") {
      setSelectedEffects((current) => {
        return current.filter(
          (name) =>
            name !== "Jumelé (akimbo)" &&
            name !== "Jumelé (ambidextrie)"
        );
      });
    }
  }, [handling]);

  const isTwoHanded =
    handling === "deux-mains" || handling === "deux-mains-lourd";

  const filteredCalculatorEffects = useMemo(() => {
    return CALCULATOR_EFFECTS.filter((effect) => {
      const compatible =
        effect.tags.includes("universel") || effect.tags.includes(weaponType);
      const matchesSearch = effect.name
        .toLowerCase()
        .includes(calculatorSearch.toLowerCase());
      return compatible && matchesSearch;
    });
  }, [calculatorSearch, weaponType]);

  const selectedFamilies = useMemo(() => {
    const map = new Map();
    selectedEffects.forEach((name) => {
      const effect = CALCULATOR_EFFECTS.find((e) => e.name === name);
      if (effect?.family) map.set(effect.family, effect.name);
    });
    return map;
  }, [selectedEffects]);

  const availableRanges =
    weaponType === "contact" ? rangeOptionsContact : rangeOptionsDistance;

  const totals = useMemo(() => {
    const damageCost = costForD6(damageD6);
    const violenceCost = costForD6(violenceD6);

    const bonusCost =
      fixedBonusOptions.find((o) => o.value === fixedDamageBonus)?.cost ?? 0;

    const rangeCost =
      availableRanges.find((o) => o.value === range)?.cost ?? 0;

    const handlingBonus =
      handlingOptions.find((o) => o.value === handling)?.bonus ?? 0;

    const effectsCost = selectedEffects.reduce((sum, name) => {
      const effect = CALCULATOR_EFFECTS.find((e) => e.name === name);
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
      handlingBonus,
      effectsCost,
      tenebricideBonus,
      spent,
      budgetTotal: BASE_BUDGET + handlingBonus + tenebricideBonus,
      remaining: BASE_BUDGET + handlingBonus + tenebricideBonus - spent,
    };
  }, [
    damageD6,
    violenceD6,
    fixedDamageBonus,
    range,
    handling,
    tenebricide,
    selectedEffects,
    availableRanges,
  ]);

  const warnings = useMemo(() => {
    const items = [];

    if (totals.remaining < 0) {
      items.push(`Budget dépassé : ${totals.spent} / ${totals.budgetTotal} PG.`);
    }

    return items;
  }, [totals]);

  const bookOptions = useMemo(() => {
    return ["Tous", ...new Set(effectsCatalog.map((effect) => effect.book).filter(Boolean))];
  }, []);

  const filteredEffectsCatalog = useMemo(() => {
    return effectsCatalog.filter((effect) => {
      const search = effectsSearch.trim().toLowerCase();
      const matchesSearch =
        search === "" ||
        effect.name.toLowerCase().includes(search) ||
        effect.effect.toLowerCase().includes(search) ||
        (effect.book || "").toLowerCase().includes(search);

      const matchesBook =
        effectsBookFilter === "Tous" || effect.book === effectsBookFilter;

      return matchesSearch && matchesBook;
    });
  }, [effectsSearch, effectsBookFilter]);

  const selectedEffectsDetails = useMemo(() => {
    return selectedEffects.map((name) => {
      const calculatorEffect = CALCULATOR_EFFECTS.find(
        (effect) => effect.name === name
      );

      const catalogEffect = effectsCatalog.find(
        (effect) => effect.name === name
      );

      const description =
        catalogEffect?.effect ?? "Description non renseignée dans le catalogue.";

      const summary =
        catalogEffect?.summary ?? summarizeEffect(description, 160);

      return {
        name,
        cost: calculatorEffect?.cost ?? 0,
        description,
        summary,
        book: catalogEffect?.book ?? "—",
      };
    });
  }, [selectedEffects]);

  const calculatorCatalogEffects = useMemo(() => {
    return effectsCatalog.filter((effect) => {
      const calculatorEffect = CALCULATOR_EFFECTS.find((item) => item.name === effect.name);
      if (!calculatorEffect) return false;

      const compatible =
        calculatorEffect.tags.includes("universel") || calculatorEffect.tags.includes(weaponType);

      const search = calculatorSearch.trim().toLowerCase();
      const matchesSearch =
        search === "" ||
        effect.name.toLowerCase().includes(search) ||
        effect.effect.toLowerCase().includes(search) ||
        (effect.book || "").toLowerCase().includes(search);

      return compatible && matchesSearch;
    });
  }, [calculatorSearch, weaponType]);

  function toggleEffect(effectName) {
    const effect = CALCULATOR_EFFECTS.find((e) => e.name === effectName);
    if (!effect) return;

    const isJumele =
      effect.name === "Jumelé (akimbo)" ||
      effect.name === "Jumelé (ambidextrie)";

    if (isTwoHanded && isJumele) {
      return;
    }

    setSelectedEffects((current) => {
      const exists = current.includes(effectName);

      if (exists) {
        return current.filter((name) => name !== effectName);
      }

      let next = [...current];

      if (effect.family) {
        next = next.filter((name) => {
          const selectedEffect = CALCULATOR_EFFECTS.find((e) => e.name === name);
          return selectedEffect?.family !== effect.family;
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
    setTenebricide(false);
    setSelectedEffects([]);
    setCalculatorSearch("");
  }

  function toggleEffectDescription(name) {
    setExpandedEffects((prev) => ({
      ...prev,
      [name]: !prev[name],
    }));
  }

  return (
    <div className="page">
      <div className="container">
        <div className="navbar">
          <div className="navbarTitle">Knight · Armurerie</div>

          <div className="navbarLinks">
            <button
              className={`navButton ${currentPage === "calculateur" ? "active" : ""}`}
              onClick={() => setCurrentPage("calculateur")}
            >
              Calculateur
            </button>

            <button
              className={`navButton ${currentPage === "effects" ? "active" : ""}`}
              onClick={() => setCurrentPage("effects")}
            >
              Effets
            </button>
          </div>
        </div>

        {currentPage === "calculateur" ? (
          <>

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
                </select>

                <label className="label">Dégâts (D6)</label>
                <input
                  className="input"
                  type="number"
                  min="2"
                  max="15"
                  value={damageD6}
                  onChange={(e) => setDamageD6(clampNumber(e.target.value, 2, 15, 2))}
                  onBlur={(e) => setDamageD6(clampNumber(e.target.value, 2, 15, 2))}
                />

                <label className="label">Violence (D6)</label>
                <input
                  className="input"
                  type="number"
                  min="2"
                  max="15"
                  value={violenceD6}
                  onChange={(e) => setViolenceD6(clampNumber(e.target.value, 2, 15, 2))}
                  onBlur={(e) => setViolenceD6(clampNumber(e.target.value, 2, 15, 2))}
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
                      {option.label} {option.bonus > 0 ? `(+${option.bonus} PG)` : ""}
                    </option>
                  ))}
                </select>

                <label className="label">Bonus spécial</label>
                <label className="effectItem singleOption">
                  <input
                    type="checkbox"
                    checked={tenebricide}
                    onChange={(e) => setTenebricide(e.target.checked)}
                  />
                  <span>Ténébricide (+20 PG à dépenser)</span>
                </label>
              </div>

              <div className="card">
                <h2>Résumé</h2>
                <p><strong>Nom :</strong> {weaponName}</p>
                <p><strong>Type :</strong> {weaponType === "contact" ? "Arme de contact" : "Arme à distance"}</p>
                <p><strong>Dégâts :</strong> {damageD6}D6 {fixedDamageBonus ? `+${fixedDamageBonus}` : ""}</p>
                <p><strong>Violence :</strong> {violenceD6}D6</p>
                <p>
                  <strong>Portée :</strong>{" "}
                  {availableRanges.find((o) => o.value === range)?.label}
                </p>
                <p>
                  <strong>Maniement :</strong>{" "}
                  {handlingOptions.find((o) => o.value === handling)?.label} (+{totals.handlingBonus} PG)
                </p>
                <p><strong>Ténébricide :</strong> {tenebricide ? "+20 PG" : "Non"}</p>
                <p><strong>Effets :</strong> {selectedEffects.length ? selectedEffects.join(", ") : "Aucun"}</p>

                <hr />

                <p><strong>Dégâts :</strong> {totals.damageCost} PG</p>
                <p><strong>Violence :</strong> {totals.violenceCost} PG</p>
                <p><strong>Bonus fixe :</strong> {totals.bonusCost} PG</p>
                <p><strong>Portée :</strong> {totals.rangeCost} PG</p>
                <p><strong>Effets :</strong> {totals.effectsCost} PG</p>
                <p><strong>Total dépensé :</strong> {totals.spent} PG</p>
                <p><strong>Budget total :</strong> {totals.budgetTotal} PG</p>
                <p>
                  <strong>Restant :</strong>{" "}
                  <span style={{ color: totals.remaining < 0 ? "#fca5a5" : "#86efac" }}>
                    {totals.remaining} PG
                  </span>
                </p>

                <button className="button" onClick={resetForm}>
                  Réinitialiser
                </button>

                {warnings.length > 0 && (
                  <div className="warningBox">
                    <strong>Vérifications :</strong>
                    <ul>
                      {warnings.map((warning) => (
                        <li key={warning}>{warning}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>

            <div className="card">
              <div className="sectionHeader">
                <div>
                  <h2>Effets spéciaux</h2>
                  <p className="sub sectionSub">Sélection d'effets pour le calculateur.</p>
                </div>

                <input
                  className="input searchInput"
                  placeholder="Rechercher un effet..."
                  value={calculatorSearch}
                  onChange={(e) => setCalculatorSearch(e.target.value)}
                />
              </div>

              <div className="selectedEffectsSummary">
                <h3>Résumé des effets sélectionnés</h3>

                {selectedEffectsDetails.length === 0 ? (
                  <p className="emptyState">
                    Aucun effet sélectionné pour le moment.
                  </p>
                ) : (

                  <div className="selectedEffectsSummary">
                    {selectedEffectsDetails.length === 0 ? (
                      <p className="emptyState">
                        Aucun effet sélectionné pour le moment.
                      </p>
                    ) : (
                      <div className="selectedEffectsList">
                        {selectedEffectsDetails.map((effect) => {
                          const expanded = expandedEffects[effect.name] ?? false;

                          return (
                            <article
                              key={effect.name}
                              className="selectedEffectCard"
                            >
                              <div className="effectHeader">
                                <h4>{effect.name}</h4>
                                <span className="bookBadge">
                                  {effect.cost} PG
                                </span>
                              </div>

                              <p className="effectMeta">
                                Livre : {effect.book}
                              </p>

                              <p className="effectDescription">
                                {expanded ? effect.description : effect.summary}
                              </p>

                              {effect.description !== effect.summary && (
                                <button
                                  type="button"
                                  className="effectToggle"
                                  onClick={() => toggleEffectDescription(effect.name)}
                                >
                                  {expanded ? "Voir moins" : "Voir plus"}
                                </button>
                              )}
                            </article>
                          );
                        })}
                      </div>
                    )}
                  </div>

                )}
              </div>

              <div className="effectsGrid">
                {filteredCalculatorEffects.map((effect) => {
                  const checked = selectedEffects.includes(effect.name);
                  const familySelection = effect.family
                    ? selectedFamilies.get(effect.family)
                    : null;

                  const isJumele =
                    effect.name === "Jumelé (akimbo)" ||
                    effect.name === "Jumelé (ambidextrie)";

                  const disabled = isTwoHanded && isJumele;

                  return (
                    <label
                      key={effect.name}
                      className={`effectItem ${disabled ? "effectItemDisabled" : ""}`}
                    >
                      <input
                        type="checkbox"
                        checked={checked}
                        disabled={disabled}
                        onChange={() => toggleEffect(effect.name)}
                      />
                      <span>
                        <strong>{effect.name}</strong> — {effect.cost} PG
                        {familySelection &&
                          familySelection !== effect.name &&
                          effect.family
                          ? ` — remplacera ${familySelection}`
                          : ""}
                        {disabled ? " — indisponible avec une arme à deux mains" : ""}
                      </span>
                    </label>
                  );
                })}
              </div>

              {/* <div className="catalogDivider" /> */}

              {/* <div className="sectionHeader lowerSectionHeader">
                <div>
                  <h3>Liste complète des effets</h3>
                  <p className="sub sectionSub">
                    Tous les effets compatibles avec le type d'arme choisi, avec leur description.
                  </p>
                </div>
              </div> */}

              {/* <div className="effectsCatalogList compactCatalogList">
                {calculatorCatalogEffects.map((effect) => {
                  const calculatorEffect = CALCULATOR_EFFECTS.find((item) => item.name === effect.name);
                  return (
                    <article key={`${effect.book}-${effect.name}`} className="card effectCard compactEffectCard">
                      <div className="effectHeader">
                        <h3>{effect.name}</h3>
                        <div className="effectBadges">
                          <span className="bookBadge">{effect.book}</span>
                          <span className="bookBadge">{calculatorEffect?.cost ?? 0} PG</span>
                        </div>
                      </div>
                      <p className="effectDescription">{effect.effect}</p>
                    </article>
                  );
                })}
              </div> */}
            </div>
          </>
        ) : (
          <>
            <div className="heroRow">
              <div>
                <h1>Effets du jeu</h1>
                <p className="sub">
                  Catalogue extrait de l'onglet <strong>Effets</strong>.
                </p>
              </div>

              <div className="budgetPill">
                <span>Total </span>
                <strong>{filteredEffectsCatalog.length} effets</strong>
              </div>
            </div>

            <div className="card">
              <div className="filtersRow">
                <input
                  className="input"
                  placeholder="Rechercher par nom, livre ou description..."
                  value={effectsSearch}
                  onChange={(e) => setEffectsSearch(e.target.value)}
                />

                <select
                  className="input"
                  value={effectsBookFilter}
                  onChange={(e) => setEffectsBookFilter(e.target.value)}
                >
                  {bookOptions.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="effectsCatalogList">
              {filteredEffectsCatalog.map((effect) => (
                <article key={`${effect.book}-${effect.name}`} className="card effectCard">
                  <div className="effectHeader">
                    <h3>{effect.name}</h3>
                    <span className="bookBadge">{effect.book}</span>
                  </div>
                  <p className="effectDescription">{effect.effect}</p>
                </article>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
