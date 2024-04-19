import { IResultData } from '@/types';
import { amber, cyan, pink } from '@mui/material/colors';


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
      description: `Type 2 diabetes is a chronic condition that affects the way your body metabolizes sugar (glucose), which is an important source of fuel for your body. With type 2 diabetes, your body either resists the effects of insulin — a hormone that regulates the movement of sugar into your cells — or doesn't produce enough insulin to maintain normal glucose levels.`,
      color: amber,
      getFooterText(result: string): string {
          return `You have a ${result} likelihood of genetic thrombophilia.`;
      }
  },
  'muscle performance': {
      title: 'Are you more likely a power or endurance athlete?',
      description: `Genetic analysis can reveal whether you're more likely to have fast-twitch muscle fibers, often found in power athletes like sprinters and weightlifters, or slow-twitch fibers, common in endurance athletes like long-distance runners or cyclists.`,
      color: cyan,
      getFooterText(result: string): string {
          return `Your composition is more common for ${result === 'low' ? 'endurance athletes 🏃🏽‍♀️' : 'strength athletes ‍🏋🏽‍♀️️'} ️`;
      }
  }
};