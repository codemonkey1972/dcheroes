export default class MEGSCombatant extends Combatant { 
    // https://foundryvtt.com/api/classes/client.Combatant.html

    _onCreate(data, options, userID) {
        super._onCreate(data, options, userID);
        this.actor.system.initiativeBonus.value = this.actor._calculateInitiativeBonus();
    }

    /** @override */
    getInitiativeRoll(formula) {
        console.error("TEST2");
        const roll = super.getInitiativeRoll(formula);
        console.error(roll);
        console.error(this);
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
}