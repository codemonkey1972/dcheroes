export default class MEGSCombatant extends Combatant { 
    // https://foundryvtt.com/api/classes/client.Combatant.html

    _onCreate(data, options, userID) {
        console.error("TEST0");
        super._onCreate(data, options, userID);
        this.actor.system.initiativeBonus.value = this.actor._calculateInitiativeBonus();
    }

        // TODO
        // if (this.actor.system.heroPoints.value > 0) {
        //     const hpSpentInitiative = await _handleHPInitiativeDialog()
        //     if (hpSpentInitiative > 0) {
        //         baseFormula += ` + ${hpSpentInitiative}`;
        //     }
        // }

    /** @override */
    _getInitiativeFormula(combatant) {
        let baseFormula = super._getInitiativeFormula(combatant);
        const initiativeBonus = this.actor._calculateInitiativeBonus();
    
        if (initiativeBonus > 0) {
          baseFormula += ` + ${initiativeBonus}`;
        }

        return baseFormula;
    }

    /** @override */
    async rollInitiative(formula) {
        console.error("TEST1: combatant.rollInitiative()")
        return super.rollInitiative(formula);
    }

    /** @override */
    prepareDerivedData() {
        console.error("TEST1: combatant.prepareDerivedData()")
        super.prepareDerivedData();
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
                        console.error("TEST4");
                        console.error(html);
                        const form = html[0].querySelector('form');
                        console.error(form);
                        const hpSpentInitiative = parseInt(form.hpSpentInitiative.value) || 0;
                        return hpSpentInitiative
                    }
                }
            },
            default: "button1"
        }).render(true);

    }
}