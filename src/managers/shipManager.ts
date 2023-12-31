import { Card } from '@tabletop-playground/api';
import { Resources } from '../resources';
import { ShipBehavior } from '../behaviors/ship';
import { ShipSizes, ShipSpec } from '../specs/ship';

const ships = [
  new ShipSpec('Sloop', ShipSizes.Small, 13, 1, 4, 0, -2, 2, [Resources.Lumber]),
  new ShipSpec('Clipper', ShipSizes.Small, 15, 2, 5, 1, -3, 2, [Resources.Lumber, Resources.Leather]),
  new ShipSpec('Schooner', ShipSizes.Small, 16, 3, 6, 3, -3, 3, [Resources.Lumber, Resources.Leather, Resources.Iron]),
  new ShipSpec('Brig', ShipSizes.Medium, 21, 5, 7, 2, -4, 2, [Resources.Leather, Resources.Iron, Resources.Coffee]),
  new ShipSpec('Frigate', ShipSizes.Medium, 22, 6, 8, 4, -4, 3, [Resources.Iron, Resources.Coffee, Resources.Rum]),
  new ShipSpec('Galleon', ShipSizes.Large, 27, 8, 9, 6, -5, 5, [Resources.Coffee, Resources.Rum, Resources.Sugar]),
  new ShipSpec('Man-o-War', ShipSizes.Large, 34, 11, 11, 10, -5, 6, [
    Resources.Sugar,
    Resources.Spices,
    Resources.Gold,
  ]),
];

export class ShipManager {
  static behaviors: { [guid: string]: ShipBehavior } = {};

  static registerCard(card: Card): ShipBehavior | undefined {
    const ship = ShipManager.getShip(card.getId());
    if (!!ship) {
      return ship;
    }

    const spec = ShipManager.getShipSpec(card.getCardDetails().name);
    if (spec) {
      const behavior = new ShipBehavior(card, spec);
      ShipManager.behaviors[card.getId()] = behavior;
      return behavior;
    }
  }

  static getShip(id: string): ShipBehavior | undefined {
    return this.behaviors[id];
  }

  static getShipSpec(name: string): ShipSpec | undefined {
    return ships.find(x => x.name === name);
  }
}
