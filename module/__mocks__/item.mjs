/* eslint-env jest */

import { jest } from '@jest/globals'

// TODO change to DCHeroesItem
/**
 * DCHeroesItem
 */
global.dccItemRollSpellCheckMock = jest.fn((options) => {})
class DCHeroesItem {
  constructor (name = null, type = undefined, systemData = {}) {
    this.name = name
    this.type = type
    this.system = systemData
  }
}
global.DCHeroesItem = DCHeroesItem
