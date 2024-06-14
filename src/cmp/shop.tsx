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

import { TapGlass, OnDarkGlass, useStateShim } from "./misc";

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
      <div className="flex flex-col gap-2">
        {shop.available.map((item, idx) => (
          <DrawShopItem
            key={idx}
            item={item}
            onClick={async () => statefn(await AddToBasket(shop, idx))}
          />
        ))}
      </div>

      <div className="flex flex-col gap-2">
        {shop.basket.map((item, idx) => (
          <DrawShopItem
            key={idx}
            className="bg-lime-500/50"
            item={item}
            onClick={async () => statefn(await RemoveFromBasket(shop, idx))}
          />
        ))}

        <div className="flex flex-row justify-center items-center gap-2">
          <OnDarkGlass className="p-1 text-sm flex flex-col items-center">
            {shop.price > 0 && (
              <div className="text-red-300">Asking Price: {shop.price}</div>
            )}
            {shop.payment > 0 && (
              <div className="text-lime-300">Letter Value: {shop.payment}</div>
            )}
          </OnDarkGlass>

          {shop.price > 0 && (
            <TapGlass
              onClick={
                shop.payment < shop.price
                  ? undefined
                  : async () => statefn(await BuyItems(shop))
              }
              className={`p-2 text-2xl ${shop.payment < shop.price ? "text-red-300" : "text-lime-300"}`}
              repeat
            >
              Buy!
            </TapGlass>
          )}
        </div>
      </div>

      <PlayAreaState shop={shop} statefn={statefn} />

      <TapGlass
        onClick={async () => statefn(await EndShopping(shop))}
        className="p-2 text-red-400 text-2xl"
      >
        Leave
      </TapGlass>
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
  className,
}: {
  item: ShopItem;
  onClick?: () => void;
  className?: string;
}) {
  return (
    <TapGlass
      onClick={onClick}
      repeat
      className={`p-2 text-white ${className ? className : ""}`}
    >
      <div className="flex-1 flex flex-row justify-between items-center gap-2">
        <DrawShopItemContent item={item} />
        <div className="text-2xl font-light tracking-tight text-lime-200">
          ${item.price}
        </div>
      </div>
    </TapGlass>
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
