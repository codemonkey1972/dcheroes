/* global CONFIG, DCHeroesItem, actorUpdateMock, rollToMessageMock, collectionFindMock, dccRollCreateRollMock, dccItemRollSpellCheckMock, uiNotificationsWarnMock, itemTypesMock, game, test, expect */
/**
 * Tests for Actor.mjs using Foundry Mocks.
 * Mocks for Foundry Classes/Functions are found in __mocks__/foundry.mjs
 * Mocks for DCHeroesItem Class are found in __mocks__/item.mjs
 * eslint-env jest
 **/

import { DCHeroesActor } from '../documents/actor.mjs';

// Create Base Test Actor
const actor = new DCHeroesActor();

test('prepareData sets ability modifiers', () => {
  expect(actor.name).toBe('Batman')

  const attributes = actor.system.attributes
  expect(attributes.dex.value).toEqual(9)
  expect(attributes.str.value).toEqual(5)
  expect(attributes.body.value).toEqual(6)
  expect(attributes.int.value).toEqual(12)
  expect(attributes.will.value).toEqual(12)
  expect(attributes.mind.value).toEqual(10)
  expect(attributes.infl.value).toEqual(10)
  expect(attributes.aura.value).toEqual(8)
  expect(attributes.spirit.value).toEqual(10)
})

/*
test('roll ability check', async () => {
  global.dccRollCreateRollMock.mockClear()

  await actor.rollAbilityCheck('str')
  expect(global.dccRollCreateRollMock).toHaveBeenCalledTimes(1)
  expect(global.dccRollCreateRollMock).toHaveBeenCalledWith(
    [
      {
        type: 'Die',
        label: 'ActionDie',
        formula: '1d20',
        presets: [
          {
            formula: '1d10',
            label: 'Untrained'
          }
        ]
      },
      {
        type: 'Modifier',
        label: 'AbilityStr',
        formula: -1
      },
      {
        type: 'CheckPenalty',
        formula: 0,
        apply: false
      }
    ],
    {},
    {
      title: 'AbilityStr Check'
    })
  expect(rollToMessageMock).toHaveBeenCalledWith({
    flavor: 'AbilityStr Check',
    speaker: actor,
    flags: { 'dcc.Ability': 'str', 'dcc.RollType': 'AbilityCheck' }
  })

  // Check that rollUnder option is interpreted correctly
  await actor.rollAbilityCheck('lck', { rollUnder: true })
  expect(global.dccRollCreateRollMock).toHaveBeenCalledTimes(2)
  expect(global.dccRollCreateRollMock).toHaveBeenCalledWith(
    [
      {
        type: 'Die',
        formula: '1d20'
      }
    ],
    {},
    {
      rollUnder: true,
      title: 'AbilityLck Check'
    }
  )
  expect(rollToMessageMock).toHaveBeenLastCalledWith({
    flavor: 'AbilityLck Check',
    speaker: actor,
    flags: { 'dcc.Ability': 'lck', 'dcc.RollType': 'AbilityCheckRollUnder' }
  })

  // ...both ways
  await actor.rollAbilityCheck('lck', { rollUnder: false })
  expect(global.dccRollCreateRollMock).toHaveBeenCalledTimes(3)
  expect(global.dccRollCreateRollMock).toHaveBeenCalledWith(
    [
      {
        type: 'Die',
        label: 'ActionDie',
        formula: '1d20',
        presets: [
          {
            formula: '1d10',
            label: 'Untrained'
          }
        ]
      },
      {
        type: 'Modifier',
        label: 'AbilityLck',
        formula: 3
      },
      {
        type: 'CheckPenalty',
        formula: 0,
        apply: false
      }
    ],
    {},
    {
      rollUnder: false,
      title: 'AbilityLck Check'
    })
  expect(rollToMessageMock).toHaveBeenLastCalledWith({
    flavor: 'AbilityLck Check',
    speaker: actor,
    flags: { 'dcc.Ability': 'lck', 'dcc.RollType': 'AbilityCheck' }
  })
})

test('roll initiative', async () => {
  
  dccRollCreateRollMock.mockClear()

  await actor.rollInitiative({
    name: 'Test Actor',
    id: 'xxxxxxxxxx'
  })
  expect(dccRollCreateRollMock).toHaveBeenCalledTimes(1)
  expect(dccRollCreateRollMock).toHaveBeenCalledWith(
    [
      {
        type: 'Die',
        formula: '1d20'
      },
      {
        type: 'Modifier',
        label: 'Initiative',
        formula: -1
      }
    ],
    actor.getRollData(),
    {
      title: 'RollModifierTitleInitiative'
    }
  )
  expect(rollToMessageMock).toHaveBeenCalledWith({
    flavor: 'Initiative',
    speaker: actor,
    flags: { 'dcc.RollType': 'Initiative' }
  })
  
})

test('roll skill check', async () => {
  
  dccRollCreateRollMock.mockClear()

  await actor.rollSkillCheck('customDieSkill')
  expect(dccRollCreateRollMock).toHaveBeenCalledTimes(1)
  expect(dccRollCreateRollMock).toHaveBeenCalledWith(
    [
      {
        type: 'Die',
        label: null,
        formula: '1d14',
        presets: [
          {
            formula: '1d10',
            label: 'Untrained'
          }
        ]
      },
      {
        type: 'CheckPenalty',
        apply: false,
        formula: 0
      }
    ],
    actor.getRollData(),
    {
      title: 'Custom Die Skill'
    }
  )
  expect(rollToMessageMock).toHaveBeenCalledWith({
    flavor: 'Custom Die Skill',
    speaker: actor,
    flags: { 'dcc.RollType': 'SkillCheck', 'dcc.SkillId': 'customDieSkill' }
  })

  await actor.rollSkillCheck('customDieAndValueSkill')
  expect(dccRollCreateRollMock).toHaveBeenCalledTimes(2)
  expect(dccRollCreateRollMock).toHaveBeenCalledWith(
    [
      {
        type: 'Die',
        label: null,
        formula: '1d14',
        presets: [
          {
            formula: '1d10',
            label: 'Untrained'
          }
        ]
      },
      {
        type: 'Compound',
        dieLabel: 'RollModifierDieTerm',
        modifierLabel: 'Custom Die And Value Skill',
        formula: '3'
      },
      {
        type: 'CheckPenalty',
        apply: false,
        formula: 0
      }
    ],
    actor.getRollData(),
    {
      title: 'Custom Die And Value Skill'
    }
  )
  expect(rollToMessageMock).toHaveBeenCalledWith({
    flavor: 'Custom Die And Value Skill',
    speaker: actor,
    flags: { 'dcc.RollType': 'SkillCheck', 'dcc.SkillId': 'customDieAndValueSkill' }
  })

  await actor.rollSkillCheck('actionDieSkill')
  expect(dccRollCreateRollMock).toHaveBeenCalledTimes(3)
  expect(dccRollCreateRollMock).toHaveBeenCalledWith(
    [
      {
        type: 'Die',
        label: 'ActionDie',
        formula: '1d20',
        presets: [
          {
            formula: '1d10',
            label: 'Untrained'
          }
        ]
      },
      {
        type: 'Compound',
        dieLabel: 'RollModifierDieTerm',
        modifierLabel: 'Action Die Skill',
        formula: '-4'
      },
      {
        type: 'CheckPenalty',
        apply: false,
        formula: 0
      }
    ],
    actor.getRollData(),
    {
      title: 'Action Die Skill'
    }
  )
  expect(rollToMessageMock).toHaveBeenCalledWith({
    flavor: 'Action Die Skill',
    speaker: actor,
    flags: { 'dcc.RollType': 'SkillCheck', 'dcc.SkillId': 'actionDieSkill' }
  })

  await actor.rollSkillCheck('customDieSkillWithInt')
  expect(dccRollCreateRollMock).toHaveBeenCalledTimes(4)
  expect(dccRollCreateRollMock).toHaveBeenCalledWith(
    [
      {
        type: 'Die',
        label: null,
        formula: '1d24',
        presets: [
          {
            formula: '1d10',
            label: 'Untrained'
          }
        ]
      },
      {
        type: 'CheckPenalty',
        apply: false,
        formula: 0
      }
    ],
    actor.getRollData(),
    {
      title: 'Custom Die Skill With Int'
    }
  )
  expect(rollToMessageMock).toHaveBeenCalledWith({
    flavor: 'Custom Die Skill With Int (AbilityInt)',
    speaker: actor,
    flags: { 'dcc.RollType': 'SkillCheck', 'dcc.SkillId': 'customDieSkillWithInt' }
  })

  await actor.rollSkillCheck('customDieAndValueSkillWithPer')
  expect(dccRollCreateRollMock).toHaveBeenCalledTimes(5)
  expect(dccRollCreateRollMock).toHaveBeenCalledWith(
    [
      {
        type: 'Die',
        label: null,
        formula: '1d24',
        presets: [
          {
            formula: '1d10',
            label: 'Untrained'
          }
        ]
      },
      {
        type: 'Compound',
        dieLabel: 'RollModifierDieTerm',
        modifierLabel: 'Custom Die And Value Skill With Per (AbilityPer)',
        formula: '3'
      },
      {
        type: 'CheckPenalty',
        apply: false,
        formula: 0
      }
    ],
    actor.getRollData(),
    {
      title: 'Custom Die And Value Skill With Per'
    }
  )
  expect(rollToMessageMock).toHaveBeenCalledWith({
    flavor: 'Custom Die And Value Skill With Per (AbilityPer)',
    speaker: actor,
    flags: { 'dcc.RollType': 'SkillCheck', 'dcc.SkillId': 'customDieAndValueSkillWithPer' }
  })

  await actor.rollSkillCheck('actionDieSkillWithLck')
  expect(dccRollCreateRollMock).toHaveBeenCalledTimes(6)
  expect(dccRollCreateRollMock).toHaveBeenCalledWith(
    [
      {
        type: 'Die',
        label: 'ActionDie',
        formula: '1d20',
        presets: [
          {
            formula: '1d10',
            label: 'Untrained'
          }
        ]
      },
      {
        type: 'Compound',
        dieLabel: 'RollModifierDieTerm',
        modifierLabel: 'Action Die Skill With Lck (AbilityLck)',
        formula: '4'
      },
      {
        type: 'CheckPenalty',
        apply: false,
        formula: 0
      }
    ],
    actor.getRollData(),
    {
      title: 'Action Die Skill With Lck'
    }
  )
  expect(rollToMessageMock).toHaveBeenCalledWith({
    flavor: 'Action Die Skill With Lck (AbilityLck)',
    speaker: actor,
    flags: { 'dcc.RollType': 'SkillCheck', 'dcc.SkillId': 'actionDieSkillWithLck' }
  })

})
*/
