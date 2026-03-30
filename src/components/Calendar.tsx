import React, { useState, useMemo } from 'react';
import { ChevronLeftIcon, ChevronRightIcon } from './Icons';

interface CalendarProps {
  selectedDate: Date | null;
  onDateSelect: (date: Date) => void;
  highlightedDates: string[]; // ISO date strings 'YYYY-MM-DD'
}

const areDatesEqual = (date1: Date | null, date2: Date | null) => {
    if (!date1 || !date2) return false;
    return date1.getFullYear() === date2.getFullYear() &&
           date1.getMonth() === date2.getMonth() &&
           date1.getDate() === date2.getDate();
}

const getWeekRange = (date: Date) => {
    const start = new Date(date);
    start.setDate(start.getDate() - start.getDay()); // Sunday
    const end = new Date(start);
    end.setDate(end.getDate() + 6); // Saturday
    return { start, end };
};


export const Calendar: React.FC<CalendarProps> = ({ selectedDate, onDateSelect, highlightedDates }) => {
    const [displayDate, setDisplayDate] = useState(new Date());
    const [view, setView] = useState<'week' | 'month'>('week');

    const daysOfWeek = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

    const calendarGrid = useMemo(() => {
        const today = new Date();
        const year = displayDate.getFullYear();
        const month = displayDate.getMonth();
        
        const grid: { date: Date; isToday: boolean; isSelected: boolean; isCurrentMonth: boolean; hasEvent: boolean; }[] = [];
        
        let startDate: Date;
        let numDays: number;

        if (view === 'month') {
            const firstDayOfMonth = new Date(year, month, 1);
            startDate = new Date(firstDayOfMonth);
            startDate.setDate(startDate.getDate() - startDate.getDay());
            numDays = 42; // 6 weeks
        } else { // week view
            const { start } = getWeekRange(displayDate);
            startDate = start;
            numDays = 7;
        }

        let day = new Date(startDate);
        for (let i = 0; i < numDays; i++) {
            const date = new Date(day);
            const isToday = areDatesEqual(date, today);
            const isSelected = areDatesEqual(date, selectedDate);
            const isCurrentMonth = date.getMonth() === month;
            const hasEvent = highlightedDates.includes(date.toISOString().split('T')[0]);

            grid.push({ date, isToday, isSelected, isCurrentMonth, hasEvent });
            day.setDate(day.getDate() + 1);
        }
        return grid;
    }, [displayDate, selectedDate, highlightedDates, view]);
    
    const changePeriod = (offset: number) => {
        setDisplayDate(prev => {
            const newDate = new Date(prev);
            if (view === 'month') {
                newDate.setDate(1);
                newDate.setMonth(newDate.getMonth() + offset);
            } else {
                newDate.setDate(newDate.getDate() + (offset * 7));
            }
            return newDate;
        });
    };

    const goToToday = () => {
        const today = new Date();
        setDisplayDate(today);
        onDateSelect(today);
    };
    
    const headerTitle = useMemo(() => {
        if (view === 'month') {
            return displayDate.toLocaleString('pt-BR', { month: 'long', year: 'numeric' });
        }
        
        const { start, end } = getWeekRange(displayDate);
        const startMonth = start.toLocaleString('pt-BR', { month: 'long' });
        const endMonth = end.toLocaleString('pt-BR', { month: 'long' });

        if (startMonth === endMonth) {
            return `${start.getDate()} - ${end.getDate()} de ${startMonth}`;
        }
        return `${start.toLocaleDateString('pt-BR', {day: '2-digit', month: 'short'})} - ${end.toLocaleDateString('pt-BR', {day: '2-digit', month: 'short'})}`;

    }, [displayDate, view]);

    return (
        <>
            <div className="flex justify-between items-center mb-4">
                <button onClick={() => changePeriod(-1)} className="p-2 rounded-full hover:bg-primary/50 text-text-secondary"><ChevronLeftIcon className="w-5 h-5" /></button>
                <div className="text-center">
                    <h3 className="text-md font-semibold text-text-primary capitalize">
                        {headerTitle}
                    </h3>
                     {view === 'week' && <p className="text-xs text-text-secondary">{displayDate.toLocaleString('pt-BR', { year: 'numeric' })}</p>}
                </div>
                <button onClick={() => changePeriod(1)} className="p-2 rounded-full hover:bg-primary/50 text-text-secondary"><ChevronRightIcon className="w-5 h-5" /></button>
            </div>
             <div className="flex justify-between items-center mb-4 text-sm">
                <div>
                     <button onClick={goToToday} className="font-semibold text-accent hover:underline px-2 py-1">Hoje</button>
                </div>
                <div className="bg-primary/80 rounded-lg p-0.5">
                    <button onClick={() => setView('week')} className={`px-3 py-1 text-xs rounded-md transition-colors ${view === 'week' ? 'bg-accent text-white shadow' : 'text-text-secondary'}`}>Semana</button>
                    <button onClick={() => setView('month')} className={`px-3 py-1 text-xs rounded-md transition-colors ${view === 'month' ? 'bg-accent text-white shadow' : 'text-text-secondary'}`}>Mês</button>
                </div>
            </div>
            <div className="grid grid-cols-7 gap-1 text-center text-xs text-text-secondary mb-2">
                {daysOfWeek.map(day => <div key={day} className="font-semibold">{day}</div>)}
            </div>
            <div className="grid grid-cols-7 gap-1">
                {calendarGrid.map(({ date, isToday, isSelected, isCurrentMonth, hasEvent }, index) => {
                    const baseClasses = 'w-full aspect-square rounded-full flex items-center justify-center text-sm transition-colors duration-200 relative transform active:scale-95';
                    let dayClasses = (view === 'month' && !isCurrentMonth) ? 'text-text-secondary/30 pointer-events-none' : 'text-text-primary cursor-pointer';
                    
                    if (isSelected) {
                        dayClasses += ' bg-accent text-white font-bold shadow-md shadow-accent/30';
                    } else if (isToday) {
                        dayClasses += ' border-2 border-accent';
                    } else if ((view === 'month' && isCurrentMonth) || view === 'week') {
                        dayClasses += ' hover:bg-primary/80';
                    }

                    return (
                        <button key={index} onClick={() => onDateSelect(date)} className={`${baseClasses} ${dayClasses}`} disabled={view === 'month' && !isCurrentMonth}>
                            {date.getDate()}
                            {hasEvent && <span className={`absolute bottom-1.5 w-1.5 h-1.5 rounded-full ${isSelected ? 'bg-white' : 'bg-accent'}`}></span>}
                        </button>
                    );
                })}
            </div>
        </>
    );
};
