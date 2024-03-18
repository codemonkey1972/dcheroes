export default class MEGSCombatant extends Combatant { 
    // https://foundryvtt.com/api/classes/client.Combatant.html

    // getInitiativeRoll(formula: string): Roll

    getInitiativeRoll(formula) {
        console.error("TEST: combatant.getInitiativeRoll()")
        console.error(this.actor);
        return super.getInitiativeRoll(formula);
    }

    // this.actor

    // rollInitiative(formula: string)


    // prepareDerivedData()

    // _getInitiativeFormula
}