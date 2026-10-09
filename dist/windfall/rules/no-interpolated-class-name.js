import { defineRule } from "@oxlint/plugins";
const CLASS_NAME_SUFFIX = "ClassName";
function isClassNameAttribute(attribute) {
    if (attribute.name.type !== "JSXIdentifier")
        return false;
    const name = attribute.name.name;
    return name === "className" || name.endsWith(CLASS_NAME_SUFFIX);
}
function isStringOperand(node) {
    if (node.type === "TemplateLiteral")
        return true;
    if (node.type !== "Literal" || node.raw === null)
        return false;
    return node.raw.startsWith('"') || node.raw.startsWith("'");
}
/**
 * Return whether a class value is built by string interpolation or concatenation,
 * including when post-processed by a string method such as `.trim()`.
 */
function isInterpolatedClassValue(expression) {
    if (expression.type === "CallExpression" && expression.callee.type === "MemberExpression") {
        return isInterpolatedClassValue(expression.callee.object);
    }
    if (expression.type === "TemplateLiteral")
        return expression.expressions.length > 0;
    if (expression.type !== "BinaryExpression" || expression.operator !== "+")
        return false;
    return isStringOperand(expression.left) || isStringOperand(expression.right);
}
/** Require conditional class lists to go through classNames() instead of string interpolation. */
export const noInterpolatedClassNameRule = defineRule({
    meta: {
        type: "suggestion",
        docs: {
            description: "Disallow template-literal interpolation and string concatenation in className props; use classNames().",
        },
        messages: {
            interpolatedClassName: 'Build `{{name}}` with `classNames("static classes", condition && "conditional-class")` instead of string interpolation; classNames() also merges conflicting Tailwind classes.',
        },
    },
    createOnce(context) {
        return {
            JSXAttribute(node) {
                if (!isClassNameAttribute(node))
                    return;
                if (node.value === null || node.value.type !== "JSXExpressionContainer")
                    return;
                const expression = node.value.expression;
                if (expression.type === "JSXEmptyExpression" || !isInterpolatedClassValue(expression))
                    return;
                context.report({
                    node: node.value,
                    messageId: "interpolatedClassName",
                    data: { name: context.sourceCode.getText(node.name) },
                });
            },
        };
    },
});
