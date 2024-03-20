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

  async rollInitiative(ids, options) {
    console.error("TEST1");
    const initiative = await super.rollInitiative(ids, options);
    console.error(initiative);
    return initiative;
  }

  async _handleHPInitiativeDialog() {
    const template = "systems/dcheroes/templates/actor/dialogs/initiativeDialog.hbs";
    const data = {
        "maxHpToSpend": this.actor.system.heroPoints.value,
    };
    let dialogHtml = renderTemplate(template, data);
    const d = new Dialog({
        title: "Spend HP on Initiative?",
        content: dialogHtml,
        buttons: {
            button2: {
                label: "Close",
                callback: (html) => {
                    hasReturned = true;
                },
            },
            button1: {
                label: "Submit",
                callback: (html) => {
                    const form = html[0].querySelector('form');
                    const hpSpentInitiative = parseInt(form.hpSpentInitiative.value) || 0;
                    return hpSpentInitiative
                }
            }
        },
        default: "button1"
    }).render(true);
  }

  async nextRound() {
    // TODO reroll initiative if no history beyond this exists
    console.error("TEST: MEGSCombat.nextRound()");
    return super.nextRound()
  }

}