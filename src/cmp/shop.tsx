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

import { OnDarkGlass, useStateShim } from "./misc";

export type ShopFnT = (shop: Shop) => Promise<Shop>;
type StateFnT = (shop: Shop) => Promise<void>;

export function PlayShop({
  shop,
  handleReturn,
}: {
  shop: Shop;
  handleReturn: (shop: Shop) => Promise<void>;
}) {
  const statefn = async (shop: Shop): Promise<void> => {
    await handleReturn(shop);
  };

  return (
    <div className="flex-1 flex flex-col justify-center items-center gap-2">
      <div>
        <OnDarkGlass className="p-2 text-white">Available</OnDarkGlass>
        {shop.available.map((item, idx) => (
          <DrawShopItem
            key={idx}
            item={item}
            onClick={async () => statefn(await AddToBasket(shop, idx))}
          />
        ))}
      </div>

      <div>
        <OnDarkGlass className="p-2 text-white">Basket</OnDarkGlass>
        {shop.basket.map((item, idx) => (
          <DrawShopItem
            key={idx}
            item={item}
            onClick={async () => statefn(await RemoveFromBasket(shop, idx))}
          />
        ))}
        {shop.price > 0 && (
          <OnDarkGlass className="p-2 text-red-300">
            Price: {shop.price}
          </OnDarkGlass>
        )}
      </div>

      {shop.payment > 0 && (
        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={async () => statefn(await BuyItems(shop))}
        >
          <OnDarkGlass className="p-2 text-lime-300">
            Pay ({shop.payment})
          </OnDarkGlass>
        </motion.button>
      )}

      <PlayAreaState shop={shop} statefn={statefn} />

      <motion.button
        onClick={async () => statefn(await EndShopping(shop))}
        whileTap={{ scale: 0.9 }}
      >
        <OnDarkGlass className="p-2 text-white">Leave</OnDarkGlass>
      </motion.button>
    </div>
  );
}

function PlayAreaState({ shop, statefn }: { shop: Shop; statefn: StateFnT }) {
  const [playArea, returnHandler] = useStateShim(
    shop.playArea,
    async (x: PlayArea) => await statefn(await UpdatePlayArea(shop, x)),
  );

  return <DrawPlayArea playArea={playArea} handleReturn={returnHandler} />;
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
