export default class MEGSCombatant extends Combatant { 
    // https://foundryvtt.com/api/classes/client.Combatant.html

    _onCreate(data, options, userID) {
        super._onCreate(data, options, userID);
        console.error("TEST: combatant._onCreate()")
        this.actor.system.initiativeBonus  = this.actor._calculateInitiativeBonus();
    }

    _getInitiativeFormula(combatant) {
        let baseFormula = super._getInitiativeFormula(combatant);
        const initiativeBonus = this.actor._calculateInitiativeBonus();
    
        if (initiativeBonus > 0) {
          baseFormula += ` + ${initiativeBonus}`;
        }
        return baseFormula;
    }

    // rollInitiative(formula: string)
    rollInitiative(formula) {
        console.error("TEST: combatant.rollInitiative()")
        console.error(this.actor);
        return super.rollInitiative(formula);
    }

    // prepareDerivedData()

    // _getInitiativeFormula
}