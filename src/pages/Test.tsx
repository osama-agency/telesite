import React, { useState } from 'react';
import { ModernDateFilter, DateRange } from '../components/ui/ModernDateFilter';

export function Test() {
  const [dateRange, setDateRange] = useState<DateRange>({});

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-900 dark:to-slate-800 p-6">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-slate-800 dark:text-white mb-2">
            Современный фильтр по дате
          </h1>
          <p className="text-slate-600 dark:text-slate-400">
            Демонстрация нового компонента с пресетами и автообновлением
          </p>
        </div>

        {/* Примеры использования */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Основной компонент */}
          <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-xl p-6 border border-slate-200/50 dark:border-slate-700/50 shadow-xl">
            <h3 className="text-lg font-semibold mb-4 text-slate-800 dark:text-white">
              Основной фильтр
            </h3>
            <ModernDateFilter
              value={dateRange}
              onChange={setDateRange}
              placeholder="Выберите период"
            />
            <div className="mt-4 p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Выбранный период:
              </p>
              <pre className="text-xs mt-1 text-slate-800 dark:text-slate-200">
                {JSON.stringify(dateRange, null, 2)}
              </pre>
            </div>
          </div>

          {/* Компактная версия */}
          <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-xl p-6 border border-slate-200/50 dark:border-slate-700/50 shadow-xl">
            <h3 className="text-lg font-semibold mb-4 text-slate-800 dark:text-white">
              Компактная версия
            </h3>
            <ModernDateFilter
              value={dateRange}
              onChange={setDateRange}
              className="w-full"
              placeholder="Период"
            />
          </div>

          {/* В форме */}
          <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-xl p-6 border border-slate-200/50 dark:border-slate-700/50 shadow-xl">
            <h3 className="text-lg font-semibold mb-4 text-slate-800 dark:text-white">
              В составе формы
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Период отчета
                </label>
                <ModernDateFilter
                  value={dateRange}
                  onChange={setDateRange}
                  placeholder="Выберите даты"
                />
              </div>
              <button className="w-full px-4 py-2 bg-purple-500 hover:bg-purple-600 text-white rounded-lg transition-colors">
                Создать отчет
              </button>
            </div>
          </div>
        </div>

        {/* Особенности */}
        <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-xl p-6 border border-slate-200/50 dark:border-slate-700/50 shadow-xl">
          <h3 className="text-lg font-semibold mb-4 text-slate-800 dark:text-white">
            ✨ Особенности компонента
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-slate-600 dark:text-slate-400">
            <div>
              <h4 className="font-medium text-slate-800 dark:text-white mb-2">Пресеты:</h4>
              <ul className="list-disc list-inside space-y-1">
                <li>Сегодня</li>
                <li>Вчера</li>
                <li>Эта неделя</li>
                <li>Этот месяц</li>
                <li>7 дней</li>
                <li>30 дней</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium text-slate-800 dark:text-white mb-2">Функции:</h4>
              <ul className="list-disc list-inside space-y-1">
                <li>Автообновление без кнопки "Применить"</li>
                <li>Адаптивный дизайн</li>
                <li>Произвольный диапазон</li>
                <li>Темная тема</li>
                <li>Анимации</li>
                <li>Клавиатурная навигация</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 