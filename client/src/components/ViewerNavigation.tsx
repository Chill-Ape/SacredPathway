import React from 'react';
import { Link } from 'wouter';

export default function ViewerNavigation() {
  return (
    <div className="bg-gray-800 p-3 mb-4 rounded-md">
      <h3 className="text-white text-lg mb-2 font-semibold">3D Viewer Test Pages</h3>
      <div className="flex flex-wrap gap-2">
        <Link href="/standalone-model">
          <a className="px-3 py-1.5 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors">
            Standalone HTML Viewer
          </a>
        </Link>
        <Link href="/simple-burger">
          <a className="px-3 py-1.5 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors">
            Simple Iframe Viewer
          </a>
        </Link>
        <Link href="/basic-burger">
          <a className="px-3 py-1.5 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors">
            Basic Three.js Viewer
          </a>
        </Link>
        <Link href="/burger-model">
          <a className="px-3 py-1.5 bg-amber-600 text-white rounded-md hover:bg-amber-700 transition-colors">
            React Three Fiber Viewer
          </a>
        </Link>
      </div>
    </div>
  );
}