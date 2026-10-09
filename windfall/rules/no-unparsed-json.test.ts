import { RuleTester } from "oxlint/plugins-dev";

import { noUnparsedJsonRule } from "./no-unparsed-json.ts";

const tester = new RuleTester({ languageOptions: { parserOptions: { lang: "ts" } } });

const error = { messageId: "unparsedJson" };

tester.run("windfall/no-unparsed-json", noUnparsedJsonRule, {
  valid: [
    "schema.parse(JSON.parse(s));",
    "z.object({}).safeParse(JSON.parse(s));",
    'localeMessagesSchema.parse(JSON.parse(readFileSync(p, "utf8")));',
    "await schema.parseAsync(JSON.parse(s));",
    "await schema.safeParseAsync(JSON.parse(s));",
    'schema["parse"](JSON.parse(s));',
    "JSON.stringify(value);",
    "parser.parse(s);",
  ],
  invalid: [
    { code: "const v = JSON.parse(s);", errors: [error] },
    { code: "fn(JSON.parse(s));", errors: [error] },
    { code: "schema.parse(other, JSON.parse(s));", errors: [error] },
    { code: "function read<T>(s: string): T { return JSON.parse(s) as T; }", errors: [error] },
    { code: 'const v = JSON["parse"](s);', errors: [error] },
    { code: "schema.transform(JSON.parse(s));", errors: [error] },
  ],
});
