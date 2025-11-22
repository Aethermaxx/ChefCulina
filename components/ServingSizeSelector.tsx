import React from 'react';
import { useTranslation } from '../contexts/LanguageContext';
import { AdultIcon } from './icons/AdultIcon';
import { ChildIcon } from './icons/ChildIcon';
import { SeniorIcon } from './icons/SeniorIcon';

interface ServingSize {
  adults: number;
  children: number;
  seniors: number;
}

interface ServingSizeSelectorProps {
  servingSize: ServingSize;
  onChange: (newSize: ServingSize) => void;
}

const Counter: React.FC<{
    label: string;
    value: number;
    onIncrement: () => void;
    onDecrement: () => void;
    icon: React.ReactNode;
}> = ({ label, value, onIncrement, onDecrement, icon }) => (
    <div className="flex flex-col items-center">
        <div className="flex items-center gap-2 mb-1 text-text-secondary">
            {icon}
            <span className="font-medium text-sm">{label}</span>
        </div>
        <div className="flex items-center gap-2">
            <button type="button" onClick={onDecrement} className="w-8 h-8 font-bold text-lg text-primary bg-primary-light dark:bg-primary/20 dark:text-emerald-300 rounded-full hover:bg-primary/30 dark:hover:bg-primary/40 transition-colors focus:outline-none focus:ring-2 focus:ring-primary">-</button>
            <span className="w-10 text-center text-lg font-semibold text-text-primary">{value}</span>
            <button type="button" onClick={onIncrement} className="w-8 h-8 font-bold text-lg text-primary bg-primary-light dark:bg-primary/20 dark:text-emerald-300 rounded-full hover:bg-primary/30 dark:hover:bg-primary/40 transition-colors focus:outline-none focus:ring-2 focus:ring-primary">+</button>
        </div>
    </div>
);


export const ServingSizeSelector: React.FC<ServingSizeSelectorProps> = ({ servingSize, onChange }) => {
    const { t } = useTranslation();

    const handleIncrement = (type: keyof ServingSize) => {
        onChange({ ...servingSize, [type]: servingSize[type] + 1 });
    };

    const handleDecrement = (type: keyof ServingSize) => {
        onChange({ ...servingSize, [type]: Math.max(0, servingSize[type] - 1) });
    };

    const totalServings = servingSize.adults + servingSize.children + servingSize.seniors;

    return (
        <div>
            <h4 className="text-center text-lg font-bold font-heading mb-4">{t('pantry.servingSizeTitle')}</h4>
            <div className="grid grid-cols-3 gap-4 justify-items-center">
                <Counter
                    label={t('pantry.servings.adults')}
                    value={servingSize.adults}
                    onIncrement={() => handleIncrement('adults')}
                    onDecrement={() => handleDecrement('adults')}
                    icon={<AdultIcon className="w-5 h-5" />}
                />
                <Counter
                    label={t('pantry.servings.children')}
                    value={servingSize.children}
                    onIncrement={() => handleIncrement('children')}
                    onDecrement={() => handleDecrement('children')}
                    icon={<ChildIcon className="w-5 h-5" />}
                />
                 <Counter
                    label={t('pantry.servings.seniors')}
                    value={servingSize.seniors}
                    onIncrement={() => handleIncrement('seniors')}
                    onDecrement={() => handleDecrement('seniors')}
                    icon={<SeniorIcon className="w-5 h-5" />}
                />
            </div>
            <div className="mt-4 text-center font-semibold text-text-secondary">
                {t('pantry.servings.total')}: <span className="text-primary dark:text-primary-dark">{totalServings}</span>
            </div>
        </div>
    );
};
