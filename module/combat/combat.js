// @ts-ignore
export default class MEGSCombat extends Combat { 
    _sortCombatants(a, b) {
        const initA = Number.isNumeric(a.initiative) ? a.initiative : -9999;
        const initB = Number.isNumeric(b.initiative) ? b.initiative : -9999;
    
        let initDifference = initB - initA;
        if (initDifference != 0) {
          return initDifference;
        }
    
        const typeA = a.actor.data.type;
        const typeB = b.actor.data.type;
    
        if (typeA != typeB) {
          if (typeA == "character") {
            return -1;
          }
          if (typeB == "character") {
            return 1;
          }
        }
    
        return a.tokenId - b.tokenId;
      }
    
}