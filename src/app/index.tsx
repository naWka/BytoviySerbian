// Корневой маршрут `/`: стартовая вкладка — «Учить» (BS-19 убрал вкладку «Ситуации»/index).
import { Redirect } from 'expo-router';

export default function Index() {
  return <Redirect href="/learn" />;
}
