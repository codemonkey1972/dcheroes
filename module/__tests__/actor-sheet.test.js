import { DCHeroesActorSheet } from "../sheets/actor-sheet.mjs";
import { jest } from '@jest/globals'

const actorSheet = new DCHeroesActorSheet();

test('getData loads data', () => {

    const results = actorSheet.getData();

    // TODO
    
});

test('_getEffectValue returns the correct effect attribute for an an acting/opposing attribute', () => {
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
    expect(actorSheet._getRangeIndex(0)).toBe(0);
    expect(actorSheet._getRangeIndex(60)).toBe(18);
});