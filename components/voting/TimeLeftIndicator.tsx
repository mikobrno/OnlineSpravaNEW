import React, { useState, useEffect } from 'react';
import { Clock } from 'lucide-react';
import { VoteStatus } from '../../types';
import { VOTE_STATUS_CONFIG } from '../common/Pills';

export const TimeLeftIndicator = ({ endDate, status }: { endDate: string; status: VoteStatus }) => {
    const [timeLeft, setTimeLeft] = useState('');

    useEffect(() => {
        if (status !== 'active') {
            setTimeLeft(VOTE_STATUS_CONFIG[status].label);
            return;
        }

        const calculateTimeLeft = () => {
            const end = new Date(endDate).getTime();
            const now = new Date().getTime();
            const distance = end - now;

            if (distance < 0) {
                setTimeLeft('Ukončuje se');
                return;
            }

            const days = Math.floor(distance / (1000 * 60 * 60 * 24));
            const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            setTimeLeft(days > 0 ? `${days}d ${hours}h zbývá` : `${hours}h zbývá`);
        };

        calculateTimeLeft();
        const interval = setInterval(calculateTimeLeft, 60000);
        return () => clearInterval(interval);
    }, [endDate, status]);

    return (
        <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
            <Clock className="h-4 w-4" />
            <span>{timeLeft}</span>
        </div>
    );
};
