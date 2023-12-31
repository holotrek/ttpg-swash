import { CaptainBehavior } from '../behaviors/captain';
import { Card } from '@tabletop-playground/api';
import { PLAYER_SLOTS } from '../constants';

export class CaptainManager {
  static behaviors: { [guid: string]: CaptainBehavior } = {};

  static registerCard(card: Card): CaptainBehavior {
    const capt = CaptainManager.getCaptain(card.getId());
    if (!!capt) {
      return capt;
    }

    const behavior = new CaptainBehavior(card);
    CaptainManager.behaviors[card.getId()] = behavior;
    return behavior;
  }

  static getCaptain(id: string): CaptainBehavior | undefined {
    return this.behaviors[id];
  }

  static getCaptainByPlayer(slot: number): CaptainBehavior | undefined {
    return Object.values(this.behaviors).find(c => c.player?.getSlot() === slot);
  }

  static getCaptainByPlayerTags(tags: string[]): CaptainBehavior | undefined {
    const slot = PLAYER_SLOTS.findIndex(p => tags.includes(p));
    return this.getCaptainByPlayer(slot);
  }
}
