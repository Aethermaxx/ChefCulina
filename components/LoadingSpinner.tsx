import React from 'react';
import { useTranslation } from '../contexts/LanguageContext';
import { motion } from 'framer-motion';

export const LoadingSpinner: React.FC = () => {
  const { t } = useTranslation();
  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="flex flex-col items-center justify-center p-4 my-4"
    >
      <div className="flex space-x-2">
        {[0, 1, 2].map((index) => (
          <motion.div
            key={index}
            className="w-3 h-3 bg-primary rounded-full"
            animate={{
              y: [-6, 6, -6],
              opacity: [0.6, 1, 0.6],
            }}
            transition={{
              duration: 1,
              repeat: Infinity,
              ease: "easeInOut",
              delay: index * 0.2,
            }}
          />
        ))}
      </div>
      <motion.p 
        initial={{ opacity: 0, y: 5 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="mt-3 text-base font-medium text-text-secondary"
      >
        {t('loading')}
      </motion.p>
    </motion.div>
  );
};