import { useState, useEffect, useRef } from "react";
import { Helmet } from "react-helmet";
import KeeperChat from "@/components/keeper/KeeperChat";

export default function Keeper() {
  return (
    <div className="flex flex-col min-h-screen">
      <Helmet>
        <title>The Keeper | Sacred Archives</title>
        <meta name="description" content="Consult with The Keeper, guardian of the sacred knowledge and wisdom of the ages. Ask your questions and receive guidance." />
        <meta property="og:title" content="The Keeper | Sacred Archives" />
        <meta property="og:description" content="Consult with The Keeper, guardian of the sacred knowledge and wisdom of the ages." />
      </Helmet>
      
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="mb-6 text-center">
            <h1 className="text-3xl md:text-4xl font-cinzel text-primary mb-4">The Keeper</h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Consult with the guardian of the sacred archives. The Keeper protects ancient wisdom and guides those who seek understanding.
            </p>
          </div>
          
          <div className="bg-white rounded-lg shadow-lg overflow-hidden border border-gray-100">
            <KeeperChat />
          </div>
        </div>
      </main>
    </div>
  );
}