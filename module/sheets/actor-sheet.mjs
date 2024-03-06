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
      this._handleRoll(dataset).then((response) => {
        //   TODO implement rest of stuff to process here
        });
    };
  }

  async _handleRoll(dataset) {
      // what's being rolled (used for display)
      let label = dataset.label ? `[attribute] ${dataset.label}` : '';

      // TODO does not currently handle 0 for AV or > 60 for either AV or OV

      if (game.user.targets.size === 0) {
        // TODO popup
        //this._getRollValuesOptions();
        // OR
        // this._openOpposingValuesDialog().then((response) => {
        //   TODO implement rest of stuff to process here
        // });
        ui.notifications.warn("You must pick a target");
        return;
      } else if (game.user.targets.size > 1) {
        // TODO popup for specific data
        ui.notifications.warn("You can only target one token");
        return;
      }

      let targetActor = this._getTargetActor();

      /**********************************
       * ACTION TABLE
       **********************************/
      // get range index for AV
      const av = dataset.value;
      const avIndex = this._getRangeIndex(av);
      console.error("AV: index =" + avIndex+" - value = "+av+"; range = ["+CONFIG.tables.ranges[avIndex][0]+" - "+CONFIG.tables.ranges[avIndex][1]+"]");

      const ov = targetActor.system.attributes[dataset.key].value;

      // get range index for OV
      const ovIndex = this._getRangeIndex(ov);
      console.error("OV: index =" + ovIndex+" - value = "+ov+"; range = ["+CONFIG.tables.ranges[ovIndex][0]+" - "+CONFIG.tables.ranges[ovIndex][1]+"]");
 
      // consult action chart for difficulty
      const actionTable = CONFIG.tables.actionTable;
      const difficulty = actionTable[avIndex][ovIndex];

      // determine whether happens
      let avRoll = new Roll(dataset.roll, this.actor.getRollData());
      await avRoll.evaluate();
      const avRollResult = avRoll._total;
      const avRollSuccess = avRollResult >= difficulty;

      console.error("Difficulty: " + difficulty + " | Roll: " + avRollResult + " | Success?: " + avRollSuccess);
  
      // if fails, output message
      if (!avRollSuccess) {
        // TODO better message
        ChatMessage.create({content: "Action failed!"});
        return;
      }

      // TODO if succeeds, calculate column shifts for result table
      let columnShifts = 0;
      for (let i = ovIndex + 1; i < actionTable[avIndex].length; i++) {
        if (actionTable[avIndex][i] <= avRollResult) {
          columnShifts++;
        } else {
          break;
        }
      }
      console.log("Column shifts: "+columnShifts);

      /**********************************
       * RESULT TABLE
       **********************************/

      const resultTable = CONFIG.tables.resultTable;

      // get effectvalue column  index
      const ev = this._getEffectValue(dataset.key);
      const evIndex = this._getRangeIndex(ev) - 1;
      
      // get resistance value column index
      const rv = this._getResistanceValue(dataset.key, targetActor);
      const rvIndex = this._getRangeIndex(rv);
      console.error("EV = "+ev+" | evIndex = "+evIndex+" | RV = "+rv+" | rvIndex = "+rvIndex);

      // apply shifts
      let shiftedRvIndex = rvIndex - columnShifts;
      if (shiftedRvIndex < 0) shiftedRvIndex = 0;
      console.error("shiftedRvIndex = "+shiftedRvIndex);

      // TODO consult result chart
      const resultAPs = resultTable[evIndex][shiftedRvIndex];
      console.error("result = "+resultAPs);

      // results output to chat

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

  async _openOpposingValuesDialog() {
    const myContent = await renderTemplate("systems/dcheroes/templates/actor/dialogs/opposedValuesDialog.html", {});

    new Dialog({
      title: "My Custom Dialog Title",
      content: myContent,
      buttons: {}
    }).render(true);
  }

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

  async _getRollValuesOptions() {
    const template = "systems/dcheroes/templates/actor/dialogs/opposedValuesDialog.html";
    const html = await renderTemplate(template, {});

    return new Promise(resolve => {
      const data = {
        title: "Enter opposing data",
        content: html,
        buttons: {
          normal: {
            label: "Roll",
            callback: html => resolve(_processRollOptions(html[0].querySelector("form")))
          },
          cancel: {
            label: "Cancel",
            callback: html => resolve({cancelled: true})
          }
        },
        default: "normal",
        close: () => resolve({cancelled: true})
      }
      new Dialog(data, null).render(true);
    });
  }

  _processRollOptions(form) {
    return {
      opposingValue: parseInt(form.opposingValue.value),
      resistanceValue: parseInt(form.resistanceValue.value)
    }
  }
}
