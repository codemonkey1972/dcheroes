import { DCHeroesActorSheet } from "../sheets/actor-sheet.mjs";
import { jest } from '@jest/globals'

test("getData()", () => {
    const actorSheet = new DCHeroesActorSheet();
});

 
test("_prepareCharacterData", () => {
    const actorSheet = new DCHeroesActorSheet();
    // TODO
});

 
test("_calculateInitiativeBonus", () => {
    const actorSheet = new DCHeroesActorSheet();
    // TODO
});

 
test("_hasAbility", () => {
    const actorSheet = new DCHeroesActorSheet();
    // TODO
});

 
test("_getAbilityAPs", () => {
    const actorSheet = new DCHeroesActorSheet();
    // TODO
});


// TODO test for APs beyond A - ex: av = 7, ov = 4, 10 + 10 + 9 + 8 = 8 column shifts, ev = 4, rv = 4, pretty sure should be 10
// _handleRolls -> refactor out of this

 test("_rollDice should return if dice do not match", () => {
    global.rollIndex = 0;
    const actorSheet = new DCHeroesActorSheet();
    const data = {
        "result": "Double 1s: Automatic failure!",
        "actionValue": 0,
        "opposingValue": 0,
        "difficulty": 0,
        "columnShifts": 0,
        "effectValue": 0,
        "resistanceValue": 0,
        "success": false,
        "evResult": ""
    };

    const dataset = {
       roll: [2, 3]
    };
    actorSheet._rollDice(dataset , {}).then((response) => {
        expect(response).toStrictEqual([2, 3]);
    });
});

test("_rollDice should roll again if have matching dice on first roll", () => {
    global.rollIndex = 0;
     const actorSheet = new DCHeroesActorSheet();
     const data = {
         "result": "",
         "actionValue": 0,
         "opposingValue": 0,
         "difficulty": 0,
         "columnShifts": 0,
         "effectValue": 0,
         "resistanceValue": 0,
         "success": false,
         "evResult": ""
     };
 
     const dataset = {
        roll: [2, 2, 3, 4]
     };
     actorSheet._rollDice(dataset , {}).then((response) => {
         expect(response).toStrictEqual([2, 2, 3, 4]);
     });
 });

 test("_rollDice should roll again if have matching dice on first and second rolls", () => {
    global.rollIndex = 0;
     const actorSheet = new DCHeroesActorSheet();
     const data = {
         "result": "",
         "actionValue": 0,
         "opposingValue": 0,
         "difficulty": 0,
         "columnShifts": 0,
         "effectValue": 0,
         "resistanceValue": 0,
         "success": false,
         "evResult": ""
     };
 
     const dataset = {
        roll: [2, 2, 3, 3, 4, 5]
     };
     actorSheet._rollDice(dataset , {}).then((response) => {
         expect(response).toStrictEqual([2, 2, 3, 3, 4, 5]);
     });
 });

test("_rollDice should fail on double 1s on first roll", () => {
    global.rollIndex = 0;
    const actorSheet = new DCHeroesActorSheet();
    const data = {
        "result": "Double 1s: Automatic failure!",
        "actionValue": 0,
        "opposingValue": 0,
        "difficulty": 0,
        "columnShifts": 0,
        "effectValue": 0,
        "resistanceValue": 0,
        "success": false,
        "evResult": ""
    };

    const dataset = {
        roll: [1, 1]
    };
    actorSheet._rollDice(dataset, {}).then((response) => {
        // TODO not really failing
        expect(response).toStrictEqual([1, 1]);
    });
});

test("_getColumnShifts returns the correct number of column shifts", () => {
    // _getColumnShifts(avRollTotal, avIndex, actionTable)

    const actorSheet = new DCHeroesActorSheet();
    const actionTable = CONFIG.tables.actionTable;

    // The roll must be greater than the Success Number
    // The total die roll must lie on or beyond the Column Shift Threshold. 
    for (let i=1; i < 19; i++) {
        expect(actorSheet._getColumnShifts(11, i, actionTable)).toBe(0);
        expect(actorSheet._getColumnShifts(12, i, actionTable)).toBe(0);
    }
    
    expect(actorSheet._getColumnShifts(14, 1, actionTable)).toBe(1);
    expect(actorSheet._getColumnShifts(16, 1, actionTable)).toBe(2);
    expect(actorSheet._getColumnShifts(19, 1, actionTable)).toBe(3);
    expect(actorSheet._getColumnShifts(22, 1, actionTable)).toBe(4);
    expect(actorSheet._getColumnShifts(25, 1, actionTable)).toBe(5);
    expect(actorSheet._getColumnShifts(29, 1, actionTable)).toBe(6);
    expect(actorSheet._getColumnShifts(33, 1, actionTable)).toBe(7);
    expect(actorSheet._getColumnShifts(37, 1, actionTable)).toBe(8);
    expect(actorSheet._getColumnShifts(41, 1, actionTable)).toBe(9);
    expect(actorSheet._getColumnShifts(46, 1, actionTable)).toBe(10);
    expect(actorSheet._getColumnShifts(51, 1, actionTable)).toBe(11);
    expect(actorSheet._getColumnShifts(56, 1, actionTable)).toBe(12);
    expect(actorSheet._getColumnShifts(61, 1, actionTable)).toBe(13);
    expect(actorSheet._getColumnShifts(66, 1, actionTable)).toBe(14);
    expect(actorSheet._getColumnShifts(71, 1, actionTable)).toBe(15);
    expect(actorSheet._getColumnShifts(76, 1, actionTable)).toBe(16);
    expect(actorSheet._getColumnShifts(81, 1, actionTable)).toBe(17);

    expect(actorSheet._getColumnShifts(15, 16, actionTable)).toBe(1);
    expect(actorSheet._getColumnShifts(16, 16, actionTable)).toBe(2);
});

test('_getEffectValue returns the correct effect attribute for an an acting/opposing attribute', () => {
    const actorSheet = new DCHeroesActorSheet();
    const context = {
        actor: {
            system: {
                attributes: {
                    str: { value: "str" },
                    will: { value: "will" },
                    aura: { value: "aura" },
                }
            }
        }
     }
     expect(actorSheet._getEffectValue("dex", context)).toBe("str");
     expect(actorSheet._getEffectValue("int", context)).toBe("will");
     expect(actorSheet._getEffectValue("infl", context)).toBe("aura");
 });

test('_getResistanceValue returns the correct resistance attribute for an acting/opposing attribute', () => {
    const actorSheet = new DCHeroesActorSheet();
    const targetActor = {
       system: {
            attributes: {
                body: { value: "body" },
                mind: { value: "mind" },
                spirit: { value: "spirit" },
            }
        }
    }
    expect(actorSheet._getResistanceValue("dex", targetActor)).toBe("body");
    expect(actorSheet._getResistanceValue("int", targetActor)).toBe("mind");
    expect(actorSheet._getResistanceValue("infl", targetActor)).toBe("spirit");
});

test('_getRangeIndex returns the correct index values', () => {
    const actorSheet = new DCHeroesActorSheet();
    expect(actorSheet._getRangeIndex(0)).toBe(0);
    expect(actorSheet._getRangeIndex(60)).toBe(18);
});