import { DCHEROES } from "../helpers/config.mjs";

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

    // Make separate methods for each Actor type (hero, npc, etc.) to keep
    // things organized.
    this._prepareHeroData(actorData);
    this._prepareVillainData(actorData);
    this._prepareNpcData(actorData);  
  }

  /**
   * Prepare Hero type specific data
   */
  _prepareHeroData(actorData) {
    if (actorData.type !== DCHEROES.characterTypes.hero) return;

    // Make modifications to data here. For example:
    const systemData = actorData.system;
  }

  /**
   * Prepare Villain type specific data
   */
  _prepareVillainData(actorData) {
    if (actorData.type !== 'villain') return;

    // Make modifications to data here. For example:
    const systemData = actorData.system;
  }

  _calculateInitiativeBonus() {
    console.error("TEST actor.mjs._calculateInitiativeBonus");
// TODO replace all of this with effects?

    // calculate initiativeBonus
    console.error(this);
    let initiativeBonus = this.system.attributes.dex.value + this.system.attributes.int.value
        + this.system.attributes.infl.value;

    // Superspeed adds APs of their power
    if (this._hasAbility(this.items, DCHEROES.powers.SUPERSPEED)) { 
      const aps = this._getAbilityAPs(this.items, DCHEROES.powers.SUPERSPEED);
      initiativeBonus = initiativeBonus + aps;
    }

    // Martial artist gives a +2
    if (this._hasAbility(this.items, DCHEROES.skills.MARTIAL_ARTIST)) {
      initiativeBonus = initiativeBonus + 2;
    }

    // Lightning Reflexes gives +2
    if (this._hasAbility(this.items, DCHEROES.advantages.LIGHTNING_REFLEXES)) {
      initiativeBonus = initiativeBonus + 2;
    }

    // Water Freedom applies when submerged in water
    // TODO dialog prompt for modifiers
    if (this._hasAbility(this.items, DCHEROES.powers.WATER_FREEDOM)) {
      // TODO add checkbox if has Water Freedom for if is in water
    }

    return initiativeBonus;
}

/**
   * Loop through array to see if it contains designated power/skill
   * @param {L} array 
   * @param {*} name 
   */
  _hasAbility(array, name) {
    let hasAbility = false;
    array.forEach(attribute => {
       if (attribute.name === name) {
        hasAbility = true;
      }
    });
    return hasAbility;
  }

  /**
   * Loop through array to get number of APs in designated power/skill
   * @param {*} array 
   * @param {*} name 
   */
  _getAbilityAPs(array, name) {
    let aps = 0;
    array.forEach(attribute => {
      if (attribute.name === name) {
        aps = attribute.system.aps;
      }
    });
    return aps;
  }

  /**
   * Prepare NPC type specific data.
   */
  _prepareNpcData(actorData) {
    if (actorData.type !== 'npc') return;

    // Make modifications to data here. For example:
    // const systemData = actorData.system;
    // systemData.xp = systemData.cr * systemData.cr * 100;
  }

  /**
   * Override getRollData() that's supplied to rolls.
   */
  getRollData() {
    // Starts off by populating the roll data with `this.system`
    const data = { ...super.getRollData() };

    // Prepare character roll data.
    this._getHeroRollData(data);
    this._getVillainRollData(data);
    this._getNpcRollData(data);

    return data;
  }

  /**
   * Prepare hero roll data.
   */
  _getHeroRollData(data) {
    if (this.type !== DCHEROES.characterTypes.hero) return;
  }

  /**
   * Prepare NPC roll data.
   */
  _getNpcRollData(data) {
    if (this.type !== 'npc') return;

    // Process additional NPC data here.
  }

  /**
   * Prepare NPC roll data.
   */
  _getVillainRollData(data) {
    if (this.type !== 'villain') return;

    // Process additional NPC data here.
  }
}
