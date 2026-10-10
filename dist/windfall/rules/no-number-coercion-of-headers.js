import { defineRule } from "@oxlint/plugins";
import { memberPropertyName } from "../shared/member-property-name.js";
const GLOBAL_COERCIONS = { Number: true, parseInt: true, parseFloat: true };
const NUMBER_COERCION_METHODS = { parseInt: true, parseFloat: true };
const HEADER_SOURCES = { headers: true, searchParams: true };
function isNumberCoercion(callee) {
    if (callee.type === "Identifier")
        return Object.hasOwn(GLOBAL_COERCIONS, callee.name);
    if (callee.type !== "MemberExpression")
        return false;
    if (callee.object.type !== "Identifier" || callee.object.name !== "Number")
        return false;
    const method = memberPropertyName(callee);
    return method !== null && Object.hasOwn(NUMBER_COERCION_METHODS, method);
}
/** Strip `x!` and optional-chain wrappers so `a.headers?.get(k)!` reads as its inner call. */
function unwrapExpression(node) {
    if (node.type === "TSNonNullExpression" || node.type === "ChainExpression") {
        return unwrapExpression(node.expression);
    }
    return node;
}
function isHeaderSource(node) {
    if (node.type === "Identifier")
        return Object.hasOwn(HEADER_SOURCES, node.name);
    if (node.type !== "MemberExpression")
        return false;
    const name = memberPropertyName(node);
    return name !== null && Object.hasOwn(HEADER_SOURCES, name);
}
/** Return whether `node` reads a value via `headers.get(...)` or `searchParams.get(...)`. */
function isHeaderLookup(node) {
    if (node.type !== "CallExpression" || node.callee.type !== "MemberExpression")
        return false;
    if (memberPropertyName(node.callee) !== "get")
        return false;
    return isHeaderSource(node.callee.object);
}
/** Require header and search-param values to be parsed with Zod instead of numeric coercion. */
export const noNumberCoercionOfHeadersRule = defineRule({
    meta: {
        type: "problem",
        docs: {
            description: "Disallow Number()/parseInt()/parseFloat() on headers.get() and searchParams.get() values.",
        },
        messages: {
            numberCoercedHeader: 'Parse header and search-param values with a Zod schema (e.g. `positiveIntegerHeaderSchema.safeParse(res.headers.get(name)).data`); `Number(null)` and `Number("")` are 0.',
        },
    },
    createOnce(context) {
        return {
            CallExpression(node) {
                if (!isNumberCoercion(node.callee))
                    return;
                const firstArgument = node.arguments[0];
                if (firstArgument === undefined || !isHeaderLookup(unwrapExpression(firstArgument)))
                    return;
                context.report({ node, messageId: "numberCoercedHeader" });
            },
        };
    },
});
