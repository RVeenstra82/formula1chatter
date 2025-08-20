import { createContext, useContext, useState, useEffect } from 'react';
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
    'predict.canUpdateBeforeStart': 'You can update your prediction until 5 minutes before the race starts',
    'predict.noMorePredictions': 'It is no longer possible to submit or modify predictions!',
    'predict.alreadySelected': 'Already selected for',
    
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
    'leaderboard.viewMode': 'View Mode',
    'leaderboard.seasonTotal': 'Season Total',
    'leaderboard.raceResults': 'Race Results',
    'leaderboard.selectRace': 'Select Race',
    'leaderboard.noCompletedRaces': 'No completed races available.',
    'leaderboard.raceNotCompleted': 'This race has not been completed yet.',
    'leaderboard.loginRequired': 'Login Required',
    'leaderboard.loginToView': 'You need to be logged in to view the leaderboard.',
    'leaderboard.change': 'Change',
    
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
    'common.login': 'Login',
    
    // Statistics
    'stats.title': 'F1 Chatter Statistics',
    'stats.subtitle': 'Explore detailed analytics and insights about predictions and performance',
    'stats.overview': 'Overview',
    'stats.driverPerformance': 'Driver Performance',
    'stats.predictionAccuracy': 'Prediction Accuracy',
    'stats.circuitDifficulty': 'Circuit Difficulty',
    'stats.userComparison': 'User Comparison',
    'stats.seasonProgress': 'Season Progress',
    'stats.constructorPerformance': 'Constructor Performance',
    'stats.totalUsers': 'Total Users',
    'stats.completedRaces': 'Completed Races',
    'stats.totalPredictions': 'Total Predictions',
    'stats.averageScore': 'Average Score',
    'stats.mostPredictedDriver': 'Most Predicted Driver',
    'stats.driverCode': 'Driver Code',
    'stats.noDataAvailable': 'No Data Available',
    'stats.startPredicting': 'Start making predictions to see statistics here!',
    'stats.driverSuccessRates': 'Driver Success Rates',
    'stats.podiumFinishes': 'Podium Finishes',
    'stats.totalPredictionsPerDriver': 'Total Predictions per Driver',
    'stats.predictionAccuracyByType': 'Prediction Accuracy by Type',
    'stats.accuracyRadarChart': 'Accuracy Radar Chart',
    'stats.circuitDifficultyLowerAccuracy': 'Circuit Difficulty (Lower Accuracy = Higher Difficulty)',
    'stats.circuitAccuracy': 'Circuit Accuracy',
    'stats.predictionsPerCircuit': 'Predictions per Circuit',
    'stats.userTotalScores': 'User Total Scores',
    'stats.userAccuracy': 'User Accuracy',
    'stats.averageScorePerUser': 'Average Score per User',
    'stats.seasonProgressAccuracy': 'Season Progress - Accuracy Over Time',
    'stats.averageScoreProgression': 'Average Score Progression',
    'stats.constructorSuccessRates': 'Constructor Success Rates',
    'stats.correctPredictionsByConstructor': 'Correct Predictions by Constructor',
    'stats.totalPredictionsByConstructor': 'Total Predictions by Constructor',
    'stats.loadingOverview': 'Loading overview...',
    'stats.loadingDriverStatistics': 'Loading driver statistics...',
    'stats.loadingAccuracyData': 'Loading accuracy data...',
    'stats.loadingCircuitData': 'Loading circuit data...',
    'stats.loadingUserData': 'Loading user data...',
    'stats.loadingSeasonProgress': 'Loading season progress...',
    'stats.loadingConstructorData': 'Loading constructor data...',
    'stats.successRate': 'Success Rate',
    'stats.accuracy': 'Accuracy',
    'stats.difficulty': 'Difficulty',
    'stats.totalScore': 'Total Score',
    'stats.correctPredictions': 'Correct Predictions',
    'stats.firstPlace': 'First Place',
    'stats.secondPlace': 'Second Place',
    'stats.thirdPlace': 'Third Place',
    'stats.fastestLap': 'Fastest Lap',
    'stats.driverOfDay': 'Driver of the Day',
    'stats.shareThisStat': 'Share this statistic',
    'stats.copiedToClipboard': 'Link copied to clipboard!',
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
    'predict.canUpdateBeforeStart': 'Je kunt je voorspelling bijwerken tot 5 minuten voor de race begint',
    'predict.noMorePredictions': 'Het is niet meer mogelijk om voorspellingen in te dienen of te wijzigen!',
    'predict.alreadySelected': 'Al gekozen voor',
    
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
    'leaderboard.noResults': 'Nog geen verdere resultaten beschikbaar voor dit seizoen.',
    'leaderboard.noRaceResults': 'Geen verdere voorspellingen voor deze race gedaan.',
    'leaderboard.loginRequired': 'Inloggen Vereist',
    'leaderboard.loginToView': 'Je moet ingelogd zijn om de ranglijst te bekijken.',
    'leaderboard.checkBack': 'Kom terug nadat races zijn voltooid!',
    'leaderboard.position': 'Positie',
    'leaderboard.user': 'Gebruiker',
    'leaderboard.points': 'Punten',
    'leaderboard.you': 'Jij',
    'leaderboard.viewMode': 'Weergave Modus',
    'leaderboard.seasonTotal': 'Seizoen Totaal',
    'leaderboard.raceResults': 'Race Resultaten',
    'leaderboard.selectRace': 'Selecteer Race',
    'leaderboard.noCompletedRaces': 'Geen voltooide races beschikbaar.',
    'leaderboard.raceNotCompleted': 'Deze race is nog niet voltooid.',
    'leaderboard.change': 'Verandering',
    
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
    'common.login': 'Inloggen',
    
    // Statistics
    'stats.title': 'F1 Chatter Statistieken',
    'stats.subtitle': 'Bekijk gedetailleerde analyses en inzichten over voorspellingen en prestaties',
    'stats.overview': 'Overzicht',
    'stats.driverPerformance': 'Coureur Prestaties',
    'stats.predictionAccuracy': 'Voorspellingsnauwkeurigheid',
    'stats.circuitDifficulty': 'Circuit Moeilijkheid',
    'stats.userComparison': 'Gebruiker Vergelijking',
    'stats.seasonProgress': 'Seizoen Voortgang',
    'stats.constructorPerformance': 'Constructeur Prestaties',
    'stats.totalUsers': 'Totaal Gebruikers',
    'stats.completedRaces': 'Voltooide Races',
    'stats.totalPredictions': 'Totaal Voorspellingen',
    'stats.averageScore': 'Gemiddelde Score',
    'stats.mostPredictedDriver': 'Meest Voorspelde Coureur',
    'stats.driverCode': 'Coureur Code',
    'stats.noDataAvailable': 'Geen Data Beschikbaar',
    'stats.startPredicting': 'Begin met voorspellingen maken om statistieken hier te zien!',
    'stats.driverSuccessRates': 'Coureur Succespercentages',
    'stats.podiumFinishes': 'Podium Finishes',
    'stats.totalPredictionsPerDriver': 'Totaal Voorspellingen per Coureur',
    'stats.predictionAccuracyByType': 'Voorspellingsnauwkeurigheid per Type',
    'stats.accuracyRadarChart': 'Nauwkeurigheid Radar Grafiek',
    'stats.circuitDifficultyLowerAccuracy': 'Circuit Moeilijkheid (Lagere Nauwkeurigheid = Hogere Moeilijkheid)',
    'stats.circuitAccuracy': 'Circuit Nauwkeurigheid',
    'stats.predictionsPerCircuit': 'Voorspellingen per Circuit',
    'stats.userTotalScores': 'Gebruiker Totale Scores',
    'stats.userAccuracy': 'Gebruiker Nauwkeurigheid',
    'stats.averageScorePerUser': 'Gemiddelde Score per Gebruiker',
    'stats.seasonProgressAccuracy': 'Seizoen Voortgang - Nauwkeurigheid in de Tijd',
    'stats.averageScoreProgression': 'Gemiddelde Score Voortgang',
    'stats.constructorSuccessRates': 'Constructeur Succespercentages',
    'stats.correctPredictionsByConstructor': 'Correcte Voorspellingen per Constructeur',
    'stats.totalPredictionsByConstructor': 'Totaal Voorspellingen per Constructeur',
    'stats.loadingOverview': 'Overzicht laden...',
    'stats.loadingDriverStatistics': 'Coureur statistieken laden...',
    'stats.loadingAccuracyData': 'Nauwkeurigheid data laden...',
    'stats.loadingCircuitData': 'Circuit data laden...',
    'stats.loadingUserData': 'Gebruiker data laden...',
    'stats.loadingSeasonProgress': 'Seizoen voortgang laden...',
    'stats.loadingConstructorData': 'Constructeur data laden...',
    'stats.successRate': 'Succespercentage',
    'stats.accuracy': 'Nauwkeurigheid',
    'stats.difficulty': 'Moeilijkheid',
    'stats.totalScore': 'Totale Score',
    'stats.correctPredictions': 'Correcte Voorspellingen',
    'stats.firstPlace': 'Eerste Plaats',
    'stats.secondPlace': 'Tweede Plaats',
    'stats.thirdPlace': 'Derde Plaats',
    'stats.fastestLap': 'Snelste Ronde',
    'stats.driverOfDay': 'Coureur van de Dag',
    'stats.shareThisStat': 'Deel deze statistiek',
    'stats.copiedToClipboard': 'Link gekopieerd naar klembord!',
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