import type { Line } from "./types";

/**
 * Définition des 16 lignes du métro parisien.
 * `stations` est l'ordre exact de la branche principale.
 * `branches` est utilisé pour les segments secondaires (lignes 7 et 13).
 */
export const lines: Line[] = [
  {
    id: "1",
    label: "Ligne 1",
    color: "#FFCD00",
    stations: [
      "la-defense","esplanade-de-la-defense","pont-de-neuilly","les-sablons",
      "porte-maillot","argentine","charles-de-gaulle-etoile","george-v",
      "franklin-d-roosevelt","champs-elysees-clemenceau","concorde","tuileries",
      "palais-royal-musee-du-louvre","louvre-rivoli","chatelet","hotel-de-ville",
      "saint-paul","bastille","gare-de-lyon","reuilly-diderot","nation",
      "porte-de-vincennes","saint-mande","berault","chateau-de-vincennes",
    ],
  },
  {
    id: "2",
    label: "Ligne 2",
    color: "#0064B0",
    stations: [
      "porte-dauphine","victor-hugo","charles-de-gaulle-etoile","ternes",
      "courcelles","monceau","villiers","rome","place-de-clichy","blanche",
      "pigalle","anvers","barbes-rochechouart","la-chapelle","stalingrad",
      "jaures","colonel-fabien","belleville","couronnes","menilmontant",
      "pere-lachaise","philippe-auguste","alexandre-dumas","avron","nation",
    ],
  },
  {
    id: "3",
    label: "Ligne 3",
    color: "#9F9825",
    stations: [
      "pont-de-levallois-becon","anatole-france","louise-michel",
      "porte-de-champerret","pereire","wagram","malesherbes","villiers","europe",
      "saint-lazare","havre-caumartin","opera","quatre-septembre","bourse",
      "sentier","reaumur-sebastopol","arts-et-metiers","temple","republique",
      "parmentier","rue-saint-maur","pere-lachaise","gambetta",
      "porte-de-bagnolet","gallieni",
    ],
  },
  {
    id: "3bis",
    label: "Ligne 3 bis",
    color: "#98D4E2",
    stations: ["gambetta","pelleport","saint-fargeau","porte-des-lilas"],
  },
  {
    id: "4",
    label: "Ligne 4",
    color: "#C04191",
    stations: [
      "porte-de-clignancourt","simplon","marcadet-poissonniers","chateau-rouge",
      "barbes-rochechouart","gare-du-nord","gare-de-l-est","chateau-d-eau",
      "strasbourg-saint-denis","reaumur-sebastopol","etienne-marcel","les-halles",
      "chatelet","cite","saint-michel","odeon","saint-germain-des-pres",
      "saint-sulpice","saint-placide","montparnasse-bienvenue","vavin","raspail",
      "denfert-rochereau","mouton-duvernet","alesia","porte-d-orleans",
      "mairie-de-montrouge","barbara","bagneux-lucie-aubrac",
    ],
  },
  {
    id: "5",
    label: "Ligne 5",
    color: "#F28E42",
    stations: [
      "bobigny-pablo-picasso","bobigny-pantin-raymond-queneau","eglise-de-pantin",
      "hoche","porte-de-pantin","ourcq","laumiere","jaures","stalingrad",
      "gare-du-nord","gare-de-l-est","jacques-bonsergent","republique","oberkampf",
      "richard-lenoir","breguet-sabin","bastille","quai-de-la-rapee",
      "gare-d-austerlitz","saint-marcel","campo-formio","place-d-italie",
    ],
  },
  {
    id: "6",
    label: "Ligne 6",
    color: "#83C491",
    stations: [
      "charles-de-gaulle-etoile","kleber","boissiere","trocadero","passy",
      "bir-hakeim","dupleix","la-motte-picquet-grenelle","cambronne",
      "sevres-lecourbe","pasteur","montparnasse-bienvenue","edgar-quinet",
      "raspail","denfert-rochereau","saint-jacques","glaciere","corvisart",
      "place-d-italie","nationale","chevaleret","quai-de-la-gare","bercy",
      "dugommier","daumesnil","bel-air","picpus","nation",
    ],
  },
  {
    id: "7",
    label: "Ligne 7",
    color: "#F3A4BA",
    stations: [
      "la-courneuve-8-mai-1945","fort-d-aubervilliers",
      "aubervilliers-pantin-4-chemins","porte-de-la-villette","corentin-cariou",
      "crimee","riquet","stalingrad","louis-blanc","chateau-landon",
      "gare-de-l-est","poissonniere","cadet","le-peletier",
      "chaussee-d-antin-la-fayette","opera","pyramides",
      "palais-royal-musee-du-louvre","pont-neuf","chatelet","pont-marie",
      "sully-morland","jussieu","place-monge","censier-daubenton","les-gobelins",
      "place-d-italie","tolbiac","maison-blanche","porte-d-italie",
      "porte-de-choisy","porte-d-ivry","pierre-et-marie-curie","mairie-d-ivry",
    ],
    branches: [
      {
        from: "maison-blanche",
        label: "Branche Villejuif",
        stations: [
          "le-kremlin-bicetre","villejuif-leo-lagrange",
          "villejuif-paul-vaillant-couturier","villejuif-louis-aragon",
        ],
      },
    ],
  },
  {
    id: "7bis",
    label: "Ligne 7 bis",
    color: "#83C491",
    stations: [
      "louis-blanc","jaures","bolivar","buttes-chaumont","botzaris",
      "place-des-fetes","pre-saint-gervais","danube",
    ],
  },
  {
    id: "8",
    label: "Ligne 8",
    color: "#CEADD2",
    stations: [
      "balard","lourmel","boucicaut","felix-faure","commerce",
      "la-motte-picquet-grenelle","ecole-militaire","la-tour-maubourg","invalides",
      "concorde","madeleine","opera","richelieu-drouot","grands-boulevards",
      "bonne-nouvelle","strasbourg-saint-denis","republique","filles-du-calvaire",
      "saint-sebastien-froissart","chemin-vert","bastille","ledru-rollin",
      "faidherbe-chaligny","reuilly-diderot","montgallet","daumesnil",
      "michel-bizot","porte-doree","porte-de-charenton","liberte",
      "charenton-ecoles","ecole-veterinaire-maisons-alfort","maisons-alfort-stade",
      "maisons-alfort-les-juilliottes","creteil-l-echat","creteil-universite",
      "creteil-prefecture","pointe-du-lac",
    ],
  },
  {
    id: "9",
    label: "Ligne 9",
    color: "#D5C900",
    stations: [
      "pont-de-sevres","billancourt","marcel-sembat","porte-de-saint-cloud",
      "exelmans","michel-ange-molitor","michel-ange-auteuil","jasmin","ranelagh",
      "la-muette","rue-de-la-pompe","trocadero","iena","alma-marceau",
      "franklin-d-roosevelt","saint-philippe-du-roule","miromesnil",
      "saint-augustin","havre-caumartin","chaussee-d-antin-la-fayette",
      "richelieu-drouot","grands-boulevards","bonne-nouvelle",
      "strasbourg-saint-denis","republique","oberkampf","saint-ambroise",
      "voltaire","charonne","rue-des-boulets","nation","buzenval","maraichers",
      "porte-de-montreuil","robespierre","croix-de-chavaux","mairie-de-montreuil",
    ],
  },
  {
    id: "10",
    label: "Ligne 10",
    color: "#E3B32A",
    stations: [
      "boulogne-pont-de-saint-cloud","boulogne-jean-jaures","porte-d-auteuil",
      "michel-ange-auteuil","michel-ange-molitor","chardon-lagache","mirabeau",
      "javel-andre-citroen","charles-michels","avenue-emile-zola",
      "la-motte-picquet-grenelle","segur","duroc","vaneau","sevres-babylone",
      "mabillon","odeon","cluny-la-sorbonne","maubert-mutualite",
      "cardinal-lemoine","jussieu","gare-d-austerlitz",
    ],
  },
  {
    id: "11",
    label: "Ligne 11",
    color: "#8D5E2A",
    stations: [
      "chatelet","hotel-de-ville","rambuteau","arts-et-metiers","republique",
      "goncourt","belleville","pyrenees","jourdain","place-des-fetes",
      "telegraphe","porte-des-lilas","mairie-des-lilas",
    ],
  },
  {
    id: "12",
    label: "Ligne 12",
    color: "#00814F",
    stations: [
      "front-populaire","aime-cesaire","porte-de-la-chapelle","marx-dormoy",
      "marcadet-poissonniers","jules-joffrin","lamarck-caulaincourt","abbesses",
      "pigalle","saint-georges","notre-dame-de-lorette",
      "trinite-d-estienne-d-orves","saint-lazare","madeleine","concorde",
      "assemblee-nationale","solferino","rue-du-bac","sevres-babylone","rennes",
      "notre-dame-des-champs","montparnasse-bienvenue","falguiere","pasteur",
      "volontaires","vaugirard","convention","porte-de-versailles",
      "corentin-celton","mairie-d-issy",
    ],
  },
  {
    id: "13",
    label: "Ligne 13",
    color: "#98D4E2",
    stations: [
      "saint-denis-universite","basilique-de-saint-denis","carrefour-pleyel",
      "mairie-de-saint-ouen","garibaldi","porte-de-saint-ouen","guy-moquet",
      "la-fourche","place-de-clichy","liege","saint-lazare","miromesnil",
      "champs-elysees-clemenceau","invalides","varenne","saint-francois-xavier",
      "duroc","montparnasse-bienvenue","gaite","pernety","plaisance",
      "porte-de-vanves","malakoff-plateau-de-vanves","malakoff-rue-etienne-dolet",
      "chatillon-montrouge",
    ],
    branches: [
      {
        from: "la-fourche",
        label: "Branche Asnières-Gennevilliers",
        stations: [
          "brochant","porte-de-clichy","mairie-de-clichy","gabriel-peri",
          "les-agnettes","asnieres-gennevilliers",
        ],
      },
    ],
  },
  {
    id: "14",
    label: "Ligne 14",
    color: "#662483",
    stations: [
      "saint-lazare","madeleine","pyramides","chatelet","gare-de-lyon","bercy",
      "cour-saint-emilion","bibliotheque-francois-mitterrand","olympiades",
    ],
  },
];

export const linesById: Record<string, (typeof lines)[number]> = Object.fromEntries(
  lines.map((l) => [l.id, l])
);
