import { beforeEach, describe, expect, it, vi } from 'vitest'

class CloneCheckingBroadcastChannel {
  static instances: CloneCheckingBroadcastChannel[] = []
  onmessage: ((event: MessageEvent) => void) | null = null
  posted: unknown[] = []

  constructor(readonly name: string) {
    CloneCheckingBroadcastChannel.instances.push(this)
  }

  postMessage(payload: unknown) {
    this.posted.push(structuredClone(payload))
  }

  close() {}
}

describe('presentation session synchronization', () => {
  beforeEach(() => {
    vi.resetModules()
    CloneCheckingBroadcastChannel.instances = []
    vi.stubGlobal('BroadcastChannel', CloneCheckingBroadcastChannel)
  })

  it('broadcasts role and workflow changes as cloneable plain snapshots', async () => {
    const state = await import('@/shared/demo/presentation-state')
    state.enablePresentationSync()
    state.switchDemoRole('SECURITY')

    const channel = CloneCheckingBroadcastChannel.instances[0]
    const update = channel.posted.at(-1) as Record<string, any>
    expect(update).toMatchObject({ type: 'state', activeRoleId: 'SECURITY', lastActor: '现场安保员' })
    expect(update.tasks[0].attributes.progressPercent).toBe(70)
    expect(update.tasks[0]).not.toBe(state.presentationState.tasks[0])
  })

  it('applies a remote workflow snapshot to the live session state', async () => {
    const state = await import('@/shared/demo/presentation-state')
    state.enablePresentationSync()
    const channel = CloneCheckingBroadcastChannel.instances[0]

    channel.onmessage?.({ data: {
      type: 'state',
      source: 'another-tab',
      activeRoleId: 'SUPPORT',
      incidents: JSON.parse(JSON.stringify(state.presentationState.incidents)),
      tasks: [{ ...JSON.parse(JSON.stringify(state.presentationState.tasks[0])), attributes: { ...JSON.parse(JSON.stringify(state.presentationState.tasks[0].attributes)), progressPercent: 88 } }],
      revision: 9,
      lastAction: '反馈任务：TSK-260926-01，进度 88%',
      lastActor: '现场安保员',
    } } as MessageEvent)

    expect(state.presentationState.activeRoleId).toBe('SUPPORT')
    expect(state.presentationState.tasks[0].attributes.progressPercent).toBe(88)
    expect(state.presentationState.revision).toBe(9)
    expect(state.presentationState.lastAction).toContain('88%')
  })
})
