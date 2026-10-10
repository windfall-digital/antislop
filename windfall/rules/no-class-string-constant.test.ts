import { RuleTester } from "oxlint/plugins-dev";

import { noClassStringConstantRule } from "./no-class-string-constant.ts";

const tester = new RuleTester({ languageOptions: { parserOptions: { lang: "tsx" } } });

const error = { messageId: "classStringConstant" };

tester.run("windfall/no-class-string-constant", noClassStringConstantRule, {
  valid: [
    '<input className="w-full rounded-md border px-3" />;',
    'const label = "Save changes";',
    'const title = "Settings"; <h1 title={title}>{title}</h1>;',
    'const id = "email"; <input id={id} />;',
    'const inputClass = classNames("w-full", isWide && "px-3");',
    "const buttonClass = `px-3 ${size}`;",
    'const { inputClass } = styles;',
    "const tooltipClassName = 42;",
    'const label = "Save"; <p className={styles.hint}>{label}</p>;',
  ],
  invalid: [
    { code: 'const inputClass = "w-full rounded-md border bg-surface px-3 py-2";', errors: [error] },
    { code: 'export const iconButtonClass = "inline-flex h-8 w-8";', errors: [error] },
    { code: "const cardClassName = `rounded-md border`;", errors: [error] },
    { code: 'let headerClasses = "flex gap-2";', errors: [error] },
    { code: 'const classes = "flex gap-2";', errors: [error] },
    { code: 'const base = "flex gap-2"; <div className={base} />;', errors: [error] },
    {
      code: 'const base = "flex gap-2"; <div className={classNames(base, isOpen && "block")} />;',
      errors: [error],
    },
    { code: 'const ring = "ring-2"; <Field labelClassName={ring} />;', errors: [error] },
    {
      code: 'function Row() { const cell = "px-3 py-2"; return <td className={cell} />; }',
      errors: [error],
    },
  ],
});
