describe('Mytt Core Funnel E2E Test Suite', () => {
  beforeEach(() => {
    // Standard viewport
    cy.viewport(1280, 720);
  });

  it('should load the homepage correctly and verify layout elements', () => {
    cy.visit('/');
    cy.get('h1').should('exist');
    cy.contains('Cihazını Sat').should('be.visible');
    cy.contains('AI Telefon Bulucu').should('be.visible');
    cy.contains('Trade-In Hesaplayıcı').should('be.visible');
  });

  it('should navigate to the Sell Request page and check auth gate', () => {
    cy.visit('/sell');
    // Verify that the custom login gate is displayed to unauthenticated users
    cy.contains('Giriş Yap / Kayıt Ol').should('be.visible');
  });

  it('should navigate to AI Phone Finder and check dynamic inputs', () => {
    cy.visit('/ai-finder');
    cy.contains('AI Telefon Bulucu').should('be.visible');
  });

  it('should navigate to Trade-In Calculator page', () => {
    cy.visit('/trade-in');
    cy.contains('Trade-In').should('be.visible');
  });
});
