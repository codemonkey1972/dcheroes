import { DCHEROES } from "../helpers/config.mjs";

export default class MEGSCombat extends Combat { 

    // TODO always getting an error here
    // _manageTurnEvents () {

    // }

  _sortCombatants(a, b) {
    const initA = Number.isNumeric(a.initiative) ? a.initiative : -9999;
    const initB = Number.isNumeric(b.initiative) ? b.initiative : -9999;

    let initDifference = initB - initA;
    if (initDifference != 0) {
      return initDifference;
    }

    const typeA = a.actor.type;
    const typeB = b.actor.type;

    if (typeA !== typeB) {
      if (typeA === DCHEROES.characterTypes.hero) {
        return -1;
      }
      if (typeB === DCHEROES.characterTypes.hero) {
        return 1;
      }
    }

    return a.tokenId - b.tokenId;
  }

  async nextRound() {
    // TODO reroll initiative if no history beyond this exists
    console.error("TEST: MEGSCombat.nextRound()");
    return super.nextRound()
  }

}