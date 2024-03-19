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

        console.error(this.actor);
        if (this.actor.system.heroPoints > 0) {
            console.error(this.actor.system.heroPoints);
            const template = "systems/dcheroes/templates/actor/dialogs/initiativeDialog.hbs";
            const data = {
                "maxHpToSpend": this.actor.system.heroPoints.value,
            };
            renderTemplate(template, data).then((dialogHtml) => {
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
                            console.error("TEST123");
                            console.error(html);
                            // TODO
                            // baseFormula += ` + ${initiativeBonus}`;

                            return baseFormula;
                        }
                    }
                    },
                    default: "button1"
                }).render(true);
            });
        }
        return baseFormula;
    }
}