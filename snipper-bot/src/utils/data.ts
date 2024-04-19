import { IResultData } from '@/types';
import { teal, blueGrey, grey, pink } from '@mui/material/colors';


export const resultData: Record<string, IResultData> = {
  'thrombosis': {
      title: 'Genetic risk for thrombophilia',
      description: 'Thrombophilia is a predisposition to developing harmful blood clots. The two most common genetic variants linked to an increased risk for thrombophilia are found in two genes called F5 and F2.',
      color: pink,
      getFooterText(result: string): string {
          return `You have a ${result} likelihood of genetic thrombophilia.`;
      }
  },
  'type2diabetes': {
      title: 'Genetic risk for Type2Diabetes',
      description: '"Type2Diabetes" is a predisposition to developing harmful blood clots. The two most common genetic variants linked to an increased risk for thrombophilia are found in two genes called F5 and F2.',
      color: blueGrey,
      getFooterText(result: string): string {
          return `You have a ${result} likelihood of genetic thrombophilia.`;
      }
  },
  'muscle performance': {
      title: 'Are you more likely a power or endurance athlete?',
      description: `Genetic analysis can reveal whether you're more likely to have fast-twitch muscle fibers, often found in power athletes like sprinters and weightlifters, or slow-twitch fibers, common in endurance athletes like long-distance runners or cyclists.`,
      color: blueGrey,
      getFooterText(result: string): string {
          return `Your composition is more common for ${result === 'low' ? 'endurance athletes 🏃🏽‍♀️' : 'strength athletes ‍🏋🏽‍♀️️'} ️`;
      }
  },
};