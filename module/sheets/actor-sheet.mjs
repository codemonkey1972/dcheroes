import {
  onManageActiveEffect,
  prepareActiveEffectCategories,
} from '../helpers/effects.mjs';

/**
 * Extend the basic ActorSheet with some very simple modifications
 * @extends {ActorSheet}
 */
export class DCHeroesActorSheet extends ActorSheet {
  /** @override */
  static get defaultOptions() {
    return foundry.utils.mergeObject(super.defaultOptions, {
      classes: ['dcheroes', 'sheet', 'actor'],
      width: 600,
      height: 600,
      tabs: [
        {
          navSelector: '.sheet-tabs',
          contentSelector: '.sheet-body',
          initial: 'features',
        },
      ],
    });
  }

  /** @override */
  get template() {
    return `systems/dcheroes/templates/actor/actor-${this.actor.type}-sheet.hbs`;
  }

  /* -------------------------------------------- */

  /** @override */
  getData() {
 
    // Retrieve the data structure from the base sheet. You can inspect or log
    // the context variable to see the structure, but some key properties for
    // sheets are the actor object, the data object, whether or not it's
    // editable, the items array, and the effects array.
    const context = super.getData();

    // Use a safe clone of the actor data for further operations.
    const actorData = context.data;

    // Add the actor's data to context.data for easier access, as well as flags.
    context.system = actorData.system;
    context.flags = actorData.flags;

    // Prepare character data and items.
    if (actorData.type == 'character') {
      this._prepareItems(context);
      this._prepareCharacterData(context);
    }

    // Prepare NPC data and items.
    if (actorData.type == 'npc') {
      this._prepareItems(context);
    }

    // Prepare Villain data and items.
    if (actorData.type == 'villain') {
      this._prepareItems(context);
      this._prepareCharacterData(context);
    }

    // Add roll data for TinyMCE editors.
    context.rollData = context.actor.getRollData();

    // Prepare active effects
    context.effects = prepareActiveEffectCategories(
      // A generator that returns all effects stored on the actor
      // as well as any items
      this.actor.allApplicableEffects()
    );

    return context;
  }

  /**
   * Organize and classify Items for Character sheets.
   *
   * @param {Object} actorData The actor to prepare.
   *
   * @return {undefined}
   */
  _prepareCharacterData(context) {
    // Handle attribute scores.
    for (let [k, v] of Object.entries(context.system.attributes)) {
      v.label = game.i18n.localize(CONFIG.DCHEROES.attributes[k]) ?? k;
    }

    const initiativeBonus = this._calculateInitiativeBonus(context);

    // set value on actor sheet object
    context.system.initiativeBonus.value = initiativeBonus; // works for sheet display
    // context.document.system.initiativeBonus.value = initiativeBonus;

    // TODO set value on actor object
    // TODO initiative - this.actor.getRollData() needs to be updated
    // context.actor.system.initiativeBonus.value = initiativeBonus; // already changes
    // this.object.system.initiativeBonus.value = initiativeBonus; //does not change in actor.mjs

    // const actorId = context.actor._id;
    // let actor = game.actors.get(actorId);
    // actor.system.initiativeBonus.value = initiativeBonus; // does not change in actor.js
  }

  _calculateInitiativeBonus(context) {
    // calculate initiativeBonus
    let initiativeBonus = 0;

    // Superspeed adds APs of their power
    if (this._hasAbility(context.powers, "Superspeed")) { // TODO use UID system for powers? also use constant
      const aps = this._getAbilityAPs(context.powers, "Superspeed");
      initiativeBonus = initiativeBonus + aps;
    }

    // Martial artist gives a +2
    if (this._hasAbility(context.skills, "Martial Artist")) { // TODO use UID system for powers? also use constant
      initiativeBonus = initiativeBonus + 2;
    }

    // Lightning Reflexes gives +2
    if (this._hasAbility(context.advantages, "Lightning Reflexes")) { // TODO use UID system for powers? also use constant
      initiativeBonus = initiativeBonus + 2;
    }

    // Water Freedom applies when submerged in water
    // TODO a checkbox for is in water?

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
   * Organize and classify Items for Character sheets.
   *
   * @param {Object} actorData The actor to prepare.
   *
   * @return {undefined}
   */
  _prepareItems(context) {
    // Initialize containers.
    const gadgets = [];
    const features = []; // TODO remove
    const powers = [];
    const skills = [];
    const advantages = [];
    const drawbacks = [];
    const subskills = []; // TODO move this to item-sheet.mjs

    // Iterate through items, allocating to containers
    for (let i of context.items) {
      i.img = i.img || Item.DEFAULT_ICON;
      // Append to items.
      if (i.type === 'power') {
        powers.push(i);
      }
      // Append to features.
      else if (i.type === 'feature') {
        features.push(i);
      }
      // Append to skills.
      else if (i.type === 'skill') {
        skills.push(i);
      }
      // Append to advantages.
      else if (i.type === 'advantage') {
        advantages.push(i);
      }
      // Append to drawbacks.
      else if (i.type === 'drawback') {
        drawbacks.push(i);
      }
      // Append to subskills.
      else if (i.type === 'subskill') {
        subskills.push(i);
      }
     // Append to gadgets.
      else if (i.type === 'gadget') {
        gadgets.push(i);
    }
  }

  // Assign and return
  context.powers = powers;
  context.features = features; // TODO remove
  context.skills = skills;
  context.advantages = advantages;
  context.drawbacks = drawbacks;
  context.subskills = subskills;
  context.gadgets = gadgets;
}

  /* -------------------------------------------- */

  /** @override */
  activateListeners(html) {
    super.activateListeners(html);

    // Render the item sheet for viewing/editing prior to the editable check.
    html.on('click', '.item-edit', (ev) => {
      const li = $(ev.currentTarget).parents('.item');
      const item = this.actor.items.get(li.data('itemId'));
      item.sheet.render(true);
    });

    // -------------------------------------------------------------
    // Everything below here is only needed if the sheet is editable

    if (!this.isEditable) return;

    // Add Inventory Item
    html.on('click', '.item-create', this._onItemCreate.bind(this));

    // Delete Inventory Item
    html.on('click', '.item-delete', (ev) => {
      const li = $(ev.currentTarget).parents('.item');
      const item = this.actor.items.get(li.data('itemId'));
      item.delete();
      li.slideUp(200, () => this.render(false));
    });

    // Active Effect management
    // TODO delete
    // html.on('click', '.effect-control', (ev) => {
    //   const row = ev.currentTarget.closest('li');
    //   const document =
    //     row.dataset.parentId === this.actor.id
    //       ? this.actor
    //       : this.actor.items.get(row.dataset.parentId);
    //   onManageActiveEffect(ev, document);
    // });

    // Rollable attributes.
    html.on('click', '.rollable', this._onRoll.bind(this));

    // Drag events for macros.
    if (this.actor.isOwner) {
      let handler = (ev) => this._onDragStart(ev);
      html.find('li.item').each((i, li) => {
        if (li.classList.contains('inventory-header')) return;
        li.setAttribute('draggable', true);
        li.addEventListener('dragstart', handler, false);
      });
    }
  }

  /**
   * Handle creating a new Owned Item for the actor using initial data defined in the HTML dataset
   * @param {Event} event   The originating click event
   * @private
   */
  async _onItemCreate(event) {
    event.preventDefault();
    const header = event.currentTarget;
    // Get the type of item to create.
    const type = header.dataset.type;
    // Grab any data associated with this control.
    const data = duplicate(header.dataset);
    // Initialize a default name.
    const name = `New ${type.capitalize()}`;
    // Prepare the item object.
    const itemData = {
      name: name,
      type: type,
      system: data,
    };
    // Remove the type from the dataset since it's in the itemData.type prop.
    delete itemData.system['type'];

    // Finally, create the item!
    return await Item.create(itemData, { parent: this.actor });
  }

  /**
   * Handle clickable rolls.
   * @param {Event} event   The originating click event
   * @private
   */
  _onRoll(event) {
    event.preventDefault();
    const element = event.currentTarget;
    const dataset = element.dataset;

    // Handle item rolls.
    if (dataset.rollType) {

      if (dataset.rollType == 'item') {
        const itemId = element.closest('.item').dataset.itemId;
        const item = this.actor.items.get(itemId);
        if (item) {
          return item.roll();
        }
      }
    }
 
    // Handle rolls that supply the formula directly.
    if (dataset.roll) {
      this._handleRoll(dataset).then((response) => {});
    };
  }

  async _handleRoll(dataset) {
    let manuallyEnteredValues = false;

    // what's being rolled (used for display)
    let label = dataset.label ? `[attribute] ${dataset.label}` : '';

    // TODO does not currently handle 0 for AV or > 60 for either AV or OV

    // Manually enter OV and RV for target
    if (game.user.targets.size === 0) {
      const template = "systems/dcheroes/templates/actor/dialogs/opposedValuesDialog.html";
      const dialogHtml = await renderTemplate(template, {});

      const d = new Dialog({
        title: "Enter Values",
        content: dialogHtml,
        buttons: {
          button2: {
            label: "Close",
            callback: (html) => {},
          },
          button1: {
            label: "Submit",
            callback: (html) => {
              const response = this._processOpposingValuesEntry(html);
              this._handleRolls(response.opposingValue, response.resistanceValue, dataset);
            }
          }
        },
        default: "button1"
      }).render(true);
    } else if (game.user.targets.size > 1) {
      // TODO popup for specific data
      ui.notifications.warn(localize("You can only target one token"));
      return;
    } else {
      // use target token for OV and RV values
      await this._handleTargetedRolls(dataset);
    }
  }

  /**
   * 
   * @returns 
   */
  async _handleTargetedRolls(dataset) {
    let targetActor = this._getTargetActor();
    const ov = targetActor.system.attributes[dataset.key].value;
    const rv = this._getResistanceValue(dataset.key, targetActor);
    await this._handleRolls(ov, rv, dataset);
  }

  /**
   * 
   * @returns 
   */
  async _handleRolls(ov, rv, dataset) {

    /**********************************
     * ACTION TABLE
     **********************************/
    // get range index for AV
    const av = dataset.value;
    const avIndex = this._getRangeIndex(av);
 
    // get range index for OV
    const ovIndex = this._getRangeIndex(ov);

    // consult action chart for difficulty
    const actionTable = CONFIG.tables.actionTable;
    const difficulty = actionTable[avIndex][ovIndex];

    console.error("FIRST ROLL");
    console.error(dataset.roll);
    console.error(this.actor.getRollData());
    // determine whether happens
    let avRoll = new Roll(dataset.roll, {});

    // Execute the roll
    await avRoll.evaluate();

    // TODO double 1s = automatic fail
    if (avRoll.total === 2) {
      // TODO better message
      ChatMessage.create(
        {
          content: "<div><p>AV = "+ av + " | OV = "+ov+"</p>"
            + "<p>Difficulty = "+difficulty+" | Roll = "+avRoll.result+"</p><p>>Snakeeyes: Automatic failure!</p></div>"
        }
      );
      return;
    }

    // Get roll result
    let avRollResult = avRoll.total;

    // exploding dice
    let dieRollResultDice = avRoll.result.split(' + ');
    let die1 = dieRollResultDice[0];
    let die2 = dieRollResultDice[1];
    console.error(dieRollResultDice);
   
    while (die1 === die2 && die1) {
      console.error("EXPLODE ROLL");
      // TODO better message
      await ChatMessage.create(
        {
          content: "<div><p>Die 1 = "+ die1 + " | Die 2 = "+die2+"</p>"
            + "<p>Re-rolling Doubles!</p><p>Current total = " + avRollResult + "</p></div>"
        }
      );
      console.error(dataset.roll);
      const avExplodeRoll = new Roll(dataset.roll, {});
      console.error("Result: " + avExplodeRoll.result);
      dieRollResultDice = avExplodeRoll.result.split(' + ');
      die1 = dieRollResultDice[0];
      die2 = dieRollResultDice[1];
      avRollResult = avRollResult + avExplodeRoll.total;
    }

    const avRollSuccess = avRollResult >= difficulty;

    // if fails, output message
    if (!avRollSuccess) {
      // TODO better message
      ChatMessage.create(
        {
          content: "<div><p>AV = "+ av + " | OV = "+ov+"</p>"
            + "<p>Difficulty = "+difficulty+" | Roll = "+avRollResult+"</p><p>>Action failed!</p></div>"
        }
      );
      return;
    }

    // if succeeds, calculate column shifts for result table
    let columnShifts = 0;

    // The total die roll must lie on or beyond the Column Shift Threshold (i.e., 11)
    if (avRollResult > 11) {
      // The roll must be greater than the Success Number
      for (let i = ovIndex + 1; i < actionTable[avIndex].length; i++) {
        if (actionTable[avIndex][i] <= avRollResult) {
          columnShifts++;
        } else {
          break;
        }
      }
    }

    /**********************************
     * RESULT TABLE
     **********************************/
    const resultTable = CONFIG.tables.resultTable;

    // get effectvalue column  index
    const ev = this._getEffectValue(dataset.key);
    const evIndex = this._getRangeIndex(ev);
    
    // get resistance value column index
    const rvIndex = this._getRangeIndex(rv) - 1;

    // apply shifts
    let shiftedRvIndex = rvIndex - columnShifts;
    if (shiftedRvIndex < 0) {
      // "All" result on table - Result APs = Effect Value
      const message = await ChatMessage.create(
        {
          content: "<div style='background-color: white;'><p>AV = "+ av + " | OV = "+ov+"</p>"
            + "<p>Difficulty = "+difficulty+" | Roll = "+avRollResult+"</p><p>>Action succeded!</p></div>"
            + "<div><p>column shifts = "+columnShifts+" | ev = "+ev+" | rv = "+rv+" | result APs = ALL ("+ev+" APs) </p></div>"
        }
      );
      return ev;
    }

    // consult result chart
    const resultAPs = resultTable[evIndex][shiftedRvIndex];

    // results output to chat
    const message = await ChatMessage.create(
      {
        content: "<div style='background-color: white;'><p>AV = "+ av + " | OV = "+ov+"</p>"
          + "<p>Difficulty = "+difficulty+" | Roll = "+avRoll.result+"</p><p>>Action succeded!</p></div>"
          + "<div><p>column shifts = "+columnShifts+" | ev = "+ev+" | rv = "+rv+" | result APs = "+resultAPs+" </p></div>"
      }
    );

    return resultAPs;
  }

  /**
   * 
   * @returns 
   */
        // TODO this is bad; fix it
  _getTargetActor() {
    let targetActor;
    for (const value of game.user.targets) {
      targetActor = game.actors.get(value.document.actorId);
      break;
    }
    return targetActor;
  }

  /**
   * 
   * @returns 
   */
  _getEffectValue(key) {
    const context = super.getData();
    let ev;
    if (key === "dex") {
      ev = context.actor.system.attributes.str.value;
    } else if (key === "int") {
      ev = context.actor.system.attributes.will.value;
    } else if (key === "infl") {
      ev = context.actor.system.attributes.aura.value; 
    } else {
      ui.notifications.error("Invalid attribute selection");
      return;
    }
    return ev;
  }

  /**
   * 
   * @returns 
   */
  _getResistanceValue(key, targetActor) {
    let rv;
    if (key === "dex") {
      rv = targetActor.system.attributes.body.value; // TODO should be current body?
    } else if (key === "int") {
      rv = targetActor.system.attributes.mind.value; // TODO should be current mind?
    } else if (key === "infl") {
      rv = targetActor.system.attributes.spirit.value; // TODO should be current spirit?
    } else {
      ui.notifications.error("Invalid attribute selection");
      return;
    }
    return rv;
  }

  /**
   * 
   * @returns 
   */
  _processOpposingValuesEntry(html) {
    // TODO how to receive these values?
    const opposingValue = html.find("input#opposingValue").val();
    const resistanceValue = html.find("input#opposingValue").val();
    return {
      opposingValue: parseInt(opposingValue),
      resistanceValue: parseInt(resistanceValue)
    }
  }

  /**
   * 
   * @param {*} value 
   * @returns 
   */
  _getRangeIndex(value) {
    const ranges = CONFIG.tables.ranges;
    let index = 0;
    for (let i = 0; i < ranges.length; i++) {
      const range = ranges[i];
      const min = range[0];
      const max = range[1];
      if (value >= min && value <= max) {
        index = i;
        break;
      }
    }
    return index;
  }
}
