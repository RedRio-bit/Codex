import Link from "next/link";

const projects = [
  {
    title: "Syntropic Atlas",
    description:
      "Un archivio vivo di pattern generativi che mescola brutalismo tipografico e geometrie neon.",
    tags: ["creative coding", "webGL", "data-poesia"],
    link: "https://example.com/atlas",
  },
  {
    title: "Hyperbody Studio",
    description:
      "Installazione digitale che unisce motion design, architetture sonore e interazioni tattili.",
    tags: ["immersive", "sound design", "experiential"],
    link: "https://example.com/hyperbody",
  },
  {
    title: "Radical Library",
    description:
      "Un sistema di lettura curatoriale per riviste indipendenti, con layout modulare e micro-animazioni crude.",
    tags: ["editorial", "UX research", "accessibility"],
    link: "https://example.com/library",
  },
  {
    title: "Off-Grid Identities",
    description:
      "Serie di identità visive per festival sonici, guidate da algoritmi di distorsione controllata.",
    tags: ["brand systems", "algoritmi", "motion"],
    link: "https://example.com/offgrid",
  },
];

const principles = [
  "Brutalismo come linguaggio sincero: blocchi netti, ritmo materico, zero decorazioni inutili.",
  "Modernità radicale: tipografia audace, spazi drammatici, interazioni che restano nella memoria.",
  "Accesso totale: performance, leggibilità e cura per chi naviga da qualsiasi dispositivo.",
  "Collaborazioni che fanno scintille: dialoghi con artisti, musei, brand e istituzioni curiose.",
];

const process = [
  {
    title: "Ricerca Obliqua",
    detail: "Mappe visive, suoni, materiali. Ogni progetto parte con immersioni e sketch multisensoriali.",
  },
  {
    title: "Progettazione Brut",
    detail: "Griglie ferree, cromie acide, test continui su tipografia e micro-interazioni responsivi.",
  },
  {
    title: "Assemblaggio Vivo",
    detail: "Code, prototipi, live sessions con il cliente. Ogni release è un atto performativo.",
  },
];

export default function Home() {
  return (
    <main className="page">
      <header className="hero">
        <div className="badge">Portfolio 2024 · Brutal &amp; Bold</div>
        <h1>
          Creazioni digitali <span className="accent">brutaliste</span> con cuore
          contemporaneo.
        </h1>
        <p className="lede">
          Siti, installazioni e identità visive che parlano la lingua dei musei,
          dei club e delle gallerie. Un portfolio come poster urbano: tagliente,
          luminoso, irresistibilmente tattile.
        </p>
        <div className="hero-actions">
          <Link className="btn primary" href="#projects">
            Esplora le opere
          </Link>
          <Link className="btn ghost" href="#contact">
            Proponi una collaborazione
          </Link>
        </div>
        <div className="hero-grid">
          <div className="stat">
            <p className="stat-label">Focus</p>
            <p className="stat-value">Arte digitale · Identità · Web immersivi</p>
          </div>
          <div className="stat">
            <p className="stat-label">Mood</p>
            <p className="stat-value">Spigoli vivi, colori acidi, modernismo affettuoso</p>
          </div>
          <div className="stat">
            <p className="stat-label">Disponibilità</p>
            <p className="stat-value">Nuovi progetti da ottobre</p>
          </div>
        </div>
      </header>

      <section className="section" id="projects">
        <div className="section-head">
          <h2>Selezione di opere</h2>
          <p>
            Ogni progetto è una scultura digitale: tipografia estrema, griglie
            rigide, pixel che vibrano. Il brut diventa lusso quando la cura è
            maniacale.
          </p>
        </div>
        <div className="project-grid">
          {projects.map((project) => (
            <article className="card" key={project.title}>
              <div className="card-top">
                <p className="card-eyebrow">Opera</p>
                <a className="card-link" href={project.link}>
                  visita ↗
                </a>
              </div>
              <h3>{project.title}</h3>
              <p className="card-body">{project.description}</p>
              <div className="tag-row">
                {project.tags.map((tag) => (
                  <span className="tag" key={tag}>
                    {tag}
                  </span>
                ))}
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="section manifesto">
        <div className="section-head">
          <h2>Manifesto brutale</h2>
          <p>
            Principi scolpiti nel cemento, lucidati con la tecnologia. Ogni
            riga è un impegno creativo.
          </p>
        </div>
        <ul className="manifesto-list">
          {principles.map((line) => (
            <li key={line}>{line}</li>
          ))}
        </ul>
      </section>

      <section className="section process">
        <div className="section-head">
          <h2>Processo</h2>
          <p>
            Una corsa ad alta tensione tra ricerca artistica e prototipazione
            immediata.
          </p>
        </div>
        <div className="process-grid">
          {process.map((step, index) => (
            <div className="step" key={step.title}>
              <span className="step-number">0{index + 1}</span>
              <div>
                <h3>{step.title}</h3>
                <p>{step.detail}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="section contact" id="contact">
        <div className="section-head">
          <h2>Parliamone</h2>
          <p>
            Commissioni, residenze artistiche, workshop: se hai una visione
            radicale, costruiamola insieme.
          </p>
        </div>
        <div className="contact-grid">
          <div>
            <p className="label">Email</p>
            <a href="mailto:ciao@brutartist.studio" className="contact-link">
              ciao@brutartist.studio
            </a>
          </div>
          <div>
            <p className="label">Social</p>
            <div className="contact-row">
              <a href="https://instagram.com" className="contact-link">
                Instagram
              </a>
              <a href="https://dribbble.com" className="contact-link">
                Dribbble
              </a>
              <a href="https://www.behance.net" className="contact-link">
                Behance
              </a>
            </div>
          </div>
          <div>
            <p className="label">Newsletter</p>
            <p className="muted">
              Aggiornamenti su nuove installazioni, ricerche e release pubbliche.
            </p>
            <a className="btn primary small" href="https://example.com/newsletter">
              Iscriviti ora
            </a>
          </div>
        </div>
      </section>
    </main>
  );
}
