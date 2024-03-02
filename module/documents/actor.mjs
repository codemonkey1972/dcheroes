/**
 * Extend the base Actor document by defining a custom roll data structure which is ideal for the Simple system.
 * @extends {Actor}
 */
export class DCHeroesActor extends Actor {
  /** @override */
  prepareData() {
    // Prepare data for the actor. Calling the super version of this executes
    // the following, in order: data reset (to clear active effects),
    // prepareBaseData(), prepareEmbeddedDocuments() (including active effects),
    // prepareDerivedData().
    super.prepareData();
  }

  /** @override */
  prepareBaseData() {
    // Data modifications in this step occur before processing embedded
    // documents or derived data.
  }

  /**
   * @override
   * Augment the actor source data with additional dynamic data. Typically,
   * you'll want to handle most of your calculated/derived data in this step.
   * Data calculated in this step should generally not exist in template.json
   * (such as attribute modifiers rather than attribute scores) and should be
   * available both inside and outside of character sheets (such as if an actor
   * is queried and has a roll executed directly from it).
   */
  prepareDerivedData() {
    const actorData = this;
    const systemData = actorData.system;
    const flags = actorData.flags.dcheroes || {};

    // Make separate methods for each Actor type (character, npc, etc.) to keep
    // things organized.
    this._prepareCharacterData(actorData);
    this._prepareNpcData(actorData);  
  }

  /**
   * Prepare Character type specific data
   */
  _prepareCharacterData(actorData) {
    if (actorData.type !== 'character') return;

    // Make modifications to data here. For example:
    const systemData = actorData.system;

    // derived data goes here
 
    // calculate initiativeBonus
    // TODO initiative
    // Martial artist gives a +2
    let initiativeBonus = 0;
    console.error("*************** TEST POWERS");
    console.error(actorData);

    // Superspeed adds APs of their power
    if (this._hasAbility(actorData.powers, "Superspeed")) { // TODO use UID system for powers? also use constant
      initiativeBonus += this._getAbilityAPs(actorData.powers, "Superspeed");
    }
    // Lightning Reflexes gives +2
    // Water Freedom applies when submerged in water
    actorData.system.initiativeBonus.value = initiativeBonus;
  }

  /**
   * Loop through array to see if it contains designated power/skill
   * @param {L} array 
   * @param {*} name 
   */
  _hasAbility(array, name) {
    console.error("IN _hasAbility: "+name);
    console.log(array);
    array.forEach(attribute => {
      console.error(attribute.name);
      if (attribute.name === name) {
        console.error("_hasAbility: true");
        return true;
      }
    });
    console.error("_hasAbility: false");
    return false;
  }

  /**
   * Loop through array to get number of APs in designated power/skill
   * @param {*} array 
   * @param {*} name 
   */
  _getAbilityAPs(array, name) {
    array.forEach(attribute => {
      if (attribute.name === "Superspeed") {
        console.error("TEST: _getAbilityAPs");
        console.error(attribute);
        return attribute.aps;
      }
    });
    return false;

  }

  /**
   * Prepare NPC type specific data.
   */
  _prepareNpcData(actorData) {
    if (actorData.type !== 'npc') return;

    // Make modifications to data here. For example:
    const systemData = actorData.system;
    systemData.xp = systemData.cr * systemData.cr * 100;
  }

  /**
   * Override getRollData() that's supplied to rolls.
   */
  getRollData() {
    // Starts off by populating the roll data with `this.system`
    const data = { ...super.getRollData() };

    // Prepare character roll data.
    this._getCharacterRollData(data);
    this._getNpcRollData(data);

    return data;
  }

  /**
   * Prepare character roll data.
   */
  _getCharacterRollData(data) {
    if (this.type !== 'character') return;

    // Copy the attribute scores to the top level, so that rolls can use
    // formulas like `@str.mod + 4`.
    if (data.attributes) {
      for (let [k, v] of Object.entries(data.attributes)) {
        data[k] = foundry.utils.deepClone(v);
      }
  }
  }

  /**
   * Prepare NPC roll data.
   */
  _getNpcRollData(data) {
    if (this.type !== 'npc') return;

    // Process additional NPC data here.
  }
}
