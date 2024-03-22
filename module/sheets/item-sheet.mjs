import { DCHeroesItem } from '../documents/item.mjs';
import { DCHEROES } from '../helpers/config.mjs';

/**
 * Extend the basic ItemSheet with some very simple modifications
 * @extends {ItemSheet}
 */
export class DCHeroesItemSheet extends ItemSheet {
  /** @override */
  static get defaultOptions() {
    return foundry.utils.mergeObject(super.defaultOptions, {
      classes: ['dcheroes', 'sheet', 'item'],
      width: 520,
      height: 480,
      tabs: [
        {
          navSelector: '.sheet-tabs',
          contentSelector: '.sheet-body',
          initial: 'characteristics',
        },
      ],
    });
  }

  /** @override */
  get template() {
    const path = 'systems/dcheroes/templates/item';
    // Return a single sheet for all item types.
    // return `${path}/item-sheet.hbs`;

    // Alternatively, you could use the following return statement to do a
    // unique item sheet by type, like `weapon-sheet.hbs`.
    return `${path}/item-${this.item.type}-sheet.hbs`;
  }

  /* -------------------------------------------- */

  /** @override */
  getData() {
    // Retrieve base data structure.
    const context = super.getData();
    if (!context.bonuses) {
      context.bonuses = [];
    }
    if (!context.limitations) {
      context.limitations = [];
    }

    // Use a safe clone of the item data for further operations.
    const itemData = context.data;

    // Retrieve the roll data for TinyMCE editors.
    context.rollData = this.item.getRollData();

    // Add the item's data to context.data for easier access, as well as flags.
    context.system = itemData.system;
    context.flags = itemData.flags;

    if (itemData.type === DCHEROES.itemTypes.power) {
      this._prepareModifiers(context);
    }

    if (itemData.type === DCHEROES.itemTypes.skill) {
      this._prepareSubskills(context);
    }

    // store all skills for dropdown on subskill page
    if (itemData.type === DCHEROES.itemTypes.subskill) {
      let allSkills = {};
      for (let i of game.items) {
        if (i.type === DCHEROES.itemTypes.skill) {
          allSkills[i.name] = i;
        }
      }
      context.skills = allSkills;
    }
    
    // Get attributes list
    // TODO there's got to be a better way to do this
    context.attributes = context.system.attributes;
  
    return context;
  }

  /* -------------------------------------------- */

  /** @override */
  activateListeners(html) {
     super.activateListeners(html);

    // Everything below here is only needed if the sheet is editable
    if (!this.isEditable) return;
  
    // Render the item sheet for viewing/editing prior to the editable check.
    html.on('click', '.bonus-edit', (ev) => {
      const li = $(ev.currentTarget).parents('.item');
      console.error("TEST: bonus-edit");
      console.error(this); // TODO there isn't an actor object
      const item = this.actor.items.get(li.data('itemId'));
      item.sheet.render(true);
    });

    // Add Sub-Item
    html.on('click', '.item-create', this._onSubItemCreate.bind(this));

    // Delete Sub-Item
    html.on('click', '.item-delete', (ev) => {
      const li = $(ev.currentTarget).parents('.item');
      const item = this.actor.items.get(li.data('itemId'));
      item.delete();
      li.slideUp(200, () => this.render(false));
    });

  }

  _prepareModifiers(context) {
    // Initialize containers.
    const bonuses = [];
    const limitations = [];
  
      // Iterate through items, allocating to containers
    // TODO bonus is not a valid choice
    console.error("TEST: item-sheet._prepareModifiers()");
    console.error(context);
    for (let i of context.bonuses) {
      i.img = i.img || Item.DEFAULT_ICON;
      if (i.type === 'bonus') {
        bonuses.push(i);
      } 
    }
    for (let i of context.limitations) {
      if (i.type === 'limitation') {
        limitations.push(i);
      }
    }

    // Assign and return
    context.bonuses = bonuses;
    context.limitations = limitations;
  }
  
  /**
   * 
   * @param {*} context 
   */
  _prepareSubskills(context) {
    // TODO need master skill name - will never change
    if (context.item.type === DCHEROES.itemTypes.skill) {
      context.subskills = [];
      for (let i of game.items) {
        if (i.type === DCHEROES.itemTypes.subskill) {
          if (i.system.linkedSkill === context.item.name) {
            // TODO .enabled = true;
            context.subskills.push(i);
            // TODO https://jsfiddle.net/oxfb3wjs/3/
          }
        }
      }
    }
  }

  /**
   * Handle creating a new Owned Item for the actor using initial data defined in the HTML dataset
   * @param {Event} event   The originating click event
   * @private
   */
  async _onSubItemCreate(event) {
    console.error("TEST: item-sheet._onSubItemCreate()");
    console.error(event);
    console.error(this);

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
    console.error(itemData);
    // Remove the type from the dataset since it's in the itemData.type prop.
    delete itemData.system['type'];

    // Finally, create the item!
    return await DCHeroesItem.create(itemData, { parent: this.object });
  }

}
