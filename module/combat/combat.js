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

  async rollInitiative(formula) {
    // TODO
    console.error("TEST: combat.rollInitiative (async)");

    await this._handleHPInitiativeDialog().then((response) => {
      console.error(response);
      return super.rollInitiative(formula);    
    });


  }

  async nextRound() {
    // TODO reroll initiative if no history beyond this exists
    console.error("TEST: MEGSCombat.nextRound()");
    return super.nextRound()
  }

      // TODO implement this
    // if (this.actor.system.heroPoints.value > 0) {
    //     const hpSpentInitiative = await _handleHPInitiativeDialog()
    //     if (hpSpentInitiative > 0) {
    //         baseFormula += ` + ${hpSpentInitiative}`;
    //     }
    // }
    async _handleHPInitiativeDialog() {
      console.error("TEST3: combatant._handleHPInitiativeDialog()");
/*        const template = "systems/dcheroes/templates/actor/dialogs/initiativeDialog.hbs";
      const data = {
          // TODO
          // "maxHpToSpend": this.actor.system.heroPoints.value,
          "maxHpToSpend": 999,
      };
      let dialogHtml = renderTemplate(template, data);

      await new Dialog({
          title: "Spend HP on Initiative?",
          content: dialogHtml,
          buttons: {
              button2: {
                  label: "Close",
                  callback: (html) => {},
              },
              button1: {
                  label: "Submit",
                  callback: (html) => {
                      console.error("TEST4");
                      const form = html[0].querySelector('form');
                      const hpSpentInitiative = parseInt(form.hpSpentInitiative.value) || 0;
                      return hpSpentInitiative
                  }
              }
          },
          default: "button1"
      }).render(true);
*/
      const template = "systems/dcheroes/templates/actor/dialogs/initiativeDialog.hbs";
      const maxHpToSpend = 999; // TODO
      const data = {
          "maxHpToSpend": maxHpToSpend,
      };
      let dialogHtml = await this._renderTemplate(template, data);

      await new Dialog({
          title: "Spend HP on Initiative?",
          content: dialogHtml,
          buttons: {
            button2: {
              label: "Close",
              callback: () => {},
            },
            button1: {
              label: "Submit",
              callback: (html) => {
                  console.error("TEST4");
                  const form = html[0].querySelector('form');
                  const hpSpentInitiative = parseInt(form.hpSpentInitiative.value) || 0;
                  return hpSpentInitiative
              }
            }
          },
          default: "button1"
        }).render(true);
  
  }

  /**
   * 
   * @param {*} template 
   * @param {*} data 
   * @returns 
   */
  async _renderTemplate(template, data) {
      return await renderTemplate(template, data);
  }

}