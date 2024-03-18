export default class MEGSCombatant extends Combatant { 
    // https://foundryvtt.com/api/classes/client.Combatant.html

    // getInitiativeRoll(formula: string): Roll


    _getInitiativeFormula(combatant) {
        console.error("TEST: combatant.rollInitiative()")
        console.error(this.actor);
        return super._getInitiativeFormula(combatant);
      }
    
    // this.actor

    // rollInitiative(formula: string)
    rollInitiative(formula) {
        console.error("TEST: combatant.rollInitiative()")
        console.error(this.actor);
        return super.rollInitiative(formula);
    }

    // prepareDerivedData()

    // _getInitiativeFormula
}