import 'react-calendar-timeline';

declare module 'react-calendar-timeline' {
  // Définir l'interface pour les formats d'étiquettes
  interface TimeFormat {
    yearShort: string;
    yearLong: string;
    monthShort: string;
    monthMedium: string;
    monthLong: string;
    dayShort: string;
    dayMedium?: string;
    dayLong: string;
    hourShort: string;
    hourMedium: string;
    hourLong: string;
    minuteShort: string;
    minuteLong: string;
  }
  
  // Étendre l'interface des props du composant ReactCalendarTimeline
  export interface ReactCalendarTimelineProps<Item, Group> {
    headerLabelFormats?: TimeFormat;
    subHeaderLabelFormats?: TimeFormat;
  }
}