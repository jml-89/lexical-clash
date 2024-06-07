import Image from "next/image";
import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";

import type { PlayArea } from "@/lib/playarea";
import type { Shop, ShopItem } from "@/lib/shop";
import {
  UpdatePlayArea,
  AddToBasket,
  RemoveFromBasket,
  BuyItems,
  EndShopping,
} from "@/lib/shop";

import { DrawLetters } from "./letter";
import { DrawAbility } from "./ability";
import { DrawBonus } from "./bonus";
import { DrawWordpack } from "./wordpack";
import { DrawPlayArea } from "./playarea";

import { OnDarkGlass } from "./misc";

export type ShopFnT = (shop: Shop) => Promise<Shop>;
type StateFnT = (fn: ShopFnT) => Promise<void>;

export function PlayShop({
  get,
  set,
}: {
  get: () => Shop;
  set: (changed: () => void, shop: Shop) => Promise<void>;
}) {
  const [repaints, repaint] = useState(0);
  const statefn = useCallback(
    async (fn: ShopFnT): Promise<void> => {
      await set(() => repaint((x) => x + 1), await fn(get()));
    },
    [get, set, repaint],
  );

  const getPlayArea = useCallback((): PlayArea => get().playArea, [get]);
  const setPlayArea = useCallback(
    async (changed: () => void, playArea: PlayArea): Promise<void> => {
      const prev = getPlayArea();
      await statefn(async (shop: Shop) => await UpdatePlayArea(shop, playArea));
      const next = getPlayArea();
      if (!Object.is(prev, next)) {
        changed();
      }
    },
    [getPlayArea, statefn],
  );

  return (
    <div className="flex-1 flex flex-col justify-center items-center gap-2">
      <div>
        <OnDarkGlass className="p-2 text-white">Available</OnDarkGlass>
        {get().available.map((item, idx) => (
          <DrawShopItem
            key={idx}
            item={item}
            onClick={() => statefn((shop: Shop) => AddToBasket(shop, idx))}
          />
        ))}
      </div>

      <div>
        <OnDarkGlass className="p-2 text-white">Basket</OnDarkGlass>
        {get().basket.map((item, idx) => (
          <DrawShopItem
            key={idx}
            item={item}
            onClick={() => statefn((shop: Shop) => RemoveFromBasket(shop, idx))}
          />
        ))}
        {get().price > 0 && (
          <OnDarkGlass className="p-2 text-red-300">
            Price: {get().price}
          </OnDarkGlass>
        )}
      </div>

      {get().payment > 0 && (
        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={() => statefn(BuyItems)}
        >
          <OnDarkGlass className="p-2 text-lime-300">
            Pay ({get().payment})
          </OnDarkGlass>
        </motion.button>
      )}

      <DrawPlayArea get={getPlayArea} set={setPlayArea} />

      <motion.button
        onClick={() => statefn(EndShopping)}
        whileTap={{ scale: 0.9 }}
      >
        <OnDarkGlass className="p-2 text-white">Leave</OnDarkGlass>
      </motion.button>
    </div>
  );
}

function DrawShopItem({
  item,
  onClick,
}: {
  item: ShopItem;
  onClick?: () => void;
}) {
  return (
    <motion.button onClick={onClick} whileTap={{ scale: 0.9 }}>
      <OnDarkGlass className="p-2 text-white">
        <div className="flex-1 flex flex-row">
          <DrawShopItemContent item={item} />
          <div>${item.price}</div>
        </div>
      </OnDarkGlass>
    </motion.button>
  );
}

function DrawShopItemContent({ item }: { item: ShopItem }) {
  switch (item.type) {
    case "ability":
      return <DrawAbility ability={item.item} />;

    case "bonus":
      return <DrawBonus bonus={item.item} />;

    case "wordpack":
      return <DrawWordpack wordpack={item.item} />;

    case "letters":
      return <DrawLetters letters={item.item} />;
  }
}
