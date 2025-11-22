import React, { useState, useRef } from 'react';
import { useTranslation } from '../contexts/LanguageContext';
import { analyzeImage } from '../services/geminiService';
import { DocumentScannerIcon } from '../components/icons/DocumentScannerIcon';
import { SparklesIcon } from '../components/icons/SparklesIcon';

export const Finder: React.FC = () => {
    const { t } = useTranslation();
    const [image, setImage] = useState<string | null>(null);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [result, setResult] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setImage(reader.result as string);
                setResult(null);
                setError(null);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleAnalyze = async () => {
        if (!image) return;
        setIsAnalyzing(true);
        setError(null);
        setResult(null);

        try {
            // Extract base64 data and mime type
            const matches = image.match(/^data:(.+);base64,(.+)$/);
            if (!matches || matches.length !== 3) {
                throw new Error("Invalid image format");
            }
            const mimeType = matches[1];
            const base64Data = matches[2];

            const analysis = await analyzeImage(base64Data, mimeType);
            setResult(analysis);
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to analyze image");
        } finally {
            setIsAnalyzing(false);
        }
    };

    const triggerFileInput = () => {
        fileInputRef.current?.click();
    };

    return (
        <div className="container mx-auto px-4">
             <div className="max-w-3xl mx-auto animate-fade-in-up">
                <div className="text-center mb-8">
                    <h2 className="text-4xl font-bold font-heading text-text-heading">{t('finder.title')}</h2>
                    <p className="text-lg text-text-secondary mt-2 max-w-xl mx-auto">{t('finder.subtitle')}</p>
                </div>

                <div className="bg-surface/80 backdrop-blur-sm p-6 md:p-8 rounded-3xl shadow-xl border border-white/20 dark:border-gray-700">
                     <div 
                        className={`group relative border-3 border-dashed rounded-2xl p-10 text-center cursor-pointer transition-all duration-300 
                            ${image 
                                ? 'border-primary bg-primary/5 dark:bg-primary/10' 
                                : 'border-gray-300 dark:border-gray-600 hover:border-primary hover:bg-gray-50 dark:hover:bg-gray-800/50'
                            }`}
                        onClick={triggerFileInput}
                     >
                        <input 
                            type="file" 
                            ref={fileInputRef} 
                            onChange={handleFileChange} 
                            accept="image/*" 
                            className="hidden" 
                        />
                        
                        {image ? (
                            <div className="relative">
                                <img src={image} alt="Preview" className="max-h-80 mx-auto rounded-xl shadow-md object-contain" />
                                <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity rounded-xl">
                                     <span className="text-white font-medium bg-black/50 px-4 py-2 rounded-full backdrop-blur-sm">
                                        {t('finder.clickToChange')}
                                     </span>
                                </div>
                            </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center py-8">
                                <div className="w-20 h-20 bg-primary-light dark:bg-gray-700 rounded-full flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                                    <DocumentScannerIcon className="w-10 h-10 text-primary dark:text-primary-dark" />
                                </div>
                                <p className="text-xl font-semibold text-text-primary mb-2">{t('finder.upload')}</p>
                                <p className="text-sm text-text-secondary">{t('finder.drag_drop')}</p>
                            </div>
                        )}
                     </div>

                     <div className="mt-8">
                        <button
                            onClick={handleAnalyze}
                            disabled={!image || isAnalyzing}
                            className="glass-button w-full flex items-center justify-center gap-3 px-6 py-4 font-bold text-white rounded-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed transform hover:-translate-y-1 hover:shadow-lg disabled:transform-none disabled:shadow-none"
                        >
                            {isAnalyzing ? (
                                <>
                                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    <span>{t('finder.analyzing')}</span>
                                </>
                            ) : (
                                <>
                                    <SparklesIcon className="w-5 h-5" />
                                    <span>{t('finder.analyze')}</span>
                                </>
                            )}
                        </button>
                     </div>
                </div>

                {result && (
                    <div className="mt-8 bg-surface/90 backdrop-blur-md p-6 md:p-8 rounded-3xl shadow-xl border border-border animate-fade-in-up">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="p-2 bg-primary/10 rounded-lg">
                                <SparklesIcon className="w-6 h-6 text-primary dark:text-primary-dark" />
                            </div>
                            <h3 className="text-xl font-bold font-heading text-text-primary">{t('finder.result')}</h3>
                        </div>
                        <div className="prose dark:prose-invert max-w-none text-text-secondary whitespace-pre-wrap leading-relaxed p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl border border-gray-100 dark:border-gray-700/50">
                            {result}
                        </div>
                    </div>
                )}

                {error && (
                    <div className="mt-6 p-4 text-red-800 bg-red-100 dark:text-red-200 dark:bg-red-900/30 border border-red-300 dark:border-red-500/50 rounded-xl animate-fade-in-up flex items-center gap-3">
                         <div className="w-2 h-2 rounded-full bg-red-500"></div>
                        {error}
                    </div>
                )}
             </div>
        </div>
    );
};