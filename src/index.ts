import { generateDifferences, showInvisibles } from 'prettier-linter-helpers'
import type { Difference } from 'prettier-linter-helpers'
import type { Rule } from 'eslint'

const { INSERT, DELETE, REPLACE } = generateDifferences

export const messages = {
  [INSERT]: 'Insert `{{ insertText }}`',
  [DELETE]: 'Delete `{{ deleteText }}`',
  [REPLACE]: 'Replace `{{ deleteText }}` with `{{ insertText }}`',
}

function _reportDifference(
  context: Rule.RuleContext,
  difference: Difference,
  rangeOffset = 0,
) {
  const { operation, offset, deleteText = '', insertText = '' } = difference
  const range = [
    offset + rangeOffset,
    offset + rangeOffset + deleteText.length,
  ] as [number, number]

  const [start, end] = range.map(index => context.sourceCode.getLocFromIndex(index))

  context.report({
    messageId: operation,
    data: {
      deleteText: showInvisibles(deleteText),
      insertText: showInvisibles(insertText),
    },
    loc: { start, end },
    fix: fixer => fixer.replaceTextRange(range, insertText),
  })
}

export function reportDifferences(
  context: Rule.RuleContext,
  source: string,
  formatted: string,
  offset = 0,
) {
  if (source !== formatted) {
    const differences = generateDifferences(source, formatted)
    for (const difference of differences)
      _reportDifference(context, difference, offset)
  }
}
