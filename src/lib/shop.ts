//shop.ts
//A place to buy new abilities, bonuses, wordpacks, and letters
//It isn't free, however; and the price is letters!

import type { Letter } from "./letter";
import { ScrabbleDistribution, LetterScore } from "./letter";

import type { AbilityCard } from "./ability";
import { AbilityCards } from "./ability";

import type { BonusCard } from "./bonus";
import { BonusCards } from "./bonus";

import type { Wordpack } from "./wordpack";
import { NewWordpack } from "./wordpack";

import type { PlayArea } from "./playarea";
import {
  NewPlayArea,
  DrawAll,
  LiquidatePlaced,
  PackUp,
  FlipHand,
} from "./playarea";

import type { PRNG } from "./util";
import { Shuffle, PickRandom } from "./util";

export interface Shop {
  image: string;

  done: boolean;

  available: ShopItem[];
  basket: ShopItem[];
  bought: ShopItem[];
  price: number;

  playArea: PlayArea;
  payment: number;
}

export type ShopItem = AbilityShop | BonusShop | WordpackShop | LetterShop;

export interface AbilityShop {
  type: "ability";
  item: AbilityCard;
  price: number;
}

export interface BonusShop {
  type: "bonus";
  item: BonusCard;
  price: number;
}

export interface WordpackShop {
  type: "wordpack";
  item: Wordpack;
  price: number;
}

export interface LetterShop {
  type: "letters";
  item: Letter[];
  price: number;
}

export async function NewShop(
  prng: PRNG,
  level: number,
  bag: Letter[],
): Promise<Shop> {
  return {
    image: "seller.jpg",
    done: false,

    available: await randomShopItems(prng, level, 4),
    basket: [],
    bought: [],
    price: 0,

    playArea: FlipHand(DrawAll(NewPlayArea(prng, bag.length, bag))),
    payment: 0,
  };
}

export async function UpdatePlayArea(
  shop: Shop,
  playArea: PlayArea,
): Promise<Shop> {
  return {
    ...shop,
    playArea: playArea,
    payment: LetterScore(playArea.placed),
  };
}

async function randomShopItems(
  prng: PRNG,
  level: number,
  num: number,
): Promise<ShopItem[]> {
  let items: ShopItem[] = [];

  for (let i = 0; i < num; i++) {
    const randresult = prng(1, 4);
    const price = prng(10, 10 + level * 5);

    if (randresult === 1) {
      const boost = Math.trunc(level / 4);
      for (const [k, v] of PickRandom(prng, AbilityCards, 1)) {
        items.push({
          type: "ability",
          item: { ...v, uses: v.uses + boost },
          price: price,
        });
      }
    } else if (randresult === 2) {
      for (const [k, v] of PickRandom(prng, BonusCards, 1)) {
        const boost = Math.trunc(level / 2);
        items.push({
          type: "bonus",
          item: { ...v, level: v.level + boost },
          price: price,
        });
      }
    } else if (randresult === 3) {
      const pack = await NewWordpack(level);
      items.push({ type: "wordpack", item: pack, price: price });
    } else if (randresult === 4) {
      const letters = Shuffle(prng, ScrabbleDistribution())
        .slice(0, prng(3, 10))
        .map((letter) => ({ ...letter, bonus: level }));
      items.push({ type: "letters", item: letters, price: price });
    }
  }

  return items;
}

function updatePrice(shop: Shop): Shop {
  return {
    ...shop,
    price: shop.basket.reduce((xs, x) => xs + x.price, 0),
  };
}

export async function AddToBasket(shop: Shop, idx: number): Promise<Shop> {
  if (!(idx < shop.available.length)) {
    return shop;
  }

  return updatePrice({
    ...shop,
    available: [
      ...shop.available.slice(0, idx),
      ...shop.available.slice(idx + 1),
    ],
    basket: [...shop.basket, shop.available[idx]],
  });
}

export async function RemoveFromBasket(shop: Shop, idx: number): Promise<Shop> {
  if (!(idx < shop.basket.length)) {
    return shop;
  }

  return updatePrice({
    ...shop,
    available: [...shop.available, shop.basket[idx]],
    basket: [...shop.basket.slice(0, idx), ...shop.basket.slice(idx + 1)],
  });
}

export async function EndShopping(shop: Shop): Promise<Shop> {
  return {
    ...shop,
    done: true,
    playArea: PackUp(shop.playArea),
  };
}

export async function BuyItems(shop: Shop): Promise<Shop> {
  if (shop.price > shop.payment) {
    return shop;
  }

  return {
    ...shop,
    basket: [],
    bought: [...shop.bought, ...shop.basket],
    playArea: LiquidatePlaced(shop.playArea),
    payment: 0,
    price: 0,
  };
}
