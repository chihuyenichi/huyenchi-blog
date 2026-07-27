# Obsidian Gate Error List

Target from current `diss.md`: `66.228.50.16:48271`

Representative rows were retested against this target: `"+"` still gives `GateError: malformed expression`, and `a`/`flag`/`abc` still give `GateError: unknown name`.

## Conditions

- `GateError: malformed expression`: parser/tokenizer failure before evaluation. Confirmed triggers include whitespace-only input, malformed numeric syntax, operator without a valid operand, dangling binary operators, unbalanced parentheses, adjacent operands, unterminated strings, and unsupported punctuation.
- `GateError: unknown name`: syntactically valid identifier expression where the identifier is not present in the evaluator environment. Confirmed triggers include normal identifiers (`a`, `abc`, `flag`), identifiers with digits after the first character (`abc123`), identifiers with underscores (`_x`, `x_y`), and lowercase keyword-like names (`true`).
- `pass`: accepted expression with no `GateError`; the service returned an evaluated value.

## [input, error]

| input | error |
|---|---|
| `""` | `The gate remains closed.` |
| `" "` | `GateError: malformed expression` |
| `"0"` | `pass` |
| `"1"` | `pass` |
| `"42"` | `pass` |
| `"1234567890"` | `pass` |
| `"0x41"` | `pass` |
| `"0b101"` | `pass` |
| `"(1)"` | `pass` |
| `"'x'"` | `pass` |
| `"\"x\""` | `pass` |
| `"\"abc\"[0]"` | `pass` |
| `"  1  "` | `GateError: malformed expression` |
| `"01"` | `GateError: malformed expression` |
| `"+"` | `GateError: malformed expression` |
| `"-"` | `GateError: malformed expression` |
| `"/"` | `GateError: malformed expression` |
| `"%"` | `GateError: malformed expression` |
| `"**"` | `GateError: malformed expression` |
| `"//"` | `GateError: malformed expression` |
| `"1+"` | `GateError: malformed expression` |
| `"1-"` | `GateError: malformed expression` |
| `"1*"` | `GateError: malformed expression` |
| `"1/"` | `GateError: malformed expression` |
| `"1%"` | `GateError: malformed expression` |
| `"1**"` | `GateError: malformed expression` |
| `"1//"` | `GateError: malformed expression` |
| `"("` | `GateError: malformed expression` |
| `")"` | `GateError: malformed expression` |
| `"(1"` | `GateError: malformed expression` |
| `"((1)"` | `GateError: malformed expression` |
| `"(1))"` | `GateError: malformed expression` |
| `"1 2"` | `GateError: malformed expression` |
| `","` | `GateError: malformed expression` |
| `"'x"` | `GateError: malformed expression` |
| `"\"x"` | `GateError: malformed expression` |
| `"@"` | `GateError: malformed expression` |
| `"#"` | `GateError: malformed expression` |
| `"$"` | `GateError: malformed expression` |
| `"a"` | `GateError: unknown name` |
| `"abc"` | `GateError: unknown name` |
| `"abc123"` | `GateError: unknown name` |
| `"_x"` | `GateError: unknown name` |
| `"x_y"` | `GateError: unknown name` |
| `"sin"` | `GateError: unknown name` |
| `"flag"` | `GateError: unknown name` |
| `"true"` | `GateError: unknown name` |
| `"1.5"` | `GateError: constant denied` |
| `".5"` | `GateError: constant denied` |
| `"+1"` | `GateError: operation denied` |
| `"-1"` | `GateError: operation denied` |
| `"~1"` | `GateError: operation denied` |
| `"1+2"` | `GateError: operation denied` |
| `"1-2"` | `GateError: operation denied` |
| `"2*3"` | `GateError: operation denied` |
| `"6/2"` | `GateError: operation denied` |
| `"2**3"` | `GateError: operation denied` |
| `"10%3"` | `GateError: operation denied` |
| `"5//2"` | `GateError: operation denied` |
| `"()"` | `GateError: operation denied` |
| `"1,"` | `GateError: operation denied` |
| `"[]"` | `GateError: operation denied` |
| `"{}"` | `GateError: operation denied` |
| `"{1:2}"` | `GateError: operation denied` |
| `"(1,2)"` | `GateError: operation denied` |
| `"False"` | `GateError: constant denied` |
| `"None"` | `GateError: constant denied` |
| `"foo()"` | `GateError: unknown call` |
| `"foo(1)"` | `GateError: unknown call` |
| `"().__class__"` | `GateError: attribute denied` |
| `"\"hi\".upper()"` | `GateError: not an object` |

## Minimal Repro

| target error | minimal input |
|---|---|
| `GateError: malformed expression` | `" "` or `"+"` |
| `GateError: unknown name` | `"a"` |
