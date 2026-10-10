import { eslintCompatPlugin } from "@oxlint/plugins";

import { noClassStringConstantRule } from "./rules/no-class-string-constant.ts";
import { noInterpolatedClassNameRule } from "./rules/no-interpolated-class-name.ts";
import { noNumberCoercionOfHeadersRule } from "./rules/no-number-coercion-of-headers.ts";
import { noUnparsedJsonRule } from "./rules/no-unparsed-json.ts";

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
