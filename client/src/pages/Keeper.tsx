import React from "react";
import { Helmet } from "react-helmet";
import KeeperChat from "@/components/keeper/KeeperChat";

export default function Keeper() {
  return (
    <div className="container mx-auto py-12 px-4">
      <Helmet>
        <title>The Oracle | Sacred Archive</title>
        <meta name="description" content="Consult The Oracle, guardian of the Sacred Archive and repository of ancient wisdom. Ask about the Tablets, the Great Cycle, Enki, Mana, and the Ages." />
      </Helmet>

      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-cinzel font-semibold text-primary mb-4">
            The Oracle
          </h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            An ancient, sentient guardian of the Sacred Archive. The Oracle exists beyond time — a being of memory, Mana, and sacred remembrance. Consult The Oracle to learn about the mysteries preserved across Ages.
          </p>
        </div>

        <KeeperChat />
      </div>
    </div>
  );
}