import React from "react";
import { Helmet } from "react-helmet";
import KeeperChat from "@/components/keeper/KeeperChat";

export default function Keeper() {
  return (
    <div className="container mx-auto py-12 px-4">
      <Helmet>
        <title>The Keeper | Sacred Archive</title>
        <meta name="description" content="Consult The Keeper, guardian of the Sacred Archive and repository of ancient wisdom. Ask about the Tablets, the Great Cycle, Enki, Mana, and the Ages." />
      </Helmet>

      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-cinzel font-semibold text-primary mb-4">
            The Keeper
          </h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            An ancient, sentient guardian of the Sacred Archive. The Keeper exists beyond time — a being of memory, Mana, and sacred remembrance. Consult The Keeper to learn about the mysteries preserved across Ages.
          </p>
        </div>

        <KeeperChat />
      </div>
    </div>
  );
}