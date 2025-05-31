import React from 'react';

export function Test() {
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Тест демо режима</h1>
      <p className="mb-4">Текущий режим: {window.isDemoMode ? 'DEMO' : 'NORMAL'}</p>
      <button
        onClick={() => {
          window.isDemoMode = true;
          window.location.reload();
        }}
        className="px-4 py-2 bg-purple-600 text-white rounded-lg mr-4"
      >
        Включить демо режим
      </button>
      <button
        onClick={() => {
          window.isDemoMode = false;
          window.location.reload();
        }}
        className="px-4 py-2 bg-gray-600 text-white rounded-lg"
      >
        Выключить демо режим
      </button>
    </div>
  );
} 