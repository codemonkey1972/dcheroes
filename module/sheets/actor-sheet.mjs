import { DCHEROES } from '../helpers/config.mjs';
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
    // TODO rename features tab
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

    // TODO dragging from right bar puts a copy on the table, not a linked version - FIX!
    // The exception is player characters and sheets that have "link actor data" enabled (PCs do by default). For these actors there's a single character sheet shared by all copies of the actor.

    const initiativeBonus = this._calculateInitiativeBonus(context);

    // set value on actor sheet object
    // TODO do we need both of these now?
    context.system.initiativeBonus.value = initiativeBonus; // works for sheet display
    context.actor.system.initiativeBonus.value = initiativeBonus; // already changes
  }

  _calculateInitiativeBonus(context) {
    // calculate initiativeBonus
    let initiativeBonus = 0;

    // Superspeed adds APs of their power
    if (this._hasAbility(context.powers, DCHEROES.powers.SUPERSPEED)) { 
      const aps = this._getAbilityAPs(context.powers, DCHEROES.powers.SUPERSPEED);
      initiativeBonus = initiativeBonus + aps;
    }

    // Martial artist gives a +2
    if (this._hasAbility(context.skills, DCHEROES.skills.MARTIAL_ARTIST)) {
      initiativeBonus = initiativeBonus + 2;
    }

    // Lightning Reflexes gives +2
    if (this._hasAbility(context.advantages, DCHEROES.advantages.LIGHTNING_REFLEXES)) {
      initiativeBonus = initiativeBonus + 2;
    }

    // Water Freedom applies when submerged in water
    // TODO dialog prompt for modifiers
    if (this._hasAbility(context.powers, DCHEROES.powers.WATER_FREEDOM)) {
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
   * Organize and classify Items for Character sheets.
   *
   * @param {Object} actorData The actor to prepare.
   *
   * @return {undefined}
   */
  _prepareItems(context) {
    // Initialize containers.
    const gadgets = [];
    const powers = [];
    const skills = [];
    const advantages = [];
    const drawbacks = [];
    const subskills = []; // TODO move this to item-sheet.mjs?

    // Iterate through items, allocating to containers
    for (let i of context.items) {
      i.img = i.img || Item.DEFAULT_ICON;
      // Append to items.
      if (i.type === 'power') {
        powers.push(i);
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
    // what's being rolled (used for display)
    let label = dataset.label ? `[attribute] ${dataset.label}` : '';

    // TODO does not currently handle > 60 for either AV or OV

    // Manually enter OV and RV for target
    if (game.user.targets.size === 0) {
      const template = "systems/dcheroes/templates/actor/dialogs/rollDialog.hbs";
      console.error(this);      
      console.error(dataset);
      const data = {
      };
      let dialogHtml = await renderTemplate(template, data);
      dialogHtml = dialogHtml.replaceAll("&&MAX&&", dataset.value); // TODO not evaluating for max; use slider

      /* TODO remove this to its own class
      const d = new RollDialog(
        template,
        maxHPs
        title,
        message,
        onClose
      );
      */
      // TODO localize button content
      // TODO prompt for GM hero points spent
      // TODO combat maneuver dropdown

      const d = new Dialog({
        title: label,
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
              this._handleRolls(response.opposingValue, response.resistanceValue, response.hpSpentAP, response.hpSpentEP, dataset);
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
      await this._handleTargetedRolls(dataset, label);
    }
  }

  /**
   * 
   * @returns 
   */
  async _handleTargetedRolls(dataset, label) {
    let targetActor = this._getTargetActor();

    const ov = targetActor.system.attributes[dataset.key].value;
    const rv = this._getResistanceValue(dataset.key, targetActor);

    // TODO prompt for GM hero points spent - deduct from targeted
    // TODO combat maneuver dropdown

    const template = "systems/dcheroes/templates/actor/dialogs/rollDialogTargeted.hbs";
    let dialogHtml = await renderTemplate(template, {});
    dialogHtml = dialogHtml.replaceAll("&&MAX&&", dataset.value);
    const d = new Dialog({
      title: label,
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
            this._handleRolls(ov, rv, response.hpSpentAP, response.hpSpentEP, dataset);
          }
        }
      },
      default: "button1"
    }).render(true);
  }

  /**
   * 
   * @returns 
   */
  async _handleRolls(ov, rv, hpSpentAP, hpSpentEP, dataset) {

    // TODO deduct spent Hero Points
    const context = super.getData();
    context.actor.system.heroPoints.value = context.actor.system.heroPoints.value - (hpSpentAP + hpSpentEP);
    console.error(context); 
//    context.system.heroPoints.value = context.actor.system.heroPoints.value;
    console.error(this);


    /**********************************
     * ACTION TABLE
     **********************************/
    // get range index for AV
    const av = parseInt(dataset.value) + parseInt(hpSpentAP);
    const avIndex = this._getRangeIndex(av);

    // TODO subtract from character's HP
 
    // get range index for OV
    const ovIndex = this._getRangeIndex(ov);

    // consult action chart for difficulty
    const actionTable = CONFIG.tables.actionTable;
    const difficulty = actionTable[avIndex][ovIndex];

    // determine whether happens
    const avRoll = new Roll(dataset.roll, {});

    // Execute the roll
    await avRoll.evaluate();

    // double 1s = automatic fail
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
    let avRollTotal = parseInt(avRoll.total);
    let dice = [];

    // exploding dice
    let dieRollResultDice = avRoll.result.split(' + ');
    let die1 = dieRollResultDice[0];
    let die2 = dieRollResultDice[1];
    dice.push(die1);
    dice.push(die2);
   
    while (die1 === die2) {
      // TODO better message
      await ChatMessage.create(
        {
          content: "<div><p>Die 1 = "+ die1 + " | Die 2 = "+die2+"</p>"
            + "<p>Re-rolling Doubles!</p><p>Current total = " + avRollTotal + "</p></div>"
        }
      );

      // TODO prompt if want to continue rolling

      const avExplodeRoll = new Roll(dataset.roll, {});
      await avExplodeRoll.evaluate();
      dieRollResultDice = avExplodeRoll.result.split(' + ');
      die1 = dieRollResultDice[0];
      die2 = dieRollResultDice[1];
      dice.push(die1);
      dice.push(die2);
      // TODO Furthermore, even if double 1s is rolled on the second or greater roll, the roll fails.
      avRollTotal = avRollTotal + avExplodeRoll.total;
    }

    const avRollSuccess = avRollTotal >= difficulty;

    // if fails, output message
    if (!avRollSuccess) {
      // TODO better message
      ChatMessage.create(
        {
          content: "<div><p>AV = "+ av + " | OV = "+ov+"</p>"
            + "<p>Difficulty = "+difficulty+" | Roll = "+avRollTotal+"</p><p>>Action failed!</p></div>"
        }
      );
      return;
    }

    // if succeeds, calculate column shifts for result table
    let columnShifts = 0;

    // TODO handle totals greater than 60 on table

    // The total die roll must lie on or beyond the Column Shift Threshold (i.e., 11)
    if (avRollTotal > 11) {
      
      /* The Action Table is set up so that any roll over 11 might earn the Player a Column Shift. 
         Notice that the 11's split the Action Table in two. This is the Column Shift Threshold. */
      for (let i = 0; i < actionTable[avIndex].length; i++) {
        if (actionTable[avIndex][i] > 11) {
          // The roll must be greater than the Success Number
          if (avRollTotal > actionTable[avIndex][i]) {
            columnShifts++;
          } else {
            break;
          }
        }
      }
    }

    /**********************************
     * RESULT TABLE
     **********************************/
    const resultTable = CONFIG.tables.resultTable;

    // get effectvalue column  index
    const ev = this._getEffectValue(dataset.key) + hpSpentEP;
    const evIndex = this._getRangeIndex(ev);
    
    // get resistance value column index
    const rvIndex = this._getRangeIndex(rv) - 1;

    // apply shifts
    // Column Shifts on the Result Table are made to the left, decreasing numbers in the Resistance Value row, 
    // but increasing the number of Result APs within the Table itself
    let shiftedRvIndex = rvIndex - columnShifts;
    if (shiftedRvIndex <= 0) {
      // calculate column shifts that push past the 0 column
      // If the result is in the +1 Column, add 1 AP to your Result APs for every time you shift into this Column.
      const resultAPs = ev + (Math.abs(shiftedRvIndex));

      // "All" result on table - Result APs = Effect Value
      // If the Result is an 'A,' then the RAPs are equal to the APs of the Effect Value.
      const message = await ChatMessage.create(
        {
          content: "<div style='background-color: white;'><p>AV = "+ av + " | OV = "+ov+"</p>"
            + "<p>Difficulty = "+difficulty+" | Roll = "+avRollTotal+"</p><p>>Action succeded!</p></div>"
            + "<div><p>column shifts = "+columnShifts+" | ev = "+ev+" | rv = "+rv+" | result APs = ALL ("+resultAPs+" APs) </p></div>"
        }
      );
      return resultAPs;
    }

    // consult result chart
    const resultAPs = resultTable[evIndex][shiftedRvIndex];

    // If the result is an 'N' then there is No Effect
    if (resultAPs === 0) {
      // TODO show chat message
    }

    // results output to chat
    const message = await ChatMessage.create(
      {
        content: "<div style='background-color: white;'><p>AV = "+ av + " | OV = "+ov+"</p>"
          + "<p>Difficulty = "+difficulty+" | Roll = "+avRollTotal+" ("+avRoll.result+")</p><p>>Action succeded!</p></div>"
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
    const opposingValue = html.find("input#opposingValue").val();
    const resistanceValue = html.find("input#resistanceValue").val();
    const hpSpentAP = html.find("input#hpSpentAP").val();
    const hpSpentEP = html.find("input#hpSpentEP").val();
    return {
      opposingValue: parseInt(opposingValue),
      resistanceValue: parseInt(resistanceValue),
      hpSpentAP: parseInt(hpSpentAP),
      hpSpentEP: parseInt(hpSpentEP)
    }
  }

  /**
   * 
   * @param {*} value 
   * @returns 
   */
  _getRangeIndex(value, excludeZero) {
    const ranges = CONFIG.tables.ranges;

    let start = 0;
    if (excludeZero) {
      start = 1;
    }

    let index = 0;
    for (let i = start; i < ranges.length; i++) {
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
