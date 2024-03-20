export default class MEGSCombatant extends Combatant { 
    // https://foundryvtt.com/api/classes/client.Combatant.html

    _onCreate(data, options, userID) {
        super._onCreate(data, options, userID);
        this.actor.system.initiativeBonus.value = this.actor._calculateInitiativeBonus();
    }

    /** @override */
    getInitiativeRoll(formula) {
        console.error("TEST2");


        this._handleHPInitiativeDialog().then((response) => {
            console.error("TEST5: ");
            console.error(response);
            const roll = super.getInitiativeRoll(formula);
            console.error(roll);
            return roll;
        });
    }

    /** @override */
    async rollInitiative(formula) {
        console.error("TEST5: rollInitiative");
        const roll = super.rollInitiative(formula);
        console.error(roll);
        return roll;
    }

    /** @override */
    _getInitiativeFormula(combatant) {
        let baseFormula = super._getInitiativeFormula(combatant);
        const initiativeBonus = this.actor._calculateInitiativeBonus();
    
        if (initiativeBonus > 0) {
          baseFormula += ` + ${initiativeBonus}`;
        }

        return baseFormula;
    }

    // TODO implement this
    // if (this.actor.system.heroPoints.value > 0) {
    //     const hpSpentInitiative = await _handleHPInitiativeDialog()
    //     if (hpSpentInitiative > 0) {
    //         baseFormula += ` + ${hpSpentInitiative}`;
    //     }
    // }
    async _handleHPInitiativeDialog() {
        console.error("TEST3");
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
        const maxHpToSpend = 999;
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