// Import document classes.
import { DCHeroesActor } from './documents/actor.mjs';
import { DCHeroesItem } from './documents/item.mjs';
// Import sheet classes.
import { DCHeroesActorSheet } from './sheets/actor-sheet.mjs';
import { DCHeroesItemSheet } from './sheets/item-sheet.mjs';
// Import helper/utility classes and constants.
import { preloadHandlebarsTemplates } from './helpers/templates.mjs';
import { DCHEROES } from './helpers/config.mjs';

// Turn on hooks logging for debugging
CONFIG.debug.hooks = true;

/* -------------------------------------------- */
/*  Init Hook                                   */
/* -------------------------------------------- */

Hooks.once('init', function () {
  // Add utility classes to the global game object so that they're more easily
  // accessible in global contexts.
  game.dcheroes = {
    DCHeroesActor,
    DCHeroesItem,
    rollItemMacro
  };

  // Add custom constants for configuration.
  CONFIG.DCHEROES = DCHEROES;

  // Load MEGS tables
  _loadData('systems/dcheroes/assets/data/tables.json').then((response) => {
    console.log(`Received response for tables data: ${response.status}`);
    CONFIG.tables = response;
  });

  /**
   * Set an initiative formula for the system
   * @type {String}
   */
  CONFIG.Combat.initiative = {
    formula: '1d10 +@initiativeBonus.value',
    decimals: 0,
  };

  // Define custom Document classes
  CONFIG.Actor.documentClass = DCHeroesActor;
  CONFIG.Item.documentClass = DCHeroesItem;

  // Combat maneuvers
  _loadData('systems/dcheroes/assets/data/combatManeuvers.json').then((response) => {
    console.log(`Received response for combat maneuvers data: ${response.status}`);
    CONFIG.combatManeuvers = response;
  });

  // Active Effects are never copied to the Actor,
  // but will still apply to the Actor from within the Item
  // if the transfer property on the Active Effect is true.
  CONFIG.ActiveEffect.legacyTransferral = false;

  // Register sheet application classes
  Actors.unregisterSheet('core', ActorSheet);
  Actors.registerSheet('dcheroes', DCHeroesActorSheet, {
    makeDefault: true,
    label: 'DCHEROES.SheetLabels.Actor',
  });
  Items.unregisterSheet('core', ItemSheet);
  Items.registerSheet('dcheroes', DCHeroesItemSheet, {
    makeDefault: true,
    label: 'DCHEROES.SheetLabels.Item',
  });

  // Preload Handlebars templates.
  return preloadHandlebarsTemplates();
});

/* -------------------------------------------- */
/*  Handlebars Helpers                          */
/* -------------------------------------------- */

// If you need to add Handlebars helpers, here is a useful example:
Handlebars.registerHelper('toLowerCase', function (str) {
  return str.toLowerCase();
});

Handlebars.registerHelper('sum', function () {
  return Array.prototype.slice.call(arguments, 0, -1).reduce((acc, num) => acc += num);
});

Handlebars.registerHelper('multiply', function (num1, num2) {
  return num1 * num2;
});

Handlebars.registerHelper('isDivisor', function (num1, num2) {
  return num1 !== 0 && num2 % num1 === 0;
});

Handlebars.registerHelper('ifCond', function(v1, v2) {
  return (v1 === v2);
});

Handlebars.registerHelper('notCond', function(v1, v2) {
  return (v1 !== v2);
});

Handlebars.registerHelper('doesSubskillBelongToSkill', function(subskill, skillName) {
  // TODO console.log("TEST: " + subskill.link + " | " + skillName);
  return (subskill.link === skillName);
});

Handlebars.registerHelper('getSelectedSkillRange', function(skillName) {
  for (let i of game.items) {
    if (i.type === 'skill') {
      if (i.name === skillName) {
        return i.system.range;
      }
    }
  }
  return "N/A";
});

Handlebars.registerHelper('getSelectedSkillType', function(skillName) {
  for (let i of game.items) {
    if (i.type === 'skill') {
      if (i.name === skillName) {
        return i.system.type;
      }
    }
  }
  return "N/A";
});

Handlebars.registerHelper('getSelectedSkilLink', function(skillName) {
  for (let i of game.items) {
    if (i.type === 'skill') {
      if (i.name === skillName) {
        return i.system.link;
      }
    }
  }
  return "N/A";
});

/* -------------------------------------------- */
/*  Ready Hook                                  */
/* -------------------------------------------- */

Hooks.once('ready', function () {
  // Wait to register hotbar drop hook on ready so that modules could register earlier if they want to
  Hooks.on('hotbarDrop', (bar, data, slot) => createItemMacro(data, slot));
});


/* -------------------------------------------- */
/*  Combat Tracker                              */
/* -------------------------------------------- */

// TODO when world is closed and re-entered with CT open, is losing the adjusted values

Hooks.on('createCombatant', async (combatant) => {
  let actor = game.actors.get(combatant.actorId);
  const initiativeBonus = actor._calculateInitiativeBonus();
  combatant.initiativeBonus = initiativeBonus;
  actor.system.initiativeBonus = initiativeBonus;
});

Hooks.on('updateCombatant', async (combatant) => {
  // Allow to spend Hero Points to affect initiative
  const actor = game.actors.get(combatant.actorId);
  const template = "systems/dcheroes/templates/actor/dialogs/initiativeDialog.hbs";
  const maxHpToSpend = actor.system.heroPoints.value;
  const data = {
    "maxHpToSpend": maxHpToSpend,
  };
  let dialogHtml = await renderTemplate(template, data);
  new Dialog({
    title: game.i18n.localize("Initiative"),
    content: dialogHtml,
    buttons: {
      button2: {
        label: "Close",
        callback: (html) => {},
      },
      button1: {
        label: "Submit",
        callback: (html) => {
          const hpSpentInitiative = parseInt(html[0].querySelector('form').hpSpentInitiative?.value) || 0;
          console.error("TEST0: " + hpSpentInitiative);
          // TODO decrease HP by amount entered
          console.error("TEST1: " + combatant.initiative);
          combatant.initiative = combatant.initiative + combatant.initiativeBonus + hpSpentInitiative;
          console.error("TEST2: " + combatant.initiative);
        }
      }
    },
    default: "button1"
  }).render(true).then({});
});
 
/* -------------------------------------------- */
/*  Load JSON data                              */
/* -------------------------------------------- */

/**
 * Create the MEGS tables from JSON data.
 * Grab the JSON and place it in an object.
 * @param {Object} jsonPath     The path in the Foundry Data directory to the JSON asset
 * @returns {Promise}
 */
async function _loadData(jsonPath) {
  const response = await fetch(jsonPath);
  const contents = await response.json();
  return contents;
}

/* -------------------------------------------- */
/*  Hotbar Macros                               */
/* -------------------------------------------- */

/**
 * Create a Macro from an Item drop.
 * Get an existing item macro if one exists, otherwise create a new one.
 * @param {Object} data     The dropped data
 * @param {number} slot     The hotbar slot to use
 * @returns {Promise}
 */
async function createItemMacro(data, slot) {
  // First, determine if this is a valid owned item.
  if (data.type !== 'Item') return;
  if (!data.uuid.includes('Actor.') && !data.uuid.includes('Token.')) {
    return ui.notifications.warn(
      'You can only create macro buttons for owned Items'
    );
  }
  // If it is, retrieve it based on the uuid.
  const item = await Item.fromDropData(data);

  // Create the macro command using the uuid.
  const command = `game.dcheroes.rollItemMacro("${data.uuid}");`;
  let macro = game.macros.find(
    (m) => m.name === item.name && m.command === command
  );
  if (!macro) {
    macro = await Macro.create({
      name: item.name,
      type: 'script',
      img: item.img,
      command: command,
      flags: { 'dcheroes.itemMacro': true },
    });
  }
  game.user.assignHotbarMacro(macro, slot);
  return false;
}

/**
 * Create a Macro from an Item drop.
 * Get an existing item macro if one exists, otherwise create a new one.
 * @param {string} itemUuid
 */
function rollItemMacro(itemUuid) {
  // Reconstruct the drop data so that we can load the item.
  const dropData = {
    type: 'Item',
    uuid: itemUuid,
  };
  // Load the item from the uuid.
  Item.fromDropData(dropData).then((item) => {
    // Determine if the item loaded and if it's an owned item.
    if (!item || !item.parent) {
      const itemName = item?.name ?? itemUuid;
      return ui.notifications.warn(
        `Could not find item ${itemName}. You may need to delete and recreate this macro.`
      );
    }

    // Trigger the item roll
    item.roll();
  });
}
