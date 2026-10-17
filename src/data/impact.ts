import { measure as aidesCumul } from './impact/aides-cumul.ts';
import { measure as aldPriseEnCharge } from './impact/ald-prise-en-charge.ts';
import { measure as allegementsPatronaux } from './impact/allegements-patronaux.ts';
import { measure as allocationsFamiliales } from './impact/allocations-familiales.ts';
import { measure as assuranceChomage } from './impact/assurance-chomage.ts';
import { measure as carburants } from './impact/carburants.ts';
import { measure as congeNaissance } from './impact/conge-naissance.ts';
import { measure as csgSalaires } from './impact/csg-salaires.ts';
import { measure as encadrementLoyers } from './impact/encadrement-loyers.ts';
import { measure as energieLogement } from './impact/energie-logement.ts';
import { measure as etudiantsAides } from './impact/etudiants-aides.ts';
import { measure as hlmOccupation } from './impact/hlm-occupation.ts';
import { measure as impotFortune } from './impact/impot-fortune.ts';
import { measure as impotsEntreprises } from './impact/impots-entreprises.ts';
import { measure as independantsProtection } from './impact/independants-protection.ts';
import { measure as irBareme } from './impact/ir-bareme.ts';
import { measure as outremerOctroi } from './impact/outremer-octroi.ts';
import { measure as pensionsRevalorisation } from './impact/pensions-revalorisation.ts';
import { measure as quotientFamilial } from './impact/quotient-familial.ts';
import { measure as retraiteAgeLegal } from './impact/retraite-age-legal.ts';
import { measure as retraitesFiscalite } from './impact/retraites-fiscalite.ts';
import { measure as revalorisationPrestations } from './impact/revalorisation-prestations.ts';
import { measure as revenusCapitalPfu } from './impact/revenus-capital-pfu.ts';
import { measure as seuilsEffectifs } from './impact/seuils-effectifs.ts';
import { measure as successionDonation } from './impact/succession-donation.ts';
import { measure as vehiculeMalusZfe } from './impact/vehicule-malus-zfe.ts';
import type { Measure } from './impactTypes.ts';

// The measures of the "Impact pour moi" page, each drafted and reviewed before publication (see
// METHOD.md); an empty list shows the page as "bientôt disponible".
//
// Writing rules (enforced by validateImpact):
// - title: 14 words at most, neutral. option label: 20 words at most. effect.why: 25 words at most.
// - 2 to 5 options per measure; a party backs the option(s) its programme states, sourced, or gets
//   { backs: null, reason } rather than a guess. "faible" in a note flags a position to revalidate.
// - An effect is written from the reader's point of view ("Votre loyer...") and never names a party.
// - A euro range exists only with an official costing or a documented barème as `basis`.
// - Sources: https URL, ISO date not after PUBLISHED_AT.
//
// Publication rule (publicationErrors in validateImpact.ts, checked by impact.test.ts): at least 3
// options backed by a solid (non-"faible") position, and solid positions in at least 2 of the 3 blocs.
// A measure that fails the rule is not published.
export const IMPACT_MEASURES: Measure[] = [
    aidesCumul,
    aldPriseEnCharge,
    allegementsPatronaux,
    allocationsFamiliales,
    assuranceChomage,
    carburants,
    congeNaissance,
    csgSalaires,
    encadrementLoyers,
    energieLogement,
    etudiantsAides,
    hlmOccupation,
    impotFortune,
    impotsEntreprises,
    independantsProtection,
    irBareme,
    outremerOctroi,
    pensionsRevalorisation,
    quotientFamilial,
    retraiteAgeLegal,
    retraitesFiscalite,
    revalorisationPrestations,
    revenusCapitalPfu,
    seuilsEffectifs,
    successionDonation,
    vehiculeMalusZfe,
];
