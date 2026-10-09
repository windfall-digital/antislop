import type { ESTree } from "@oxlint/plugins";

/** Return the static name of a member property, covering both `a.b` and `a["b"]`. */
export function memberPropertyName(member: ESTree.MemberExpression): string | null {
  const property = member.property;

  if (property.type === "Identifier") return member.computed ? null : property.name;

  if (property.type === "Literal" && member.computed) return String(property.value);

  return null;
}
