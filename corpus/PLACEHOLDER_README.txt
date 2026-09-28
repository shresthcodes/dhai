DHAI Corpus Placeholder
=======================

This directory is where you add real corpus files for RAG ingestion.

RIGHTS REQUIREMENTS
-------------------
Every file must have a corresponding row in sources.csv with:
  - file:       filename (must match exactly)
  - title:      document title
  - type:       speech | debate | writing | manuscript | record | note
  - language:   en | hi | mr | gu
  - source:     institution or publication holding the original
  - sourceUrl:  URL to original (optional but recommended)
  - date:       ISO date or null if unverified
  - rights:     rights statement (e.g. "Public domain", "CC0", "CC BY 4.0")
  - reference:  short citation reference

Ingestion will FAIL for any file missing a sources.csv row or with empty rights.

RECOMMENDED SOURCES (rights likely clear — verify before ingesting)
-------------------------------------------------------------------
1. Constituent Assembly of India Debates (1946-1949)
   Official records — public domain as government documents
   Source: https://www.constitutionindia.net/

2. Dr. Ambedkar's Annihilation of Caste (1936)
   Now in public domain in many jurisdictions — verify for India
   Source: Columbia Library archives / Ambedkar.org

3. Dr. Ambedkar's Writings and Speeches (Government of Maharashtra)
   Official government publication — verify rights per volume
   Source: https://www.mea.gov.in/

SUPPORTED FORMATS
-----------------
  .txt  .md  .json (transcript format)  .pdf (text layer required)

PDF NOTE: PDFs without a text layer will be skipped with a "needs OCR" message.
Add the OCR output as a .txt file with the same base name.
