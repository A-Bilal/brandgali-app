# BrandGali app

The iPhone and Android app for [brandgali.com](https://www.brandgali.com), built with
[Expo](https://expo.dev) (React Native).

The app is separate from the website, but it shows the website's live data. It reads two
public files from brandgali.com:

| File on the website | What the app uses it for |
|---|---|
| `brands-data.js` | The brand list: names, categories, store links, top picks, store cities |
| `sales-status.json` | Today's sales, sale products, new arrivals and logos (updated daily by the website's sale checker) |

So when the website's brand list or daily sale check changes, the app updates too. You don't
need to publish a new app version for that.

---

## See the app on your phone (Windows)

You only need to do steps 1–3 once.

### 1. Install the tools on your computer
- **Node.js** (runs the app's development tools): go to <https://nodejs.org>, download the
  **LTS** version and install it, clicking Next through everything.
- **Git** (downloads this code from GitHub): go to <https://git-scm.com/download/win> and
  install it, clicking Next through everything.

### 2. Install Expo Go on your phone
Install **Expo Go** from the Google Play Store (Android) or the App Store (iPhone).

### 3. Download the code
1. Open the **Start menu**, type **PowerShell** and open it.
2. Copy and paste these commands, pressing Enter after each one:

```powershell
cd $HOME\Documents
git clone https://github.com/A-Bilal/brandgali-app.git
cd brandgali-app
npm install
```

`npm install` downloads the app's building blocks into a `node_modules` folder. It takes a
few minutes the first time.

### 4. Start the app (every time you want to see it)
In PowerShell, inside the `brandgali-app` folder:

```powershell
cd $HOME\Documents\brandgali-app
git pull
npx expo start
```

- `git pull` downloads the latest changes from GitHub.
- `npx expo start` starts a small development server and shows a **QR code**.

Then:
- **Android:** open **Expo Go** and tap **Scan QR code**.
- **iPhone:** open the normal **Camera** app, point it at the QR code and tap the banner.

The app opens on your phone. Your phone and computer must be on the **same Wi-Fi**.
If it can't connect, stop the server with `Ctrl + C` and run `npx expo start --tunnel`
instead.

**Tips:**
- **Shake your phone** to open the developer menu (for example, to reload the app).
- If Windows asks whether Node.js may access the network, click **Allow**.
- If `git pull` complains about local changes, run `git checkout .` and try again.

---

## Build an installable app (EAS Build)

`eas.json` holds the cloud build settings:

| Profile | What it makes | Use it for |
|---|---|---|
| `preview` | An Android **.apk** file you can install directly | Testing on your phone and sharing with testers, no computer needed |
| `production` | Store-ready builds (.aab for Google Play, .ipa for the App Store) | Publishing |

You'll need a free account at [expo.dev](https://expo.dev). Then, in PowerShell inside the
`brandgali-app` folder:

```powershell
npx eas-cli@latest login
npx eas-cli@latest build --platform android --profile preview
```

The first build asks a few questions (answer **Yes** to creating the project and generating a
keystore). It takes about 10–20 minutes, then gives you a link to download and install the app.

---

## How the code is organised

```
src/
  app/                    Every file here is a screen (Expo Router)
    _layout.tsx           Loads fonts, app-wide data and navigation
    (tabs)/_layout.tsx    The bottom tab bar
    (tabs)/index.tsx      Home
    (tabs)/sales.tsx      Live Sales
    (tabs)/brands.tsx     Brands directory
    (tabs)/following.tsx  Brands you follow
    (tabs)/account.tsx    Account and links
    brand/[id].tsx        One brand's page, e.g. /brand/khaadi
  components/             Pieces shared by screens (product card, brand logo, follow button…)
  constants/theme.ts      BrandGali colours, fonts and spacing (copied from the website)
  data/
    brandgali.ts          Downloads and reads the website's brand and sale data
    parse-js-literal.ts   Reads the brand list out of brands-data.js safely
    data-context.tsx      Keeps the data in memory and saved offline
    follows-context.tsx   Remembers which brands you follow (saved on the phone)
  utils/                  Small helpers (opening links, formatting)
assets/images/            App icon, splash screen and logo
app.json                  App name, ID (com.brandgali.app), icon and splash settings
```

## Checks before saving changes

```powershell
npx tsc --noEmit   # checks the code for type mistakes
npx expo lint      # checks the code for common problems
```

## What's next
- [x] Round 1: theme, tab bar, Home, Live Sales with real data
- [x] Round 2: Brands, brand pages, Following
- [ ] Round 3: sign in / sign up / delete account (same Firebase accounts as the website)
- [ ] Round 4: push notifications when a followed brand goes on sale (OneSignal)
- [ ] Publish: build with EAS, then submit to Google Play and the App Store
