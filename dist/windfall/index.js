import { eslintCompatPlugin } from "@oxlint/plugins";
import { noClassStringConstantRule } from "./rules/no-class-string-constant.js";
import { noInterpolatedClassNameRule } from "./rules/no-interpolated-class-name.js";
import { noNumberCoercionOfHeadersRule } from "./rules/no-number-coercion-of-headers.js";
import { noUnparsedJsonRule } from "./rules/no-unparsed-json.js";
/** Project-specific Oxlint rules for Windfall conventions. */
const windfallPlugin = eslintCompatPlugin({
    meta: { name: "windfall" },
    rules: {
        "no-class-string-constant": noClassStringConstantRule,
        "no-interpolated-class-name": noInterpolatedClassNameRule,
        "no-number-coercion-of-headers": noNumberCoercionOfHeadersRule,
        "no-unparsed-json": noUnparsedJsonRule,
    },
});
export default windfallPlugin;
