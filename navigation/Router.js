import { createRouter } from '@expo/ex-navigation';

import ScanScreen from '../screens/ScanScreen';
import HistoryScreen from '../screens/HistoryScreen';
import RootNavigation from './RootNavigation';

export default createRouter(() => ({
  scan: () => ScanScreen,
  history: () => HistoryScreen,
  rootNavigation: () => RootNavigation,
}));
