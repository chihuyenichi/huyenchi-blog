# Obsidian Gate input error list

Target: `66.228.50.16:48271`

## Observed conditions

- `GateError: malformed expression`: input is rejected by the parser before evaluation. This happens with empty/incomplete syntax, dangling operators, unbalanced parentheses, adjacent tokens without an operator, unterminated strings, and unsupported punctuation.
- `GateError: unknown name`: input parses as a name expression, but the evaluator cannot resolve the identifier. This happens with identifiers such as `a`, `abc`, `_x`, or a name used inside a larger expression.
- `pass`: service returned an evaluated value and did not emit `GateError`.

## [input, error]

| input | category | error | returned body |
|---|---|---|---|
| `"root.observer.right.memory.catalog.index.sealed.unveil"` | file | pass | `<capability unveil>` |
| `"type(root.observer.right.memory.catalog.index.sealed.unveil)"` | file | pass | `'capability'` |
| `"repr(root.observer.right.memory.catalog.index.sealed.unveil)"` | file | pass | `'<capability unveil>'` |
| `"dir(root.observer.right.memory.catalog.index.sealed.unveil)"` | file | GateError: not an object | `GateError: not an object` |
| `"len(root.observer.right.memory.catalog.index.sealed.unveil)"` | file | GateError: length denied | `GateError: length denied` |
| `"root.observer.right.memory.catalog.index.sealed.unveil()"` | file | pass | `'BDSEC{0bs1d14n_g4t3_un53al3d_g00d_jOB}'` |
| `"root.observer.right.memory.catalog.index.sealed.unveil(0)"` | file | GateError: arguments denied | `GateError: arguments denied` |
| `"root.observer.right.memory.catalog.index.sealed.unveil(2026)"` | file | GateError: arguments denied | `GateError: arguments denied` |
| `"root.observer.right.memory.catalog.index.sealed.unveil(\"obsidian\")"` | file | GateError: arguments denied | `GateError: arguments denied` |
| `"root.observer.right.memory.catalog.index.sealed.unveil(root.observer.right.mark)"` | file | GateError: arguments denied | `GateError: arguments denied` |
| `"root.observer.right.memory.catalog.index.sealed.unveil(\"intact\")"` | file | GateError: arguments denied | `GateError: arguments denied` |
| `"root.observer.right.memory.catalog.index.sealed.unveil(root.observer.right.memory.catalog.index.sealed.status)"` | file | GateError: arguments denied | `GateError: arguments denied` |
| `"root.observer.right.memory.catalog.index.sealed.unveil(root)"` | file | GateError: arguments denied | `GateError: arguments denied` |
| `"root.observer.right.memory.catalog.index.sealed.unveil(root.observer.right.memory)"` | file | GateError: arguments denied | `GateError: arguments denied` |
| `"root.observer.right.memory.catalog.index.sealed[\"unveil\"]()"` | file | pass | `'BDSEC{0bs1d14n_g4t3_un53al3d_g00d_jOB}'` |
| `"root[\"observer\"][\"right\"][\"memory\"][\"catalog\"][\"index\"][\"sealed\"][\"unveil\"]()"` | file | pass | `'BDSEC{0bs1d14n_g4t3_un53al3d_g00d_jOB}'` |
| `"root[\"observer\"].right[\"memory\"].catalog[\"index\"].sealed.unveil()"` | file | pass | `'BDSEC{0bs1d14n_g4t3_un53al3d_g00d_jOB}'` |

## Minimal examples

- malformed expression: not observed
- unknown name: not observed
