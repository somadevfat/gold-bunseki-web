const ASCII_ONLY = /^[\t\n\r\x20-\x7E]*$/;

/**
 * Commit title/body/footer must be English-only: printable ASCII plus line breaks.
 */
function ruleEnglishOnly(parsed) {
  const raw = parsed.raw ?? "";
  const valid = ASCII_ONLY.test(raw);
  return [
    valid,
    valid
      ? ""
      : "commit message must be English only (printable ASCII plus line breaks); Japanese and other non-Latin text are rejected by commitlint",
  ];
}

export default {
  extends: ["@commitlint/config-conventional"],
  plugins: [
    {
      rules: {
        "english-only": ruleEnglishOnly,
      },
    },
  ],
  rules: {
    "english-only": [2, "always"],
  },
};
