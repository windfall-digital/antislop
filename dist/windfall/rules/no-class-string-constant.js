import { defineRule } from "@oxlint/plugins";
const CLASS_NAME_SUFFIXES = ["Class", "ClassName", "ClassNames", "Classes"];
const CLASS_NAMES = { className: true, classNames: true, classes: true };
/** Return whether an identifier sits inside the value of a `className`-like JSX attribute. */
function isInClassNameAttribute(identifier) {
    let current = identifier.parent;
    while (current !== null && current !== undefined) {
        if (current.type === "JSXAttribute") {
            if (current.name.type !== "JSXIdentifier")
                return false;
            const name = current.name.name;
            return name === "className" || name.endsWith("ClassName");
        }
        if (current.type === "JSXElement" || current.type === "JSXFragment")
            return false;
        current = current.parent;
    }
    return false;
}
/** Disallow storing class lists in string variables; inline them or extract a component. */
export const noClassStringConstantRule = defineRule({
    meta: {
        type: "suggestion",
        docs: {
            description: "Disallow class-list strings stored in variables named like class names or used in className props; inline the classes or extract a component.",
        },
        messages: {
            classStringConstant: "`{{name}}` stores a class list in a string variable. Put the classes directly in `className`, or move the styled element into a component (e.g. `<Input>`, `<IconButton>`).",
        },
    },
    createOnce(context) {
        return {
            VariableDeclarator(node) {
                if (node.id.type !== "Identifier" || node.init === null)
                    return;
                const init = node.init;
                const isStaticString = init.type === "TemplateLiteral"
                    ? init.expressions.length === 0
                    : init.type === "Literal" && typeof init.value === "string";
                if (!isStaticString)
                    return;
                const name = node.id.name;
                const isNamedLikeClassName = CLASS_NAMES[name] === true || CLASS_NAME_SUFFIXES.some((suffix) => name.endsWith(suffix));
                const isUsedInClassName = context.sourceCode
                    .getDeclaredVariables(node)
                    .some((variable) => variable.references.some((reference) => isInClassNameAttribute(reference.identifier)));
                if (!isNamedLikeClassName && !isUsedInClassName)
                    return;
                context.report({ node: node.id, messageId: "classStringConstant", data: { name } });
            },
        };
    },
});
