import { Selector, ClientFunction } from 'testcafe';

const frontendURL = process.env.FRONTEND_URL;

const getUrl = ClientFunction(() => document.location.href);

fixture`Sign Up`
  .page`${frontendURL}/signup`;
test('signup should succeed', async (t) => {
  // Check signup form
  const formText = await Selector('form').innerText;
  await t
    .expect(formText)
    .contains('Etunimi')
    .expect(formText)
    .contains('Sukunimi')
    .expect(formText)
    .contains('Puhelinnumero')
    .expect(formText)
    .contains('Sähköpostiosoite')
    .expect(formText)
    .contains('Yritys')
    .expect(formText)
    .contains('Salasana')
    .expect(formText)
    .contains('Salasana uudelleen');
  // Enter signup details
  const firstNameField = await Selector('input').withAttribute('id', 'signUpFirstName');
  const lastNameField = await Selector('input').withAttribute('id', 'signUpLastName');
  const phoneField = await Selector('input').withAttribute('id', 'signUpPhone');
  const emailField = await Selector('input').withAttribute('id', 'signUpEmail');
  const companyField = await Selector('input').withAttribute('id', 'signUpCompany');
  const passwordField = await Selector('input').withAttribute('id', 'signUpPassword');
  const repeatPasswordField = await Selector('input').withAttribute('id', 'signUpPasswordRepeat');
  await t
    .typeText(firstNameField, 'Peter')
    .typeText(lastNameField, 'E2E')
    .typeText(phoneField, '+101010101010')
    .typeText(emailField, 'peter@e2e.com')
    .typeText(companyField, 'Parker')
    .typeText(passwordField, 'password123')
    .typeText(repeatPasswordField, 'password123');
  // Click agreement checkbox
  const checkBox = await Selector('input').withAttribute('id', 'signUpCheckbox');
  await t.click(checkBox);
  // Click sign up button
  const signUp = await Selector('#signUpButton');
  await t.click(signUp);
});

test('should have a working LOG IN button', async (t) => {
  // Check if button exists
  const loginButton = await Selector('a').withAttribute('id', 'signUpLogInLink');
  // Check button functionality
  await t
    .expect(getUrl()).notContains('/login')
    .click(loginButton)
    .expect(getUrl())
    .contains('/login');
});

test('should have a working ToS button', async (t) => {
  // Check if button exists
  const loginButton = await Selector('a').withAttribute('id', 'signUpToSLink');
  // Check button functionality
  await t
    .expect(getUrl()).notContains('/tos')
    .click(loginButton)
    .expect(getUrl())
    .contains('/tos');
});
