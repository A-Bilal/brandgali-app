import { openBrowserAsync, WebBrowserPresentationStyle } from 'expo-web-browser';
import { Linking } from 'react-native';

import { Colors } from '@/constants/theme';

/** Opens a web page in a browser sheet inside the app, so people stay in BrandGali. */
export async function openInApp(url: string) {
  if (!url || url === '#') return;
  if (!/^https?:\/\//i.test(url)) {
    // mailto:, tel: and similar go to the phone's own apps
    Linking.openURL(url).catch(() => {});
    return;
  }
  try {
    await openBrowserAsync(url, {
      toolbarColor: Colors.white,
      controlsColor: Colors.navy,
      presentationStyle: WebBrowserPresentationStyle.PAGE_SHEET,
    });
  } catch {
    Linking.openURL(url).catch(() => {});
  }
}
