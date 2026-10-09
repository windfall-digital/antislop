import { RuleTester } from "oxlint/plugins-dev";

import { noInterpolatedClassNameRule } from "./no-interpolated-class-name.ts";

const tester = new RuleTester({ languageOptions: { parserOptions: { lang: "tsx" } } });

const error = { messageId: "interpolatedClassName" };

/** Cooks a fixture template so escaped `\`` and `\${` stay literal JSX source under test. */
function tsx(strings: TemplateStringsArray): string {
  return strings.join("");
}

tester.run("windfall/no-interpolated-class-name", noInterpolatedClassNameRule, {
  valid: [
    '<p className="text-center text-xs" />;',
    "<p className={`text-center text-xs`} />;",
    '<p className={classNames("text-center", missingHint && "mb-2")} />;',
    "<p className={styles.hint} />;",
    '<p className={isActive ? "font-semibold" : "font-normal"} />;',
    "<Card panelClassName={`p-4`} />;",
    tsx`<p title={\`Hint \${index}\`} />;`,
    tsx`<p data-class={\`a \${b}\`} />;`,
    "<p className />;",
    "<p className={1 + count} />;",
    '<p className={classNames("a", b).trim()} />;',
    "<p className={`a b`.trim()} />;",
  ],
  invalid: [
    {
      code: tsx`<p className={\`text-center text-xs \${missingHint ? "mb-2" : ""}\`} />;`,
      errors: [error],
    },
    { code: tsx`<p className={\`badge badge-\${tone}\`} />;`, errors: [error] },
    { code: tsx`<Card panelClassName={\`p-4 \${extra}\`} />;`, errors: [error] },
    { code: '<p className={"text-center " + extra} />;', errors: [error] },
    { code: '<p className={extra + " text-center"} />;', errors: [error] },
    { code: tsx`<p className={\`a \${b}\` + c} />;`, errors: [error] },
    { code: tsx`<p className={\`pill \${className}\`.trim()} />;`, errors: [error] },
    { code: tsx`<p className={(\`a \${b}\`).trim().toLowerCase()} />;`, errors: [error] },
  ],
});
