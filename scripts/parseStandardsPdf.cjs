const fs = require("fs");
const path = require("path");
const { PDFParse } = require("pdf-parse");

const pdfPath = path.join(
  __dirname,
  "../public/standards/2028-motivational-standards-age-group.pdf"
);

const outputPath = path.join(__dirname, "../src/data/standards.json");
const rawTextPath = path.join(__dirname, "../src/data/standards-raw.txt");

const ageGroupsToKeep = new Set([
  "10 & under",
  "11-12",
  "13-14",
  "15-16",
  "17-18",
]);

const eventNameMap = {
  "50 FR SCY": "50 Freestyle",
  "100 FR SCY": "100 Freestyle",
  "200 FR SCY": "200 Freestyle",
  "500 FR SCY": "500 Freestyle",
  "1000 FR SCY": "1000 Freestyle",
  "1650 FR SCY": "1650 Freestyle",
  "50 BK SCY": "50 Backstroke",
  "100 BK SCY": "100 Backstroke",
  "200 BK SCY": "200 Backstroke",
  "50 BR SCY": "50 Breaststroke",
  "100 BR SCY": "100 Breaststroke",
  "200 BR SCY": "200 Breaststroke",
  "50 FL SCY": "50 Butterfly",
  "100 FL SCY": "100 Butterfly",
  "200 FL SCY": "200 Butterfly",
  "100 IM SCY": "100 Individual Medley",
  "200 IM SCY": "200 Individual Medley",
  "400 IM SCY": "400 Individual Medley",
};

function cleanText(text) {
  return text
    .replace(/\r/g, "")
    .replace(/\u00a0/g, " ")
    .replace(/\*/g, "")
    .replace(/[ \t]+/g, " ")
    .replace(/\n+/g, "\n")
    .trim();
}

function isTimeToken(token) {
  return /^(\d+:\d{2}\.\d{2}|\d+\.\d{2})$/.test(token);
}

function normalizeAgeLabel(label) {
  return label.replace(/\s+/g, " ").trim();
}

function parseScySections(rawText) {
  const lines = rawText.split("\n").map((line) => line.trim()).filter(Boolean);

  const standards = {};
  let currentAgeGroup = null;

  for (const line of lines) {
    // stop once SCM begins
    if (line.includes("SCM") || line.includes("LCM")) {
      continue;
    }

    const headerMatch = line.match(
      /^(10 & under|11-12|13-14|15-16|17-18) Girls Event (10 & under|11-12|13-14|15-16|17-18) Boys$/
    );

    if (headerMatch) {
      currentAgeGroup = normalizeAgeLabel(headerMatch[1]);

      if (!ageGroupsToKeep.has(currentAgeGroup)) {
        currentAgeGroup = null;
        continue;
      }

      if (!standards[currentAgeGroup]) {
        standards[currentAgeGroup] = {
          Female: {},
          Male: {},
        };
      }

      continue;
    }

    if (!currentAgeGroup) continue;

    const eventCode = Object.keys(eventNameMap).find((code) => line.includes(code));
    if (!eventCode) continue;

    const parts = line.split(eventCode);
    if (parts.length !== 2) continue;

    const femalePart = parts[0].trim();
    const malePart = parts[1].trim();

    const femaleTokens = femalePart.split(" ").filter(isTimeToken);
    const maleTokens = malePart.split(" ").filter(isTimeToken);

    if (femaleTokens.length !== 6 || maleTokens.length !== 6) {
      continue;
    }

    const eventName = eventNameMap[eventCode];

    standards[currentAgeGroup].Female[eventName] = {
      B: femaleTokens[0],
      BB: femaleTokens[1],
      A: femaleTokens[2],
      AA: femaleTokens[3],
      AAA: femaleTokens[4],
      AAAA: femaleTokens[5],
    };

    // male side is reversed in the PDF text after the event label:
    // AAAA AAA AA A BB B
    standards[currentAgeGroup].Male[eventName] = {
      B: maleTokens[5],
      BB: maleTokens[4],
      A: maleTokens[3],
      AA: maleTokens[2],
      AAA: maleTokens[1],
      AAAA: maleTokens[0],
    };
  }

  return standards;
}

async function parsePdf() {
  let parser;

  try {
    const dataBuffer = fs.readFileSync(pdfPath);

    parser = new PDFParse({ data: dataBuffer });
    const result = await parser.getText();

    const cleaned = cleanText(result.text);
    fs.writeFileSync(rawTextPath, cleaned, "utf8");

    const standards = parseScySections(cleaned);

    fs.writeFileSync(outputPath, JSON.stringify(standards, null, 2), "utf8");

    console.log("PDF parsed successfully.");
    console.log("Clean raw text saved to src/data/standards-raw.txt");
    console.log("Structured SCY standards saved to src/data/standards.json");
  } catch (error) {
    console.error("Error parsing PDF:", error);
  } finally {
    if (parser) {
      await parser.destroy();
    }
  }
}

parsePdf();