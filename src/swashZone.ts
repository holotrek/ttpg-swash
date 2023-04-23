import { Card, CardDetails, Color, DrawingLine, Label, Rotator, Vector, world, Zone, ZonePermission } from '@tabletop-playground/api';
import { GM_INDEX } from './constants';

export class SwashZone {
  private static _zones: SwashZone[] = [];

  static createZone(
    playerColor: Color | undefined,
    playerIndex: number,
    centerPoint: Vector,
    height: number,
    width: number,
    isRotated: boolean,
    thickness = 1.0,
    label?: string
  ) {
    const zone = new SwashZone(playerColor, playerIndex, centerPoint, height, width, isRotated, thickness, label);
    this._zones.push(zone);
    return zone;
  }

  static findZone(zone: Zone) {
    return this._zones.find(z => z.zone === zone);
  }

  private _line: DrawingLine;
  private _label?: Label;
  private _onCardEnter: (card: Card) => void = _ => {};
  private _onCardLeave: (card: Card) => void = _ => {};

  zone: Zone;
  cards: Card[] = [];

  private constructor(
    public playerColor: Color | undefined,
    public playerIndex: number,
    public centerPoint: Vector,
    public height: number,
    public width: number,
    public isRotated: boolean,
    public thickness = 1.0,
    public label?: string
  ) {
    this.zone = this._create();
    this._line = this._drawLines();
    this._label = this._createLabel();
  }

  setOnCardEnter(fn: (card: Card) => void) {
    this._onCardEnter = fn;
  }

  setOnCardLeave(fn: (card: Card) => void) {
    this._onCardLeave = fn;
  }

  registerCard(card: Card) {
    const exists = this.cards.find(c => c.getId() === card.getId());
    if (!exists) {
      this.cards.push(card);
      this._onCardEnter(card);
    }
  }

  unRegisterCard(card: Card) {
    const idx = this.cards.findIndex(c => c.getId() === card.getId());
    if (idx > -1) {
      this.cards.splice(idx, 1);
      this._onCardLeave(card);
    }
  }

  remove() {
    this.zone.destroy();
    world.removeDrawingLineObject(this._line);
    this._label?.destroy();
  }

  _create() {
    const zone = world.createZone(this.centerPoint.add([0, 0, 10]));
    zone.setScale([this.height, this.width, 20]);
    const colorWithHalfAlpha = new Color(
      this.playerColor?.r ?? 1,
      this.playerColor?.g ?? 1,
      this.playerColor?.b ?? 1,
      0.5
    );
    zone.setColor(colorWithHalfAlpha);
    zone.setSlotOwns(this.playerIndex, true);
    zone.setSlotOwns(GM_INDEX, true);
    zone.setObjectInteraction(ZonePermission.OwnersOnly);
    zone.setSnapping(ZonePermission.OwnersOnly);
    zone.setStacking(ZonePermission.OwnersOnly);
    zone.setInserting(ZonePermission.OwnersOnly);
    zone.onBeginOverlap.add((_, object) => {
      if (object instanceof Card && object.isFaceUp()) {
        this.registerCard(object);
      }
    });
    zone.onEndOverlap.add((_, object) => {
      if (object instanceof Card) {
        this.unRegisterCard(object);
      }
    });
    return zone;
  }

  _drawLines() {
    const line = new DrawingLine();
    line.thickness = this.thickness;
    line.color = this.playerColor ?? new Color(1, 1, 1);
    const startingPoint = this.centerPoint.subtract(new Vector(this.height / 2, this.width / 2, 0));
    line.points = [
      startingPoint,
      startingPoint.add([0, this.width, 0]),
      startingPoint.add([this.height, this.width, 0]),
      startingPoint.add([this.height, 0, 0]),
      startingPoint,
    ];
    world.addDrawingLine(line);
    return line;
  }

  _createLabel() {
    if (this.label) {
      const xDelta = (this.isRotated ? -1 : 1) * (this.height / 2 - 2);
      const position = this.centerPoint.add(new Vector(xDelta, 0, 0));
      const label = world.createLabel(position);
      label.setText(this.label);
      label.setRotation([-90, this.isRotated ? 180 : 0, 0]);
      label.setScale(0.5);
      return label;
    }
  }
}
