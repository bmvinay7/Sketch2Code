export function buildDisplayHandle(name: string | null | undefined, email: string | null | undefined) {
  const safeName = name?.trim();

  if (safeName && !/^sketch2code user$/i.test(safeName)) {
    return safeName;
  }

  const prefix = email?.split("@")[0]?.replace(/[._-]+/g, " ")?.trim();
  if (prefix) {
    return prefix.replace(/\b\w/g, (letter) => letter.toUpperCase());
  }

  return "Sketch2Code Member";
}

export function buildCommunityUsername(name: string | null | undefined, email: string | null | undefined) {
  const basis = (email?.split("@")[0] || name || "member")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "")
    .slice(0, 18);

  return `u/${basis || "member"}`;
}
