import { CreditToolPage } from './app.po';

describe('credit-tool App', function() {
  let page: CreditToolPage;

  beforeEach(() => {
    page = new CreditToolPage();
  });

  it('should display message saying app works', () => {
    page.navigateTo();
    expect(page.getParagraphText()).toEqual('app works!');
  });
});
