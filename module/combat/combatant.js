export default class MEGSCombatant extends Combatant { 
    // https://foundryvtt.com/api/classes/client.Combatant.html

    _onCreate(data, options, userID) {
        super._onCreate(data, options, userID);
        this.actor.system.initiativeBonus.value = this.actor._calculateInitiativeBonus();
    }

    _getInitiativeFormula(combatant) {
        let baseFormula = super._getInitiativeFormula(combatant);
        const initiativeBonus = this.actor._calculateInitiativeBonus();
    
        if (initiativeBonus > 0) {
          baseFormula += ` + ${initiativeBonus}`;
        }

        if (this.actor.system.heroPoints.value > 0) {
            let hasCalled = false;
            let hasReturned = false;

            console.error("TEST1");
            const template = "systems/dcheroes/templates/actor/dialogs/initiativeDialog.hbs";
            const data = {
                "maxHpToSpend": this.actor.system.heroPoints.value,
            };
            let dialogHtml = renderTemplate(template, data);
            console.error("TEST2");
            console.log(dialogHtml);
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
                            console.error(hpSpentInitiative);
                            baseFormula += ` + ${hpSpentInitiative}`;
                            console.error(baseFormula);
                            hasReturned = true;
                        }
                    }
                },
                default: "button1"
            }).render(true);
            console.error("TEST5");
            hasCalled = true;

            while (!hasReturned) {
            }
            console.error("TEST6");
            return baseFormula;
        } else {
            return baseFormula;
        }
    }

    async _handleHPInitiativeDialog() {
    }
}