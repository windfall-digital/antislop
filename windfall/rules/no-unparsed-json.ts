import type { ESTree } from "@oxlint/plugins";
import { defineRule } from "@oxlint/plugins";

import { memberPropertyName } from "../shared/member-property-name.ts";

const SCHEMA_PARSE_METHODS = {
  parse: true,
  safeParse: true,
  parseAsync: true,
  safeParseAsync: true,
};

function isJsonParseCall(node: ESTree.CallExpression): boolean {
  const callee = node.callee;

  if (callee.type !== "MemberExpression") return false;

  if (callee.object.type !== "Identifier" || callee.object.name !== "JSON") return false;

  return memberPropertyName(callee) === "parse";
}

/** Return whether `node` is the first argument of a `schema.parse(...)`-style call. */
function isSchemaParseInput(node: ESTree.CallExpression): boolean {
  const parent = node.parent;

  if (parent.type !== "CallExpression" || parent.arguments[0] !== node) return false;

  if (parent.callee.type !== "MemberExpression") return false;

  const method = memberPropertyName(parent.callee);

  return method !== null && Object.hasOwn(SCHEMA_PARSE_METHODS, method);
}

/** Require JSON.parse results to flow straight into a Zod schema instead of escaping as `any`. */
export const noUnparsedJsonRule = defineRule({
  meta: {
    type: "problem",
    docs: {
      description: "Disallow JSON.parse results that are not passed straight into a Zod schema.",
    },
    messages: {
      unparsedJson:
        "Pass `JSON.parse(...)` straight into a Zod schema, e.g. `schema.parse(JSON.parse(text))`; JSON.parse returns `any` and skips type checking.",
    },
  },
  createOnce(context) {
    return {
      CallExpression(node) {
        if (!isJsonParseCall(node) || isSchemaParseInput(node)) return;

        context.report({ node, messageId: "unparsedJson" });
      },
    };
  },
});
