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

            while (!hasReturned) {
                if (!hasCalled) {
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
                                callback: (html) => {},
                            },
                            button1: {
                                label: "Submit",
                                callback: (html) => {
                                    const form = html[0].querySelector('form');
                                    const hpSpentInitiative = parseInt(form.hpSpentInitiative.value) || 0;
                                    console.error("TEST123");
                                    console.error(html);
                                    // baseFormula += ` + ${initiativeBonus}`;
                                    hasReturned = true;
                                }
                            }
                        },
                        default: "button1"
                    }).render(true);
                    hasCalled = true;
                }
            }
            console.error("TEST3");
            return baseFormula;
        } else {
            return baseFormula;
        }
    }

    async _handleHPInitiativeDialog() {
    }
}