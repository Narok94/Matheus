import React, { useState, useMemo } from 'react';
import { ChevronLeftIcon, ChevronRightIcon } from './Icons';

interface CalendarProps {
  selectedDate: Date | null;
  onDateSelect: (date: Date) => void;
  highlightedDates: string[]; // ISO date strings 'YYYY-MM-DD'
}

const areDatesEqual = (date1: Date, date2: Date) => 
    date1.getFullYear() === date2.getFullYear() &&
    date1.getMonth() === date2.getMonth() &&
    date1.getDate() === date2.getDate();

export const Calendar: React.FC<CalendarProps> = ({ selectedDate, onDateSelect, highlightedDates }) => {
    const [currentMonth, setCurrentMonth] = useState(new Date());

    const daysOfWeek = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

    const calendarGrid = useMemo(() => {
        const today = new Date();
        const year = currentMonth.getFullYear();
        const month = currentMonth.getMonth();
        const firstDayOfMonth = new Date(year, month, 1);
        
        const grid = [];
        let day = new Date(firstDayOfMonth);
        day.setDate(day.getDate() - day.getDay()); // Start from the Sunday of the first week

        for (let i = 0; i < 42; i++) { // 6 weeks grid to cover all month layouts
            const date = new Date(day);
            const isToday = areDatesEqual(date, today);
            const isSelected = selectedDate ? areDatesEqual(date, selectedDate) : false;
            const isCurrentMonth = date.getMonth() === month;
            const hasEvent = highlightedDates.includes(date.toISOString().split('T')[0]);

            grid.push({ date, isToday, isSelected, isCurrentMonth, hasEvent });
            day.setDate(day.getDate() + 1);
        }
        return grid;
    }, [currentMonth, selectedDate, highlightedDates]);
    
    const changeMonth = (offset: number) => {
        setCurrentMonth(prev => {
            const newDate = new Date(prev);
            newDate.setDate(1); // Set to the first to avoid month skipping issues
            newDate.setMonth(newDate.getMonth() + offset);
            return newDate;
        });
    };

    return (
        <div className="bg-secondary/70 backdrop-blur-md rounded-xl shadow-lg dark:shadow-cyan-900/10 border border-border p-4 animate-fade-in">
            <div className="flex justify-between items-center mb-4">
                <button onClick={() => changeMonth(-1)} className="p-2 rounded-full hover:bg-primary/50 text-text-secondary"><ChevronLeftIcon className="w-5 h-5" /></button>
                <h3 className="text-lg font-semibold text-text-primary capitalize">
                    {currentMonth.toLocaleString('pt-BR', { month: 'long', year: 'numeric' })}
                </h3>
                <button onClick={() => changeMonth(1)} className="p-2 rounded-full hover:bg-primary/50 text-text-secondary"><ChevronRightIcon className="w-5 h-5" /></button>
            </div>
            <div className="grid grid-cols-7 gap-1 text-center text-xs text-text-secondary mb-2">
                {daysOfWeek.map(day => <div key={day} className="font-semibold">{day}</div>)}
            </div>
            <div className="grid grid-cols-7 gap-1">
                {calendarGrid.map(({ date, isToday, isSelected, isCurrentMonth, hasEvent }, index) => {
                    const baseClasses = 'w-full aspect-square rounded-full flex items-center justify-center text-sm transition-colors duration-200 relative transform active:scale-95';
                    let dayClasses = isCurrentMonth ? 'text-text-primary cursor-pointer' : 'text-text-secondary/30 pointer-events-none';
                    if (isSelected) {
                        dayClasses += ' bg-accent text-white font-bold shadow-md shadow-accent/30';
                    } else if (isToday) {
                        dayClasses += ' border-2 border-accent';
                    } else if (isCurrentMonth) {
                        dayClasses += ' hover:bg-primary/80';
                    }

                    return (
                        <button key={index} onClick={() => onDateSelect(date)} className={`${baseClasses} ${dayClasses}`} disabled={!isCurrentMonth}>
                            {date.getDate()}
                            {hasEvent && <span className={`absolute bottom-1.5 w-1.5 h-1.5 rounded-full ${isSelected ? 'bg-white' : 'bg-accent'}`}></span>}
                        </button>
                    );
                })}
            </div>
        </div>
    );
};