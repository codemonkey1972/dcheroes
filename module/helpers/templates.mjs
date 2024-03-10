/**
 * Define a set of template paths to pre-load
 * Pre-loaded templates are compiled and cached for fast access when rendering
 * @return {Promise}
 */
export const preloadHandlebarsTemplates = async function () {
  return loadTemplates([
    // Actor partials.
    'systems/dcheroes/templates/actor/parts/actor-description.hbs',
    'systems/dcheroes/templates/actor/parts/actor-gadgets.hbs',
    'systems/dcheroes/templates/actor/parts/actor-powers.hbs',
    'systems/dcheroes/templates/actor/parts/actor-skills.hbs',
    'systems/dcheroes/templates/actor/parts/actor-traits.hbs',
  ]);
};
