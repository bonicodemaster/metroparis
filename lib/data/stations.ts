import type { Station, LineId } from "./types";

/**
 * Stations du métro parisien.
 *
 * Coordonnées (lat/lon WGS84) basées sur la position réelle des stations.
 * Certaines positions sont approximées (~50–150m de marge) — suffisant pour
 * la quasi-totalité des modes pédagogiques (clic carte avec tolérance).
 *
 * Modèle: chaque station est unique. Les correspondances sont représentées
 * par le champ `lines: LineId[]`.
 *
 * Couverture: les 16 lignes du métro parisien (1, 2, 3, 3bis, 4, 5, 6, 7,
 * 7bis, 8, 9, 10, 11, 12, 13, 14). Simplifications documentées :
 *   - Ligne 7 : branche principale Mairie d'Ivry (branche Villejuif modélisée
 *     séparément via `branches`).
 *   - Ligne 13 : branche principale Saint-Denis (branche Asnières via branches).
 *   - Ligne 14 : version 9 stations Saint-Lazare → Olympiades (extension 2024
 *     pas encore intégrée — voir roadmap).
 */

type S = Omit<Station, "lines"> & { lines: LineId[] };

// Helper pour construire compact (id, name, lat, lon, lines).
const s = (
  id: string,
  name: string,
  lat: number,
  lon: number,
  lines: LineId[]
): S => ({ id, name, lat, lon, lines });

export const stations: Station[] = [
  // ─── Ligne 1 (La Défense → Château de Vincennes) ────────────────────────────
  s("la-defense", "La Défense (Grande Arche)", 48.8919, 2.2381, ["1"]),
  s("esplanade-de-la-defense", "Esplanade de La Défense", 48.8878, 2.2493, ["1"]),
  s("pont-de-neuilly", "Pont de Neuilly", 48.8849, 2.2585, ["1"]),
  s("les-sablons", "Les Sablons", 48.8804, 2.2700, ["1"]),
  s("porte-maillot", "Porte Maillot", 48.8780, 2.2825, ["1"]),
  s("argentine", "Argentine", 48.8757, 2.2885, ["1"]),
  s("charles-de-gaulle-etoile", "Charles de Gaulle—Étoile", 48.8740, 2.2950, ["1","2","6"]),
  s("george-v", "George V", 48.8721, 2.3008, ["1"]),
  s("franklin-d-roosevelt", "Franklin D. Roosevelt", 48.8687, 2.3097, ["1","9"]),
  s("champs-elysees-clemenceau", "Champs-Élysées—Clemenceau", 48.8670, 2.3137, ["1","13"]),
  s("concorde", "Concorde", 48.8651, 2.3216, ["1","8","12"]),
  s("tuileries", "Tuileries", 48.8649, 2.3296, ["1"]),
  s("palais-royal-musee-du-louvre", "Palais Royal—Musée du Louvre", 48.8629, 2.3360, ["1","7"]),
  s("louvre-rivoli", "Louvre—Rivoli", 48.8612, 2.3411, ["1"]),
  s("chatelet", "Châtelet", 48.8584, 2.3475, ["1","4","7","11","14"]),
  s("hotel-de-ville", "Hôtel de Ville", 48.8573, 2.3522, ["1","11"]),
  s("saint-paul", "Saint-Paul", 48.8553, 2.3613, ["1"]),
  s("bastille", "Bastille", 48.8530, 2.3692, ["1","5","8"]),
  s("gare-de-lyon", "Gare de Lyon", 48.8443, 2.3743, ["1","14"]),
  s("reuilly-diderot", "Reuilly—Diderot", 48.8470, 2.3849, ["1","8"]),
  s("nation", "Nation", 48.8484, 2.3957, ["1","2","6","9"]),
  s("porte-de-vincennes", "Porte de Vincennes", 48.8475, 2.4108, ["1"]),
  s("saint-mande", "Saint-Mandé", 48.8466, 2.4188, ["1"]),
  s("berault", "Bérault", 48.8453, 2.4280, ["1"]),
  s("chateau-de-vincennes", "Château de Vincennes", 48.8444, 2.4400, ["1"]),

  // ─── Ligne 2 (Porte Dauphine → Nation) ──────────────────────────────────────
  s("porte-dauphine", "Porte Dauphine", 48.8718, 2.2774, ["2"]),
  s("victor-hugo", "Victor Hugo", 48.8696, 2.2854, ["2"]),
  s("ternes", "Ternes", 48.8784, 2.2980, ["2"]),
  s("courcelles", "Courcelles", 48.8801, 2.3034, ["2"]),
  s("monceau", "Monceau", 48.8810, 2.3092, ["2"]),
  s("villiers", "Villiers", 48.8819, 2.3151, ["2","3"]),
  s("rome", "Rome", 48.8826, 2.3216, ["2"]),
  s("place-de-clichy", "Place de Clichy", 48.8836, 2.3274, ["2","13"]),
  s("blanche", "Blanche", 48.8839, 2.3328, ["2"]),
  s("pigalle", "Pigalle", 48.8821, 2.3372, ["2","12"]),
  s("anvers", "Anvers", 48.8826, 2.3445, ["2"]),
  s("barbes-rochechouart", "Barbès—Rochechouart", 48.8842, 2.3494, ["2","4"]),
  s("la-chapelle", "La Chapelle", 48.8839, 2.3596, ["2"]),
  s("stalingrad", "Stalingrad", 48.8843, 2.3683, ["2","5","7"]),
  s("jaures", "Jaurès", 48.8826, 2.3704, ["2","5","7bis"]),
  s("colonel-fabien", "Colonel Fabien", 48.8775, 2.3700, ["2"]),
  s("belleville", "Belleville", 48.8723, 2.3768, ["2","11"]),
  s("couronnes", "Couronnes", 48.8693, 2.3811, ["2"]),
  s("menilmontant", "Ménilmontant", 48.8651, 2.3849, ["2"]),
  s("pere-lachaise", "Père Lachaise", 48.8612, 2.3878, ["2","3"]),
  s("philippe-auguste", "Philippe Auguste", 48.8571, 2.3925, ["2"]),
  s("alexandre-dumas", "Alexandre Dumas", 48.8542, 2.3961, ["2"]),
  s("avron", "Avron", 48.8505, 2.3994, ["2"]),

  // ─── Ligne 3 (Pont de Levallois—Bécon → Gallieni) ───────────────────────────
  s("pont-de-levallois-becon", "Pont de Levallois—Bécon", 48.8975, 2.2790, ["3"]),
  s("anatole-france", "Anatole France", 48.8957, 2.2854, ["3"]),
  s("louise-michel", "Louise Michel", 48.8866, 2.2884, ["3"]),
  s("porte-de-champerret", "Porte de Champerret", 48.8857, 2.2934, ["3"]),
  s("pereire", "Pereire", 48.8849, 2.3001, ["3"]),
  s("wagram", "Wagram", 48.8843, 2.3081, ["3"]),
  s("malesherbes", "Malesherbes", 48.8842, 2.3132, ["3"]),
  // villiers déjà déclaré
  s("europe", "Europe", 48.8784, 2.3214, ["3"]),
  s("saint-lazare", "Saint-Lazare", 48.8757, 2.3247, ["3","9","12","13","14"]),
  s("havre-caumartin", "Havre—Caumartin", 48.8736, 2.3275, ["3","9"]),
  s("opera", "Opéra", 48.8709, 2.3318, ["3","7","8"]),
  s("quatre-septembre", "Quatre-Septembre", 48.8693, 2.3373, ["3"]),
  s("bourse", "Bourse", 48.8687, 2.3415, ["3"]),
  s("sentier", "Sentier", 48.8670, 2.3478, ["3"]),
  s("reaumur-sebastopol", "Réaumur—Sébastopol", 48.8666, 2.3520, ["3","4"]),
  s("arts-et-metiers", "Arts et Métiers", 48.8654, 2.3559, ["3","11"]),
  s("temple", "Temple", 48.8655, 2.3622, ["3"]),
  s("republique", "République", 48.8676, 2.3636, ["3","5","8","9","11"]),
  s("parmentier", "Parmentier", 48.8666, 2.3754, ["3"]),
  s("rue-saint-maur", "Rue Saint-Maur", 48.8654, 2.3812, ["3"]),
  // pere-lachaise déjà déclaré
  s("gambetta", "Gambetta", 48.8651, 2.3984, ["3","3bis"]),
  s("porte-de-bagnolet", "Porte de Bagnolet", 48.8649, 2.4101, ["3"]),
  s("gallieni", "Gallieni", 48.8649, 2.4170, ["3"]),

  // ─── Ligne 3bis (Gambetta → Porte des Lilas) ────────────────────────────────
  s("pelleport", "Pelleport", 48.8704, 2.4014, ["3bis"]),
  s("saint-fargeau", "Saint-Fargeau", 48.8730, 2.4017, ["3bis"]),
  s("porte-des-lilas", "Porte des Lilas", 48.8771, 2.4044, ["3bis","11"]),

  // ─── Ligne 4 (Porte de Clignancourt → Bagneux—Lucie Aubrac) ─────────────────
  s("porte-de-clignancourt", "Porte de Clignancourt", 48.8979, 2.3441, ["4"]),
  s("simplon", "Simplon", 48.8937, 2.3478, ["4"]),
  s("marcadet-poissonniers", "Marcadet—Poissonniers", 48.8907, 2.3496, ["4","12"]),
  s("chateau-rouge", "Château Rouge", 48.8873, 2.3496, ["4"]),
  // barbes-rochechouart déjà déclaré
  s("gare-du-nord", "Gare du Nord", 48.8809, 2.3553, ["4","5"]),
  s("gare-de-l-est", "Gare de l'Est", 48.8767, 2.3590, ["4","5","7"]),
  s("chateau-d-eau", "Château d'Eau", 48.8723, 2.3585, ["4"]),
  s("strasbourg-saint-denis", "Strasbourg—Saint-Denis", 48.8693, 2.3548, ["4","8","9"]),
  // reaumur-sebastopol déjà déclaré
  s("etienne-marcel", "Étienne Marcel", 48.8638, 2.3490, ["4"]),
  s("les-halles", "Les Halles", 48.8624, 2.3457, ["4"]),
  // chatelet déjà déclaré
  s("cite", "Cité", 48.8556, 2.3464, ["4"]),
  s("saint-michel", "Saint-Michel", 48.8537, 2.3438, ["4"]),
  s("odeon", "Odéon", 48.8519, 2.3387, ["4","10"]),
  s("saint-germain-des-pres", "Saint-Germain-des-Prés", 48.8538, 2.3338, ["4"]),
  s("saint-sulpice", "Saint-Sulpice", 48.8511, 2.3308, ["4"]),
  s("saint-placide", "Saint-Placide", 48.8475, 2.3266, ["4"]),
  s("montparnasse-bienvenue", "Montparnasse—Bienvenüe", 48.8418, 2.3210, ["4","6","12","13"]),
  s("vavin", "Vavin", 48.8418, 2.3290, ["4"]),
  s("raspail", "Raspail", 48.8385, 2.3303, ["4","6"]),
  s("denfert-rochereau", "Denfert-Rochereau", 48.8338, 2.3326, ["4","6"]),
  s("mouton-duvernet", "Mouton-Duvernet", 48.8297, 2.3293, ["4"]),
  s("alesia", "Alésia", 48.8281, 2.3273, ["4"]),
  s("porte-d-orleans", "Porte d'Orléans", 48.8222, 2.3261, ["4"]),
  s("mairie-de-montrouge", "Mairie de Montrouge", 48.8189, 2.3197, ["4"]),
  s("barbara", "Barbara", 48.8129, 2.3169, ["4"]),
  s("bagneux-lucie-aubrac", "Bagneux—Lucie Aubrac", 48.8059, 2.3119, ["4"]),

  // ─── Ligne 5 (Bobigny—Pablo Picasso → Place d'Italie) ───────────────────────
  s("bobigny-pablo-picasso", "Bobigny—Pablo Picasso", 48.9061, 2.4516, ["5"]),
  s("bobigny-pantin-raymond-queneau", "Bobigny—Pantin—Raymond Queneau", 48.8983, 2.4267, ["5"]),
  s("eglise-de-pantin", "Église de Pantin", 48.8945, 2.4096, ["5"]),
  s("hoche", "Hoche", 48.8930, 2.4010, ["5"]),
  s("porte-de-pantin", "Porte de Pantin", 48.8898, 2.3938, ["5"]),
  s("ourcq", "Ourcq", 48.8866, 2.3848, ["5"]),
  s("laumiere", "Laumière", 48.8854, 2.3776, ["5"]),
  // jaures déjà déclaré
  // stalingrad déjà déclaré
  // gare-du-nord déjà déclaré
  // gare-de-l-est déjà déclaré
  s("jacques-bonsergent", "Jacques Bonsergent", 48.8716, 2.3608, ["5"]),
  // republique déjà déclaré
  s("oberkampf", "Oberkampf", 48.8649, 2.3712, ["5","9"]),
  s("richard-lenoir", "Richard-Lenoir", 48.8612, 2.3712, ["5"]),
  s("breguet-sabin", "Bréguet—Sabin", 48.8567, 2.3705, ["5"]),
  // bastille déjà déclaré
  s("quai-de-la-rapee", "Quai de la Rapée", 48.8470, 2.3675, ["5"]),
  s("gare-d-austerlitz", "Gare d'Austerlitz", 48.8421, 2.3658, ["5","10"]),
  s("saint-marcel", "Saint-Marcel", 48.8392, 2.3565, ["5"]),
  s("campo-formio", "Campo-Formio", 48.8364, 2.3550, ["5"]),
  s("place-d-italie", "Place d'Italie", 48.8312, 2.3554, ["5","6","7"]),

  // ─── Ligne 6 (Charles de Gaulle—Étoile → Nation) ────────────────────────────
  // cdg-etoile déjà déclaré
  s("kleber", "Kléber", 48.8714, 2.2935, ["6"]),
  s("boissiere", "Boissière", 48.8674, 2.2899, ["6"]),
  s("trocadero", "Trocadéro", 48.8634, 2.2879, ["6","9"]),
  s("passy", "Passy", 48.8576, 2.2845, ["6"]),
  s("bir-hakeim", "Bir-Hakeim", 48.8540, 2.2891, ["6"]),
  s("dupleix", "Dupleix", 48.8506, 2.2966, ["6"]),
  s("la-motte-picquet-grenelle", "La Motte-Picquet—Grenelle", 48.8477, 2.2989, ["6","8","10"]),
  s("cambronne", "Cambronne", 48.8475, 2.3055, ["6"]),
  s("sevres-lecourbe", "Sèvres—Lecourbe", 48.8455, 2.3094, ["6"]),
  s("pasteur", "Pasteur", 48.8421, 2.3128, ["6","12"]),
  // montparnasse-bienvenue déjà déclaré
  s("edgar-quinet", "Edgar Quinet", 48.8409, 2.3266, ["6"]),
  // raspail / denfert déjà déclarés
  s("saint-jacques", "Saint-Jacques", 48.8329, 2.3370, ["6"]),
  s("glaciere", "Glacière", 48.8319, 2.3438, ["6"]),
  s("corvisart", "Corvisart", 48.8312, 2.3505, ["6"]),
  // place-d-italie déjà déclaré
  s("nationale", "Nationale", 48.8307, 2.3623, ["6"]),
  s("chevaleret", "Chevaleret", 48.8341, 2.3672, ["6"]),
  s("quai-de-la-gare", "Quai de la Gare", 48.8374, 2.3697, ["6"]),
  s("bercy", "Bercy", 48.8407, 2.3791, ["6","14"]),
  s("dugommier", "Dugommier", 48.8429, 2.3886, ["6"]),
  s("daumesnil", "Daumesnil", 48.8398, 2.3970, ["6","8"]),
  s("bel-air", "Bel-Air", 48.8423, 2.4007, ["6"]),
  s("picpus", "Picpus", 48.8451, 2.4012, ["6"]),
  // nation déjà déclaré

  // ─── Ligne 7 (La Courneuve → Mairie d'Ivry, branche principale) ─────────────
  s("la-courneuve-8-mai-1945", "La Courneuve—8 Mai 1945", 48.9183, 2.4147, ["7"]),
  s("fort-d-aubervilliers", "Fort d'Aubervilliers", 48.9126, 2.4019, ["7"]),
  s("aubervilliers-pantin-4-chemins", "Aubervilliers—Pantin—Quatre Chemins", 48.9036, 2.3893, ["7"]),
  s("porte-de-la-villette", "Porte de la Villette", 48.8973, 2.3851, ["7"]),
  s("corentin-cariou", "Corentin Cariou", 48.8918, 2.3839, ["7"]),
  s("crimee", "Crimée", 48.8884, 2.3795, ["7"]),
  s("riquet", "Riquet", 48.8858, 2.3747, ["7"]),
  // stalingrad déjà déclaré
  s("louis-blanc", "Louis Blanc", 48.8810, 2.3651, ["7","7bis"]),
  s("chateau-landon", "Château-Landon", 48.8794, 2.3636, ["7"]),
  // gare-de-l-est déjà déclaré
  s("poissonniere", "Poissonnière", 48.8770, 2.3486, ["7"]),
  s("cadet", "Cadet", 48.8763, 2.3434, ["7"]),
  s("le-peletier", "Le Peletier", 48.8753, 2.3387, ["7"]),
  s("chaussee-d-antin-la-fayette", "Chaussée d'Antin—La Fayette", 48.8730, 2.3325, ["7","9"]),
  // opera déjà déclaré
  s("pyramides", "Pyramides", 48.8657, 2.3346, ["7","14"]),
  // palais-royal déjà déclaré
  s("pont-neuf", "Pont Neuf", 48.8588, 2.3416, ["7"]),
  // chatelet déjà déclaré
  s("pont-marie", "Pont Marie", 48.8537, 2.3565, ["7"]),
  s("sully-morland", "Sully-Morland", 48.8517, 2.3622, ["7"]),
  s("jussieu", "Jussieu", 48.8462, 2.3548, ["7","10"]),
  s("place-monge", "Place Monge", 48.8421, 2.3513, ["7"]),
  s("censier-daubenton", "Censier-Daubenton", 48.8400, 2.3520, ["7"]),
  s("les-gobelins", "Les Gobelins", 48.8350, 2.3525, ["7"]),
  // place-d-italie déjà déclaré
  s("tolbiac", "Tolbiac", 48.8266, 2.3593, ["7"]),
  s("maison-blanche", "Maison Blanche", 48.8217, 2.3590, ["7"]),
  s("porte-d-italie", "Porte d'Italie", 48.8181, 2.3597, ["7"]),
  s("porte-de-choisy", "Porte de Choisy", 48.8181, 2.3651, ["7"]),
  s("porte-d-ivry", "Porte d'Ivry", 48.8180, 2.3704, ["7"]),
  s("pierre-et-marie-curie", "Pierre et Marie Curie", 48.8159, 2.3782, ["7"]),
  s("mairie-d-ivry", "Mairie d'Ivry", 48.8125, 2.3839, ["7"]),
  // branche Villejuif (modélisée via line.branches)
  s("le-kremlin-bicetre", "Le Kremlin-Bicêtre", 48.8120, 2.3576, ["7"]),
  s("villejuif-leo-lagrange", "Villejuif—Léo Lagrange", 48.8076, 2.3623, ["7"]),
  s("villejuif-paul-vaillant-couturier", "Villejuif—Paul Vaillant-Couturier", 48.8043, 2.3661, ["7"]),
  s("villejuif-louis-aragon", "Villejuif—Louis Aragon", 48.7884, 2.3692, ["7"]),

  // ─── Ligne 7bis (Louis Blanc → Pré Saint-Gervais) ───────────────────────────
  // louis-blanc / jaures déjà déclarés
  s("bolivar", "Bolivar", 48.8809, 2.3743, ["7bis"]),
  s("buttes-chaumont", "Buttes Chaumont", 48.8794, 2.3819, ["7bis"]),
  s("botzaris", "Botzaris", 48.8800, 2.3884, ["7bis"]),
  s("place-des-fetes", "Place des Fêtes", 48.8771, 2.3908, ["7bis","11"]),
  s("pre-saint-gervais", "Pré Saint-Gervais", 48.8810, 2.3982, ["7bis"]),
  s("danube", "Danube", 48.8836, 2.3950, ["7bis"]),

  // ─── Ligne 8 (Balard → Pointe du Lac) ───────────────────────────────────────
  s("balard", "Balard", 48.8366, 2.2784, ["8"]),
  s("lourmel", "Lourmel", 48.8385, 2.2856, ["8"]),
  s("boucicaut", "Boucicaut", 48.8410, 2.2925, ["8"]),
  s("felix-faure", "Félix Faure", 48.8428, 2.2978, ["8"]),
  s("commerce", "Commerce", 48.8456, 2.2949, ["8"]),
  // la-motte-picquet-grenelle déjà déclaré
  s("ecole-militaire", "École Militaire", 48.8546, 2.3060, ["8"]),
  s("la-tour-maubourg", "La Tour-Maubourg", 48.8602, 2.3094, ["8"]),
  s("invalides", "Invalides", 48.8606, 2.3146, ["8","13"]),
  // concorde déjà déclaré
  s("madeleine", "Madeleine", 48.8702, 2.3243, ["8","12","14"]),
  // opera déjà déclaré
  s("richelieu-drouot", "Richelieu—Drouot", 48.8717, 2.3389, ["8","9"]),
  s("grands-boulevards", "Grands Boulevards", 48.8716, 2.3447, ["8","9"]),
  s("bonne-nouvelle", "Bonne Nouvelle", 48.8704, 2.3486, ["8","9"]),
  // strasbourg-saint-denis déjà déclaré
  s("filles-du-calvaire", "Filles du Calvaire", 48.8636, 2.3654, ["8"]),
  s("saint-sebastien-froissart", "Saint-Sébastien—Froissart", 48.8606, 2.3658, ["8"]),
  s("chemin-vert", "Chemin Vert", 48.8568, 2.3686, ["8"]),
  // bastille déjà déclaré
  s("ledru-rollin", "Ledru-Rollin", 48.8513, 2.3771, ["8"]),
  s("faidherbe-chaligny", "Faidherbe—Chaligny", 48.8505, 2.3845, ["8"]),
  // reuilly-diderot déjà déclaré
  s("montgallet", "Montgallet", 48.8438, 2.3902, ["8"]),
  // daumesnil déjà déclaré
  s("michel-bizot", "Michel Bizot", 48.8369, 2.4083, ["8"]),
  s("porte-doree", "Porte Dorée", 48.8350, 2.4128, ["8"]),
  s("porte-de-charenton", "Porte de Charenton", 48.8323, 2.4143, ["8"]),
  s("liberte", "Liberté", 48.8225, 2.4147, ["8"]),
  s("charenton-ecoles", "Charenton—Écoles", 48.8201, 2.4143, ["8"]),
  s("ecole-veterinaire-maisons-alfort", "École Vétérinaire de Maisons-Alfort", 48.8138, 2.4239, ["8"]),
  s("maisons-alfort-stade", "Maisons-Alfort—Stade", 48.8093, 2.4286, ["8"]),
  s("maisons-alfort-les-juilliottes", "Maisons-Alfort—Les Juilliottes", 48.7975, 2.4406, ["8"]),
  s("creteil-l-echat", "Créteil—L'Échat", 48.7898, 2.4513, ["8"]),
  s("creteil-universite", "Créteil—Université", 48.7843, 2.4548, ["8"]),
  s("creteil-prefecture", "Créteil—Préfecture", 48.7798, 2.4567, ["8"]),
  s("pointe-du-lac", "Pointe du Lac", 48.7702, 2.4640, ["8"]),

  // ─── Ligne 9 (Pont de Sèvres → Mairie de Montreuil) ─────────────────────────
  s("pont-de-sevres", "Pont de Sèvres", 48.8298, 2.2306, ["9"]),
  s("billancourt", "Billancourt", 48.8329, 2.2387, ["9"]),
  s("marcel-sembat", "Marcel Sembat", 48.8366, 2.2455, ["9"]),
  s("porte-de-saint-cloud", "Porte de Saint-Cloud", 48.8395, 2.2533, ["9"]),
  s("exelmans", "Exelmans", 48.8426, 2.2607, ["9"]),
  s("michel-ange-molitor", "Michel-Ange—Molitor", 48.8470, 2.2622, ["9","10"]),
  s("michel-ange-auteuil", "Michel-Ange—Auteuil", 48.8506, 2.2666, ["9","10"]),
  s("jasmin", "Jasmin", 48.8537, 2.2700, ["9"]),
  s("ranelagh", "Ranelagh", 48.8566, 2.2737, ["9"]),
  s("la-muette", "La Muette", 48.8597, 2.2785, ["9"]),
  s("rue-de-la-pompe", "Rue de la Pompe", 48.8628, 2.2787, ["9"]),
  // trocadero déjà déclaré
  s("iena", "Iéna", 48.8645, 2.2972, ["9"]),
  s("alma-marceau", "Alma—Marceau", 48.8645, 2.3013, ["9"]),
  // franklin-d-roosevelt déjà déclaré
  s("saint-philippe-du-roule", "Saint-Philippe du Roule", 48.8736, 2.3110, ["9"]),
  s("miromesnil", "Miromesnil", 48.8746, 2.3155, ["9","13"]),
  s("saint-augustin", "Saint-Augustin", 48.8744, 2.3221, ["9"]),
  // havre-caumartin déjà déclaré
  // chaussee-d-antin déjà déclaré
  // richelieu-drouot déjà déclaré
  // grands-boulevards déjà déclaré
  // bonne-nouvelle déjà déclaré
  // strasbourg-saint-denis déjà déclaré
  // republique déjà déclaré
  // oberkampf déjà déclaré
  s("saint-ambroise", "Saint-Ambroise", 48.8593, 2.3760, ["9"]),
  s("voltaire", "Voltaire", 48.8568, 2.3815, ["9"]),
  s("charonne", "Charonne", 48.8541, 2.3853, ["9"]),
  s("rue-des-boulets", "Rue des Boulets", 48.8515, 2.3905, ["9"]),
  // nation déjà déclaré
  s("buzenval", "Buzenval", 48.8533, 2.4031, ["9"]),
  s("maraichers", "Maraîchers", 48.8568, 2.4060, ["9"]),
  s("porte-de-montreuil", "Porte de Montreuil", 48.8591, 2.4115, ["9"]),
  s("robespierre", "Robespierre", 48.8613, 2.4202, ["9"]),
  s("croix-de-chavaux", "Croix de Chavaux", 48.8607, 2.4307, ["9"]),
  s("mairie-de-montreuil", "Mairie de Montreuil", 48.8617, 2.4413, ["9"]),

  // ─── Ligne 10 (Boulogne—Pont de Saint-Cloud → Gare d'Austerlitz) ────────────
  s("boulogne-pont-de-saint-cloud", "Boulogne—Pont de Saint-Cloud", 48.8413, 2.2289, ["10"]),
  s("boulogne-jean-jaures", "Boulogne—Jean Jaurès", 48.8413, 2.2384, ["10"]),
  s("porte-d-auteuil", "Porte d'Auteuil", 48.8479, 2.2581, ["10"]),
  // michel-ange-auteuil déjà déclaré
  // michel-ange-molitor déjà déclaré
  s("chardon-lagache", "Chardon-Lagache", 48.8454, 2.2674, ["10"]),
  s("mirabeau", "Mirabeau", 48.8462, 2.2740, ["10"]),
  s("javel-andre-citroen", "Javel—André Citroën", 48.8467, 2.2785, ["10"]),
  s("charles-michels", "Charles Michels", 48.8485, 2.2867, ["10"]),
  s("avenue-emile-zola", "Avenue Émile Zola", 48.8463, 2.2944, ["10"]),
  // la-motte-picquet-grenelle déjà déclaré
  s("segur", "Ségur", 48.8473, 2.3107, ["10"]),
  s("duroc", "Duroc", 48.8463, 2.3174, ["10","13"]),
  s("vaneau", "Vaneau", 48.8487, 2.3197, ["10"]),
  s("sevres-babylone", "Sèvres—Babylone", 48.8516, 2.3265, ["10","12"]),
  s("mabillon", "Mabillon", 48.8527, 2.3349, ["10"]),
  // odeon déjà déclaré
  s("cluny-la-sorbonne", "Cluny—La Sorbonne", 48.8508, 2.3437, ["10"]),
  s("maubert-mutualite", "Maubert—Mutualité", 48.8499, 2.3492, ["10"]),
  s("cardinal-lemoine", "Cardinal Lemoine", 48.8470, 2.3514, ["10"]),
  // jussieu déjà déclaré
  // gare-d-austerlitz déjà déclaré

  // ─── Ligne 11 (Châtelet → Mairie des Lilas) ─────────────────────────────────
  // chatelet / hotel-de-ville déjà déclarés
  s("rambuteau", "Rambuteau", 48.8616, 2.3528, ["11"]),
  // arts-et-metiers / republique déjà déclarés
  s("goncourt", "Goncourt", 48.8702, 2.3705, ["11"]),
  // belleville déjà déclaré
  s("pyrenees", "Pyrénées", 48.8740, 2.3852, ["11"]),
  s("jourdain", "Jourdain", 48.8763, 2.3897, ["11"]),
  // place-des-fetes déjà déclaré
  s("telegraphe", "Télégraphe", 48.8763, 2.3980, ["11"]),
  // porte-des-lilas déjà déclaré
  s("mairie-des-lilas", "Mairie des Lilas", 48.8801, 2.4150, ["11"]),

  // ─── Ligne 12 (Front Populaire → Mairie d'Issy) ─────────────────────────────
  s("front-populaire", "Front Populaire", 48.9024, 2.3702, ["12"]),
  s("aime-cesaire", "Aimé Césaire", 48.8987, 2.3654, ["12"]),
  s("porte-de-la-chapelle", "Porte de la Chapelle", 48.8980, 2.3597, ["12"]),
  s("marx-dormoy", "Marx Dormoy", 48.8923, 2.3589, ["12"]),
  // marcadet-poissonniers déjà déclaré
  s("jules-joffrin", "Jules Joffrin", 48.8896, 2.3431, ["12"]),
  s("lamarck-caulaincourt", "Lamarck—Caulaincourt", 48.8893, 2.3382, ["12"]),
  s("abbesses", "Abbesses", 48.8845, 2.3387, ["12"]),
  // pigalle déjà déclaré
  s("saint-georges", "Saint-Georges", 48.8790, 2.3382, ["12"]),
  s("notre-dame-de-lorette", "Notre-Dame-de-Lorette", 48.8767, 2.3375, ["12"]),
  s("trinite-d-estienne-d-orves", "Trinité—d'Estienne d'Orves", 48.8763, 2.3322, ["12"]),
  // saint-lazare / madeleine / concorde déjà déclarés
  s("assemblee-nationale", "Assemblée Nationale", 48.8606, 2.3211, ["12"]),
  s("solferino", "Solférino", 48.8580, 2.3245, ["12"]),
  s("rue-du-bac", "Rue du Bac", 48.8559, 2.3265, ["12"]),
  // sevres-babylone déjà déclaré
  s("rennes", "Rennes", 48.8478, 2.3293, ["12"]),
  s("notre-dame-des-champs", "Notre-Dame-des-Champs", 48.8443, 2.3267, ["12"]),
  // montparnasse-bienvenue / pasteur déjà déclarés
  s("falguiere", "Falguière", 48.8424, 2.3163, ["12"]),
  s("volontaires", "Volontaires", 48.8398, 2.3082, ["12"]),
  s("vaugirard", "Vaugirard", 48.8408, 2.3008, ["12"]),
  s("convention", "Convention", 48.8358, 2.3014, ["12"]),
  s("porte-de-versailles", "Porte de Versailles", 48.8326, 2.2880, ["12"]),
  s("corentin-celton", "Corentin Celton", 48.8281, 2.2887, ["12"]),
  s("mairie-d-issy", "Mairie d'Issy", 48.8246, 2.2747, ["12"]),

  // ─── Ligne 13 (Saint-Denis → Châtillon-Montrouge, branche principale) ───────
  s("saint-denis-universite", "Saint-Denis—Université", 48.9461, 2.3641, ["13"]),
  s("basilique-de-saint-denis", "Basilique de Saint-Denis", 48.9358, 2.3568, ["13"]),
  s("carrefour-pleyel", "Carrefour Pleyel", 48.9183, 2.3470, ["13"]),
  s("mairie-de-saint-ouen", "Mairie de Saint-Ouen", 48.9111, 2.3338, ["13","14"]),
  s("garibaldi", "Garibaldi", 48.9051, 2.3324, ["13"]),
  s("porte-de-saint-ouen", "Porte de Saint-Ouen", 48.8965, 2.3284, ["13"]),
  s("guy-moquet", "Guy Môquet", 48.8916, 2.3267, ["13"]),
  s("la-fourche", "La Fourche", 48.8870, 2.3266, ["13"]),
  // place-de-clichy déjà déclaré
  s("liege", "Liège", 48.8800, 2.3253, ["13"]),
  // saint-lazare / miromesnil / champs-elysees-clemenceau / invalides déjà déclarés
  s("varenne", "Varenne", 48.8554, 2.3157, ["13"]),
  s("saint-francois-xavier", "Saint-François-Xavier", 48.8514, 2.3149, ["13"]),
  // duroc / montparnasse-bienvenue déjà déclarés
  s("gaite", "Gaîté", 48.8376, 2.3216, ["13"]),
  s("pernety", "Pernety", 48.8330, 2.3179, ["13"]),
  s("plaisance", "Plaisance", 48.8294, 2.3151, ["13"]),
  s("porte-de-vanves", "Porte de Vanves", 48.8244, 2.3041, ["13"]),
  s("malakoff-plateau-de-vanves", "Malakoff—Plateau de Vanves", 48.8197, 2.3009, ["13"]),
  s("malakoff-rue-etienne-dolet", "Malakoff—Rue Étienne Dolet", 48.8155, 2.3000, ["13"]),
  s("chatillon-montrouge", "Châtillon-Montrouge", 48.8108, 2.3014, ["13"]),
  // branche Asnières-Gennevilliers (modélisée via line.branches)
  s("brochant", "Brochant", 48.8920, 2.3197, ["13"]),
  s("porte-de-clichy", "Porte de Clichy", 48.8949, 2.3140, ["13","14"]),
  s("mairie-de-clichy", "Mairie de Clichy", 48.9034, 2.3057, ["13"]),
  s("gabriel-peri", "Gabriel Péri", 48.9163, 2.2918, ["13"]),
  s("les-agnettes", "Les Agnettes", 48.9223, 2.2858, ["13"]),
  s("asnieres-gennevilliers", "Asnières—Gennevilliers—Les Courtilles", 48.9290, 2.2929, ["13"]),

  // ─── Ligne 14 (Saint-Lazare → Olympiades, version 9 stations) ───────────────
  // saint-lazare / madeleine / pyramides / chatelet / gare-de-lyon / bercy déjà déclarés
  s("cour-saint-emilion", "Cour Saint-Émilion", 48.8329, 2.3863, ["14"]),
  s("bibliotheque-francois-mitterrand", "Bibliothèque François Mitterrand", 48.8302, 2.3760, ["14"]),
  s("olympiades", "Olympiades", 48.8275, 2.3678, ["14"]),
];

/** Map station id → Station, pour accès O(1). */
export const stationsById: Record<string, Station> = Object.fromEntries(
  stations.map((st) => [st.id, st])
);

/** Toutes les stations qui passent par une ligne donnée. */
export function stationsOnLine(lineId: LineId): Station[] {
  return stations.filter((st) => st.lines.includes(lineId));
}
