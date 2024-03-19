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
        const template = "systems/dcheroes/templates/actor/dialogs/initiativeDialog.hbs";
        const data = {
          "maxHpToSpend": this.actor.system.heroPoints.value,
        };
        renderTemplate(template, data).then((dialogHtml) => {
            const d = new Dialog({
                title: localize("Spend HP on Initiative?"),
                content: dialogHtml,
                buttons: {
                  button2: {
                    label: localize("Close"),
                    callback: (html) => {},
                  },
                  button1: {
                    label: localize("Submit"),
                    callback: (html) => {
                        console.error("TEST123");
                        console.error(html);
                    }
                  }
                },
                default: "button1"
              }).render(true);
        });

        return baseFormula;
    }
}