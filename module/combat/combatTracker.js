export default class MEGSCombatTracker extends CombatTracker {
    async _onCombatantControl (event) {
        console.error("TEST9");
        console.error(event);
        const test = super._onCombatantControl(event);
        console.error(test);
        return test;
    }
}