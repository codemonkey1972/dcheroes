import { DCHEROES } from "../helpers/config.mjs";

export default class MEGSCombat extends Combat { 

    _sortCombatants(a, b) {
        const initA = Number.isNumeric(a.initiative) ? a.initiative : -9999;
        const initB = Number.isNumeric(b.initiative) ? b.initiative : -9999;
        console.error("TYPES: "+typeA+ " : "+initB);

        const typeA = a.actor.data.type;
        const typeB = b.actor.data.type;
        console.error("TYPES: "+initA+ " : "+typeB);

        super._sortCombatants(a, b);
/*    
        let initDifference = initB - initA;
        if (initDifference != 0) {
          return initDifference;
        }
    
        const typeA = a.actor.data.type;
        const typeB = b.actor.data.type;
        console.error("TYPES: "+typeA+ " : "+typeB);
    
        if (typeA !== typeB) {
          if (typeA === DCHEROES.characterTypes.hero) {
            return -1;
          }
          if (typeB === DCHEROES.characterTypes.hero) {
            return 1;
          }
        }
    
        return a.tokenId - b.tokenId;*/
      }
 
}