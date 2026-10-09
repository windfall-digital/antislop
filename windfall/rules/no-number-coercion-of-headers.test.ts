import { RuleTester } from "oxlint/plugins-dev";

import { noNumberCoercionOfHeadersRule } from "./no-number-coercion-of-headers.ts";

const tester = new RuleTester({ languageOptions: { parserOptions: { lang: "ts" } } });

const error = { messageId: "numberCoercedHeader" };

tester.run("windfall/no-number-coercion-of-headers", noNumberCoercionOfHeadersRule, {
  valid: [
    "Number(match[1]);",
    "Number(value);",
    'positiveIntegerHeaderSchema.safeParse(res.headers.get("a")).data;',
    'Number(map.get("a"));',
    "Number();",
    'String(res.headers.get("a"));',
    'Math.round(res.headers.get("a"));',
  ],
  invalid: [
    { code: 'Number(res.headers.get("a"));', errors: [error] },
    { code: 'parseInt(url.searchParams.get("p")!, 10);', errors: [error] },
    { code: 'Number.parseFloat(headers.get("a"));', errors: [error] },
    { code: 'Number(request.headers?.get("a"));', errors: [error] },
    { code: 'parseFloat(searchParams.get("a"));', errors: [error] },
    { code: 'Number.parseInt(res["headers"].get("a"), 10);', errors: [error] },
  ],
});
