import { Selector, ClientFunction } from 'testcafe';

const frontendURL = process.env.FRONTEND_URL;

const getUrl = ClientFunction(() => document.location.href);

fixture`The front page`
  .page`${frontendURL}`;

test('should render the correct text', async (t) => {
  // Check front page text
  const frontPage = await Selector('#app');
  const frontPageText = await frontPage.innerText;
  await t
    .expect(frontPageText).contains('Tervetuloa')
    .expect(frontPageText).contains('Vapaita paikkoja:')
    .expect(frontPageText)
    .contains('Kuinka Rekkaparkki toimii?');
});

test('should have a working LOG IN button', async (t) => {
  // Check if button exists
  const loginButton = await Selector('a').withText('KIRJAUDU SISÄÄN');
  // Check button functionality
  await t
    .expect(getUrl()).notContains('/login')
    .click(loginButton)
    .expect(getUrl())
    .contains('/login');
});

test('should have a working SIGN UP button', async (t) => {
  // Check if button exists
  const signupButton = await Selector('a').withText('REKISTERÖIDY');
  // Check button functionality
  await t
    .expect(getUrl()).notContains('/signup')
    .click(signupButton)
    .expect(getUrl())
    .contains('/signup');
});

test('should have a working header', async (t) => {
  // Check the home button and its functionality
  const homeButton = await Selector('#logoHomeLink');
  if (frontendURL) {
    await t
      .click(homeButton)
      .expect(getUrl()).eql(`${frontendURL}/`);
  }
  // Check the parking button and its functionality
  const parkingButton = await Selector('#headerParkingButton');
  await t
    .expect(getUrl()).notContains('/login')
    .click(parkingButton)
    .expect(getUrl())
    .contains('/login?redirect=Welcome');
  // Go back to home page
  await t.click(homeButton);
  // Check the language button and its functionality
  const langButton = await Selector('#language');
  await t.click(langButton);
  const langList = await Selector('#languageList').innerText;
  await t
    .expect(langList).contains('SUOMI')
    .expect(langList).contains('ENGLISH');
  const fi = await Selector('#fi');
  const en = await Selector('#en');
  await t.click(fi); // Change to Finnish locale
  const finnishText = await Selector('#app').innerText;
  await t
    .expect(finnishText).contains('Tervetuloa')
    .expect(finnishText).contains('Vapaita paikkoja:')
    .expect(finnishText)
    .contains('Kuinka Rekkaparkki toimii?');
  await t.click(langButton);
  await t.click(en); // Change to English locale
  const englishText = await Selector('#app').innerText;
  await t
    .expect(englishText).contains('Welcome to')
    .expect(englishText).contains('Free spaces:')
    .expect(englishText)
    .contains('How does the Truck Parking area work?');
  // Check the burger menu and its functionality
  const menu = await Selector('#headerMenuButton');
  // Instruction button
  await t.click(menu);
  const instructionButton = await Selector('#menuInstructions');
  await t.click(instructionButton);
  await t.expect(getUrl()).contains('/help');
  // Terms of Service button
  await t.click(menu);
  const tosButton = await Selector('#menuTos');
  await t.click(tosButton);
  await t.expect(getUrl()).contains('/tos');
  // Privacy button
  await t.click(menu);
  const privacyButton = await Selector('#menuPrivacy');
  await t.click(privacyButton);
  await t.expect(getUrl()).contains('/privacy');
  // Accessibility button
  await t.click(menu);
  const accessibilityButton = await Selector('#menuAccessibility');
  await t.click(accessibilityButton);
  await t.expect(getUrl()).contains('/accessibility');
  // Dark/Light Mode button
  await t.click(menu);
  const themeButton = await Selector('#menuTheme');
  await t
    .expect(Selector('#menuTheme').innerText).contains('Dark Mode')
    .click(themeButton)
    .expect(Selector('#menuTheme').innerText)
    .contains('Light Mode')
    .click(menu)
    .click(themeButton);
  // Login button
  await t.click(menu);
  const loginButton = await Selector('#menuLogIn');
  await t.click(loginButton);
  await t.expect(getUrl()).contains('/login');
  // Signup button
  await t.click(menu);
  const signUpButton = await Selector('#menuSignUp');
  await t.click(signUpButton);
  await t.expect(getUrl()).contains('/signup');
});
