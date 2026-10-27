import { describe, expect, it } from 'vitest'
import type { RunningToolCall } from '@deepseek-ai/dsh-client-ui-conversation/client'
import { PartialArguments } from '@deepseek-ai/dsh-util-values'
import { deriveWorkflowLayout } from '../src/client/projection/layout.ts'

function cells(call: RunningToolCall) {
  return deriveWorkflowLayout({ nodes: [], partial: null, runningCalls: [call] })
    .flatMap(turn => turn.groups.flatMap(group => group.cells))
}

describe('Workflow tool preparation', () => {
  const preparing: RunningToolCall = {
    phase: 'preparing', callId: 'root', name: 'run_code', turn: 1, step: 1, time: 100,
    args: PartialArguments.fromObject({}),
    subCalls: [{
      phase: 'preparing', callId: 'child', name: 'read', turn: 1, step: 1,
      time: 110, parentCallId: 'root', subCalls: [],
      args: PartialArguments.fromObject({}),
    }],
  }

  it('shows root and nested preparing calls without inventing arguments', () => {
    const result = cells(preparing)
    expect(result.map(cell => cell.text)).toEqual(['run_code', 'read'])
    expect(result.every(cell => cell.timeSeconds === null)).toBe(true)
    expect(result.every(cell => cell.inputDetail === undefined)).toBe(true)
    expect(result.every(cell => cell.previewMarkdown === undefined)).toBe(true)
  })

  it('reveals complete arguments when root and nested calls dispatch', () => {
    const result = cells({
      ...preparing, phase: 'start', argsRaw: '{"code":"read()"}',
      args: PartialArguments.fromObject({ code: 'read()' }),
      subCalls: [{
        ...preparing.subCalls[0]!, phase: 'start', argsRaw: '{"path":"README.md"}',
        args: PartialArguments.fromObject({ path: 'README.md' }),
      } as RunningToolCall],
    })
    expect(result.map(cell => cell.inputDetail))
      .toEqual(['{"code":"read()"}', '{"path":"README.md"}'])
  })
})
