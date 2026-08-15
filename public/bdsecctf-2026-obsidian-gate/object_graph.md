# Obsidian Gate Object Graph

Target: `66.228.50.16:48271`
Start: `root`

## Flag Hits

- none

## Nodes

| depth | expr | value | type | repr | len | dir |
|---|---|---|---|---|---|---|
| 0 | `root` | `<obsidian root>` | `'root'` | `'<obsidian root>'` | `GateError: length denied` | `['ash', 'mirror', 'observer', 'year']` |
| 1 | `root.ash` | `<ash>` | `'ash'` | `'<ash>'` | `GateError: length denied` | `['density', 'next', 'tone']` |
| 1 | `root.mirror` | `<mirror>` | `'mirror'` | `'<mirror>'` | `GateError: length denied` | `['depth', 'echo', 'face']` |
| 1 | `root.observer` | `<observer>` | `'observer'` | `'<observer>'` | `GateError: length denied` | `['left', 'right', 'state']` |
| 1 | `root.year` | `2026` | `'int'` | `'2026'` | `` | `GateError: not an object` |
| 2 | `root.ash.density` | `17` | `'int'` | `'17'` | `GateError: length denied` | `GateError: not an object` |
| 2 | `root.ash.next` | `<dead-end>` | `'dead-end'` | `'<dead-end>'` | `GateError: length denied` | `['value']` |
| 2 | `root.ash.tone` | `'silent'` | `'str'` | `"'silent'"` | `6` | `GateError: not an object` |
| 2 | `root.mirror.depth` | `4` | `'int'` | `'4'` | `GateError: length denied` | `GateError: not an object` |
| 2 | `root.mirror.echo` | `<echo>` | `'echo'` | `'<echo>'` | `GateError: length denied` | `['value']` |
| 2 | `root.mirror.face` | `'dark'` | `'str'` | `"'dark'"` | `4` | `GateError: not an object` |
| 2 | `root.observer.left` | `<mirror>` | `'mirror'` | `'<mirror>'` | `` | `['depth', 'echo', 'face']` |
| 2 | `root.observer.right` | `<right>` | `'right'` | `'<right>'` | `GateError: length denied` | `['mark', 'memory']` |
| 2 | `root.observer.state` | `'watching'` | `'str'` | `"'watching'"` | `8` | `GateError: not an object` |
| 3 | `root.ash.next.value` | `0` | `'int'` | `'0'` | `GateError: length denied` | `GateError: not an object` |
| 3 | `root.mirror.echo.value` | `'nothing answers'` | `'str'` | `"'nothing answers'"` | `15` | `GateError: not an object` |
| 3 | `root.observer.left.depth` | `4` | `'int'` | `'4'` | `GateError: length denied` | `GateError: not an object` |
| 3 | `root.observer.left.echo` | `<echo>` | `'echo'` | `'<echo>'` | `GateError: length denied` | `` |
| 3 | `root.observer.left.face` | `'dark'` | `'str'` | `"'dark'"` | `` | `GateError: not an object` |
| 3 | `root.observer.right.mark` | `'obsidian'` | `'str'` | `"'obsidian'"` | `8` | `GateError: not an object` |
| 3 | `root.observer.right.memory` | `<archive>` | `'archive'` | `'<archive>'` | `GateError: length denied` | `['catalog', 'dust']` |
| 4 | `root.observer.right.memory.catalog` | `<catalog>` | `'catalog'` | `'<catalog>'` | `GateError: length denied` | `['index', 'version']` |
| 4 | `root.observer.right.memory.dust` | `<ash>` | `'ash'` | `'<ash>'` | `GateError: length denied` | `['density', 'next', 'tone']` |
| 5 | `root.observer.right.memory.catalog.index` | `<index>` | `'index'` | `'<index>'` | `GateError: length denied` | `['empty', 'sealed']` |
| 5 | `root.observer.right.memory.catalog.version` | `2026` | `'int'` | `'2026'` | `GateError: length denied` | `GateError: not an object` |
| 5 | `root.observer.right.memory.dust.density` | `17` | `'int'` | `'17'` | `GateError: length denied` | `GateError: not an object` |
| 5 | `root.observer.right.memory.dust.next` | `<dead-end>` | `'dead-end'` | `'<dead-end>'` | `GateError: length denied` | `['value']` |
| 5 | `root.observer.right.memory.dust.tone` | `'silent'` | `'str'` | `"'silent'"` | `6` | `GateError: not an object` |
| 6 | `root.observer.right.memory.catalog.index.empty` | `<empty>` | `'empty'` | `'<empty>'` | `GateError: length denied` | `['count']` |
| 6 | `root.observer.right.memory.catalog.index.sealed` | `<sealed>` | `'sealed'` | `'<sealed>'` | `GateError: length denied` | `['status', 'unveil']` |
| 6 | `root.observer.right.memory.dust.next.value` | `0` | `'int'` | `'0'` | `GateError: length denied` | `GateError: not an object` |
| 7 | `root.observer.right.memory.catalog.index.empty.count` | `0` | `'int'` | `'0'` | `GateError: length denied` | `GateError: not an object` |
| 7 | `root.observer.right.memory.catalog.index.sealed.status` | `'intact'` | `'str'` | `"'intact'"` | `6` | `GateError: not an object` |
| 7 | `root.observer.right.memory.catalog.index.sealed.unveil` | `<capability unveil>` | `'capability'` | `'<capability unveil>'` | `GateError: length denied` | `GateError: not an object` |
