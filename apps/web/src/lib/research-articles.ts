/**
 * Static research library articles (CONTENT-4).
 * Educational / literature-oriented notes for qualified researchers — not medical advice.
 */

export type ResearchSection = {
  heading: string;
  paragraphs: string[];
  bullets?: string[];
};

export type ResearchArticle = {
  slug: string;
  title: string;
  excerpt: string;
  category: string;
  readingTime: string;
  sections: ResearchSection[];
};

export const RESEARCH_ARTICLES: ResearchArticle[] = [
  {
    slug: 'bpc-157-repair-signalling',
    title: 'BPC-157 & repair signalling',
    excerpt:
      'Extracellular matrix, angiogenesis, and focal-adhesion themes common in preclinical peptide work.',
    category: 'Peptide briefs',
    readingTime: '6 min',
    sections: [
      {
        heading: 'Research framing',
        paragraphs: [
          'BPC-157 is frequently discussed in preclinical literature around tissue-repair signalling, extracellular-matrix remodelling, and angiogenesis-adjacent readouts. Catalog entries should be treated as analytical materials for controlled laboratory models — not as therapeutic guidance.',
          'When designing experiments, match controls to your model, document lot identity via COA where published, and avoid assuming interchangeability with related sequences.',
        ],
      },
      {
        heading: 'Themes in the literature',
        paragraphs: [
          'Published work often clusters around matrix biology, endothelial behaviour, and injury-model endpoints. Interpretations vary by assay system, dose framing in vitro, and species context.',
        ],
        bullets: [
          'Focal-adhesion and cytoskeletal signalling readouts in cell models',
          'Angiogenesis-related markers in selected preclinical designs',
          'Need for orthogonal identity confirmation (HPLC / MS) on research lots',
        ],
      },
      {
        heading: 'Laboratory practice notes',
        paragraphs: [
          'Store lyophilized material per product guidance. Reconstitute with appropriate solvent systems for your assay, aliquot to limit freeze–thaw cycles, and record batch numbers in lab notebooks for reproducibility.',
        ],
      },
    ],
  },
  {
    slug: 'tb-500-thymosin-beta-4',
    title: 'TB-500 / thymosin beta-4 class',
    excerpt:
      'Actin dynamics, migration assays, and cytoskeletal readouts — how the literature frames fragments.',
    category: 'Peptide briefs',
    readingTime: '5 min',
    sections: [
      {
        heading: 'Research framing',
        paragraphs: [
          'TB-500 is commonly referenced as a synthetic fragment associated with the thymosin beta-4 family. Literature discussions emphasize actin-sequestering biology, cell migration assays, and cytoskeletal organization in controlled experimental systems.',
          'Treat each catalog SKU as its own analytical object. Sequence length, salt form, and purity claims should be verified against the COA before inclusion in peer-reviewed protocols.',
        ],
      },
      {
        heading: 'Experimental angles',
        paragraphs: [
          'Investigators often pair cytoskeletal imaging with migration / invasion assays. Results are highly context-dependent; do not generalize across cell types without appropriate controls.',
        ],
        bullets: [
          'Actin dynamics and wound-closure style in vitro assays',
          'Distinction between full-length thymosin beta-4 and fragment tools',
          'Lot-level documentation for IBC or core-facility submissions',
        ],
      },
      {
        heading: 'Procurement checklist',
        paragraphs: [
          'Confirm purity and identity documents, note storage temperature, and keep reconstitution records with solvent lot numbers. Pair readings with product pages in the MCPFAC catalog.',
        ],
      },
    ],
  },
  {
    slug: 'glp-1-receptor-pharmacology',
    title: 'GLP-1 receptor pharmacology',
    excerpt:
      'Metabolic incretin pathways, gastric motility, and energy-balance models in controlled studies.',
    category: 'Peptide briefs',
    readingTime: '7 min',
    sections: [
      {
        heading: 'Research framing',
        paragraphs: [
          'GLP-1–class research peptides differ by sequence, linker chemistry, and receptor bias. Each catalogue entry should be evaluated as a distinct analytical tool for metabolic and incretin-pathway models.',
          'This brief is literature-oriented and educational. It is not dosing, clinical, or therapeutic advice.',
        ],
      },
      {
        heading: 'Common study themes',
        paragraphs: [
          'Preclinical and in vitro work often explores receptor engagement, downstream second-messenger readouts, and energy-balance models under tightly controlled conditions.',
        ],
        bullets: [
          'Receptor pharmacology and pathway-biased signalling questions',
          'Assay design sensitivity to peptide stability and aggregation',
          'Importance of orthogonal identity methods on research lots',
        ],
      },
      {
        heading: 'Catalog relationships',
        paragraphs: [
          'Avoid unintended duplication when combining related SKUs or premixed materials. Map each active to its COA and keep institutional receiving records aligned with experimental notebooks.',
        ],
      },
    ],
  },
  {
    slug: 'ghk-cu-copper-peptides',
    title: 'GHK-Cu & copper peptides',
    excerpt:
      'Copper-binding motifs, extracellular matrix biology, and regeneration-adjacent in-vitro angles.',
    category: 'Peptide briefs',
    readingTime: '5 min',
    sections: [
      {
        heading: 'Research framing',
        paragraphs: [
          'GHK-Cu is a copper-binding peptide motif studied in extracellular-matrix and regeneration-adjacent in vitro contexts. Do not assume interchangeability with non-copper GHK-only sequences in binding or stability experiments.',
          'Confirm copper complexation claims against lot documentation when available, and control for free copper in assay buffers where relevant.',
        ],
      },
      {
        heading: 'Laboratory considerations',
        paragraphs: [
          'Copper-peptide work often requires careful buffer selection, metal contamination controls, and clear documentation of peptide-to-metal stoichiometry assumptions.',
        ],
        bullets: [
          'Matrix-biology and gene-expression readouts in cell models',
          'Stability and speciation questions unique to metal-binding peptides',
          'COA / HPLC verification before protocol lock-in',
        ],
      },
      {
        heading: 'Next steps',
        paragraphs: [
          'Browse related catalog SKUs, download available batch documents, and pair this brief with peptide reconstitution guidance before wet-lab work.',
        ],
      },
    ],
  },
  {
    slug: 'peptide-basics-reconstitution',
    title: 'Peptide basics: reconstitution & storage',
    excerpt:
      'Practical laboratory notes on reconstitution, aliquoting, and storage for lyophilized research peptides.',
    category: 'Research guides',
    readingTime: '8 min',
    sections: [
      {
        heading: 'Before you reconstitute',
        paragraphs: [
          'Read the product page for solvent recommendations, storage temperature, and purity documentation. Confirm the vial is lyophilized research material intended for laboratory use only.',
          'Work in a clean area, wear appropriate PPE, and record lot numbers before opening.',
        ],
      },
      {
        heading: 'General reconstitution workflow',
        paragraphs: [
          'Allow the vial to reach ambient temperature if stored cold. Add solvent slowly down the vial wall, swirl gently — avoid vigorous shaking that can foam or denature sensitive sequences. Transfer into labelled aliquots promptly.',
        ],
        bullets: [
          'Use bacteriostatic water or other solvents only as appropriate for your assay design',
          'Calculate concentration from peptide mass and solvent volume before aliquoting',
          'Minimize freeze–thaw cycles; store aliquots per product guidance',
        ],
      },
      {
        heading: 'Documentation & safety',
        paragraphs: [
          'Keep MSDS accessible for your lab group. Dispose of unused materials according to institutional chemical-waste procedures. For interactive concentration planning, use the peptide reconstitution calculator at /calculator.',
          'MCPFAC BIOTECH materials are for research and R&D use only — not for human or animal consumption.',
        ],
      },
    ],
  },
];

export function getResearchArticle(slug: string): ResearchArticle | undefined {
  return RESEARCH_ARTICLES.find((article) => article.slug === slug);
}

export function getAllResearchSlugs(): string[] {
  return RESEARCH_ARTICLES.map((article) => article.slug);
}
