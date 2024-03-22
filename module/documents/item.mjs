import { DCHEROES } from "../helpers/config.mjs";

/**
 * Extend the basic Item with some very simple modifications.
 * @extends {Item}
 */
export class DCHeroesItem extends Item {

  /**
  * @override
  */
  constructor(data, context) {
    super(data, context);
  }

  /**
   * Augment the basic Item data model with additional dynamic data.
   */
  prepareData() {
    // As with the actor class, items are documents that can have their data
    // preparation methods overridden (such as prepareBaseData()).
    super.prepareData();
  }

  /**
   * @override
   * Augment the item source data with additional dynamic data. Typically,
   * you'll want to handle most of your calculated/derived data in this step.
   * Data calculated in this step should generally not exist in template.json
   * (such as attribute modifiers rather than attribute scores) and should be
   * available both inside and outside of character sheets (such as if an actor
   * is queried and has a roll executed directly from it).
   */
  prepareDerivedData() {
    const itemData = this;
    const systemData = itemData.system;

    // replace default icon if another has been specified in template.json
    if (itemData.img === "icons/svg/item-bag.svg") {
      if (systemData.img !== "") {
        this.img = systemData.img;
      }
    }

    // calculate total cost of the item
    if (systemData.hasOwnProperty("baseCost")) {
      if (systemData.hasOwnProperty("factorCost") && systemData.hasOwnProperty("aps")) {
        systemData.totalCost = systemData.baseCost + (systemData.factorCost * systemData.aps);
      } else {
        systemData.totalCost = systemData.baseCost;
      }
      this.totalCost = systemData.totalCost;
    }

    // import constants
    systemData.powerTypes = DCHEROES.powerTypes;
    systemData.powerSources = DCHEROES.powerSources;
    systemData.ranges = DCHEROES.ranges;
  }

  /**
   * Prepare a data object which defines the data schema used by dice roll commands against this Item
   * @override
   */
  getRollData() {
    // Starts off by populating the roll data with `this.system`
    const rollData = { ...super.getRollData() };

    // Quit early if there's no parent actor
    if (!this.actor) return rollData;

    // If present, add the actor's roll data
    rollData.actor = this.actor.getRollData();

    return rollData;
  }

  /**
   * Handle clickable rolls.
   * @param {Event} event   The originating click event
   * @private
   */
  async roll() {
    const item = this;

    // Initialize chat data.
    const speaker = ChatMessage.getSpeaker({ actor: this.actor });
    const rollMode = game.settings.get('core', 'rollMode');
    const label = `[${item.type}] ${item.name}`;

    // If there's no roll data, send a chat message.
    if (!this.system.formula) {
      ChatMessage.create({
        speaker: speaker,
        rollMode: rollMode,
        flavor: label,
        content: item.system.description ?? '',
      });
    }
    // Otherwise, create a roll and send a chat message from it.
    else {
      // Retrieve roll data.
      const rollData = this.getRollData();

      // Invoke the roll and submit it to chat.
      const roll = new Roll(rollData.formula, rollData);
      // If you need to store the value first, uncomment the next line.
      // const result = await roll.evaluate();
      roll.toMessage({
        speaker: speaker,
        rollMode: rollMode,
        flavor: label,
      });
      return roll;
    }
  }
}
