/**
 * Define a set of template paths to pre-load
 * Pre-loaded templates are compiled and cached for fast access when rendering
 * @return {Promise}
 */
export const preloadHandlebarsTemplates = async function () {
  return loadTemplates([
    // Actor partials.
    'systems/dcheroes/templates/actor/parts/actor-features.hbs', // TODO remove
    'systems/dcheroes/templates/actor/parts/actor-gadgets.hbs',
    'systems/dcheroes/templates/actor/parts/actor-items.hbs', // TODO remove
    'systems/dcheroes/templates/actor/parts/actor-powers.hbs',
    'systems/dcheroes/templates/actor/parts/actor-skills.hbs',
    'systems/dcheroes/templates/actor/parts/actor-traits.hbs',
    // Item partials
    // TODO 'systems/dcheroes/templates/item/parts/item-effects.hbs',
  ]);
};
