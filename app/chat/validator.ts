/**
 * validator.ts — post-generation validation layer for Mermaid flowcharts.
 *
 * Pure functions only (regex/line-based parsing, no external graph library).
 * The generation code path is untouched: after the AI produces Mermaid code,
 * call `validateMermaid(code)` and, if needed, send ONE repair request whose
 * prompt is built with `buildRepairPrompt()`.
 */

export type NodeShape =
  | 'rect'
  | 'diamond'
  | 'rounded'
  | 'stadium'
  | 'circle'
  | 'subroutine'
  | 'hexagon'
  | 'asymmetric'
  | 'unknown';

export interface FlowchartNode {
  id: string;
  shape: NodeShape;
  label: string;
  line: number;
  /** How many times this ID was defined with shape syntax (2+ = duplicate). */
  definitions: number;
}

export interface FlowchartEdge {
  from: string;
  to: string;
  label: string;
  line: number;
}

export interface ParsedFlowchart {
  diagramType: 'flowchart' | 'other';
  direction?: string;
  nodes: FlowchartNode[];
  edges: FlowchartEdge[];
}

export type ViolationRule =
  | 'single-start'
  | 'has-end'
  | 'decision-labels'
  | 'no-orphans'
  | 'no-duplicates';

export interface Violation {
  rule: ViolationRule;
  message: string;
  nodeId?: string;
}

export interface FlowchartScore {
  passed: number;
  total: number;
  /** Integer percentage 0–100. */
  score: number;
}

export interface ValidationResult {
  parsed: ParsedFlowchart;
  violations: Violation[];
  score: FlowchartScore;
  /** True when the code is not a flowchart, so flowchart rules don't apply. */
  skipped: boolean;
}

/** Number of flowchart rules checked by `validateFlowchart`. */
export const TOTAL_RULES = 5;

// Node IDs must start with a word character — a leading dash would be an
// edge operator (-->), so bare "--"/"-" can never be a node ID.
const ID = '[A-Za-z0-9_][A-Za-z0-9_\\-]*';

/**
 * Combined node-definition pattern. Alternation order matters: the more
 * specific shapes (stadium, circle, subroutine, hexagon) must come before
 * their prefixes (rounded, rect, diamond).
 */
const NODE_DEF_RE = new RegExp(
  `(${ID})\\s*` +
    `(?:` +
    `\\(\\[\\s*([^\\]]*?)\\s*\\]\\)` + // 2 stadium  ([label])
    `|\\(\\(\\s*([^)]*?)\\)\\)` + // 3 circle    ((label))
    `|\\[\\[\\s*([^\\]]*?)\\s*\\]\\]` + // 4 subroutine [[label]]
    `|\\{\\{\\s*([^}]*?)\\s*\\}\\}` + // 5 hexagon    {{label}}
    `|>\\s*([^\\]]*?)\\s*\\]` + // 6 asymmetric >label]
    `|\\(\\s*([^()]*?)\\s*\\)` + // 7 rounded    (label)
    `|\\[\\s*([^\\]]*?)\\s*\\]` + // 8 rect       [label]
    `|\\{\\s*([^}]*?)\\s*\\}` + // 9 diamond    {label}
    `)`,
  'g',
);

const EDGE_OP = '(?:-->|---|==>|--?>|-\\.->|\\.\\.>|~~~)';

/**
 * Extract flowchart structure from a Mermaid string.
 * Line-based + regex only — no external graph library.
 */
export function parseFlowchart(mermaidCode: string): ParsedFlowchart {
  const nodes = new Map<string, FlowchartNode>();
  const edges: FlowchartEdge[] = [];
  let diagramType: ParsedFlowchart['diagramType'] = 'other';
  let direction: string | undefined;
  let subgraphDepth = 0;
  let sawFirstStatement = false;

  function ensureNode(id: string, line: number): FlowchartNode {
    let n = nodes.get(id);
    if (!n) {
      n = { id, shape: 'unknown', label: '', line, definitions: 0 };
      nodes.set(id, n);
    }
    return n;
  }

  const rawLines = mermaidCode.replace(/\r\n/g, '\n').split('\n');

  rawLines.forEach((raw, idx) => {
    const line = idx + 1;
    // Strip %% comments.
    const commentAt = raw.indexOf('%%');
    const text = (commentAt >= 0 ? raw.slice(0, commentAt) : raw).trim();
    if (!text) return;

    if (/^subgraph\b/i.test(text)) {
      subgraphDepth += 1;
      return;
    }
    if (/^end\s*$/i.test(text)) {
      subgraphDepth = Math.max(0, subgraphDepth - 1);
      return;
    }
    // Declarations that carry no nodes/edges.
    if (/^(direction|classDef|class|style|linkStyle|click|accTitle|accDescr|title)\b/i.test(text)) return;

    if (!sawFirstStatement) {
      sawFirstStatement = true;
      const head = text.match(/^(flowchart|graph)(?:\s+(TD|TB|BT|RL|LR))?/i);
      if (head) {
        diagramType = 'flowchart';
        direction = head[2]?.toUpperCase();
        // A header may share its line with statements (rare) — keep parsing it.
        if (/^(flowchart|graph)\s*$/i.test(text)) return;
      }
    }

    // --- Node definitions (possibly several per line) ---
    NODE_DEF_RE.lastIndex = 0;
    let m: RegExpExecArray | null;
    while ((m = NODE_DEF_RE.exec(text)) !== null) {
      const id = m[1];
      let shape: NodeShape = 'unknown';
      let label = '';
      if (m[2] !== undefined) { shape = 'stadium'; label = m[2]; }
      else if (m[3] !== undefined) { shape = 'circle'; label = m[3]; }
      else if (m[4] !== undefined) { shape = 'subroutine'; label = m[4]; }
      else if (m[5] !== undefined) { shape = 'hexagon'; label = m[5]; }
      else if (m[6] !== undefined) { shape = 'asymmetric'; label = m[6]; }
      else if (m[7] !== undefined) { shape = 'rounded'; label = m[7]; }
      else if (m[8] !== undefined) { shape = 'rect'; label = m[8]; }
      else if (m[9] !== undefined) { shape = 'diamond'; label = m[9]; }
      const node = ensureNode(id, line);
      node.definitions += 1;
      // First explicit shape wins for display; duplicates are still counted.
      if (node.shape === 'unknown') {
        node.shape = shape;
        node.label = label.trim();
        node.line = line;
      }
      // Guard against zero-width matches looping forever.
      if (m[0].length === 0) NODE_DEF_RE.lastIndex += 1;
    }

    // --- Edges (supports chained A --> B --> C and -- text --> forms) ---
    // Strip shape suffixes first (A(Start) --> B{X?} becomes A --> B) so
    // endpoints match as bare IDs — and label text can't fake edges.
    NODE_DEF_RE.lastIndex = 0;
    const bare = text.replace(NODE_DEF_RE, '$1');
    NODE_DEF_RE.lastIndex = 0;
    // Normalise long-form labels into |label| form first.
    const normalised = bare
      .replace(/--\s*([^-|\s][^-\n]*?)\s*-->/g, '-->|$1|')
      .replace(/==\s*([^=\n]+?)\s*==>/g, '==>|$1|')
      .replace(/-\.\s*([^.\n]+?)\s*-\.->/g, '-.->|$1|');

    const edgeRe = new RegExp(
      `(${ID})\\s*${EDGE_OP}\\s*(?:\\|\\s*([^|]*?)\\s*\\|\\s*)?(${ID})`,
      'g',
    );
    let e: RegExpExecArray | null;
    while ((e = edgeRe.exec(normalised)) !== null) {
      const from = e[1];
      const label = (e[2] ?? '').trim();
      const to = e[3];
      edges.push({ from, to, label, line });
      ensureNode(from, line);
      ensureNode(to, line);
      // Rewind so chained edges (A --> B --> C) also match B --> C:
      // continue scanning from the start of the target ID.
      const targetAt = e[0].lastIndexOf(to);
      if (targetAt > 0) edgeRe.lastIndex = e.index + targetAt;
      if (e[0].length === 0) edgeRe.lastIndex += 1;
    }
  });

  return { diagramType, direction, nodes: [...nodes.values()], edges };
}

/**
 * Check structural rules. Returns one violation per offending node/rule.
 * Non-flowchart code is skipped (no violations — see `skipped` in the result).
 */
export function validateFlowchart(parsed: ParsedFlowchart): Violation[] {
  if (parsed.diagramType !== 'flowchart') return [];

  const violations: Violation[] = [];
  const indegree = new Map<string, number>();
  const outdegree = new Map<string, number>();
  const outgoing = new Map<string, FlowchartEdge[]>();

  for (const n of parsed.nodes) {
    indegree.set(n.id, 0);
    outdegree.set(n.id, 0);
    outgoing.set(n.id, []);
  }
  for (const e of parsed.edges) {
    indegree.set(e.to, (indegree.get(e.to) ?? 0) + 1);
    outdegree.set(e.from, (outdegree.get(e.from) ?? 0) + 1);
    if (!outgoing.has(e.from)) outgoing.set(e.from, []);
    outgoing.get(e.from)?.push(e);
    // Endpoints referenced only in edges still count as nodes.
    if (!indegree.has(e.from)) indegree.set(e.from, indegree.get(e.from) ?? 0);
  }

  // Rule 1 — exactly one start node (zero incoming edges).
  const starts = parsed.nodes.filter(n => (indegree.get(n.id) ?? 0) === 0);
  if (parsed.nodes.length === 0) {
    violations.push({
      rule: 'single-start',
      message: 'No nodes found — the diagram is empty. Expected exactly one start node.',
    });
  } else if (starts.length === 0) {
    violations.push({
      rule: 'single-start',
      message:
        'No start node: every node has an incoming edge (possible cycle). Expected exactly one start node.',
    });
  } else if (starts.length > 1) {
    const names = starts.slice(0, 5).map(n => `"${n.id}"`).join(', ');
    violations.push({
      rule: 'single-start',
      message: `Found ${starts.length} start nodes (${names}${starts.length > 5 ? ', …' : ''}) — expected exactly one.`,
      nodeId: starts[0]?.id,
    });
  }

  // Rule 2 — at least one end node (zero outgoing edges).
  const ends = parsed.nodes.filter(n => (outdegree.get(n.id) ?? 0) === 0);
  if (parsed.nodes.length === 0) {
    violations.push({ rule: 'has-end', message: 'No end node — the diagram is empty.' });
  } else if (ends.length === 0) {
    violations.push({
      rule: 'has-end',
      message: 'No end node: every node has an outgoing edge. Expected at least one end node.',
    });
  }

  // Rule 3 — every decision (diamond) has 2+ outgoing edges, each labelled.
  for (const n of parsed.nodes) {
    if (n.shape !== 'diamond') continue;
    const outs = outgoing.get(n.id) ?? [];
    if (outs.length < 2) {
      violations.push({
        rule: 'decision-labels',
        message: `Decision "${n.id}" has ${outs.length} outgoing edge(s) — needs 2 or more (e.g. Yes/No).`,
        nodeId: n.id,
      });
    } else {
      const unlabeled = outs.filter(e => !e.label);
      if (unlabeled.length > 0) {
        violations.push({
          rule: 'decision-labels',
          message: `Decision "${n.id}" has ${unlabeled.length} unlabelled outgoing edge(s) — every branch needs a label (e.g. Yes/No).`,
          nodeId: n.id,
        });
      }
    }
  }

  // Rule 4 — no orphan nodes (zero incoming AND zero outgoing).
  for (const n of parsed.nodes) {
    if ((indegree.get(n.id) ?? 0) === 0 && (outdegree.get(n.id) ?? 0) === 0) {
      violations.push({
        rule: 'no-orphans',
        message: `Node "${n.id}" is orphaned (no incoming or outgoing edges) — connect it or remove it.`,
        nodeId: n.id,
      });
    }
  }

  // Rule 5 — no duplicate node IDs.
  for (const n of parsed.nodes) {
    if (n.definitions > 1) {
      violations.push({
        rule: 'no-duplicates',
        message: `Node ID "${n.id}" is defined ${n.definitions} times — IDs must be unique.`,
        nodeId: n.id,
      });
    }
  }

  return violations;
}

/** Score a validation: how many of the TOTAL_RULES passed. */
export function scoreFlowchart(
  parsed: ParsedFlowchart,
  violations: Violation[],
): FlowchartScore {
  if (parsed.diagramType !== 'flowchart') return { passed: 0, total: 0, score: 100 };
  const failed = new Set(violations.map(v => v.rule));
  const passed = TOTAL_RULES - failed.size;
  return { passed, total: TOTAL_RULES, score: Math.round((passed / TOTAL_RULES) * 100) };
}

/** Parse → validate → score in one call. */
export function validateMermaid(mermaidCode: string): ValidationResult {
  const parsed = parseFlowchart(mermaidCode);
  const skipped = parsed.diagramType !== 'flowchart';
  const violations = validateFlowchart(parsed);
  const score = scoreFlowchart(parsed, violations);
  return { parsed, violations, score, skipped };
}

/**
 * Build the single repair request: original prompt + generated code +
 * violations list, instructing the model to fix only the listed issues.
 */
export function buildRepairPrompt(
  originalPrompt: string,
  mermaidCode: string,
  violations: Violation[],
): string {
  const listed = violations
    .map((v, i) => `${i + 1}. [${v.rule}]${v.nodeId ? ` (node "${v.nodeId}")` : ''} ${v.message}`)
    .join('\n');
  return (
    `Original request:\n${originalPrompt}\n\n` +
    `Generated Mermaid diagram:\n\`\`\`mermaid\n${mermaidCode}\n\`\`\`\n\n` +
    `This diagram has the following structural issues:\n${listed}\n\n` +
    `Fix only these listed issues, make no other changes. ` +
    `Respond ONLY with valid Mermaid source wrapped in a \`\`\`mermaid ... \`\`\` code block.`
  );
}
