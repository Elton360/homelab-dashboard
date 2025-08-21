import stringSimilarity from 'string-similarity'

export const calcPercent = (used, total, roundTo = 0) =>
  ((used / total) * 100).toFixed(roundTo)

export const makeSubdomainUrl = (sub, base) => {
  const url = new URL(base)
  return `${url.protocol}//${sub}.${url.hostname}`
}

export const fuzzyCompare = (a, b, threshold = 0.1) => {
  if (!b) return true; // if searchValue is empty, match all
  if (!a) return false; // if title is missing, skip
  return stringSimilarity.compareTwoStrings(a.toLowerCase(), b.toLowerCase()) >= threshold;
};
