const normalizeQuery = (query) => query.trim().toLowerCase();

const normalizeOpCodeQuery = (query) => normalizeQuery(query).replace(/^0x/, '');

export const matchesInstruction = (instruction, query) => {
  const normalized = normalizeQuery(query);
  if (!normalized) return true;

  const terms = normalized.split(/\s+/).filter(Boolean);
  const opcodeTerm = normalizeOpCodeQuery(normalized);

  const haystack = [
    instruction.mnemonic,
    instruction.opCode,
    instruction.type,
  ]
    .filter(Boolean)
    .join(' ')
    .toLowerCase();

  return terms.every((term) => haystack.includes(term))
    || (opcodeTerm && instruction.opCode.toLowerCase().includes(opcodeTerm));
};

