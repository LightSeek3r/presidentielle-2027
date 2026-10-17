import type { Party } from './types.ts';

// Gradients follow party colours but are darkened so white text and logos keep a contrast of at
// least 3:1 against both stops (checked in __tests__/data.test.ts).
//
// Logos: `logo` is the file name of a white single-colour mark on the website. The logos are the
// parties' trademarks and are not part of this repository (the website's method page lists their
// sources and licences).
//
// organeRef values checked on 2026-10-12 against per-group counts of scrutins n°6736 and n°3685
// (official AN open data). UDR changed organeRef mid-legislature (PO847173 then PO872880):
// build-votes is run with --rename for both, so UDR is found through its abbreviation.
// Group abbreviations are those of the 17th legislature. A group is not a party:
// - SOC also gathers Place publique and a few other affiliated deputies
// - GDR also gathers overseas deputies who are not PCF members
// - DR (Droite républicaine) is the LR parliamentary group but not all its members are LR
// - EPR, Dem and HOR likewise include apparentés or non-members of the matching party
// Vote positions are therefore those of the group, never claimed as the party's own.
export const PARTIES: Party[] = [
    { id: 'lo', label: 'Lutte ouvrière', shortLabel: 'LO', logo: 'lo.svg', gradient: ['#8F1D1D', '#5C0F0F'] },
    { id: 'lfi', label: 'La France insoumise', shortLabel: 'LFI', logo: 'lfi.png', gradient: ['#A3262F', '#6E1B4D'], group: { abbrev: 'LFI-NFP', organeRef: 'PO845413' } },
    { id: 'pcf', label: 'Parti communiste français', shortLabel: 'PCF', logo: 'pcf.svg', gradient: ['#C0392B', '#962D22'], group: { abbrev: 'GDR', organeRef: 'PO845514' } },
    { id: 'eco', label: 'Les Écologistes', shortLabel: 'Écologistes', logo: 'eco.svg', gradient: ['#2E7D32', '#1B5E20'], group: { abbrev: 'EcoS', organeRef: 'PO845439' } },
    { id: 'ps', label: 'Parti socialiste / Place publique', shortLabel: 'PS', logo: 'ps.svg', gradient: ['#C2185B', '#880E4F'], group: { abbrev: 'SOC', organeRef: 'PO845419' } },
    { id: 'ren', label: 'Renaissance', shortLabel: 'Renaissance', logo: 'ren.svg', gradient: ['#4A3F9F', '#2E2670'], group: { abbrev: 'EPR', organeRef: 'PO845407' } },
    { id: 'modem', label: 'Mouvement démocrate', shortLabel: 'MoDem', logo: 'modem.svg', gradient: ['#B85C00', '#8A4200'], group: { abbrev: 'Dem', organeRef: 'PO845454' } },
    { id: 'hor', label: 'Horizons', shortLabel: 'Horizons', logo: 'hor.svg', gradient: ['#0E7490', '#0B5266'], group: { abbrev: 'HOR', organeRef: 'PO845470' } },
    { id: 'lr', label: 'Les Républicains', shortLabel: 'LR', logo: 'lr.svg', gradient: ['#1D5BBF', '#123E8A'], group: { abbrev: 'DR', organeRef: 'PO845425' } },
    { id: 'udr', label: 'Union des droites pour la République', shortLabel: 'UDR', logo: 'udr.svg', gradient: ['#3B4B7A', '#242F55'], group: { abbrev: 'UDR' } },
    { id: 'rn', label: 'Rassemblement national', shortLabel: 'RN', logo: 'rn.svg', gradient: ['#10244F', '#0A1733'], group: { abbrev: 'RN', organeRef: 'PO845401' } },
    { id: 'rec', label: 'Reconquête', shortLabel: 'Reconquête', logo: 'rec.svg', gradient: ['#37373F', '#1F1F25'] },
];
