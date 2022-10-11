import { Selector, ClientFunction } from 'testcafe';

const frontendURL = process.env.FRONTEND_URL;

const getUrl = ClientFunction(() => document.location.href);

fixture`Log In`
  .page`${frontendURL}/login`;
test('should have a working SIGN UP button', async (t) => {
// Check if button exists
  const loginButton = await Selector('a').withAttribute('id', 'loginSignUpLink');
  // Check button functionality
  await t
    .expect(getUrl()).notContains('/signup')
    .click(loginButton)
    .expect(getUrl())
    .contains('/signup');
});

test('should have a working FORGOT PASSWORD button', async (t) => {
  // Check if button exists
  const loginButton = await Selector('a').withAttribute('id', 'loginForgotPasswordLink');
  // Check button functionality
  await t
    .expect(getUrl()).notContains('/forgotPassword')
    .click(loginButton)
    .expect(getUrl())
    .contains('/forgotPassword');
});
