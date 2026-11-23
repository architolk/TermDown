import fs from "fs";
import path from "path";
import matter from "gray-matter";
import { DataFactory, Writer } from "n3";
import yaml from "js-yaml";

const { namedNode, literal, quad } = DataFactory;

const CONCEPT_BASE = "https://example.org/concept/";
const SKOS = "http://www.w3.org/2004/02/skos/core#";
const RDF = "http://www.w3.org/1999/02/22-rdf-syntax-ns#";

const CONCEPT_DIR = process.argv[2];

if (!CONCEPT_DIR) {
  console.error(
    "Usage: node process.js <concept-directory>"
  );
  process.exit(1);
}

const CONFIG = yaml.load(
  fs.readFileSync("mapping-nl.yaml", "utf8")
);

const writer = new Writer({
  prefixes: {
    skos: SKOS,
    rdf: RDF,
    ex: CONCEPT_BASE
  }
});

function expandCurie(curie) {

  const [prefix, local] = curie.split(":");

  const namespace =
    CONFIG.prefixes[prefix];

  if (!namespace) {
    throw new Error(
      `Unknown prefix: ${prefix}`
    );
  }

  return namespace + local;
}

function conceptUri(id) {
  return namedNode(CONCEPT_BASE + id);
}

function addLiteralProperty(subject, predicate, values) {

  if (!values) {
    return;
  }

  //
  // prefLabel: Legal effect
  //
  if (typeof values === "string") {

    writer.addQuad(
      subject,
      predicate,
      literal(values)
    );

    return;
  }

  //
  // altLabel:
  //   - term1
  //   - term2
  //
  if (Array.isArray(values)) {

    for (const value of values) {

      writer.addQuad(
        subject,
        predicate,
        literal(value)
      );
    }

    return;
  }

  //
  // prefLabel:
  //   en: Legal effect
  //   nl: Rechtsgevolg
  //
  for (const [lang, value] of Object.entries(values)) {

    if (Array.isArray(value)) {

      for (const item of value) {

        writer.addQuad(
          subject,
          predicate,
          literal(item, lang)
        );
      }

    } else {

      writer.addQuad(
        subject,
        predicate,
        literal(value, lang)
      );
    }
  }
}

function parseBody(body) {

  const headingPattern = /^#{1,6}\s+(.+?)\s*$/;

  const lines = body.split(/\r?\n/);

  const sections = [];

  let current = null;

  for (const line of lines) {

    const match = line.match(headingPattern);

    //
    // New section?
    //
    if (match) {

      if (current) {
        sections.push(current);
      }

      let heading = match[1].trim();
      let language = null;

      //
      // Definition (en)
      // Scope Note (nl)
      //
      const langMatch =
        heading.match(/^(.*?)\s*\(([a-zA-Z-]+)\)\s*$/);

      if (langMatch) {
        heading = langMatch[1].trim();

        language =
          langMatch[2]
            .split("-")
            .map((part, index) =>
              index === 0
                ? part.toLowerCase()
                : part.toUpperCase()
            )
            .join("-");
      }

      current = {
        title: heading,
        language,
        content: []
      };

      continue;
    }

    if (current) {
      current.content.push(line);
    }
  }

  //
  // Last section
  //
  if (current) {
    sections.push(current);
  }

  //
  // No headings at all:
  // treat entire body as definition
  //
  if (sections.length === 0) {

    const content = body.trim();

    if (!content) {
      return [];
    }

    return [
      {
        property: "skos:definition",
        language: null,
        content
      }
    ];
  }

  //
  // Convert sections
  //
  return sections
    .map(section => {

    const normalizedTitle =
      section.title
        .trim()
        .replace(/\s+/g, " ")
        .toLowerCase();

    const config =
      CONFIG.mappings[normalizedTitle];

    

      return {
        property: (config ? config.uri : null),
        language: section.language,
        content: section.content
          .join("\n")
          .trim()
      };

    })
    .filter(section =>
      section.property &&
      section.content
    );
}

for (const filename of fs.readdirSync(CONCEPT_DIR)) {

  if (!filename.endsWith(".md")) {
    continue;
  }

  const source = fs.readFileSync(
    path.join(CONCEPT_DIR, filename),
    "utf8"
  );

  const parsed = matter(source);

  const meta = parsed.data;
  const body = parsed.content.trim();

  if (!meta.id) {
    throw new Error(`${filename}: missing id`);
  }

  const concept = conceptUri(meta.id);

  //
  // rdf:type skos:Concept
  //
  writer.addQuad(
    concept,
    namedNode(RDF + "type"),
    namedNode(SKOS + "Concept")
  );

  for (const [key, value] of
        Object.entries(meta)) {

    const config =
      CONFIG.mappings[
        key
          .trim()
          .toLowerCase()
      ];

    if (!config) {
      continue;
    }

    const predicate =
      namedNode(
        expandCurie(config.uri)
      );

    switch (config.type) {

      case "literal":

        addLiteralProperty(
          concept,
          predicate,
          value
        );

        break;

      case "resource":

        for (const target of [].concat(value)) {

          writer.addQuad(
            concept,
            predicate,
            conceptUri(target)
          );
        }

        break;
    }
  }

  const bodySections = parseBody(body);

  for (const section of bodySections) {

    const predicate =
      namedNode(expandCurie(section.property));

    const object = section.language
        ? literal(section.content, section.language)
        : literal(section.content);

    writer.addQuad(
        concept,
        predicate,
        object
    );
  }

}

writer.end((error, result) => {

  if (error) {
    throw error;
  }

  fs.writeFileSync(
    "vocabulary.ttl",
    result,
    "utf8"
  );

  console.log("Generated vocabulary.ttl");
});
