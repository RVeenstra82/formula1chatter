import React, { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';

export type Language = 'en' | 'nl';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

// Translation dictionaries
const translations: Record<Language, Record<string, string>> = {
  en: {
    // Navigation
    'nav.home': 'Home',
    'nav.races': 'Races',
    'nav.leaderboard': 'Leaderboard',
    'nav.login': 'Login',
    'nav.logout': 'Logout',
    
    // Home page
    'home.title': 'Chatter Championship',
    'home.subtitle': 'Predict race results and compete with friends!',
    'home.loginToStart': 'Login with Facebook to Start Predicting',
    'home.howItWorks': 'How It Works',
    'home.noUpcomingRaces': 'No upcoming races found.',
    'home.step1': 'Login with your Facebook account to start participating',
    'home.step2': 'Make predictions for upcoming races before they start',
    'home.step3': 'Earn points based on the accuracy of your predictions',
    'home.step4': 'Compete with friends and track your standings all season',
    
    // Races
    'races.upcomingRaces': 'Upcoming Races',
    'races.nextRace': 'Next Race',
    'races.completed': 'Completed',
    'races.inProgress': 'In Progress',
    'races.upcoming': 'Upcoming',
    'races.date': 'Date',
    'races.time': 'Time',
    'races.round': 'Round',
    'races.makePredict': 'Make Prediction',
    'races.viewResults': 'View Results',
    'races.viewRace': 'View Race',
    'races.details': 'Details',
    'races.viewAllRaces': 'View All Races',
    'races.notFound': 'The race you\'re looking for doesn\'t exist.',
    'races.season': 'Season',
    'races.title': 'F1 Races',
    'races.calendar': 'F1 Race Calendar',
    'races.pastRaces': 'Past Races',
    'races.noRacesFound': 'No Races Found',
    'races.errorLoading': 'There was an error loading the race calendar.',
    'races.noUpcomingScheduled': 'No upcoming races scheduled.',
    'races.noPastRaces': 'No past races found.',
    'races.localTime': 'English time',
    'races.timeRemaining': 'Time remaining to predict',
    'races.saveBeforeStart': 'Don\'t forget to save your prediction before the race starts!',
    
    // Race detail
    'race.raceInfo': 'Race Information',
    'race.circuitInfo': 'Circuit Information',
    'race.raceSchedule': 'Race Schedule',
    'race.firstPlace': 'First Place',
    'race.secondPlace': 'Second Place',
    'race.thirdPlace': 'Third Place',
    'race.fastestLap': 'Fastest Lap',
    'race.driverOfDay': 'Driver of the Day',
    'race.results': 'Race Results',
    
    // Predictions
    'predict.title': 'Make Prediction',
    'predict.back': '← Back',
    'predict.yourPrediction': 'Your Prediction',
    'predict.makeFor': 'Make your prediction for the',
    'predict.raceComplete': 'This race has been completed. You can no longer make predictions.',
    'predict.raceStarted': 'This race has already started. You can no longer make predictions.',
    'predict.firstPlace': 'First Place (5 points)',
    'predict.secondPlace': 'Second Place (3 points)',
    'predict.thirdPlace': 'Third Place (1 point)',
    'predict.fastestLap': 'Fastest Lap (1 point)',
    'predict.driverOfDay': 'Driver of the Day (1 point)',
    'predict.submit': 'Submit Prediction',
    'predict.howScoring': 'How Scoring Works',
    'predict.loginRequired': 'Login Required',
    'predict.needLogin': 'You need to be logged in to make predictions.',
    'predict.loginFacebook': 'Login with Facebook',
    'predict.isComplete': 'is Complete',
    'predict.isInProgress': 'is In Progress',
    'predict.for1stPlace': 'for correctly predicting 1st place',
    'predict.for2ndPlace': 'for correctly predicting 2nd place',
    'predict.for3rdPlace': 'for correctly predicting 3rd place',
    'predict.forFastestLap': 'for correctly predicting fastest lap',
    'predict.forDriverOfDay': 'for correctly predicting driver of the day',
    'predict.canUpdateBeforeStart': 'You can update your prediction any time before the race starts',
    
    // Results
    'results.title': 'Prediction Results',
    'results.notAvailable': 'Results Not Available',
    'results.notCompleted': 'This race has not been completed yet.',
    'results.userScore': 'Your Score',
    'results.leaderboard': 'Leaderboard',
    'results.noPredictionsMade': 'No predictions were made for this race.',
    'results.allResults': 'All Results',
    'results.rank': 'Rank',
    'results.user': 'User',
    'results.score': 'Score',
    'results.pts': 'pts',
    
    // Leaderboard
    'leaderboard.title': 'Season Leaderboard',
    'leaderboard.season': 'Season',
    'leaderboard.yourPosition': 'Your position',
    'leaderboard.of': 'of',
    'leaderboard.noResults': 'No results available for this season yet.',
    'leaderboard.checkBack': 'Check back after races have been completed!',
    'leaderboard.position': 'Position',
    'leaderboard.user': 'User',
    'leaderboard.points': 'Points',
    'leaderboard.you': 'You',
    
    // Common
    'common.loading': 'Loading...',
    'common.save': 'Save',
    'common.error': 'Error',
    'common.success': 'Success',
    'common.back': '← Back',
    'common.notFound': 'Not Found',
    'common.language': 'Language',
    'common.points': 'points',
    'common.point': 'point',
    'common.raceIdRequired': 'Race ID is required',
    'common.important': 'Important',
  },
  nl: {
    // Navigation
    'nav.home': 'Home',
    'nav.races': 'Races',
    'nav.leaderboard': 'Ranglijst',
    'nav.login': 'Inloggen',
    'nav.logout': 'Uitloggen',
    
    // Home page
    'home.title': 'Chatter Kampioenschap',
    'home.subtitle': 'Voorspel raceresultaten en strijd met vrienden!',
    'home.loginToStart': 'Login met Facebook om te beginnen met voorspellen',
    'home.howItWorks': 'Hoe het werkt',
    'home.noUpcomingRaces': 'Geen aankomende races gevonden.',
    'home.step1': 'Log in met je Facebook-account om deel te nemen',
    'home.step2': 'Maak voorspellingen voor aankomende races voordat ze beginnen',
    'home.step3': 'Verdien punten op basis van de nauwkeurigheid van je voorspellingen',
    'home.step4': 'Strijd tegen vrienden en volg je positie gedurende het seizoen',
    
    // Races
    'races.upcomingRaces': 'Aankomende Races',
    'races.nextRace': 'Volgende Race',
    'races.completed': 'Voltooid',
    'races.inProgress': 'In Uitvoering',
    'races.upcoming': 'Aankomend',
    'races.date': 'Datum',
    'races.time': 'Tijd',
    'races.round': 'Ronde',
    'races.makePredict': 'Voorspelling Maken',
    'races.viewResults': 'Resultaten Bekijken',
    'races.viewRace': 'Race Bekijken',
    'races.details': 'Details',
    'races.viewAllRaces': 'Alle Races Bekijken',
    'races.notFound': 'De race die je zoekt bestaat niet.',
    'races.season': 'Seizoen',
    'races.title': 'F1 Races',
    'races.calendar': 'F1 Race Kalender',
    'races.pastRaces': 'Afgelopen Races',
    'races.noRacesFound': 'Geen Races Gevonden',
    'races.errorLoading': 'Er was een fout bij het laden van de racekalender.',
    'races.noUpcomingScheduled': 'Geen aankomende races gepland.',
    'races.noPastRaces': 'Geen afgelopen races gevonden.',
    'races.localTime': 'Nederlandse tijd',
    'races.timeRemaining': 'Tijd over om te voorspellen',
    'races.saveBeforeStart': 'Vergeet niet je voorspelling op te slaan voordat de race begint!',
    
    // Race detail
    'race.raceInfo': 'Race Informatie',
    'race.circuitInfo': 'Circuit Informatie',
    'race.raceSchedule': 'Race Schema',
    'race.firstPlace': 'Eerste Plaats',
    'race.secondPlace': 'Tweede Plaats',
    'race.thirdPlace': 'Derde Plaats',
    'race.fastestLap': 'Snelste Ronde',
    'race.driverOfDay': 'Coureur van de Dag',
    'race.results': 'Race Resultaten',
    
    // Predictions
    'predict.title': 'Voorspelling Maken',
    'predict.back': '← Terug',
    'predict.yourPrediction': 'Jouw Voorspelling',
    'predict.makeFor': 'Maak je voorspelling voor de',
    'predict.raceComplete': 'Deze race is voltooid. Je kunt geen voorspellingen meer doen.',
    'predict.raceStarted': 'Deze race is al begonnen. Je kunt geen voorspellingen meer doen.',
    'predict.firstPlace': 'Eerste Plaats (5 punten)',
    'predict.secondPlace': 'Tweede Plaats (3 punten)',
    'predict.thirdPlace': 'Derde Plaats (1 punt)',
    'predict.fastestLap': 'Snelste Ronde (1 punt)',
    'predict.driverOfDay': 'Coureur van de Dag (1 punt)',
    'predict.submit': 'Voorspelling Indienen',
    'predict.howScoring': 'Hoe Scoring Werkt',
    'predict.loginRequired': 'Inloggen Vereist',
    'predict.needLogin': 'Je moet ingelogd zijn om voorspellingen te doen.',
    'predict.loginFacebook': 'Inloggen met Facebook',
    'predict.isComplete': 'is Voltooid',
    'predict.isInProgress': 'is Bezig',
    'predict.for1stPlace': 'voor het correct voorspellen van de 1e plaats',
    'predict.for2ndPlace': 'voor het correct voorspellen van de 2e plaats',
    'predict.for3rdPlace': 'voor het correct voorspellen van de 3e plaats',
    'predict.forFastestLap': 'voor het correct voorspellen van de snelste ronde',
    'predict.forDriverOfDay': 'voor het correct voorspellen van de coureur van de dag',
    'predict.canUpdateBeforeStart': 'Je kunt je voorspelling op elk moment bijwerken voordat de race begint',
    
    // Results
    'results.title': 'Voorspellingsresultaten',
    'results.notAvailable': 'Resultaten Niet Beschikbaar',
    'results.notCompleted': 'Deze race is nog niet voltooid.',
    'results.userScore': 'Jouw Score',
    'results.leaderboard': 'Ranglijst',
    'results.noPredictionsMade': 'Er zijn geen voorspellingen gedaan voor deze race.',
    'results.allResults': 'Alle Resultaten',
    'results.rank': 'Rang',
    'results.user': 'Gebruiker',
    'results.score': 'Score',
    'results.pts': 'ptn',
    
    // Leaderboard
    'leaderboard.title': 'Seizoensranglijst',
    'leaderboard.season': 'Seizoen',
    'leaderboard.yourPosition': 'Jouw positie',
    'leaderboard.of': 'van',
    'leaderboard.noResults': 'Nog geen resultaten beschikbaar voor dit seizoen.',
    'leaderboard.checkBack': 'Kom terug nadat races zijn voltooid!',
    'leaderboard.position': 'Positie',
    'leaderboard.user': 'Gebruiker',
    'leaderboard.points': 'Punten',
    'leaderboard.you': 'Jij',
    
    // Common
    'common.loading': 'Laden...',
    'common.save': 'Opslaan',
    'common.error': 'Fout',
    'common.success': 'Succes',
    'common.back': '← Terug',
    'common.notFound': 'Niet Gevonden',
    'common.language': 'Taal',
    'common.points': 'punten',
    'common.point': 'punt',
    'common.raceIdRequired': 'Race ID is vereist',
    'common.important': 'Belangrijk',
  }
};

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>(() => {
    // Try to get language from localStorage
    const savedLanguage = localStorage.getItem('language') as Language | null;
    // Default to browser language if Dutch, otherwise English
    const browserLang = navigator.language.split('-')[0];
    return savedLanguage || (browserLang === 'nl' ? 'nl' : 'en');
  });

  // Save language preference to localStorage when it changes
  useEffect(() => {
    localStorage.setItem('language', language);
  }, [language]);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
  };

  // Translation function
  const t = (key: string): string => {
    return translations[language][key] || key;
  };

  const value: LanguageContextType = {
    language,
    setLanguage,
    t
  };

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
} 