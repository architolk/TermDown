# TermDown
A terminology definition (SKOS) flavoured markdown

## Introduction

Maintaining definition lists, taxonomies, thesauri is hard work. Specific tools exists to create such artefacts, but that requires specific tools. As you might want to exchange your artefact in an open standard like SKOS, you might want to use RDF and serialize in turtle or JSON-LD. But it is hard for non-technical people to write in turtle or JSON-LD. We need something easier.

People have used specific excel templates to create SKOS vocabularies. But that means using a proprietry format. And excel isn't very useful when you want to use a version control mechanism like git.

That's why we invented TermDown. TermDown is a vocabulary-flavoured markdown that can be used to describe concepts. It can directly be used with git version control and as such you can use any tool that you are familiar with for cooperation, managing changes, etc, etc.

TermDown is fully compatible with SKOS, but you might also use TermDown in other situations or extend TermDown to add your own specific properties.

## How it looks like

TermDown is easy: it is extendible in the sense that you can start with only few elements, and add more if you want more elaborate descriptions.

### A glossary: list of definitions

```
# Fiets

Een fiets is een voertuig met twee wielen en een stuur

# Voertuig

Een voertuig is een middel waarmee iets of iemand vervoerd kan worden van de ene plek naar een andere plek.
```

You can just have one file with all concepts. The title contains the prefered label, the text below the title its definition.

### Defining individual concepts

```
---
term:
- nl: fiets
- en: bicycle
related:
- voertuig
---
# Fiets

Een fiets is een voertuig met twee wielen en een stuur
```

Using front-matter, you may describe individual elements, but still use the original format.

### Elaborating with individual concepts

```
---
term:
- nl: fiets
- en: bicycle
related:
- voertuig
---
# Fiets

## Definition

Een fiets is een voertuig met twee wielen en een stuur

## Scope note

Ook elektrische fietsen kunnen vallen onder deze definitie van een fiets. Er zijn echter ook voertuigen die niet als fiets worden aangemerkt, zoals bijvoorbeeld een speed pedelec.
```

The front-end matter is reserved for simple fields, the markdown is reserved for longer texts. By using headers, you refer to a specific property.

### Using a template

```
---
id:
term:
- nl: fiets
- en: bicycle
alternative term:
- rijwiel
related:
- voertuig
broader:
narrower:
---
# Definition

Een fiets is een voertuig met twee wielen en een stuur

# Definition (en)

A bicycle is a vehicle with two wheels and handlebars

# Scope note

Ook elektrische fietsen kunnen vallen onder deze definitie van een fiets. Er zijn echter ook voertuigen die niet als fiets worden aangemerkt, zoals bijvoorbeeld een speed pedelec.

# Editorial note

# Change note
```

Using a template, all empty fields are ignored. You may use language tags, but can also ignore them.

### Concept scheme's

All files in one folder are considered part of the same concept scheme. You may want to include a file that describes the concept scheme.

### Template mappings

You may want to change your template mappings for international use. This creates the appropriate mapping between the elements you use and open standards. So for example:

```
---
voorkeursterm: fiets
alternatieve term: rijwiel
gerelateerd: voertuig
---
# Definitie

Een fiets is een voertuig met twee wielen en een stuur
```

Might be mapped using:

```
- prefixes:
  skos: http://
- mappings:
  - voorkeursterm: skos:prefLabel
  - alternatieve term: skos:altLabel
  - gerelateerd: skos:related
  - definitie: skos:definition
