export default class MEGSCombatTracker extends CombatTracker {
    async _onCombatantControl (event) {
        console.error("TEST9");
        console.error(event);
        return super._onCombatantControl(event);
    }
}