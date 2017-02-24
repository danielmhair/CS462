import { Angular2MaterialBootstrapPage } from './app.po';

describe('angular2-material-bootstrap App', function() {
  let page: Angular2MaterialBootstrapPage;

  beforeEach(() => {
    page = new Angular2MaterialBootstrapPage();
  });

  it('should display message saying app works', () => {
    page.navigateTo();
    expect(page.getParagraphText()).toEqual('app works!');
  });
});
